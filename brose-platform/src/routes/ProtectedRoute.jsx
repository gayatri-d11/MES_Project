import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedPages }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedPages && !allowedPages.some(p => user.pages?.includes(p))) {
    const pages = user.pages || [];
    if (pages.includes('dashboard')) return <Navigate to="/" replace />;
    if (pages.includes('transactions')) return <Navigate to="/transactions" replace />;
    if (pages.includes('production')) return <Navigate to="/production" replace />;
    if (pages.includes('master_data')) return <Navigate to="/master-data/screen1" replace />;
    if (pages.includes('settings')) return <Navigate to="/settings" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
