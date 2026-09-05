from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from datetime import datetime
from app.database.base import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String, unique=True, index=True, nullable=False) # INC-1024
    issue_type = Column(String, index=True, nullable=False) # pothole, road_crack, road_damage, accident, obstacle, traffic_congestion
    severity = Column(String, index=True, nullable=False) # low, medium, high, critical
    confidence = Column(Float, nullable=False) # aggregated confidence (e.g. 0.96)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String, nullable=True) # e.g. Mall Road Near Gate 3
    status = Column(String, index=True, default="NEW") # NEW, WORK_ORDER_CREATED, IN_PROGRESS, RESOLVED, FALSE_POSITIVE
    
    # Deduplication & Multi-bus verification metrics
    confirmations_count = Column(Integer, default=1)
    buses_list_json = Column(Text, nullable=True) # JSON list e.g. ["BUS-104", "BUS-107", "BUS-112"]
    multi_bus_verified = Column(Boolean, default=False)
    spatial_consistency = Column(String, default="HIGH")
    temporal_consistency = Column(String, default="HIGH")

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    work_order_id = Column(String, nullable=True) # WO-9041
    false_positive_reason = Column(String, nullable=True)
