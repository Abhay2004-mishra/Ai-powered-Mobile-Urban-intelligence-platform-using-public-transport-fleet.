import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Cpu, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Radio, 
  Shield, 
  Layers, 
  Activity, 
  Sparkles,
  RefreshCw,
  Gauge,
  Thermometer,
  Zap,
  MapPin,
  Compass
} from 'lucide-react';

const EdgeVisionStudio = ({ onDetectionCaptured }) => {
  const [activeChannel, setActiveChannel] = useState('channel1');
  const [showBoxes, setShowBoxes] = useState(true);
  const [showHUD, setShowHUD] = useState(true);
  const [privacyBlur, setPrivacyBlur] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fps, setFps] = useState(29.8);
  const [gpuTemp, setGpuTemp] = useState(42.6);
  const [tensorRtLatency, setTensorRtLatency] = useState(28.4);
  const [lastCaptureToast, setLastCaptureToast] = useState('');

  // Channel video / simulation configurations
  const channels = {
    channel1: {
      busId: 'BUS-104',
      route: 'R-02 (Mall Road Corridor)',
      location: 'Mall Road Junction, Sector 4',
      lat: 31.6342,
      lng: 74.8728,
      speed: 38,
      heading: 142,
      cameraType: 'Front Dashcam 1080p HDR',
      primaryTarget: 'Pothole & Surface Fracture Detection',
      backgroundGrad: 'from-slate-900 via-gray-900 to-black',
      // Real-time bounding boxes
      detections: [
        {
          id: 'DET-POT-01',
          label: 'Severe Pothole',
          confidence: 0.964,
          severity: 'critical',
          box: { top: '56%', left: '38%', width: '130px', height: '65px' },
          distance: '14.2m',
          color: 'border-red-500 bg-red-500/15 text-red-400'
        },
        {
          id: 'DET-CRK-02',
          label: 'Longitudinal Crack',
          confidence: 0.912,
          severity: 'medium',
          box: { top: '68%', left: '60%', width: '150px', height: '40px' },
          distance: '8.6m',
          color: 'border-amber-500 bg-amber-500/15 text-amber-400'
        }
      ]
    },
    channel2: {
      busId: 'BUS-107',
      route: 'R-01 (GT Road Express)',
      location: 'GT Road Flyover Approach',
      lat: 31.6410,
      lng: 74.8690,
      speed: 44,
      heading: 88,
      cameraType: 'Wide-Angle Transit Sensor',
      primaryTarget: 'Traffic Congestion & Road Obstacles',
      backgroundGrad: 'from-blue-950/40 via-gray-900 to-black',
      detections: [
        {
          id: 'DET-OBS-01',
          label: 'Road Construction Barrier',
          confidence: 0.948,
          severity: 'high',
          box: { top: '48%', left: '26%', width: '110px', height: '80px' },
          distance: '21.0m',
          color: 'border-purple-500 bg-purple-500/15 text-purple-400'
        },
        {
          id: 'DET-VEH-02',
          label: 'Congested Vehicle Queue',
          confidence: 0.981,
          severity: 'medium',
          box: { top: '44%', left: '52%', width: '180px', height: '90px' },
          distance: '32.5m',
          color: 'border-blue-500 bg-blue-500/15 text-blue-400'
        }
      ]
    },
    channel3: {
      busId: 'BUS-112',
      route: 'R-05 (Airport Link Highway)',
      location: 'Suburban Highway Corridor',
      lat: 31.6521,
      lng: 74.8540,
      speed: 52,
      heading: 260,
      cameraType: 'Night IR Thermal Edge Scanner',
      primaryTarget: 'Sub-surface Voids & Low-Light Hazard Detection',
      backgroundGrad: 'from-purple-950/40 via-gray-950 to-black',
      detections: [
        {
          id: 'DET-DAM-01',
          label: 'Asphalt Delamination',
          confidence: 0.927,
          severity: 'high',
          box: { top: '62%', left: '44%', width: '140px', height: '70px' },
          distance: '11.8m',
          color: 'border-cyan-400 bg-cyan-400/15 text-cyan-300'
        }
      ]
    }
  };

  const curr = channels[activeChannel];

  // Subtle telemetry jitter simulation for authentic edge hardware feel
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(+(29.5 + Math.random() * 0.8).toFixed(1));
      setGpuTemp(+(42.3 + Math.random() * 0.6).toFixed(1));
      setTensorRtLatency(+(28.0 + Math.random() * 1.2).toFixed(1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerInference = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setLastCaptureToast(`Inference Complete: Tagged ${curr.detections[0].label} (${Math.round(curr.detections[0].confidence * 100)}%) on ${curr.busId}`);
      if (onDetectionCaptured) {
        onDetectionCaptured({
          bus_id: curr.busId,
          detection_class: curr.detections[0].label.toLowerCase().replace(' ', '_'),
          confidence: curr.detections[0].confidence,
          latitude: curr.lat,
          longitude: curr.lng
        });
      }
      setTimeout(() => setLastCaptureToast(''), 4000);
    }, 450);
  };

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Vision Studio Header */}
      <div className="p-4 bg-gray-950/90 border-b border-gray-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Camera className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-black text-white tracking-wide">
                BUS EDGE AI VISION STUDIO
              </h2>
              <span className="text-[10px] bg-red-950 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-800/80 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping mr-1" />
                LIVE STREAM
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              YOLOv11 TensorRT Model • In-Transit Municipal Road Surface Inspection
            </p>
          </div>
        </div>

        {/* Channel Selector Buttons */}
        <div className="flex items-center space-x-1.5 bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs">
          {[
            { id: 'channel1', label: 'BUS-104 (Potholes)', icon: Radio },
            { id: 'channel2', label: 'BUS-107 (Obstacles)', icon: Radio },
            { id: 'channel3', label: 'BUS-112 (Night IR)', icon: Radio },
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                activeChannel === ch.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ch.icon className={`w-3 h-3 ${activeChannel === ch.id ? 'text-cyan-300' : 'text-gray-500'}`} />
              <span>{ch.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewport & Video Simulator */}
      <div className="relative w-full h-[400px] sm:h-[460px] bg-black overflow-hidden select-none">
        {/* Background Visual Road Mesh & Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${curr.backgroundGrad} opacity-95`}>
          {/* Animated Road Perspective Lines */}
          <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Vanishing point road simulation */}
            <polygon points="120,460 380,180 540,180 880,460" fill="url(#roadGrad)" />
            {/* Center lane dash marker */}
            <line x1="460" y1="180" x2="500" y2="460" stroke="#38BDF8" strokeWidth="3" strokeDasharray="16, 12" className="animate-pulse" />
            <line x1="380" y1="180" x2="120" y2="460" stroke="#64748B" strokeWidth="2" />
            <line x1="540" y1="180" x2="880" y2="460" stroke="#64748B" strokeWidth="2" />
          </svg>
        </div>

        {/* Ambient CRT Scanline Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* DPDP Act 2023 Privacy Blurring Indicator */}
        {privacyBlur && (
          <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-bold shadow-lg backdrop-blur-md">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>DPDP Act 2023 Compliant • License Plates & Faces Anonymized</span>
          </div>
        )}

        {/* Top-Left Telemetry HUD */}
        {showHUD && (
          <div className="absolute top-4 left-4 z-20 space-y-1.5 font-mono text-[11px] text-cyan-300 bg-gray-950/85 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/30 shadow-2xl">
            <div className="flex items-center space-x-2 text-white font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{curr.busId} • DASHCAM FEED</span>
            </div>
            <div className="text-gray-400 flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{curr.location}</span>
            </div>
            <div className="text-gray-400">
              GPS: <span className="text-gray-200">{curr.lat.toFixed(4)}° N, {curr.lng.toFixed(4)}° E</span>
            </div>
            <div className="flex items-center space-x-3 pt-1 border-t border-gray-800 text-[10px]">
              <span className="text-emerald-400 font-bold">SPEED: {curr.speed} km/h</span>
              <span className="text-purple-300">HDG: {curr.heading}°</span>
              <span className="text-amber-300">RES: 1080p@30fps</span>
            </div>
          </div>
        )}

        {/* AI Bounding Boxes (Simulated live detection overlay) */}
        {showBoxes && curr.detections.map((det) => (
          <div
            key={det.id}
            style={{
              top: det.box.top,
              left: det.box.left,
              width: det.box.width,
              height: det.box.height,
            }}
            className={`absolute border-2 rounded-lg transition-all duration-500 flex flex-col justify-between p-1 cursor-pointer z-10 ${det.color} group hover:scale-105 hover:ring-2 hover:ring-cyan-400 shadow-lg`}
          >
            {/* Tag Badge */}
            <div className="bg-gray-950/90 border border-current px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center justify-between shadow-md">
              <span className="truncate">{det.label}</span>
              <span className="ml-1 text-cyan-300 font-mono">{Math.round(det.confidence * 100)}%</span>
            </div>

            {/* Bottom Distance Indicator */}
            <div className="text-[9px] font-mono text-white/80 bg-black/60 px-1 rounded self-start">
              dist: {det.distance}
            </div>

            {/* Corner Aim Reticles */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />
          </div>
        ))}

        {/* Active Inference Scan Beam Animation */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 shadow-lg shadow-cyan-400 animate-pulse pointer-events-none" style={{ top: '60%' }} />

        {/* Bottom Hardware Diagnostics Bar */}
        <div className="absolute bottom-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 bg-gray-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-800 text-xs">
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span className="flex items-center text-cyan-400">
              <Cpu className="w-3.5 h-3.5 mr-1" />
              NVIDIA Jetson Orin Nano
            </span>
            <span className="flex items-center text-emerald-400">
              <Activity className="w-3.5 h-3.5 mr-1" />
              FPS: {fps}
            </span>
            <span className="flex items-center text-amber-400">
              <Thermometer className="w-3.5 h-3.5 mr-1" />
              GPU: {gpuTemp}°C
            </span>
            <span className="flex items-center text-purple-400">
              <Zap className="w-3.5 h-3.5 mr-1" />
              Latency: {tensorRtLatency}ms (FP16)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                showBoxes ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/50' : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              {showBoxes ? 'Boxes: ON' : 'Boxes: OFF'}
            </button>
            <button
              onClick={() => setPrivacyBlur(!privacyBlur)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                privacyBlur ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50' : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              {privacyBlur ? 'Privacy Mask: ON' : 'Privacy Mask: OFF'}
            </button>
            <button
              onClick={handleTriggerInference}
              disabled={isProcessing}
              className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-[10px] rounded-lg shadow-md shadow-blue-500/20 transition flex items-center space-x-1"
            >
              <Sparkles className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Running YOLO...' : 'Trigger Edge Detection'}</span>
            </button>
          </div>
        </div>

        {/* Capture Notification Toast */}
        {lastCaptureToast && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-4 py-2.5 bg-emerald-950/95 border border-emerald-500 text-emerald-200 text-xs font-bold rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{lastCaptureToast}</span>
          </div>
        )}
      </div>

      {/* Sensor Target Description Footer */}
      <div className="p-3 bg-gray-950/60 border-t border-gray-800/60 flex flex-wrap items-center justify-between text-xs text-gray-400 px-4">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-gray-300">Active Sensor Mission:</span>
          <span className="text-cyan-400 font-semibold">{curr.primaryTarget}</span>
        </div>
        <div className="text-[11px] text-gray-500">
          Edge Hardware Deployment: Bus Roof-Mounted IP67 Sealed Jetson Enclosure
        </div>
      </div>
    </div>
  );
};

export default EdgeVisionStudio;
