import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { wsService } from '../services/websocket';
import { 
  ClipboardList, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Filter, 
  CheckSquare, 
  RefreshCw, 
  Search, 
  Bus, 
  Sparkles, 
  MapPin, 
  Zap,
  ArrowRight,
  Flame
} from 'lucide-react';

const WorkOrdersPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightCode = searchParams.get('highlight');

  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWO, setSelectedWO] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(user?.role === 'field_worker');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const highlightedCardRef = useRef(null);

  const fetchWorkOrders = async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await api.get('/api/work-orders');
      setWorkOrders(res.data);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error('Fetch work orders error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();

    // Subscribe to real-time WebSockets
    const unsubscribe = wsService.subscribe((event) => {
      if (
        event.event_type === 'WORK_ORDER_CREATED' || 
        event.event_type === 'WORK_ORDER_UPDATED' || 
        event.event_type === 'DRIVER_HAZARD_REPORTED'
      ) {
        fetchWorkOrders(true);
      }
    });

    // 4-second polling timer for rock-solid sync
    const interval = setInterval(() => {
      fetchWorkOrders(true);
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Scroll highlighted card into view if present
  useEffect(() => {
    if (highlightCode && workOrders.length > 0) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`wo-${highlightCode}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [highlightCode, workOrders]);

  const handleUpdateStatus = async (woCode, newStatus) => {
    try {
      await api.patch(`/api/work-orders/${woCode}`, {
        status: newStatus,
        resolution_notes: resolutionNotes || 'Repaired segment using rapid municipal patch mix.'
      });
      setSelectedWO(null);
      setResolutionNotes('');
      fetchWorkOrders();
    } catch (e) {
      console.error(e);
    }
  };

  // Filter logic
  const filteredOrders = workOrders.filter((wo) => {
    // Status Filter
    if (statusFilter === 'DRIVER_REPORTS') {
      const isDriverReport = wo.description && (
        wo.description.includes('DRIVER') || 
        wo.description.includes('IN-CAB') || 
        wo.description.includes('driver') ||
        wo.location_name?.includes('Reported by')
      );
      if (!isDriverReport) return false;
    } else if (statusFilter === 'CRITICAL_SLA') {
      if (wo.priority !== 'critical') return false;
    } else if (statusFilter !== 'ALL') {
      if (wo.status !== statusFilter) return false;
    }

    // Role-based assigned filter
    const matchesAssigned = !assignedToMeOnly || 
      wo.assigned_worker === user?.email || 
      (user?.role === 'field_worker' && (wo.assigned_worker === 'worker@urbaneye.ai' || !wo.assigned_worker));
    if (!matchesAssigned) return false;

    // Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchCode = wo.work_order_code?.toLowerCase().includes(q);
      const matchDesc = wo.description?.toLowerCase().includes(q);
      const matchLoc = wo.location_name?.toLowerCase().includes(q);
      const matchType = wo.issue_type?.toLowerCase().includes(q);
      const matchWorker = wo.worker_name?.toLowerCase().includes(q);
      if (!matchCode && !matchDesc && !matchLoc && !matchType && !matchWorker) return false;
    }

    return true;
  });

  const driverReportsCount = workOrders.filter(
    (wo) => wo.description && (wo.description.includes('DRIVER') || wo.description.includes('IN-CAB'))
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 p-4 sm:p-5 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-lg font-black text-white flex items-center">
              <ClipboardList className="w-5 h-5 text-purple-400 mr-2" />
              {user?.role === 'field_worker' ? 'Field Operator Rapid Response & Work Orders' : 'Municipal Work Order & Dispatch Pipeline'}
            </h1>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-800 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
              LIVE SYNC
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time automated work orders dispatched from AI edge sensing and bus driver cockpit reports.
          </p>
        </div>

        {/* Action controls & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchWorkOrders()}
            disabled={refreshing}
            className="px-3 py-2 bg-gray-950 hover:bg-gray-800 text-gray-300 rounded-xl border border-gray-800 text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          {user?.role === 'field_worker' && (
            <button
              onClick={() => setAssignedToMeOnly(!assignedToMeOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 ${
                assignedToMeOnly
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                  : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>My Tasks</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter bar and Search row */}
      <div className="bg-gray-900/90 border border-gray-800 p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by WO #, driver notes, location, or issue..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500 placeholder-gray-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'DRIVER_REPORTS', label: `🚌 Driver In-Cab Reports (${driverReportsCount})`, highlight: true },
            { id: 'CRITICAL_SLA', label: '⚡ Critical SLA' },
            { id: 'NEW', label: 'New' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'RESOLVED', label: 'Resolved' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : tab.highlight
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-800/80 hover:bg-purple-900/60'
                  : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Work Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full p-12 bg-gray-900/60 border border-gray-800 rounded-3xl text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-gray-950 border border-gray-800 mx-auto flex items-center justify-center text-gray-500">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-gray-300">No work orders matched your filter</div>
            <p className="text-xs text-gray-500">Try clearing the search query or selecting "All Orders".</p>
          </div>
        ) : (
          filteredOrders.map((wo) => {
            const isCritical = wo.priority === 'critical';
            const isMyJob = wo.assigned_worker === user?.email || (user?.role === 'field_worker' && wo.assigned_worker === 'worker@urbaneye.ai');
            const isHighlighted = highlightCode && wo.work_order_code === highlightCode;
            const isDriverReport = wo.description && (
              wo.description.includes('DRIVER') || 
              wo.description.includes('IN-CAB') || 
              wo.location_name?.includes('Reported by')
            );

            // Extract driver note if present
            let driverNoteSnippet = null;
            if (wo.description && (wo.description.includes('REPORT') || wo.description.includes('DRIVER'))) {
              const quoteMatch = wo.description.match(/"([^"]+)"/);
              if (quoteMatch) {
                driverNoteSnippet = quoteMatch[1];
              }
            }

            return (
              <div 
                key={wo.work_order_code} 
                id={`wo-${wo.work_order_code}`}
                className={`bg-gray-900 border rounded-3xl p-5 space-y-3.5 shadow-xl transition relative overflow-hidden ${
                  isHighlighted 
                    ? 'border-cyan-400 ring-2 ring-cyan-500/50 shadow-2xl shadow-cyan-500/20 bg-gray-900/95' 
                    : isDriverReport
                    ? 'border-purple-600/50 hover:border-purple-500 bg-gradient-to-b from-purple-950/20 to-gray-900 shadow-purple-950/20'
                    : isMyJob 
                    ? 'border-amber-500/40 shadow-amber-500/5' 
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                {isHighlighted && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-blue-600 text-white font-black text-[9px] px-3 py-0.5 rounded-bl-xl uppercase tracking-wider shadow-md">
                    Target Ticket
                  </div>
                )}

                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-cyan-400 text-sm font-mono tracking-tight">{wo.work_order_code}</span>
                      {isDriverReport && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center space-x-1">
                          <Bus className="w-2.5 h-2.5 mr-0.5 text-purple-400" />
                          <span>Bus Driver Report</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-gray-200 capitalize mt-1 flex items-center space-x-1.5">
                      <span>{wo.issue_type.replace('_', ' ')}</span>
                      {wo.location_name && (
                        <span className="text-gray-400 font-normal truncate max-w-[180px]">• {wo.location_name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                        isCritical 
                          ? 'bg-red-950 text-red-400 border border-red-800' 
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {wo.priority} SLA
                    </span>
                  </div>
                </div>

                {/* Prominent Driver Notes Badge */}
                {driverNoteSnippet && (
                  <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-2xl text-xs text-purple-200 space-y-1">
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wide flex items-center space-x-1">
                      <Bus className="w-3 h-3 text-purple-400" />
                      <span>Driver In-Cab Dispatch Note</span>
                    </div>
                    <div className="font-semibold italic text-purple-100">
                      "{driverNoteSnippet}"
                    </div>
                  </div>
                )}

                {/* Description snippet if no special note */}
                {!driverNoteSnippet && wo.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{wo.description}</p>
                )}

                {/* Assigned worker & SLA time */}
                <div className="text-xs text-gray-400 space-y-1.5 bg-gray-950/80 p-3 rounded-2xl border border-gray-800/80">
                  <div className="flex items-center justify-between text-blue-300">
                    <div className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                      <span>Assigned:</span>
                    </div>
                    <span className="font-semibold">{wo.worker_name || 'Field Rapid Response Team'}</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-300">
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                      <span>Target SLA:</span>
                    </div>
                    <span className="font-mono font-bold">
                      {new Date(wo.sla_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      wo.status === 'RESOLVED' ? 'bg-emerald-400' : (wo.status === 'IN_PROGRESS' ? 'bg-blue-400 animate-pulse' : 'bg-amber-400')
                    }`} />
                    <span className={`font-bold uppercase text-[11px] ${
                      wo.status === 'RESOLVED' ? 'text-emerald-400' : (wo.status === 'IN_PROGRESS' ? 'text-blue-400' : 'text-amber-400')
                    }`}>
                      {wo.status.replace('_', ' ')}
                    </span>
                  </div>

                  {wo.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => setSelectedWO(wo)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-1"
                    >
                      <span>Update / Resolve</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> RESOLVED
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolution Modal */}
      {selectedWO && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h2 className="text-sm font-bold text-white">Update Work Order {selectedWO.work_order_code}</h2>
              <span className="text-xs text-blue-400 uppercase font-bold">{selectedWO.priority} PRIORITY</span>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Field Resolution Notes / Material Used</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Field repair completed. Cold/hot patch applied to road segment. Road reopened to traffic..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-blue-500 h-24"
              />
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => handleUpdateStatus(selectedWO.work_order_code, 'IN_PROGRESS')}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition"
              >
                Mark In-Progress
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedWO.work_order_code, 'RESOLVED')}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => setSelectedWO(null)}
                className="px-3.5 py-2.5 bg-gray-800 text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrdersPage;
