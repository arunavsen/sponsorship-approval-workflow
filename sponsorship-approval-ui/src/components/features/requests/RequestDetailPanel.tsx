import { CheckCircle2, FileText, XCircle } from 'lucide-react';
import type { SponsorshipRequest } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils';
import StatusBadge from '../../ui/Badge';
import EmptyState from '../../ui/EmptyState';
import SectionTitle from '../../ui/SectionTitle';

interface RequestDetailPanelProps {
  request?: SponsorshipRequest;
  remarks: string;
  mode: 'manager' | 'finance';
  onRemarks: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}

const inputCls =
  'w-full rounded-[7px] border border-[#c7d0d2] bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 min-h-[96px] resize-y';

export default function RequestDetailPanel({
  request,
  remarks,
  mode,
  onRemarks,
  onApprove,
  onReject,
}: RequestDetailPanelProps) {
  if (!request) {
    return (
      <section className="sticky top-[84px] grid gap-4 rounded-lg border border-surface-line bg-surface-card p-[18px] shadow-panel">
        <EmptyState title="No requests need your attention." />
      </section>
    );
  }

  return (
    <section className="sticky top-[84px] grid gap-4 rounded-lg border border-surface-line bg-surface-card p-[18px] shadow-panel">
      <div className="flex items-center justify-between gap-2.5">
        <SectionTitle icon={<FileText size={20} />} title="Request Details" />
        <StatusBadge status={request.status} />
      </div>

      <dl className="m-0 grid grid-cols-2 gap-3">
        {[
          { label: 'Subject', value: request.title },
          { label: 'Amount', value: formatCurrency(request.requestedAmount) },
          { label: 'Requester', value: request.requestorName },
          { label: 'Department', value: request.department },
          { label: 'Event', value: request.eventOrOrganisationName },
          { label: 'Event date', value: formatDate(request.eventDate) },
        ].map(({ label, value }) => (
          <div key={label} className="border-b border-surface-line pb-2.5">
            <dt className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-muted">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-bold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-1">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-muted">
          Request description
        </span>
        <p className="m-0 mt-1 text-sm text-muted">{request.purpose}</p>
      </div>

      {request.expectedBusinessBenefit && (
        <div className="grid gap-1">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-muted">
            Expected business benefit
          </span>
          <p className="m-0 mt-1 text-sm text-muted">{request.expectedBusinessBenefit}</p>
        </div>
      )}

      <label className="grid gap-[7px] text-[13px] font-bold text-muted">
        {mode === 'manager' ? 'Approval remarks' : 'Finance remarks'}
        <textarea
          className={inputCls}
          value={remarks}
          onChange={(e) => onRemarks(e.target.value)}
          placeholder="Add any comments or conditions for this decision."
        />
      </label>

      <div className="flex flex-col items-stretch gap-2.5">
        <button
          type="button"
          onClick={onApprove}
          className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-transparent bg-primary px-3 py-2 text-sm font-extrabold text-white hover:bg-primary-strong"
        >
          <CheckCircle2 size={17} />
          {mode === 'manager' ? 'Approve Request' : 'Final Approve'}
        </button>
        <button
          type="button"
          onClick={onReject}
          className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-danger bg-white px-3 py-2 text-sm font-extrabold text-danger hover:bg-danger-soft"
        >
          <XCircle size={17} /> Reject Request
        </button>
      </div>
    </section>
  );
}
