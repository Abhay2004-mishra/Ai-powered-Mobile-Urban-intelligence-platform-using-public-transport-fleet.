import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.work_order import WorkOrder
from app.models.incident import Incident
from app.models.alert import Alert
from app.websocket.connection_manager import ws_manager

async def auto_create_work_order_if_needed(db: AsyncSession, incident: Incident, force_create: bool = False, driver_notes: str = None):
    """
    Automatic Work Order Generation Workflow:
    Critical -> SLA 30 minutes
    High -> SLA 2 hours
    Medium -> SLA 8 hours
    Low -> SLA 24 hours

    Automatically triggers work orders for verified incidents (or if incident already has work order, updates priority).
    Creates system Alert notification and broadcasts via WebSockets.
    """
    if incident.work_order_id and not force_create:
        # Update existing work order if incident severity escalated
        query = select(WorkOrder).where(WorkOrder.work_order_code == incident.work_order_id)
        res = await db.execute(query)
        wo = res.scalar_one_or_none()
        if wo:
            if wo.priority != incident.severity:
                wo.priority = incident.severity
            if driver_notes and driver_notes not in (wo.description or ""):
                wo.description = f"🚨 DRIVER UPDATE: \"{driver_notes}\" | {wo.description}"
            db.add(wo)
            await db.commit()
            await db.refresh(wo)
            await ws_manager.broadcast({
                "event_type": "WORK_ORDER_UPDATED",
                "work_order_code": wo.work_order_code,
                "incident_id": wo.incident_id,
                "priority": wo.priority,
                "status": wo.status,
                "description": wo.description,
                "driver_notes": driver_notes
            })
            return wo
        return None

    # If force_create is requested and a work order already exists for this incident, update it directly
    if incident.work_order_id and force_create:
        query = select(WorkOrder).where(WorkOrder.work_order_code == incident.work_order_id)
        res = await db.execute(query)
        wo = res.scalar_one_or_none()
        if wo:
            wo.priority = incident.severity
            if driver_notes:
                wo.description = f"🚨 IN-CAB DRIVER REPORT: \"{driver_notes}\" | {wo.description or ''}"
            db.add(wo)
            await db.commit()
            await db.refresh(wo)
            await ws_manager.broadcast({
                "event_type": "WORK_ORDER_UPDATED",
                "work_order_code": wo.work_order_code,
                "incident_id": wo.incident_id,
                "priority": wo.priority,
                "status": wo.status,
                "description": wo.description,
                "driver_notes": driver_notes
            })
            return wo

    # SLA calculation
    sla_hours = {
        "critical": 0.5, # 30 mins
        "high": 2.0,     # 2 hours
        "medium": 8.0,   # 8 hours
        "low": 24.0      # 24 hours
    }
    hours = sla_hours.get(incident.severity, 2.0)
    deadline = datetime.utcnow() + timedelta(hours=hours)

    wo_code = f"WO-{uuid.uuid4().hex[:6].upper()}"

    bus_info = incident.buses_list_json or "Transit Fleet"
    if driver_notes:
        desc = f"🚨 IN-CAB DRIVER REPORT [{bus_info}]: \"{driver_notes}\" | Dispatched for {incident.severity.upper()} severity {incident.issue_type.replace('_', ' ')} on active transit route."
    else:
        desc = f"Auto-generated dispatch for {incident.severity.upper()} severity {incident.issue_type.replace('_', ' ')} verified by transport fleet."

    new_wo = WorkOrder(
        work_order_code=wo_code,
        incident_id=incident.incident_code,
        issue_type=incident.issue_type,
        priority=incident.severity,
        status="NEW",
        latitude=incident.latitude,
        longitude=incident.longitude,
        location_name=incident.location_name,
        description=desc,
        assigned_officer="officer@urbaneye.ai",
        assigned_worker="worker@urbaneye.ai",
        worker_name="Rajesh Kumar (Field Rapid Response Team)",
        created_at=datetime.utcnow(),
        sla_deadline=deadline
    )
    db.add(new_wo)

    # Update incident status
    incident.status = "WORK_ORDER_CREATED"
    incident.work_order_id = wo_code
    db.add(incident)

    # Create Alert
    alert_code = f"ALT-{uuid.uuid4().hex[:6].upper()}"
    alert = Alert(
        alert_code=alert_code,
        title=f"🚨 AUTOMATIC WORK ORDER: {incident.severity.upper()} {incident.issue_type.upper()}",
        message=f"Work order {wo_code} dispatched for {incident.issue_type} at {incident.location_name}. {('Driver note: ' + driver_notes) if driver_notes else ''}",
        severity=incident.severity,
        incident_id=incident.incident_code,
        created_at=datetime.utcnow()
    )
    db.add(alert)

    await db.commit()
    await db.refresh(new_wo)
    await db.refresh(incident)

    # Broadcast real-time WebSocket update so all dashboards and work order lists update instantly
    await ws_manager.broadcast({
        "event_type": "WORK_ORDER_CREATED",
        "work_order_code": new_wo.work_order_code,
        "incident_id": new_wo.incident_id,
        "issue_type": new_wo.issue_type,
        "priority": new_wo.priority,
        "status": new_wo.status,
        "location_name": new_wo.location_name,
        "description": new_wo.description,
        "assigned_worker": new_wo.assigned_worker,
        "worker_name": new_wo.worker_name,
        "created_at": new_wo.created_at.isoformat(),
        "sla_deadline": new_wo.sla_deadline.isoformat(),
        "driver_notes": driver_notes
    })

    return new_wo
