using Microsoft.EntityFrameworkCore;
using SponsorshipApproval.Api.Domain;
using SponsorshipApproval.Api.Services;

namespace SponsorshipApproval.Api.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        if (db.Database.IsRelational())
        {
            await db.Database.EnsureCreatedAsync();
        }

        if (!await db.Users.AnyAsync())
        {
            db.Users.AddRange(
                CreateUser("requestor@techzu.test", "Rina Requestor", "Marketing", UserRole.Requestor, passwordHasher),
                CreateUser("manager@techzu.test", "Marcus Manager", "Operations", UserRole.Manager, passwordHasher),
                CreateUser("finance@techzu.test", "Farah Finance", "Finance", UserRole.FinanceAdmin, passwordHasher),
                CreateUser("admin@techzu.test", "Amira Admin", "Administration", UserRole.SystemAdmin, passwordHasher));
        }

        if (!await db.SponsorshipTypes.AnyAsync())
        {
            db.SponsorshipTypes.AddRange(
                new SponsorshipType { Id = Guid.Parse("96c787c5-797e-49a2-a476-08316440afe5"), Name = "Conference" },
                new SponsorshipType { Id = Guid.Parse("0eeb3e6d-67be-4d73-9c91-8c64ce30915a"), Name = "Community Event" },
                new SponsorshipType { Id = Guid.Parse("abdc16ec-d3b7-4016-98e9-2b3532d2d5a3"), Name = "Industry Partnership" });
        }

        await db.SaveChangesAsync();

        if (!await db.SponsorshipRequests.AnyAsync())
        {
            var requestor = await db.Users.SingleAsync(user => user.UserName == "requestor@techzu.test");
            var type = await db.SponsorshipTypes.FirstAsync();
            var request = new SponsorshipRequest
            {
                Id = Guid.NewGuid(),
                Title = "Regional Developer Summit Sponsorship",
                RequestorId = requestor.Id,
                RequestorName = requestor.DisplayName,
                Department = requestor.Department,
                SponsorshipTypeId = type.Id,
                EventOrOrganisationName = "South Asia Developer Summit",
                EventDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(45)),
                RequestedAmount = 3500,
                Purpose = "Sponsor a regional developer summit to increase brand presence and recruiting reach.",
                ExpectedBusinessBenefit = "Brand visibility, candidate pipeline, and partner introductions.",
                Remarks = "Seeded sample for reviewers.",
                Status = RequestStatus.PendingManagerApproval
            };

            db.SponsorshipRequests.Add(request);
            db.WorkflowHistories.Add(new WorkflowHistory
            {
                Id = Guid.NewGuid(),
                SponsorshipRequestId = request.Id,
                ActorId = requestor.Id,
                ActorRole = requestor.Role,
                Action = WorkflowAction.Submitted,
                FromStatus = RequestStatus.Draft,
                ToStatus = RequestStatus.PendingManagerApproval,
                Remarks = "Seeded submitted request."
            });

            await db.SaveChangesAsync();
        }
    }

    private static ApplicationUser CreateUser(
        string userName,
        string displayName,
        string department,
        UserRole role,
        IPasswordHasher passwordHasher) =>
        new()
        {
            Id = Guid.NewGuid(),
            UserName = userName,
            DisplayName = displayName,
            Department = department,
            Role = role,
            PasswordHash = passwordHasher.Hash("Password123!")
        };
}
