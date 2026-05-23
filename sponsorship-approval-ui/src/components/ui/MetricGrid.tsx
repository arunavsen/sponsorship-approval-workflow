import type { ReactNode } from 'react';

interface MetricGridProps {
  children: ReactNode;
}

export default function MetricGrid({ children }: MetricGridProps) {
  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {children}
    </section>
  );
}
