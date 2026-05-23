import type {
	LoginResponse,
	SponsorshipRequest,
	SponsorshipRequestInput,
	SponsorshipType,
	WorkflowHistory,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5169';

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...options.headers,
		},
	});

	if (!response.ok) {
		const problem = await response.json().catch(() => ({ message: response.statusText }));
		throw new Error(problem.message ?? response.statusText);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json();
}

export const api = {
	login: (userName: string, password: string) =>
		request<LoginResponse>('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify({ userName, password }),
		}),
	getMyRequests: (token: string) => request<SponsorshipRequest[]>('/api/requests/my', {}, token),
	createRequest: (token: string, input: SponsorshipRequestInput) =>
		request<SponsorshipRequest>('/api/requests', { method: 'POST', body: JSON.stringify(input) }, token),
	submitRequest: (token: string, id: string) =>
		request<SponsorshipRequest>(`/api/requests/${id}/submit`, { method: 'POST' }, token),
	cancelRequest: (token: string, id: string) =>
		request<SponsorshipRequest>(`/api/requests/${id}/cancel`, { method: 'POST' }, token),
	managerPending: (token: string) => request<SponsorshipRequest[]>('/api/manager/requests/pending', {}, token),
	managerApprove: (token: string, id: string, remarks: string) =>
		request<SponsorshipRequest>(`/api/manager/requests/${id}/approve`, {
			method: 'POST',
			body: JSON.stringify({ remarks }),
		}, token),
	managerReject: (token: string, id: string, remarks: string) =>
		request<SponsorshipRequest>(`/api/manager/requests/${id}/reject`, {
			method: 'POST',
			body: JSON.stringify({ remarks }),
		}, token),
	financePending: (token: string) => request<SponsorshipRequest[]>('/api/finance/requests/pending', {}, token),
	financeApprove: (token: string, id: string, remarks: string) =>
		request<SponsorshipRequest>(`/api/finance/requests/${id}/approve`, {
			method: 'POST',
			body: JSON.stringify({ remarks }),
		}, token),
	financeReject: (token: string, id: string, remarks: string) =>
		request<SponsorshipRequest>(`/api/finance/requests/${id}/reject`, {
			method: 'POST',
			body: JSON.stringify({ remarks }),
		}, token),
	adminRequests: (token: string) => request<SponsorshipRequest[]>('/api/admin/requests', {}, token),
	requestHistory: (token: string, id: string) =>
		request<WorkflowHistory[]>(`/api/admin/requests/${id}/history`, {}, token),
	sponsorshipTypes: (token: string) => request<SponsorshipType[]>('/api/sponsorship-types', {}, token),
	adminSponsorshipTypes: (token: string) =>
		request<SponsorshipType[]>('/api/admin/sponsorship-types', {}, token),
	createType: (token: string, name: string) =>
		request<SponsorshipType>('/api/admin/sponsorship-types', {
			method: 'POST',
			body: JSON.stringify({ name, isActive: true }),
		}, token),
	updateType: (token: string, type: SponsorshipType) =>
		request<SponsorshipType>(`/api/admin/sponsorship-types/${type.id}`, {
			method: 'PUT',
			body: JSON.stringify(type),
		}, token),
	apiBaseUrl: API_BASE_URL,
};
