import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RootPage() {
  const { session } = useAuth();
  return <Navigate to={session ? '/dashboard' : '/login'} replace />;
}
