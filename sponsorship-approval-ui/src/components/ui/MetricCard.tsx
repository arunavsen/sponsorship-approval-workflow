import type { ReactNode } from 'react';

type Tone = 'teal' | 'amber' | 'green' | 'blue' | 'red';

interface MetricCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: Tone;
}

const iconToneClasses: Record<Tone, string> = {
  teal: 'bg-primary-soft text-primary',
  amber: 'bg-warning-soft text-warning',
  green: 'bg-success-soft text-success',
  blue: 'bg-brand-blue-soft text-brand-blue',
  red: 'bg-danger-soft text-danger',
};

export default function MetricCard({ label, value, icon, tone = 'teal' }: MetricCardProps) {
  return (
    <article className="flex min-h-[112px] items-center justify-between rounded-lg border border-surface-line bg-surface-card p-[18px] shadow-panel">
      <div>
        <span className="mb-2.5 block text-xs font-bold uppercase tracking-wide text-muted">
          {label}
        </span>
        <strong className="text-[28px] leading-none text-ink">{value}</strong>
      </div>
      <div className={`grid h-[34px] w-[34px] place-items-center rounded-lg ${iconToneClasses[tone]}`}>
        {icon}
      </div>
    </article>
  );
}
