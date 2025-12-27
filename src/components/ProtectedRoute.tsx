import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

const token = localStorage.getItem('tracebloom_token');
fetch('/api/protected', {
  headers: { Authorization: `Bearer ${token}` }
});

export const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
};
