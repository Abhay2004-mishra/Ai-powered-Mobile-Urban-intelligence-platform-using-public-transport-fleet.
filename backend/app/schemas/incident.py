from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class IncidentResponse(BaseModel):
    id: int
    incident_code: str
    issue_type: str
    severity: str
    confidence: float
    latitude: float
    longitude: float
    location_name: Optional[str]
    status: str
    confirmations_count: int
    buses_list_json: Optional[str]
    multi_bus_verified: bool
    spatial_consistency: str
    temporal_consistency: str
    created_at: datetime
    work_order_id: Optional[str]
    false_positive_reason: Optional[str]

    class Config:
        from_attributes = True

class IncidentStatusUpdate(BaseModel):
    status: str
    false_positive_reason: Optional[str] = None
