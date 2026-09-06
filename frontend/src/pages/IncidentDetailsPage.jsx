import React, { useEffect, useState } from 'react';
import api from '../services/api';
import IncidentModal from '../components/IncidentModal';
import { wsService } from '../services/websocket';
import { AlertTriangle, Filter, CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';

const IncidentDetailsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('All');

  const fetchIncidents = (silent = false) => {
    if (!silent) setRefreshing(true);
    api.get('/api/incidents')
      .then((res) => {
        setIncidents(res.data);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchIncidents();

    const unsub = wsService.subscribe((event) => {
      if (
        event.event_type === 'DRIVER_HAZARD_REPORTED' || 
        event.event_type === 'INCIDENT_UPDATED' || 
        event.event_type === 'SIH_TRIGGERED_EVENT'
      ) {
        fetchIncidents(true);
      }
    });

    const interval = setInterval(() => {
      fetchIncidents(true);
    }, 5000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const filtered = incidents.filter(i => filterSeverity === 'All' || i.severity === filterSeverity.toLowerCase());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-400 mr-2" />
            Urban Incident Registry & Verification
          </h1>
          <p className="text-xs text-gray-400">AI edge detections spatial-temporally deduplicated across transit buses.</p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400">Filter Severity:</span>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filterSeverity === sev ? 'bg-blue-600 text-white font-bold' : 'bg-gray-800 text-gray-300'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-gray-950 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-800">
            <tr>
              <th className="p-3.5">Incident ID</th>
              <th className="p-3.5">Issue Category</th>
              <th className="p-3.5">Severity</th>
              <th className="p-3.5">AI Confidence</th>
              <th className="p-3.5">Multi-Bus Verification</th>
              <th className="p-3.5">Location</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filtered.map((inc) => (
              <tr key={inc.incident_code} className="hover:bg-gray-800/40 transition">
                <td className="p-3.5 font-bold text-blue-400">{inc.incident_code}</td>
                <td className="p-3.5 font-semibold capitalize">{inc.issue_type.replace('_', ' ')}</td>
                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      inc.severity === 'critical'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : inc.severity === 'high'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </td>
                <td className="p-3.5 font-bold text-gray-200">{Math.round((inc.confidence || 0.92) * 100)}%</td>
                <td className="p-3.5">
                  {inc.multi_bus_verified ? (
                    <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 text-[10px]">
                      ✓ {inc.confirmations_count} Buses
                    </span>
                  ) : (
                    <span className="text-gray-500">1 Bus Observation</span>
                  )}
                </td>
                <td className="p-3.5 text-gray-400">{inc.location_name || 'City Route'}</td>
                <td className="p-3.5 font-semibold text-gray-200">{inc.status}</td>
                <td className="p-3.5">
                  <button
                    onClick={() => setSelected(inc)}
                    className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg font-bold transition"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <IncidentModal incident={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default IncidentDetailsPage;
