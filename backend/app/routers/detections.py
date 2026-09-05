from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
from datetime import datetime
import uuid

from app.database.session import get_db
from app.models.detection import Detection
from app.schemas.detection import DetectionCreate, DetectionResponse
from app.services.deduplication_engine import process_detection_for_deduplication
from app.websocket.connection_manager import ws_manager

router = APIRouter(prefix="/api/detections", tags=["Detections"])

@router.get("", response_model=List[DetectionResponse])
async def get_detections(
    bus_id: Optional[str] = None,
    severity: Optional[str] = None,
    detection_class: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    db: AsyncSession = Depends(get_db)
):
    query = select(Detection).order_by(desc(Detection.timestamp))
    if bus_id:
        query = query.where(Detection.bus_id == bus_id)
    if severity:
        query = query.where(Detection.severity == severity)
    if detection_class:
        query = query.where(Detection.detection_class == detection_class)
    
    query = query.limit(limit)
    result = await db.execute(query)
    detections = result.scalars().all()
    return detections

@router.post("", response_model=DetectionResponse)
async def create_detection(payload: DetectionCreate, db: AsyncSession = Depends(get_db)):
    det_code = f"DET-{uuid.uuid4().hex[:6].upper()}"
    
    detection = Detection(
        detection_code=det_code,
        bus_id=payload.bus_id,
        route_id=payload.route_id,
        detection_class=payload.detection_class,
        confidence=payload.confidence,
        severity=payload.severity or "medium",
        latitude=payload.latitude,
        longitude=payload.longitude,
        source=payload.source or "edge",
        image_url=payload.image_url,
        timestamp=datetime.utcnow()
    )
    db.add(detection)
    await db.commit()
    await db.refresh(detection)

    # Trigger Deduplication Engine
    incident = await process_detection_for_deduplication(db, detection)

    # Broadcast via WebSocket
    ws_event = {
        "event_type": "NEW_DETECTION",
        "detection": {
            "detection_code": detection.detection_code,
            "bus_id": detection.bus_id,
            "detection_class": detection.detection_class,
            "confidence": detection.confidence,
            "severity": detection.severity,
            "latitude": detection.latitude,
            "longitude": detection.longitude,
            "timestamp": detection.timestamp.isoformat()
        },
        "incident": {
            "incident_code": incident.incident_code,
            "issue_type": incident.issue_type,
            "severity": incident.severity,
            "confirmations_count": incident.confirmations_count,
            "multi_bus_verified": incident.multi_bus_verified
        } if incident else None
    }
    await ws_manager.broadcast(ws_event)

    return detection
