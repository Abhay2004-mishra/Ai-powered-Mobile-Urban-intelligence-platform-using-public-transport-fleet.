import React, { useState } from 'react';
import { 
  Radio, 
  CheckCircle2, 
  MapPin, 
  Bus, 
  Layers, 
  ShieldAlert, 
  ArrowRight, 
  Zap, 
  Clock,
  Send,
  AlertTriangle
} from 'lucide-react';

const SpatialDeduplicationVisualizer = () => {
  const [currentStep, setCurrentStep] = useState(2); // 0 = Bus 1, 1 = Bus 2, 2 = Bus 3 (Final)

  const steps = [
    {
      bus: 'BUS-101 (GT Road Route R-01)',
      time: '09:14 AM',
      lat: 31.6342,
      lng: 74.8724,
      conf: '88.4%',
      status: 'Preliminary Observation',
      severity: 'Low',
      clusterStatus: 'Single observation logged. Awaiting confirmation.',
      ticketStatus: 'Pending Multi-Bus Threshold'
    },
    {
      bus: 'BUS-104 (Mall Road Route R-02)',
      time: '09:41 AM',
      lat: 31.6341,
      lng: 74.8725,
      conf: '94.2%',
      status: 'Corroborated by 2nd Bus',
      severity: 'Medium',
      clusterStatus: 'Spatial delta: 6.2m (<15m radius threshold). Merged into Cluster #INC-1024.',
      ticketStatus: 'Deduplicated (No redundant ticket dispatched)'
    },
    {
      bus: 'BUS-107 (Airport Link Route R-05)',
      time: '10:18 AM',
      lat: 31.6343,
      lng: 74.8723,
      conf: '96.8%',
      status: 'Multi-Bus Verified (3 Independent Sightings)',
      severity: 'Critical (Auto-Escalated)',
      clusterStatus: 'Combined Bayesian Probability: 99.8%. Location centroid locked.',
      ticketStatus: '🚨 Work Order #WO-9041 Auto-Dispatched (30m SLA)'
    }
  ];

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Fog Gateway Multi-Bus Spatial Deduplication Engine
              </h3>
              <span className="text-[10px] bg-purple-950 text-purple-300 font-bold px-2 py-0.5 rounded border border-purple-800">
                PATENT-PENDING ALGORITHM
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Eliminates duplicate municipal repair tickets by clustering transit bus observations within &lt;15m Euclidean radius.
            </p>
          </div>
        </div>

        {/* Step Selector Buttons */}
        <div className="flex items-center space-x-1.5 bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
          {['1st Bus (09:14)', '2nd Bus (09:41)', '3rd Bus (10:18 - Verified)'].map((label, idx) => (
            <button
              key={label}
              onClick={() => setCurrentStep(idx)}
              className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                currentStep === idx
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Spatial Radar & Step Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Interactive Mini Radar Simulation */}
        <div className="relative h-64 bg-black/80 rounded-2xl border border-gray-800 overflow-hidden flex items-center justify-center">
          {/* Radar Circles */}
          <div className="absolute w-48 h-48 border border-purple-500/20 rounded-full" />
          <div className="absolute w-36 h-36 border border-purple-500/30 rounded-full" />
          <div className="absolute w-20 h-20 border border-purple-500/40 rounded-full bg-purple-500/5 animate-pulse" />
          
          {/* 15m radius indicator */}
          <div className="absolute top-2 left-2 text-[10px] text-gray-400 font-mono">
            Spatial Clustering Radius: &lt;15m
          </div>

          {/* Centroid Hazard (Pothole Location) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-lg shadow-red-500/80 animate-ping absolute" />
            <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-[9px] text-white font-black z-10">
              !
            </div>
            <span className="text-[10px] text-red-400 font-bold mt-1 bg-black/80 px-1.5 py-0.5 rounded">
              Pothole #INC-1024
            </span>
          </div>

          {/* Bus 1 Point */}
          {currentStep >= 0 && (
            <div className="absolute top-12 left-16 flex items-center space-x-1 font-mono text-[10px] text-blue-400 animate-fadeIn">
              <div className="w-3 h-3 rounded-full bg-blue-500 border border-white" />
              <span>BUS-101 (Δ 6.2m)</span>
            </div>
          )}

          {/* Bus 2 Point */}
          {currentStep >= 1 && (
            <div className="absolute bottom-14 right-16 flex items-center space-x-1 font-mono text-[10px] text-cyan-400 animate-fadeIn">
              <div className="w-3 h-3 rounded-full bg-cyan-500 border border-white" />
              <span>BUS-104 (Δ 4.8m)</span>
            </div>
          )}

          {/* Bus 3 Point */}
          {currentStep >= 2 && (
            <div className="absolute top-10 right-20 flex items-center space-x-1 font-mono text-[10px] text-emerald-400 animate-fadeIn">
              <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
              <span>BUS-107 (Δ 8.4m)</span>
            </div>
          )}

          {/* Radar Sweep Line */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-transparent animate-spin origin-center pointer-events-none" style={{ animationDuration: '6s' }} />
        </div>

        {/* Right: Step Details & Scientific Deduplication Metrics */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 bg-gray-950/80 rounded-2xl border border-gray-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Bus className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black text-white">{steps[currentStep].bus}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-300 font-mono">{steps[currentStep].time}</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                  currentStep === 2 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400'
                }`}>
                  {steps[currentStep].severity}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-gray-900 rounded-xl border border-gray-800">
                <span className="text-[10px] text-gray-500 block">CONFIDENCE</span>
                <span className="font-extrabold text-white text-sm">{steps[currentStep].conf}</span>
              </div>
              <div className="p-2 bg-gray-900 rounded-xl border border-gray-800">
                <span className="text-[10px] text-gray-500 block">SIGHTINGS</span>
                <span className="font-extrabold text-purple-400 text-sm">{currentStep + 1} Buses</span>
              </div>
              <div className="p-2 bg-gray-900 rounded-xl border border-gray-800 col-span-2">
                <span className="text-[10px] text-gray-500 block">BAYESIAN PROBABILITY</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {currentStep === 0 ? '88.4%' : (currentStep === 1 ? '99.1%' : '99.8% Verified')}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-gray-900/60 rounded-xl border border-gray-800/80 text-xs text-gray-300 leading-relaxed">
              <strong className="text-purple-300">Fog Spatial Reasoning:</strong> {steps[currentStep].clusterStatus}
            </div>

            <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
              currentStep === 2 
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300' 
                : 'bg-blue-950/40 border-blue-800/40 text-blue-300'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{steps[currentStep].ticketStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpatialDeduplicationVisualizer;
