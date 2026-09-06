import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  User, 
  Building2, 
  Wrench, 
  Bus, 
  CheckCircle2, 
  AlertCircle,
  KeyRound
} from 'lucide-react';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('officer@urbaneye.ai');
  const [loginPassword, setLoginPassword] = useState('UrbanEye@2026');
  
  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('municipal_officer');
  const [regDepartment, setRegDepartment] = useState('Municipal Infrastructure Command');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const email = loginEmail.trim();
      const normalizedEmail = email.endsWith('.comi') ? email.slice(0, -1) : email;
      await login(normalizedEmail, loginPassword);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.detail 
        || (!err.response && (err.request || err.message?.includes('Network Error'))
            ? 'Backend server is not reachable on port 8000. Please ensure the backend is running.'
            : 'Invalid email or password. Please verify your credentials.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const email = regEmail.trim();
      const normalizedEmail = email.endsWith('.comi') ? email.slice(0, -1) : email;
      await register({
        full_name: regFullName.trim(),
        email: normalizedEmail,
        password: regPassword,
        role: regRole,
        department: regDepartment.trim()
      });
      setSuccessMsg('Account registered successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 800);
    } catch (err) {
      const msg = err.response?.data?.detail 
        || (!err.response && (err.request || err.message?.includes('Network Error'))
            ? 'Backend server is not reachable on port 8000. Please ensure the backend is running.'
            : 'Registration failed. Please check your information.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: 'admin',
      title: 'System Admin',
      email: 'admin@urbaneye.ai',
      dept: 'Central IT Command',
      color: 'text-blue-400',
      border: 'border-blue-500/30 hover:border-blue-500/80',
      bg: 'bg-blue-950/30',
      icon: Shield
    },
    {
      role: 'municipal_officer',
      title: 'Municipal Officer',
      email: 'officer@urbaneye.ai',
      dept: 'Infrastructure Command',
      color: 'text-emerald-400',
      border: 'border-emerald-500/30 hover:border-emerald-500/80',
      bg: 'bg-emerald-950/30',
      icon: Building2
    },
    {
      role: 'field_worker',
      title: 'Field Operator',
      email: 'worker@urbaneye.ai',
      dept: 'Public Works Rapid Response',
      color: 'text-amber-400',
      border: 'border-amber-500/30 hover:border-amber-500/80',
      bg: 'bg-amber-950/30',
      icon: Wrench
    },
    {
      role: 'bus_operator',
      title: 'Bus Operator',
      email: 'operator@urbaneye.ai',
      dept: 'City Transport Fleet',
      color: 'text-purple-400',
      border: 'border-purple-500/30 hover:border-purple-500/80',
      bg: 'bg-purple-950/30',
      icon: Bus
    }
  ];

  const handlePreFill = (account) => {
    setActiveTab('login');
    setLoginEmail(account.email);
    setLoginPassword('UrbanEye@2026');
    setError('');
  };

  const roleOptions = [
    {
      id: 'municipal_officer',
      title: 'Municipal Officer',
      desc: 'Command dashboard, incident verification & work order dispatching',
      icon: Building2,
      color: 'text-emerald-400',
      border: 'border-emerald-500/40',
      defaultDept: 'Municipal Infrastructure Command'
    },
    {
      id: 'field_worker',
      title: 'Field Operator / Worker',
      desc: 'Assigned repair work orders, status updates & incident resolution',
      icon: Wrench,
      color: 'text-amber-400',
      border: 'border-amber-500/40',
      defaultDept: 'Public Works Rapid Response Team'
    },
    {
      id: 'bus_operator',
      title: 'Bus Fleet Operator',
      desc: 'Driver cockpit, vehicle telemetry, live route hazard alerts',
      icon: Bus,
      color: 'text-purple-400',
      border: 'border-purple-500/40',
      defaultDept: 'City Transport Fleet'
    },
    {
      id: 'admin',
      title: 'System Administrator',
      desc: 'User management, platform health, edge AI & security controls',
      icon: Shield,
      color: 'text-blue-400',
      border: 'border-blue-500/40',
      defaultDept: 'Central IT & Security Command'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-xl bg-gray-900/90 border border-gray-800 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Glow ambient decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Logo */}
        <div className="text-center mb-6 relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 mx-auto flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-blue-500/25 mb-3 border border-cyan-400/30">
            UE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">URBANEYE AI</h1>
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mt-1">
            Mobile Urban Intelligence Platform • Authentication & RBAC
          </p>
        </div>

        {/* Tabs: Sign In / Create Account */}
        <div className="flex p-1 bg-gray-950/80 border border-gray-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'login'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Create New Account</span>
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-950/90 border border-red-800/80 text-red-200 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-950/90 border border-emerald-800/80 text-emerald-200 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {activeTab === 'login' ? (
          <div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Official Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="user@urbaneye.ai"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-xs text-gray-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Password</label>
                  <span className="text-[11px] text-gray-500">Encrypted with bcrypt</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-xs text-gray-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In with Secure Credentials'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Pre-fill Section */}
            <div className="mt-7 pt-5 border-t border-gray-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Test Demo Credentials (Click to Pre-fill)
                </span>
                <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono">
                  PWD: UrbanEye@2026
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {demoAccounts.map((acc) => {
                  const Icon = acc.icon;
                  const isSelected = loginEmail === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handlePreFill(acc)}
                      className={`p-2.5 rounded-xl border text-left transition relative ${acc.bg} ${acc.border} ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${acc.color} flex items-center space-x-1.5`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{acc.title}</span>
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{acc.email}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: REGISTRATION FORM */
          <div>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    required
                    placeholder="e.g. Vikramaditya Singh"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="vikram@urbaneye.ai"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Role Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Select Your Platform Role</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roleOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = regRole === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setRegRole(opt.id);
                          setRegDepartment(opt.defaultDept);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-start space-x-2.5 ${
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500 shadow-md'
                            : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg bg-gray-900 ${opt.color} mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-200 flex items-center justify-between">
                            <span>{opt.title}</span>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{opt.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Department / Assignment</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    required
                    placeholder="e.g. Municipal Pothole Rapid Response Team"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      placeholder="Min. 6 chars"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      placeholder="Repeat password"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl shadow-emerald-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Complete Registration & Enter'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
