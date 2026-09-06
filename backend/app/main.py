import asyncio
import logging
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database.base import Base
from app.database.session import engine, AsyncSessionLocal
from app.websocket.connection_manager import ws_manager
from app.mqtt.mqtt_client import mqtt_service

from app.routers import (
    auth, dashboard, detections, incidents, work_orders,
    fleet, routes, analytics, privacy, simulation
)
from app.models.user import User
from app.models.bus import Bus
from app.models.detection import Detection
from app.models.incident import Incident
from app.models.work_order import WorkOrder
from app.models.route import Route
from app.ai.detection_engine import ai_engine
from app.services.deduplication_engine import process_detection_for_deduplication

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("urbaneye.main")

async def background_simulation_loop():
    """Simulates bus movement smoothly and generates occasional AI detections without flooding database"""
    await asyncio.sleep(3) # Initial warmup delay
    logger.info("Background Edge Bus Simulator started.")
    while True:
        try:
            await asyncio.sleep(4)
            from app.routers.simulation import simulation_state
            if not simulation_state.get("is_running", True):
                continue

            async with AsyncSessionLocal() as db:
                buses_res = await db.execute(select(Bus).where(Bus.status == "ONLINE"))
                buses = buses_res.scalars().all()
                if not buses:
                    continue

                # Move each bus slightly along route
                for bus in buses:
                    bus.latitude += (0.0001 if bus.id % 2 == 0 else -0.0001)
                    bus.longitude += (0.0001 if bus.id % 3 == 0 else -0.0001)
                    db.add(bus)
                await db.commit()

                import random
                active_bus = random.choice(buses)

                # Only generate new AI detections occasionally (15% chance per cycle)
                if random.random() < 0.15:
                    det_dict = ai_engine.generate_simulated_detection(
                        bus_code=active_bus.bus_code,
                        route_id=active_bus.route_id or "R-12",
                        bus_lat=active_bus.latitude,
                        bus_lng=active_bus.longitude
                    )

                    from datetime import datetime
                    det_code = f"DET-{uuid.uuid4().hex[:6].upper()}"
                    detection = Detection(
                        detection_code=det_code,
                        bus_id=det_dict["bus_id"],
                        route_id=det_dict["route_id"],
                        detection_class=det_dict["detection_class"],
                        confidence=det_dict["confidence"],
                        severity="medium",
                        latitude=det_dict["latitude"],
                        longitude=det_dict["longitude"],
                        source="edge",
                        timestamp=datetime.utcnow()
                    )
                    db.add(detection)
                    await db.commit()

                    # Run deduplication
                    incident = await process_detection_for_deduplication(db, detection)

                    # Broadcast over WS
                    await ws_manager.broadcast({
                        "event_type": "LIVE_TELEMETRY",
                        "bus_code": active_bus.bus_code,
                        "latitude": active_bus.latitude,
                        "longitude": active_bus.longitude,
                        "new_detection": {
                            "detection_code": detection.detection_code,
                            "detection_class": detection.detection_class,
                            "confidence": detection.confidence,
                            "severity": detection.severity,
                            "latitude": detection.latitude,
                            "longitude": detection.longitude
                        },
                        "incident": {
                            "incident_code": incident.incident_code,
                            "issue_type": incident.issue_type,
                            "severity": incident.severity,
                            "confirmations_count": incident.confirmations_count,
                            "multi_bus_verified": incident.multi_bus_verified
                        } if incident else None
                    })
                else:
                    # Broadcast telemetry position update only
                    await ws_manager.broadcast({
                        "event_type": "LIVE_TELEMETRY",
                        "bus_code": active_bus.bus_code,
                        "latitude": active_bus.latitude,
                        "longitude": active_bus.longitude
                    })
        except Exception as e:
            logger.error(f"Error in background simulation loop: {e}")

async def on_mqtt_message(topic: str, payload: dict):
    """
    Handles incoming MQTT packets from Edge Buses, Fleet Convoy, and Fog Gateways.
    Persists detections into SQLite DB, triggers spatial deduplication,
    creates/updates work orders, and broadcasts real-time updates over WebSockets.
    """
    try:
        if "detections" in topic or payload.get("event_type") == "DETECTION":
            from datetime import datetime
            bus_id = payload.get("bus_id") or payload.get("bus_code") or "BUS-104"
            route_id = payload.get("route_id") or "R-12"
            detection_class = payload.get("detection_class") or payload.get("issue_type") or "pothole"
            confidence = float(payload.get("confidence", 0.92))
            severity = payload.get("severity") or ("critical" if detection_class in ["accident", "road_damage"] else "high")
            latitude = float(payload.get("latitude", 31.6340))
            longitude = float(payload.get("longitude", 74.8723))

            det_code = payload.get("detection_code") or f"DET-{uuid.uuid4().hex[:6].upper()}"

            async with AsyncSessionLocal() as db:
                detection = Detection(
                    detection_code=det_code,
                    bus_id=bus_id,
                    route_id=route_id,
                    detection_class=detection_class,
                    confidence=confidence,
                    severity=severity,
                    latitude=latitude,
                    longitude=longitude,
                    source=payload.get("source", "edge_mqtt"),
                    timestamp=datetime.utcnow()
                )
                db.add(detection)
                await db.commit()
                await db.refresh(detection)

                incident = await process_detection_for_deduplication(db, detection)

                # Broadcast MQTT packet telemetry
                await ws_manager.broadcast({
                    "event_type": "MQTT_PACKET",
                    "topic": topic,
                    "payload": payload,
                    "detection_code": detection.detection_code,
                    "incident_code": incident.incident_code if incident else None,
                    "confirmations_count": incident.confirmations_count if incident else 1,
                    "multi_bus_verified": incident.multi_bus_verified if incident else False,
                    "timestamp": datetime.utcnow().isoformat()
                })

                # Broadcast detection & incident update
                await ws_manager.broadcast({
                    "event_type": "NEW_DETECTION",
                    "detection": {
                        "detection_code": detection.detection_code,
                        "bus_id": detection.bus_id,
                        "detection_class": detection.detection_class,
                        "confidence": detection.confidence,
                        "severity": detection.severity,
                        "latitude": detection.latitude,
                        "longitude": detection.longitude,
                        "source": detection.source
                    },
                    "incident": {
                        "incident_code": incident.incident_code,
                        "issue_type": incident.issue_type,
                        "severity": incident.severity,
                        "confidence": incident.confidence,
                        "confirmations_count": incident.confirmations_count,
                        "multi_bus_verified": incident.multi_bus_verified,
                        "work_order_id": incident.work_order_id
                    } if incident else None
                })
        elif "telemetry" in topic:
            await ws_manager.broadcast({
                "event_type": "LIVE_TELEMETRY",
                "bus_code": payload.get("bus_code", "BUS-104"),
                "latitude": payload.get("latitude", 31.6340),
                "longitude": payload.get("longitude", 74.8723)
            })
    except Exception as e:
        logger.error(f"Error processing MQTT message on {topic}: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Auto Seed DB if empty
    async with AsyncSessionLocal() as db:
        user_res = await db.execute(select(func.count(User.id)))
        if user_res.scalar() == 0:
            logger.info("Database empty. Auto-seeding initial data...")
            try:
                import sys
                from pathlib import Path
                root_dir = str(Path(__file__).resolve().parent.parent.parent)
                if root_dir not in sys.path:
                    sys.path.insert(0, root_dir)
                from database.seed import seed_database
                await seed_database(db)
            except Exception as e:
                logger.warning(f"Seed script execution: {e}")

    # Start MQTT background service with on_mqtt_message callback
    try:
        loop = asyncio.get_running_loop()
        mqtt_service.start(loop, on_mqtt_message)
    except Exception as e:
        logger.warning(f"MQTT init warning: {e}")

    # Start Edge simulator task
    sim_task = asyncio.create_task(background_simulation_loop())

    yield

    # Shutdown
    sim_task.cancel()

app = FastAPI(
    title="UrbanEye AI Backend API",
    description="Smart City Mobile Urban Intelligence Platform API for SIH 2026",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(detections.router)
app.include_router(incidents.router)
app.include_router(work_orders.router)
app.include_router(fleet.router)
app.include_router(routes.router)
app.include_router(analytics.router)
app.include_router(privacy.router)
app.include_router(simulation.router)

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "UrbanEye AI Cloud Backend",
        "version": "1.0.0",
        "ai_engine": ai_engine.get_engine_status()
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle client ping or custom message if needed
            await websocket.send_json({"status": "ack", "received": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
