import time
import json
import random
import requests
from datetime import datetime

BACKEND_URL = "http://localhost:8000/api/detections"
BUSES = ["BUS-101", "BUS-104", "BUS-107", "BUS-112", "BUS-118"]
CLASSES = ["pothole", "road_crack", "road_damage", "accident", "obstacle", "traffic_congestion"]

def run_edge_simulator():
    print("🤖 UrbanEye Edge Jetson AI Simulator Running...")
    BASE_LAT = 31.6340
    BASE_LNG = 74.8723

    while True:
        try:
            bus_id = random.choice(BUSES)
            issue = random.choice(CLASSES)
            payload = {
                "bus_id": bus_id,
                "route_id": "R-12",
                "detection_class": issue,
                "confidence": round(random.uniform(0.82, 0.98), 2),
                "severity": "critical" if issue == "accident" else "high",
                "latitude": BASE_LAT + (random.random() - 0.5) * 0.04,
                "longitude": BASE_LNG + (random.random() - 0.5) * 0.04,
                "source": "edge"
            }
            res = requests.post(BACKEND_URL, json=payload, timeout=3)
            if res.status_code == 200:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Edge Detection Emitted: {bus_id} -> {issue} ({payload['confidence']*100}%)")
        except Exception as e:
            print(f"Simulator emission waiting for backend: {e}")
        time.sleep(5)

if __name__ == "__main__":
    run_edge_simulator()
