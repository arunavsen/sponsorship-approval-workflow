using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SponsorshipApproval.Api.Data;
using SponsorshipApproval.Api.Dtos;
using SponsorshipApproval.Api.Services;

namespace SponsorshipApproval.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/sponsorship-types")]
public sealed class SponsorshipTypesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SponsorshipTypeDto>>> ActiveTypes()
    {
        var types = await db.SponsorshipTypes
            .Where(type => type.IsActive)
            .OrderBy(type => type.Name)
            .ToListAsync();

        return Ok(types.Select(type => type.ToDto()));
    }
}
