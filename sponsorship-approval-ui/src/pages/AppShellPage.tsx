import AppFrame from '../components/layout/AppFrame';
import Alert from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import DashboardPage from './DashboardPage';

export default function AppShellPage() {
  const { session, error, logout, setError } = useAuth();

  if (!session) {
    return null;
  }

  return (
    <AppFrame session={session} onLogout={logout}>
      {error && <Alert message={error} />}
      <DashboardPage session={session} onError={setError} />
    </AppFrame>
  );
}
