using Microsoft.EntityFrameworkCore;
using LearnHub.Domain.Entities;

namespace LearnHub.Infrastructure.Data;

public class LearnHubDbContext : DbContext
{
    public LearnHubDbContext(DbContextOptions<LearnHubDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<VocabularyEntry> VocabularyEntries { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User entity configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
            entity.Property(e => e.IsActive).IsRequired().HasDefaultValue(true);
            
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // VocabularyEntry entity configuration
        modelBuilder.Entity<VocabularyEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OriginalText).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.TranslatedText).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.SourceDomain).IsRequired().HasMaxLength(255);
            entity.Property(e => e.TranslationDate).IsRequired();

            entity.HasOne(e => e.User)
                  .WithMany(u => u.VocabularyEntries)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.SourceDomain);
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Seed user - password is "password123"
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Username = "testuser",
                Email = "test@learnhub.com",
                PasswordHash = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // BCrypt hash for "password123"
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true
            }
        );

        // Seed vocabulary entries
        modelBuilder.Entity<VocabularyEntry>().HasData(
            new VocabularyEntry
            {
                Id = 1,
                UserId = 1,
                OriginalText = "Hello world",
                TranslatedText = "Merhaba dünya",
                SourceDomain = "example.com",
                TranslationDate = new DateTime(2024, 1, 1, 12, 0, 0, DateTimeKind.Utc)
            },
            new VocabularyEntry
            {
                Id = 2,
                UserId = 1,
                OriginalText = "Good morning",
                TranslatedText = "Günaydın",
                SourceDomain = "wikipedia.org",
                TranslationDate = new DateTime(2024, 1, 2, 9, 30, 0, DateTimeKind.Utc)
            },
            new VocabularyEntry
            {
                Id = 3,
                UserId = 1,
                OriginalText = "Thank you",
                TranslatedText = "Teşekkür ederim",
                SourceDomain = "twitter.com",
                TranslationDate = new DateTime(2024, 1, 3, 15, 45, 0, DateTimeKind.Utc)
            }
        );
    }
}