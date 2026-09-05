def calculate_severity(detection_class: str, confidence: float, multi_bus_verified: bool, confirmations_count: int) -> str:
    """
    Severity Engine Rules:
    - Accident: Always CRITICAL (or HIGH if confidence low)
    - Confidence > 0.90 + Multi-Bus Verified -> CRITICAL
    - Pothole / Obstacle / Road Damage + Confidence > 0.85 -> HIGH
    - Multi-Bus Verified (>= 3 buses) -> Upgrade severity level
    - Road Crack -> MEDIUM / LOW
    """
    if detection_class == "accident":
        return "critical" if confidence >= 0.75 else "high"

    if multi_bus_verified and (confidence >= 0.88 or confirmations_count >= 3):
        return "critical"

    if detection_class in ["pothole", "obstacle", "road_damage"]:
        if confidence >= 0.88 or multi_bus_verified:
            return "high"
        elif confidence >= 0.70:
            return "medium"
        else:
            return "low"

    if detection_class == "traffic_congestion":
        return "high" if confidence >= 0.85 else "medium"

    if detection_class == "road_crack":
        return "medium" if confidence >= 0.80 else "low"

    return "medium" if confidence >= 0.80 else "low"
