from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DetectionCreate(BaseModel):
    bus_id: str
    route_id: Optional[str] = "R-12"
    detection_class: str
    confidence: float
    severity: Optional[str] = "medium"
    latitude: float
    longitude: float
    source: Optional[str] = "edge"
    image_url: Optional[str] = None

class DetectionResponse(BaseModel):
    id: int
    detection_code: str
    bus_id: str
    route_id: Optional[str]
    detection_class: str
    confidence: float
    severity: str
    latitude: float
    longitude: float
    timestamp: datetime
    source: str
    incident_id: Optional[str]

    class Config:
        from_attributes = True
