import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IncidentDetailsPage from './pages/IncidentDetailsPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import FleetPage from './pages/FleetPage';
import BusDetailPage from './pages/BusDetailPage';
import RoutesPage from './pages/RoutesPage';
import AIMonitoringPage from './pages/AIMonitoringPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PrivacyPage from './pages/PrivacyPage';
import SystemHealthPage from './pages/SystemHealthPage';
import UserManagementPage from './pages/UserManagementPage';
import BusDriverCockpitPage from './pages/BusDriverCockpitPage';
import WorkflowStudioPage from './pages/WorkflowStudioPage';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-gray-400 flex items-center justify-center text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>Verifying Command Center Authorization...</span>
        </div>
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 bg-gray-900/90 border border-red-800/60 rounded-3xl text-center shadow-2xl backdrop-blur-xl">
        <div className="w-14 h-14 rounded-2xl bg-red-950/70 border border-red-800/80 mx-auto flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-950/50">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-white">Access Restricted — Role Insufficient</h2>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          Your account role (<span className="text-red-400 font-bold uppercase">{user?.role}</span>) does not have authorization to view this module.
        </p>
        <div className="mt-4 p-2.5 bg-gray-950/80 rounded-xl border border-gray-800 text-[11px] text-gray-400">
          Required roles: <strong className="text-blue-300">{allowedRoles.join(' • ')}</strong>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-[#0B0F19] flex flex-col">
              <Navbar />
              <div className="flex-1 flex overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-[1920px] mx-auto w-full">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    
                    {/* Admin Only Route */}
                    <Route 
                      path="/users" 
                      element={
                        <RoleProtectedRoute allowedRoles={['admin']}>
                          <UserManagementPage />
                        </RoleProtectedRoute>
                      } 
                    />

                    {/* Bus Operator In-Cab Cockpit Route */}
                    <Route 
                      path="/cockpit" 
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'bus_operator']}>
                          <BusDriverCockpitPage />
                        </RoleProtectedRoute>
                      } 
                    />

                    {/* Incidents & Work Orders */}
                    <Route 
                      path="/incidents" 
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'municipal_officer', 'field_worker']}>
                          <IncidentDetailsPage />
                        </RoleProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/work-orders" 
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'municipal_officer', 'field_worker', 'bus_operator']}>
                          <WorkOrdersPage />
                        </RoleProtectedRoute>
                      } 
                    />

                    {/* Fleet & Routes */}
                    <Route 
                      path="/fleet" 
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'municipal_officer', 'bus_operator']}>
                          <FleetPage />
                        </RoleProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/fleet/:busCode" 
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'municipal_officer', 'bus_operator']}>
                          <BusDetailPage />
                        </RoleProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/routes" 
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'municipal_officer', 'bus_operator']}>
                          <RoutesPage />
                        </RoleProtectedRoute>
                      } 
                    />

                    {/* 3D Bus & End-to-End Workflow Studio */}
                    <Route 
                      path="/workflow" 
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'municipal_officer', 'bus_operator', 'field_worker']}>
                          <WorkflowStudioPage />
                        </RoleProtectedRoute>
                      } 
                    />

                    {/* AI & Analytics */}
                    <Route 
                      path="/ai-monitoring" 
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'municipal_officer']}>
                          <AIMonitoringPage />
                        </RoleProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/analytics" 
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'municipal_officer']}>
                          <AnalyticsPage />
                        </RoleProtectedRoute>
                      } 
                    />

                    {/* Admin Platform Maintenance */}
                    <Route 
                      path="/privacy" 
                      element={
                        <RoleProtectedRoute allowedRoles={['admin']}>
                          <PrivacyPage />
                        </RoleProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/system-health" 
                      element={
                        <RoleProtectedRoute allowedRoles={['admin']}>
                          <SystemHealthPage />
                        </RoleProtectedRoute>
                      } 
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
