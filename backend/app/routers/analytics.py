from fastapi import APIRouter

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/summary")
async def get_analytics_summary():
    return {
        "sih_target_metrics": {
            "pothole_detection_speedup": "21× Faster Pothole Detection",
            "inspection_cost_reduction": "90% Lower Road Inspection Cost",
            "accident_response_speedup": "10× Faster Accident Response",
            "daily_road_coverage": "80% Daily Road Coverage",
            "fuel_savings": "12% Fuel Savings"
        },
        "detection_trends": [
            {"day": "Mon", "potholes": 142, "accidents": 4, "road_damage": 88, "obstacles": 24},
            {"day": "Tue", "potholes": 168, "accidents": 2, "road_damage": 94, "obstacles": 31},
            {"day": "Wed", "potholes": 195, "accidents": 5, "road_damage": 112, "obstacles": 19},
            {"day": "Thu", "potholes": 154, "accidents": 3, "road_damage": 80, "obstacles": 28},
            {"day": "Fri", "potholes": 210, "accidents": 6, "road_damage": 130, "obstacles": 42},
            {"day": "Sat", "potholes": 235, "accidents": 4, "road_damage": 145, "obstacles": 38},
            {"day": "Sun", "potholes": 180, "accidents": 1, "road_damage": 105, "obstacles": 22}
        ],
        "category_distribution": [
            {"name": "Potholes", "value": 1284, "color": "#ef4444"},
            {"name": "Road Cracks", "value": 856, "color": "#f97316"},
            {"name": "Road Damage", "value": 620, "color": "#eab308"},
            {"name": "Traffic Congestion", "value": 412, "color": "#3b82f6"},
            {"name": "Obstacles", "value": 204, "color": "#a855f7"},
            {"name": "Accidents", "value": 37, "color": "#dc2626"}
        ],
        "severity_distribution": [
            {"severity": "Critical", "count": 37, "color": "#dc2626"},
            {"severity": "High", "count": 184, "color": "#f97316"},
            {"severity": "Medium", "count": 512, "color": "#eab308"},
            {"severity": "Low", "count": 551, "color": "#22c55e"}
        ],
        "response_time_comparison": [
            {"stage": "Detection", "traditional_hours": 168.0, "urbaneye_hours": 0.05},  # 7 days vs 3 mins
            {"stage": "Verification", "traditional_hours": 48.0, "urbaneye_hours": 0.1},
            {"stage": "Work Order", "traditional_hours": 24.0, "urbaneye_hours": 0.01},
            {"stage": "Dispatch", "traditional_hours": 12.0, "urbaneye_hours": 0.5}
        ]
    }
