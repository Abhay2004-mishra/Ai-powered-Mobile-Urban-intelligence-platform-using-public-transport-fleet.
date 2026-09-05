import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Cpu, Activity, Zap, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

const AIMonitoringPage = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get('/api/health').then(res => setStatus(res.data.ai_engine)).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-white flex items-center">
              <Cpu className="w-6 h-6 text-purple-400 mr-2" />
              AI Computer Vision Engine & TensorRT Pipeline
            </h1>
            <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-400 font-extrabold text-xs border border-emerald-800">
              AI ENGINE: DEMO SIMULATION MODE
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">YOLOv11 + Mask R-CNN edge detection engine deployed across bus Jetson devices.</p>
        </div>
      </div>

      {/* Model Spec Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Detection Architecture</span>
          <div className="text-lg font-black text-purple-400 mt-1">YOLOv11 + Mask R-CNN</div>
          <p className="text-[11px] text-gray-500 mt-1">Real-time object detection + instance segmentation for road damage.</p>
        </div>

        <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Inference Latency</span>
          <div className="text-lg font-black text-cyan-400 mt-1">{status?.inference_latency_ms || 42} ms</div>
          <p className="text-[11px] text-gray-500 mt-1">TensorRT optimized FP16 execution on Jetson TPU.</p>
        </div>

        <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Average Model Confidence</span>
          <div className="text-lg font-black text-emerald-400 mt-1">93.4%</div>
          <p className="text-[11px] text-gray-500 mt-1">Evaluated across 1,284+ road hazard detections.</p>
        </div>

        <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Frames Processed Today</span>
          <div className="text-lg font-black text-amber-400 mt-1">{status?.frames_processed?.toLocaleString() || '1,284,920'}</div>
          <p className="text-[11px] text-gray-500 mt-1">Processed locally on bus edge hardware.</p>
        </div>
      </div>

      {/* AI Retraining & Feedback Loop Diagram */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center">
          <RefreshCw className="w-4 h-4 text-blue-400 mr-2" />
          Officer Verification & AI Model Retraining Feedback Loop
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs">
          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
            <span className="font-bold text-gray-300 block">1. Detection</span>
            <span className="text-[10px] text-gray-500">Edge camera detects pothole</span>
          </div>
          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
            <span className="font-bold text-blue-400 block">2. Deduplication</span>
            <span className="text-[10px] text-gray-500">Multi-bus verification</span>
          </div>
          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
            <span className="font-bold text-purple-400 block">3. Officer Verification</span>
            <span className="text-[10px] text-gray-500">Officer approves or marks false positive</span>
          </div>
          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
            <span className="font-bold text-amber-400 block">4. Feedback Dataset</span>
            <span className="text-[10px] text-gray-500">Tagged feedback saved to cloud</span>
          </div>
          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
            <span className="font-bold text-emerald-400 block">5. Retraining</span>
            <span className="text-[10px] text-gray-500">YOLOv11 model updated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMonitoringPage;
