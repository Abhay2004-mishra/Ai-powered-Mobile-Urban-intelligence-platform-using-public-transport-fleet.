import React from 'react';
import { useDemo } from '../context/DemoContext';
import { Play, Pause, AlertOctagon, Flame, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

const SIHDemoRunner = () => {
  const {
    isDemoRunning,
    setIsDemoRunning,
    demoStep,
    triggerSIHDemoFlow,
    triggerCustomIncident
  } = useDemo();

  const pipelineStages = [
    'CAMERA', 'EDGE_AI', 'GPS', 'MQTT', 'FOG', 'DEDUP', 'SEVERITY', 'INCIDENT', 'ALERT', 'WORK_ORDER', 'RESOLVED'
  ];

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-3.5 shadow-xl mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center space-x-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
          <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            SIH Interactive Pipeline Demo
          </h2>
          <span className="text-[10px] bg-blue-950 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-800">
            DEMO SIMULATION: {isDemoRunning ? 'ON' : 'PAUSED'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={triggerSIHDemoFlow}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>START SIH DEMO</span>
          </button>

          <button
            onClick={() => triggerCustomIncident('pothole')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/50 text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>+ Pothole</span>
          </button>

          <button
            onClick={() => triggerCustomIncident('accident')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/50 text-xs font-semibold"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>+ Accident</span>
          </button>

          <button
            onClick={() => triggerCustomIncident('road_damage')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700/50 text-xs font-semibold"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>+ Road Damage</span>
          </button>

          <button
            onClick={() => setIsDemoRunning(!isDemoRunning)}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
            title={isDemoRunning ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isDemoRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Animated Pipeline Stage Tracker */}
      <div className="mt-3 pt-3 border-t border-gray-800/80">
        <div className="flex items-center justify-between overflow-x-auto pb-1 text-[11px]">
          {pipelineStages.map((stage, idx) => {
            const isCurrent = demoStep?.stage === stage;
            const isPast = demoStep && pipelineStages.indexOf(demoStep.stage) > idx;

            return (
              <React.Fragment key={stage}>
                <div
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-blue-600 text-white font-bold scale-105 shadow-md shadow-blue-500/40 ring-1 ring-blue-400'
                      : isPast
                      ? 'text-emerald-400 font-medium bg-emerald-950/40'
                      : 'text-gray-500 bg-gray-950/40'
                  }`}
                >
                  {isPast ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : null}
                  <span>{stage}</span>
                </div>
                {idx < pipelineStages.length - 1 && (
                  <span className={`text-gray-700 text-xs ${isPast ? 'text-emerald-600 font-bold' : ''}`}>→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {demoStep?.message && (
          <div className="mt-2 text-xs bg-blue-950/60 border border-blue-800/60 text-blue-200 px-3 py-1.5 rounded-lg flex items-center justify-between">
            <span className="font-semibold">Stage {demoStep.step}/11: {demoStep.message}</span>
            <span className="text-[10px] text-blue-400">Live Orchestration</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SIHDemoRunner;
