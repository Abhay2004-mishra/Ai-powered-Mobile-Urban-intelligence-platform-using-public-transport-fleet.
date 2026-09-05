# UrbanEye AI — Mobile Urban Intelligence Platform

**Smart India Hackathon 2026**  
**Problem Statement ID:** 26124  
**Theme:** Smart Automation | **Category:** Software  
**Team:** Code Crew  

---

## 🚀 Product Vision

**UrbanEye AI** transforms existing public transport bus fleets into a distributed, mobile smart-city sensing network. Instead of deploying expensive fixed CCTV infrastructure across thousands of municipal road segments, bus-mounted edge AI cameras continuously monitor roads while buses operate on scheduled transit routes.

The system automatically detects:
- Potholes & Road Cracks
- Road Structural Damage
- Traffic Congestion & Road Obstacles
- Traffic Accidents
- Vehicles & Pedestrians

Every detection is tagged with **GPS coordinates, timestamps, bus ID, route ID, confidence score, and severity**, and streamed to a centralized **Municipal Command Center**.

---

## 🏗 Target Architecture

```text
                  PUBLIC TRANSPORT BUS
                         │
              ┌──────────▼──────────┐
              │ Camera / Video Feed │
              └──────────┬──────────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ EDGE AI DEVICE │ (NVIDIA Jetson / Coral TPU)
                 │ YOLOv11 Engine│
                 └───────┬───────┘
                         │ (GPS + Timestamp)
                         ▼
                 ┌───────────────┐
                 │  FOG GATEWAY  │ (Depot / WiFi / Edge Batch)
                 │ Deduplication │
                 └───────┬───────┘
                         │ (~1KB Encrypted Metadata JSON)
                         ▼
                 ┌───────────────┐
                 │ CLOUD BACKEND │ (FastAPI + Async SQLAlchemy)
                 │ Severity Rules│
                 └───────┬───────┘
                         │ (WebSocket Broadcast)
                         ▼
               ┌───────────────────────────┐
               │ REACT MUNICIPAL DASHBOARD │ (Command Center UI)
               └───────────────────────────┘
```

---

## 🛠 Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Leaflet / Mapbox GL JS, Recharts, Axios, Lucide Icons.
- **Backend**: Python 3.10+, FastAPI, Pydantic, SQLAlchemy 2.0 (Async), Uvicorn.
- **Database**: PostgreSQL + PostGIS (with zero-dependency Async SQLite fallback).
- **AI Engine**: YOLOv11 + Mask R-CNN abstraction layer (Mode 1 Live Inference / Mode 2 Synthetic Edge Simulator).
- **Messaging**: MQTT (Mosquitto) + WebSockets.
- **Infrastructure**: Docker, Docker Compose, Environment Variables.

---

## 🔑 Demo Credentials

Log in with any of the demo accounts below:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Admin** | `admin@urbaneye.ai` | `demo` | Full system, fleet, route, and user control |
| **Municipal Officer** | `officer@urbaneye.ai` | `demo` | Command map, incident triage, work order dispatch |
| **Field Worker** | `worker@urbaneye.ai` | `demo` | Assigned work orders, status updates, completion proof |
| **Bus Operator** | `operator@urbaneye.ai` | `demo` | Assigned bus telemetry, camera status, route details |

---

## 🎬 SIH Interactive Demo Workflow

Click **`START SIH DEMO`** on the top bar of the command dashboard to execute the complete 15-stage automated pipeline:

```text
1. CAMERA FEED (Bus BUS-104 captures 1080p frame)
   ↓
2. EDGE AI (YOLOv11 detects Severe Pothole with 94% confidence)
   ↓
3. GPS TAGGING (Lat 31.6340, Lng 74.8723 tagged on Route R-12)
   ↓
4. MQTT TRANSMISSION (~1KB metadata JSON emitted to topic urbaneye/bus/BUS-104/detections)
   ↓
5. FOG GATEWAY (Depot gateway receives payload and validates schema)
   ↓
6. DEDUPLICATION (Spatial engine matches observations from BUS-101, BUS-104, BUS-107)
   ↓
7. SEVERITY ENGINE (Calculates CRITICAL rating due to multi-bus verification + high traffic)
   ↓
8. INCIDENT CREATION (Incident #INC-1024 marked as MULTI-BUS VERIFIED)
   ↓
9. REAL-TIME ALERT (🚨 Alert broadcasted to Municipal Command Center)
   ↓
10. AUTO WORK ORDER (Work Order #WO-9041 dispatched to Field Team A with 30m SLA)
   ↓
11. FIELD RESOLUTION (Worker updates status to RESOLVED with evidence notes)
   ↓
12. ANALYTICS UPDATE (System KPIs & response time charts dynamically refresh)
```

---

## 💻 Quick Start (Local Setup)

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

To launch all services (PostgreSQL, MQTT, FastAPI Backend, React Frontend):

```bash
docker compose up --build
```

---

## 📊 SIH Target Impact Metrics

- **21× Faster Pothole Detection** (3 minutes vs traditional 7 days manual complaints)
- **90% Lower Road Inspection Cost** (Leverages existing bus fleet instead of static cameras)
- **10× Faster Accident Response** (Automatic alert dispatch within seconds)
- **80% Daily City Road Coverage** (Continuous transit route coverage)
- **12% Fuel Savings** (Optimized municipal repair dispatch routes)
