import React, { useState } from 'react';
import { 
  X, 
  Award, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Radio, 
  Cloud, 
  LayoutDashboard, 
  Bus, 
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

const ProblemStatementModal = ({ onClose }) => {
  const [roadKm, setRoadKm] = useState(1200); // 1200 km city network
  const [busFleet, setBusFleet] = useState(150); // 150 buses

  // Real-time CapEx / OpEx Calculations
  // Traditional: 2 poles per km at intersections, ₹1.2L per pole
  const staticCCTVCount = Math.round((roadKm * 2.1));
  const traditionalCapExCrores = Number(((staticCCTVCount * 120000) / 10000000).toFixed(2));
  const traditionalOpExCrores = Number(((traditionalCapExCrores * 0.12)).toFixed(2));

  // UrbanEye AI: bus edge devices @ ₹35,000 each
  const urbanEyeCapExLakhs = Number(((busFleet * 35000) / 100000).toFixed(1));
  const urbanEyeCapExCrores = Number((urbanEyeCapExLakhs / 100).toFixed(2));
  const urbanEyeOpExLakhs = Number(((busFleet * 12000) / 100000).toFixed(1));

  const savingsPercent = Math.round(((traditionalCapExCrores - urbanEyeCapExCrores) / traditionalCapExCrores) * 100);
  const savingsCrores = (traditionalCapExCrores - urbanEyeCapExCrores).toFixed(2);

  return (
    <div className="fixed inset-0 z-[3000] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto relative my-8">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-950 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/25 flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Smart India Hackathon 2026</span>
            </span>
            <span className="px-3 py-1 bg-gray-800 text-cyan-300 rounded-full text-xs font-bold font-mono border border-cyan-500/30">
              Problem Statement ID: 26124
            </span>
            <span className="px-3 py-1 bg-purple-950 text-purple-300 rounded-full text-xs font-bold border border-purple-800">
              Theme: Smart Automation
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-heading">
            Mobile Urban Intelligence Platform
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1.5 leading-relaxed">
            Transforming existing public transport bus fleets into a continuous, distributed smart city sensing network that replaces expensive fixed CCTV cameras with mobile edge AI.
          </p>
        </div>

        {/* Core Novelty: 4-Tier Target Architecture */}
        <div className="p-5 bg-gray-950/90 rounded-2xl border border-gray-800/80 space-y-3">
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Target 4-Tier Architecture Pipeline</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-gray-900/90 rounded-xl border border-blue-500/30">
              <div className="text-blue-400 font-extrabold flex items-center space-x-1">
                <Bus className="w-4 h-4" />
                <span>Tier 1: Bus Edge AI</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Bus roof-mounted camera + NVIDIA Jetson Orin. Real-time YOLOv11 inference running FP16 TensorRT.
              </p>
              <span className="text-[10px] text-cyan-400 font-mono mt-2 block">~32ms latency • 30 FPS</span>
            </div>

            <div className="p-3.5 bg-gray-900/90 rounded-xl border border-purple-500/30">
              <div className="text-purple-400 font-extrabold flex items-center space-x-1">
                <Radio className="w-4 h-4" />
                <span>Tier 2: Fog Gateway</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Depot WiFi / 5G gateway. Multi-bus spatial deduplication (&lt;15m radius) to filter redundant detections.
              </p>
              <span className="text-[10px] text-purple-400 font-mono mt-2 block">&lt;1KB encrypted JSON</span>
            </div>

            <div className="p-3.5 bg-gray-900/90 rounded-xl border border-amber-500/30">
              <div className="text-amber-400 font-extrabold flex items-center space-x-1">
                <Cloud className="w-4 h-4" />
                <span>Tier 3: Cloud Core</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                FastAPI + Async SQLAlchemy PostGIS engine. Dynamic severity evaluation and auto work order dispatch.
              </p>
              <span className="text-[10px] text-amber-400 font-mono mt-2 block">WebSocket Real-Time Hub</span>
            </div>

            <div className="p-3.5 bg-gray-900/90 rounded-xl border border-emerald-500/30">
              <div className="text-emerald-400 font-extrabold flex items-center space-x-1">
                <LayoutDashboard className="w-4 h-4" />
                <span>Tier 4: ICCC Command</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Municipal Command Center for Officers, Field Repair Teams, and Transit Operators with SLA tracking.
              </p>
              <span className="text-[10px] text-emerald-400 font-mono mt-2 block">30m SLA resolution</span>
            </div>
          </div>
        </div>

        {/* Interactive Municipal Cost Calculator */}
        <div className="p-5 bg-gradient-to-br from-blue-950/40 via-gray-950 to-indigo-950/40 rounded-2xl border border-blue-800/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Interactive Municipal ROI & Cost Comparison Calculator</span>
              </h3>
              <p className="text-xs text-gray-400">
                Compare Traditional Static CCTV Poles vs UrbanEye AI Mobile Sensing Network
              </p>
            </div>
            <div className="px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-black text-xs self-start sm:self-auto">
              {savingsPercent}% Taxpayer Savings (₹{savingsCrores} Cr)
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>City Municipal Road Network:</span>
                <strong className="text-blue-400">{roadKm} km</strong>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="50"
                value={roadKm}
                onChange={(e) => setRoadKm(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-2 bg-gray-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>200 km (Town)</span>
                <span>1,200 km (Tier 2 City)</span>
                <span>3,000 km (Metro)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Public Transit Bus Fleet:</span>
                <strong className="text-purple-400">{busFleet} Buses</strong>
              </div>
              <input
                type="range"
                min="30"
                max="500"
                step="10"
                value={busFleet}
                onChange={(e) => setBusFleet(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-2 bg-gray-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>30 Buses</span>
                <span>150 Buses</span>
                <span>500 Buses</span>
              </div>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            {/* Traditional CCTV Card */}
            <div className="p-4 bg-gray-950/80 rounded-xl border border-red-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-400">Traditional Fixed CCTV Poles</span>
                <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800">
                  Fixed Infrastructure
                </span>
              </div>
              <div className="text-2xl font-black text-white">₹{traditionalCapExCrores} Crores</div>
              <p className="text-[11px] text-gray-400 leading-snug">
                Requires ~{staticCCTVCount.toLocaleString()} camera poles, underground cable trenching, and dedicated fiber optics.
              </p>
              <div className="pt-2 border-t border-gray-900 space-y-1 text-[11px] text-gray-400">
                <div>• Annual Maintenance: <strong>₹{traditionalOpExCrores} Cr/yr</strong></div>
                <div>• Road Coverage: <strong className="text-red-400">12% to 18%</strong> (Fixed intersections only)</div>
                <div>• Hazard Detection: <strong className="text-red-400">7 to 14 days</strong> (Manual complaints)</div>
              </div>
            </div>

            {/* UrbanEye AI Card */}
            <div className="p-4 bg-gray-950/80 rounded-xl border border-emerald-500/40 space-y-2 ring-1 ring-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">UrbanEye AI Mobile Bus Network</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  Distributed Smart Sensing
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-300">₹{urbanEyeCapExCrores} Crores</div>
              <p className="text-[11px] text-gray-400 leading-snug">
                Utilizes {busFleet} existing public buses equipped with roof-mounted Jetson AI edge modules. Zero civil digging.
              </p>
              <div className="pt-2 border-t border-gray-900 space-y-1 text-[11px] text-gray-400">
                <div>• Annual Maintenance: <strong>₹{urbanEyeOpExLakhs} Lakhs/yr</strong></div>
                <div>• Road Coverage: <strong className="text-emerald-400">80% to 85%</strong> (Continuous daily transit coverage)</div>
                <div>• Hazard Detection: <strong className="text-emerald-400">3 minutes</strong> (Automated edge AI dispatch)</div>
              </div>
            </div>
          </div>
        </div>

        {/* SIH Evaluation Pillars Table */}
        <div className="p-5 bg-gray-950/90 rounded-2xl border border-gray-800 space-y-3">
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Why Evaluators Choose UrbanEye AI (Technical Superiority)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800 space-y-1">
              <div className="font-bold text-cyan-300 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero Civil Disruption</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Deploys in days by retrofitting existing public transport buses without digging roads or laying expensive optic fiber.
              </p>
            </div>

            <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800 space-y-1">
              <div className="font-bold text-purple-300 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Multi-Bus Spatial Deduplication</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Fog gateway correlates observations from multiple buses within a 15m radius, eliminating duplicate work orders.
              </p>
            </div>

            <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800 space-y-1">
              <div className="font-bold text-emerald-300 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>DPDP Act 2023 Compliant</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Edge privacy pipeline automatically masks pedestrian faces and license plates before transmitting metadata.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center space-x-2"
          >
            <span>Return to Command Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemStatementModal;
