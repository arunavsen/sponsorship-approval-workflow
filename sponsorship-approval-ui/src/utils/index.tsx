import type { ReactNode } from 'react';
import {
  ClipboardCheck,
  FileText,
  History,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import type { Role, SponsorshipRequest } from '../types';

export interface NavItem {
  label: string;
  icon: ReactNode;
}

export function navItemsFor(role: Role): NavItem[] {
  if (role === 'Requestor') {
    return [
      { label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
      { label: 'Sponsorships', icon: <FileText size={17} /> },
    ];
  }
  if (role === 'SystemAdmin') {
    return [
      { label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
      { label: 'Audit Logs', icon: <History size={17} /> },
      { label: 'Settings', icon: <Settings size={17} /> },
    ];
  }
  return [
    { label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { label: 'Approvals', icon: <ClipboardCheck size={17} /> },
  ];
}

export function roleLabel(role: Role): string {
  return role.replace('FinanceAdmin', 'Finance Admin').replace('SystemAdmin', 'System Admin');
}

export function spaceWords(value: string): string {
  return value.replace(/([A-Z])/g, ' $1').trim();
}

export function formatStatus(status: SponsorshipRequest['status']): string {
  return spaceWords(status);
}

export function countByStatus(
  requests: SponsorshipRequest[],
  status: SponsorshipRequest['status'],
): string {
  return requests
    .filter((r) => r.status === status)
    .length.toString()
    .padStart(2, '0');
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export async function runAndReload(
  operation: () => Promise<SponsorshipRequest>,
  reload: () => Promise<void>,
  onError: (message: string) => void,
): Promise<void> {
  try {
    await operation();
    await reload();
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Action failed.');
  }
}
