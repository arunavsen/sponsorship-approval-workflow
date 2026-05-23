namespace SponsorshipApproval.Api.Domain;

public enum RequestStatus
{
    Draft = 1,
    PendingManagerApproval = 2,
    PendingFinanceReview = 3,
    Approved = 4,
    Rejected = 5,
    Cancelled = 6
}
