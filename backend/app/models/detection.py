from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from datetime import datetime
from app.database.base import Base

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    detection_code = Column(String, unique=True, index=True, nullable=False) # DET-10024
    bus_id = Column(String, index=True, nullable=False) # BUS-104
    route_id = Column(String, index=True, nullable=True) # R-12
    detection_class = Column(String, index=True, nullable=False) # pothole, road_crack, road_damage, accident, obstacle, traffic_congestion, person, car
    confidence = Column(Float, nullable=False) # 0.94
    severity = Column(String, nullable=False, default="medium") # low, medium, high, critical
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source = Column(String, default="edge") # edge, fog, cloud
    incident_id = Column(String, index=True, nullable=True) # INC-1024 if deduplicated into incident
    image_url = Column(String, nullable=True)
    is_processed = Column(Boolean, default=False)
