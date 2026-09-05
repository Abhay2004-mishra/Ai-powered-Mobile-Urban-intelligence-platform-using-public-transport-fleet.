import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Clock, User, CheckCircle2, AlertCircle, Wrench, Filter, CheckSquare } from 'lucide-react';

const WorkOrdersPage = () => {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWO, setSelectedWO] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(user?.role === 'field_worker');

  const fetchWorkOrders = async () => {
    try {
      const res = await api.get('/api/work-orders');
      setWorkOrders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

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

  const filteredOrders = workOrders.filter((wo) => {
    const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter;
    const matchesAssigned = !assignedToMeOnly || 
      wo.assigned_worker === user?.email || 
      (user?.role === 'field_worker' && (wo.assigned_worker === 'worker@urbaneye.ai' || !wo.assigned_worker));
    return matchesStatus && matchesAssigned;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center">
            <ClipboardList className="w-5 h-5 text-purple-400 mr-2" />
            {user?.role === 'field_worker' ? 'Field Operator Rapid Response & Work Orders' : 'Municipal Work Order & Dispatch Pipeline'}
          </h1>
          <p className="text-xs text-gray-400">
            {user?.role === 'field_worker' 
              ? 'View your dispatched repair tickets, update job progress, and submit proof of road resolution.' 
              : 'Automated SLAs, rapid field team assignment, and incident resolution tracking.'}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {user?.role === 'field_worker' && (
            <button
              onClick={() => setAssignedToMeOnly(!assignedToMeOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 ${
                assignedToMeOnly
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                  : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Assigned To Me</span>
            </button>
          )}

          <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
            {['ALL', 'NEW', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Field Worker Alert Notice */}
      {user?.role === 'field_worker' && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-200 flex items-center space-x-2">
          <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Logged in as <strong>{user.full_name}</strong> ({user.department}). Update work order statuses in real time to inform municipal command.
          </span>
        </div>
      )}

      {/* Grid of Work Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full p-12 bg-gray-900/60 border border-gray-800 rounded-2xl text-center text-gray-400 text-xs">
            No work orders found for the selected filter.
          </div>
        ) : (
          filteredOrders.map((wo) => {
            const isCritical = wo.priority === 'critical';
            const isMyJob = wo.assigned_worker === user?.email || (user?.role === 'field_worker' && wo.assigned_worker === 'worker@urbaneye.ai');

            return (
              <div 
                key={wo.work_order_code} 
                className={`bg-gray-900 border rounded-2xl p-4 space-y-3 shadow-xl transition relative ${
                  isMyJob ? 'border-amber-500/40 shadow-amber-500/5' : 'border-gray-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold text-blue-400 text-sm">{wo.work_order_code}</span>
                    <div className="text-xs font-semibold text-gray-200 capitalize mt-0.5">{wo.issue_type.replace('_', ' ')}</div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {isMyJob && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                        My Task
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        isCritical ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {wo.priority} SLA
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2">{wo.description}</p>

                <div className="text-xs text-gray-400 space-y-1 bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                  <div className="flex items-center text-blue-300">
                    <User className="w-3.5 h-3.5 mr-1.5" />
                    <span>Assigned: {wo.worker_name || 'Field Rapid Response Team'}</span>
                  </div>
                  <div className="flex items-center text-amber-300">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    <span>SLA Target: {new Date(wo.sla_deadline).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
                  <span className={`font-bold uppercase text-[11px] ${
                    wo.status === 'RESOLVED' ? 'text-emerald-400' : (wo.status === 'IN_PROGRESS' ? 'text-blue-400' : 'text-amber-400')
                  }`}>
                    {wo.status.replace('_', ' ')}
                  </span>
                  {wo.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => setSelectedWO(wo)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition text-xs shadow-md shadow-emerald-600/20"
                    >
                      Update / Resolve
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
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
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

            <div className="flex space-x-2">
              <button
                onClick={() => handleUpdateStatus(selectedWO.work_order_code, 'IN_PROGRESS')}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition"
              >
                Mark In-Progress
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedWO.work_order_code, 'RESOLVED')}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => setSelectedWO(null)}
                className="px-3 py-2.5 bg-gray-800 text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-700 transition"
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
