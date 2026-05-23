interface EmptyStateProps {
  title: string;
}

export default function EmptyState({ title }: EmptyStateProps) {
  return <div className="p-6 text-center text-muted">{title}</div>;
}
