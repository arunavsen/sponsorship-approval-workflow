using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SponsorshipApproval.Api.Data;
using SponsorshipApproval.Api.Domain;
using SponsorshipApproval.Api.Dtos;
using SponsorshipApproval.Api.Services;

namespace SponsorshipApproval.Api.Controllers;

[ApiController]
[Authorize(Roles = nameof(UserRole.FinanceAdmin))]
[Route("api/finance/requests")]
public sealed class FinanceController(AppDbContext db, ISponsorshipWorkflowService workflow) : ControllerBase
{
    [HttpGet("pending")]
    public async Task<ActionResult<IReadOnlyList<SponsorshipRequestDto>>> Pending()
    {
        var requests = await db.SponsorshipRequests
            .Include(request => request.SponsorshipType)
            .Where(request => request.Status == RequestStatus.PendingFinanceReview)
            .OrderBy(request => request.CreatedAt)
            .ToListAsync();

        return Ok(requests.Select(request => request.ToDto()));
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<ActionResult<SponsorshipRequestDto>> Approve(Guid id, ApprovalDecisionDto dto) =>
        await Run(() => workflow.FinanceApproveAsync(id, dto.Remarks));

    [HttpPost("{id:guid}/reject")]
    public async Task<ActionResult<SponsorshipRequestDto>> Reject(Guid id, ApprovalDecisionDto dto) =>
        await Run(() => workflow.FinanceRejectAsync(id, dto.Remarks));

    private async Task<ActionResult<SponsorshipRequestDto>> Run(Func<Task<SponsorshipRequest?>> operation)
    {
        try
        {
            var request = await operation();
            return request is null ? NotFound() : Ok(request.ToDto());
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
