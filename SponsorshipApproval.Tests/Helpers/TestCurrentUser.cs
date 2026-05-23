using SponsorshipApproval.Api.Domain;
using SponsorshipApproval.Api.Services;

namespace SponsorshipApproval.Tests.Helpers;

public sealed class TestCurrentUser(Guid userId, string displayName, UserRole role) : ICurrentUser
{
    public Guid UserId { get; set; } = userId;
    public string DisplayName { get; set; } = displayName;
    public UserRole Role { get; set; } = role;
}
