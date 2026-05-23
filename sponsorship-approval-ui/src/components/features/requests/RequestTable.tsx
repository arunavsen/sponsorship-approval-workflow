import type { ReactNode } from 'react';
import type { SponsorshipRequest } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils';
import StatusBadge from '../../ui/Badge';
import EmptyState from '../../ui/EmptyState';

interface RequestTableProps {
  requests: SponsorshipRequest[];
  actions: (request: SponsorshipRequest) => ReactNode;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export default function RequestTable({
  requests,
  actions,
  selectedId,
  onSelect,
}: RequestTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr>
            <th className="border-b border-surface-line px-2.5 py-[13px] text-left text-[11px] font-extrabold uppercase tracking-[0.05em] text-muted align-middle">
              Request
            </th>
            <th className="border-b border-surface-line px-2.5 py-[13px] text-left text-[11px] font-extrabold uppercase tracking-[0.05em] text-muted align-middle">
              Type
            </th>
            <th className="border-b border-surface-line px-2.5 py-[13px] text-left text-[11px] font-extrabold uppercase tracking-[0.05em] text-muted align-middle">
              Amount
            </th>
            <th className="border-b border-surface-line px-2.5 py-[13px] text-left text-[11px] font-extrabold uppercase tracking-[0.05em] text-muted align-middle">
              Status
            </th>
            <th className="border-b border-surface-line px-2.5 py-[13px] text-left text-[11px] font-extrabold uppercase tracking-[0.05em] text-muted align-middle">
              Updated
            </th>
            <th className="border-b border-surface-line px-2.5 py-[13px] text-left text-[11px] font-extrabold uppercase tracking-[0.05em] text-muted align-middle">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr
              key={request.id}
              className={`cursor-pointer transition-colors duration-150 hover:bg-[#f7fbfb] ${
                selectedId === request.id ? 'bg-[#f7fbfb]' : ''
              }`}
              onClick={() => onSelect?.(request.id)}
            >
              <td className="border-b border-surface-line px-2.5 py-[13px] align-middle">
                <strong className="block max-w-[220px] text-[13px] text-ink">
                  {request.title}
                </strong>
                <span className="block text-xs text-muted">{request.eventOrOrganisationName}</span>
              </td>
              <td className="border-b border-surface-line px-2.5 py-[13px] align-middle text-sm text-ink">
                {request.sponsorshipType.name}
              </td>
              <td className="border-b border-surface-line px-2.5 py-[13px] align-middle text-sm text-ink">
                {formatCurrency(request.requestedAmount)}
              </td>
              <td className="border-b border-surface-line px-2.5 py-[13px] align-middle">
                <StatusBadge status={request.status} />
              </td>
              <td className="border-b border-surface-line px-2.5 py-[13px] align-middle text-sm text-muted">
                {formatDate(request.updatedAt)}
              </td>
              <td
                className="border-b border-surface-line px-2.5 py-[13px] align-middle"
                onClick={(e) => e.stopPropagation()}
              >
                {actions(request)}
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan={6}>
                <EmptyState title="No requests in this queue." />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
