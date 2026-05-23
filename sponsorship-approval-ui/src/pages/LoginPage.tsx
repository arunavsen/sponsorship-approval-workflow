import { useState } from 'react';
import type { FormEvent } from 'react';
import { Send, ShieldCheck } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Role } from '../types';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/ui/Alert';
import RoleCard from '../components/features/auth/RoleCard';

const accounts: Array<{ role: Role; userName: string; label: string }> = [
  { role: 'Requestor', userName: 'requestor@techzu.test', label: 'Requestor' },
  { role: 'Manager', userName: 'manager@techzu.test', label: 'Manager' },
  { role: 'FinanceAdmin', userName: 'finance@techzu.test', label: 'Finance Admin' },
  { role: 'SystemAdmin', userName: 'admin@techzu.test', label: 'System Admin' },
];

export default function LoginPage() {
  const { login, error, session, setError } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState(accounts[0].userName);
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      login(await api.login(userName, password));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-surface p-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,104,95,0.12),transparent_2px)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(0,104,95,0.08),transparent_28%)]" />
      <section className="relative z-10 w-full max-w-[480px] rounded-lg border border-surface-line bg-surface-card p-8 text-center shadow-card">
        <div className="inline-grid h-14 w-14 place-items-center rounded-lg bg-primary text-white">
          <ShieldCheck size={28} />
        </div>
        <h1 className="mb-0.5 mt-3.5 text-[28px] font-extrabold tracking-normal text-primary">
          SponsorFlow
        </h1>
        <p className="text-sm text-muted">
          Manage sponsorship requests, approvals, finance reviews, and audit history.
        </p>

        <form className="mt-6 grid gap-[14px] text-left" onSubmit={submit}>
          <span className="grid gap-[7px] text-[13px] font-bold text-muted">
            Select your role
          </span>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {accounts.map((account) => (
              <RoleCard
                key={account.userName}
                label={account.label}
                userName={account.userName}
                selected={account.userName === userName}
                onSelect={() => setUserName(account.userName)}
              />
            ))}
          </div>

          <label className="grid gap-[7px] text-[13px] font-bold text-muted">
            Password
            <input
              type="password"
              className="w-full rounded-[7px] border border-[#c7d0d2] bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <Alert message={error} />}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-transparent bg-primary px-3 py-2 text-sm font-extrabold text-white hover:bg-primary-strong disabled:opacity-60"
          >
            {loading ? 'Signing in' : 'Sign in'} <Send size={17} />
          </button>

          <p className="m-0 rounded-md border border-surface-line bg-surface-low px-[10px] py-[9px] text-xs text-muted">
            Reviewer note: use Password123! to sign in.
          </p>
        </form>
      </section>
    </main>
  );
}
