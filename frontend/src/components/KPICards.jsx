import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Bus, AlertOctagon, Flame, ClipboardList, MapPin, Clock } from 'lucide-react';

const KPICards = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/api/dashboard/summary').then((res) => {
      setSummary(res.data);
    }).catch(console.error);
  }, []);

  const cards = [
    { label: 'ACTIVE BUSES', value: summary?.active_buses || 124, sub: 'Out of 150 Fleet', icon: Bus, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/40' },
    { label: 'DETECTIONS TODAY', value: summary?.detections_today?.toLocaleString() || '1,284', sub: '+18% vs Yesterday', icon: Flame, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' },
    { label: 'CRITICAL INCIDENTS', value: summary?.critical_incidents || 37, sub: 'Requires Dispatch', icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-950/40 border-red-800/40' },
    { label: 'OPEN WORK ORDERS', value: summary?.open_work_orders || 82, sub: 'In Repair Pipeline', icon: ClipboardList, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/40' },
    { label: 'ROAD COVERAGE', value: `${summary?.road_coverage_percent || 81.4}%`, sub: 'Target: 80%+', icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
    { label: 'AVG RESPONSE TIME', value: summary?.avg_response_time || '3m 12s', sub: 'Traditional: 7 Days', icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/40' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className={`p-3.5 rounded-xl border ${c.bg} backdrop-blur-md flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider">{c.label}</span>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-white leading-none font-heading">{c.value}</div>
              <div className="text-[10px] text-gray-400 mt-1 font-medium">{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
