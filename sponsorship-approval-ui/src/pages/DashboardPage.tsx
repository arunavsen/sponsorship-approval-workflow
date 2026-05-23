import type { LoginResponse } from '../types';
import RequestorPage from './RequestorPage';
import ApprovalPage from './ApprovalPage';
import AdminPage from './AdminPage';

interface DashboardPageProps {
  session: LoginResponse;
  onError: (message: string) => void;
}

export default function DashboardPage({ session, onError }: DashboardPageProps) {

  if (session.role === 'Requestor') return <RequestorPage session={session} onError={onError} />;
  if (session.role === 'Manager') return <ApprovalPage session={session} onError={onError} mode="manager" />;
  if (session.role === 'FinanceAdmin') return <ApprovalPage session={session} onError={onError} mode="finance" />;
  return <AdminPage session={session} />;
}
