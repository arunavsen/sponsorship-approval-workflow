import { CheckCircle2, CircleDollarSign, Clock3, ClipboardList, FileText, Send, XCircle } from 'lucide-react';
import { useRequests } from '../hooks/useRequests';
import { api } from '../services/api';
import type { LoginResponse } from '../types';
import { countByStatus, runAndReload } from '../utils';
import PageHeader from '../components/ui/PageHeader';
import MetricGrid from '../components/ui/MetricGrid';
import MetricCard from '../components/ui/MetricCard';
import SectionTitle from '../components/ui/SectionTitle';
import RequestForm from '../components/features/requests/RequestForm';
import RequestTable from '../components/features/requests/RequestTable';

interface RequestorPageProps {
  session: LoginResponse;
  onError: (message: string) => void;
}

export default function RequestorPage({ session, onError }: RequestorPageProps) {
  const { requests, types, input, setInput, load, saveDraft } = useRequests(
    session.token,
    session.displayName,
  );

  return (
    <div className="grid gap-5">
      <PageHeader
        title="My Sponsorship Requests"
        description="Track and manage your corporate sponsorship applications."
      />

      <MetricGrid>
        <MetricCard label="Draft" value={countByStatus(requests, 'Draft')} icon={<FileText size={18} />} />
        <MetricCard label="Pending Manager" value={countByStatus(requests, 'PendingManagerApproval')} icon={<Clock3 size={18} />} tone="amber" />
        <MetricCard label="Pending Finance" value={countByStatus(requests, 'PendingFinanceReview')} icon={<CircleDollarSign size={18} />} tone="blue" />
        <MetricCard label="Approved" value={countByStatus(requests, 'Approved')} icon={<CheckCircle2 size={18} />} tone="green" />
      </MetricGrid>

      <section className="grid gap-5">
        <RequestForm
          input={input}
          types={types}
          onChange={setInput}
          onSubmit={(e) => saveDraft(e, onError)}
        />
        <section className="rounded-lg border border-surface-line bg-surface-card p-[18px] shadow-panel">
          <SectionTitle icon={<ClipboardList size={20} />} title="Recent Activities" />
          <RequestTable
            requests={requests}
            actions={(request) => (
              <div className="flex items-center gap-2">
                {request.status === 'Draft' && (
                  <button
                    className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-transparent bg-ink px-3 py-2 text-sm font-extrabold text-white"
                    onClick={() =>
                      runAndReload(
                        () => api.submitRequest(session.token, request.id),
                        load,
                        onError,
                      )
                    }
                  >
                    <Send size={15} /> Submit
                  </button>
                )}
                {!['Approved', 'Rejected', 'Cancelled'].includes(request.status) && (
                  <button
                    className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-danger bg-white px-3 py-2 text-sm font-extrabold text-danger hover:bg-danger-soft"
                    onClick={() =>
                      runAndReload(
                        () => api.cancelRequest(session.token, request.id),
                        load,
                        onError,
                      )
                    }
                  >
                    <XCircle size={15} /> Cancel
                  </button>
                )}
              </div>
            )}
          />
        </section>
      </section>
    </div>
  );
}
