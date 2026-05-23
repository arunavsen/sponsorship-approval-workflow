import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <h2 className="mb-1 mt-0 text-2xl font-bold leading-tight">{title}</h2>
        <p className="m-0 text-sm text-muted">{description}</p>
      </div>
      {action}
    </header>
  );
}
