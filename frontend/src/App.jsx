import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminGyms from './pages/AdminGyms';
import AdminUsers from './pages/AdminUsers';
import GymDashboard from './pages/GymDashboard';
import GymSetup from './pages/GymSetup';
import PlanManagement from './pages/PlanManagement';
import MemberManagement from './pages/MemberManagement';
import Attendance from './pages/Attendance';
import MemberAttendance from './pages/MemberAttendance';
import GymQR from './pages/GymQR';
import MemberDashboard from './pages/MemberDashboard';
import MemberProfile from './pages/MemberProfile';
import Support from './pages/Support';
import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'gym_owner' ? '/gym' : '/dashboard'} /> : <Login />} />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/gyms" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminGyms />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminUsers />
        </ProtectedRoute>
      } />
      <Route path="/gym" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <GymDashboard />
        </ProtectedRoute>
      } />
      <Route path="/gym-setup" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <GymSetup />
        </ProtectedRoute>
      } />
      <Route path="/gym/setup" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <GymSetup />
        </ProtectedRoute>
      } />
      <Route path="/gym/plans" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <PlanManagement />
        </ProtectedRoute>
      } />
      <Route path="/gym/members" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <MemberManagement />
        </ProtectedRoute>
      } />
      <Route path="/gym/attendance" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <Attendance />
        </ProtectedRoute>
      } />
      <Route path="/gym/qr" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <GymQR />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['member']}>
          <MemberDashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['member']}>
          <MemberProfile />
        </ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute allowedRoles={['member']}>
          <MemberAttendance />
        </ProtectedRoute>
      } />
      <Route path="/support" element={
        <ProtectedRoute>
          <Support />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <ConfigProvider 
      theme={{ 
        token: { 
          colorPrimary: '#2563eb',
          borderRadius: 8,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        components: {
          Card: {
            borderRadiusLG: 12,
            paddingLG: 24
          },
          Button: {
            borderRadius: 8,
            controlHeight: 40
          },
          Input: {
            borderRadius: 8,
            controlHeight: 40
          },
          Table: {
            borderRadiusLG: 12
          }
        }
      }}
    >
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;