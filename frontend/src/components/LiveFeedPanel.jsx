import React from 'react';
import { useDemo } from '../context/DemoContext';
import { Radio, AlertOctagon, Flame, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

const LiveFeedPanel = () => {
  const { liveDetections, setSelectedIncident } = useDemo();

  const getIcon = (type) => {
    if (type === 'accident') return <AlertOctagon className="w-4 h-4 text-red-400" />;
    if (type === 'pothole') return <Flame className="w-4 h-4 text-amber-400" />;
    return <ShieldAlert className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-xl flex flex-col h-[600px]">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            Live AI Detection Feed
          </h2>
        </div>
        <span className="text-[10px] bg-emerald-950 text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-800">
          WebSocket Streaming
        </span>
      </div>

      <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
        {liveDetections.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs">
            Listening for edge detections...
          </div>
        ) : (
          liveDetections.map((det, idx) => (
            <div
              key={det.detection_code || idx}
              className="p-3 bg-gray-950/70 border border-gray-800/80 hover:border-blue-500/50 rounded-xl transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-gray-900 border border-gray-800">
                    {getIcon(det.detection_class)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-200 capitalize leading-tight">
                      {det.detection_class?.replace('_', ' ')}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5 flex items-center space-x-2">
                      <span className="text-blue-400 font-semibold">{det.bus_id}</span>
                      <span>•</span>
                      <span>Confidence: {Math.round((det.confidence || 0.92) * 100)}%</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                    det.severity === 'critical'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : det.severity === 'high'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                  }`}
                >
                  {det.severity || 'high'}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-900 flex justify-between items-center text-[10px] text-gray-500">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-gray-500" /> 
                  Just Now
                </span>
                <span className="text-blue-400 font-medium hover:underline">
                  GPS: {det.latitude?.toFixed(4)}, {det.longitude?.toFixed(4)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveFeedPanel;
