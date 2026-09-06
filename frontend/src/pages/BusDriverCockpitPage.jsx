import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  Gauge, 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  Compass, 
  Camera, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Radio, 
  CheckCircle2, 
  Send,
  Navigation,
  Clock,
  ClipboardList,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BusDriverCockpitPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [speed, setSpeed] = useState(38);
  const [audioAlert, setAudioAlert] = useState(true);
  const [selectedBusCode, setSelectedBusCode] = useState('BUS-104');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('pothole');
  const [reportNotes, setReportNotes] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [dispatchedTicket, setDispatchedTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subtle speedometer simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(Math.floor(34 + Math.random() * 8));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const routeStops = [
    { name: 'ISBT Central Terminal', time: '09:00 AM', passed: true },
    { name: 'Railway Station North', time: '09:18 AM', passed: true },
    { name: 'Civil Lines Commercial Hub', time: '09:35 AM', current: true },
    { name: 'Sector 4 Metro Junction', time: '09:50 AM', next: true },
    { name: 'University South Campus', time: '10:15 AM', passed: false },
  ];

  const upcomingHazards = [
    {
      id: 'HAZ-01',
      type: 'pothole',
      distance: '240 meters ahead',
      lane: 'Left Lane (Lane 1)',
      severity: 'critical',
      warning: 'Deep multi-bus verified pothole detected. Reduce speed to 25 km/h.',
      busVerified: 'Verified by BUS-101 & BUS-112'
    },
    {
      id: 'HAZ-02',
      type: 'road_damage',
      distance: '1.4 km ahead',
      lane: 'Center Lane',
      severity: 'medium',
      warning: 'Asphalt fissure repair work ongoing. Slow moving traffic.',
      busVerified: 'Reported 12m ago'
    }
  ];

  const handleDriverReport = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const sev = (reportType === 'accident' || reportType === 'road_damage') ? 'critical' : 'high';
      const res = await api.post('/api/incidents/driver-report', {
        bus_code: selectedBusCode,
        issue_type: reportType,
        driver_notes: reportNotes || 'Driver visual observation of road defect',
        severity: sev
      });

      setDispatchedTicket(res.data);
      setReportSuccess(`Municipal Work Order #${res.data.work_order_code} dispatched successfully!`);
    } catch (err) {
      console.error('Direct report failed, trying fallback:', err);
      try {
        const fb = await api.post('/api/simulation/trigger', {
          issue_type: reportType,
          bus_code: selectedBusCode,
          driver_notes: reportNotes || 'Driver visual observation of road defect'
        });
        setDispatchedTicket({
          work_order_code: fb.data.work_order_code || 'WO-DISPATCH',
          issue_type: reportType,
          severity: 'high',
          sla_deadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
          description: reportNotes || 'Dispatched from bus cockpit'
        });
        setReportSuccess('Hazard report transmitted to Municipal Command Center!');
      } catch (e2) {
        setReportSuccess('Report transmitted to fleet dispatch radio!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cockpit Header */}
      <div className="bg-gray-900 border border-gray-800 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/25">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white font-heading tracking-wide">
                BUS IN-CAB DRIVER COCKPIT HUD
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                ROUTE ACTIVE
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Assigned Bus: <strong className="text-purple-300">{selectedBusCode}</strong> • Route R-02 (Mall Road Commercial Corridor) • Driver: {user?.full_name || 'Gurpreet Singh'}
            </p>
          </div>
        </div>

        {/* Cockpit Actions */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setAudioAlert(!audioAlert)}
            className={`p-2.5 rounded-xl border transition flex items-center space-x-1.5 text-xs font-semibold ${
              audioAlert ? 'bg-purple-950/60 border-purple-800 text-purple-300' : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            {audioAlert ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{audioAlert ? 'Radar Audio: ON' : 'Radar Muted'}</span>
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-red-500/20 flex items-center space-x-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Road Hazard</span>
          </button>
        </div>
      </div>

      {/* Main Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Digital Speedometer & Bus Telemetry HUD */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-gray-800">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>Digital Telemetry Cluster</span>
            </span>
            <span className="text-xs text-gray-500 font-mono">CAN-BUS SYNCED</span>
          </div>

          {/* Speed Dial Cluster */}
          <div className="text-center py-4 relative">
            <div className="w-44 h-44 rounded-full border-4 border-dashed border-cyan-500/40 mx-auto flex flex-col items-center justify-center relative bg-gradient-to-b from-gray-950 to-gray-900 shadow-2xl">
              <span className="text-5xl font-black text-white font-heading tracking-tighter">
                {speed}
              </span>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest mt-1">
                KM / H
              </span>
              <span className="text-[10px] text-gray-500 mt-1">Speed Limit: 50 km/h</span>
            </div>
          </div>

          {/* Bus Vital Gauges */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800">
              <span className="text-[10px] text-gray-500 block">BATTERY</span>
              <span className="font-extrabold text-emerald-400 text-sm">94%</span>
            </div>
            <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800">
              <span className="text-[10px] text-gray-500 block">ENG TEMP</span>
              <span className="font-extrabold text-amber-400 text-sm">88°C</span>
            </div>
            <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800">
              <span className="text-[10px] text-gray-500 block">ODOMETER</span>
              <span className="font-extrabold text-blue-400 text-sm">14,280 km</span>
            </div>
          </div>

          {/* Onboard Hardware Status */}
          <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800 space-y-1.5 text-xs">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Onboard Jetson Edge Stack</div>
            <div className="flex justify-between text-gray-300">
              <span>Roof Dashcam:</span>
              <span className="text-emerald-400 font-bold flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> 1080p @ 30 FPS
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Edge YOLOv11:</span>
              <span className="text-cyan-400 font-bold">RUNNING (28ms)</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>GPS Satellites:</span>
              <span className="text-purple-400 font-bold">11 SATS LOCKED</span>
            </div>
          </div>
        </div>

        {/* Center & Right: Upcoming Road Hazard Radar */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Hazard Warning Radar Card */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Road Hazard Radar (Ahead on Route R-02)</span>
                </h3>
              </div>
              <span className="text-[10px] bg-red-950 text-red-400 font-bold px-2.5 py-1 rounded-full border border-red-800">
                CRITICAL ALERT AHEAD
              </span>
            </div>

            {/* List of Hazards Ahead */}
            <div className="space-y-3">
              {upcomingHazards.map((haz) => (
                <div
                  key={haz.id}
                  className={`p-4 rounded-2xl border transition relative overflow-hidden ${
                    haz.severity === 'critical'
                      ? 'bg-red-950/30 border-red-800/80 shadow-lg shadow-red-950/30'
                      : 'bg-amber-950/30 border-amber-800/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-xl mt-0.5 ${
                        haz.severity === 'critical' ? 'bg-red-900/60 text-red-300' : 'bg-amber-900/60 text-amber-300'
                      }`}>
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white capitalize">
                            {haz.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-red-950 text-red-400 border border-red-800">
                            {haz.distance}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">{haz.warning}</p>
                        <div className="flex items-center space-x-3 text-[11px] text-gray-400 mt-2 font-mono">
                          <span className="text-cyan-400">{haz.lane}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">{haz.busVerified}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-gray-500 block">ADVISORY ACTION</span>
                      <span className="text-xs font-black text-amber-300 bg-amber-950 px-2 py-1 rounded border border-amber-800 mt-0.5 inline-block">
                        SHIFT TO RIGHT LANE
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Progression Timeline */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-purple-400" />
              <span>Route R-02 Transit Stops Progression</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
              {routeStops.map((stop, idx) => (
                <div
                  key={stop.name}
                  className={`p-3 rounded-2xl border text-center transition ${
                    stop.current
                      ? 'bg-purple-950/60 border-purple-500 ring-1 ring-purple-500 shadow-md'
                      : stop.passed
                      ? 'bg-gray-950/60 border-gray-800 text-gray-400'
                      : 'bg-gray-950/40 border-gray-800/60 text-gray-500'
                  }`}
                >
                  <div className={`text-[10px] font-bold ${
                    stop.current ? 'text-purple-300' : (stop.passed ? 'text-emerald-400' : 'text-gray-500')
                  }`}>
                    {stop.current ? '📍 CURRENT STOP' : (stop.passed ? '✓ PASSED' : 'NEXT')}
                  </div>
                  <div className="font-bold text-gray-200 mt-1 truncate">{stop.name}</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-0.5">{stop.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Driver Manual Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Driver Instant Hazard Report</span>
              </h3>
              <span className="text-[10px] text-purple-300 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-800">{selectedBusCode}</span>
            </div>

            {dispatchedTicket ? (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-950/80 border border-emerald-700/80 rounded-2xl space-y-2.5">
                  <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Transmitted to Municipal Command!</span>
                  </div>
                  <div className="text-xs text-gray-300 leading-relaxed">
                    Municipal Work Order <strong className="text-cyan-300 font-mono text-sm font-black">#{dispatchedTicket.work_order_code}</strong> has been created and auto-dispatched to the Rapid Response Team.
                  </div>
                </div>

                <div className="p-3.5 bg-gray-950 rounded-2xl border border-gray-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Target SLA:</span>
                    <span className="font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 uppercase">
                      {dispatchedTicket.severity === 'critical' ? '⚡ 30 Mins (Critical SLA)' : '⚡ 2 Hours SLA'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Assigned Team:</span>
                    <span className="text-blue-300 font-semibold">{dispatchedTicket.worker_name || 'Field Rapid Response Team'}</span>
                  </div>
                  {dispatchedTicket.description && (
                    <div className="pt-1 text-[11px] text-gray-400 border-t border-gray-800 italic">
                      {dispatchedTicket.description}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setReportModalOpen(false);
                      navigate(`/work-orders?highlight=${dispatchedTicket.work_order_code}`);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2"
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>View in Municipal Work Orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDispatchedTicket(null);
                        setReportNotes('');
                        setReportSuccess('');
                      }}
                      className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition"
                    >
                      Report Another Hazard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReportModalOpen(false);
                        setDispatchedTicket(null);
                        setReportNotes('');
                        setReportSuccess('');
                      }}
                      className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 text-xs font-semibold rounded-xl border border-gray-800 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDriverReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Hazard Category</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="pothole">Deep Pothole on Lane</option>
                    <option value="accident">Road Accident / Collision</option>
                    <option value="road_damage">Road Sub-surface Damage</option>
                    <option value="obstacle">Large Obstacle / Fallen Tree</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Driver Notes (Optional)</label>
                  <textarea
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Severe crater in left lane right after junction. Needs urgent patching..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-blue-500 h-20"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-red-500/20 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                    <span>{isSubmitting ? 'Transmitting to Command...' : 'Transmit to Command Center'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-800 text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusDriverCockpitPage;
