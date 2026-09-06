import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Camera, 
  Cpu, 
  Radio, 
  Eye, 
  RotateCw, 
  Maximize2, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  Play, 
  Pause, 
  Award, 
  Clock, 
  ShieldCheck, 
  Target, 
  MapPin, 
  Navigation, 
  Wifi, 
  RefreshCw, 
  CheckCheck, 
  Wrench, 
  Bus, 
  Send 
} from 'lucide-react';
import api from '../services/api';

// The Exact 9-Step 90–120 Second Autonomous Defect Lifecycle Demo Flow
export const DEMO_FLOW_STAGES = [
  {
    step: 1,
    title: 'Play Bus-Camera Footage',
    badge: 'STAGE 1: LIVE ONBOARD STREAM',
    subtitle: 'Front 1080p HDR Road-Surface Camera Stream Active',
    cameraView: { pos: [-5.8, 3.4, 7.2], target: [0.0, 1.4, 0.6] },
    highlight: 'camera',
    duration: 12,
    icon: Camera,
    color: '#38bdf8',
    summary: 'Bus-mounted optical vision pod streams live forward asphalt footage into volatile edge RAM.',
    details: {
      busId: 'BUS-104 (Tata Ultra EV Smart Fleet)',
      sensor: 'Sony STARVIS 2 IMX585 • 1080p HDR @ 30 FPS',
      specs: '120° Wide FOV • Sub-centimeter Surface Resolution',
      route: 'Route R-02 (Mall Road ⇄ Civil Hospital)',
      speed: '41.8 km/h • Heading 142° SE',
      action: 'Bus cruises along transit corridor. Roof camera continuously buffers optical frames for AI evaluation.'
    }
  },
  {
    step: 2,
    title: 'Show AI Detecting a Pothole',
    badge: 'STAGE 2: YOLOV11s-SEG INFERENCE',
    subtitle: 'Real-Time Edge AI Surface Fracture & Depth Caliper Lock',
    cameraView: { pos: [1.8, 1.85, 7.6], target: [0.0, 0.2, 6.2] },
    highlight: 'pothole',
    duration: 12,
    icon: Target,
    color: '#ef4444',
    summary: 'YOLOv11s-Seg detects asphalt crater in 28.4ms, calculating depth and asphalt repair volume.',
    details: {
      model: 'YOLOv11s-Seg (TensorRT INT8 Onboard Engine)',
      inferenceTime: '28.4 ms (35.2 FPS local throughput)',
      confidence: '96.4% Detection Confidence',
      defectType: 'ROAD_POTHOLE (Class ID: #01 - High Severity)',
      caliperMetrics: 'Measured Depth: 58mm • Infill Volume: 14.8 Liters',
      action: 'LiDAR laser sweeps surface depression; 3D vertical depth gauge caliper locks crater 6.2m ahead.'
    }
  },
  {
    step: 3,
    title: 'Show GPS / Time / Bus ID',
    badge: 'STAGE 3: TELEMETRY & RTK-GPS SYNC',
    subtitle: 'Microsecond Synchronized Sub-Meter Coordinate Tagging',
    cameraView: { pos: [-2.6, 3.6, 0.8], target: [0.0, 2.3, 0.0] },
    highlight: 'gps',
    duration: 12,
    icon: Navigation,
    color: '#f59e0b',
    summary: 'Atomic time clock & dual-frequency RTK-GPS pinpoints exact location to within 15 centimeters.',
    details: {
      busId: 'BUS-104 (Smart Transit Fleet)',
      driver: 'Rajesh Kumar (Duty ID: DRV-8821)',
      gpsCoords: '31.634218° N, 74.872845° E (±0.12m RTK Accuracy)',
      timestamp: '2026-09-06 12:02:45.312 UTC+05:30',
      speedBearing: '41.8 km/h • 142° SE Heading',
      action: 'Edge processor creates spatial metadata packet associating defect vector with bus telemetry.'
    }
  },
  {
    step: 4,
    title: 'Send Event to Backend',
    badge: 'STAGE 4: MQTT OVER 5G / 4G TRANSMIT',
    subtitle: 'Encrypted Micro-Packet Transmission (DPDP 2023 Compliant)',
    cameraView: { pos: [0.0, 4.8, -3.6], target: [0.0, 2.4, -1.0] },
    highlight: 'network',
    duration: 12,
    icon: Send,
    color: '#ec4899',
    summary: 'Roof shark-fin antenna transmits 0.86 KB encrypted JSON packet; raw video immediately purged.',
    details: {
      protocol: 'MQTT v5.0 over TLS 1.3 (Dual SIM 5G/LTE)',
      packetSize: '0.86 KB (Lightweight JSON, 99.99% Bandwidth Saved)',
      privacy: 'DPDP Act 2023 Compliant: No citizen video uploaded',
      topic: 'urbaneye/fleet/bus-104/detections/pothole',
      cloudAck: '200 OK • Fast-API Ingest Latency: 18.2 ms',
      action: 'Pulsing radio wave radiates from antenna. Structured telemetry streams directly to Cloud Core.'
    }
  },
  {
    step: 5,
    title: 'Show Defect on GIS Map',
    badge: 'STAGE 5: MUNICIPAL GIS POPULATION',
    subtitle: 'Spatial Geolocation Placed on City Command Infrastructure Grid',
    cameraView: { pos: [6.8, 8.5, 6.0], target: [0.0, 0.0, 4.0] },
    highlight: 'gis',
    duration: 12,
    icon: MapPin,
    color: '#3b82f6',
    summary: 'Defect plotted on Amritsar Municipal GIS Command grid with route corridor clustering tag.',
    details: {
      incidentCode: 'INC-2026-09041',
      gisLayer: 'Amritsar Smart City Road Infrastructure Layer',
      roadSegment: 'Mall Road Arterial Corridor #12 (Ward 14)',
      initialStatus: 'UNVERIFIED (Single Fleet Observation: 96.4%)',
      spatialCluster: 'Dynamic 15m Geofence Active (Awaiting Secondary Bus)',
      action: 'GIS system plots active defect beacon. Visual warning appears in municipal command center.'
    }
  },
  {
    step: 6,
    title: 'Simulate a Second Bus Detecting Same Location',
    badge: 'STAGE 6: MULTI-BUS FLEET CONVERGENCE',
    subtitle: 'Bus BUS-112 Traverses Coordinates & Initiates Corroboration',
    cameraView: { pos: [8.8, 4.6, 7.8], target: [0.0, 1.2, 4.5] },
    highlight: 'secondBus',
    duration: 13,
    icon: Bus,
    color: '#a855f7',
    summary: 'Second transit bus (BUS-112) approaches in adjacent lane and scans the identical road coordinate.',
    details: {
      primaryBus: 'BUS-104 (First Observation @ 12:02:45)',
      secondaryBus: 'BUS-112 (Second Observation @ 12:07:18)',
      secondaryModel: 'YOLOv11s-Seg (97.8% Confidence)',
      distanceDelta: '0.64 meters (<15m Spatial Deduplication Threshold)',
      action: 'BUS-112 appears in 3D scene in adjacent lane; its vision cone sweeps the exact same pothole.'
    }
  },
  {
    step: 7,
    title: 'Observations Merged & Priority Updated',
    badge: 'STAGE 7: FOG DEDUPLICATION & SLA DISPATCH',
    subtitle: 'Spatial Clustering Reaches 99.8% Consensus → Auto Work Order',
    cameraView: { pos: [4.2, 4.0, 5.2], target: [0.0, 1.0, 5.0] },
    highlight: 'merged',
    duration: 13,
    icon: Zap,
    color: '#f59e0b',
    summary: 'Fog Gateway correlates dual-bus readings, upgrades priority to CRITICAL, and dispatches PWD work order.',
    details: {
      algorithm: 'Fog Gateway Spatio-Temporal Deduplication Engine',
      clusterRadius: '15.0 Meter Dynamic Geofence Correlated',
      mergedConsensus: '96.4% + 97.8% → 99.8% Multi-Bus Verified',
      priorityUpdate: 'MEDIUM → MULTI-BUS VERIFIED CRITICAL',
      workOrder: 'Auto-dispatched WO-9041 to PWD Rapid Response Crew #3',
      slaCountdown: '30-Minute Repair SLA Active',
      action: '15m spatial cluster ring locks around pothole. Auto work order dispatches to field repair team.'
    }
  },
  {
    step: 8,
    title: 'Mark Repair Complete',
    badge: 'STAGE 8: PWD WORK ORDER RESOLUTION',
    subtitle: 'Field Team Applies Hot-Mix Asphalt & Closes Municipal SLA',
    cameraView: { pos: [1.2, 1.8, 6.8], target: [0.0, 0.15, 6.2] },
    highlight: 'repairComplete',
    duration: 12,
    icon: Wrench,
    color: '#10b981',
    summary: 'Crater filled with hot-mix bitumen. 3D surface transforms into smooth asphalt with green municipal seal.',
    details: {
      workOrder: 'WO-9041 (Assigned to Field Unit Team #3)',
      actionTaken: 'Hot-Mix Bitumen Compaction & Sealant Infill',
      repairTime: 'Completed in 21m 40s (Target: <30m SLA Met)',
      visualState: 'Asphalt crater replaced with smooth green-sealed municipal patch',
      technicianSignoff: 'Verified by PWD Field Supervisor A. Sharma',
      action: '3D crater depression fills with fresh smooth dark bitumen and emerald green completion ring.'
    }
  },
  {
    step: 9,
    title: 'Simulate a Later Bus Pass',
    badge: 'STAGE 9: AUTONOMOUS AUDIT & TICKET CLOSURE',
    subtitle: 'Later Bus BUS-107 Scans Coordinates 3 Hours Later to Verify Quality',
    cameraView: { pos: [3.2, 2.6, 3.8], target: [0.0, 0.8, 6.0] },
    highlight: 'laterBus',
    duration: 12,
    icon: CheckCheck,
    color: '#06b6d4',
    summary: 'Third bus sweeps across repaired coordinate 3 hours later. AI confirms 0mm depth and permanently closes ticket.',
    details: {
      auditingBus: 'BUS-107 (Scheduled Route R-02 Transit Run, +3 Hours)',
      surfaceScan: '0mm Depth Fracture • Smoothness Index IRI: 1.15 (Optimal)',
      aiVerdict: 'DEFECT RESOLVED • NO RE-OCCURRENCE DETECTED',
      lifecycle: 'Complete Closed Loop: Detect → Merge → Dispatch → Repair → AI Audit',
      auditResult: '100% Objective Autonomous Municipal Governance',
      action: 'Green laser scanner sweeps repaired asphalt, confirms 0mm depth, and marks ticket AUDITED & CLOSED.'
    }
  }
];

const SENSORS_DATA = [
  {
    id: 'frontCamera',
    name: 'Front AI Camera Pod',
    type: 'Forward Road Defect Scanner',
    specs: '1080p HDR @ 30 FPS • 120° Wide FOV',
    position: 'Top Windshield / Roof Front',
    target: 'Potholes, Cracks, Road Debris',
    status: 'ACTIVE_INFERENCE',
    fps: 29.8,
    latency: '28.4 ms',
    model: 'YOLOv11s-Seg',
    confidence: '96.4%',
    color: '#00f0ff',
    coords: [0, 2.75, 3.8],
    camView: { pos: [0, 2.5, 7.8], target: [0, 0.5, 0] }
  },
  {
    id: 'rearCamera',
    name: 'Rear Safety Camera Pod',
    type: 'Collision & Tailgating Sensor',
    specs: '1080p @ 30 FPS • 140° Ultra-Wide FOV',
    position: 'Top Rear Center Header',
    target: 'Rear Collisions & Hit-and-Run Tracking',
    status: 'STREAMING',
    fps: 30.0,
    latency: '22.1 ms',
    model: 'YOLOv11n',
    confidence: '98.1%',
    color: '#f59e0b',
    coords: [0, 2.75, -4.05],
    camView: { pos: [0, 2.5, -7.8], target: [0, 0.5, 0] }
  },
  {
    id: 'edgeCompute',
    name: 'Roof Edge AI Compute Box',
    type: 'NVIDIA Jetson Orin Nano (8GB)',
    specs: '40 TOPS INT8 AI Inference • IP67 Rugged',
    position: 'Roof Center Equipment Bay',
    target: 'Real-time YOLOv11 TensorRT Edge Execution',
    status: '42.6°C • NORMAL',
    fps: 30.0,
    latency: '28.4 ms (Avg)',
    model: 'TensorRT FP16',
    confidence: 'Zero Cloud Dependency',
    color: '#06b6d4',
    coords: [0, 2.85, 0.4],
    camView: { pos: [2.5, 4.8, 2.5], target: [0, 2.2, 0] }
  },
  {
    id: 'lteGpsAntenna',
    name: '4G/5G LTE & RTK-GPS Antenna',
    type: 'Multi-Band High Precision Telemetry',
    specs: 'Dual SIM 5G • Sub-Meter RTK GPS (<15cm error)',
    position: 'Roof Rear Shark-Fin Mount',
    target: 'MQTT Stream (~0.9KB JSON) + Microsecond Clock',
    status: 'CONNECTED (18ms Latency)',
    fps: '10 Hz GPS',
    latency: 'MQTT <1KB JSON',
    model: 'AES-256 Encrypted',
    confidence: 'DPDP 2023 Compliant',
    color: '#ec4899',
    coords: [0, 2.85, -2.5],
    camView: { pos: [0, 4.8, -5.2], target: [0, 2.0, -1.0] }
  }
];

const Bus3DViewer = ({ busCode = 'BUS-104', height = '580px' }) => {
  const mountRef = useRef(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [elapsedTotalSec, setElapsedTotalSec] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [showCones, setShowCones] = useState(true);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(SENSORS_DATA[0]);

  // Three.js object references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const busGroupRef = useRef(null);
  const bus2GroupRef = useRef(null);
  const conesGroupRef = useRef(null);
  const cones2GroupRef = useRef(null);
  const potholeCraterRef = useRef(null);
  const potholeHaloRef = useRef(null);
  const potholeCaliperRef = useRef(null);
  const potholeTargetDiscRef = useRef(null);
  const laserScannerRef = useRef(null);
  const dedupRingRef = useRef(null);
  const antennaPulseRef = useRef([]);
  const dataPacketsRef = useRef(null);
  const roadMarkingsRef = useRef([]);
  const materialsRef = useRef([]);

  const controlsRef = useRef(null);
  const isTransitioningRef = useRef(true);
  const isUserInteractingRef = useRef(false);
  const targetCamPos = useRef(new THREE.Vector3(-5.8, 3.4, 7.2));
  const targetLookAt = useRef(new THREE.Vector3(0.0, 1.4, 0.6));

  const activeStage = DEMO_FLOW_STAGES[currentStepIdx];

  // Real-time Cloud & MQTT Backend Synchronization State
  const [backendSync, setBackendSync] = useState({
    active: true,
    step: 1,
    status: 'SYSTEM_READY',
    topic: 'urbaneye/fleet/bus-104/detections/pothole',
    incidentCode: 'INC-1024',
    workOrderCode: 'WO-9041',
    confirmations: 1,
    multiBusVerified: false,
    timestamp: null
  });

  // Wire Step transitions to real FastAPI cloud database mutations & MQTT events
  useEffect(() => {
    const step = activeStage.step;
    const triggerBackendAction = async () => {
      try {
        if (step === 4) {
          setBackendSync(prev => ({ ...prev, status: 'PUBLISHING_MQTT', step: 4 }));
          const res = await api.post('/api/simulation/convoy_scan', {
            bus_code: busCode || 'BUS-104',
            route_id: 'R-12',
            latitude: 31.6340,
            longitude: 74.8723,
            detection_class: 'pothole',
            confidence: 0.964,
            severity: 'high',
            depth_estimate: '58mm',
            corroboration_pass: 1
          });
          if (res?.data) {
            setBackendSync({
              active: true,
              step: 4,
              status: 'CLOUD_ACK_200',
              topic: res.data.mqtt_topic,
              incidentCode: res.data.incident_code || 'INC-1024',
              workOrderCode: res.data.work_order_code || 'WO-9041',
              confirmations: res.data.confirmations_count || 1,
              multiBusVerified: res.data.multi_bus_verified || false,
              timestamp: new Date().toLocaleTimeString()
            });
          }
        } else if (step === 6 || step === 7) {
          setBackendSync(prev => ({ ...prev, status: 'CORROBORATING_SECOND_BUS', step }));
          const res = await api.post('/api/simulation/convoy_scan', {
            bus_code: 'BUS-112',
            route_id: 'R-12',
            latitude: 31.6340,
            longitude: 74.8723,
            detection_class: 'pothole',
            confidence: 0.978,
            severity: 'critical',
            depth_estimate: '58mm',
            corroboration_pass: 2
          });
          if (res?.data) {
            setBackendSync({
              active: true,
              step,
              status: 'MULTI_BUS_CORROBORATED',
              topic: res.data.mqtt_topic,
              incidentCode: res.data.incident_code || 'INC-1024',
              workOrderCode: res.data.work_order_code || 'WO-9041',
              confirmations: res.data.confirmations_count || 2,
              multiBusVerified: true,
              timestamp: new Date().toLocaleTimeString()
            });
          }
        } else if (step === 8) {
          setBackendSync(prev => ({ ...prev, status: 'RESOLVING_INCIDENT', step: 8 }));
          const res = await api.post('/api/simulation/resolve_incident', {
            incident_code: backendSync.incidentCode || undefined,
            work_order_code: backendSync.workOrderCode || undefined,
            repaired_by: 'PWD Rapid Response Crew #3',
            resolution_notes: 'Hot-mix bitumen infill and roller compaction verified.'
          });
          if (res?.data) {
            setBackendSync(prev => ({
              ...prev,
              step: 8,
              status: 'RESOLVED_CLOSED',
              topic: 'urbaneye/work_order/resolved',
              incidentCode: res.data.incident_code || prev.incidentCode,
              workOrderCode: res.data.work_order_code || prev.workOrderCode,
              timestamp: new Date().toLocaleTimeString()
            }));
          }
        } else if (step === 9) {
          setBackendSync(prev => ({
            ...prev,
            step: 9,
            status: 'AUDITED_AND_VERIFIED',
            topic: 'urbaneye/fleet/bus-107/audit/verified',
            timestamp: new Date().toLocaleTimeString()
          }));
        }
      } catch (err) {
        console.warn('Backend 3D sync non-critical warning:', err);
      }
    };

    triggerBackendAction();
  }, [currentStepIdx]);

  // 90–120 Second Auto-Play Demo Flow Engine
  useEffect(() => {
    let timer;
    let progressInterval;
    if (isAutoPlaying) {
      const stepDurationMs = (activeStage.duration || 12) * 1000;
      const startTime = Date.now();

      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, (elapsed / stepDurationMs) * 100);
        setStepProgress(pct);
        setElapsedTotalSec((prev) => prev + 0.1);
      }, 100);

      timer = setTimeout(() => {
        setStepProgress(0);
        if (currentStepIdx < DEMO_FLOW_STAGES.length - 1) {
          setCurrentStepIdx((prev) => prev + 1);
        } else {
          // Completed full 90-120s loop!
          setIsAutoPlaying(false);
          setStepProgress(0);
        }
      }, stepDurationMs);
    } else {
      setStepProgress(0);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [isAutoPlaying, currentStepIdx]);

  // Sync Camera and 3D visual states whenever the Step changes
  useEffect(() => {
    if (activeStage && activeStage.cameraView) {
      targetCamPos.current.set(...activeStage.cameraView.pos);
      targetLookAt.current.set(...activeStage.cameraView.target);
      isTransitioningRef.current = true;
    }

    const step = activeStage.step;

    // 1. Second Bus Visibility (Step 6 & Step 7)
    if (bus2GroupRef.current) {
      bus2GroupRef.current.visible = (step === 6 || step === 7);
    }

    // 2. Spatial Deduplication Geofence Ring (Step 7)
    if (dedupRingRef.current) {
      dedupRingRef.current.visible = (step === 7);
    }

    // 3. Pothole Visual State (Repaired in Step 8 & 9)
    if (potholeCraterRef.current && potholeHaloRef.current && potholeCaliperRef.current && potholeTargetDiscRef.current) {
      if (step >= 8) {
        // REPAIRED STATE: Fresh smooth asphalt + Emerald Green Seal + 0mm Depth
        potholeCraterRef.current.material.color.setHex(0x1e293b);
        potholeCraterRef.current.material.roughness = 0.3;
        potholeHaloRef.current.material.color.setHex(0x10b981);
        potholeCaliperRef.current.scale.set(1, 0.05, 1);
        potholeCaliperRef.current.material.color.setHex(0x10b981);
        potholeTargetDiscRef.current.position.y = 0.1;
        potholeTargetDiscRef.current.material.color.setHex(0x10b981);
      } else {
        // UNREPAIRED HAZARD STATE: Alarming dark crater + Red Halo + 58mm Caliper
        potholeCraterRef.current.material.color.setHex(0x1a0505);
        potholeCraterRef.current.material.roughness = 0.9;
        potholeHaloRef.current.material.color.setHex(0xef4444);
        potholeCaliperRef.current.scale.set(1, 1.0, 1);
        potholeCaliperRef.current.material.color.setHex(0xef4444);
        potholeTargetDiscRef.current.position.y = 1.4;
        potholeTargetDiscRef.current.material.color.setHex(0xef4444);
      }
    }

    // 4. Laser Scanner Color (Green in Step 9 for audit, Cyan elsewhere)
    if (laserScannerRef.current) {
      if (step === 9) {
        laserScannerRef.current.material.color.setHex(0x10b981);
      } else {
        laserScannerRef.current.material.color.setHex(0x00f0ff);
      }
    }
  }, [currentStepIdx]);

  // Three.js Scene Setup & Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const currentHeight = container.clientHeight || 580;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.Fog(0x060913, 22, 65);
    sceneRef.current = scene;

    // 2. Camera setup - Positioned for beauty 3/4 isometric view on the smart transit bus
    const camera = new THREE.PerspectiveCamera(42, width / currentHeight, 0.1, 100);
    camera.position.set(-5.8, 3.4, 7.2);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, currentHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Balanced 360-degree Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 2.2);
    dirLight.position.set(12, 16, 12);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(-12, 10, 10);
    scene.add(fillLight);

    const rearLight = new THREE.DirectionalLight(0x94a3b8, 1.2);
    rearLight.position.set(0, 8, -14);
    scene.add(rearLight);

    const cyanRim = new THREE.DirectionalLight(0x00f0ff, 1.8);
    cyanRim.position.set(-12, 8, -12);
    scene.add(cyanRim);

    const blueUnderglow = new THREE.PointLight(0x0284c7, 3.5, 14);
    blueUnderglow.position.set(0, 0.4, 0);
    scene.add(blueUnderglow);

    // Front Headlights
    const leftHeadlight = new THREE.SpotLight(0xffffff, 5.0, 24, Math.PI / 4.5, 0.45);
    leftHeadlight.position.set(-0.85, 0.95, 4.3);
    leftHeadlight.target.position.set(-0.85, 0, 14);
    scene.add(leftHeadlight);
    scene.add(leftHeadlight.target);

    const rightHeadlight = new THREE.SpotLight(0xffffff, 5.0, 24, Math.PI / 4.5, 0.45);
    rightHeadlight.position.set(0.85, 0.95, 4.3);
    rightHeadlight.target.position.set(0.85, 0, 14);
    scene.add(rightHeadlight);
    scene.add(rightHeadlight.target);

    // 5. Road Ground Plane
    const roadGeo = new THREE.PlaneGeometry(16, 40, 32, 32);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x0c1322, roughness: 0.85, metalness: 0.1 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0;
    road.receiveShadow = true;
    scene.add(road);

    // Road Markings (Animated Center Lane)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    const markings = [];
    for (let i = -16; i <= 16; i += 3.2) {
      const markGeo = new THREE.PlaneGeometry(0.2, 1.6);
      const mark = new THREE.Mesh(markGeo, lineMat);
      mark.rotation.x = -Math.PI / 2;
      mark.position.set(0, 0.015, i);
      scene.add(mark);
      markings.push(mark);
    }
    roadMarkingsRef.current = markings;

    // Lane Edge Solid Lines
    const edgeLineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 });
    [-3.4, 3.4].forEach((x) => {
      const edgeGeo = new THREE.PlaneGeometry(0.14, 36);
      const edge = new THREE.Mesh(edgeGeo, edgeLineMat);
      edge.rotation.x = -Math.PI / 2;
      edge.position.set(x, 0.015, 0);
      scene.add(edge);
    });

    // Circular Command Radar Grid
    const gridHelper = new THREE.PolarGridHelper(18, 18, 9, 36, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // 6. 3D POTHOLE CRATER & DEPTH GAUGE CALIPER
    const potholeGroup = new THREE.Group();
    potholeGroup.position.set(0, 0.03, 6.2);

    // Warning Halo Ring (Red for defect, Green when repaired)
    const haloGeo = new THREE.RingGeometry(0.45, 0.72, 32);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const haloRing = new THREE.Mesh(haloGeo, haloMat);
    haloRing.rotation.x = -Math.PI / 2;
    potholeGroup.add(haloRing);
    potholeHaloRef.current = haloRing;

    // Inner Dark Crater Depression (Transforms into smooth bitumen when repaired)
    const craterGeo = new THREE.CircleGeometry(0.42, 32);
    const craterMat = new THREE.MeshStandardMaterial({ color: 0x1a0505, roughness: 0.9 });
    const craterMesh = new THREE.Mesh(craterGeo, craterMat);
    craterMesh.rotation.x = -Math.PI / 2;
    potholeGroup.add(craterMesh);
    potholeCraterRef.current = craterMesh;

    // Vertical Depth Caliper Beam
    const caliperBeamGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.4, 16);
    const caliperBeamMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const caliperBeam = new THREE.Mesh(caliperBeamGeo, caliperBeamMat);
    caliperBeam.position.y = 0.7;
    potholeGroup.add(caliperBeam);
    potholeCaliperRef.current = caliperBeam;

    // Top Caliper Target Disc
    const targetDiscGeo = new THREE.RingGeometry(0.08, 0.18, 16);
    const targetDiscMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const targetDisc = new THREE.Mesh(targetDiscGeo, targetDiscMat);
    targetDisc.position.y = 1.4;
    potholeGroup.add(targetDisc);
    potholeTargetDiscRef.current = targetDisc;

    scene.add(potholeGroup);

    // 7. SWEEPING LIDAR LASER SCANNER LINE
    const laserGeo = new THREE.PlaneGeometry(2.4, 0.08);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
    const laserLine = new THREE.Mesh(laserGeo, laserMat);
    laserLine.rotation.x = -Math.PI / 2;
    laserLine.position.set(0, 0.035, 6.0);
    scene.add(laserLine);
    laserScannerRef.current = laserLine;

    // 8. 15-METER SPATIAL DEDUPLICATION RADIUS GEOFENCE RING (Step 7)
    const dedupGeo = new THREE.RingGeometry(2.8, 2.95, 48);
    const dedupMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const dedupRing = new THREE.Mesh(dedupGeo, dedupMat);
    dedupRing.rotation.x = -Math.PI / 2;
    dedupRing.position.set(0, 0.032, 6.2);
    dedupRing.visible = false;
    scene.add(dedupRing);
    dedupRingRef.current = dedupRing;

    // 9. REUSABLE PROCEDURAL SMART TRANSIT BUS BUILDER
    const buildBusMesh = (labelCode, bodyColorHex, isSecondary = false) => {
      const busGroup = new THREE.Group();

      const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColorHex, metalness: 0.7, roughness: 0.2 });
      const roofMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.25, roughness: 0.25 });
      const darkTrimMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 });
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a5f,
        transparent: true,
        opacity: 0.72,
        roughness: 0.08,
        metalness: 0.85
      });
      const rubberMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9, metalness: 0.1 });
      const alloyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
      const ledCyanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const ledRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const ledGreenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

      materialsRef.current.push(bodyMat, roofMat, darkTrimMat, glassMat, rubberMat, alloyMat);

      // Chassis Body
      const bodyLength = 8.2;
      const bodyWidth = 2.5;
      const bodyHeight = 1.3;
      const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyLength), bodyMat);
      bodyMesh.position.y = 1.15;
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      busGroup.add(bodyMesh);

      // Front Aerodynamic Nose
      const noseMesh = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth * 0.98, bodyHeight * 0.85, 0.7), darkTrimMat);
      noseMesh.position.set(0, 0.95, bodyLength / 2 + 0.3);
      busGroup.add(noseMesh);

      // Passenger Greenhouse Glass
      const cabinHeight = 1.1;
      const cabinMesh = new THREE.Mesh(new THREE.BoxGeometry(2.44, cabinHeight, 7.6), glassMat);
      cabinMesh.position.set(0, 2.05, 0.1);
      busGroup.add(cabinMesh);

      // Pillars
      [-2.8, -1.4, 0, 1.4, 2.8].forEach((z) => {
        const pGeo = new THREE.BoxGeometry(0.08, cabinHeight, 0.1);
        const lp = new THREE.Mesh(pGeo, darkTrimMat);
        lp.position.set(-1.24, 2.05, z);
        busGroup.add(lp);
        const rp = new THREE.Mesh(pGeo, darkTrimMat);
        rp.position.set(1.24, 2.05, z);
        busGroup.add(rp);
      });

      // Panoramic Slanted Windshield
      const windMesh = new THREE.Mesh(new THREE.BoxGeometry(2.34, cabinHeight * 1.05, 0.1), glassMat);
      windMesh.position.set(0, 2.05, bodyLength / 2 - 0.05);
      windMesh.rotation.x = -0.15;
      busGroup.add(windMesh);

      // Roof Shell
      const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth * 0.99, 0.28, 8.1), roofMat);
      roofMesh.position.set(0, 2.7, 0);
      roofMesh.castShadow = true;
      busGroup.add(roofMesh);

      // Wheels
      const wheelPositions = [
        [-1.25, 0.52, 2.7],
        [1.25, 0.52, 2.7],
        [-1.25, 0.52, -2.4],
        [1.25, 0.52, -2.4]
      ];
      wheelPositions.forEach(([x, y, z]) => {
        const wg = new THREE.Group();
        wg.position.set(x, y, z);
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.32, 24).rotateZ(Math.PI / 2), rubberMat);
        wg.add(tire);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.33, 16).rotateZ(Math.PI / 2), alloyMat);
        wg.add(rim);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.34, 12).rotateZ(Math.PI / 2), ledCyanMat);
        wg.add(hub);
        busGroup.add(wg);
      });

      // Front Headlamps
      const leftHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.1), ledCyanMat);
      leftHead.position.set(-0.9, 0.95, bodyLength / 2 + 0.62);
      busGroup.add(leftHead);
      const rightHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.1), ledCyanMat);
      rightHead.position.set(0.9, 0.95, bodyLength / 2 + 0.62);
      busGroup.add(rightHead);

      // Taillights
      const leftTail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.08), ledRedMat);
      leftTail.position.set(-0.95, 1.2, -bodyLength / 2 - 0.02);
      busGroup.add(leftTail);
      const rightTail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.08), ledRedMat);
      rightTail.position.set(0.95, 1.2, -bodyLength / 2 - 0.02);
      busGroup.add(rightTail);

      // LED Destination Sign
      const ledCanvas = document.createElement('canvas');
      ledCanvas.width = 512;
      ledCanvas.height = 64;
      const ctx = ledCanvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 64);
      ctx.fillStyle = isSecondary ? '#c084fc' : '#38bdf8';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`URBANEYE • ${labelCode} • AMRITSAR SMART CITY`, 256, 40);
      const ledTexture = new THREE.CanvasTexture(ledCanvas);
      const ledText = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 0.25), new THREE.MeshBasicMaterial({ map: ledTexture }));
      ledText.position.set(0, 2.58, bodyLength / 2 - 0.05);
      busGroup.add(ledText);

      // Front Vision Camera Pod
      const frontPod = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.16), darkTrimMat);
      frontPod.position.set(0, 2.75, 3.8);
      busGroup.add(frontPod);

      // Vision Cone
      const coneGeo = new THREE.ConeGeometry(2.4, 5.5, 24, 1, true);
      coneGeo.rotateX(-Math.PI / 2 + 0.35);
      const coneMesh = new THREE.Mesh(
        coneGeo,
        new THREE.MeshBasicMaterial({ 
          color: isSecondary ? 0xa855f7 : 0x00f0ff, 
          transparent: true, 
          opacity: isSecondary ? 0.24 : 0.18, 
          side: THREE.DoubleSide 
        })
      );
      coneMesh.position.set(0, 2.2, 5.5);
      busGroup.add(coneMesh);

      // Roof Jetson Edge AI Box
      const computeGroup = new THREE.Group();
      computeGroup.position.set(0, 2.85, 0.4);
      computeGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.18, 0.95), darkTrimMat));
      const jetsonLed = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), ledGreenMat);
      jetsonLed.position.set(0.3, 0.1, 0.4);
      computeGroup.add(jetsonLed);
      busGroup.add(computeGroup);

      // Roof Shark-Fin Antenna
      const antennaGroup = new THREE.Group();
      antennaGroup.position.set(0, 2.85, -2.5);
      const finMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 0.38), darkTrimMat);
      antennaGroup.add(finMesh);
      busGroup.add(antennaGroup);

      return { busGroup, antennaGroup, coneMesh };
    };

    // 10. PRIMARY BUS: Dynamic bus code
    const primaryBus = buildBusMesh(busCode || 'BUS-104', 0x0284c7, false);
    busGroupRef.current = primaryBus.busGroup;
    scene.add(primaryBus.busGroup);

    // 5G Antenna Pulse Rings on Primary Bus
    const pulseRings = [];
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.2, 0.26, 24),
        new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.35 + r * 0.25;
      primaryBus.antennaGroup.add(ring);
      pulseRings.push(ring);
    }
    antennaPulseRef.current = pulseRings;

    // Upward 5G Encrypted Data Particles
    const packetGeo = new THREE.BufferGeometry();
    const packetCount = 28;
    const packetPos = new Float32Array(packetCount * 3);
    for (let i = 0; i < packetCount; i++) {
      packetPos[i * 3] = (Math.random() - 0.5) * 0.4;
      packetPos[i * 3 + 1] = Math.random() * 3.2;
      packetPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3));
    const packetPoints = new THREE.Points(
      packetGeo,
      new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.09, transparent: true, opacity: 0.9 })
    );
    primaryBus.antennaGroup.add(packetPoints);
    dataPacketsRef.current = packetPoints;

    // 11. SECONDARY BUS: BUS-112 (Simulate second bus detecting same location - Step 6 & 7)
    const secondaryBus = buildBusMesh('BUS-112', 0x7c3aed, true);
    secondaryBus.busGroup.position.set(-3.5, 0, 8.2); // Positioned in adjacent lane
    secondaryBus.busGroup.visible = false;
    bus2GroupRef.current = secondaryBus.busGroup;
    scene.add(secondaryBus.busGroup);

    // 12. ORBIT CONTROLS (Buttery-smooth 360° bus rotation, zoom, and touch support)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going underneath road plane
    controls.minDistance = 2.5;
    controls.maxDistance = 28.0;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controls.target.set(0.0, 1.4, 0.6);
    controlsRef.current = controls;

    // Interrupt programmatic camera fly-to when user manually interacts
    controls.addEventListener('start', () => {
      isUserInteractingRef.current = true;
      isTransitioningRef.current = false;
    });
    controls.addEventListener('end', () => {
      isUserInteractingRef.current = false;
    });

    // 13. ANIMATION LOOP
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera transition when step or preset changes
      if (isTransitioningRef.current) {
        camera.position.lerp(targetCamPos.current, 0.06);
        controls.target.lerp(targetLookAt.current, 0.06);
        if (
          camera.position.distanceTo(targetCamPos.current) < 0.04 &&
          controls.target.distanceTo(targetLookAt.current) < 0.04
        ) {
          isTransitioningRef.current = false;
        }
      }

      controls.update();

      // Moving road markings (Simulates bus cruising on road)
      markings.forEach((m) => {
        m.position.z = ((m.position.z + 16 - elapsedTime * 6) % 32) - 16;
      });

      // Animate 5G Antenna Pulse Rings
      pulseRings.forEach((ring, idx) => {
        const pulseRate = activeStage.step === 4 ? 1.6 : 0.8;
        const progress = (elapsedTime * pulseRate + idx * 0.33) % 1.0;
        const scale = 1.0 + progress * 3.2;
        ring.scale.set(scale, scale, 1);
        ring.material.opacity = (1.0 - progress) * 0.85;
      });

      // Animate 5G Data Packets
      if (packetPoints) {
        const positions = packetPoints.geometry.attributes.position.array;
        const speed = activeStage.step === 4 ? 0.06 : 0.02;
        for (let i = 0; i < packetCount; i++) {
          positions[i * 3 + 1] = (positions[i * 3 + 1] + speed) % 3.2;
        }
        packetPoints.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Sweeping LiDAR Laser Scanner
      if (laserLine) {
        laserLine.position.z = 5.2 + Math.sin(elapsedTime * 3.5) * 1.2;
      }

      // Animate Pothole Halo Pulse
      if (haloRing) {
        const pulse = 1.0 + Math.sin(elapsedTime * 4) * 0.15;
        haloRing.scale.set(pulse, pulse, 1);
      }

      // Animate 15m Dedup Ring
      if (dedupRing && dedupRing.visible) {
        const dScale = 1.0 + Math.sin(elapsedTime * 2.5) * 0.04;
        dedupRing.scale.set(dScale, dScale, 1);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 580;
      if (newWidth === 0 || newHeight === 0) return;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    // Attach ResizeObserver to keep canvas sized accurately during tab switches
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);
    const initialResizeTimer = setTimeout(handleResize, 60);

    return () => {
      clearTimeout(initialResizeTimer);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Update autoRotate property on controls without re-mounting Three scene
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Wireframe toggle
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      mat.wireframe = wireframeMode;
    });
  }, [wireframeMode]);

  const jumpToStep = (idx) => {
    setCurrentStepIdx(idx);
    setStepProgress(0);
  };

  const handlePrevStep = () => {
    setCurrentStepIdx((prev) => Math.max(0, prev - 1));
    setStepProgress(0);
  };

  const handleNextStep = () => {
    setCurrentStepIdx((prev) => (prev + 1) % DEMO_FLOW_STAGES.length);
    setStepProgress(0);
  };

  const resetCamera = () => {
    if (activeStage && activeStage.cameraView) {
      targetCamPos.current.set(...activeStage.cameraView.pos);
      targetLookAt.current.set(...activeStage.cameraView.target);
      isTransitioningRef.current = true;
    } else {
      targetCamPos.current.set(-5.8, 3.4, 7.2);
      targetLookAt.current.set(0.0, 1.4, 0.6);
      isTransitioningRef.current = true;
    }
  };

  const applyCameraPreset = (pos, target) => {
    targetCamPos.current.set(...pos);
    targetLookAt.current.set(...target);
    isTransitioningRef.current = true;
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const ActiveStepIcon = activeStage.icon;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#060913] border border-blue-900/40 shadow-2xl flex flex-col xl:flex-row">
      {/* 3D WebGL Canvas Viewport */}
      <div className="relative flex-1" style={{ height, minHeight: '480px' }}>
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing select-none" />

        {/* Top Header: 90–120s Demo Flow Banner & Auto-Play Controls */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
          <div className="flex items-center space-x-3 bg-gray-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-blue-500/40 text-xs shadow-2xl pointer-events-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-white tracking-wide font-heading">
                  90–120s AUTONOMOUS DEMO FLOW
                </span>
                <span className="text-[9px] bg-cyan-950 text-cyan-300 font-bold px-1.5 py-0.2 rounded border border-cyan-800">
                  STEP {activeStage.step} OF 9
                </span>
              </div>
              <span className="text-[10px] text-gray-400 block font-mono">
                SIH PROBLEM #26124 • BUS-104 DIGITAL TWIN
              </span>
            </div>
          </div>

          {/* Live Cloud DB & MQTT Sync Pill */}
          <div className="flex items-center space-x-2 bg-gray-950/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-500/40 text-xs shadow-2xl pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="font-mono text-[11px] space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="text-emerald-300 font-bold">Cloud/MQTT: {backendSync.status}</span>
                <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1 rounded">LIVE</span>
              </div>
              <div className="text-[10px] text-gray-400 flex items-center space-x-2">
                <span>DB Inc: <strong className="text-cyan-300">{backendSync.incidentCode || 'INC-1024'}</strong></span>
                <span>•</span>
                <span>WO: <strong className="text-amber-300">{backendSync.workOrderCode || 'WO-9041'}</strong></span>
              </div>
            </div>
          </div>

          {/* Autoplay & Playback Control Bar */}
          <div className="flex items-center space-x-2 bg-gray-950/90 backdrop-blur-md p-1.5 rounded-2xl border border-gray-800 text-xs shadow-2xl pointer-events-auto">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 shadow-md ${
                isAutoPlaying 
                  ? 'bg-amber-600 text-white shadow-amber-600/30' 
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>{isAutoPlaying ? 'Pause 90–120s Demo' : 'Auto-Play 90–120s Demo Flow'}</span>
            </button>

            <div className="px-2.5 py-1 rounded-xl bg-gray-900 border border-gray-800 font-mono text-[11px] text-cyan-300 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{formatTime(elapsedTotalSec)} / 01:45</span>
            </div>

            <button
              onClick={() => {
                setCurrentStepIdx(0);
                setElapsedTotalSec(0);
                setStepProgress(0);
              }}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white bg-gray-900 border border-gray-800 transition"
              title="Reset Demo to Step 1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top Progress Bar when Auto-Playing */}
        {isAutoPlaying && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-900 z-30">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-100"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
        )}

        {/* STEP-SPECIFIC 3D HUD OVERLAYS */}

        {/* STEP 1: Live Bus-Camera Footage Overlay */}
        {activeStage.step === 1 && (
          <div className="absolute top-20 left-4 bg-gray-950/90 border border-cyan-500/50 backdrop-blur-md p-3.5 rounded-2xl text-xs text-gray-200 shadow-2xl max-w-sm pointer-events-auto z-10 space-y-2">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-wider">
                  BUS-CAMERA 1080p HDR STREAM
                </span>
              </div>
              <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.2 rounded font-mono">
                ● REC
              </span>
            </div>
            <div className="text-[11px] text-cyan-300 font-mono">
              Sony STARVIS 2 IMX585 • 30 FPS • 120° FOV
            </div>
            <p className="text-[11px] text-gray-300 leading-snug">
              Forward optical camera scans road surface at 42 km/h. Frames streamed to volatile edge buffer.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-400 pt-1 border-t border-gray-800/80">
              <div>CORRIDOR: <strong>Route R-02 Mall Road</strong></div>
              <div>SPEED: <strong>41.8 km/h</strong></div>
            </div>
          </div>
        )}

        {/* STEP 2: Show AI Detecting a Pothole Overlay */}
        {activeStage.step === 2 && (
          <div className="absolute bottom-20 left-4 bg-red-950/90 border border-red-800 backdrop-blur-md p-3.5 rounded-2xl text-xs text-red-200 shadow-2xl max-w-sm pointer-events-auto z-10 space-y-1.5">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="font-black text-white uppercase text-xs">
                YOLOv11s-Seg AI Pothole Locked
              </span>
              <span className="text-[9px] bg-red-900 text-red-200 px-1.5 py-0.2 rounded font-bold">
                96.4% CONF
              </span>
            </div>
            <div className="text-[11px] font-mono text-red-300">
              Depth: <strong>58mm</strong> • Vol: <strong>14.8 Liters</strong> • Latency: <strong>28.4ms</strong>
            </div>
            <div className="text-[10px] text-gray-300 font-mono">
              LiDAR Caliper locked 6.2m ahead on road surface fracture.
            </div>
          </div>
        )}

        {/* STEP 3: Show GPS / Time / Bus ID Overlay */}
        {activeStage.step === 3 && (
          <div className="absolute top-20 left-4 bg-gray-950/90 border border-amber-500/50 backdrop-blur-md p-3.5 rounded-2xl text-xs text-gray-200 shadow-2xl max-w-sm pointer-events-auto z-10 space-y-2">
            <div className="flex items-center space-x-2 border-b border-gray-800 pb-2">
              <Navigation className="w-4 h-4 text-amber-400" />
              <span className="font-black text-white uppercase text-xs">
                RTK-GPS & Telemetry Node
              </span>
              <span className="text-[9px] bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                ±0.12m ACCURACY
              </span>
            </div>
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Bus Identifier:</span>
                <strong className="text-cyan-300">BUS-104 (Tata Ultra EV)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">RTK GPS:</span>
                <strong className="text-amber-300">31.634218° N, 74.872845° E</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Timestamp:</span>
                <strong className="text-gray-200">12:02:45.312 IST</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Route & Driver:</span>
                <strong className="text-purple-300">Route R-02 (Rajesh Kumar)</strong>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Send Event to Backend Overlay */}
        {activeStage.step === 4 && (
          <div className="absolute top-20 left-4 bg-gray-950/90 border border-pink-500/50 backdrop-blur-md p-3.5 rounded-2xl text-xs text-gray-200 shadow-2xl max-w-sm pointer-events-auto z-10 space-y-2">
            <div className="flex items-center space-x-2 border-b border-gray-800 pb-2">
              <Send className="w-4 h-4 text-pink-400 animate-pulse" />
              <span className="font-black text-white uppercase text-xs">
                MQTT Over 5G/4G Transmit
              </span>
              <span className="text-[9px] bg-pink-950 text-pink-300 px-1.5 py-0.2 rounded font-mono">
                0.86 KB JSON
              </span>
            </div>
            <p className="text-[11px] text-gray-300 leading-snug">
              Encrypted micro-packet published via roof 5G antenna. No civilian facial video uploaded (DPDP Act 2023 compliant).
            </p>
            <div className="p-2 rounded-xl bg-gray-900 font-mono text-[10px] text-emerald-400 space-y-0.5 border border-pink-900/40">
              <div className="truncate">Topic: {backendSync.topic}</div>
              <div>Backend Status: {backendSync.status} • DB Incident: {backendSync.incidentCode || 'INC-1024'}</div>
            </div>
          </div>
        )}

        {/* STEP 5: Show Defect on GIS Map Overlay */}
        {activeStage.step === 5 && (
          <div className="absolute bottom-20 left-4 bg-gray-950/90 border border-blue-500/50 backdrop-blur-md p-3.5 rounded-2xl text-xs text-gray-200 shadow-2xl max-w-sm pointer-events-auto z-10 space-y-2">
            <div className="flex items-center space-x-2 border-b border-gray-800 pb-2">
              <MapPin className="w-4 h-4 text-blue-400 animate-bounce" />
              <span className="font-black text-white uppercase text-xs">
                Municipal GIS Map Geocoded
              </span>
              <span className="text-[9px] bg-blue-950 text-blue-300 px-1.5 py-0.2 rounded font-bold font-mono">
                {backendSync.incidentCode || 'INC-2026-09041'}
              </span>
            </div>
            <div className="h-16 rounded-xl bg-gradient-to-br from-blue-950/60 to-gray-900 border border-blue-800/40 flex items-center justify-center p-2 relative overflow-hidden">
              <div className="text-center">
                <div className="text-[10px] font-bold text-cyan-300 font-mono">Amritsar Mall Road Corridor #12</div>
                <div className="text-[9px] text-gray-400 mt-0.5">Geofence Pin Placed • Initial Status: UNVERIFIED</div>
              </div>
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
          </div>
        )}

        {/* STEP 6: Simulate Second Bus Corroboration Overlay */}
        {activeStage.step === 6 && (
          <div className="absolute top-20 left-4 bg-purple-950/90 border border-purple-700 backdrop-blur-md p-3.5 rounded-2xl text-xs text-purple-200 shadow-2xl max-w-sm pointer-events-auto z-10 space-y-2">
            <div className="flex items-center space-x-2 border-b border-purple-800 pb-2">
              <Bus className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="font-black text-white uppercase text-xs">
                Second Bus Arrival: BUS-112
              </span>
              <span className="text-[9px] bg-purple-900 text-purple-200 px-1.5 py-0.2 rounded font-mono">
                DELTA: 0.64m
              </span>
            </div>
            <p className="text-[11px] text-gray-200 leading-snug">
              BUS-112 traverses the adjacent lane and scans the exact same pothole location at 12:07:18 with 97.8% AI confidence.
            </p>
            <div className="text-[10px] font-mono text-purple-300 bg-purple-900/40 p-2 rounded-xl border border-purple-800">
              Corroborating observation #{backendSync.confirmations} within 15m radius geofence.
            </div>
          </div>
        )}

        {/* STEP 7: Observations Merged & Priority Updated Overlay */}
        {activeStage.step === 7 && (
          <div className="absolute bottom-20 left-4 bg-amber-950/90 border border-amber-700 backdrop-blur-md p-3.5 rounded-2xl text-xs text-amber-200 shadow-2xl max-w-sm pointer-events-auto z-10 space-y-2">
            <div className="flex items-center space-x-2 border-b border-amber-800 pb-2">
              <Zap className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="font-black text-white uppercase text-xs">
                Fog Deduplication & Dispatch
              </span>
              <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                99.8% CONSENSUS
              </span>
            </div>
            <div className="text-[11px] text-gray-200 leading-snug">
              Observations from BUS-104 & BUS-112 merged. Priority auto-elevated to <strong>CRITICAL</strong> ({backendSync.multiBusVerified ? 'MULTI-BUS VERIFIED' : 'CONFIRMED'}).
            </div>
            <div className="p-2 rounded-xl bg-gray-900 font-mono text-[10px] text-amber-300 border border-amber-800/60">
              Dispatched Work Order: <strong>#{backendSync.workOrderCode || 'WO-9041'}</strong> (PWD Crew 3) • 30m SLA Timer Active!
            </div>
          </div>
        )}

        {/* STEP 8: Mark Repair Complete Overlay */}
        {activeStage.step === 8 && (
          <div className="absolute bottom-20 left-4 bg-emerald-950/90 border border-emerald-700 backdrop-blur-md p-3.5 rounded-2xl text-xs text-emerald-200 shadow-2xl max-w-sm pointer-events-auto z-10 space-y-2">
            <div className="flex items-center space-x-2 border-b border-emerald-800 pb-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span className="font-black text-white uppercase text-xs">
                Work Order #{backendSync.workOrderCode || 'WO-9041'} Completed
              </span>
              <span className="text-[9px] bg-emerald-900 text-emerald-200 px-1.5 py-0.2 rounded font-bold">
                REPAIRED
              </span>
            </div>
            <p className="text-[11px] text-gray-200 leading-snug">
              PWD field crew applied hot-mix bitumen. Crater sealed in 21m 40s (well within the 30-minute SLA deadline).
            </p>
            <div className="text-[10px] font-mono text-emerald-300 bg-emerald-900/40 p-2 rounded-xl border border-emerald-800">
              3D pothole crater replaced with smooth asphalt & green seal. DB Status: {backendSync.status}
            </div>
          </div>
        )}

        {/* STEP 9: Simulate Later Bus Pass Overlay */}
        {activeStage.step === 9 && (
          <div className="absolute bottom-20 left-4 bg-cyan-950/90 border border-cyan-700 backdrop-blur-md p-3.5 rounded-2xl text-xs text-cyan-200 shadow-2xl max-w-sm pointer-events-auto z-10 space-y-2">
            <div className="flex items-center space-x-2 border-b border-cyan-800 pb-2">
              <CheckCheck className="w-4 h-4 text-cyan-400" />
              <span className="font-black text-white uppercase text-xs">
                Later Bus Pass: Autonomous Audit
              </span>
              <span className="text-[9px] bg-cyan-900 text-cyan-200 px-1.5 py-0.2 rounded font-bold">
                AUDIT PASSED
              </span>
            </div>
            <p className="text-[11px] text-gray-200 leading-snug">
              BUS-107 passes over coordinates 3 hours later. AI confirms <strong>0mm depth</strong>. Ticket permanently closed in municipal cloud!
            </p>
            <div className="text-[10px] font-mono text-cyan-300 bg-cyan-900/40 p-2 rounded-xl border border-cyan-800">
              100% Objective Closed-Loop Municipal Governance Complete. DB Incident {backendSync.incidentCode || 'INC-1024'} RESOLVED.
            </div>
          </div>
        )}


        {/* Bottom Floating 3D Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-none">
          {/* Controls Group */}
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg backdrop-blur-md ${
                autoRotate ? 'bg-cyan-600 text-white shadow-cyan-600/30' : 'bg-gray-900/90 text-gray-300 border border-gray-800 hover:text-white'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
              <span>{autoRotate ? 'Rotating' : 'Auto Rotate'}</span>
            </button>

            <button
              onClick={() => setShowCones(!showCones)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg backdrop-blur-md ${
                showCones ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-gray-900/90 text-gray-300 border border-gray-800 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showCones ? 'AI Cones: ON' : 'AI Cones: OFF'}</span>
            </button>

            <button
              onClick={() => setWireframeMode(!wireframeMode)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg backdrop-blur-md ${
                wireframeMode ? 'bg-purple-600 text-white shadow-purple-600/30' : 'bg-gray-900/90 text-gray-300 border border-gray-800 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{wireframeMode ? 'X-Ray: ON' : 'X-Ray Chassis'}</span>
            </button>
          </div>

          {/* Camera View Angle Presets */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-950/90 backdrop-blur-md p-1 rounded-2xl border border-gray-800/80 shadow-2xl pointer-events-auto">
            <span className="text-[10px] text-gray-400 font-mono px-2 font-semibold">VIEW:</span>
            
            <button
              onClick={() => applyCameraPreset([-5.8, 3.4, 7.2], [0.0, 1.4, 0.6])}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-gray-300 hover:text-white hover:bg-gray-800/80 transition flex items-center space-x-1"
              title="Full 3D Orbit View of Smart Bus"
            >
              <Bus className="w-3 h-3 text-cyan-400" />
              <span>3D Orbit</span>
            </button>

            <button
              onClick={() => applyCameraPreset([0.0, 2.55, 3.7], [0.0, 1.1, 14.0])}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-gray-300 hover:text-white hover:bg-gray-800/80 transition flex items-center space-x-1"
              title="Front Windshield Onboard Camera Stream View"
            >
              <Camera className="w-3 h-3 text-blue-400" />
              <span>Windshield Cam</span>
            </button>

            <button
              onClick={() => applyCameraPreset([0.0, 5.5, 0.8], [0.0, 2.7, 0.2])}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-gray-300 hover:text-white hover:bg-gray-800/80 transition flex items-center space-x-1"
              title="Top View of Roof Jetson Orin Nano AI & 5G Antenna"
            >
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>Roof AI & 5G</span>
            </button>

            <button
              onClick={() => applyCameraPreset([-2.2, 2.0, 7.2], [0.0, 0.2, 6.2])}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-gray-300 hover:text-white hover:bg-gray-800/80 transition flex items-center space-x-1"
              title="Close-up of Road Defect Caliper and LiDAR Sweep"
            >
              <Target className="w-3 h-3 text-red-400" />
              <span>Defect Focus</span>
            </button>

            <button
              onClick={resetCamera}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 hover:bg-cyan-900/60 transition flex items-center space-x-1"
              title="Re-center view on bus"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Drawer: The 9-Step 90–120 Second Demo Flow Storyboard */}
      <div className="w-full xl:w-[460px] bg-gray-950/95 border-t xl:border-t-0 xl:border-l border-gray-800/80 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          {/* Header with Stepper */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <ActiveStepIcon className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-black text-white uppercase tracking-wider font-heading">
                  90–120s Demo Flow Pipeline
                </h2>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2.5 py-0.5 rounded-full">
                Step {activeStage.step} of 9
              </span>
            </div>

            {/* Stepper Pills for all 9 Steps */}
            <div className="grid grid-cols-9 gap-1 mt-2.5">
              {DEMO_FLOW_STAGES.map((st, i) => (
                <button
                  key={st.step}
                  onClick={() => jumpToStep(i)}
                  className={`h-2 rounded-full transition-all ${
                    currentStepIdx === i
                      ? 'bg-cyan-400 shadow-md shadow-cyan-400/50 scale-y-125'
                      : i < currentStepIdx
                      ? 'bg-blue-600'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  title={`${st.step}. ${st.title}`}
                />
              ))}
            </div>
          </div>

          {/* Active Demo Stage Interactive Card */}
          <div className="bg-gradient-to-br from-blue-950/40 via-gray-900 to-indigo-950/40 border border-blue-900/50 rounded-2xl p-4 space-y-3 shadow-2xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-cyan-400 block">
                  {activeStage.badge}
                </span>
                <h3 className="text-sm font-black text-white font-heading mt-0.5 leading-snug">
                  {activeStage.step}. {activeStage.title}
                </h3>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                ~{activeStage.duration}s
              </span>
            </div>

            {/* Action Summary Prompt */}
            <div className="p-2.5 bg-gray-950/80 rounded-xl border border-gray-800 text-xs">
              <span className="text-[10px] text-cyan-300 font-bold uppercase block">Stage Action:</span>
              <p className="text-[11px] text-gray-200 mt-0.5 leading-relaxed">{activeStage.summary}</p>
            </div>

            {/* Deep Technical Metadata */}
            <div className="space-y-1.5 text-xs bg-gray-900/60 p-3 rounded-xl border border-gray-800/80">
              {Object.entries(activeStage.details).map(([key, val]) => (
                <div key={key} className="flex items-start justify-between text-[11px] gap-2">
                  <span className="text-gray-400 capitalize shrink-0 font-medium">
                    {key.replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <span className="text-gray-200 text-right font-mono font-semibold truncate max-w-[240px]">
                    {val}
                  </span>
                </div>
              ))}
            </div>

            {/* Navigation Buttons for Stepper */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
              <button
                onClick={handlePrevStep}
                disabled={currentStepIdx === 0}
                className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 disabled:opacity-30 text-gray-300 text-xs font-bold transition flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Step</span>
              </button>

              <div className="text-[10px] font-mono text-gray-500">
                {currentStepIdx + 1} / {DEMO_FLOW_STAGES.length}
              </div>

              <button
                onClick={handleNextStep}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-1 shadow-md shadow-blue-600/30"
              >
                <span>{currentStepIdx === DEMO_FLOW_STAGES.length - 1 ? 'Restart Demo' : 'Next Step'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Complete 9-Step Quick Jump List */}
          <div className="p-3 bg-gray-900/90 rounded-2xl border border-gray-800 space-y-1.5 text-xs max-h-52 overflow-y-auto pr-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              All 9 Demo Flow Steps (Click to Jump):
            </span>
            {DEMO_FLOW_STAGES.map((st, i) => {
              const StIcon = st.icon;
              const isCurr = currentStepIdx === i;
              return (
                <button
                  key={st.step}
                  onClick={() => jumpToStep(i)}
                  className={`w-full p-2 rounded-xl text-left text-xs transition flex items-center justify-between border ${
                    isCurr
                      ? 'bg-blue-600/20 border-blue-500 text-cyan-300 font-bold'
                      : 'bg-gray-950/60 border-gray-800/80 text-gray-400 hover:text-gray-200 hover:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <StIcon className={`w-3.5 h-3.5 shrink-0 ${isCurr ? 'text-cyan-400' : 'text-gray-500'}`} />
                    <span className="truncate">{st.step}. {st.title}</span>
                  </div>
                  {isCurr && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* SIH Impact Footer */}
        <div className="p-3.5 bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-purple-950/40 rounded-2xl border border-cyan-800/40 space-y-1.5 text-xs">
          <div className="flex items-center space-x-1.5 text-cyan-300 font-black text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>SIH 2026 Problem Statement #26124:</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-snug">
            Autonomous closed-loop municipal road monitoring: <strong>21× faster repair</strong>, <strong>90% taxpayer savings</strong>, and zero fixed civil pole disruption!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Bus3DViewer;
