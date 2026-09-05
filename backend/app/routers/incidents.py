from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List

from app.database.session import get_db
from app.models.incident import Incident
from app.models.detection import Detection
from app.schemas.incident import IncidentResponse, IncidentStatusUpdate
from app.websocket.connection_manager import ws_manager

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentResponse])
async def get_incidents(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    issue_type: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    db: AsyncSession = Depends(get_db)
):
    query = select(Incident).order_by(desc(Incident.created_at))
    if severity:
        query = query.where(Incident.severity == severity)
    if status:
        query = query.where(Incident.status == status)
    if issue_type:
        query = query.where(Incident.issue_type == issue_type)

    query = query.limit(limit)
    res = await db.execute(query)
    return res.scalars().all()

@router.get("/{incident_code}")
async def get_incident_detail(incident_code: str, db: AsyncSession = Depends(get_db)):
    query = select(Incident).where(Incident.incident_code == incident_code)
    res = await db.execute(query)
    incident = res.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    det_query = select(Detection).where(Detection.incident_id == incident_code)
    det_res = await db.execute(det_query)
    detections = det_res.scalars().all()

    return {
        "incident": IncidentResponse.model_validate(incident),
        "detections": [
            {
                "detection_code": d.detection_code,
                "bus_id": d.bus_id,
                "confidence": d.confidence,
                "timestamp": d.timestamp.isoformat(),
                "latitude": d.latitude,
                "longitude": d.longitude
            }
            for d in detections
        ]
    }

@router.patch("/{incident_code}", response_model=IncidentResponse)
async def update_incident(incident_code: str, payload: IncidentStatusUpdate, db: AsyncSession = Depends(get_db)):
    query = select(Incident).where(Incident.incident_code == incident_code)
    res = await db.execute(query)
    incident = res.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = payload.status
    if payload.false_positive_reason:
        incident.false_positive_reason = payload.false_positive_reason

    db.add(incident)
    await db.commit()
    await db.refresh(incident)

    await ws_manager.broadcast({
        "event_type": "INCIDENT_UPDATED",
        "incident_code": incident.incident_code,
        "status": incident.status,
        "false_positive_reason": incident.false_positive_reason
    })

    return incident
