import { Bell, LogOut } from 'lucide-react';
import type { LoginResponse } from '../../types';
import { roleLabel } from '../../utils';

interface TopbarProps {
  session: LoginResponse;
  onLogout: () => void;
}

export default function Topbar({ session, onLogout }: TopbarProps) {
  return (
    <header className="flex min-h-[64px] items-center justify-end gap-4 border-b border-surface-line bg-surface/95 px-7 backdrop-blur-md">
      <div className="flex items-center gap-2.5 text-sm font-semibold text-muted">
        <Bell size={17} />
        <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-extrabold text-white">
          {session.displayName.slice(0, 1)}
        </span>
        <span>{session.displayName}</span>
        <span className="inline-flex items-center whitespace-nowrap rounded-full bg-primary-soft px-[9px] py-1 text-xs font-extrabold text-primary-strong">
          {roleLabel(session.role)}
        </span>
        <button
          className="inline-flex min-h-[32px] cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-surface-line bg-white px-[9px] py-1.5 text-sm font-extrabold text-muted"
          onClick={onLogout}
          title="Sign out"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </header>
  );
}
