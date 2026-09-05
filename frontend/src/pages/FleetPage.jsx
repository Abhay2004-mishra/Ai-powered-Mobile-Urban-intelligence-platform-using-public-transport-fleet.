import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Bus, 
  Cpu, 
  Radio, 
  Camera, 
  Activity, 
  ArrowRight, 
  MapPin, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  Zap,
  Gauge
} from 'lucide-react';

const FleetPage = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/buses').then(res => {
      setBuses(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredBuses = buses.filter(b => {
    const matchesSearch = b.bus_code.toLowerCase().includes(search.toLowerCase()) || 
                          (b.route_id && b.route_id.toLowerCase().includes(search.toLowerCase())) ||
                          (b.driver_name && b.driver_name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDetections = buses.reduce((acc, b) => acc + (b.today_detections_count || 42), 0);
  const onlineCount = buses.filter(b => b.status === 'ONLINE').length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-wide">
                PUBLIC TRANSPORT FLEET & EDGE SENSING MATRIX
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 font-bold text-xs border border-blue-800">
                124 Active Transit Buses
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Roof-mounted NVIDIA Jetson edge cameras continuously sensing road hazards across urban corridors.
            </p>
          </div>
        </div>

        {/* Quick Fleet Health Badge */}
        <div className="flex items-center space-x-3 text-xs bg-gray-950 p-2 rounded-2xl border border-gray-800 self-start sm:self-auto">
          <div className="px-3 py-1">
            <span className="text-[10px] text-gray-500 block">FLEET STATUS</span>
            <span className="font-bold text-emerald-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5" />
              {onlineCount} Online
            </span>
          </div>
          <div className="h-6 w-[1px] bg-gray-800" />
          <div className="px-3 py-1">
            <span className="text-[10px] text-gray-500 block">TODAY DETECTIONS</span>
            <span className="font-bold text-amber-400 font-mono">{totalDetections.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Bus ID (BUS-104), Route, Driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['ALL', 'ONLINE', 'WARNING'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All Buses' : (st === 'ONLINE' ? 'Online (Healthy)' : 'Warning / Service')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Buses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBuses.map((b) => {
          const isWarning = b.status === 'WARNING';
          return (
            <div
              key={b.bus_code}
              onClick={() => navigate(`/fleet/${b.bus_code}`)}
              className={`bg-gray-900/90 border rounded-3xl p-5 cursor-pointer transition-all duration-200 shadow-xl space-y-3.5 hover:scale-[1.02] ${
                isWarning 
                  ? 'border-amber-700/60 hover:border-amber-500 shadow-amber-950/20' 
                  : 'border-gray-800 hover:border-blue-500/60'
              }`}
            >
              {/* Card Top */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-white text-base font-heading tracking-wide">
                      {b.bus_code}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                      {b.route_id || 'R-02'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">Driver: {b.driver_name || 'Gurpreet Singh'}</div>
                </div>

                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                  isWarning 
                    ? 'bg-amber-950 text-amber-400 border border-amber-800' 
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {b.status}
                </span>
              </div>

              {/* Hardware Diagnostic Telemetry Box */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-950 p-3 rounded-2xl border border-gray-800">
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-mono">Edge Processor</span>
                  <span className="font-bold text-cyan-300 flex items-center mt-0.5">
                    <Cpu className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                    Jetson Orin (FP16)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-mono">Roof Cam Feed</span>
                  <span className="font-bold text-emerald-400 flex items-center mt-0.5">
                    <Camera className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    1080p @ 30 FPS
                  </span>
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-800/80">
                <div className="flex items-center space-x-1.5 text-gray-400">
                  <Gauge className="w-3.5 h-3.5 text-blue-400" />
                  <span>Speed: <strong className="text-white font-mono">{b.speed_kmh || 38} km/h</strong></span>
                </div>

                <div className="flex items-center space-x-1 text-blue-400 font-bold group-hover:underline">
                  <span>View Dashcam HUD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FleetPage;
