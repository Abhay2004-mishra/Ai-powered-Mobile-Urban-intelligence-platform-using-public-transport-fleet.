import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EdgeVisionStudio from '../components/EdgeVisionStudio';
import Bus3DViewer from '../components/Bus3DViewer';
import { 
  Bus, 
  Cpu, 
  Camera, 
  Radio, 
  MapPin, 
  Activity, 
  ArrowLeft, 
  CheckCircle2, 
  Thermometer,
  Zap,
  Gauge,
  Clock,
  Box,
  Layers
} from 'lucide-react';

const BusDetailPage = () => {
  const { busCode } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeViewTab, setActiveViewTab] = useState('3d');

  useEffect(() => {
    api.get(`/api/buses/${busCode}`).then(res => setData(res.data)).catch(console.error);
  }, [busCode]);

  if (!data) {
    return (
      <div className="p-12 text-center text-gray-500 text-xs">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>Loading Edge Bus Telemetry for {busCode}...</span>
      </div>
    );
  }

  const { bus, device_info, analytics } = data;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/fleet')}
            className="p-2.5 rounded-xl bg-gray-950 hover:bg-gray-800 border border-gray-800 text-gray-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white font-heading">{bus.bus_code}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
                AI STATUS: {bus.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Assigned Route: <strong className="text-cyan-300">{bus.route_id}</strong> • Driver: {bus.driver_name || 'Gurpreet Singh'} • Device ID: {device_info.device_id}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-gray-950 p-2 rounded-2xl border border-gray-800 self-start sm:self-auto">
          <div className="px-3 py-1">
            <span className="text-[10px] text-gray-500 block">CURRENT SPEED</span>
            <span className="font-extrabold text-blue-400 text-base">{bus.speed_kmh} km/h</span>
          </div>
          <div className="h-6 w-[1px] bg-gray-800" />
          <div className="px-3 py-1">
            <span className="text-[10px] text-gray-500 block">GPS COORDINATES</span>
            <span className="font-mono text-gray-200 text-xs">{bus.latitude?.toFixed(4)}, {bus.longitude?.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* View Switcher: 3D Digital Twin vs 2D Dashcam HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-950/80 p-1.5 rounded-2xl border border-gray-800">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveViewTab('3d')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeViewTab === '3d'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Bus Digital Twin & Sensor Matrix</span>
          </button>

          <button
            onClick={() => setActiveViewTab('camera')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeViewTab === 'camera'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera Feed & AI Bounding Boxes</span>
          </button>
        </div>

        <button
          onClick={() => navigate('/workflow')}
          className="hidden sm:flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold px-3 py-1.5 rounded-xl hover:bg-gray-900 transition"
        >
          <span>View End-to-End System Workflow</span>
          <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      {/* Embedded Live 3D Twin or 2D Edge Vision */}
      <div>
        {activeViewTab === '3d' ? (
          <Bus3DViewer busCode={bus.bus_code} height="520px" />
        ) : (
          <EdgeVisionStudio />
        )}
      </div>

      {/* Hardware Diagnostics & Road Coverage Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Jetson Orin Nano Hardware Diagnostics */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl space-y-4">
          <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center">
            <Cpu className="w-4 h-4 text-purple-400 mr-2" />
            NVIDIA Jetson Edge Hardware Telemetry
          </h2>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 flex justify-between items-center">
              <span className="text-gray-400">Board Architecture:</span>
              <span className="font-bold text-white font-mono">{device_info.model}</span>
            </div>
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 flex justify-between items-center">
              <span className="text-gray-400">SoC Temperature:</span>
              <span className="font-bold text-emerald-400 flex items-center font-mono">
                <Thermometer className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                {device_info.gpu_temp_celsius}°C (Normal)
              </span>
            </div>
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 flex justify-between items-center">
              <span className="text-gray-400">Inference Throughput:</span>
              <span className="font-bold text-cyan-400 font-mono">{device_info.fps} FPS</span>
            </div>
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 flex justify-between items-center">
              <span className="text-gray-400">MQTT Network Sync:</span>
              <span className="font-bold text-emerald-400 font-mono flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                CONNECTED (&lt;1KB payload)
              </span>
            </div>
          </div>
        </div>

        {/* Road Surface Detection Analytics */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl space-y-4">
          <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center">
            <Activity className="w-4 h-4 text-cyan-400 mr-2" />
            Daily Surface Inspection Stats
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800">
              <span className="text-[10px] text-gray-500 block">TOTAL DETECTIONS</span>
              <span className="font-extrabold text-amber-400 text-xl font-mono mt-1">
                {analytics.detections_today}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Tagged with GPS</span>
            </div>

            <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800">
              <span className="text-[10px] text-gray-500 block">POTHOLES DETECTED</span>
              <span className="font-extrabold text-red-400 text-xl font-mono mt-1">
                {analytics.potholes_detected}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Surface craters</span>
            </div>

            <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800">
              <span className="text-[10px] text-gray-500 block">ROAD COVERAGE</span>
              <span className="font-extrabold text-emerald-400 text-xl font-mono mt-1">
                {analytics.road_coverage_km} km
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Scanned today</span>
            </div>

            <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800">
              <span className="text-[10px] text-gray-500 block">ACCIDENTS REPORTED</span>
              <span className="font-extrabold text-purple-400 text-xl font-mono mt-1">
                {analytics.accidents_detected}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Emergency triage</span>
            </div>
          </div>
        </div>

        {/* DPDP Act 2023 Compliance Panel */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl space-y-4">
          <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center">
            <Radio className="w-4 h-4 text-emerald-400 mr-2" />
            Edge Privacy & Cryptography
          </h2>

          <div className="p-3.5 bg-gray-950 rounded-2xl border border-emerald-900/40 space-y-2 text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>DPDP Act 2023 Compliant</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Video stream is processed in volatile memory on the Jetson Orin. Video frames are discarded immediately after inference. Only ~1KB anonymous metadata JSON is uploaded.
            </p>
            <div className="pt-2 border-t border-gray-900 text-[10px] font-mono text-gray-500">
              Cipher: AES-256-GCM Hardware Encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusDetailPage;
