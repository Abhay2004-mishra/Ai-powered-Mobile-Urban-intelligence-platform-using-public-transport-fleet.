import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Shield, 
  Building2, 
  Wrench, 
  Bus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  Filter,
  RefreshCw,
  Edit2
} from 'lucide-react';

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(true);
    try {
      await api.patch(`/api/auth/users/${userId}`, { role: newRole });
      setNotification(`User role updated to ${newRole.replace('_', ' ')}`);
      fetchUsers();
      setSelectedUser(null);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      alert('Failed to update user role');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/api/auth/users/${userId}`, { is_active: !currentStatus });
      setNotification(`User status ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchUsers();
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      alert('Failed to update user status');
    } finally {
      setUpdating(false);
    }
  };

  const roleConfig = {
    admin: { label: 'Administrator', color: 'text-blue-400', bg: 'bg-blue-950/60 border-blue-800/60', icon: Shield },
    municipal_officer: { label: 'Municipal Officer', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/60', icon: Building2 },
    field_worker: { label: 'Field Operator', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/60', icon: Wrench },
    bus_operator: { label: 'Bus Operator', color: 'text-purple-400', bg: 'bg-purple-950/60 border-purple-800/60', icon: Bus },
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    officers: users.filter(u => u.role === 'municipal_officer').length,
    workers: users.filter(u => u.role === 'field_worker').length,
    operators: users.filter(u => u.role === 'bus_operator').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/30 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Platform User Management & RBAC</h1>
              <p className="text-xs text-gray-400">Manage registered municipal personnel, roles, and system authorizations</p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center space-x-2 px-3.5 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-xs text-gray-300 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Role Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-gray-900/60 border border-gray-800 rounded-2xl">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Registered</div>
          <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Active accounts</div>
        </div>
        <div className="p-3.5 bg-blue-950/30 border border-blue-900/40 rounded-2xl">
          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Admins</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{stats.admins}</div>
          <div className="text-[10px] text-blue-400/70 mt-0.5">Platform control</div>
        </div>
        <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/40 rounded-2xl">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
            <Building2 className="w-3 h-3" />
            <span>Officers</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{stats.officers}</div>
          <div className="text-[10px] text-emerald-400/70 mt-0.5">Dispatch & Command</div>
        </div>
        <div className="p-3.5 bg-amber-950/30 border border-amber-900/40 rounded-2xl">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
            <Wrench className="w-3 h-3" />
            <span>Field Operators</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{stats.workers}</div>
          <div className="text-[10px] text-amber-400/70 mt-0.5">Rapid Response</div>
        </div>
        <div className="p-3.5 bg-purple-950/30 border border-purple-900/40 rounded-2xl col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1">
            <Bus className="w-3 h-3" />
            <span>Bus Operators</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{stats.operators}</div>
          <div className="text-[10px] text-purple-400/70 mt-0.5">Transit Fleet</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'admin', label: 'Admins' },
            { id: 'municipal_officer', label: 'Officers' },
            { id: 'field_worker', label: 'Field Operators' },
            { id: 'bus_operator', label: 'Bus Operators' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                roleFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-950 text-gray-400 hover:text-gray-200 border border-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950/80 text-gray-400 border-b border-gray-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role / Permissions</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4">Registration Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No users matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const cfg = roleConfig[u.role] || roleConfig.municipal_officer;
                  const Icon = cfg.icon;
                  const isCurrent = currentUser?.email === u.email;

                  return (
                    <tr key={u.id} className="hover:bg-gray-800/30 transition">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center space-x-2">
                              <span>{u.full_name}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-blue-600/30 text-blue-400 px-1.5 py-0.2 rounded border border-blue-500/40">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cfg.label}</span>
                        </span>
                      </td>

                      <td className="p-4 text-gray-300">
                        {u.department || 'Municipal Operations'}
                      </td>

                      <td className="p-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full text-[10px] font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-red-400 bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded-full text-[10px] font-medium">
                            <XCircle className="w-3 h-3" />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-gray-400 text-[11px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Seeded'}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                          className="px-2.5 py-1 bg-gray-950 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-xs transition inline-flex items-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Change Role</span>
                        </button>
                        
                        {!isCurrent && (
                          <button
                            onClick={() => handleStatusToggle(u.id, u.is_active)}
                            className={`px-2.5 py-1 rounded-lg text-xs border transition ${
                              u.is_active
                                ? 'bg-red-950/40 hover:bg-red-950 border-red-800 text-red-300'
                                : 'bg-emerald-950/40 hover:bg-emerald-950 border-emerald-800 text-emerald-300'
                            }`}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Role change dropdown drawer if selected */}
        {selectedUser && (
          <div className="p-4 bg-gray-950 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-300">
              Change role for <strong className="text-white">{selectedUser.full_name}</strong> ({selectedUser.email}):
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {['admin', 'municipal_officer', 'field_worker', 'bus_operator'].map((roleKey) => (
                <button
                  key={roleKey}
                  disabled={updating || selectedUser.role === roleKey}
                  onClick={() => handleRoleChange(selectedUser.id, roleKey)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                    selectedUser.role === roleKey
                      ? 'bg-blue-600 text-white border-blue-500 opacity-50 cursor-default'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border-gray-700'
                  }`}
                >
                  {roleConfig[roleKey]?.label || roleKey}
                </button>
              ))}
              <button
                onClick={() => setSelectedUser(null)}
                className="px-2.5 py-1 text-gray-500 hover:text-gray-300 text-xs ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
