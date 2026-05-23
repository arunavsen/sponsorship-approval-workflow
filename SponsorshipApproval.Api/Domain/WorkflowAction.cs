namespace SponsorshipApproval.Api.Domain;

public enum WorkflowAction
{
    Created = 1,
    Updated = 2,
    Submitted = 3,
    ManagerApproved = 4,
    ManagerRejected = 5,
    FinanceApproved = 6,
    FinanceRejected = 7,
    Cancelled = 8
}
