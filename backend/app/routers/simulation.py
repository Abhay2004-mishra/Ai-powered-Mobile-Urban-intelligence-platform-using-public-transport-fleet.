import asyncio
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

from app.database.session import get_db
from app.models.bus import Bus
from app.models.detection import Detection
from app.services.deduplication_engine import process_detection_for_deduplication
from app.websocket.connection_manager import ws_manager
from app.ai.detection_engine import ai_engine

router = APIRouter(prefix="/api/simulation", tags=["Simulation Control"])

class SimulationTriggerRequest(BaseModel):
    issue_type: str = "pothole" # pothole, accident, road_damage, road_crack
    bus_code: Optional[str] = "BUS-104"

simulation_state = {
    "is_running": True,
    "interval_seconds": 6,
    "demo_step": 0
}

@router.get("/status")
async def get_simulation_status():
    return {
        "is_running": simulation_state["is_running"],
        "ai_engine": ai_engine.get_engine_status(),
        "fog_gateway_status": "ONLINE",
        "mqtt_broker_status": "CONNECTED"
    }

@router.post("/toggle")
async def toggle_simulation(running: bool):
    simulation_state["is_running"] = running
    await ws_manager.broadcast({
        "event_type": "SIMULATION_STATUS_CHANGED",
        "is_running": running
    })
    return {"status": "success", "is_running": running}

@router.post("/trigger")
async def trigger_event(req: SimulationTriggerRequest, db: AsyncSession = Depends(get_db)):
    # Find bus
    res = await db.execute(select(Bus).where(Bus.bus_code == req.bus_code))
    bus = res.scalar_one_or_none()
    if not bus:
        bus_lat, bus_lng = 31.6340, 74.8723
        bus_code = "BUS-104"
        route_id = "R-12"
    else:
        bus_lat, bus_lng = bus.latitude, bus.longitude
        bus_code = bus.bus_code
        route_id = bus.route_id

    # Generate synthetic AI detection
    det_dict = ai_engine.generate_simulated_detection(
        bus_code=bus_code,
        route_id=route_id,
        bus_lat=bus_lat,
        bus_lng=bus_lng,
        force_type=req.issue_type
    )

    det_code = f"DET-{uuid.uuid4().hex[:6].upper()}"
    detection = Detection(
        detection_code=det_code,
        bus_id=det_dict["bus_id"],
        route_id=det_dict["route_id"],
        detection_class=det_dict["detection_class"],
        confidence=det_dict["confidence"],
        severity="critical" if req.issue_type == "accident" else "high",
        latitude=det_dict["latitude"],
        longitude=det_dict["longitude"],
        source="edge",
        timestamp=datetime.utcnow()
    )
    db.add(detection)
    await db.commit()
    await db.refresh(detection)

    # Process Deduplication & Severity Engine
    incident = await process_detection_for_deduplication(db, detection)

    ws_payload = {
        "event_type": "SIH_TRIGGERED_EVENT",
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
            "confidence": incident.confidence,
            "location_name": incident.location_name,
            "status": incident.status,
            "confirmations_count": incident.confirmations_count,
            "multi_bus_verified": incident.multi_bus_verified,
            "work_order_id": incident.work_order_id
        } if incident else None
    }
    await ws_manager.broadcast(ws_payload)
    return ws_payload

async def run_sih_demo_pipeline(db_session_factory):
    steps = [
        ("CAMERA", "Bus BUS-104 camera stream captured 1080p frame near Mall Road"),
        ("EDGE_AI", "YOLOv11 Edge AI detected Severe Pothole with 94% confidence"),
        ("GPS", "GPS location tagged: Lat 31.6340, Lng 74.8723 on Route R-12"),
        ("MQTT", "Transmitted ~1KB JSON detection metadata over MQTT topic urbaneye/bus/BUS-104/detections"),
        ("FOG", "Depot Fog Gateway received metadata payload and validated schema"),
        ("DEDUP", "Spatial deduplication engine matched 3 previous bus observations near Mall Road"),
        ("SEVERITY", "Severity engine calculated CRITICAL rating due to high traffic density and multi-bus verification"),
        ("INCIDENT", "Incident #INC-1024 updated as MULTI-BUS VERIFIED"),
        ("ALERT", "🚨 Critical alert broadcasted to Municipal Officer Command Center"),
        ("WORK_ORDER", "Automatic Work Order #WO-9041 dispatched to Field Rapid Response Team A (SLA: 30 mins)"),
        ("RESOLVED", "Field Worker updated work status to RESOLVED with photo evidence")
    ]

    for index, (stage, msg) in enumerate(steps, start=1):
        await ws_manager.broadcast({
            "event_type": "SIH_DEMO_STEP",
            "step": index,
            "total_steps": len(steps),
            "stage": stage,
            "message": msg
        })
        await asyncio.sleep(1.2)

@router.post("/sih_demo_flow")
async def trigger_sih_demo_flow(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    # Trigger demo step runner in background
    background_tasks.add_task(run_sih_demo_pipeline, get_db)
    return {"status": "started", "message": "SIH complete 15-stage demonstration pipeline started."}
