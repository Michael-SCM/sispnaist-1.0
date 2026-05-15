import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, adminOnly }) => {
  const { isAuthenticated, user, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Garante que ao dar F5/refresh o Zustand recarregue user/token do localStorage
    if (!isAuthenticated) initializeAuth();
  }, [isAuthenticated, initializeAuth]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.perfil !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && user?.perfil !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

