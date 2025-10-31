import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ResponsiveLayout from './components/ResponsiveLayout';
import AuthPage from './pages/AuthPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminGyms from './pages/AdminGyms';
import AdminUsers from './pages/AdminUsers';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminTrials from './pages/AdminTrials';
import SubscriptionRequired from './pages/SubscriptionRequired';
import GymDashboard from './pages/GymDashboard';
import GymSetup from './pages/GymSetup';
import GymOwnerRegister from './pages/GymOwnerRegister';

import LandingPage from './pages/LandingPage';
import PlanManagement from './pages/PlanManagement';
import MemberManagement from './pages/MemberManagement';
import Attendance from './pages/Attendance';
import MemberAttendance from './pages/MemberAttendance';
import GymQR from './pages/GymQR';
import GymSubscriptions from './pages/GymSubscriptions';
import GymSuspended from './pages/GymSuspended';
import MemberDashboard from './pages/MemberDashboard';
import MemberProfile from './pages/MemberProfile';
import UserProfile from './pages/UserProfile';
import GymDiscovery from './pages/GymDiscovery';
import GymDetail from './pages/GymDetail';
import PaymentHistory from './pages/PaymentHistory';
import Support from './pages/Support';
import NotificationManagement from './pages/NotificationManagement';
import Notifications from './pages/Notifications';
import StaffManagement from './pages/StaffManagement';
import StaffInvitations from './pages/StaffInvitations';
import PaymentSettings from './pages/PaymentSettings';
import PaymentRequests from './pages/PaymentRequests';
import PaymentPage from './pages/PaymentPage';
import GymProtectedRoute from './components/GymProtectedRoute';
import './App.css';
import './styles/mobile.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/admin-login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'gym_owner' ? '/gym' : '/dashboard'} /> : <AdminLogin />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'gym_owner' ? '/gym' : '/dashboard'} /> : <AuthPage />} />
      <Route path="/gym-login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'gym_owner' ? '/gym' : '/dashboard'} /> : <AuthPage />} />
      <Route path="/member-login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'gym_owner' ? '/gym' : '/dashboard'} /> : <AuthPage />} />
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
          <GymProtectedRoute>
            <GymDashboard />
          </GymProtectedRoute>
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
          <GymProtectedRoute>
            <PlanManagement />
          </GymProtectedRoute>
        </ProtectedRoute>
      } />
      <Route path="/gym/members" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <GymProtectedRoute>
            <MemberManagement />
          </GymProtectedRoute>
        </ProtectedRoute>
      } />
      <Route path="/gym/members/:memberId" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <GymProtectedRoute>
            <MemberProfile />
          </GymProtectedRoute>
        </ProtectedRoute>
      } />
      <Route path="/gym/attendance" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <GymProtectedRoute>
            <Attendance />
          </GymProtectedRoute>
        </ProtectedRoute>
      } />
      <Route path="/gym/qr" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <GymProtectedRoute>
            <GymQR />
          </GymProtectedRoute>
        </ProtectedRoute>
      } />
      <Route path="/gym/subscriptions" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <GymProtectedRoute>
            <GymSubscriptions />
          </GymProtectedRoute>
        </ProtectedRoute>
      } />
      <Route path="/gym/notifications" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <GymProtectedRoute>
            <NotificationManagement />
          </GymProtectedRoute>
        </ProtectedRoute>
      } />
      <Route path="/gym/staff" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <GymProtectedRoute>
            <StaffManagement />
          </GymProtectedRoute>
        </ProtectedRoute>
      } />
      <Route path="/gym/payment-settings" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <GymProtectedRoute>
            <PaymentSettings />
          </GymProtectedRoute>
        </ProtectedRoute>
      } />
      <Route path="/gym/payment-requests" element={
        <ProtectedRoute allowedRoles={['gym_owner']}>
          <GymProtectedRoute>
            <PaymentRequests />
          </GymProtectedRoute>
        </ProtectedRoute>
      } />
      <Route path="/gym-suspended" element={<GymSuspended />} />
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['member']}>
          <MemberDashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['member']}>
          <UserProfile />
        </ProtectedRoute>
      } />
      <Route path="/gyms" element={
        <ProtectedRoute allowedRoles={['member']}>
          <GymDiscovery />
        </ProtectedRoute>
      } />
      <Route path="/gym/:slug" element={
        <ProtectedRoute allowedRoles={['member']}>
          <GymDetail />
        </ProtectedRoute>
      } />
      <Route path="/payment/:gymId/:planId" element={
        <ProtectedRoute allowedRoles={['member']}>
          <PaymentPage />
        </ProtectedRoute>
      } />
      <Route path="/memberships" element={
        <ProtectedRoute allowedRoles={['member']}>
          <MemberDashboard />
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute allowedRoles={['member']}>
          <PaymentHistory />
        </ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute allowedRoles={['member']}>
          <MemberAttendance />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute allowedRoles={['member']}>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/staff-invitations" element={
        <ProtectedRoute allowedRoles={['member']}>
          <StaffInvitations />
        </ProtectedRoute>
      } />
      <Route path="/support" element={
        <ProtectedRoute>
          <Support />
        </ProtectedRoute>
      } />
      <Route path="/gym-owner-register" element={<GymOwnerRegister />} />
      <Route path="/subscription-required" element={<SubscriptionRequired />} />
      <Route path="/admin/subscriptions" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminSubscriptions />
        </ProtectedRoute>
      } />
      <Route path="/admin/trials" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminTrials />
        </ProtectedRoute>
      } />
      <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'gym_owner' ? '/gym' : '/dashboard'} /> : <AuthPage />} />
    </Routes>
  );
};

function App() {
  return (
    <ConfigProvider 
      theme={{ 
        token: { 
          colorPrimary: '#6366f1',
          borderRadius: 12,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          colorBgContainer: '#ffffff',
          colorBgElevated: '#ffffff',
          colorBorder: '#e2e8f0',
          colorText: '#0f172a',
          colorTextSecondary: '#475569',
          fontSize: 16,
          controlHeight: 44,
          borderRadiusLG: 16,
          borderRadiusSM: 8
        },
        components: {
          Card: {
            borderRadiusLG: 16,
            paddingLG: 24,
            boxShadowTertiary: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)'
          },
          Button: {
            borderRadius: 12,
            controlHeight: 44,
            fontWeight: 500,
            primaryShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
          },
          Input: {
            borderRadius: 12,
            controlHeight: 44,
            paddingInline: 16,
            fontSize: 16
          },
          Select: {
            borderRadius: 12,
            controlHeight: 44
          },
          Table: {
            borderRadiusLG: 16
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: '#6366f1',
            itemSelectedColor: '#ffffff',
            itemHoverBg: '#f1f5f9',
            borderRadius: 12
          },
          Modal: {
            borderRadiusLG: 16
          },
          Drawer: {
            borderRadiusLG: 16
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