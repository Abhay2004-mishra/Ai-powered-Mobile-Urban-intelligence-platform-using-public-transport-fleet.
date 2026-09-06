from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
from pydantic import BaseModel
import uuid
import json
from datetime import datetime

from app.database.session import get_db
from app.models.incident import Incident
from app.models.detection import Detection
from app.models.bus import Bus
from app.schemas.incident import IncidentResponse, IncidentStatusUpdate
from app.services.work_order_service import auto_create_work_order_if_needed
from app.websocket.connection_manager import ws_manager

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

class DriverHazardReportRequest(BaseModel):
    bus_code: Optional[str] = "BUS-104"
    issue_type: str = "pothole" # pothole, accident, road_damage, obstacle, road_crack
    driver_notes: Optional[str] = None
    severity: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

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

@router.post("/driver-report")
async def report_driver_hazard(payload: DriverHazardReportRequest, db: AsyncSession = Depends(get_db)):
    """
    Driver Instant Hazard Report from Bus Cockpit:
    1. Looks up bus coordinates or active route.
    2. Tags an AI Edge Detection with source 'driver_cockpit'.
    3. Creates verified Incident marked with driver report attribution.
    4. Auto-dispatches Municipal Work Order immediately with calculated SLA.
    5. Broadcasts real-time WebSocket alert across all connected command centers.
    """
    bus_code = payload.bus_code or "BUS-104"
    bus_res = await db.execute(select(Bus).where(Bus.bus_code == bus_code))
    bus = bus_res.scalar_one_or_none()

    lat = payload.latitude or (bus.latitude if bus else 31.6340)
    lng = payload.longitude or (bus.longitude if bus else 74.8723)
    route_id = (bus.route_id if bus and bus.route_id else "R-02")
    location_name = f"Transit Route {route_id} (Mall Road Corridor)"

    # Determine severity
    sev = payload.severity
    if not sev:
        if payload.issue_type in ["accident", "road_damage"]:
            sev = "critical"
        elif payload.issue_type in ["pothole", "obstacle"]:
            sev = "high"
        else:
            sev = "medium"

    # 1. Create Detection record
    det_code = f"DET-{uuid.uuid4().hex[:6].upper()}"
    det = Detection(
        detection_code=det_code,
        bus_id=bus_code,
        route_id=route_id,
        detection_class=payload.issue_type,
        confidence=0.98,
        severity=sev,
        latitude=lat,
        longitude=lng,
        source="driver_cockpit",
        timestamp=datetime.utcnow()
    )
    db.add(det)
    await db.flush()

    # 2. Create Incident record
    inc_code = f"INC-{uuid.uuid4().hex[:6].upper()}"
    loc_display = f"{location_name} (Reported by {bus_code})"
    incident = Incident(
        incident_code=inc_code,
        issue_type=payload.issue_type,
        severity=sev,
        confidence=0.98,
        latitude=lat,
        longitude=lng,
        location_name=loc_display,
        status="WORK_ORDER_CREATED",
        confirmations_count=1,
        buses_list_json=json.dumps([bus_code]),
        multi_bus_verified=True,
        spatial_consistency="HIGH",
        temporal_consistency="HIGH",
        created_at=datetime.utcnow()
    )
    db.add(incident)
    await db.flush()

    det.incident_id = incident.incident_code
    db.add(det)
    await db.commit()
    await db.refresh(incident)

    # 3. Create Work Order immediately
    wo = await auto_create_work_order_if_needed(
        db,
        incident,
        force_create=True,
        driver_notes=payload.driver_notes
    )

    # 4. Broadcast to all clients
    await ws_manager.broadcast({
        "event_type": "DRIVER_HAZARD_REPORTED",
        "bus_code": bus_code,
        "issue_type": payload.issue_type,
        "severity": sev,
        "driver_notes": payload.driver_notes,
        "work_order_code": wo.work_order_code if wo else None,
        "incident_code": incident.incident_code,
        "location_name": incident.location_name
    })

    return {
        "status": "success",
        "message": f"Hazard transmitted! Work order {wo.work_order_code if wo else ''} dispatched.",
        "work_order_code": wo.work_order_code if wo else None,
        "incident_code": incident.incident_code,
        "issue_type": incident.issue_type,
        "severity": incident.severity,
        "sla_deadline": wo.sla_deadline.isoformat() if wo else None,
        "location_name": incident.location_name,
        "description": wo.description if wo else None,
        "assigned_worker": wo.assigned_worker if wo else "worker@urbaneye.ai",
        "worker_name": wo.worker_name if wo else "Rajesh Kumar (Field Rapid Response Team)"
    }

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
