import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Bell, Cpu, Cloud, Radio, LogOut, User, Search, Award, Box } from 'lucide-react';
import ProblemStatementModal from './ProblemStatementModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);

  const notifications = [
    { id: 1, title: '🚨 Critical Accident Detected', time: '2m ago', desc: 'Bus BUS-104 camera reported collision near Route R-02.' },
    { id: 2, title: '⚠️ Multi-Bus Verified Pothole', time: '5m ago', desc: 'Verified by BUS-101, BUS-107 & BUS-112.' },
    { id: 3, title: '📋 Work Order Auto-Dispatched', time: '12m ago', desc: 'WO-9041 created with 30m SLA deadline.' }
  ];

  return (
    <>
      <header className="h-16 border-b border-gray-800 bg-[#0F172A]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              UE
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide leading-tight">URBANEYE AI</h1>
              <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Municipal Command Center</p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-gray-800 mx-2 hidden md:block" />

          {/* SIH Showcase Quick Button */}
          <button
            onClick={() => setShowProblemModal(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-purple-600/30 hover:from-blue-600/50 hover:to-purple-600/50 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition shadow-sm"
          >
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>SIH 26124 Showcase</span>
          </button>

          {/* 3D Bus & Workflow Direct Link */}
          <button
            onClick={() => navigate('/workflow')}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition shadow-sm"
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D Bus & Workflow</span>
          </button>

          {/* System Health Indicators */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <span className="flex items-center text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5" />
              SYSTEM ONLINE
            </span>
            <span className="flex items-center text-gray-400 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-md">
              <Cpu className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Edge AI: LIVE
            </span>
            <span className="flex items-center text-gray-400 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-md">
              <Radio className="w-3.5 h-3.5 mr-1 text-purple-400" /> Fog Gateway: ONLINE
            </span>
            <span className="flex items-center text-gray-400 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-md">
              <Cloud className="w-3.5 h-3.5 mr-1 text-blue-400" /> MQTT: CONNECTED
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Bus, Incident ID, Route..."
              className="bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-200 pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Notification Bell */}
          <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-4 z-50">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-3">Live System Alerts</h3>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 bg-gray-950/80 rounded-lg border border-gray-800/80 text-xs">
                    <div className="flex justify-between font-semibold text-gray-200">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-gray-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile with Role Pill */}
        {user && (() => {
          const roleStyles = {
            admin: { color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-600/20', label: 'Admin' },
            municipal_officer: { color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-600/20', label: 'Officer' },
            field_worker: { color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-600/20', label: 'Field Operator' },
            bus_operator: { color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-600/20', label: 'Bus Operator' },
          }[user.role] || { color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-600/20', label: user.role };

          return (
            <div className="flex items-center space-x-3 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl">
              <div className={`w-8 h-8 rounded-lg ${roleStyles.bg} border ${roleStyles.border} flex items-center justify-center ${roleStyles.color} font-bold text-xs`}>
                <User className="w-4 h-4" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-gray-200 leading-none">{user.full_name}</div>
                <div className="flex items-center space-x-1 mt-1">
                  <span className={`text-[10px] font-bold ${roleStyles.color} uppercase tracking-wider`}>
                    {roleStyles.label}
                  </span>
                  <span className="text-[10px] text-gray-500">•</span>
                  <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{user.department}</span>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/40 transition ml-1" 
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          );
        })()}
      </div>
    </header>

    {showProblemModal && (
      <ProblemStatementModal onClose={() => setShowProblemModal(false)} />
    )}
  </>
  );
};

export default Navbar;
