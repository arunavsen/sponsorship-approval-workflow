import { FileClock } from 'lucide-react';
import type { WorkflowHistory } from '../../../types';
import { formatDate, roleLabel, spaceWords, formatStatus } from '../../../utils';
import EmptyState from '../../ui/EmptyState';
import SectionTitle from '../../ui/SectionTitle';

interface WorkflowTimelineProps {
  history: WorkflowHistory[];
}

export default function WorkflowTimeline({ history }: WorkflowTimelineProps) {
  return (
    <section className="rounded-lg border border-surface-line bg-surface-card p-[18px] shadow-panel">
      <SectionTitle icon={<FileClock size={20} />} title="Workflow History" />
      {history.length > 0 ? (
        <div className="grid gap-[14px]">
          {history.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[18px_1fr] gap-3 border-b border-surface-line pb-[14px]"
            >
              <span className="mt-1 h-3 w-3 rounded-full bg-primary shadow-[0_0_0_5px_#d7f6f1]" />
              <div>
                <strong className="mb-[3px] block text-sm font-bold text-ink">
                  {spaceWords(item.action)}
                </strong>
                <span className="block text-[13px] text-muted">
                  {item.actorName} ({roleLabel(item.actorRole)})
                </span>
                <span className="block text-[13px] text-muted">
                  {formatStatus(item.fromStatus)} → {formatStatus(item.toStatus)}
                </span>
                {item.remarks && (
                  <p className="m-0 text-[13px] text-muted">{item.remarks}</p>
                )}
                <span className="block text-[13px] text-muted">{formatDate(item.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Select a request to view audit history." />
      )}
    </section>
  );
}
