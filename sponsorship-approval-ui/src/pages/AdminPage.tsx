import { CheckCircle2, ClipboardList, Clock3, Eye, History, Settings } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import type { LoginResponse } from '../types';
import { countByStatus } from '../utils';
import PageHeader from '../components/ui/PageHeader';
import MetricGrid from '../components/ui/MetricGrid';
import MetricCard from '../components/ui/MetricCard';
import SectionTitle from '../components/ui/SectionTitle';
import RequestTable from '../components/features/requests/RequestTable';
import SponsorshipTypePanel from '../components/features/admin/SponsorshipTypePanel';
import WorkflowTimeline from '../components/features/admin/WorkflowTimeline';

interface AdminPageProps {
  session: LoginResponse;
}

export default function AdminPage({ session }: AdminPageProps) {

  const { requests, types, history, loadHistory, createType, toggleType } = useAdminData(
    session.token,
  );

  return (
    <div className="grid gap-5">
      <PageHeader
        title="All Sponsorship Requests"
        description="Manage and monitor enterprise-wide sponsorship lifecycle and audit logs."
      />

      <MetricGrid>
        <MetricCard label="Total Requests" value={requests.length} icon={<ClipboardList size={18} />} />
        <MetricCard
          label="Pending Approval"
          value={requests.filter((r) => r.status.includes('Pending')).length}
          icon={<Clock3 size={18} />}
          tone="amber"
        />
        <MetricCard label="Approved" value={countByStatus(requests, 'Approved')} icon={<CheckCircle2 size={18} />} tone="green" />
        <MetricCard
          label="Active Types"
          value={types.filter((t) => t.isActive).length}
          icon={<Settings size={18} />}
          tone="blue"
        />
      </MetricGrid>

      <section
        className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]"
      >
        <section className="rounded-lg border border-surface-line bg-surface-card p-[18px] shadow-panel">
          <SectionTitle icon={<Eye size={20} />} title="All Requests" />
          <RequestTable
            requests={requests}
            actions={(request) => (
              <button
                className="inline-flex min-h-[32px] cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-surface-line bg-white px-[9px] py-1.5 text-sm font-extrabold text-muted"
                onClick={() => loadHistory(request.id)}
              >
                <History size={15} /> History
              </button>
            )}
          />
        </section>

        <SponsorshipTypePanel
          types={types}
          onAdd={createType}
          onToggle={toggleType}
        />
      </section>

      <WorkflowTimeline history={history} />
    </div>
  );
}
