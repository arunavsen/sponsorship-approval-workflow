import type { SponsorshipRequest } from '../../types';
import { formatStatus } from '../../utils';

interface StatusBadgeProps {
  status: SponsorshipRequest['status'];
}

const statusClasses: Record<SponsorshipRequest['status'], string> = {
  Draft: 'bg-[#edf1f2] text-[#334340]',
  PendingManagerApproval: 'bg-warning-soft text-warning',
  PendingFinanceReview: 'bg-warning-soft text-warning',
  Approved: 'bg-success-soft text-success',
  Rejected: 'bg-danger-soft text-danger',
  Cancelled: 'bg-danger-soft text-danger',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-[9px] py-1 text-xs font-extrabold ${statusClasses[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
}
