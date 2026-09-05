import React, { useState } from 'react';
import api from '../services/api';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  MapPin, 
  Bus, 
  Send, 
  Printer, 
  Flame, 
  ShieldAlert,
  Calendar,
  Layers
} from 'lucide-react';

const IncidentModal = ({ incident, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [falseReason, setFalseReason] = useState('Road Construction / Work in Progress');
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  const handleCreateWorkOrder = async () => {
    setLoading(true);
    try {
      await api.post('/api/work-orders', {
        incident_id: incident.incident_code,
        assigned_worker: 'worker@urbaneye.ai',
        worker_name: 'Rajesh Kumar (Field Rapid Response Team A)',
        description: `Rapid dispatch for ${incident.severity.toUpperCase()} severity ${incident.issue_type.replace('_', ' ')} detected via bus edge sensing.`
      });
      setSuccessMsg('Municipal Work Order created and dispatched with 30m SLA!');
      setTimeout(() => onClose(), 1600);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFalsePositive = async () => {
    setLoading(true);
    try {
      await api.patch(`/api/incidents/${incident.incident_code}`, {
        status: 'FALSE_POSITIVE',
        false_positive_reason: falseReason
      });
      setSuccessMsg('Incident archived as False Positive. Edge YOLOv11 feedback loop updated.');
      setTimeout(() => onClose(), 1600);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const buses = incident.buses_list_json ? JSON.parse(incident.buses_list_json) : ['BUS-101', 'BUS-104'];

  return (
    <div className="fixed inset-0 z-[2500] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl space-y-5 my-6 max-h-[92vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-gray-800">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl font-black text-white font-heading">{incident.incident_code}</span>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                  incident.severity === 'critical'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {incident.severity} SLA PRIORITY
              </span>
            </div>
            <p className="text-xs text-gray-400 capitalize mt-1 flex items-center space-x-2">
              <span className="text-white font-semibold">{incident.issue_type.replace('_', ' ')}</span>
              <span>•</span>
              <span>{incident.location_name || 'Transit Main Corridor'}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-950 hover:bg-gray-800 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/90 border border-emerald-800 text-emerald-200 text-xs rounded-2xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Simulated Camera Snapshot with AI Bounding Box */}
        <div className="relative w-full h-52 bg-black rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center group">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900 to-slate-900 opacity-95">
            {/* Perspective road grid */}
            <div className="w-full h-full bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
          </div>

          {/* AI Bounding Box & Segmentation Simulation */}
          <div className="absolute top-12 left-1/3 w-48 h-28 border-2 border-red-500 bg-red-500/20 rounded-xl p-2 flex flex-col justify-between shadow-2xl shadow-red-500/40">
            <div className="flex justify-between items-center bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-red-400">
              <span>{incident.issue_type.toUpperCase()}</span>
              <span>{Math.round((incident.confidence || 0.94) * 100)}% CONF</span>
            </div>
            <div className="text-[9px] font-mono text-white/90 bg-black/70 px-1.5 py-0.5 rounded self-start">
              depth: ~6.5cm • area: 0.85m²
            </div>
          </div>

          <div className="absolute bottom-3 left-3 bg-gray-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-800 text-[10px] text-gray-300 font-mono flex items-center space-x-3">
            <span className="text-cyan-400 flex items-center">
              <Bus className="w-3 h-3 mr-1" />
              Source: {buses[0]} Dashcam
            </span>
            <span>•</span>
            <span>GPS: {incident.latitude?.toFixed(4)}° N, {incident.longitude?.toFixed(4)}° E</span>
          </div>
        </div>

        {/* Verification Proof Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">Model Confidence</span>
            <span className="text-xl font-black text-blue-400 font-mono mt-0.5 block">
              {Math.round((incident.confidence || 0.94) * 100)}%
            </span>
            <span className="text-[10px] text-gray-400">YOLOv11 TensorRT FP16</span>
          </div>

          <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">Multi-Bus Verification</span>
            <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
              {incident.confirmations_count || buses.length} Buses
            </span>
            <span className="text-[10px] text-emerald-500 font-bold">
              {incident.multi_bus_verified ? '✓ Fog Deduplicated' : 'Single Observation'}
            </span>
          </div>

          <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">Dispatched SLA</span>
            <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
              {incident.severity === 'critical' ? '30 Mins' : '2 Hours'}
            </span>
            <span className="text-[10px] text-gray-400">Rapid Response Team A</span>
          </div>
        </div>

        {/* Bus confirmations timeline */}
        <div className="p-3.5 bg-gray-950/80 rounded-2xl border border-gray-800 text-xs space-y-2">
          <div className="font-bold text-gray-300 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Bus className="w-3.5 h-3.5 text-blue-400" />
              <span>Independent Bus Camera Observations</span>
            </span>
            <span className="text-[10px] text-gray-500 font-mono">Cluster Radius: &lt;15m</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {buses.map((b, idx) => (
              <div key={b} className="px-3 py-1 bg-gray-900 border border-blue-500/30 text-blue-300 rounded-xl font-mono text-[11px] flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{b} (Observation #{idx + 1})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleCreateWorkOrder}
            disabled={loading}
            className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-1.5 disabled:opacity-50 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Approve & Dispatch Work Order</span>
          </button>

          <button
            onClick={handleMarkFalsePositive}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs border border-gray-700 transition"
          >
            Mark False Positive
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentModal;
