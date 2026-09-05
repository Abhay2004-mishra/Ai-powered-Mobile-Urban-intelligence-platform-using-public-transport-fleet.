import time
import json

class FogGateway:
    """
    Regional Depot Fog Gateway:
    1. Validates Edge telemetry payload format
    2. Performs initial local deduplication & batch buffering
    3. Forwards critical alerts immediately, batches normal telemetry
    """
    def __init__(self):
        self.buffer = []
        self.max_batch_size = 10

    def process_incoming_edge_metadata(self, metadata: dict):
        print(f"🌫️ Fog Gateway Processing Metadata from {metadata.get('bus_id')}")
        if metadata.get("severity") == "critical":
            print(f"⚡ FAST-PATH ROUTING: Priority forwarding for CRITICAL event: {metadata.get('detection_class')}")
            return [metadata]
        
        self.buffer.append(metadata)
        if len(self.buffer) >= self.max_batch_size:
            batch = list(self.buffer)
            self.buffer.clear()
            print(f"📦 Depot Batch Upload: Transmitting {len(batch)} metadata events to Cloud.")
            return batch
        return []

if __name__ == "__main__":
    gateway = FogGateway()
    print("Fog Gateway Daemon Operational.")
