import type { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="grid gap-3">
      <h3 className="m-0 border-b border-surface-line pb-2 text-xs font-extrabold uppercase tracking-[0.04em] text-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}
