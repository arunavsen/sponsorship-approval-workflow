using SponsorshipApproval.Api.Domain;

namespace SponsorshipApproval.Api.Dtos;

public sealed record LoginRequest(string UserName, string Password);

public sealed record LoginResponse(
    string Token,
    Guid UserId,
    string UserName,
    string DisplayName,
    UserRole Role);
