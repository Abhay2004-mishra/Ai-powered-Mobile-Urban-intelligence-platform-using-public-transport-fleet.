import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldCheck, Lock, HardDrive, Wifi, CheckCircle2 } from 'lucide-react';

const PrivacyPage = () => {
  const [privacyData, setPrivacyData] = useState(null);

  useEffect(() => {
    api.get('/api/privacy/status').then(res => setPrivacyData(res.data)).catch(console.error);
  }, []);

  if (!privacyData) return <div className="p-8 text-center text-gray-500 text-xs">Loading Privacy Controls...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2" />
            Edge AI Security & Privacy Compliance Architecture
          </h1>
          <p className="text-xs text-gray-400">Zero raw video upload to cloud. Local face anonymization & 99.99% bandwidth savings.</p>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Raw Video Retention</span>
          <div className="text-sm font-extrabold text-emerald-400 mt-1">OFF (Edge Processing Only)</div>
          <p className="text-[11px] text-gray-500 mt-1">Video never leaves bus local storage.</p>
        </div>

        <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Face / License Plate Anonymization</span>
          <div className="text-sm font-extrabold text-cyan-400 mt-1">Edge OpenCV Blurring</div>
          <p className="text-[11px] text-gray-500 mt-1">Anonymized prior to metadata extraction.</p>
        </div>

        <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Metadata Encryption</span>
          <div className="text-sm font-extrabold text-purple-400 mt-1">AES-256 / TLS 1.3</div>
          <p className="text-[11px] text-gray-500 mt-1">Encrypted MQTT data stream.</p>
        </div>

        <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Bandwidth Optimization</span>
          <div className="text-sm font-extrabold text-amber-400 mt-1">99.99% Savings</div>
          <p className="text-[11px] text-gray-500 mt-1">1.2 KB/min metadata vs 150 MB/min video.</p>
        </div>
      </div>

      {/* Traditional vs UrbanEye Architecture Diagram */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
          Traditional CCTV vs UrbanEye AI Edge Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Traditional */}
          <div className="p-4 bg-red-950/20 border border-red-800/40 rounded-xl space-y-2">
            <h3 className="font-bold text-red-400 uppercase text-xs">❌ Traditional CCTV Streaming</h3>
            <p className="text-gray-400">Raw Video Feed (1080p 500MB) → Transmitted over Cellular → High Bandwidth Cost + Privacy Risks</p>
          </div>

          {/* UrbanEye AI */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-2">
            <h3 className="font-bold text-emerald-400 uppercase text-xs">✓ UrbanEye Edge Architecture</h3>
            <p className="text-gray-400">Raw Video → Edge Jetson AI → Blur Faces → Extract Metadata (~1KB JSON) → Encrypted Cloud MQTT</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
