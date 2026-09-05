import React from 'react';
import { Activity, Cpu, Radio, Cloud, Database, CheckCircle2 } from 'lucide-react';

const SystemHealthPage = () => {
  const healthData = [
    { name: 'Edge Jetson Devices', status: '98.2% Healthy', icon: Cpu, color: 'text-cyan-400' },
    { name: 'Depot Fog Gateways', status: '99.1% Healthy', icon: Radio, color: 'text-purple-400' },
    { name: 'FastAPI Cloud Services', status: '99.9% Healthy', icon: Cloud, color: 'text-blue-400' },
    { name: 'MQTT Mosquitto Broker', status: 'CONNECTED', icon: Activity, color: 'text-emerald-400' },
    { name: 'PostgreSQL / PostGIS DB', status: 'HEALTHY', icon: Database, color: 'text-amber-400' }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center">
            <Activity className="w-5 h-5 text-emerald-400 mr-2" />
            Infrastructure System Health & Telemetry
          </h1>
          <p className="text-xs text-gray-400">Real-time status of distributed mobile sensing components.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthData.map((h) => {
          const Icon = h.icon;
          return (
            <div key={h.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-300">{h.name}</span>
                <Icon className={`w-4 h-4 ${h.color}`} />
              </div>
              <div className="text-lg font-extrabold text-white flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2" />
                <span>{h.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemHealthPage;
