using Microsoft.EntityFrameworkCore;
using SponsorshipApproval.Api.Data;
using SponsorshipApproval.Api.Domain;
using SponsorshipApproval.Api.Dtos;
using SponsorshipApproval.Api.Services;
using SponsorshipApproval.Tests.Helpers;

namespace SponsorshipApproval.Tests;

public sealed class SponsorshipWorkflowServiceTests
{
    [Fact]
    public async Task Requestor_can_create_draft_and_submit_to_manager()
    {
        var fixture = await CreateFixtureAsync(UserRole.Requestor);
        var service = new SponsorshipWorkflowService(fixture.Db, fixture.User);

        var created = await service.CreateDraftAsync(CreateRequestDto(fixture.TypeId));
        var submitted = await service.SubmitAsync(created.Id);

        Assert.Equal(RequestStatus.PendingManagerApproval, submitted!.Status);
        Assert.Equal(2, await fixture.Db.WorkflowHistories.CountAsync());
    }

    [Fact]
    public async Task Manager_approval_moves_request_to_finance_review()
    {
        var fixture = await CreateFixtureAsync(UserRole.Manager);
        var request = await SeedRequestAsync(fixture.Db, fixture.RequestorId, fixture.TypeId, RequestStatus.PendingManagerApproval);
        var service = new SponsorshipWorkflowService(fixture.Db, fixture.User);

        var approved = await service.ManagerApproveAsync(request.Id, "Looks aligned with business goals.");

        Assert.Equal(RequestStatus.PendingFinanceReview, approved!.Status);
        Assert.Contains(await fixture.Db.WorkflowHistories.ToListAsync(), item => item.Action == WorkflowAction.ManagerApproved);
    }

    [Fact]
    public async Task Finance_approval_moves_request_to_approved()
    {
        var fixture = await CreateFixtureAsync(UserRole.FinanceAdmin);
        var request = await SeedRequestAsync(fixture.Db, fixture.RequestorId, fixture.TypeId, RequestStatus.PendingFinanceReview);
        var service = new SponsorshipWorkflowService(fixture.Db, fixture.User);

        var approved = await service.FinanceApproveAsync(request.Id, "Budget approved.");

        Assert.Equal(RequestStatus.Approved, approved!.Status);
        Assert.Contains(await fixture.Db.WorkflowHistories.ToListAsync(), item => item.Action == WorkflowAction.FinanceApproved);
    }

    [Fact]
    public async Task Invalid_status_transition_is_rejected()
    {
        var fixture = await CreateFixtureAsync(UserRole.FinanceAdmin);
        var request = await SeedRequestAsync(fixture.Db, fixture.RequestorId, fixture.TypeId, RequestStatus.PendingManagerApproval);
        var service = new SponsorshipWorkflowService(fixture.Db, fixture.User);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.FinanceApproveAsync(request.Id, "Too early."));
    }

    [Fact]
    public async Task Requestor_cannot_cancel_finalized_request()
    {
        var fixture = await CreateFixtureAsync(UserRole.Requestor);
        var request = await SeedRequestAsync(fixture.Db, fixture.User.UserId, fixture.TypeId, RequestStatus.Approved);
        var service = new SponsorshipWorkflowService(fixture.Db, fixture.User);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.CancelAsync(request.Id));
    }

    private static async Task<Fixture> CreateFixtureAsync(UserRole role)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var db = new AppDbContext(options);
        var requestorId = Guid.NewGuid();
        var actorId = role == UserRole.Requestor ? requestorId : Guid.NewGuid();
        var typeId = Guid.NewGuid();

        db.Users.Add(new ApplicationUser
        {
            Id = requestorId,
            UserName = "requestor@techzu.test",
            DisplayName = "Rina Requestor",
            Department = "Marketing",
            PasswordHash = "test",
            Role = UserRole.Requestor
        });

        if (actorId != requestorId)
        {
            db.Users.Add(new ApplicationUser
            {
                Id = actorId,
                UserName = $"{role.ToString().ToLowerInvariant()}@techzu.test",
                DisplayName = role.ToString(),
                Department = "Test",
                PasswordHash = "test",
                Role = role
            });
        }

        db.SponsorshipTypes.Add(new SponsorshipType { Id = typeId, Name = "Conference", IsActive = true });
        await db.SaveChangesAsync();

        return new Fixture(db, new TestCurrentUser(actorId, role.ToString(), role), requestorId, typeId);
    }

    private static async Task<SponsorshipRequest> SeedRequestAsync(
        AppDbContext db,
        Guid requestorId,
        Guid typeId,
        RequestStatus status)
    {
        var request = new SponsorshipRequest
        {
            Id = Guid.NewGuid(),
            Title = "Seed request",
            RequestorId = requestorId,
            RequestorName = "Rina Requestor",
            Department = "Marketing",
            SponsorshipTypeId = typeId,
            EventOrOrganisationName = "Developer Summit",
            EventDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)),
            RequestedAmount = 2500,
            Purpose = "Brand building",
            Status = status
        };

        db.SponsorshipRequests.Add(request);
        await db.SaveChangesAsync();
        return request;
    }

    private static SponsorshipRequestUpsertDto CreateRequestDto(Guid typeId) =>
        new(
            "Developer Summit Sponsorship",
            "Rina Requestor",
            "Marketing",
            typeId,
            "Developer Summit",
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(60)),
            3500,
            "Increase brand visibility with senior engineering candidates.",
            "Recruiting pipeline and partner meetings.",
            "Please prioritize.",
            null,
            null);

    private sealed record Fixture(AppDbContext Db, TestCurrentUser User, Guid RequestorId, Guid TypeId);
}
