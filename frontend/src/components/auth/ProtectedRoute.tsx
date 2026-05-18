import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

interface Props {
  children: JSX.Element;
  role?: 'admin' | 'agent' | 'customer';
}

const ProtectedRoute = ({ children, role }: Props): JSX.Element => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role) {
    const allowed = role === 'admin' ? user?.role === 'admin' : role === 'agent' ? user?.role === 'agent' || user?.role === 'admin' : true;
    if (!allowed) return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
