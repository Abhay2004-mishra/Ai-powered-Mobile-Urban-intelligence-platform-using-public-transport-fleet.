from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime
from app.database.base import Base

class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True)
    bus_code = Column(String, unique=True, index=True, nullable=False) # e.g. BUS-104
    route_id = Column(String, nullable=True) # e.g. R-12
    driver_name = Column(String, nullable=True)
    device_id = Column(String, nullable=True) # e.g. JETSON-104
    camera_status = Column(String, default="ONLINE") # ONLINE, OFFLINE, WARNING
    ai_status = Column(String, default="RUNNING") # RUNNING, PAUSED, ERROR
    network_status = Column(String, default="ONLINE") # ONLINE, OFFLINE, BUFFERING
    latitude = Column(Float, default=31.6340)
    longitude = Column(Float, default=74.8723)
    speed_kmh = Column(Float, default=32.5)
    heading_deg = Column(Float, default=90.0)
    last_heartbeat = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="ONLINE") # ONLINE, OFFLINE, WARNING, MAINTENANCE
    today_detections_count = Column(Integer, default=0)
