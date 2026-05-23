using SponsorshipApproval.Api.Domain;

namespace SponsorshipApproval.Api.Dtos;

public sealed record SponsorshipRequestUpsertDto(
    string Title,
    string RequestorName,
    string Department,
    Guid SponsorshipTypeId,
    string EventOrOrganisationName,
    DateOnly EventDate,
    decimal RequestedAmount,
    string Purpose,
    string? ExpectedBusinessBenefit,
    string? Remarks,
    string? SupportingDocumentName,
    string? SupportingDocumentUrl);

public sealed record ApprovalDecisionDto(string? Remarks);

public sealed record SponsorshipTypeDto(Guid Id, string Name, bool IsActive);

public sealed record SponsorshipTypeUpsertDto(string Name, bool IsActive);

public sealed record SponsorshipRequestDto(
    Guid Id,
    string Title,
    string RequestorName,
    string Department,
    SponsorshipTypeDto SponsorshipType,
    string EventOrOrganisationName,
    DateOnly EventDate,
    decimal RequestedAmount,
    string Purpose,
    string? ExpectedBusinessBenefit,
    string? Remarks,
    string? SupportingDocumentName,
    string? SupportingDocumentUrl,
    RequestStatus Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record WorkflowHistoryDto(
    Guid Id,
    string ActorName,
    UserRole ActorRole,
    WorkflowAction Action,
    RequestStatus FromStatus,
    RequestStatus ToStatus,
    string? Remarks,
    DateTimeOffset CreatedAt);
