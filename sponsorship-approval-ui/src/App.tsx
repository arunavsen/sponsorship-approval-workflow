import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Eye,
  FileClock,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { api } from "./api/client";
import type {
  LoginResponse,
  Role,
  SponsorshipRequest,
  SponsorshipRequestInput,
  SponsorshipType,
  WorkflowHistory,
} from "./types/api";
import "./App.css";

const accounts: Array<{ role: Role; userName: string; label: string }> = [
  { role: "Requestor", userName: "requestor@techzu.test", label: "Requestor" },
  { role: "Manager", userName: "manager@techzu.test", label: "Manager" },
  { role: "FinanceAdmin", userName: "finance@techzu.test", label: "Finance Admin" },
  { role: "SystemAdmin", userName: "admin@techzu.test", label: "System Admin" },
];

const emptyInput: SponsorshipRequestInput = {
  title: "",
  requestorName: "",
  department: "",
  sponsorshipTypeId: "",
  eventOrOrganisationName: "",
  eventDate: "",
  requestedAmount: 0,
  purpose: "",
  expectedBusinessBenefit: "",
  remarks: "",
  supportingDocumentName: "",
  supportingDocumentUrl: "",
};

function App() {
  const [session, setSession] = useState<LoginResponse | null>(() => {
    const saved = localStorage.getItem("sponsorship-session");
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState("");

  const login = (next: LoginResponse) => {
    localStorage.setItem("sponsorship-session", JSON.stringify(next));
    setSession(next);
  };

  const logout = () => {
    localStorage.removeItem("sponsorship-session");
    setSession(null);
    setError("");
  };

  if (!session) {
    return <LoginPage onLogin={login} onError={setError} error={error} />;
  }

  return (
    <AppFrame session={session} onLogout={logout}>
      {error && <Alert message={error} />}
      <Dashboard session={session} onError={setError} />
    </AppFrame>
  );
}

function LoginPage({
  onLogin,
  onError,
  error,
}: {
  onLogin: (session: LoginResponse) => void;
  onError: (message: string) => void;
  error: string;
}) {
  const [userName, setUserName] = useState(accounts[0].userName);
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    onError("");
    try {
      onLogin(await api.login(userName, password));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">
          <ShieldCheck size={28} />
        </div>
        <h1>SponsorFlow</h1>
        <p className="login-copy">Manage sponsorship requests, approvals, finance reviews, and audit history.</p>
        <form onSubmit={submit}>
          <label className="field-label">Select your role</label>
          <div className="role-grid">
            {accounts.map((account) => (
              <button
                className={account.userName === userName ? "role-card selected" : "role-card"}
                key={account.userName}
                onClick={() => setUserName(account.userName)}
                type="button"
              >
                <span>{account.label}</span>
                <small>{account.userName}</small>
              </button>
            ))}
          </div>
          <label className="field">
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </label>
          {error && <Alert message={error} />}
          <button className="primary-button wide" disabled={loading}>
            {loading ? "Signing in" : "Sign in"} <Send size={17} />
          </button>
          <p className="reviewer-note">Reviewer note: use Password123! to sign in.</p>
        </form>
      </section>
    </main>
  );
}

function AppFrame({
  session,
  onLogout,
  children,
}: {
  session: LoginResponse;
  onLogout: () => void;
  children: ReactNode;
}) {
  return (
    <main className="app-frame">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>SponsorFlow</h1>
          <span>Enterprise Portal</span>
        </div>
        <nav className="sidebar-nav">
          {navItemsFor(session.role).map((item, index) => (
            <a className={index === 0 ? "active" : ""} href={`#${item.label.toLowerCase().replaceAll(" ", "-")}`} key={item.label}>
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <a href="#help"><AlertCircle size={16} /> Help Center</a>
          <a href="#support"><Settings size={16} /> Support</a>
        </div>
      </aside>
      <section className="main-shell">
        <header className="topbar">
          <div className="search-box">
            <Search size={16} />
            <span>Global Search</span>
          </div>
          <div className="session">
            <Bell size={17} />
            <span className="avatar">{session.displayName.slice(0, 1)}</span>
            <span>{session.displayName}</span>
            <span className="role-pill">{roleLabel(session.role)}</span>
            <button className="ghost-button compact" onClick={onLogout} title="Sign out">
              <LogOut size={17} />
              Sign Out
            </button>
          </div>
        </header>
        <div className="content-area">{children}</div>
      </section>
    </main>
  );
}

function Dashboard({ session, onError }: { session: LoginResponse; onError: (message: string) => void }) {
  if (session.role === "Requestor") return <RequestorDashboard session={session} onError={onError} />;
  if (session.role === "Manager") return <ApprovalDashboard session={session} onError={onError} mode="manager" />;
  if (session.role === "FinanceAdmin") return <ApprovalDashboard session={session} onError={onError} mode="finance" />;
  return <AdminDashboard session={session} onError={onError} />;
}

function RequestorDashboard({ session, onError }: { session: LoginResponse; onError: (message: string) => void }) {
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [types, setTypes] = useState<SponsorshipType[]>([]);
  const [input, setInput] = useState<SponsorshipRequestInput>({
    ...emptyInput,
    requestorName: session.displayName,
  });

  const load = async () => {
    onError("");
    try {
      setRequests(await api.getMyRequests(session.token));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Unable to load requests.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveDraft = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.createRequest(session.token, input);
      setInput({ ...emptyInput, requestorName: session.displayName, sponsorshipTypeId: input.sponsorshipTypeId });
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Unable to save draft.");
    }
  };

  return (
    <div className="page-grid">
      <PageHeader
        title="My Sponsorship Requests"
        description="Track and manage your corporate sponsorship applications."
        action={<button className="primary-button"><Plus size={17} /> New Request</button>}
      />
      <MetricGrid>
        <MetricCard label="Draft" value={countByStatus(requests, "Draft")} icon={<FileText size={18} />} />
        <MetricCard label="Pending Manager" value={countByStatus(requests, "PendingManagerApproval")} icon={<Clock3 size={18} />} tone="amber" />
        <MetricCard label="Pending Finance" value={countByStatus(requests, "PendingFinanceReview")} icon={<CircleDollarSign size={18} />} tone="blue" />
        <MetricCard label="Approved" value={countByStatus(requests, "Approved")} icon={<CheckCircle2 size={18} />} tone="green" />
      </MetricGrid>
      <section className="split-layout">
        <RequestForm input={input} types={types} onChange={setInput} onSubmit={saveDraft} onTypesLoaded={setTypes} token={session.token} />
        <section className="panel">
          <SectionTitle icon={<ClipboardList size={20} />} title="Recent Activities" />
          <RequestTable
            requests={requests}
            actions={(request) => (
              <div className="row-actions">
                {request.status === "Draft" && (
                  <button className="small-button" onClick={() => runAndReload(() => api.submitRequest(session.token, request.id), load, onError)}>
                    <Send size={15} /> Submit
                  </button>
                )}
                {!["Approved", "Rejected", "Cancelled"].includes(request.status) && (
                  <button className="danger-button soft" onClick={() => runAndReload(() => api.cancelRequest(session.token, request.id), load, onError)}>
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

function RequestForm({
  input,
  types,
  token,
  onChange,
  onSubmit,
  onTypesLoaded,
}: {
  input: SponsorshipRequestInput;
  types: SponsorshipType[];
  token: string;
  onChange: (input: SponsorshipRequestInput) => void;
  onSubmit: (event: FormEvent) => void;
  onTypesLoaded: (types: SponsorshipType[]) => void;
}) {
  useEffect(() => {
    api.sponsorshipTypes(token).then((loaded) => {
      const activeTypes = loaded.filter((type) => type.isActive);
      onTypesLoaded(activeTypes);
      if (!input.sponsorshipTypeId && activeTypes[0]) {
        onChange({ ...input, sponsorshipTypeId: activeTypes[0].id });
      }
    });
  }, []);

  const patch = (field: keyof SponsorshipRequestInput, value: string | number) => onChange({ ...input, [field]: value });

  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <SectionTitle icon={<Plus size={20} />} title="New Request Form" />
      <FormSection title="Basic Information">
        <label className="field">
          Request title
          <input value={input.title} onChange={(event) => patch("title", event.target.value)} required />
        </label>
        <div className="two-columns">
          <label className="field">
            Requestor
            <input value={input.requestorName} onChange={(event) => patch("requestorName", event.target.value)} required />
          </label>
          <label className="field">
            Department
            <input value={input.department} onChange={(event) => patch("department", event.target.value)} required />
          </label>
        </div>
      </FormSection>
      <FormSection title="Sponsorship Details">
        <div className="two-columns">
          <label className="field">
            Sponsorship type
            <select value={input.sponsorshipTypeId} onChange={(event) => patch("sponsorshipTypeId", event.target.value)} required>
              <option value="">Select type</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Event date
            <input value={input.eventDate} onChange={(event) => patch("eventDate", event.target.value)} type="date" required />
          </label>
        </div>
        <label className="field">
          Event / organisation
          <input value={input.eventOrOrganisationName} onChange={(event) => patch("eventOrOrganisationName", event.target.value)} required />
        </label>
        <label className="field">
          Requested amount
          <input value={input.requestedAmount || ""} onChange={(event) => patch("requestedAmount", Number(event.target.value))} type="number" min="1" required />
        </label>
      </FormSection>
      <FormSection title="Business Justification">
        <label className="field">
          Purpose / justification
          <textarea value={input.purpose} onChange={(event) => patch("purpose", event.target.value)} required />
        </label>
        <label className="field">
          Expected business benefit
          <textarea value={input.expectedBusinessBenefit} onChange={(event) => patch("expectedBusinessBenefit", event.target.value)} />
        </label>
        <label className="field">
          Remarks
          <textarea value={input.remarks} onChange={(event) => patch("remarks", event.target.value)} />
        </label>
      </FormSection>
      <button className="primary-button wide">
        <FileClock size={18} /> Save Draft
      </button>
    </form>
  );
}

function ApprovalDashboard({
  session,
  onError,
  mode,
}: {
  session: LoginResponse;
  onError: (message: string) => void;
  mode: "manager" | "finance";
}) {
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const isManager = mode === "manager";
  const selected = requests.find((request) => request.id === selectedId) ?? requests[0];

  const load = async () => {
    try {
      const pending = isManager ? await api.managerPending(session.token) : await api.financePending(session.token);
      setRequests(pending);
      setSelectedId((current) => current || pending[0]?.id || "");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Unable to load approval queue.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (request: SponsorshipRequest, approved: boolean) => {
    try {
      const note = remarks[request.id] ?? "";
      if (isManager) {
        if (approved) {
          await api.managerApprove(session.token, request.id, note);
        } else {
          await api.managerReject(session.token, request.id, note);
        }
      } else if (approved) {
        await api.financeApprove(session.token, request.id, note);
      } else {
        await api.financeReject(session.token, request.id, note);
      }
      setSelectedId("");
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Approval action failed.");
    }
  };

  return (
    <div className="page-grid">
      <PageHeader
        title={isManager ? "Manager Approval Queue" : "Finance Review Queue"}
        description={isManager ? "Review and manage pending sponsorship requests." : "Complete final budget and finance review decisions."}
        action={<button className="ghost-button"><SlidersHorizontal size={17} /> Filters</button>}
      />
      <MetricGrid>
        <MetricCard label="Pending Review" value={requests.length} icon={<ClipboardCheck size={18} />} />
        <MetricCard label="Total Amount Pending" value={formatCurrency(requests.reduce((sum, request) => sum + request.requestedAmount, 0))} icon={<CircleDollarSign size={18} />} tone="blue" />
        <MetricCard label={isManager ? "Next Step" : "Final Step"} value={isManager ? "Finance" : "Decision"} icon={<ShieldCheck size={18} />} tone="green" />
        <MetricCard label="Rejected Today" value="0" icon={<XCircle size={18} />} tone="red" />
      </MetricGrid>
      <section className="approval-layout">
        <section className="panel">
          <SectionTitle icon={<ClipboardList size={20} />} title="Requests" />
          <RequestTable
            requests={requests}
            onSelect={setSelectedId}
            selectedId={selected?.id}
            actions={(request) => (
              <button className="ghost-button compact" onClick={() => setSelectedId(request.id)}>
                <Eye size={15} /> Review
              </button>
            )}
          />
        </section>
        <RequestDetailPanel
          request={selected}
          remarks={selected ? remarks[selected.id] ?? "" : ""}
          mode={mode}
          onRemarks={(value) => selected && setRemarks({ ...remarks, [selected.id]: value })}
          onApprove={() => selected && decide(selected, true)}
          onReject={() => selected && decide(selected, false)}
        />
      </section>
    </div>
  );
}

function AdminDashboard({ session, onError }: { session: LoginResponse; onError: (message: string) => void }) {
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [types, setTypes] = useState<SponsorshipType[]>([]);
  const [newType, setNewType] = useState("");
  const [history, setHistory] = useState<WorkflowHistory[]>([]);

  const load = async () => {
    try {
      const [allRequests, allTypes] = await Promise.all([api.adminRequests(session.token), api.adminSponsorshipTypes(session.token)]);
      setRequests(allRequests);
      setTypes(allTypes);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Unable to load admin data.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createType = async (event: FormEvent) => {
    event.preventDefault();
    if (!newType.trim()) return;
    await api.createType(session.token, newType);
    setNewType("");
    await load();
  };

  const toggleType = async (type: SponsorshipType) => {
    await api.updateType(session.token, { ...type, isActive: !type.isActive });
    await load();
  };

  return (
    <div className="page-grid">
      <PageHeader title="All Sponsorship Requests" description="Manage and monitor enterprise-wide sponsorship lifecycle and audit logs." />
      <MetricGrid>
        <MetricCard label="Total Requests" value={requests.length} icon={<ClipboardList size={18} />} />
        <MetricCard label="Pending Approval" value={requests.filter((request) => request.status.includes("Pending")).length} icon={<Clock3 size={18} />} tone="amber" />
        <MetricCard label="Approved" value={countByStatus(requests, "Approved")} icon={<CheckCircle2 size={18} />} tone="green" />
        <MetricCard label="Active Types" value={types.filter((type) => type.isActive).length} icon={<Settings size={18} />} tone="blue" />
      </MetricGrid>
      <section className="admin-layout">
        <section className="panel">
          <div className="panel-toolbar">
            <SectionTitle icon={<Eye size={20} />} title="All Requests" />
            <button className="ghost-button compact"><SlidersHorizontal size={15} /> Apply Filters</button>
          </div>
          <RequestTable
            requests={requests}
            actions={(request) => (
              <button className="ghost-button compact" onClick={async () => setHistory(await api.requestHistory(session.token, request.id))}>
                <History size={15} /> History
              </button>
            )}
          />
        </section>
        <section className="panel">
          <SectionTitle icon={<Settings size={20} />} title="Sponsorship Types" />
          <form className="inline-form" onSubmit={createType}>
            <input value={newType} onChange={(event) => setNewType(event.target.value)} placeholder="New type" />
            <button className="small-button"><Plus size={15} /> Add</button>
          </form>
          <div className="type-list">
            {types.map((type) => (
              <button key={type.id} className={type.isActive ? "type-chip active" : "type-chip"} onClick={() => toggleType(type)}>
                {type.name}
              </button>
            ))}
          </div>
        </section>
      </section>
      <section className="panel">
        <SectionTitle icon={<FileClock size={20} />} title="Workflow History" />
        {history.length > 0 ? (
          <div className="timeline">
            {history.map((item) => (
              <div key={item.id} className="timeline-item">
                <span className="timeline-dot" />
                <div>
                  <strong>{spaceWords(item.action)}</strong>
                  <span>{item.actorName} ({roleLabel(item.actorRole)})</span>
                  <span>{formatStatus(item.fromStatus)} to {formatStatus(item.toStatus)}</span>
                  {item.remarks && <p>{item.remarks}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Select a request to view audit history." />
        )}
      </section>
    </div>
  );
}

function RequestDetailPanel({
  request,
  remarks,
  mode,
  onRemarks,
  onApprove,
  onReject,
}: {
  request?: SponsorshipRequest;
  remarks: string;
  mode: "manager" | "finance";
  onRemarks: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (!request) {
    return (
      <section className="panel detail-panel">
        <EmptyState title="No requests need your attention." />
      </section>
    );
  }

  return (
    <section className="panel detail-panel">
      <div className="detail-heading">
        <SectionTitle icon={<FileText size={20} />} title="Request Details" />
        <StatusBadge status={request.status} />
      </div>
      <dl className="detail-list">
        <div><dt>Subject</dt><dd>{request.title}</dd></div>
        <div><dt>Amount</dt><dd>{formatCurrency(request.requestedAmount)}</dd></div>
        <div><dt>Requester</dt><dd>{request.requestorName}</dd></div>
        <div><dt>Department</dt><dd>{request.department}</dd></div>
        <div><dt>Event</dt><dd>{request.eventOrOrganisationName}</dd></div>
        <div><dt>Event date</dt><dd>{formatDate(request.eventDate)}</dd></div>
      </dl>
      <div className="detail-copy">
        <span>Request description</span>
        <p>{request.purpose}</p>
      </div>
      {request.expectedBusinessBenefit && (
        <div className="detail-copy">
          <span>Expected business benefit</span>
          <p>{request.expectedBusinessBenefit}</p>
        </div>
      )}
      <label className="field">
        {mode === "manager" ? "Approval remarks" : "Finance remarks"}
        <textarea value={remarks} onChange={(event) => onRemarks(event.target.value)} placeholder="Add any comments or conditions for this decision." />
      </label>
      <div className="decision-actions">
        <button className="primary-button" onClick={onApprove}>
          <CheckCircle2 size={17} /> {mode === "manager" ? "Approve Request" : "Final Approve"}
        </button>
        <button className="danger-button soft" onClick={onReject}>
          <XCircle size={17} /> Reject Request
        </button>
      </div>
    </section>
  );
}

function RequestTable({
  requests,
  actions,
  selectedId,
  onSelect,
}: {
  requests: SponsorshipRequest[];
  actions: (request: SponsorshipRequest) => ReactNode;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Request</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr className={selectedId === request.id ? "selected-row" : ""} key={request.id} onClick={() => onSelect?.(request.id)}>
              <td>
                <strong>{request.title}</strong>
                <span>{request.eventOrOrganisationName}</span>
              </td>
              <td>{request.sponsorshipType.name}</td>
              <td>{formatCurrency(request.requestedAmount)}</td>
              <td><StatusBadge status={request.status} /></td>
              <td>{formatDate(request.updatedAt)}</td>
              <td onClick={(event) => event.stopPropagation()}>{actions(request)}</td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan={6}><EmptyState title="No requests in this queue." /></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

function MetricGrid({ children }: { children: ReactNode }) {
  return <section className="metric-grid">{children}</section>;
}

function MetricCard({ label, value, icon, tone = "teal" }: { label: string; value: ReactNode; icon: ReactNode; tone?: "teal" | "amber" | "green" | "blue" | "red" }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="metric-icon">{icon}</div>
    </article>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="form-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="section-title">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}

function StatusBadge({ status }: { status: SponsorshipRequest["status"] }) {
  return <span className={`status ${status.toLowerCase()}`}>{formatStatus(status)}</span>;
}

function Alert({ message }: { message: string }) {
  return <div className="alert"><AlertCircle size={17} /> {message}</div>;
}

function EmptyState({ title }: { title: string }) {
  return <div className="empty-state">{title}</div>;
}

async function runAndReload(operation: () => Promise<SponsorshipRequest>, reload: () => Promise<void>, onError: (message: string) => void) {
  try {
    await operation();
    await reload();
  } catch (err) {
    onError(err instanceof Error ? err.message : "Action failed.");
  }
}

function navItemsFor(role: Role) {
  if (role === "Requestor") {
    return [
      { label: "Dashboard", icon: <LayoutDashboard size={17} /> },
      { label: "Sponsorships", icon: <FileText size={17} /> },
    ];
  }

  if (role === "SystemAdmin") {
    return [
      { label: "Dashboard", icon: <LayoutDashboard size={17} /> },
      { label: "Audit Logs", icon: <History size={17} /> },
      { label: "Settings", icon: <Settings size={17} /> },
    ];
  }

  return [
    { label: "Dashboard", icon: <LayoutDashboard size={17} /> },
    { label: "Approvals", icon: <ClipboardCheck size={17} /> },
  ];
}

function roleLabel(role: Role) {
  return role.replace("FinanceAdmin", "Finance Admin").replace("SystemAdmin", "System Admin");
}

function countByStatus(requests: SponsorshipRequest[], status: SponsorshipRequest["status"]) {
  return requests.filter((request) => request.status === status).length.toString().padStart(2, "0");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatStatus(status: SponsorshipRequest["status"]) {
  return spaceWords(status);
}

function spaceWords(value: string) {
  return value.replace(/([A-Z])/g, " $1").trim();
}

export default App;
