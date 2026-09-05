from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class WorkOrderCreate(BaseModel):
    incident_id: str
    assigned_worker: Optional[str] = "worker@urbaneye.ai"
    worker_name: Optional[str] = "Rajesh Kumar (Field Team A)"
    description: Optional[str] = None

class WorkOrderUpdate(BaseModel):
    status: str # NEW, ASSIGNED, IN_PROGRESS, RESOLVED, VERIFIED
    assigned_worker: Optional[str] = None
    worker_name: Optional[str] = None
    resolution_notes: Optional[str] = None
    evidence_image_url: Optional[str] = None

class WorkOrderResponse(BaseModel):
    id: int
    work_order_code: str
    incident_id: str
    issue_type: str
    priority: str
    status: str
    latitude: float
    longitude: float
    location_name: Optional[str]
    description: Optional[str]
    assigned_officer: Optional[str]
    assigned_worker: Optional[str]
    worker_name: Optional[str]
    created_at: datetime
    sla_deadline: datetime
    resolved_at: Optional[datetime]
    resolution_notes: Optional[str]
    evidence_image_url: Optional[str]

    class Config:
        from_attributes = True
