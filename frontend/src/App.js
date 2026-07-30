import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';
import FanDashboard from './pages/FanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MatchDetails from './pages/MatchDetails';
import MyTickets from './pages/MyTickets';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import MyClubs from './pages/MyClubs';
import LiveMatchDetail from './pages/LiveMatchDetail';
import AdminSignup from './pages/AdminSignup';
import './App.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/login" />;

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/signup" element={<AdminSignup />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="fan">
          <FanDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/match/:matchId" element={
        <ProtectedRoute requiredRole="fan">
          <MatchDetails />
        </ProtectedRoute>
      } />
      <Route path="/my-tickets" element={
        <ProtectedRoute requiredRole="fan">
          <MyTickets />
        </ProtectedRoute>
      } />
      <Route path="/my-clubs" element={
  <ProtectedRoute requiredRole="fan">
    <MyClubs />
  </ProtectedRoute>
} />

      <Route path="/live/:matchId" element={
        <ProtectedRoute requiredRole="fan">
          <LiveMatchDetail />
        </ProtectedRoute>
      } />

    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;