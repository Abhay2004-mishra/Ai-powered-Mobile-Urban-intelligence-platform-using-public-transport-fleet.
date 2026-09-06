import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Radio, 
  Target, 
  Layers, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Bus as BusIcon, 
  Compass, 
  Sparkles,
  ChevronRight,
  Wifi
} from 'lucide-react';
import api from '../services/api';

/* ================= SIMULATION CONFIG ================= */
const INITIAL_DEFECTS = [
  { id: 'pothole',  t: 0.30, label: 'POTHOLE',     color: '#ff5470', severity: 'CRITICAL', gps: '31.6342°N, 74.8728°E', obs: 0, conf: 0, base: 74 },
  { id: 'crack',    t: 0.56, label: 'ROAD CRACK',  color: '#f5a623', severity: 'MODERATE', gps: '31.6355°N, 74.8741°E', obs: 0, conf: 0, base: 70 },
  { id: 'obstacle', t: 0.80, label: 'FALLEN TREE', color: '#9a6bff', severity: 'HIGH',     gps: '31.6368°N, 74.8756°E', obs: 0, conf: 0, base: 80 },
];

const SCENERY = [
  { t: 0.10, side: -1, type: 'building' }, { t: 0.10, side: 1, type: 'building' },
  { t: 0.22, side: -1, type: 'tree' },     { t: 0.20, side: 1, type: 'lamp' },
  { t: 0.38, side: 1,  type: 'tree' },     { t: 0.40, side: -1, type: 'lamp' },
  { t: 0.50, side: -1, type: 'tree' },     { t: 0.64, side: 1, type: 'tree' },
  { t: 0.70, side: -1, type: 'lamp' },     { t: 0.88, side: 1, type: 'lamp' },
  { t: 0.92, side: -1, type: 'tree' },
];

const BUS_NAMES = ['BUS-104', 'BUS-207', 'BUS-311'];
const BUS_COLORS = ['#3fd9e8', '#4d8dff', '#33d69f'];
const LAP_DURATION = 7600; // 7.6s per full lap
const LAP_GAP = 1400;      // 1.4s between laps
const STAGGER = 2000;      // 2s spacing between buses
const DETECT_EPS = 0.014;

// 3D Perspective Projection constants
const TOP_Y = 46, BOTTOM_Y = 428;
const TOP_W = 18, BOTTOM_W = 420;
const TOP_SCALE = 0.18, BOTTOM_SCALE = 1.3;

function project(t) {
  const e = t * t;
  return {
    y: TOP_Y + (BOTTOM_Y - TOP_Y) * e,
    w: TOP_W + (BOTTOM_W - TOP_W) * e,
    scale: TOP_SCALE + (BOTTOM_SCALE - TOP_SCALE) * e,
  };
}

function nowStr() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

const FleetConvoyRoadScan = () => {
  const [busCount, setBusCount] = useState(3);
  const [running, setRunning] = useState(false);
  const [fps, setFps] = useState(60);
  const [totalPasses, setTotalPasses] = useState(0);
  const [totalDetections, setTotalDetections] = useState(0);
  const [defects, setDefects] = useState(INITIAL_DEFECTS);
  const [logs, setLogs] = useState([]);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);

  // DOM Refs
  const containerRef = useRef(null);
  const roadSvgRef = useRef(null);
  const skylineSvgRef = useRef(null);
  const sceneryLayerRef = useRef(null);
  const dashLayerRef = useRef(null);
  const defectLayerRef = useRef(null);
  const busLayerRef = useRef(null);
  const flashRef = useRef(null);
  const progressTrackRef = useRef(null);
  const logContainerRef = useRef(null);

  // Animation State Refs (avoid state updates during 60fps tick)
  const animStateRef = useRef({
    running: false,
    simStart: 0,
    lastFrameTime: 0,
    frameCount: 0,
    fpsAccum: 0,
    rafId: null,
    totalPasses: 0,
    totalDetections: 0,
    defects: JSON.parse(JSON.stringify(INITIAL_DEFECTS)),
    busCount: 3,
  });

  // Cached DOM elements for direct transform manipulation
  const busDomRefs = useRef([]);
  const progBusRefs = useRef([]);
  const defectBoxRefs = useRef([]);
  const defectWrapRefs = useRef([]);
  const busesStateRef = useRef([]);

  // Push new log entry
  const pushLog = useCallback((html) => {
    setLogs((prev) => [{ id: Date.now() + Math.random(), time: nowStr(), html }, ...prev.slice(0, 35)]);
  }, []);

  // 1. Build Static Road SVG
  const buildRoad = useCallback(() => {
    const roadEl = containerRef.current;
    const roadSvg = roadSvgRef.current;
    if (!roadEl || !roadSvg) return;

    const W = roadEl.clientWidth || 800;
    const H = roadEl.clientHeight || 440;
    roadSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    roadSvg.setAttribute('width', W);
    roadSvg.setAttribute('height', H);

    const cx = W / 2;
    const topL = cx - TOP_W / 2, topR = cx + TOP_W / 2;
    const botL = cx - BOTTOM_W / 2, botR = cx + BOTTOM_W / 2;

    roadSvg.innerHTML = `
      <defs>
        <linearGradient id="asphaltGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#131a26"/>
          <stop offset="100%" stop-color="#1c2536"/>
        </linearGradient>
      </defs>
      <polygon points="${topL},${TOP_Y} ${topR},${TOP_Y} ${botR},${BOTTOM_Y} ${botL},${BOTTOM_Y}" fill="url(#asphaltGrad)"/>
      <polygon points="${topL},${TOP_Y} ${topR},${TOP_Y} ${botR},${BOTTOM_Y} ${botL},${BOTTOM_Y}" fill="none" stroke="#26314a" stroke-width="1"/>
      <polygon points="${topL - 2},${TOP_Y} ${topL},${TOP_Y} ${botL},${BOTTOM_Y} ${botL - 6},${BOTTOM_Y}" fill="#e9edf5" opacity="0.85"/>
      <polygon points="${topR},${TOP_Y} ${topR + 2},${TOP_Y} ${botR + 6},${BOTTOM_Y} ${botR},${BOTTOM_Y}" fill="#e9edf5" opacity="0.85"/>
    `;
  }, []);

  // 2. Build Skyline Silhouette
  const buildSkyline = useCallback(() => {
    const skyline = skylineSvgRef.current;
    if (!skyline) return;
    const W = 800, H = 44;
    skyline.setAttribute('viewBox', `0 0 ${W} ${H}`);
    let bars = '';
    let x = 0;
    const rnd = (seed) => (Math.sin(seed * 999) * 0.5 + 0.5);
    let i = 0;
    while (x < W) {
      const bw = 26 + rnd(i) * 30;
      const bh = 14 + rnd(i + 5) * 26;
      bars += `<rect x="${x}" y="${H - bh}" width="${bw - 3}" height="${bh}" fill="#0c1830"/>`;
      x += bw;
      i++;
    }
    skyline.innerHTML = bars;
  }, []);

  // 3. Layout Scenery (Buildings, Trees, Lamps)
  const layoutScenery = useCallback(() => {
    const layer = sceneryLayerRef.current;
    const roadEl = containerRef.current;
    if (!layer || !roadEl) return;
    layer.innerHTML = '';
    const W = roadEl.clientWidth || 800;

    SCENERY.forEach((s) => {
      const p = project(s.t);
      const margin = 10 + p.scale * 10;
      const x = W / 2 + s.side * (p.w / 2 + margin);
      const el = document.createElement('div');
      el.className = 'absolute left-0 top-0 transform-gpu';
      el.style.transformOrigin = 'bottom center';

      let svgHtml = '';
      if (s.type === 'tree') {
        svgHtml = `<svg width="26" height="34" viewBox="0 0 26 34">
          <rect x="11" y="18" width="4" height="14" fill="#5b3d24"/>
          <circle cx="13" cy="14" r="10" fill="#245c3f"/>
          <circle cx="7" cy="17" r="6.5" fill="#245c3f"/>
          <circle cx="19" cy="17" r="6.5" fill="#245c3f"/>
        </svg>`;
      } else if (s.type === 'lamp') {
        svgHtml = `<svg width="10" height="40" viewBox="0 0 10 40">
          <rect x="4" y="10" width="2" height="30" fill="#374764"/>
          <circle cx="5" cy="7" r="5" fill="#ffdb8a" opacity="0.9"/>
        </svg>`;
      } else {
        svgHtml = `<svg width="34" height="30" viewBox="0 0 34 30">
          <rect x="2" y="4" width="30" height="26" fill="#101c30"/>
          <rect x="6" y="8" width="4" height="4" fill="#3fd9e8" opacity="0.5"/>
          <rect x="14" y="8" width="4" height="4" fill="#3fd9e8" opacity="0.3"/>
          <rect x="22" y="8" width="4" height="4" fill="#3fd9e8" opacity="0.5"/>
          <rect x="6" y="16" width="4" height="4" fill="#3fd9e8" opacity="0.3"/>
          <rect x="14" y="16" width="4" height="4" fill="#3fd9e8" opacity="0.5"/>
          <rect x="22" y="16" width="4" height="4" fill="#3fd9e8" opacity="0.3"/>
        </svg>`;
      }

      el.innerHTML = svgHtml;
      el.style.transform = `translate3d(${x}px, ${p.y}px, 0) translate(-50%,-100%) scale(${p.scale.toFixed(3)})`;
      layer.appendChild(el);
    });
  }, []);

  // 4. Build Dashed Road Centerline
  const buildDashes = useCallback(() => {
    const layer = dashLayerRef.current;
    if (!layer) return;
    layer.innerHTML = '';
    const N = 9;
    for (let i = 0; i < N; i++) {
      const el = document.createElement('div');
      el.className = 'convoy-dash';
      el.style.animationDelay = (-(i / N) * 2.6) + 's';
      layer.appendChild(el);
    }
  }, []);

  // 5. Build & Position Defects
  const buildDefects = useCallback(() => {
    const layer = defectLayerRef.current;
    const roadEl = containerRef.current;
    if (!layer || !roadEl) return;
    layer.innerHTML = '';
    defectBoxRefs.current = [];
    defectWrapRefs.current = [];

    const W = roadEl.clientWidth || 800;

    animStateRef.current.defects.forEach((d) => {
      const p = project(d.t);

      // Wrapper
      const wrap = document.createElement('div');
      wrap.className = 'absolute left-0 top-0 transform-gpu pointer-events-none';
      wrap.style.transformOrigin = 'center';

      let svgHtml = '';
      if (d.id === 'crack') {
        svgHtml = `<svg width="34" height="20" viewBox="0 0 34 20">
          <path d="M2 16 L9 9 L6 6 L15 2 L13 8 L21 4 L18 11 L27 7 L24 14 L32 10" fill="none" stroke="#0d1730" stroke-width="5" stroke-linecap="round"/>
          <path d="M2 16 L9 9 L6 6 L15 2 L13 8 L21 4 L18 11 L27 7 L24 14 L32 10" fill="none" stroke="${d.color}" stroke-width="1.6" stroke-linecap="round"/>
        </svg>`;
      } else if (d.id === 'obstacle') {
        svgHtml = `<svg width="30" height="34" viewBox="0 0 30 34">
          <ellipse cx="15" cy="30" rx="12" ry="3" fill="#000" opacity="0.35"/>
          <rect x="12.5" y="16" width="5" height="14" rx="1.5" fill="#6b4a2e"/>
          <circle cx="15" cy="12" r="11" fill="#2e7d5b"/>
          <circle cx="8" cy="16" r="7" fill="#2e7d5b"/>
          <circle cx="22" cy="16" r="7" fill="#2e7d5b"/>
        </svg>`;
      } else {
        svgHtml = `<svg width="34" height="18" viewBox="0 0 34 18">
          <ellipse cx="17" cy="10" rx="16" ry="7" fill="#0a0508" stroke="${d.color}" stroke-width="1.8"/>
          <ellipse cx="17" cy="10" rx="9" ry="3.6" fill="#1a0508"/>
        </svg>`;
      }

      wrap.innerHTML = `${svgHtml}<div class="absolute left-1/2 top-full -translate-x-1/2 mt-1 text-[9px] font-mono whitespace-nowrap text-white bg-[#060a14]/80 px-1.5 py-0.5 rounded border border-gray-800">${d.label}</div>`;
      wrap.style.transform = `translate3d(${W / 2}px, ${p.y}px, 0) translate(-50%,-50%) scale(${p.scale.toFixed(3)})`;
      layer.appendChild(wrap);
      defectWrapRefs.current.push(wrap);

      // Scanning Bounding Box
      const box = document.createElement('div');
      box.className = 'convoy-scan-box';
      box.style.borderColor = d.color;
      layer.appendChild(box);
      defectBoxRefs.current.push(box);
    });
  }, []);

  // 6. Build Buses in Road Viewport
  const buildBusEls = useCallback(() => {
    const layer = busLayerRef.current;
    if (!layer) return;
    layer.innerHTML = '';
    busDomRefs.current = [];

    [0, 1, 2].forEach((i) => {
      const wrap = document.createElement('div');
      wrap.className = 'absolute left-0 top-0 transform-gpu';
      wrap.style.display = 'none';

      const color = BUS_COLORS[i];
      const name = BUS_NAMES[i];

      wrap.innerHTML = `
        <div class="absolute left-1/2 -bottom-1 w-[34px] h-[8px] -ml-[17px] rounded-full bg-black/60 blur-[1px]"></div>
        <svg width="40" height="30" viewBox="0 0 40 30" class="block">
          <rect x="4" y="4" width="32" height="20" rx="5" fill="#101a30" stroke="${color}" stroke-width="2"/>
          <rect x="8" y="8" width="9" height="7" rx="1.5" fill="${color}" opacity="0.55"/>
          <rect x="20" y="8" width="9" height="7" rx="1.5" fill="${color}" opacity="0.55"/>
          <circle cx="11" cy="26" r="3" fill="#0a0f1e" stroke="${color}" stroke-width="1.5"/>
          <circle cx="29" cy="26" r="3" fill="#0a0f1e" stroke="${color}" stroke-width="1.5"/>
          <circle cx="9" cy="19" r="1.4" fill="#fff"/>
          <circle cx="31" cy="19" r="1.4" fill="#fff"/>
        </svg>
        <div class="absolute left-1/2 bottom-full -translate-x-1/2 -mb-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0a1120]/90 border border-gray-700 whitespace-nowrap" style="color:${color}">
          ${name}
        </div>
        <div class="convoy-flash-ring" style="border-color:${color}"></div>
      `;
      layer.appendChild(wrap);
      busDomRefs.current.push(wrap);
    });
  }, []);

  // 7. Build Progress Track Flags & Buses
  const buildProgressTrack = useCallback(() => {
    const track = progressTrackRef.current;
    if (!track) return;
    track.innerHTML = '';
    progBusRefs.current = [];

    // Defect Flags on Track
    INITIAL_DEFECTS.forEach((d) => {
      const flag = document.createElement('div');
      flag.className = 'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#060a14] z-10';
      flag.style.left = (d.t * 100) + '%';
      flag.style.background = d.color;
      flag.innerHTML = `<div class="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-gray-400 whitespace-nowrap">${d.label}</div>`;
      track.appendChild(flag);
    });

    // Progress Bus Indicator Dots
    [0, 1, 2].forEach((i) => {
      const el = document.createElement('div');
      el.className = 'absolute top-1/2 w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg transition-transform';
      el.style.background = BUS_COLORS[i];
      el.style.boxShadow = `0 0 8px ${BUS_COLORS[i]}`;
      el.style.display = 'none';
      track.appendChild(el);
      progBusRefs.current.push(el);
    });
  }, []);

  // 8. Rebuild buses model array
  const rebuildBusesState = useCallback(() => {
    busesStateRef.current = [];
    const count = animStateRef.current.busCount;
    for (let i = 0; i < count; i++) {
      busesStateRef.current.push({
        idx: i,
        name: BUS_NAMES[i],
        color: BUS_COLORS[i],
        startOffset: i * STAGGER,
        lap: -1,
        flagged: {},
      });
    }
    busDomRefs.current.forEach((el) => { if (el) el.style.display = 'none'; });
    progBusRefs.current.forEach((el) => { if (el) el.style.display = 'none'; });
  }, []);

  // Layout all elements on resize or mount
  const handleLayout = useCallback(() => {
    buildRoad();
    buildSkyline();
    layoutScenery();
    buildDefects();
  }, [buildRoad, buildSkyline, layoutScenery, buildDefects]);

  // Handle Detection Trigger
  const handleDetection = (bus, defect, defectIndex) => {
    animStateRef.current.totalDetections += 1;
    setTotalDetections(animStateRef.current.totalDetections);

    // Update Defect Observations & Confidence
    const targetDef = animStateRef.current.defects[defectIndex];
    targetDef.obs += 1;
    targetDef.conf = Math.min(97, targetDef.base + (targetDef.obs - 1) * 6.5);
    setDefects([...animStateRef.current.defects]);

    // Animate Scan Bounding Box
    const box = defectBoxRefs.current[defectIndex];
    const roadEl = containerRef.current;
    if (box && roadEl) {
      const p = project(targetDef.t);
      const W = roadEl.clientWidth || 800;
      const size = 48 * p.scale;
      box.style.transform = `translate3d(${W / 2}px, ${p.y}px, 0) translate(-50%,-50%)`;
      box.style.width = size + 'px';
      box.style.height = (size * 0.65) + 'px';
      box.classList.remove('show');
      void box.offsetWidth;
      box.classList.add('show');
      setTimeout(() => box.classList.remove('show'), 620);
    }

    // Animate Bus Camera Flash Ring
    const busEl = busDomRefs.current[bus.idx];
    if (busEl) {
      const ring = busEl.querySelector('.convoy-flash-ring');
      if (ring) {
        ring.classList.remove('go');
        void ring.offsetWidth;
        ring.classList.add('go');
      }
    }

    // Flash Screen Overlay
    if (flashRef.current) {
      flashRef.current.classList.remove('go');
      void flashRef.current.offsetWidth;
      flashRef.current.classList.add('go');
    }

    // Push to log
    pushLog(
      `<b style="color:${bus.color}">${bus.name}</b> detected <b style="color:${targetDef.color}">${targetDef.label}</b> · GPS ${targetDef.gps} · confidence now <b>${targetDef.conf.toFixed(1)}%</b> (observation #${targetDef.obs})`
    );

    // Live Cloud & MQTT Backend Sync Ingest
    if (cloudSyncEnabled) {
      const latVal = parseFloat(targetDef.gps.split('°N')[0]) || 31.6342;
      const lngVal = parseFloat(targetDef.gps.split('°E')[0].split(', ')[1]) || 74.8728;
      api.post('/api/simulation/convoy_scan', {
        bus_code: bus.name,
        route_id: 'R-12',
        latitude: latVal,
        longitude: lngVal,
        detection_class: targetDef.id === 'obstacle' ? 'obstacle' : (targetDef.id === 'crack' ? 'road_crack' : 'pothole'),
        confidence: targetDef.conf / 100,
        severity: targetDef.severity.toLowerCase(),
        depth_estimate: targetDef.id === 'pothole' ? '58mm' : '12mm',
        corroboration_pass: targetDef.obs
      }).then((res) => {
        if (res?.data) {
          pushLog(
            `<span style="color:#33d69f">☁️ [MQTT & CLOUD ACK]</span> <b>${res.data.mqtt_topic}</b> · Incident <b>${res.data.incident_code || 'INC-SYNC'}</b> · Corroborated: <b>${res.data.multi_bus_verified ? 'MULTI-BUS VERIFIED' : `PASS #${res.data.confirmations_count}`}</b> · Work Order: <b>${res.data.work_order_code || 'IN QUEUE'}</b>`
          );
        }
      }).catch((err) => {
        console.warn('Simulation convoy sync warning:', err);
      });
    }
  };

  // Main 60 FPS Animation Tick Loop
  const tick = useCallback((now) => {
    if (!animStateRef.current.running) return;

    if (animStateRef.current.lastFrameTime) {
      const dt = now - animStateRef.current.lastFrameTime;
      animStateRef.current.fpsAccum += 1000 / dt;
      animStateRef.current.frameCount++;
      if (animStateRef.current.frameCount >= 30) {
        setFps(Math.round(animStateRef.current.fpsAccum / animStateRef.current.frameCount));
        animStateRef.current.fpsAccum = 0;
        animStateRef.current.frameCount = 0;
      }
    }
    animStateRef.current.lastFrameTime = now;

    const elapsed = now - animStateRef.current.simStart;
    const roadEl = containerRef.current;
    const W = roadEl ? (roadEl.clientWidth || 800) : 800;
    const cycle = LAP_DURATION + LAP_GAP;

    const activeBuses = busesStateRef.current;
    for (let bi = 0; bi < activeBuses.length; bi++) {
      const bus = activeBuses[bi];
      const local = elapsed - bus.startOffset;

      if (local < 0) {
        if (busDomRefs.current[bi]) busDomRefs.current[bi].style.display = 'none';
        if (progBusRefs.current[bi]) progBusRefs.current[bi].style.display = 'none';
        continue;
      }

      const lapIndex = Math.floor(local / cycle);
      const localInLap = local % cycle;

      if (lapIndex !== bus.lap) {
        bus.lap = lapIndex;
        bus.flagged = {};
        if (lapIndex > 0) {
          animStateRef.current.totalPasses += 1;
          setTotalPasses(animStateRef.current.totalPasses);
        }
      }

      const t = localInLap / LAP_DURATION;

      if (t > 1) {
        if (busDomRefs.current[bi]) busDomRefs.current[bi].style.display = 'none';
        if (progBusRefs.current[bi]) progBusRefs.current[bi].style.display = 'none';
        continue;
      }

      if (busDomRefs.current[bi]) busDomRefs.current[bi].style.display = '';
      if (progBusRefs.current[bi]) progBusRefs.current[bi].style.display = '';

      const p = project(t);
      if (busDomRefs.current[bi]) {
        busDomRefs.current[bi].style.transform = `translate3d(${W / 2}px, ${p.y}px, 0) translate(-50%,-50%) scale(${p.scale.toFixed(3)})`;
      }
      if (progBusRefs.current[bi]) {
        progBusRefs.current[bi].style.left = (t * 100) + '%';
      }

      // Detection Check
      for (let di = 0; di < animStateRef.current.defects.length; di++) {
        const defect = animStateRef.current.defects[di];
        if (!bus.flagged[defect.id] && t >= defect.t - DETECT_EPS && t <= defect.t + 0.25) {
          bus.flagged[defect.id] = true;
          handleDetection(bus, defect, di);
        }
      }
    }

    animStateRef.current.rafId = requestAnimationFrame(tick);
  }, [pushLog]);

  const startConvoy = () => {
    animStateRef.current.running = true;
    animStateRef.current.simStart = performance.now();
    animStateRef.current.lastFrameTime = 0;
    animStateRef.current.fpsAccum = 0;
    animStateRef.current.frameCount = 0;
    busesStateRef.current.forEach((b) => { b.lap = -1; b.flagged = {}; });

    setRunning(true);
    if (animStateRef.current.rafId) cancelAnimationFrame(animStateRef.current.rafId);
    animStateRef.current.rafId = requestAnimationFrame(tick);
  };

  const pauseConvoy = () => {
    animStateRef.current.running = false;
    if (animStateRef.current.rafId) cancelAnimationFrame(animStateRef.current.rafId);
    setRunning(false);
  };

  const resetConvoy = () => {
    pauseConvoy();
    animStateRef.current.totalPasses = 0;
    animStateRef.current.totalDetections = 0;
    animStateRef.current.defects = JSON.parse(JSON.stringify(INITIAL_DEFECTS));
    setTotalPasses(0);
    setTotalDetections(0);
    setDefects(JSON.parse(JSON.stringify(INITIAL_DEFECTS)));
    setLogs([]);
    busDomRefs.current.forEach((el) => { if (el) el.style.display = 'none'; });
    progBusRefs.current.forEach((el) => { if (el) el.style.display = 'none'; });
  };

  const handleBusCountChange = (count) => {
    setBusCount(count);
    animStateRef.current.busCount = count;
    resetConvoy();
    rebuildBusesState();
  };

  // Mount effect
  useEffect(() => {
    buildProgressTrack();
    buildBusEls();
    buildDashes();
    handleLayout();
    rebuildBusesState();

    const onResize = () => {
      handleLayout();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (animStateRef.current.rafId) cancelAnimationFrame(animStateRef.current.rafId);
    };
  }, [buildProgressTrack, buildBusEls, buildDashes, handleLayout, rebuildBusesState]);

  return (
    <div className="w-full rounded-3xl overflow-hidden bg-[#060a14] border border-[#1c2b45] shadow-2xl p-4 sm:p-6 space-y-4 font-mono text-gray-100 relative">
      {/* Embedded CSS for custom Road Scene animations */}
      <style>{`
        @keyframes dashFlow {
          0% { transform: translate3d(0px, 46px, 0) scale(0.18); opacity: 0.12; }
          12.5% { transform: translate3d(0px, 51.9px, 0) scale(0.198); opacity: 0.19; }
          25% { transform: translate3d(0px, 69.8px, 0) scale(0.25); opacity: 0.26; }
          37.5% { transform: translate3d(0px, 99.8px, 0) scale(0.337); opacity: 0.33; }
          50% { transform: translate3d(0px, 141.5px, 0) scale(0.46); opacity: 0.40; }
          62.5% { transform: translate3d(0px, 195px, 0) scale(0.617); opacity: 0.46; }
          75% { transform: translate3d(0px, 260.5px, 0) scale(0.81); opacity: 0.53; }
          87.5% { transform: translate3d(0px, 338px, 0) scale(1.037); opacity: 0.60; }
          100% { transform: translate3d(0px, 428px, 0) scale(1.3); opacity: 0.67; }
        }
        .convoy-dash {
          position: absolute;
          left: 50%;
          top: 0;
          width: 5px;
          height: 16px;
          margin-left: -2.5px;
          margin-top: -8px;
          border-radius: 2px;
          background: #ffe38a;
          will-change: transform, opacity;
          animation: dashFlow 2.6s linear infinite;
        }
        .convoy-scan-box {
          position: absolute;
          left: 0;
          top: 0;
          border: 2px dashed;
          border-radius: 6px;
          opacity: 0;
          pointer-events: none;
          z-index: 8;
        }
        .convoy-scan-box.show {
          opacity: 1;
          animation: convoyBoxPulse 0.65s ease-out;
        }
        @keyframes convoyBoxPulse {
          0% { box-shadow: 0 0 0 rgba(255, 255, 255, 0); }
          40% { box-shadow: 0 0 18px rgba(255, 255, 255, 0.35); }
          100% { box-shadow: 0 0 0 rgba(255, 255, 255, 0); }
        }
        .convoy-flash-ring {
          position: absolute;
          left: 50%;
          top: 0;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #fff;
          opacity: 0;
          pointer-events: none;
        }
        .convoy-flash-ring.go {
          animation: convoyRingOut 0.6s ease-out;
        }
        @keyframes convoyRingOut {
          0% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.4); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(5); }
        }
        .convoy-flash-overlay.go {
          animation: convoyFlashPop 0.5s ease;
        }
        @keyframes convoyFlashPop {
          0% { opacity: 0.5; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-[#1c2b45] bg-gradient-to-b from-[#0e1830] to-[#0a1120] shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3fd9e8] via-[#4d8dff] to-[#9a6bff] shadow-lg shadow-cyan-500/25 flex items-center justify-center text-white shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide font-heading">
              FLEET VISION — LIVE CONVOY ROAD-SCAN
            </h2>
            <p className="text-[11px] text-[#5f7290] mt-0.5 tracking-wider font-mono uppercase">
              MULTIPLE BUSES • SAME ROUTE • CONFIDENCE COMPOUNDS PASS AFTER PASS
            </p>
          </div>
        </div>

        {/* Bus Count Toggle (2 or 3 Buses) */}
        <div className="flex items-center space-x-1.5 p-1 bg-[#060a14] border border-[#1c2b45] rounded-xl text-xs">
          <button
            onClick={() => handleBusCountChange(2)}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              busCount === 2
                ? 'bg-[#0e1830] text-white shadow-inner border border-[#1c2b45]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            2 Buses
          </button>
          <button
            onClick={() => handleBusCountChange(3)}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              busCount === 3
                ? 'bg-[#0e1830] text-white shadow-inner border border-[#1c2b45]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            3 Buses
          </button>
        </div>

        {/* Action Controls & Live Status */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Live Cloud & MQTT Sync Indicator */}
          <button
            onClick={() => setCloudSyncEnabled(!cloudSyncEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center space-x-1.5 border transition ${
              cloudSyncEnabled
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-900/40'
                : 'bg-gray-900/70 border-gray-700 text-gray-400'
            }`}
            title="Toggle live ingestion to FastAPI cloud database and MQTT broker"
          >
            <span className={`w-2 h-2 rounded-full ${cloudSyncEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
            <span className="font-bold">Cloud/MQTT: {cloudSyncEnabled ? 'LIVE SYNC' : 'OFFLINE'}</span>
          </button>

          <div className="flex items-center space-x-2 text-[#9fb0cc] bg-[#0a1120] px-3 py-1.5 rounded-xl border border-[#1c2b45]">
            <span
              className={`w-2 h-2 rounded-full ${
                running ? 'bg-[#ff5470] animate-ping' : 'bg-gray-600'
              }`}
            />
            <span className="font-semibold">{running ? 'Convoy running' : 'Idle'}</span>
            {running && <span className="text-[10px] text-gray-500 font-mono ml-1">({fps} fps)</span>}
          </div>

          <button
            onClick={resetConvoy}
            className="px-3.5 py-2 rounded-xl bg-[#0e1830] hover:bg-[#142244] text-[#9fb0cc] hover:text-white border border-[#1c2b45] font-bold transition flex items-center space-x-1.5 shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={running ? pauseConvoy : startConvoy}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 shadow-lg ${
              running
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-gradient-to-r from-[#5fe6f2] to-[#3fd9e8] text-[#04121c] font-black shadow-cyan-400/30'
            }`}
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{running ? 'Pause' : 'Start Convoy'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Road Scene (Left) + Intelligence Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT 8 COLS: The 3D Road Scene Card */}
        <div className="lg:col-span-8 border border-[#1c2b45] rounded-2xl bg-[#070c18] overflow-hidden relative flex flex-col shadow-2xl">
          <div className="absolute top-3.5 left-4 z-20 flex items-center space-x-2 text-xs font-bold text-gray-200 pointer-events-none">
            <span className="text-[10px] font-black bg-[#3fd9e8] text-[#04121c] px-2 py-0.5 rounded uppercase">
              3D VIEW
            </span>
            <span>Road-side scanner — buses approaching on Route R-02</span>
          </div>

          {/* 3D Road Canvas Viewport */}
          <div
            ref={containerRef}
            className="relative h-[440px] overflow-hidden bg-gradient-to-b from-[#0a1020] via-[#101c14] to-[#0c1610] isolate"
          >
            {/* Stars background */}
            <div
              className="absolute inset-0 top-0 h-[15%] pointer-events-none z-0 opacity-60"
              style={{
                backgroundImage: `
                  radial-gradient(1px 1px at 10% 30%, rgba(255,255,255,.5), transparent),
                  radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,.35), transparent),
                  radial-gradient(1px 1px at 50% 20%, rgba(255,255,255,.4), transparent),
                  radial-gradient(1px 1px at 70% 70%, rgba(255,255,255,.3), transparent),
                  radial-gradient(1px 1px at 85% 35%, rgba(255,255,255,.5), transparent),
                  radial-gradient(1px 1px at 95% 55%, rgba(255,255,255,.3), transparent)
                `
              }}
            />

            {/* Horizon Glow */}
            <div
              className="absolute left-0 right-0 top-11 h-[70px] pointer-events-none z-10"
              style={{
                background: 'radial-gradient(320px 46px at 50% 40%, rgba(63,217,232,0.22), transparent 70%)'
              }}
            />

            {/* Distant Skyline */}
            <svg
              ref={skylineSvgRef}
              className="absolute left-0 right-0 top-5 h-11 opacity-55 z-0 pointer-events-none w-full"
              preserveAspectRatio="none"
            />

            {/* Perspective Road SVG */}
            <svg ref={roadSvgRef} className="absolute inset-0 z-10 w-full h-full" />

            {/* Scenery Layer (Trees & Lamps along road) */}
            <div ref={sceneryLayerRef} className="absolute inset-0 z-10 pointer-events-none" />

            {/* Dash Centerline Layer */}
            <div ref={dashLayerRef} className="absolute inset-0 z-10 pointer-events-none" />

            {/* Defect Layer (Crater, Crack, Tree) */}
            <div ref={defectLayerRef} className="absolute inset-0 z-20 pointer-events-none" />

            {/* Bus Layer */}
            <div ref={busLayerRef} className="absolute inset-0 z-30" />

            {/* Full Camera Flash Effect */}
            <div
              ref={flashRef}
              className="convoy-flash-overlay absolute inset-0 bg-white opacity-0 pointer-events-none z-40"
            />
          </div>

          {/* Progress Strip Below Road */}
          <div className="border-t border-[#1c2b45] p-4 bg-[#0a1120]">
            <div className="flex justify-between text-[10px] text-[#5f7290] font-mono mb-2">
              <span>Route start</span>
              <span>Route end • Mall Road, R-02</span>
            </div>
            <div
              ref={progressTrackRef}
              className="relative h-2.5 bg-[#0e1830] rounded-full border border-[#1c2b45] my-4"
            />
          </div>
        </div>

        {/* RIGHT 4 COLS: Intelligence Dashboard */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Panel 1: Fused Detection Confidence */}
          <div className="p-4 rounded-2xl bg-[#0a1120] border border-[#1c2b45] space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-heading">
              <span className="w-2 h-2 rounded-full bg-[#3fd9e8] shadow-sm shadow-cyan-400" />
              <span>Fused Detection Confidence</span>
            </h3>

            <div className="space-y-2.5">
              {defects.map((d) => (
                <div key={d.id} className="p-2.5 rounded-xl bg-[#0e1830] border border-[#141f36] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold font-heading text-white">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span>{d.label}</span>
                    </div>
                    <span
                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase"
                      style={{
                        backgroundColor: `${d.color}22`,
                        color: d.color,
                        borderColor: d.color
                      }}
                    >
                      {d.severity}
                    </span>
                  </div>

                  {/* Confidence Progress Bar */}
                  <div className="h-2 rounded-full bg-[#060a14] border border-[#1c2b45] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${d.conf}%`,
                        background: `linear-gradient(90deg, ${d.color}, #ffffff55)`
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-[#5f7290] font-mono">
                    <span>
                      Confidence: <strong className="text-gray-200">{d.conf.toFixed(1)}%</strong>
                    </span>
                    <span>
                      Obs: <strong className="text-gray-200">{d.obs}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 2: Live Convoy Telemetry Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-[#0a1120] border border-[#1c2b45] rounded-xl text-center shadow-lg">
              <div className="text-xl font-black text-white font-heading">{totalPasses}</div>
              <div className="text-[9px] text-[#5f7290] uppercase font-bold mt-0.5">Total Passes</div>
            </div>
            <div className="p-3 bg-[#0a1120] border border-[#1c2b45] rounded-xl text-center shadow-lg">
              <div className="text-xl font-black text-[#3fd9e8] font-heading">{totalDetections}</div>
              <div className="text-[9px] text-[#5f7290] uppercase font-bold mt-0.5">Detections</div>
            </div>
            <div className="p-3 bg-[#0a1120] border border-[#1c2b45] rounded-xl text-center shadow-lg">
              <div className="text-xl font-black text-[#9a6bff] font-heading">{busCount}</div>
              <div className="text-[9px] text-[#5f7290] uppercase font-bold mt-0.5">Active Buses</div>
            </div>
          </div>

          {/* Panel 3: Live Detection Log Stream */}
          <div className="p-4 rounded-2xl bg-[#0a1120] border border-[#1c2b45] flex-1 flex flex-col space-y-2.5 shadow-xl min-h-[220px]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-heading">
              <span className="w-2 h-2 rounded-full bg-[#33d69f] shadow-sm shadow-emerald-400" />
              <span>Live Detection Log</span>
            </h3>

            <div
              ref={logContainerRef}
              className="flex-1 space-y-1.5 max-h-[220px] overflow-y-auto pr-1 text-[10.5px] text-[#9fb0cc]"
            >
              {logs.length === 0 ? (
                <div className="text-[11px] text-gray-500 italic text-center py-6">
                  Press &quot;Start Convoy&quot; to begin road scanning...
                </div>
              ) : (
                logs.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-xl bg-[#0e1830] border border-[#141f36] leading-relaxed"
                  >
                    <span className="text-[#3fd9e8] font-bold mr-1.5">[{item.time}]</span>
                    <span dangerouslySetInnerHTML={{ __html: item.html }} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetConvoyRoadScan;
