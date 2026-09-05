from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
from datetime import datetime
import uuid

from app.database.session import get_db
from app.models.work_order import WorkOrder
from app.models.incident import Incident
from app.schemas.work_order import WorkOrderCreate, WorkOrderUpdate, WorkOrderResponse
from app.websocket.connection_manager import ws_manager

router = APIRouter(prefix="/api/work-orders", tags=["Work Orders"])

@router.get("", response_model=List[WorkOrderResponse])
async def get_work_orders(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_worker: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    db: AsyncSession = Depends(get_db)
):
    query = select(WorkOrder).order_by(desc(WorkOrder.created_at))
    if status:
        query = query.where(WorkOrder.status == status)
    if priority:
        query = query.where(WorkOrder.priority == priority)
    if assigned_worker:
        query = query.where(WorkOrder.assigned_worker == assigned_worker)

    query = query.limit(limit)
    res = await db.execute(query)
    return res.scalars().all()

@router.post("", response_model=WorkOrderResponse)
async def create_work_order(payload: WorkOrderCreate, db: AsyncSession = Depends(get_db)):
    inc_query = select(Incident).where(Incident.incident_code == payload.incident_id)
    res = await db.execute(inc_query)
    inc = res.scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    wo_code = f"WO-{uuid.uuid4().hex[:6].upper()}"
    wo = WorkOrder(
        work_order_code=wo_code,
        incident_id=inc.incident_code,
        issue_type=inc.issue_type,
        priority=inc.severity,
        status="NEW",
        latitude=inc.latitude,
        longitude=inc.longitude,
        location_name=inc.location_name,
        description=payload.description or f"Manual dispatch for {inc.issue_type} incident.",
        assigned_officer="officer@urbaneye.ai",
        assigned_worker=payload.assigned_worker or "worker@urbaneye.ai",
        worker_name=payload.worker_name or "Rajesh Kumar (Field Rapid Response Team)",
        created_at=datetime.utcnow(),
        sla_deadline=datetime.utcnow() + (
            datetime.timedelta(hours=0.5) if inc.severity == "critical" else datetime.timedelta(hours=2)
        )
    )
    db.add(wo)

    inc.status = "WORK_ORDER_CREATED"
    inc.work_order_id = wo_code
    db.add(inc)

    await db.commit()
    await db.refresh(wo)

    await ws_manager.broadcast({
        "event_type": "WORK_ORDER_CREATED",
        "work_order_code": wo.work_order_code,
        "incident_id": wo.incident_id,
        "priority": wo.priority,
        "status": wo.status
    })

    return wo

@router.patch("/{work_order_code}", response_model=WorkOrderResponse)
async def update_work_order(work_order_code: str, payload: WorkOrderUpdate, db: AsyncSession = Depends(get_db)):
    query = select(WorkOrder).where(WorkOrder.work_order_code == work_order_code)
    res = await db.execute(query)
    wo = res.scalar_one_or_none()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")

    if payload.status:
        wo.status = payload.status
        if payload.status == "RESOLVED":
            wo.resolved_at = datetime.utcnow()
            # update incident status as well
            inc_res = await db.execute(select(Incident).where(Incident.incident_code == wo.incident_id))
            inc = inc_res.scalar_one_or_none()
            if inc:
                inc.status = "RESOLVED"
                db.add(inc)

    if payload.assigned_worker:
        wo.assigned_worker = payload.assigned_worker
    if payload.worker_name:
        wo.worker_name = payload.worker_name
    if payload.resolution_notes:
        wo.resolution_notes = payload.resolution_notes
    if payload.evidence_image_url:
        wo.evidence_image_url = payload.evidence_image_url

    db.add(wo)
    await db.commit()
    await db.refresh(wo)

    await ws_manager.broadcast({
        "event_type": "WORK_ORDER_UPDATED",
        "work_order_code": wo.work_order_code,
        "status": wo.status,
        "assigned_worker": wo.assigned_worker
    })

    return wo
