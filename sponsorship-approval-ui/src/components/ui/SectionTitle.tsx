import type { ReactNode } from 'react';

interface SectionTitleProps {
  icon: ReactNode;
  title: string;
}

export default function SectionTitle({ icon, title }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-center gap-2.5 text-primary">
      {icon}
      <h2 className="m-0 text-[17px] font-extrabold text-ink">{title}</h2>
    </div>
  );
}
