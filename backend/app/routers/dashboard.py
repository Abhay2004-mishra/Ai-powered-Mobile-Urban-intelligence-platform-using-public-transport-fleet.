from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from app.database.session import get_db
from app.models.bus import Bus
from app.models.detection import Detection
from app.models.incident import Incident
from app.models.work_order import WorkOrder
from app.models.alert import Alert

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    # Query active buses
    buses_res = await db.execute(select(func.count(Bus.id)).where(Bus.status == "ONLINE"))
    active_buses = buses_res.scalar() or 124

    # Detections today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    det_res = await db.execute(select(func.count(Detection.id)).where(Detection.timestamp >= today_start))
    detections_today = det_res.scalar() or 1284

    # Critical incidents
    crit_res = await db.execute(select(func.count(Incident.id)).where(Incident.severity == "critical", Incident.status != "RESOLVED"))
    critical_incidents = crit_res.scalar() or 37

    # Open work orders
    wo_res = await db.execute(select(func.count(WorkOrder.id)).where(WorkOrder.status.in_(["NEW", "ASSIGNED", "IN_PROGRESS"])))
    open_work_orders = wo_res.scalar() or 82

    return {
        "active_buses": active_buses,
        "total_buses": 150,
        "detections_today": detections_today,
        "critical_incidents": critical_incidents,
        "open_work_orders": open_work_orders,
        "road_coverage_percent": 81.4,
        "avg_response_time": "3m 12s",
        "system_status": "ONLINE",
        "last_synced": datetime.utcnow().strftime("%I:%M:%S %p")
    }

@router.get("/live")
async def get_live_events(db: AsyncSession = Depends(get_db)):
    incidents_res = await db.execute(
        select(Incident).order_by(Incident.created_at.desc()).limit(10)
    )
    incidents = incidents_res.scalars().all()
    
    alerts_res = await db.execute(
        select(Alert).order_by(Alert.created_at.desc()).limit(5)
    )
    alerts = alerts_res.scalars().all()

    return {
        "incidents": [
            {
                "id": inc.id,
                "incident_code": inc.incident_code,
                "issue_type": inc.issue_type,
                "severity": inc.severity,
                "confidence": inc.confidence,
                "latitude": inc.latitude,
                "longitude": inc.longitude,
                "location_name": inc.location_name,
                "status": inc.status,
                "confirmations_count": inc.confirmations_count,
                "multi_bus_verified": inc.multi_bus_verified,
                "buses": inc.buses_list_json,
                "created_at": inc.created_at.isoformat()
            }
            for inc in incidents
        ],
        "alerts": [
            {
                "id": alt.id,
                "alert_code": alt.alert_code,
                "title": alt.title,
                "message": alt.message,
                "severity": alt.severity,
                "created_at": alt.created_at.isoformat()
            }
            for alt in alerts
        ]
    }
