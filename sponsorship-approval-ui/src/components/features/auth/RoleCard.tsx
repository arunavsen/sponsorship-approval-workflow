interface RoleCardProps {
  label: string;
  userName: string;
  selected: boolean;
  onSelect: () => void;
}

export default function RoleCard({ label, userName, selected, onSelect }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid cursor-pointer gap-1 rounded-md border px-3 py-3 text-center ${
        selected
          ? 'border-primary bg-primary-soft text-primary-strong'
          : 'border-surface-line bg-white text-ink'
      }`}
    >
      <span className="font-bold">{label}</span>
      <small className="overflow-hidden text-ellipsis text-[11px] text-muted">{userName}</small>
    </button>
  );
}
