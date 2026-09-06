import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Camera, 
  Cpu, 
  AlertTriangle, 
  MapPin, 
  Filter, 
  Wifi, 
  Server, 
  CheckCheck, 
  Award, 
  Lock, 
  Database, 
  BarChart3, 
  Bell, 
  ClipboardList, 
  Share2, 
  Wrench, 
  ShieldAlert, 
  HeartPulse, 
  Flame, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  TrendingUp, 
  Play, 
  RotateCcw, 
  ChevronRight, 
  CheckCircle2, 
  ArrowDown, 
  FileCode,
  Zap,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

const SIMULATION_SCENARIOS = [
  {
    id: 'pothole',
    name: 'Severe Pothole (Route R-02)',
    type: 'ROAD_DEFECT',
    severity: 'HIGH',
    busId: 'BUS-104',
    location: 'Mall Road Junction, Amritsar',
    coords: '31.6342° N, 74.8728° E',
    speed: '38 km/h',
    camera: 'Front Camera (1080p HDR)',
    confidence: '96.4%',
    branch: 'CRITICAL',
    workOrderDept: 'Municipal Road Maintenance Crew',
    sla: '4 Hours',
    estimatedCost: '₹2,400',
    impact: 'Prevents two-wheeler skids & tire bursts'
  },
  {
    id: 'accident',
    name: 'Traffic Collision (GT Road Flyover)',
    type: 'ACCIDENT',
    severity: 'CRITICAL',
    busId: 'BUS-107',
    location: 'GT Road Flyover Approach, Sector 9',
    coords: '31.6410° N, 74.8690° E',
    speed: '44 km/h',
    camera: 'Wide-Angle Transit Cam',
    confidence: '98.8%',
    branch: 'CRITICAL',
    workOrderDept: 'Traffic Police & Emergency EMS',
    sla: '8 Minutes',
    estimatedCost: 'Emergency Golden Hour Response',
    impact: 'Saves lives through rapid ambulance triage'
  },
  {
    id: 'waterlogging',
    name: 'Monsoon Waterlogging (Civil Lines)',
    type: 'INFRASTRUCTURE',
    severity: 'MEDIUM',
    busId: 'BUS-112',
    location: 'Civil Lines Near Underpass',
    coords: '31.6280° N, 74.8815° E',
    speed: '26 km/h',
    camera: 'Front + Left Curb Cams',
    confidence: '92.5%',
    branch: 'NORMAL',
    workOrderDept: 'Drainage & Disaster Management',
    sla: '2 Hours',
    estimatedCost: '₹4,500 pump drainage',
    impact: 'Averts bus route disruption & pedestrian hazard'
  }
];

const PIPELINE_STEPS = [
  { id: 1, name: 'Bus Cameras Capture', layer: 'edge', desc: 'Front, Rear, Side & Cabin video capture (1080p @ 30 FPS)' },
  { id: 2, name: 'Edge AI Processing', layer: 'edge', desc: 'YOLOv11 TensorRT runs locally on NVIDIA Jetson (<28ms)' },
  { id: 3, name: 'Event Generation', layer: 'edge', desc: 'Bounding box tagged: type, severity, and confidence score' },
  { id: 4, name: 'GPS & Timestamp Tag', layer: 'edge', desc: 'Sub-meter RTK GPS coordinates + UTC microsecond timestamp' },
  { id: 5, name: 'Local Filtering & DPDP', layer: 'edge', desc: 'Discard frames <85% conf; purge raw video for DPDP compliance' },
  { id: 6, name: 'Wireless Transmission', layer: 'uplink', desc: '4G/5G encrypted ~1KB metadata JSON emitted via MQTT' },
  { id: 7, name: 'Data Aggregation', layer: 'fog', desc: 'Depot gateway ingests streams from 120+ transit buses' },
  { id: 8, name: 'Spatial Deduplication', layer: 'fog', desc: 'Clustering matches within 15m radius across multiple buses' },
  { id: 9, name: 'Priority Classification', layer: 'fog', desc: 'Dynamic impact scoring (multi-bus confirmation + traffic)' },
  { id: 10, name: 'Secure Routing', layer: 'fog', desc: 'Critical alert routed via high-priority secure REST webhook' },
  { id: 11, name: 'Central GIS Platform', layer: 'cloud', desc: 'PostGIS spatial database updates city-wide asset layer' },
  { id: 12, name: 'Analytics & Heatmap', layer: 'cloud', desc: 'Roughness index (IRI) & ward health scorecards updated' },
  { id: 13, name: 'Real-time Broadcast', layer: 'cloud', desc: 'WebSockets push alert to Municipal Command Center dashboard' },
  { id: 14, name: 'Auto Work Order Dispatch', layer: 'cloud', desc: 'Work Order #WO-9041 auto-generated with SLA deadline' },
  { id: 15, name: 'Authority Field Action', layer: 'action', desc: 'Field repair team arrives on-site and executes resolution' }
];

const WorkflowViewer = () => {
  const [selectedScenario, setSelectedScenario] = useState(SIMULATION_SCENARIOS[0]);
  const [activeStep, setActiveStep] = useState(0); // 0 = idle, 1..15 = running
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram', 'payload', 'impact'
  const [inspectedStep, setInspectedStep] = useState(null);

  // Automatic Step-by-Step Pipeline Simulation
  useEffect(() => {
    let timer;
    if (isPlaying && activeStep < 15) {
      timer = setTimeout(() => {
        setActiveStep((prev) => prev + 1);
      }, 1000);
    } else if (activeStep >= 15) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStep]);

  const startSimulation = () => {
    setActiveStep(1);
    setIsPlaying(true);
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setActiveStep(0);
  };

  // Mock Metadata Payload (~0.9 KB)
  const simulatedPayload = {
    event_id: `EVT-2026-${selectedScenario.id.toUpperCase()}-849`,
    bus_code: selectedScenario.busId,
    route_id: 'R-02',
    timestamp_utc: new Date().toISOString(),
    event_type: selectedScenario.type,
    severity: selectedScenario.severity,
    confidence: selectedScenario.confidence,
    gps_coordinates: {
      latitude: 31.6342,
      longitude: 74.8728,
      accuracy_meters: 0.85
    },
    camera_source: selectedScenario.camera,
    edge_device: {
      hardware: 'NVIDIA Jetson Orin Nano (8GB)',
      model: 'YOLOv11s-Seg-TensorRT',
      inference_ms: 28.4,
      gpu_temp_c: 42.6
    },
    privacy_compliance: {
      dpdp_act_2023: true,
      faces_blurred: true,
      license_plates_blurred: true,
      raw_video_persisted: false
    },
    routing: {
      protocol: 'MQTT / TLS 1.3',
      priority: selectedScenario.branch === 'CRITICAL' ? 'IMMEDIATE_URGENT' : 'BATCH_STORE_FORWARD'
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Matching User Workflow Poster */}
      <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/70 to-purple-950/80 border border-blue-800/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/25">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-heading">
                  UrbanEye AI — End-to-End Workflow
                </h1>
                <p className="text-xs text-cyan-300 font-semibold tracking-wide">
                  Transforming Public Buses into Smart City Sensors
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-300 mt-2 max-w-2xl leading-relaxed">
              From on-bus edge video inference to regional fog aggregation, cloud GIS intelligence, and automated municipal work order dispatch.
            </p>
          </div>

          {/* Interactive Simulation Controls Header */}
          <div className="bg-gray-950/80 border border-gray-800 p-3 rounded-2xl flex flex-wrap items-center gap-3 self-start md:self-auto shadow-xl">
            <div className="text-xs">
              <span className="text-[10px] text-gray-500 block uppercase font-mono">Scenario</span>
              <select
                value={selectedScenario.id}
                onChange={(e) => {
                  setSelectedScenario(SIMULATION_SCENARIOS.find(s => s.id === e.target.value));
                  resetSimulation();
                }}
                className="bg-gray-900 border border-gray-700 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 mt-0.5"
              >
                {SIMULATION_SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={isPlaying ? resetSimulation : startSimulation}
                className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center space-x-1.5 shadow-lg ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
                }`}
              >
                {isPlaying ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Reset Sim</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Simulate Live Event Flow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Simulation Progress Tracker Bar */}
        {activeStep > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-gray-300 font-bold">
                  Stage {activeStep} / 15: <strong className="text-cyan-300">{PIPELINE_STEPS[activeStep - 1]?.name}</strong>
                </span>
              </div>
              <span className="text-gray-400 text-[11px] font-mono">
                {PIPELINE_STEPS[activeStep - 1]?.desc}
              </span>
            </div>
            <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden border border-gray-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${(activeStep / 15) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Workflow Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-950/80 p-1.5 rounded-2xl border border-gray-800">
        <div className="flex space-x-1">
          {[
            { id: 'diagram', label: 'Architecture Workflow Diagram', icon: Layers },
            { id: 'payload', label: 'Edge Payload Inspector (~0.9 KB)', icon: FileCode },
            { id: 'impact', label: 'Authority Action & Impact Matrix', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[11px] text-gray-400 pr-3">
          <span className="text-cyan-400 font-mono">Status: {isPlaying ? 'SIMULATING...' : 'READY'}</span>
          <span>•</span>
          <span className="text-emerald-400">DPDP Act 2023 Compliant</span>
        </div>
      </div>

      {/* TAB 1: ARCHITECTURE WORKFLOW DIAGRAM */}
      {activeTab === 'diagram' && (
        <div className="space-y-6">
          {/* 3 Main Architectural Pillars Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* COLUMN 1: ON-BUS EDGE LAYER */}
            <div className="bg-gray-900/90 border border-blue-900/40 rounded-3xl p-5 shadow-2xl space-y-4 flex flex-col justify-between">
              <div>
                {/* Column Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-3 rounded-2xl text-white shadow-lg shadow-blue-900/40 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/40 border border-blue-400 flex items-center justify-center text-xs font-black">
                      1
                    </span>
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider">ON-BUS EDGE LAYER</h2>
                      <span className="text-[10px] text-blue-200 block">Capture → Detect → Tag</span>
                    </div>
                  </div>
                  <Bus className="w-5 h-5 text-cyan-300" />
                </div>

                {/* Steps 1 to 5 Stack */}
                <div className="space-y-2.5 mt-4">
                  {/* Step 1 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[0])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 1
                        ? 'bg-blue-600/30 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-blue-950 text-cyan-400 border border-blue-800 shrink-0 mt-0.5">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>1. BUS CAMERAS</span>
                          {activeStep === 1 && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Front, Rear, Side & Cabin Video Capture (1080p HDR)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center text-gray-600">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  {/* Step 2 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[1])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 2
                        ? 'bg-blue-600/30 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 shrink-0 mt-0.5">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>2. EDGE AI PROCESSING</span>
                          {activeStep === 2 && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Real-time YOLOv11 TensorRT models detect road, traffic & safety events
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center text-gray-600">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  {/* Step 3 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[2])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 3
                        ? 'bg-blue-600/30 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>3. EVENT GENERATION</span>
                          {activeStep === 3 && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Event type, severity classification, and confidence scoring
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center text-gray-600">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  {/* Step 4 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[3])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 4
                        ? 'bg-blue-600/30 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>4. GPS & TIMESTAMP</span>
                          {activeStep === 4 && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Sub-meter RTK location + microsecond time tagging
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center text-gray-600">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  {/* Step 5 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[4])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 5
                        ? 'bg-blue-600/30 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 shrink-0 mt-0.5">
                        <Filter className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>5. LOCAL FILTERING & PURGE</span>
                          {activeStep === 5 && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Remove low confidence (&lt;85%) & discard raw video for privacy
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Branching Decision Box */}
                <div className="mt-4 pt-3 border-t border-gray-800 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Intelligent Traffic Classification:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2.5 rounded-xl border ${
                      selectedScenario.branch === 'CRITICAL'
                        ? 'bg-red-950/60 border-red-800 text-red-300 ring-1 ring-red-500/50'
                        : 'bg-gray-950/50 border-gray-800 text-gray-400'
                    }`}>
                      <div className="font-bold text-white flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span>CRITICAL EVENT</span>
                      </div>
                      <span className="text-[10px] text-red-300 block mt-1 leading-snug">
                        Instant Alert (Accident, Rash Driving, Hit & Run)
                      </span>
                    </div>

                    <div className={`p-2.5 rounded-xl border ${
                      selectedScenario.branch === 'NORMAL'
                        ? 'bg-amber-950/60 border-amber-800 text-amber-300 ring-1 ring-amber-500/50'
                        : 'bg-gray-950/50 border-gray-800 text-gray-400'
                    }`}>
                      <div className="font-bold text-white flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>NORMAL EVENT</span>
                      </div>
                      <span className="text-[10px] text-amber-300 block mt-1 leading-snug">
                        Store & Forward (Road Defects, Traffic, Infrastructure)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edge Output Uplink Connector */}
              <div className={`mt-4 p-3 rounded-2xl border transition flex items-center justify-between text-xs ${
                activeStep === 6
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-950 border-blue-900/40 text-gray-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold">4G/5G or Wi-Fi Uplink</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300">~1KB Encrypted JSON</span>
              </div>
            </div>

            {/* COLUMN 2: FOG GATEWAY (DEPOT / REGIONAL) */}
            <div className="bg-gray-900/90 border border-emerald-900/40 rounded-3xl p-5 shadow-2xl space-y-4 flex flex-col justify-between">
              <div>
                {/* Column Header */}
                <div className="bg-gradient-to-r from-emerald-700 to-teal-900 p-3 rounded-2xl text-white shadow-lg shadow-emerald-900/40 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/40 border border-emerald-400 flex items-center justify-center text-xs font-black">
                      2
                    </span>
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider">FOG GATEWAY (DEPOT / REGIONAL)</h2>
                      <span className="text-[10px] text-emerald-200 block">Aggregate → Validate → Prioritize</span>
                    </div>
                  </div>
                  <Server className="w-5 h-5 text-emerald-300" />
                </div>

                {/* Steps 7 to 10 Stack */}
                <div className="space-y-3 mt-4">
                  {/* Fog Step 1 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[6])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 7
                        ? 'bg-emerald-600/30 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800 shrink-0 mt-0.5">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>DATA AGGREGATION</span>
                          {activeStep === 7 && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Collect real-time telemetry streams from 120+ transit buses across city
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center text-gray-600">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  {/* Fog Step 2 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[7])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 8
                        ? 'bg-emerald-600/30 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0 mt-0.5">
                        <CheckCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>VALIDATION & DEDUPLICATION</span>
                          {activeStep === 8 && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Spatial matching (&lt;15m radius), remove duplicate reports, validate schemas
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center text-gray-600">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  {/* Fog Step 3 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[8])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 9
                        ? 'bg-emerald-600/30 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 shrink-0 mt-0.5">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>PRIORITY CLASSIFICATION</span>
                          {activeStep === 9 && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Assign dynamic priority based on multi-bus confirmation & traffic impact
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center text-gray-600">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  {/* Fog Step 4 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[9])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 10
                        ? 'bg-emerald-600/30 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800 shrink-0 mt-0.5">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>SECURE ROUTING</span>
                          {activeStep === 10 && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Route critical alerts instantly; batch upload normal events via AES-256
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fog to Cloud Connector */}
              <div className={`mt-4 p-3 rounded-2xl border transition flex items-center justify-between text-xs ${
                activeStep === 10
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-gray-950 border-emerald-900/40 text-gray-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Secure Cloud API Tunnel</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300">TLS 1.3 / OAuth2</span>
              </div>
            </div>

            {/* COLUMN 3: CLOUD COMMAND CENTER */}
            <div className="bg-gray-900/90 border border-purple-900/40 rounded-3xl p-5 shadow-2xl space-y-4 flex flex-col justify-between">
              <div>
                {/* Column Header */}
                <div className="bg-gradient-to-r from-purple-700 to-indigo-900 p-3 rounded-2xl text-white shadow-lg shadow-purple-900/40 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/40 border border-purple-400 flex items-center justify-center text-xs font-black">
                      3
                    </span>
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider">CLOUD COMMAND CENTER</h2>
                      <span className="text-[10px] text-purple-200 block">Analyze → Act → Improve</span>
                    </div>
                  </div>
                  <Database className="w-5 h-5 text-purple-300" />
                </div>

                {/* Steps 11 to 15 Stack */}
                <div className="space-y-2.5 mt-4">
                  {/* Cloud Step 1 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[10])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 11
                        ? 'bg-purple-600/30 border-purple-400 shadow-lg shadow-purple-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 shrink-0 mt-0.5">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>CENTRAL DATA PLATFORM</span>
                          {activeStep === 11 && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Store & manage all events with PostGIS spatial GIS mapping
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center text-gray-600">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  {/* Cloud Step 2 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[11])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 12
                        ? 'bg-purple-600/30 border-purple-400 shadow-lg shadow-purple-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800 shrink-0 mt-0.5">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>ANALYTICS & INSIGHTS</span>
                          {activeStep === 12 && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Heatmaps, road roughness (IRI), degradation predictions & reports
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center text-gray-600">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  {/* Cloud Step 3 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[12])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 13
                        ? 'bg-purple-600/30 border-purple-400 shadow-lg shadow-purple-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-pink-950 text-pink-400 border border-pink-800 shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>ALERTS & NOTIFICATIONS</span>
                          {activeStep === 13 && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Real-time alerts to authorities via WebSockets, App, SMS & Email
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center text-gray-600">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  {/* Cloud Step 4 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[13])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 14
                        ? 'bg-purple-600/30 border-purple-400 shadow-lg shadow-purple-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 shrink-0 mt-0.5">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>WORK ORDER GENERATION</span>
                          {activeStep === 14 && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Auto-create & assign tasks with SLA to concerned departments
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center text-gray-600">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  {/* Cloud Step 5 */}
                  <div
                    onClick={() => setInspectedStep(PIPELINE_STEPS[14])}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStep === 15
                        ? 'bg-purple-600/30 border-purple-400 shadow-lg shadow-purple-500/20 scale-[1.02]'
                        : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-blue-950 text-cyan-400 border border-blue-800 shrink-0 mt-0.5">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>MUNICIPAL INTEGRATION</span>
                          {activeStep === 15 && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Open REST APIs for Smart City ICCC, EMR/Ambulance, Traffic Police
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Order Auto-Dispatch Banner */}
              <div className={`mt-4 p-3 rounded-2xl border transition flex items-center justify-between text-xs ${
                activeStep >= 14
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'bg-gray-950 border-purple-900/40 text-gray-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span className="font-bold">Auto-Dispatched: {selectedScenario.workOrderDept}</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded">SLA: {selectedScenario.sla}</span>
              </div>
            </div>
          </div>

          {/* AUTHORITIES TAKE ACTION SECTION */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  AUTHORITIES TAKE ACTION (Multi-Agency Municipal Response)
                </h3>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">AUTOMATIC DISPATCH LINKED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Dept 1 */}
              <div className="p-4 bg-gray-950 rounded-2xl border border-blue-900/40 space-y-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Maintenance Teams</h4>
                    <span className="text-[10px] text-gray-500">Public Works Dept (PWD)</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Pothole patching, asphalt resurfacing, fallen branch clearance, and guardrail repair.
                </p>
                <div className="text-[10px] font-mono text-cyan-400 pt-1 border-t border-gray-900 flex justify-between">
                  <span>Avg Response:</span>
                  <strong>3.2 Hours</strong>
                </div>
              </div>

              {/* Dept 2 */}
              <div className="p-4 bg-gray-950 rounded-2xl border border-indigo-900/40 space-y-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Traffic Police</h4>
                    <span className="text-[10px] text-gray-500">City Control Room</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Accident investigation, gridlock diversion, rash driving challans, and obstruction clearing.
                </p>
                <div className="text-[10px] font-mono text-indigo-400 pt-1 border-t border-gray-900 flex justify-between">
                  <span>Avg Response:</span>
                  <strong>8 Minutes</strong>
                </div>
              </div>

              {/* Dept 3 */}
              <div className="p-4 bg-gray-950 rounded-2xl border border-red-900/40 space-y-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-red-950 text-red-400 border border-red-800">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Health Department</h4>
                    <span className="text-[10px] text-gray-500">Ambulance & Trauma EMS</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Golden-hour medical triage, nearest trauma center routing, and casualty evacuation.
                </p>
                <div className="text-[10px] font-mono text-red-400 pt-1 border-t border-gray-900 flex justify-between">
                  <span>Avg Response:</span>
                  <strong>5.4 Minutes</strong>
                </div>
              </div>

              {/* Dept 4 */}
              <div className="p-4 bg-gray-950 rounded-2xl border border-amber-900/40 space-y-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Disaster Response</h4>
                    <span className="text-[10px] text-gray-500">NDRF & Fire Services</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Monsoon waterlogging pumping, fallen electric wires, flooding, and road barricades.
                </p>
                <div className="text-[10px] font-mono text-amber-400 pt-1 border-t border-gray-900 flex justify-between">
                  <span>Avg Response:</span>
                  <strong>14 Minutes</strong>
                </div>
              </div>
            </div>
          </div>

          {/* QUANTIFIED IMPACT SECTION */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-gray-900 to-teal-950/40 border border-emerald-800/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-900/50">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  MEASURABLE IMPACT & CITY BENEFITS
                </h3>
              </div>
              <span className="text-[10px] text-emerald-300 font-mono">BENCHMARKED VS TRADITIONAL</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-950/80 rounded-2xl border border-emerald-900/50">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Faster Detection</span>
                </div>
                <div className="text-2xl font-black text-white font-heading mt-2">21× Faster</div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Potholes identified in <strong>3 minutes</strong> instead of 7 to 14 days of citizen complaints.
                </p>
              </div>

              <div className="p-4 bg-gray-950/80 rounded-2xl border border-emerald-900/50">
                <div className="flex items-center space-x-2 text-cyan-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Cost Effective</span>
                </div>
                <div className="text-2xl font-black text-white font-heading mt-2">90% Savings</div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Leverages existing public buses instead of installing ₹38 Crores in static CCTV poles.
                </p>
              </div>

              <div className="p-4 bg-gray-950/80 rounded-2xl border border-emerald-900/50">
                <div className="flex items-center space-x-2 text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Safer Roads</span>
                </div>
                <div className="text-2xl font-black text-white font-heading mt-2">42% Fewer Skids</div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Early crater repair dramatically curtails two-wheeler accidents and vehicle suspension wear.
                </p>
              </div>

              <div className="p-4 bg-gray-950/80 rounded-2xl border border-emerald-900/50">
                <div className="flex items-center space-x-2 text-purple-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Data-Driven Cities</span>
                </div>
                <div className="text-2xl font-black text-white font-heading mt-2">100% Objective</div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Algorithmic International Roughness Index (IRI) guides municipal road budget tenders.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Workflow Poster Tagline */}
          <div className="p-4 bg-gray-950/90 rounded-2xl border border-gray-800 text-center text-xs text-gray-400">
            <span className="font-bold text-white">Proactive Monitoring</span>
            <span className="mx-2 text-gray-600">•</span>
            <span className="font-bold text-cyan-400">Real-time Alerts</span>
            <span className="mx-2 text-gray-600">•</span>
            <span className="font-bold text-indigo-400">Data-driven Decisions</span>
            <span className="mx-2 text-gray-600">•</span>
            <span className="font-bold text-emerald-400">Smarter & Safer Cities</span>
          </div>
        </div>
      )}

      {/* TAB 2: EDGE PAYLOAD INSPECTOR */}
      {activeTab === 'payload' && (
        <div className="space-y-5">
          {/* Comparison Banner: Heavy Video vs Anonymous JSON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-950/30 border border-red-800/60 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Traditional CCTV Upload</span>
                <span className="text-[10px] bg-red-950 text-red-300 font-mono px-2 py-0.5 rounded border border-red-800">UNSUSTAINABLE</span>
              </div>
              <div className="text-2xl font-black text-white font-heading">50 MB / 10s Video</div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Transmitting raw video streams over cellular LTE congests bandwidth, exhausts data limits, and exposes private citizen faces and license plates in violation of the DPDP Act 2023.
              </p>
              <div className="text-[11px] text-red-400 font-mono">
                ❌ Bandwidth cost: ~₹12,000/bus/month
              </div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">UrbanEye AI Edge Architecture</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-800">99.99% SAVINGS</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-heading font-mono">0.9 KB Encrypted JSON</div>
              <p className="text-xs text-gray-400 leading-relaxed">
                YOLOv11 extracts spatial coordinates and hazard classifications locally in volatile memory. Raw video is immediately discarded. Only encrypted, anonymous metadata is uploaded.
              </p>
              <div className="text-[11px] text-emerald-400 font-mono">
                ✓ Bandwidth cost: &lt;₹150/bus/month • DPDP Compliant
              </div>
            </div>
          </div>

          {/* Actual JSON Telemetry Inspector */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Live MQTT Edge Metadata Packet (urbaneye/bus/{selectedScenario.busId}/detections)
                </h3>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">ENCRYPTED AES-256-GCM</span>
            </div>

            <pre className="p-4 bg-gray-950 rounded-2xl border border-gray-800/80 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
              {JSON.stringify(simulatedPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: AUTHORITY ACTION & IMPACT MATRIX */}
      {activeTab === 'impact' && (
        <div className="space-y-5">
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white font-heading">
              Detailed Municipal Dispatch SLA Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="text-[10px] uppercase text-gray-500 border-b border-gray-800">
                  <tr>
                    <th className="pb-3">Event Type</th>
                    <th className="pb-3">Detection Method</th>
                    <th className="pb-3">Assigned Authority</th>
                    <th className="pb-3">SLA Target</th>
                    <th className="pb-3">Severity Rating</th>
                    <th className="pb-3 text-right">Estimated Cost Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  <tr className="hover:bg-gray-800/30">
                    <td className="py-3 font-bold text-white">Severe Pothole (&gt;50mm)</td>
                    <td className="py-3 font-mono text-cyan-400">Front Cam (YOLOv11s-Seg)</td>
                    <td className="py-3">PWD Road Maintenance Crew</td>
                    <td className="py-3 font-bold text-emerald-400">4 Hours</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded bg-red-950 text-red-400 text-[10px] font-bold">CRITICAL</span></td>
                    <td className="py-3 text-right font-mono text-gray-300">₹2,400 / crater</td>
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="py-3 font-bold text-white">Traffic Collision</td>
                    <td className="py-3 font-mono text-cyan-400">Wide-Angle Transit Cam</td>
                    <td className="py-3">Traffic Police + Trauma EMS</td>
                    <td className="py-3 font-bold text-red-400">8 Minutes</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded bg-red-950 text-red-400 text-[10px] font-bold">EMERGENCY</span></td>
                    <td className="py-3 text-right font-mono text-gray-300">Golden Hour Saved</td>
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="py-3 font-bold text-white">Monsoon Waterlogging</td>
                    <td className="py-3 font-mono text-cyan-400">Front + Curb Cameras</td>
                    <td className="py-3">Drainage & Disaster Management</td>
                    <td className="py-3 font-bold text-amber-400">2 Hours</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px] font-bold">HIGH</span></td>
                    <td className="py-3 text-right font-mono text-gray-300">₹4,500 / location</td>
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="py-3 font-bold text-white">Road Structural Crack</td>
                    <td className="py-3 font-mono text-cyan-400">YOLOv11 Crack Segmenter</td>
                    <td className="py-3">Highway Resurfacing Unit</td>
                    <td className="py-3 font-bold text-blue-400">48 Hours</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 text-[10px] font-bold">MEDIUM</span></td>
                    <td className="py-3 text-right font-mono text-gray-300">₹18,000 / km seal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Step Inspection Modal / Drawer */}
      {inspectedStep && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {inspectedStep.id}
                </span>
                <h3 className="text-sm font-bold text-white">{inspectedStep.name}</h3>
              </div>
              <button
                onClick={() => setInspectedStep(null)}
                className="text-gray-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-gray-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[10px] text-gray-500 uppercase block">Functional Scope</span>
                <p className="text-gray-200 mt-0.5 leading-relaxed">{inspectedStep.desc}</p>
              </div>

              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[10px] text-gray-500 uppercase block">Architecture Layer</span>
                <span className="text-cyan-400 font-bold uppercase font-mono mt-0.5 block">{inspectedStep.layer}</span>
              </div>
            </div>

            <button
              onClick={() => setInspectedStep(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowViewer;
