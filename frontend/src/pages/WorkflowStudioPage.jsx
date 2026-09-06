import React, { useState } from 'react';
import Bus3DViewer from '../components/Bus3DViewer';
import FleetConvoyRoadScan from '../components/FleetConvoyRoadScan';
import WorkflowViewer from '../components/WorkflowViewer';
import { 
  Bus, 
  Layers, 
  Sparkles, 
  Award, 
  Cpu, 
  Radio, 
  Database, 
  CheckCircle2, 
  ArrowRight,
  Maximize2,
  Box,
  Eye
} from 'lucide-react';

const WorkflowStudioPage = () => {
  const [activeView, setActiveView] = useState('all'); // 'all', '3d-bus', 'convoy', 'workflow'

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black text-white font-heading tracking-wide">
                3D BUS DIGITAL TWIN & WORKFLOW STUDIO
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold text-xs border border-cyan-800">
                Interactive Sensing Matrix
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Explore the bus-mounted multi-camera 3D sensory array and trace the end-to-end data pipeline from edge to municipal command.
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1.5 bg-gray-950 p-1.5 rounded-2xl border border-gray-800 self-start sm:self-auto">
          {[
            { id: 'all', label: 'Complete Studio View', icon: Sparkles },
            { id: '3d-bus', label: '3D Bus Demo Flow', icon: Bus },
            { id: 'convoy', label: 'Convoy Road-Scan', icon: Eye },
            { id: 'workflow', label: 'Workflow Architecture', icon: Layers },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = activeView === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveView(mode.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: 3D BUS DIGITAL TWIN & 90-120s DEMO FLOW */}
      {(activeView === 'all' || activeView === '3d-bus') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                1. Transit Bus 3D Digital Twin & 90–120s Demo Flow Pipeline
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              Hover & Drag to rotate 360° • Click sensor or step to inspect
            </span>
          </div>

          <Bus3DViewer busCode="BUS-104" height={activeView === '3d-bus' ? '700px' : '580px'} />
        </section>
      )}

      {/* SECTION 2: FLEET VISION — LIVE CONVOY ROAD-SCAN SIMULATION */}
      {(activeView === 'all' || activeView === 'convoy') && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                2. Fleet Vision — Live Convoy Road-Scan Simulation (Multi-Bus Corroboration)
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              Multiple Buses • Same Route • Confidence Compounds Pass After Pass
            </span>
          </div>

          <FleetConvoyRoadScan />
        </section>
      )}

      {/* SECTION 3: END-TO-END WORKFLOW ARCHITECTURE */}
      {(activeView === 'all' || activeView === 'workflow') && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                3. System Workflow: Edge → Fog Gateway → Cloud Command
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              Click &quot;Simulate Live Event Flow&quot; to test pipeline
            </span>
          </div>

          <WorkflowViewer />
        </section>
      )}
    </div>
  );
};

export default WorkflowStudioPage;
