using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SponsorshipApproval.Api.Data;
using SponsorshipApproval.Api.Domain;
using SponsorshipApproval.Api.Dtos;
using SponsorshipApproval.Api.Services;

namespace SponsorshipApproval.Api.Controllers;

[ApiController]
[Authorize(Roles = nameof(UserRole.SystemAdmin))]
[Route("api/admin")]
public sealed class AdminController(AppDbContext db) : ControllerBase
{
    [HttpGet("requests")]
    public async Task<ActionResult<IReadOnlyList<SponsorshipRequestDto>>> Requests()
    {
        var requests = await db.SponsorshipRequests
            .Include(request => request.SponsorshipType)
            .OrderByDescending(request => request.UpdatedAt)
            .ToListAsync();

        return Ok(requests.Select(request => request.ToDto()));
    }

    [HttpGet("requests/{id:guid}/history")]
    public async Task<ActionResult<IReadOnlyList<WorkflowHistoryDto>>> History(Guid id)
    {
        var exists = await db.SponsorshipRequests.AnyAsync(request => request.Id == id);
        if (!exists)
        {
            return NotFound();
        }

        var history = await db.WorkflowHistories
            .Include(item => item.Actor)
            .Where(item => item.SponsorshipRequestId == id)
            .OrderBy(item => item.CreatedAt)
            .ToListAsync();

        return Ok(history.Select(item => item.ToDto()));
    }

    [HttpGet("sponsorship-types")]
    public async Task<ActionResult<IReadOnlyList<SponsorshipTypeDto>>> SponsorshipTypes()
    {
        var types = await db.SponsorshipTypes.OrderBy(type => type.Name).ToListAsync();
        return Ok(types.Select(type => type.ToDto()));
    }

    [HttpPost("sponsorship-types")]
    public async Task<ActionResult<SponsorshipTypeDto>> CreateType(SponsorshipTypeUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Name is required." });
        }

        var type = new SponsorshipType
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            IsActive = dto.IsActive
        };

        db.SponsorshipTypes.Add(type);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(SponsorshipTypes), type.ToDto());
    }

    [HttpPut("sponsorship-types/{id:guid}")]
    public async Task<ActionResult<SponsorshipTypeDto>> UpdateType(Guid id, SponsorshipTypeUpsertDto dto)
    {
        var type = await db.SponsorshipTypes.SingleOrDefaultAsync(candidate => candidate.Id == id);
        if (type is null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Name is required." });
        }

        type.Name = dto.Name.Trim();
        type.IsActive = dto.IsActive;
        await db.SaveChangesAsync();

        return Ok(type.ToDto());
    }

    [HttpDelete("sponsorship-types/{id:guid}")]
    public async Task<IActionResult> DeleteType(Guid id)
    {
        var type = await db.SponsorshipTypes.SingleOrDefaultAsync(candidate => candidate.Id == id);
        if (type is null)
        {
            return NotFound();
        }

        type.IsActive = false;
        await db.SaveChangesAsync();

        return NoContent();
    }
}
