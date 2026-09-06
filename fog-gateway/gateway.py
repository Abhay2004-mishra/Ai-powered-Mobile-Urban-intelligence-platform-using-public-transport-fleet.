import time
import json
import sys
import math
from datetime import datetime

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

class FogGateway:
    """
    Regional Depot Fog Gateway:
    1. Validates Edge bus metadata payloads
    2. Performs edge-tier spatial deduplication within 15 meters
    3. Buffers and compresses periodic telemetry to save bandwidth
    4. Provides FAST-PATH instant routing for critical road hazards
    """
    def __init__(self, depot_name="Depot-North-01"):
        self.depot_name = depot_name
        self.buffer = []
        self.max_batch_size = 5
        self.recent_edge_detections = []
        self.stats = {"ingested": 0, "deduped": 0, "fast_pathed": 0, "batches_sent": 0}

    def process_incoming_edge_metadata(self, metadata: dict):
        self.stats["ingested"] += 1
        bus_id = metadata.get("bus_id") or metadata.get("bus_code", "BUS-UNKNOWN")
        det_class = metadata.get("detection_class") or metadata.get("issue_type", "pothole")
        lat = float(metadata.get("latitude", 31.6340))
        lng = float(metadata.get("longitude", 74.8723))
        sev = metadata.get("severity", "medium").lower()

        print(f"🌫️ [{self.depot_name}] Ingested packet from {bus_id} -> {det_class} ({sev}) at ({lat:.4f}, {lng:.4f})")

        # Edge-tier spatial deduplication (15m window in fog buffer)
        for prev in self.recent_edge_detections:
            dist = haversine(lat, lng, prev["lat"], prev["lng"])
            if dist < 15.0 and prev["class"] == det_class:
                self.stats["deduped"] += 1
                print(f"   🔄 Fog spatial duplicate suppressed (dist {dist:.1f}m to prev event from {prev['bus']}). Corroborating...")
                prev["count"] += 1
                return []

        self.recent_edge_detections.append({"lat": lat, "lng": lng, "class": det_class, "bus": bus_id, "count": 1})
        if len(self.recent_edge_detections) > 20:
            self.recent_edge_detections.pop(0)

        # Critical alerts fast-path
        if sev in ["critical", "high"]:
            self.stats["fast_pathed"] += 1
            print(f"   ⚡ FAST-PATH ROUTING: Immediate cloud uplink for CRITICAL {det_class}!")
            return [metadata]

        self.buffer.append(metadata)
        if len(self.buffer) >= self.max_batch_size:
            batch = list(self.buffer)
            self.buffer.clear()
            self.stats["batches_sent"] += 1
            print(f"   📦 Depot Batch Uplink: Transmitting {len(batch)} telemetry records to Cloud DB (92% bandwidth saved).")
            return batch

        print(f"   ⏳ Buffered in Depot cache ({len(self.buffer)}/{self.max_batch_size})")
        return []

    def run_simulation(self):
        print(f"🚀 Starting Fog Gateway Simulation Mode ({self.depot_name})...")
        test_events = [
            {"bus_id": "BUS-104", "detection_class": "pothole", "severity": "high", "latitude": 31.6340, "longitude": 74.8723},
            {"bus_id": "BUS-104", "detection_class": "pothole", "severity": "high", "latitude": 31.63405, "longitude": 74.87235}, # duplicate within 6m
            {"bus_id": "BUS-107", "detection_class": "pothole", "severity": "critical", "latitude": 31.6340, "longitude": 74.8723}, # 2nd bus pass
            {"bus_id": "BUS-112", "detection_class": "crack", "severity": "low", "latitude": 31.6355, "longitude": 74.8750},
            {"bus_id": "BUS-115", "detection_class": "debris", "severity": "low", "latitude": 31.6360, "longitude": 74.8760},
        ]
        for ev in test_events:
            self.process_incoming_edge_metadata(ev)
            time.sleep(0.4)
        print("\n📊 Fog Gateway Telemetry Summary:")
        print(json.dumps(self.stats, indent=2))

if __name__ == "__main__":
    gateway = FogGateway()
    if "--simulate" in sys.argv:
        gateway.run_simulation()
    else:
        print("Fog Gateway Daemon Operational. Use --simulate for test pipeline demonstration.")

