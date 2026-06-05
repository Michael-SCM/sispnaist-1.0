import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, adminOnly }) => {
  const { isAuthenticated, user, loading, initializeAuth } = useAuthStore();

  const [bootstrapped, setBootstrapped] = React.useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setBootstrapped(true);
    };
    init();
  }, [initializeAuth]);

  if (!bootstrapped || loading) {
    return null;
  }

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
