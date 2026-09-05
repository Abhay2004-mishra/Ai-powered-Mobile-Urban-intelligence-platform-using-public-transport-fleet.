from sqlalchemy import Column, Integer, String, Float, Text
from app.database.base import Base

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    route_code = Column(String, unique=True, index=True, nullable=False) # R-12
    route_name = Column(String, nullable=False) # GT Road Circular Express
    start_point = Column(String, nullable=False)
    end_point = Column(String, nullable=False)
    distance_km = Column(Float, default=15.4)
    assigned_buses_count = Column(Integer, default=5)
    daily_trips = Column(Integer, default=24)
    coverage_percent = Column(Float, default=85.0)
    waypoints_json = Column(Text, nullable=True) # JSON string of lat/lng pairs defining route path
