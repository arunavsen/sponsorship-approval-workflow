using SponsorshipApproval.Api.Domain;
using SponsorshipApproval.Api.Dtos;

namespace SponsorshipApproval.Api.Services;

public static class DtoMapper
{
    public static SponsorshipTypeDto ToDto(this SponsorshipType type) =>
        new(type.Id, type.Name, type.IsActive);

    public static SponsorshipRequestDto ToDto(this SponsorshipRequest request) =>
        new(
            request.Id,
            request.Title,
            request.RequestorName,
            request.Department,
            request.SponsorshipType?.ToDto() ?? new SponsorshipTypeDto(request.SponsorshipTypeId, "Unknown", false),
            request.EventOrOrganisationName,
            request.EventDate,
            request.RequestedAmount,
            request.Purpose,
            request.ExpectedBusinessBenefit,
            request.Remarks,
            request.SupportingDocumentName,
            request.SupportingDocumentUrl,
            request.Status,
            request.CreatedAt,
            request.UpdatedAt);

    public static WorkflowHistoryDto ToDto(this WorkflowHistory history) =>
        new(
            history.Id,
            history.Actor?.DisplayName ?? "Unknown user",
            history.ActorRole,
            history.Action,
            history.FromStatus,
            history.ToStatus,
            history.Remarks,
            history.CreatedAt);
}
