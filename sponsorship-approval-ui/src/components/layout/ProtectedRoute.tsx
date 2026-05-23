import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AppShellPage from '../../pages/AppShellPage';

export default function ProtectedRoute() {
  const { session } = useAuth();
  return session ? <AppShellPage /> : <Navigate to="/login" replace />;
}
