import { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import type { SponsorshipType } from '../../../types';
import SectionTitle from '../../ui/SectionTitle';

interface SponsorshipTypePanelProps {
  types: SponsorshipType[];
  onAdd: (name: string) => void;
  onToggle: (type: SponsorshipType) => void;
}

export default function SponsorshipTypePanel({
  types,
  onAdd,
  onToggle,
}: SponsorshipTypePanelProps) {
  const [newType, setNewType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.trim()) return;
    onAdd(newType);
    setNewType('');
  };

  return (
    <section className="rounded-lg border border-surface-line bg-surface-card p-[18px] shadow-panel">
      <SectionTitle icon={<Settings size={20} />} title="Sponsorship Types" />
      <form className="flex items-stretch gap-2.5" onSubmit={handleSubmit}>
        <input
          className="w-full rounded-[7px] border border-[#c7d0d2] bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          placeholder="New type"
        />
        <button
          type="submit"
          className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-transparent bg-ink px-3 py-2 text-sm font-extrabold text-white"
        >
          <Plus size={15} /> Add
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {types.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onToggle(type)}
            className={`inline-flex cursor-pointer items-center whitespace-nowrap rounded-full border px-[9px] py-1 text-xs font-extrabold ${
              type.isActive
                ? 'border-primary bg-primary-soft text-primary-strong'
                : 'border-surface-line bg-white text-muted'
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>
    </section>
  );
}
