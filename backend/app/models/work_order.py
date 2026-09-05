from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from datetime import datetime
from app.database.base import Base

class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, index=True)
    work_order_code = Column(String, unique=True, index=True, nullable=False) # WO-9041
    incident_id = Column(String, index=True, nullable=False) # INC-1024
    issue_type = Column(String, nullable=False) # pothole, accident, etc.
    priority = Column(String, index=True, nullable=False) # low, medium, high, critical
    status = Column(String, index=True, default="NEW") # NEW, ASSIGNED, IN_PROGRESS, RESOLVED, VERIFIED
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    
    assigned_officer = Column(String, nullable=True) # officer@urbaneye.ai
    assigned_worker = Column(String, nullable=True) # worker@urbaneye.ai
    worker_name = Column(String, nullable=True) # Rajesh Kumar (Field Team A)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    sla_deadline = Column(DateTime, nullable=False) # calculated SLA target
    resolved_at = Column(DateTime, nullable=True)
    
    resolution_notes = Column(Text, nullable=True)
    evidence_image_url = Column(String, nullable=True)
