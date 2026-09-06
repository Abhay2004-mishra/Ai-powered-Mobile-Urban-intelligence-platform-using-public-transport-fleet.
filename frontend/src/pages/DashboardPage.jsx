import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KPICards from '../components/KPICards';
import SIHDemoRunner from '../components/SIHDemoRunner';
import MapContainer from '../components/MapContainer';
import LiveFeedPanel from '../components/LiveFeedPanel';
import IncidentModal from '../components/IncidentModal';
import EdgeVisionStudio from '../components/EdgeVisionStudio';
import ProblemStatementModal from '../components/ProblemStatementModal';
import SpatialDeduplicationVisualizer from '../components/SpatialDeduplicationVisualizer';
import Bus3DViewer from '../components/Bus3DViewer';
import FleetConvoyRoadScan from '../components/FleetConvoyRoadScan';
import WorkflowViewer from '../components/WorkflowViewer';
import { useDemo } from '../context/DemoContext';
import { 
  Award, 
  Clock, 
  MapPin, 
  Cpu, 
  Radio, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  BarChart2,
  Sparkles,
  Zap,
  Building2,
  Box,
  ArrowRight
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { selectedIncident, setSelectedIncident } = useDemo();
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'vision', 'dedup'
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-IN', { hour12: true }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const wardScores = [
    { ward: 'Ward 1 - Mall Road Central', score: 88, potholes: 4, status: 'Good', trend: '+4% MoM' },
    { ward: 'Ward 2 - GT Road Transit Corridor', score: 79, potholes: 12, status: 'Fair', trend: '-2% MoM' },
    { ward: 'Ward 3 - Airport Link Expressway', score: 94, potholes: 2, status: 'Excellent', trend: '+8% MoM' },
    { ward: 'Ward 4 - South Industrial Zone', score: 62, potholes: 21, status: 'Needs Repair', trend: '-11% MoM' },
    { ward: 'Ward 5 - University Tech Corridor', score: 91, potholes: 3, status: 'Excellent', trend: '+5% MoM' },
  ];

  return (
    <div className="space-y-5">
      {/* Top Municipal ICCC Tactical Header */}
      <div className="bg-gray-900/95 border border-gray-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-xl shadow-blue-500/25">
            ICCC
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-wide font-heading">
                MUNICIPAL INTEGRATED COMMAND & CONTROL CENTRE
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                LIVE PLATFORM
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex flex-wrap items-center gap-2">
              <span className="flex items-center text-cyan-400">
                <MapPin className="w-3.5 h-3.5 mr-1" /> Amritsar - Delhi Transit Corridor
              </span>
              <span>•</span>
              <span className="text-gray-300 font-mono flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-gray-500" /> {currentTime} IST
              </span>
              <span>•</span>
              <span className="text-purple-300">124 Transit Buses Sensing</span>
            </p>
          </div>
        </div>

        {/* Action Showcase Triggers */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => navigate('/workflow')}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs shadow-xl shadow-cyan-600/25 transition flex items-center space-x-2 border border-cyan-400/40"
          >
            <Box className="w-4 h-4 text-cyan-200" />
            <span>3D Bus & Workflow Studio</span>
          </button>

          <button
            onClick={() => setShowProblemModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-blue-600/30 transition flex items-center space-x-2 border border-cyan-400/40"
          >
            <Award className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>Problem Statement & ROI Showcase</span>
          </button>
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <KPICards />

      {/* SIH Interactive Automated Pipeline Runner */}
      <SIHDemoRunner />

      {/* Dashboard View Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-950/80 p-1.5 rounded-2xl border border-gray-800">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'overview', label: 'GIS Command Map & Feed', icon: MapPin },
            { id: '3d-bus', label: '3D Bus Digital Twin', icon: Box },
            { id: 'workflow', label: 'End-to-End System Workflow', icon: Layers },
            { id: 'vision', label: 'Edge AI Vision Studio (Live Cam)', icon: Cpu },
            { id: 'dedup', label: 'Spatial Deduplication Engine', icon: Radio },
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

        <div className="hidden lg:flex items-center space-x-3 text-[11px] text-gray-400 pr-3">
          <span className="flex items-center text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Real-time Fog Gateway Synced
          </span>
          <span>•</span>
          <span className="text-cyan-400 font-mono">Deduplication: &lt;15m</span>
        </div>
      </div>

      {/* TAB CONTENT 1: OVERVIEW (Map + Live Feed) */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <MapContainer />
            </div>
            <div className="lg:col-span-1">
              <LiveFeedPanel />
            </div>
          </div>

          {/* Quick Peek at Edge Vision Studio */}
          <div className="mt-4">
            <EdgeVisionStudio />
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3D BUS DIGITAL TWIN & CONVOY ROAD-SCAN */}
      {activeTab === '3d-bus' && (
        <div className="space-y-6">
          <Bus3DViewer busCode="BUS-104" height="560px" />
          <FleetConvoyRoadScan />
        </div>
      )}

      {/* TAB CONTENT: END-TO-END WORKFLOW */}
      {activeTab === 'workflow' && (
        <div className="space-y-4">
          <WorkflowViewer />
        </div>
      )}

      {/* TAB CONTENT 2: LIVE EDGE AI VISION STUDIO */}
      {activeTab === 'vision' && (
        <div className="space-y-4">
          <EdgeVisionStudio />
        </div>
      )}

      {/* TAB CONTENT 3: SPATIAL DEDUPLICATION ENGINE */}
      {activeTab === 'dedup' && (
        <div className="space-y-4">
          <SpatialDeduplicationVisualizer />
        </div>
      )}

      {/* Ward Road Health Scorecard & Municipal Cost Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Ward Health Scorecard */}
        <div className="lg:col-span-2 bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Municipal Ward Road Health Index (AI Scanned Today)
              </h3>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">UPDATED HOURLY</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="text-[10px] uppercase text-gray-500 border-b border-gray-800/80">
                <tr>
                  <th className="pb-2">Municipal Sector / Corridor</th>
                  <th className="pb-2">Road Health Score</th>
                  <th className="pb-2">Active Potholes</th>
                  <th className="pb-2">Quality Grade</th>
                  <th className="pb-2 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {wardScores.map((w) => (
                  <tr key={w.ward} className="hover:bg-gray-800/30 transition">
                    <td className="py-2.5 font-bold text-gray-200">{w.ward}</td>
                    <td className="py-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              w.score >= 90 ? 'bg-emerald-500' : (w.score >= 75 ? 'bg-blue-500' : 'bg-amber-500')
                            }`}
                            style={{ width: `${w.score}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-gray-200">{w.score}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 font-mono text-amber-400 font-bold">{w.potholes}</td>
                    <td className="py-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        w.status === 'Excellent' ? 'bg-emerald-950 text-emerald-400' : (w.status === 'Good' ? 'bg-blue-950 text-blue-400' : 'bg-amber-950 text-amber-400')
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-[11px] text-gray-400">{w.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Cost Savings Mini Banner */}
        <div className="bg-gradient-to-br from-blue-950/60 via-gray-900 to-indigo-950/60 border border-blue-800/40 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Municipal Taxpayer Impact</span>
            </div>
            <div className="text-3xl font-black text-white font-heading mt-2">
              91.7% Savings
            </div>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              UrbanEye AI replaces ₹38.5 Crores in static CCTV pole procurement with a ₹3.2 Crore mobile bus retrofitting program.
            </p>
          </div>

          <div className="p-3 bg-gray-950/70 rounded-2xl border border-blue-900/40 space-y-1 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Traditional Inspection:</span>
              <span className="text-red-400 font-bold">7 to 14 Days</span>
            </div>
            <div className="flex justify-between text-gray-300 font-bold">
              <span>UrbanEye AI Response:</span>
              <span className="text-emerald-400">3 Minutes</span>
            </div>
          </div>

          <button
            onClick={() => setShowProblemModal(true)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/25"
          >
            Launch Interactive ROI Calculator
          </button>
        </div>
      </div>

      {/* Incident Modal Popup */}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}

      {/* Problem Statement & ROI Showcase Modal */}
      {showProblemModal && (
        <ProblemStatementModal onClose={() => setShowProblemModal(false)} />
      )}
    </div>
  );
};

export default DashboardPage;
