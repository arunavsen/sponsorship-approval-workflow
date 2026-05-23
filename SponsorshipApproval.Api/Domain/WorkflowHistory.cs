namespace SponsorshipApproval.Api.Domain;

public sealed class WorkflowHistory
{
    public Guid Id { get; set; }
    public Guid SponsorshipRequestId { get; set; }
    public SponsorshipRequest? SponsorshipRequest { get; set; }
    public Guid ActorId { get; set; }
    public ApplicationUser? Actor { get; set; }
    public UserRole ActorRole { get; set; }
    public WorkflowAction Action { get; set; }
    public RequestStatus FromStatus { get; set; }
    public RequestStatus ToStatus { get; set; }
    public string? Remarks { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
