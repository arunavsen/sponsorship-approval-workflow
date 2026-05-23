using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SponsorshipApproval.Api.Data;
using SponsorshipApproval.Api.Domain;
using SponsorshipApproval.Api.Dtos;
using SponsorshipApproval.Api.Services;

namespace SponsorshipApproval.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/requests")]
public sealed class RequestsController(
    AppDbContext db,
    ICurrentUser currentUser,
    ISponsorshipWorkflowService workflow) : ControllerBase
{
    [HttpGet("my")]
    [Authorize(Roles = nameof(UserRole.Requestor))]
    public async Task<ActionResult<IReadOnlyList<SponsorshipRequestDto>>> MyRequests()
    {
        var requests = await db.SponsorshipRequests
            .Include(request => request.SponsorshipType)
            .Where(request => request.RequestorId == currentUser.UserId)
            .OrderByDescending(request => request.UpdatedAt)
            .ToListAsync();

        return Ok(requests.Select(request => request.ToDto()));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SponsorshipRequestDto>> Get(Guid id)
    {
        var request = await db.SponsorshipRequests
            .Include(candidate => candidate.SponsorshipType)
            .SingleOrDefaultAsync(candidate => candidate.Id == id);

        if (request is null)
        {
            return NotFound();
        }

        if (currentUser.Role == UserRole.Requestor && request.RequestorId != currentUser.UserId)
        {
            return Forbid();
        }

        return Ok(request.ToDto());
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Requestor))]
    public async Task<ActionResult<SponsorshipRequestDto>> Create(SponsorshipRequestUpsertDto dto)
    {
        try
        {
            var request = await workflow.CreateDraftAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = request.Id }, request.ToDto());
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Requestor))]
    public async Task<ActionResult<SponsorshipRequestDto>> Update(Guid id, SponsorshipRequestUpsertDto dto)
    {
        try
        {
            var request = await workflow.UpdateDraftAsync(id, dto);
            return request is null ? NotFound() : Ok(request.ToDto());
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/submit")]
    [Authorize(Roles = nameof(UserRole.Requestor))]
    public async Task<ActionResult<SponsorshipRequestDto>> Submit(Guid id)
    {
        try
        {
            var request = await workflow.SubmitAsync(id);
            return request is null ? NotFound() : Ok(request.ToDto());
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = nameof(UserRole.Requestor))]
    public async Task<ActionResult<SponsorshipRequestDto>> Cancel(Guid id)
    {
        try
        {
            var request = await workflow.CancelAsync(id);
            return request is null ? NotFound() : Ok(request.ToDto());
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
