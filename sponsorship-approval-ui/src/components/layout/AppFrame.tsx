import type { ReactNode } from 'react';
import type { LoginResponse } from '../../types';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppFrameProps {
  session: LoginResponse;
  onLogout: () => void;
  children: ReactNode;
}

export default function AppFrame({ session, onLogout, children }: AppFrameProps) {
  return (
    <main className="grid min-h-screen bg-surface md:grid-cols-[280px_minmax(0,1fr)]">
      <Sidebar role={session.role} />
      <section className="min-w-0">
        <Topbar session={session} onLogout={onLogout} />
        <div className="p-7">{children}</div>
      </section>
    </main>
  );
}
