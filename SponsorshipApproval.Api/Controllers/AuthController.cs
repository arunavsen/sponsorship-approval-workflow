using Microsoft.AspNetCore.Mvc;
using SponsorshipApproval.Api.Dtos;
using SponsorshipApproval.Api.Services;

namespace SponsorshipApproval.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var response = await authService.LoginAsync(request);
        return response is null ? Unauthorized(new { message = "Invalid username or password." }) : Ok(response);
    }
}
