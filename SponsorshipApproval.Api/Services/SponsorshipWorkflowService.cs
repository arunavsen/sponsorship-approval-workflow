using Microsoft.EntityFrameworkCore;
using SponsorshipApproval.Api.Data;
using SponsorshipApproval.Api.Domain;
using SponsorshipApproval.Api.Dtos;

namespace SponsorshipApproval.Api.Services;

public interface ISponsorshipWorkflowService
{
    Task<SponsorshipRequest> CreateDraftAsync(SponsorshipRequestUpsertDto dto);
    Task<SponsorshipRequest?> UpdateDraftAsync(Guid id, SponsorshipRequestUpsertDto dto);
    Task<SponsorshipRequest?> SubmitAsync(Guid id);
    Task<SponsorshipRequest?> CancelAsync(Guid id);
    Task<SponsorshipRequest?> ManagerApproveAsync(Guid id, string? remarks);
    Task<SponsorshipRequest?> ManagerRejectAsync(Guid id, string? remarks);
    Task<SponsorshipRequest?> FinanceApproveAsync(Guid id, string? remarks);
    Task<SponsorshipRequest?> FinanceRejectAsync(Guid id, string? remarks);
}

public sealed class SponsorshipWorkflowService(AppDbContext db, ICurrentUser currentUser) : ISponsorshipWorkflowService
{
    public async Task<SponsorshipRequest> CreateDraftAsync(SponsorshipRequestUpsertDto dto)
    {
        await EnsureActiveTypeAsync(dto.SponsorshipTypeId);

        var request = new SponsorshipRequest
        {
            Id = Guid.NewGuid(),
            RequestorId = currentUser.UserId,
            Status = RequestStatus.Draft
        };

        Apply(dto, request);
        db.SponsorshipRequests.Add(request);
        AddHistory(request, WorkflowAction.Created, RequestStatus.Draft, RequestStatus.Draft, "Draft created.");
        await db.SaveChangesAsync();

        return await FindRequestAsync(request.Id) ?? request;
    }

    public async Task<SponsorshipRequest?> UpdateDraftAsync(Guid id, SponsorshipRequestUpsertDto dto)
    {
        var request = await FindOwnedRequestAsync(id);
        if (request is null)
        {
            return null;
        }

        if (request.Status != RequestStatus.Draft)
        {
            throw new InvalidOperationException("Only draft requests can be edited.");
        }

        await EnsureActiveTypeAsync(dto.SponsorshipTypeId);
        Apply(dto, request);
        AddHistory(request, WorkflowAction.Updated, request.Status, request.Status, "Draft updated.");
        await db.SaveChangesAsync();

        return request;
    }

    public Task<SponsorshipRequest?> SubmitAsync(Guid id) =>
        TransitionOwnedAsync(id, RequestStatus.Draft, RequestStatus.PendingManagerApproval, WorkflowAction.Submitted, "Submitted for manager approval.");

    public async Task<SponsorshipRequest?> CancelAsync(Guid id)
    {
        var request = await FindOwnedRequestAsync(id);
        if (request is null)
        {
            return null;
        }

        if (request.Status is RequestStatus.Approved or RequestStatus.Rejected or RequestStatus.Cancelled)
        {
            throw new InvalidOperationException($"Request cannot be cancelled from {request.Status}.");
        }

        return await ApplyTransitionAsync(request, RequestStatus.Cancelled, WorkflowAction.Cancelled, "Cancelled by requestor.");
    }

    public Task<SponsorshipRequest?> ManagerApproveAsync(Guid id, string? remarks) =>
        TransitionAsync(id, RequestStatus.PendingManagerApproval, RequestStatus.PendingFinanceReview, WorkflowAction.ManagerApproved, remarks);

    public Task<SponsorshipRequest?> ManagerRejectAsync(Guid id, string? remarks) =>
        TransitionAsync(id, RequestStatus.PendingManagerApproval, RequestStatus.Rejected, WorkflowAction.ManagerRejected, remarks);

    public Task<SponsorshipRequest?> FinanceApproveAsync(Guid id, string? remarks) =>
        TransitionAsync(id, RequestStatus.PendingFinanceReview, RequestStatus.Approved, WorkflowAction.FinanceApproved, remarks);

    public Task<SponsorshipRequest?> FinanceRejectAsync(Guid id, string? remarks) =>
        TransitionAsync(id, RequestStatus.PendingFinanceReview, RequestStatus.Rejected, WorkflowAction.FinanceRejected, remarks);

    private async Task<SponsorshipRequest?> TransitionOwnedAsync(
        Guid id,
        RequestStatus expected,
        RequestStatus next,
        WorkflowAction action,
        string? remarks,
        bool allowAnyExceptExpected = false)
    {
        var request = await FindOwnedRequestAsync(id);
        if (request is null)
        {
            return null;
        }

        if (allowAnyExceptExpected)
        {
            if (request.Status == expected)
            {
                throw new InvalidOperationException($"Request cannot be changed from {request.Status}.");
            }
        }
        else if (request.Status != expected)
        {
            throw new InvalidOperationException($"Request must be {expected} before this action.");
        }

        return await ApplyTransitionAsync(request, next, action, remarks);
    }

    private async Task<SponsorshipRequest?> TransitionAsync(
        Guid id,
        RequestStatus expected,
        RequestStatus next,
        WorkflowAction action,
        string? remarks)
    {
        var request = await FindRequestAsync(id);
        if (request is null)
        {
            return null;
        }

        if (request.Status != expected)
        {
            throw new InvalidOperationException($"Request must be {expected} before this action.");
        }

        return await ApplyTransitionAsync(request, next, action, remarks);
    }

    private async Task<SponsorshipRequest> ApplyTransitionAsync(
        SponsorshipRequest request,
        RequestStatus next,
        WorkflowAction action,
        string? remarks)
    {
        var from = request.Status;
        request.Status = next;
        request.UpdatedAt = DateTimeOffset.UtcNow;
        AddHistory(request, action, from, next, remarks);
        await db.SaveChangesAsync();

        return request;
    }

    private void Apply(SponsorshipRequestUpsertDto dto, SponsorshipRequest request)
    {
        request.Title = Require(dto.Title, "Title");
        request.RequestorName = Require(dto.RequestorName, "Requestor name");
        request.Department = Require(dto.Department, "Department");
        request.SponsorshipTypeId = dto.SponsorshipTypeId;
        request.EventOrOrganisationName = Require(dto.EventOrOrganisationName, "Event or organisation name");
        request.EventDate = dto.EventDate;
        request.RequestedAmount = dto.RequestedAmount > 0 ? dto.RequestedAmount : throw new InvalidOperationException("Requested amount must be greater than zero.");
        request.Purpose = Require(dto.Purpose, "Purpose");
        request.ExpectedBusinessBenefit = EmptyToNull(dto.ExpectedBusinessBenefit);
        request.Remarks = EmptyToNull(dto.Remarks);
        request.SupportingDocumentName = EmptyToNull(dto.SupportingDocumentName);
        request.SupportingDocumentUrl = EmptyToNull(dto.SupportingDocumentUrl);
        request.UpdatedAt = DateTimeOffset.UtcNow;
    }

    private async Task EnsureActiveTypeAsync(Guid sponsorshipTypeId)
    {
        var exists = await db.SponsorshipTypes.AnyAsync(type => type.Id == sponsorshipTypeId && type.IsActive);
        if (!exists)
        {
            throw new InvalidOperationException("Sponsorship type is inactive or does not exist.");
        }
    }

    private Task<SponsorshipRequest?> FindOwnedRequestAsync(Guid id) =>
        db.SponsorshipRequests
            .Include(request => request.SponsorshipType)
            .SingleOrDefaultAsync(request => request.Id == id && request.RequestorId == currentUser.UserId);

    private Task<SponsorshipRequest?> FindRequestAsync(Guid id) =>
        db.SponsorshipRequests
            .Include(request => request.SponsorshipType)
            .SingleOrDefaultAsync(request => request.Id == id);

    private void AddHistory(
        SponsorshipRequest request,
        WorkflowAction action,
        RequestStatus from,
        RequestStatus to,
        string? remarks)
    {
        db.WorkflowHistories.Add(new WorkflowHistory
        {
            Id = Guid.NewGuid(),
            SponsorshipRequestId = request.Id,
            ActorId = currentUser.UserId,
            ActorRole = currentUser.Role,
            Action = action,
            FromStatus = from,
            ToStatus = to,
            Remarks = EmptyToNull(remarks)
        });
    }

    private static string Require(string value, string field) =>
        string.IsNullOrWhiteSpace(value) ? throw new InvalidOperationException($"{field} is required.") : value.Trim();

    private static string? EmptyToNull(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
