using System.Security.Claims;
using SponsorshipApproval.Api.Domain;

namespace SponsorshipApproval.Api.Services;

public interface ICurrentUser
{
    Guid UserId { get; }
    string DisplayName { get; }
    UserRole Role { get; }
}

public sealed class CurrentUser(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    public Guid UserId
    {
        get
        {
            var value = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out var userId) ? userId : throw new InvalidOperationException("Authenticated user id is missing.");
        }
    }

    public string DisplayName =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "Unknown user";

    public UserRole Role
    {
        get
        {
            var value = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
            return Enum.TryParse<UserRole>(value, out var role) ? role : throw new InvalidOperationException("Authenticated user role is missing.");
        }
    }
}
