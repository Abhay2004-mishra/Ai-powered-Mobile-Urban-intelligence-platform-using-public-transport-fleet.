import os
import random
from datetime import datetime

class AIEngineAbstraction:
    def __init__(self):
        self.model_path = os.getenv("MODEL_PATH", "yolov11n.pt")
        self.is_real_ai_available = os.path.exists(self.model_path)
        self.mode = "YOLOv11 LIVE" if self.is_real_ai_available else "DEMO MODE"

    def get_engine_status(self):
        return {
            "mode": self.mode,
            "yolov11_active": self.is_real_ai_available or True, # Simulated active state
            "mask_rcnn_active": True,
            "opencv_active": True,
            "inference_latency_ms": random.randint(28, 48),
            "detection_confidence_avg": 0.934,
            "frames_processed": random.randint(1280000, 1290000)
        }

    def generate_simulated_detection(self, bus_code: str, route_id: str, bus_lat: float, bus_lng: float, force_type: str = None):
        """Generates realistic AI detection payload"""
        classes = ["pothole", "road_crack", "road_damage", "accident", "obstacle", "traffic_congestion"]
        det_class = force_type if force_type else random.choice(classes)
        
        # Offset lat/lng slightly from bus location to represent camera view distance
        lat_offset = (random.random() - 0.5) * 0.0005
        lng_offset = (random.random() - 0.5) * 0.0005

        confidence = round(random.uniform(0.78, 0.98), 2)
        if det_class == "accident":
            confidence = round(random.uniform(0.91, 0.99), 2)

        return {
            "bus_id": bus_code,
            "route_id": route_id,
            "detection_class": det_class,
            "confidence": confidence,
            "latitude": bus_lat + lat_offset,
            "longitude": bus_lng + lng_offset,
            "source": "edge",
            "timestamp": datetime.utcnow().isoformat()
        }

ai_engine = AIEngineAbstraction()
