import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Eye,
  FileClock,
  LogOut,
  Plus,
  Send,
  Settings,
  ShieldCheck,
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Sponsorship Approval</p>
          <h1>Workflow Console</h1>
        </div>
        {session && (
          <div className="session">
            <span>{session.displayName}</span>
            <span className="role-pill">{roleLabel(session.role)}</span>
            <button className="icon-button" onClick={logout} title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </header>

      {error && <div className="alert">{error}</div>}
      {!session ? <LoginPanel onLogin={login} onError={setError} /> : <Dashboard session={session} onError={setError} />}
    </main>
  );
}

function LoginPanel({
  onLogin,
  onError,
}: {
  onLogin: (session: LoginResponse) => void;
  onError: (message: string) => void;
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
    <section className="login-layout">
      <form className="panel login-panel" onSubmit={submit}>
        <ShieldCheck size={28} />
        <h2>Sign in</h2>
        <label>
          Account
          <select value={userName} onChange={(event) => setUserName(event.target.value)}>
            {accounts.map((account) => (
              <option key={account.userName} value={account.userName}>
                {account.label} - {account.userName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        </label>
        <button className="primary-button" disabled={loading}>
          <Send size={18} />
          {loading ? "Signing in" : "Sign in"}
        </button>
      </form>
      <aside className="panel testing-notes">
        <h2>Reviewer endpoints</h2>
        <p>API base: {api.apiBaseUrl}</p>
        <p>Swagger: {api.apiBaseUrl}/swagger</p>
        <p>All seeded users use Password123!</p>
      </aside>
    </section>
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
      const myRequests = await api.getMyRequests(session.token);
      setRequests(myRequests);
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
    <div className="workspace">
      <RequestForm input={input} types={types} onChange={setInput} onSubmit={saveDraft} onTypesLoaded={setTypes} token={session.token} />
      <section className="panel span-2">
        <SectionTitle icon={<ClipboardList size={20} />} title="My Requests" />
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
                <button className="danger-button" onClick={() => runAndReload(() => api.cancelRequest(session.token, request.id), load, onError)}>
                  <XCircle size={15} /> Cancel
                </button>
              )}
            </div>
          )}
        />
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
    <form className="panel request-form" onSubmit={onSubmit}>
      <SectionTitle icon={<Plus size={20} />} title="New Sponsorship Request" />
      <label>
        Request title
        <input value={input.title} onChange={(event) => patch("title", event.target.value)} required />
      </label>
      <div className="two-columns">
        <label>
          Requestor
          <input value={input.requestorName} onChange={(event) => patch("requestorName", event.target.value)} required />
        </label>
        <label>
          Department
          <input value={input.department} onChange={(event) => patch("department", event.target.value)} required />
        </label>
      </div>
      <div className="two-columns">
        <label>
          Sponsorship type
          <select value={input.sponsorshipTypeId} onChange={(event) => patch("sponsorshipTypeId", event.target.value)} required>
            <option value="">Select type</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </label>
        <label>
          Event date
          <input value={input.eventDate} onChange={(event) => patch("eventDate", event.target.value)} type="date" required />
        </label>
      </div>
      <label>
        Event / organisation
        <input value={input.eventOrOrganisationName} onChange={(event) => patch("eventOrOrganisationName", event.target.value)} required />
      </label>
      <label>
        Requested amount
        <input value={input.requestedAmount || ""} onChange={(event) => patch("requestedAmount", Number(event.target.value))} type="number" min="1" required />
      </label>
      <label>
        Purpose / justification
        <textarea value={input.purpose} onChange={(event) => patch("purpose", event.target.value)} required />
      </label>
      <label>
        Expected business benefit
        <textarea value={input.expectedBusinessBenefit} onChange={(event) => patch("expectedBusinessBenefit", event.target.value)} />
      </label>
      <label>
        Remarks
        <textarea value={input.remarks} onChange={(event) => patch("remarks", event.target.value)} />
      </label>
      <button className="primary-button">
        <FileClock size={18} /> Save draft
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
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const isManager = mode === "manager";

  const load = async () => {
    try {
      setRequests(isManager ? await api.managerPending(session.token) : await api.financePending(session.token));
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
      } else {
        if (approved) {
          await api.financeApprove(session.token, request.id, note);
        } else {
          await api.financeReject(session.token, request.id, note);
        }
      }
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Approval action failed.");
    }
  };

  return (
    <section className="panel">
      <SectionTitle icon={isManager ? <ShieldCheck size={20} /> : <CircleDollarSign size={20} />} title={isManager ? "Manager Approval Queue" : "Finance Review Queue"} />
      <RequestTable
        requests={requests}
        actions={(request) => (
          <div className="approval-actions">
            <input value={remarks[request.id] ?? ""} onChange={(event) => setRemarks({ ...remarks, [request.id]: event.target.value })} placeholder="Approval remarks" />
            <button className="small-button" onClick={() => decide(request, true)}>
              <CheckCircle2 size={15} /> Approve
            </button>
            <button className="danger-button" onClick={() => decide(request, false)}>
              <XCircle size={15} /> Reject
            </button>
          </div>
        )}
      />
    </section>
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
    <div className="workspace">
      <section className="panel span-2">
        <SectionTitle icon={<Eye size={20} />} title="All Requests" />
        <RequestTable
          requests={requests}
          actions={(request) => (
            <button className="small-button" onClick={async () => setHistory(await api.requestHistory(session.token, request.id))}>
              <Eye size={15} /> History
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
      {history.length > 0 && (
        <section className="panel span-3">
          <SectionTitle icon={<FileClock size={20} />} title="Workflow History" />
          <div className="timeline">
            {history.map((item) => (
              <div key={item.id} className="timeline-item">
                <strong>{item.action}</strong>
                <span>{item.actorName} ({roleLabel(item.actorRole)})</span>
                <span>{item.fromStatus} to {item.toStatus}</span>
                {item.remarks && <p>{item.remarks}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RequestTable({
  requests,
  actions,
}: {
  requests: SponsorshipRequest[];
  actions: (request: SponsorshipRequest) => ReactNode;
}) {
  const total = useMemo(() => requests.reduce((sum, request) => sum + request.requestedAmount, 0), [requests]);

  return (
    <>
      <div className="summary-strip">
        <span>{requests.length} requests</span>
        <span>${total.toLocaleString()}</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Event date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>
                  <strong>{request.title}</strong>
                  <span>{request.eventOrOrganisationName}</span>
                </td>
                <td>{request.sponsorshipType.name}</td>
                <td><StatusBadge status={request.status} /></td>
                <td>${request.requestedAmount.toLocaleString()}</td>
                <td>{new Date(request.eventDate).toLocaleDateString()}</td>
                <td>{actions(request)}</td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">No requests in this queue.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

async function runAndReload(operation: () => Promise<SponsorshipRequest>, reload: () => Promise<void>, onError: (message: string) => void) {
  try {
    await operation();
    await reload();
  } catch (err) {
    onError(err instanceof Error ? err.message : "Action failed.");
  }
}

function StatusBadge({ status }: { status: SponsorshipRequest["status"] }) {
  return <span className={`status ${status.toLowerCase()}`}>{status.replace(/([A-Z])/g, " $1").trim()}</span>;
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="section-title">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}

function roleLabel(role: Role) {
  return role.replace("FinanceAdmin", "Finance Admin").replace("SystemAdmin", "System Admin");
}

export default App;
