namespace SponsorshipApproval.Api.Services;

public sealed class JwtOptions
{
    public string Issuer { get; set; } = "SponsorshipApproval";
    public string Audience { get; set; } = "SponsorshipApproval";
    public string SigningKey { get; set; } = "replace-this-dev-only-key-with-at-least-32-characters";
    public int ExpiryMinutes { get; set; } = 480;
}
