import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.work_order import WorkOrder
from app.models.incident import Incident
from app.models.alert import Alert

async def auto_create_work_order_if_needed(db: AsyncSession, incident: Incident):
    """
    Automatic Work Order Generation Workflow:
    Critical -> SLA 30 minutes
    High -> SLA 2 hours
    Medium -> SLA 8 hours
    Low -> SLA 24 hours

    Automatically triggers work orders for CRITICAL & HIGH incidents (or if incident already has work order, updates priority).
    Creates system Alert notification.
    """
    if incident.work_order_id:
        # Update existing work order if incident severity escalated to critical
        query = select(WorkOrder).where(WorkOrder.work_order_code == incident.work_order_id)
        res = await db.execute(query)
        wo = res.scalar_one_or_none()
        if wo and wo.priority != incident.severity:
            wo.priority = incident.severity
            db.add(wo)
            await db.commit()
        return

    # Trigger automatic work order for High or Critical incidents
    if incident.severity in ["critical", "high"]:
        # SLA calculation
        sla_hours = {
            "critical": 0.5, # 30 mins
            "high": 2.0,     # 2 hours
            "medium": 8.0,   # 8 hours
            "low": 24.0      # 24 hours
        }
        hours = sla_hours.get(incident.severity, 4.0)
        deadline = datetime.utcnow() + timedelta(hours=hours)

        wo_code = f"WO-{uuid.uuid4().hex[:6].upper()}"

        new_wo = WorkOrder(
            work_order_code=wo_code,
            incident_id=incident.incident_code,
            issue_type=incident.issue_type,
            priority=incident.severity,
            status="NEW",
            latitude=incident.latitude,
            longitude=incident.longitude,
            location_name=incident.location_name,
            description=f"Auto-generated dispatch for {incident.severity.upper()} severity {incident.issue_type.replace('_', ' ')} verified by transport fleet.",
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
            message=f"Work order {wo_code} created for {incident.issue_type} at {incident.location_name}. Confidence: {int(incident.confidence*100)}%.",
            severity=incident.severity,
            incident_id=incident.incident_code,
            created_at=datetime.utcnow()
        )
        db.add(alert)

        await db.commit()
        await db.refresh(incident)
