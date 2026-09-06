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
    issue_type: str = "pothole" # pothole, accident, road_damage, road_crack, obstacle
    bus_code: Optional[str] = "BUS-104"
    driver_notes: Optional[str] = None
    severity: Optional[str] = None

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

from app.services.work_order_service import auto_create_work_order_if_needed

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

    # Determine severity
    sev = req.severity
    if not sev:
        sev = "critical" if req.issue_type in ["accident", "road_damage"] else "high"

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
        severity=sev,
        latitude=det_dict["latitude"],
        longitude=det_dict["longitude"],
        source="driver_cockpit" if req.driver_notes else "edge",
        timestamp=datetime.utcnow()
    )
    db.add(detection)
    await db.commit()
    await db.refresh(detection)

    # Process Deduplication & Severity Engine
    incident = await process_detection_for_deduplication(db, detection)

    # If driver notes provided, force work order generation with driver notes
    wo = None
    if incident:
        wo = await auto_create_work_order_if_needed(
            db, 
            incident, 
            force_create=bool(req.driver_notes), 
            driver_notes=req.driver_notes
        )

    topic = f"urbaneye/fleet/{bus_code.lower()}/detections/{req.issue_type}"
    from app.mqtt.mqtt_client import mqtt_service
    mqtt_service.publish(topic, {
        "event_type": "TRIGGERED_DETECTION",
        "detection_code": detection.detection_code,
        "bus_id": detection.bus_id,
        "detection_class": detection.detection_class,
        "confidence": detection.confidence,
        "severity": detection.severity,
        "latitude": detection.latitude,
        "longitude": detection.longitude,
        "incident_code": incident.incident_code if incident else None,
        "work_order_code": wo.work_order_code if wo else None,
        "timestamp": detection.timestamp.isoformat()
    })

    ws_payload = {
        "event_type": "SIH_TRIGGERED_EVENT",
        "mqtt_topic": topic,
        "work_order_code": wo.work_order_code if wo else (incident.work_order_id if incident else None),
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
            "work_order_id": wo.work_order_code if wo else incident.work_order_id
        } if incident else None
    }
    await ws_manager.broadcast(ws_payload)
    return ws_payload

class ConvoyScanRequest(BaseModel):
    bus_code: str = "BUS-104"
    route_id: Optional[str] = "R-12"
    latitude: float = 31.6340
    longitude: float = 74.8723
    detection_class: str = "pothole"
    confidence: float = 0.94
    severity: Optional[str] = "high"
    depth_estimate: Optional[str] = "6.5 cm"
    corroboration_pass: Optional[int] = 1

@router.post("/convoy_scan")
async def convoy_scan(req: ConvoyScanRequest, db: AsyncSession = Depends(get_db)):
    """
    Ingests road scan observations from multi-bus fleet convoy or 3D viewer.
    Executes: Detection -> Spatial Deduplication -> Multi-Bus Corroboration -> Work Order Dispatch.
    Broadcasts live updates to MQTT broker and WebSocket clients.
    """
    from app.mqtt.mqtt_client import mqtt_service
    from app.services.work_order_service import auto_create_work_order_if_needed

    det_code = f"DET-{uuid.uuid4().hex[:6].upper()}"
    detection = Detection(
        detection_code=det_code,
        bus_id=req.bus_code,
        route_id=req.route_id or "R-12",
        detection_class=req.detection_class,
        confidence=req.confidence,
        severity=req.severity or "high",
        latitude=req.latitude,
        longitude=req.longitude,
        source=f"convoy_{req.bus_code.lower()}",
        timestamp=datetime.utcnow()
    )
    db.add(detection)
    await db.commit()
    await db.refresh(detection)

    # Process deduplication
    incident = await process_detection_for_deduplication(db, detection)

    # Corroboration boost if 2nd or later bus passes
    if incident and req.corroboration_pass and req.corroboration_pass >= 2:
        incident.multi_bus_verified = True
        incident.confirmations_count = max(incident.confirmations_count, req.corroboration_pass)
        incident.confidence = min(0.99, max(incident.confidence, req.confidence + 0.04))
        db.add(incident)
        await db.commit()
        await db.refresh(incident)

    wo = None
    if incident:
        wo = await auto_create_work_order_if_needed(
            db,
            incident,
            force_create=(req.corroboration_pass >= 2 or incident.severity == "critical")
        )

    topic = f"urbaneye/fleet/{req.bus_code.lower()}/detections/{req.detection_class}"
    mqtt_payload = {
        "event_type": "CONVOY_DETECTION",
        "detection_code": detection.detection_code,
        "bus_code": req.bus_code,
        "route_id": req.route_id,
        "issue_type": req.detection_class,
        "confidence": req.confidence,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "depth_estimate": req.depth_estimate,
        "corroboration_pass": req.corroboration_pass,
        "confirmations_count": incident.confirmations_count if incident else 1,
        "multi_bus_verified": incident.multi_bus_verified if incident else False,
        "work_order_code": wo.work_order_code if wo else (incident.work_order_id if incident else None),
        "timestamp": datetime.utcnow().isoformat()
    }
    mqtt_service.publish(topic, mqtt_payload)

    ws_payload = {
        "event_type": "SIH_TRIGGERED_EVENT",
        "mqtt_topic": topic,
        "work_order_code": wo.work_order_code if wo else (incident.work_order_id if incident else None),
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
            "work_order_id": wo.work_order_code if wo else incident.work_order_id
        } if incident else None
    }
    await ws_manager.broadcast(ws_payload)

    return {
        "status": "success",
        "mqtt_topic": topic,
        "detection_code": detection.detection_code,
        "incident_code": incident.incident_code if incident else None,
        "confirmations_count": incident.confirmations_count if incident else 1,
        "multi_bus_verified": incident.multi_bus_verified if incident else False,
        "severity": incident.severity if incident else req.severity,
        "work_order_code": wo.work_order_code if wo else (incident.work_order_id if incident else None),
        "confidence": incident.confidence if incident else req.confidence,
        "fog_buffered": True,
        "timestamp": datetime.utcnow().isoformat()
    }

class ResolveIncidentRequest(BaseModel):
    incident_code: Optional[str] = None
    work_order_code: Optional[str] = None
    repaired_by: Optional[str] = "Rapid Pothole Patch Unit #4"
    resolution_notes: Optional[str] = "Polymer asphalt hot-mix patch applied and roller compacted."

@router.post("/resolve_incident")
async def resolve_incident(req: ResolveIncidentRequest, db: AsyncSession = Depends(get_db)):
    """
    Marks a road hazard incident and its associated work order as RESOLVED.
    Updates SQLite DB, publishes to MQTT, and broadcasts to WebSocket clients.
    """
    from app.models.incident import Incident
    from app.models.work_order import WorkOrder
    from app.mqtt.mqtt_client import mqtt_service

    target_incident = None
    if req.incident_code:
        res = await db.execute(select(Incident).where(Incident.incident_code == req.incident_code))
        target_incident = res.scalar_one_or_none()

    if not target_incident:
        # Find latest active incident
        res = await db.execute(
            select(Incident)
            .where(Incident.status.notin_(["RESOLVED", "FALSE_POSITIVE"]))
            .order_by(Incident.created_at.desc())
        )
        target_incident = res.scalars().first()

    target_wo = None
    if req.work_order_code:
        wo_res = await db.execute(select(WorkOrder).where(WorkOrder.work_order_code == req.work_order_code))
        target_wo = wo_res.scalar_one_or_none()
    elif target_incident and target_incident.work_order_id:
        wo_res = await db.execute(select(WorkOrder).where(WorkOrder.work_order_code == target_incident.work_order_id))
        target_wo = wo_res.scalar_one_or_none()

    now = datetime.utcnow()
    if target_incident:
        target_incident.status = "RESOLVED"
        target_incident.updated_at = now
        db.add(target_incident)

    if target_wo:
        target_wo.status = "RESOLVED"
        target_wo.resolved_at = now
        target_wo.worker_name = req.repaired_by or target_wo.worker_name or "Rapid Repair Unit A"
        target_wo.resolution_notes = req.resolution_notes or "Pothole patch completed successfully."
        db.add(target_wo)

    await db.commit()
    if target_incident:
        await db.refresh(target_incident)
    if target_wo:
        await db.refresh(target_wo)

    topic = "urbaneye/work_order/resolved"
    res_payload = {
        "event_type": "INCIDENT_RESOLVED",
        "incident_code": target_incident.incident_code if target_incident else (req.incident_code or "INC-1024"),
        "work_order_code": target_wo.work_order_code if target_wo else req.work_order_code,
        "status": "RESOLVED",
        "repaired_by": req.repaired_by,
        "resolution_notes": req.resolution_notes,
        "timestamp": now.isoformat()
    }

    mqtt_service.publish(topic, res_payload)
    await ws_manager.broadcast(res_payload)

    return {
        "status": "success",
        "incident_code": target_incident.incident_code if target_incident else None,
        "work_order_code": target_wo.work_order_code if target_wo else None,
        "incident_status": "RESOLVED",
        "work_order_status": "RESOLVED",
        "repaired_by": req.repaired_by,
        "resolution_notes": req.resolution_notes,
        "timestamp": now.isoformat()
    }

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
