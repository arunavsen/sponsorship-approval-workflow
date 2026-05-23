using Microsoft.EntityFrameworkCore;
using SponsorshipApproval.Api.Domain;

namespace SponsorshipApproval.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ApplicationUser> Users => Set<ApplicationUser>();
    public DbSet<SponsorshipType> SponsorshipTypes => Set<SponsorshipType>();
    public DbSet<SponsorshipRequest> SponsorshipRequests => Set<SponsorshipRequest>();
    public DbSet<WorkflowHistory> WorkflowHistories => Set<WorkflowHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.HasKey(user => user.Id);
            entity.HasIndex(user => user.UserName).IsUnique();
            entity.Property(user => user.UserName).HasMaxLength(80).IsRequired();
            entity.Property(user => user.DisplayName).HasMaxLength(140).IsRequired();
            entity.Property(user => user.Department).HasMaxLength(120).IsRequired();
            entity.Property(user => user.PasswordHash).HasMaxLength(500).IsRequired();
            entity.Property(user => user.Role).HasConversion<string>().HasMaxLength(40);
        });

        modelBuilder.Entity<SponsorshipType>(entity =>
        {
            entity.HasKey(type => type.Id);
            entity.HasIndex(type => type.Name).IsUnique();
            entity.Property(type => type.Name).HasMaxLength(120).IsRequired();
        });

        modelBuilder.Entity<SponsorshipRequest>(entity =>
        {
            entity.HasKey(request => request.Id);
            entity.Property(request => request.Title).HasMaxLength(180).IsRequired();
            entity.Property(request => request.RequestorName).HasMaxLength(140).IsRequired();
            entity.Property(request => request.Department).HasMaxLength(120).IsRequired();
            entity.Property(request => request.EventOrOrganisationName).HasMaxLength(180).IsRequired();
            entity.Property(request => request.RequestedAmount).HasPrecision(14, 2);
            entity.Property(request => request.Purpose).HasMaxLength(2000).IsRequired();
            entity.Property(request => request.ExpectedBusinessBenefit).HasMaxLength(2000);
            entity.Property(request => request.Remarks).HasMaxLength(2000);
            entity.Property(request => request.SupportingDocumentName).HasMaxLength(220);
            entity.Property(request => request.SupportingDocumentUrl).HasMaxLength(1000);
            entity.Property(request => request.Status).HasConversion<string>().HasMaxLength(60);
            entity.HasOne(request => request.Requestor).WithMany().HasForeignKey(request => request.RequestorId);
            entity.HasOne(request => request.SponsorshipType).WithMany().HasForeignKey(request => request.SponsorshipTypeId);
        });

        modelBuilder.Entity<WorkflowHistory>(entity =>
        {
            entity.HasKey(history => history.Id);
            entity.Property(history => history.ActorRole).HasConversion<string>().HasMaxLength(40);
            entity.Property(history => history.Action).HasConversion<string>().HasMaxLength(60);
            entity.Property(history => history.FromStatus).HasConversion<string>().HasMaxLength(60);
            entity.Property(history => history.ToStatus).HasConversion<string>().HasMaxLength(60);
            entity.Property(history => history.Remarks).HasMaxLength(2000);
            entity.HasOne(history => history.SponsorshipRequest)
                .WithMany(request => request.WorkflowHistory)
                .HasForeignKey(history => history.SponsorshipRequestId);
            entity.HasOne(history => history.Actor).WithMany().HasForeignKey(history => history.ActorId);
        });
    }
}
