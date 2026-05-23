export type Role = "Requestor" | "Manager" | "FinanceAdmin" | "SystemAdmin";

export type RequestStatus =
  | "Draft"
  | "PendingManagerApproval"
  | "PendingFinanceReview"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export interface LoginResponse {
  token: string;
  userId: string;
  userName: string;
  displayName: string;
  role: Role;
}

export interface SponsorshipType {
  id: string;
  name: string;
  isActive: boolean;
}

export interface SponsorshipRequest {
  id: string;
  title: string;
  requestorName: string;
  department: string;
  sponsorshipType: SponsorshipType;
  eventOrOrganisationName: string;
  eventDate: string;
  requestedAmount: number;
  purpose: string;
  expectedBusinessBenefit?: string;
  remarks?: string;
  supportingDocumentName?: string;
  supportingDocumentUrl?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SponsorshipRequestInput {
  title: string;
  requestorName: string;
  department: string;
  sponsorshipTypeId: string;
  eventOrOrganisationName: string;
  eventDate: string;
  requestedAmount: number;
  purpose: string;
  expectedBusinessBenefit?: string;
  remarks?: string;
  supportingDocumentName?: string;
  supportingDocumentUrl?: string;
}

export interface WorkflowHistory {
  id: string;
  actorName: string;
  actorRole: Role;
  action: string;
  fromStatus: RequestStatus;
  toStatus: RequestStatus;
  remarks?: string;
  createdAt: string;
}
