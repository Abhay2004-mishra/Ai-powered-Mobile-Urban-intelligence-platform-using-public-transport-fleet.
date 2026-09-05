from fastapi import APIRouter

router = APIRouter(prefix="/api/privacy", tags=["Privacy & Security"])

@router.get("/status")
async def get_privacy_status():
    return {
        "raw_video_retention": "OFF (Edge Processing Only)",
        "face_processing": "Edge Anonymized / Blurred via OpenCV",
        "cloud_video_storage": "Disabled",
        "metadata_encryption": "Enabled (AES-256 / TLS 1.3)",
        "bandwidth_optimization": {
            "raw_video_stream_mb_per_min": 150.0,
            "urbaneye_metadata_kb_per_min": 1.2,
            "bandwidth_saved_percent": 99.99
        },
        "privacy_pipeline": [
            {"step": 1, "title": "Camera Capture", "detail": "Raw 1080p camera feed inside public transport bus"},
            {"step": 2, "title": "Edge AI Inference", "detail": "YOLOv11 detects road features on Jetson TPU"},
            {"step": 3, "title": "Local Anonymization", "detail": "License plates and faces masked before storage"},
            {"step": 4, "title": "Metadata Extraction", "detail": "Only JSON tags (lat, lng, class, confidence) created"},
            {"step": 5, "title": "Cloud Upload", "detail": "~1KB encrypted JSON transmitted over MQTT"}
        ]
    }
