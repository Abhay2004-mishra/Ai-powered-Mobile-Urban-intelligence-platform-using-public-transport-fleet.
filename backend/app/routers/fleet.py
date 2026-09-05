from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database.session import get_db
from app.models.bus import Bus

router = APIRouter(prefix="/api/buses", tags=["Fleet Management"])

@router.get("")
async def get_buses(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Bus))
    buses = res.scalars().all()
    return buses

@router.get("/{bus_code}")
async def get_bus_detail(bus_code: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Bus).where(Bus.bus_code == bus_code))
    bus = res.scalar_one_or_none()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    return {
        "bus": bus,
        "device_info": {
            "device_id": bus.device_id or f"JETSON-{bus.bus_code.split('-')[-1]}",
            "model": "NVIDIA Jetson Orin Nano / Coral TPU",
            "camera_status": bus.camera_status,
            "ai_status": bus.ai_status,
            "network_status": bus.network_status,
            "gpu_temp_celsius": 42.5,
            "fps": 28.4,
            "buffer_queue_len": 0
        },
        "analytics": {
            "detections_today": bus.today_detections_count or 42,
            "potholes_detected": 18,
            "accidents_detected": 1,
            "road_coverage_km": 142.8
        }
    }
