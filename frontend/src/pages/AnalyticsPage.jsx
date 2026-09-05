import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Zap, Award } from 'lucide-react';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/api/analytics/summary').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-500 text-xs">Loading Analytics...</div>;

  const { sih_target_metrics, detection_trends, category_distribution, severity_distribution } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center">
            <BarChart3 className="w-5 h-5 text-emerald-400 mr-2" />
            Smart City Urban Intelligence Analytics
          </h1>
          <p className="text-xs text-gray-400">SIH Proposal Target Metrics & Real-time Sensor Intelligence.</p>
        </div>
      </div>

      {/* SIH Proposal Target Metrics Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-purple-950/80 border border-blue-800/50 p-5 rounded-2xl space-y-3">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="text-xs font-black text-amber-300 uppercase tracking-wider">
            SIH Proposal Target Impact Metrics (Projected Target Impact)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center">
          <div className="p-3 bg-gray-950/70 border border-gray-800 rounded-xl">
            <div className="text-xl font-black text-emerald-400 font-heading">21× Faster</div>
            <div className="text-[10px] text-gray-300 font-semibold mt-1">Pothole Detection Speedup</div>
          </div>
          <div className="p-3 bg-gray-950/70 border border-gray-800 rounded-xl">
            <div className="text-xl font-black text-cyan-400 font-heading">90% Lower</div>
            <div className="text-[10px] text-gray-300 font-semibold mt-1">Road Inspection Cost</div>
          </div>
          <div className="p-3 bg-gray-950/70 border border-gray-800 rounded-xl">
            <div className="text-xl font-black text-red-400 font-heading">10× Faster</div>
            <div className="text-[10px] text-gray-300 font-semibold mt-1">Accident Response Time</div>
          </div>
          <div className="p-3 bg-gray-950/70 border border-gray-800 rounded-xl">
            <div className="text-xl font-black text-purple-400 font-heading">80% Daily</div>
            <div className="text-[10px] text-gray-300 font-semibold mt-1">City Road Fleet Coverage</div>
          </div>
          <div className="p-3 bg-gray-950/70 border border-gray-800 rounded-xl">
            <div className="text-xl font-black text-amber-400 font-heading">12% Fuel</div>
            <div className="text-[10px] text-gray-300 font-semibold mt-1">Municipal Vehicle Savings</div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: 7-Day Detection Trends */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            7-Day Detection Frequency Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={detection_trends}>
                <XAxis dataKey="day" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="potholes" stroke="#EF4444" strokeWidth={2} name="Potholes" />
                <Line type="monotone" dataKey="road_damage" stroke="#F59E0B" strokeWidth={2} name="Road Damage" />
                <Line type="monotone" dataKey="obstacles" stroke="#3B82F6" strokeWidth={2} name="Obstacles" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Category Distribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            Detection Category Breakdown
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={category_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {category_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
