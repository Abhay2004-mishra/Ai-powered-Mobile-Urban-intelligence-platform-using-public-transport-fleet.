import asyncio
import json
import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.bus import Bus
from app.models.route import Route
from app.models.detection import Detection
from app.models.incident import Incident
from app.models.work_order import WorkOrder
from app.models.alert import Alert
import bcrypt

def hash_pwd(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8')[:72], bcrypt.gensalt()).decode('utf-8')

async def seed_database(db: AsyncSession):
    # 1. Users
    demo_hashed = hash_pwd("UrbanEye@2026")
    users = [
        User(email="admin@urbaneye.ai", hashed_password=demo_hashed, full_name="System Administrator", role="admin", department="Central IT Command"),
        User(email="officer@urbaneye.ai", hashed_password=demo_hashed, full_name="Officer A. Sharma", role="municipal_officer", department="Municipal Infrastructure Command"),
        User(email="worker@urbaneye.ai", hashed_password=demo_hashed, full_name="Rajesh Kumar", role="field_worker", department="Public Works Rapid Response Team A"),
        User(email="operator@urbaneye.ai", hashed_password=demo_hashed, full_name="Gurpreet Singh", role="bus_operator", department="City Transport Fleet")
    ]
    for u in users:
        db.add(u)

    # 2. Routes
    routes_data = [
        ("R-01", "GT Road Circular Express", "ISBT Terminal", "University Campus", 18.5),
        ("R-02", "Mall Road Commercial Corridor", "Railway Station", "Civil Lines", 12.2),
        ("R-03", "Ring Road Outer Bypass", "North Highway Gate", "South Industrial Zone", 24.8),
        ("R-04", "Heritage City Center Loop", "Golden Corridor", "Town Hall", 8.6),
        ("R-05", "Airport Link Shuttle", "City Bus Stand", "International Airport", 28.0),
        ("R-06", "Metro Feeder Route 6", "Central Station", "Suburban Sector 9", 14.3),
        ("R-07", "East Avenue Sector Line", "East Gate", "IT Park Phase 2", 16.7),
        ("R-08", "West Industrial Transit", "West Hub", "Freight Terminal", 21.0),
        ("R-09", "South University Express", "Interstate Bus Terminus", "Tech Institute", 19.4),
        ("R-10", "North Ring Bypass", "North Bypass", "Green Park Terminal", 15.8)
    ]
    for code, name, start, end, dist in routes_data:
        db.add(Route(
            route_code=code,
            route_name=name,
            start_point=start,
            end_point=end,
            distance_km=dist,
            assigned_buses_count=random.randint(4, 12),
            daily_trips=random.randint(18, 36),
            coverage_percent=round(random.uniform(78.0, 94.0), 1)
        ))

    # Base coords around Amritsar / Delhi Smart City corridor
    BASE_LAT = 31.6340
    BASE_LNG = 74.8723

    # 3. Buses
    buses = []
    for i in range(1, 21):
        bus_code = f"BUS-{100+i}"
        bus = Bus(
            bus_code=bus_code,
            route_id=f"R-{(i%10)+1:02d}",
            driver_name=f"Driver {chr(65+i)}",
            device_id=f"JETSON-{100+i}",
            camera_status="ONLINE" if i != 5 else "WARNING",
            ai_status="RUNNING",
            network_status="ONLINE",
            latitude=BASE_LAT + (random.random() - 0.5) * 0.08,
            longitude=BASE_LNG + (random.random() - 0.5) * 0.08,
            speed_kmh=round(random.uniform(15.0, 45.0), 1),
            heading_deg=round(random.uniform(0.0, 360.0), 1),
            status="ONLINE" if i != 5 else "WARNING",
            today_detections_count=random.randint(25, 85)
        )
        buses.append(bus)
        db.add(bus)

    # 4. Incidents & Detections
    classes = ["pothole", "road_crack", "road_damage", "accident", "obstacle", "traffic_congestion"]
    severities = ["low", "medium", "high", "critical"]

    for i in range(1, 105):
        inc_code = f"INC-{1000+i}"
        issue = random.choice(classes)
        severity = "critical" if issue == "accident" else random.choice(severities)
        lat = BASE_LAT + (random.random() - 0.5) * 0.09
        lng = BASE_LNG + (random.random() - 0.5) * 0.09
        
        bus_sample = [f"BUS-{100+random.randint(1,20)}" for _ in range(random.randint(1, 4))]
        multi_bus = len(set(bus_sample)) > 1

        inc = Incident(
            incident_code=inc_code,
            issue_type=issue,
            severity=severity,
            confidence=round(random.uniform(0.84, 0.98), 2),
            latitude=lat,
            longitude=lng,
            location_name=f"Sector {(i%15)+1} Junction, Main Transit Corridor",
            status="WORK_ORDER_CREATED" if severity in ["high", "critical"] else "NEW",
            confirmations_count=len(set(bus_sample)),
            buses_list_json=json.dumps(list(set(bus_sample))),
            multi_bus_verified=multi_bus,
            created_at=datetime.utcnow() - timedelta(minutes=random.randint(10, 1440))
        )

        if severity in ["high", "critical"]:
            wo_code = f"WO-{9000+i}"
            inc.work_order_id = wo_code
            
            wo = WorkOrder(
                work_order_code=wo_code,
                incident_id=inc_code,
                issue_type=issue,
                priority=severity,
                status=random.choice(["NEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED"]),
                latitude=lat,
                longitude=lng,
                location_name=inc.location_name,
                description=f"Automated municipal dispatch for {severity.upper()} {issue.replace('_', ' ')}.",
                assigned_officer="officer@urbaneye.ai",
                assigned_worker="worker@urbaneye.ai",
                worker_name="Rajesh Kumar (Field Rapid Response Team)",
                created_at=inc.created_at,
                sla_deadline=inc.created_at + timedelta(hours=0.5 if severity == "critical" else 2.0)
            )
            db.add(wo)

        db.add(inc)

        # Create detections per incident to demonstrate historical observations
        for b_idx, b_code in enumerate(set(bus_sample)):
            det_code = f"DET-{100000 + i * 10 + b_idx}"
            db.add(Detection(
                detection_code=det_code,
                bus_id=b_code,
                route_id=f"R-{(random.randint(1,10)):02d}",
                detection_class=issue,
                confidence=round(random.uniform(0.80, 0.96), 2),
                severity=severity,
                latitude=lat + (random.random() - 0.5) * 0.0002,
                longitude=lng + (random.random() - 0.5) * 0.0002,
                timestamp=inc.created_at - timedelta(seconds=random.randint(1, 120)),
                incident_id=inc_code
            ))

    # 5. Alerts
    alerts = [
        Alert(alert_code="ALT-101", title="🚨 CRITICAL ACCIDENT DETECTED", message="Bus BUS-104 camera detected road accident near Route R-02. Multi-bus verified.", severity="critical", created_at=datetime.utcnow() - timedelta(minutes=5)),
        Alert(alert_code="ALT-102", title="⚠️ SEVERE POTHOLE CLUSTER", message="Bus BUS-107 & BUS-112 confirmed deep pothole on Mall Road Expressway.", severity="high", created_at=datetime.utcnow() - timedelta(minutes=18)),
        Alert(alert_code="ALT-103", title="📋 WORK ORDER ASSIGNED", message="WO-9024 assigned to Field Team A for immediate repair.", severity="medium", created_at=datetime.utcnow() - timedelta(minutes=42))
    ]
    for a in alerts:
        db.add(a)

    await db.commit()
    print("Database seeding completed successfully!")
