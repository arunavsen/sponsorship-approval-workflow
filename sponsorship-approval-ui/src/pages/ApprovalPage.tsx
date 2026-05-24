import { CircleDollarSign, ClipboardCheck, ClipboardList, Eye, ShieldCheck } from 'lucide-react';
import { useApprovalQueue } from '../hooks/useApprovalQueue';
import type { LoginResponse } from '../types';
import { formatCurrency } from '../utils';
import PageHeader from '../components/ui/PageHeader';
import MetricGrid from '../components/ui/MetricGrid';
import MetricCard from '../components/ui/MetricCard';
import SectionTitle from '../components/ui/SectionTitle';
import RequestTable from '../components/features/requests/RequestTable';
import RequestDetailPanel from '../components/features/requests/RequestDetailPanel';

interface ApprovalPageProps {
  session: LoginResponse;
  onError: (message: string) => void;
  mode: 'manager' | 'finance';
}

export default function ApprovalPage({ session, onError, mode }: ApprovalPageProps) {
  const isManager = mode === 'manager';
  const { requests, selected, setSelectedId, remarks, setRemark, decide } =
    useApprovalQueue(session.token, mode);

  return (
    <div className="grid gap-5">
      <PageHeader
        title={isManager ? 'Manager Approval Queue' : 'Finance Review Queue'}
        description={
          isManager
            ? 'Review and manage pending sponsorship requests.'
            : 'Complete final budget and finance review decisions.'
        }
      />

      <MetricGrid>
        <MetricCard label="Pending Review" value={requests.length} icon={<ClipboardCheck size={18} />} />
        <MetricCard
          label="Total Amount Pending"
          value={formatCurrency(requests.reduce((sum, r) => sum + r.requestedAmount, 0))}
          icon={<CircleDollarSign size={18} />}
          tone="blue"
        />
        <MetricCard
          label={isManager ? 'Next Step' : 'Final Step'}
          value={isManager ? 'Finance' : 'Decision'}
          icon={<ShieldCheck size={18} />}
          tone="green"
        />
      </MetricGrid>

      <section
        className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]"
      >
        <section className="rounded-lg border border-surface-line bg-surface-card p-[18px] shadow-panel">
          <SectionTitle icon={<ClipboardList size={20} />} title="Requests" />
          <RequestTable
            requests={requests}
            onSelect={setSelectedId}
            selectedId={selected?.id}
            actions={(request) => (
              <button
                className="inline-flex min-h-[32px] cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-surface-line bg-white px-[9px] py-1.5 text-sm font-extrabold text-muted"
                onClick={() => setSelectedId(request.id)}
              >
                <Eye size={15} /> Review
              </button>
            )}
          />
        </section>

        <RequestDetailPanel
          request={selected}
          remarks={selected ? (remarks[selected.id] ?? '') : ''}
          mode={mode}
          onRemarks={(value) => selected && setRemark(selected.id, value)}
          onApprove={() => selected && decide(selected, true, onError)}
          onReject={() => selected && decide(selected, false, onError)}
        />
      </section>
    </div>
  );
}
