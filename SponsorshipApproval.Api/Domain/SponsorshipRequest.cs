namespace SponsorshipApproval.Api.Domain;

public sealed class SponsorshipRequest
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid RequestorId { get; set; }
    public ApplicationUser? Requestor { get; set; }
    public string RequestorName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public Guid SponsorshipTypeId { get; set; }
    public SponsorshipType? SponsorshipType { get; set; }
    public string EventOrOrganisationName { get; set; } = string.Empty;
    public DateOnly EventDate { get; set; }
    public decimal RequestedAmount { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public string? ExpectedBusinessBenefit { get; set; }
    public string? Remarks { get; set; }
    public string? SupportingDocumentName { get; set; }
    public string? SupportingDocumentUrl { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.Draft;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public ICollection<WorkflowHistory> WorkflowHistory { get; set; } = new List<WorkflowHistory>();
}
