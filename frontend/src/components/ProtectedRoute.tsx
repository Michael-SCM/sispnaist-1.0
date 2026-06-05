import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  adminOnly?: boolean;
  authorize?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, adminOnly, authorize }) => {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) {
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

  if (authorize && user?.perfil && !authorize.includes(user.perfil)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
