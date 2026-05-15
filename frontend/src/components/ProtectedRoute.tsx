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

  const [bootstrapped, setBootstrapped] = React.useState(false);

  useEffect(() => {
    // Ao recarregar, initializeAuth() precisa rodar antes de decidir pelo redirect.
    initializeAuth();
    setBootstrapped(true);
  }, [initializeAuth]);

  if (!bootstrapped || !isAuthenticated) {
    // Evita redirect imediato no primeiro render após refresh.
    return null;
  }


  if (adminOnly && user?.perfil !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && user?.perfil !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

