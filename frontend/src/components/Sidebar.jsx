import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  ClipboardList, 
  Bus, 
  Route, 
  Cpu, 
  BarChart3, 
  ShieldCheck, 
  Activity,
  Users,
  Building2,
  Wrench,
  Shield,
  Zap,
  Gauge,
  Box
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'municipal_officer';

  // Navigation catalog with RBAC permissions
  const allNavItems = [
    { 
      to: role === 'bus_operator' ? '/cockpit' : '/', 
      label: role === 'bus_operator' ? 'Driver In-Cab HUD' : (role === 'field_worker' ? 'Field Work Map' : 'Live Command Map'), 
      icon: role === 'bus_operator' ? Gauge : LayoutDashboard, 
      roles: ['admin', 'municipal_officer', 'field_worker', 'bus_operator'],
      highlight: role === 'bus_operator'
    },
    { 
      to: '/cockpit', 
      label: 'Driver Cockpit Radar', 
      icon: Gauge, 
      roles: ['admin'],
      badge: 'Driver View'
    },
    { 
      to: '/workflow', 
      label: '3D Bus & Workflow', 
      icon: Box, 
      roles: ['admin', 'municipal_officer', 'field_worker', 'bus_operator'],
      badge: '3D Studio'
    },
    { 
      to: '/users', 
      label: 'User Management', 
      icon: Users, 
      roles: ['admin'],
      badge: 'Admin'
    },
    { 
      to: '/work-orders', 
      label: role === 'field_worker' ? 'My Assigned Orders' : 'Work Orders & Dispatch', 
      icon: ClipboardList, 
      roles: ['admin', 'municipal_officer', 'field_worker', 'bus_operator'],
      highlight: role === 'field_worker'
    },
    { 
      to: '/incidents', 
      label: 'Incidents Feed', 
      icon: AlertTriangle, 
      roles: ['admin', 'municipal_officer', 'field_worker', 'bus_operator'] 
    },
    { 
      to: '/fleet', 
      label: role === 'bus_operator' ? 'Bus Cockpit & Fleet' : 'Bus Fleet', 
      icon: Bus, 
      roles: ['admin', 'municipal_officer', 'bus_operator'],
      highlight: role === 'bus_operator'
    },
    { 
      to: '/routes', 
      label: 'Route Coverage', 
      icon: Route, 
      roles: ['admin', 'municipal_officer', 'bus_operator'] 
    },
    { 
      to: '/ai-monitoring', 
      label: 'AI Model Telemetry', 
      icon: Cpu, 
      roles: ['admin', 'municipal_officer'] 
    },
    { 
      to: '/analytics', 
      label: 'SIH Analytics', 
      icon: BarChart3, 
      roles: ['admin', 'municipal_officer'] 
    },
    { 
      to: '/privacy', 
      label: 'Privacy & Security', 
      icon: ShieldCheck, 
      roles: ['admin'] 
    },
    { 
      to: '/system-health', 
      label: 'System Health', 
      icon: Activity, 
      roles: ['admin'] 
    },
  ];

  const visibleLinks = allNavItems.filter((item) => item.roles.includes(role));

  const roleMeta = {
    admin: { name: 'Administrator', icon: Shield, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-950/40' },
    municipal_officer: { name: 'Municipal Officer', icon: Building2, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-950/40' },
    field_worker: { name: 'Field Operator', icon: Wrench, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-950/40' },
    bus_operator: { name: 'Bus Operator', icon: Bus, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-950/40' },
  }[role] || { name: 'Personnel', icon: Shield, color: 'text-gray-400', border: 'border-gray-800', bg: 'bg-gray-900' };

  const RoleIcon = roleMeta.icon;

  return (
    <aside className="w-64 bg-[#0B101D] border-r border-gray-800/80 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="py-4 px-3 space-y-1">
        {/* Navigation Category Header */}
        <div className="px-3 pb-3 mb-2 border-b border-gray-800/60 flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role Navigation</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleMeta.bg} ${roleMeta.color} ${roleMeta.border}`}>
            {roleMeta.name}
          </span>
        </div>

        {/* Dynamic Navigation Links based on user role */}
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                } ${link.highlight ? 'ring-1 ring-amber-500/30' : ''}`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="text-[9px] bg-blue-600/40 text-blue-300 font-bold px-1.5 py-0.2 rounded border border-blue-500/30">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Role Profile Info Card in Footer */}
      <div className="p-3 m-3 space-y-2">
        <div className={`p-3 rounded-xl border ${roleMeta.bg} ${roleMeta.border}`}>
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg bg-gray-950 ${roleMeta.color}`}>
              <RoleIcon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user?.full_name || 'Authenticated User'}</div>
              <div className="text-[10px] text-gray-400 truncate">{user?.department || 'Municipal Command'}</div>
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-gradient-to-br from-blue-950/40 to-indigo-950/40 rounded-xl border border-blue-800/20 flex items-center space-x-2 text-[11px] text-gray-400">
          <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>RBAC Enabled & Protected</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
