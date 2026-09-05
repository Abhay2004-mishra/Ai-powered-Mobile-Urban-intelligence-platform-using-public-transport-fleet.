from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from datetime import datetime
from app.database.base import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_code = Column(String, unique=True, index=True, nullable=False) # ALT-5501
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, index=True, default="high") # low, medium, high, critical
    incident_id = Column(String, nullable=True)
    bus_id = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True, nullable=False)
    action = Column(String, nullable=False) # INCIDENT_CREATED, WORK_ORDER_ASSIGNED, FALSE_POSITIVE_MARKED, STATUS_CHANGED
    target_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
