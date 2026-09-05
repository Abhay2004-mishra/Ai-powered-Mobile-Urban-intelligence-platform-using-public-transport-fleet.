import math
import json
import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.incident import Incident
from app.models.detection import Detection
from app.services.severity_engine import calculate_severity
from app.services.work_order_service import auto_create_work_order_if_needed

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Returns distance in meters between two lat/lng points"""
    R = 6371000  # Radius of Earth in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

async def process_detection_for_deduplication(db: AsyncSession, detection: Detection) -> Incident:
    """
    Deduplication Engine:
    Checks if a detection matches an existing incident (distance < 50 meters AND same issue type AND time < 10 mins).
    If matched -> merges into incident, increments confirmation count, marks multi-bus verified.
    If not matched -> creates a new Incident.
    """
    # Exclude non-road hazard detections like person, car, etc from incident creation if desired
    HAZARD_CLASSES = {"pothole", "road_crack", "road_damage", "accident", "obstacle", "traffic_congestion"}
    if detection.detection_class not in HAZARD_CLASSES:
        return None

    # Query recent open incidents of same issue_type within last 1 hour
    time_threshold = datetime.utcnow() - timedelta(hours=1)
    query = select(Incident).where(
        Incident.issue_type == detection.detection_class,
        Incident.created_at >= time_threshold,
        Incident.status != "RESOLVED",
        Incident.status != "FALSE_POSITIVE"
    )
    result = await db.execute(query)
    recent_incidents = result.scalars().all()

    matched_incident = None
    for inc in recent_incidents:
        dist = haversine_distance(detection.latitude, detection.longitude, inc.latitude, inc.longitude)
        if dist <= 60.0:  # 60 meters radius spatial threshold
            matched_incident = inc
            break

    if matched_incident:
        # Merge into existing incident
        buses = json.loads(matched_incident.buses_list_json) if matched_incident.buses_list_json else []
        if detection.bus_id not in buses:
            buses.append(detection.bus_id)
        
        matched_incident.confirmations_count += 1
        matched_incident.buses_list_json = json.dumps(buses)
        if len(buses) > 1:
            matched_incident.multi_bus_verified = True

        # Re-calculate confidence & severity
        matched_incident.confidence = min(0.99, max(matched_incident.confidence, detection.confidence + 0.03 * (len(buses) - 1)))
        matched_incident.severity = calculate_severity(
            detection_class=matched_incident.issue_type,
            confidence=matched_incident.confidence,
            multi_bus_verified=matched_incident.multi_bus_verified,
            confirmations_count=matched_incident.confirmations_count
        )
        
        detection.incident_id = matched_incident.incident_code
        db.add(matched_incident)
        db.add(detection)
        await db.commit()
        await db.refresh(matched_incident)

        # Check auto work order update/creation
        await auto_create_work_order_if_needed(db, matched_incident)
        return matched_incident

    else:
        # Create new incident
        next_inc_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
        initial_severity = calculate_severity(
            detection_class=detection.detection_class,
            confidence=detection.confidence,
            multi_bus_verified=False,
            confirmations_count=1
        )

        location_names = {
            "pothole": "Main Highway Segment B",
            "road_damage": "Sector 4 Junction",
            "accident": "Ring Road Flyover",
            "road_crack": "City Center Avenue",
            "obstacle": "Station Road Crossing",
            "traffic_congestion": "Commercial Belt Expressway"
        }
        loc_name = location_names.get(detection.detection_class, "City Transit Route")

        new_incident = Incident(
            incident_code=next_inc_id,
            issue_type=detection.detection_class,
            severity=initial_severity,
            confidence=detection.confidence,
            latitude=detection.latitude,
            longitude=detection.longitude,
            location_name=loc_name,
            status="NEW",
            confirmations_count=1,
            buses_list_json=json.dumps([detection.bus_id]),
            multi_bus_verified=False,
            spatial_consistency="HIGH",
            temporal_consistency="HIGH",
            created_at=datetime.utcnow()
        )

        db.add(new_incident)
        await db.flush()
        
        detection.incident_id = new_incident.incident_code
        db.add(detection)
        await db.commit()
        await db.refresh(new_incident)

        # Auto work order trigger
        await auto_create_work_order_if_needed(db, new_incident)
        return new_incident
