import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import './App.css';

// Helper: check if logged in
const isLoggedIn = () => !!localStorage.getItem('token');
const getRole = () => localStorage.getItem('role');

// Protected route — redirects to login if not logged in
const ProtectedRoute = ({ children, role }) => {
  if (!isLoggedIn()) return <Navigate to="/login" />;
  if (role && getRole() !== role) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>
        } />
        <Route path="/owner" element={
          <ProtectedRoute role="store_owner"><OwnerDashboard /></ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;