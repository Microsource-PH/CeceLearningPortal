using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using CeceLearningPortal.Api.Models;
using System.Text.Json;

namespace CeceLearningPortal.Api.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseModule> CourseModules { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<LessonProgress> LessonProgresses { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<PasswordHistory> PasswordHistories { get; set; }
        public DbSet<InstructorApproval> InstructorApprovals { get; set; }
        public DbSet<CourseApproval> CourseApprovals { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Skip snake_case conversion for Identity tables
            var identityTableNames = new HashSet<string> 
            { 
                "AspNetUsers", "AspNetRoles", "AspNetUserRoles", 
                "AspNetUserClaims", "AspNetRoleClaims", "AspNetUserLogins", 
                "AspNetUserTokens", "ApplicationUser", "IdentityRole",
                "IdentityUserRole<string>", "IdentityUserClaim<string>",
                "IdentityRoleClaim<string>", "IdentityUserLogin<string>",
                "IdentityUserToken<string>"
            };

            // Configure snake_case naming convention for non-Identity tables and columns
            foreach (var entity in builder.Model.GetEntityTypes())
            {
                var entityName = entity.ClrType.Name;
                var isIdentityTable = identityTableNames.Contains(entityName) || 
                                     entity.ClrType.BaseType?.Name.Contains("IdentityUser") == true ||
                                     entity.ClrType.BaseType?.Name.Contains("IdentityRole") == true;

                // Convert table names to snake_case (except Identity tables)
                var tableName = entity.GetTableName();
                if (tableName != null && !isIdentityTable && !tableName.StartsWith("AspNet"))
                {
                    entity.SetTableName(ToSnakeCase(tableName));
                }

                // Convert column names to snake_case
                foreach (var property in entity.GetProperties())
                {
                    if (!isIdentityTable)
                    {
                        property.SetColumnName(ToSnakeCase(property.Name));
                    }
                }

                // Convert key names to snake_case
                foreach (var key in entity.GetKeys())
                {
                    if (!isIdentityTable)
                    {
                        key.SetName(ToSnakeCase(key.GetName()));
                    }
                }

                // Convert foreign key names to snake_case
                foreach (var key in entity.GetForeignKeys())
                {
                    if (!isIdentityTable)
                    {
                        key.SetConstraintName(ToSnakeCase(key.GetConstraintName()));
                    }
                }

                // Convert index names to snake_case
                foreach (var index in entity.GetIndexes())
                {
                    if (!isIdentityTable)
                    {
                        index.SetDatabaseName(ToSnakeCase(index.GetDatabaseName()));
                    }
                }
            }
            
            // Explicit column mappings for GHL fields with PascalCase in database
            builder.Entity<Course>()
                .Property(c => c.AccessDuration)
                .HasColumnName("AccessDuration");
                
            builder.Entity<Course>()
                .Property(c => c.CourseType)
                .HasColumnName("CourseType");
                
            builder.Entity<Course>()
                .Property(c => c.PricingModel)
                .HasColumnName("PricingModel");
                
            builder.Entity<Course>()
                .Property(c => c.Currency)
                .HasColumnName("Currency");
                
            builder.Entity<Course>()
                .Property(c => c.SubscriptionPeriod)
                .HasColumnName("SubscriptionPeriod");
                
            builder.Entity<Course>()
                .Property(c => c.PaymentPlanDetailsJson)
                .HasColumnName("PaymentPlanDetailsJson");
                
            builder.Entity<Course>()
                .Property(c => c.AccessType)
                .HasColumnName("AccessType");
                
            builder.Entity<Course>()
                .Property(c => c.EnrollmentLimit)
                .HasColumnName("EnrollmentLimit");
                
            builder.Entity<Course>()
                .Property(c => c.Language)
                .HasColumnName("Language");
                
            builder.Entity<Course>()
                .Property(c => c.HasCertificate)
                .HasColumnName("HasCertificate");
                
            builder.Entity<Course>()
                .Property(c => c.HasCommunity)
                .HasColumnName("HasCommunity");
                
            builder.Entity<Course>()
                .Property(c => c.HasLiveSessions)
                .HasColumnName("HasLiveSessions");
                
            builder.Entity<Course>()
                .Property(c => c.HasDownloadableResources)
                .HasColumnName("HasDownloadableResources");
                
            builder.Entity<Course>()
                .Property(c => c.HasAssignments)
                .HasColumnName("HasAssignments");
                
            builder.Entity<Course>()
                .Property(c => c.HasQuizzes)
                .HasColumnName("HasQuizzes");
                
            builder.Entity<Course>()
                .Property(c => c.DripContent)
                .HasColumnName("DripContent");
                
            builder.Entity<Course>()
                .Property(c => c.DripScheduleJson)
                .HasColumnName("DripScheduleJson");
                
            builder.Entity<Course>()
                .Property(c => c.AutomationWelcomeEmail)
                .HasColumnName("AutomationWelcomeEmail");
                
            builder.Entity<Course>()
                .Property(c => c.AutomationCompletionCertificate)
                .HasColumnName("AutomationCompletionCertificate");
                
            builder.Entity<Course>()
                .Property(c => c.AutomationProgressReminders)
                .HasColumnName("AutomationProgressReminders");
                
            builder.Entity<Course>()
                .Property(c => c.AutomationAbandonmentSequence)
                .HasColumnName("AutomationAbandonmentSequence");
                
            builder.Entity<Course>()
                .Property(c => c.IsPublished)
                .HasColumnName("IsPublished");
                
            builder.Entity<Course>()
                .Property(c => c.PublishedAt)
                .HasColumnName("PublishedAt");
                
            builder.Entity<Course>()
                .Property(c => c.ShortDescription)
                .HasColumnName("ShortDescription");
                
            builder.Entity<Course>()
                .Property(c => c.PromoVideoUrl)
                .HasColumnName("PromoVideoUrl");

            // Map entities to lowercase table names
            builder.Entity<Course>().ToTable("courses");
            builder.Entity<CourseModule>().ToTable("course_modules");
            builder.Entity<Lesson>().ToTable("course_lessons");
            builder.Entity<Enrollment>().ToTable("enrollments");
            builder.Entity<LessonProgress>().ToTable("lesson_progress");
            builder.Entity<Review>().ToTable("course_reviews");
            builder.Entity<Payment>().ToTable("transactions");
            builder.Entity<Subscription>().ToTable("subscriptions");
            builder.Entity<SubscriptionPlan>().ToTable("subscription_plans");
            builder.Entity<Notification>().ToTable("activities");
            builder.Entity<RefreshToken>().ToTable("refresh_tokens");
            builder.Entity<PasswordHistory>().ToTable("sessions");
            builder.Entity<InstructorApproval>().ToTable("instructor_approvals");
            builder.Entity<CourseApproval>().ToTable("course_approvals");

            // Configure string enums
            builder.Entity<ApplicationUser>()
                .Property(u => u.Role)
                .HasConversion<string>();

            builder.Entity<ApplicationUser>()
                .Property(u => u.Status)
                .HasConversion<string>();

            builder.Entity<Course>()
                .Property(c => c.Status)
                .HasConversion<string>();

            builder.Entity<Course>()
                .Property(c => c.Level)
                .HasConversion<string>();

            builder.Entity<Course>()
                .Property(c => c.EnrollmentType)
                .HasConversion<string>();

            builder.Entity<Lesson>()
                .Property(l => l.Type)
                .HasConversion<string>();

            builder.Entity<LessonProgress>()
                .Property(l => l.Status)
                .HasConversion<string>();

            builder.Entity<Payment>()
                .Property(p => p.Status)
                .HasConversion<string>();

            builder.Entity<Payment>()
                .Property(p => p.PaymentMethod)
                .HasConversion<string>();

            builder.Entity<Subscription>()
                .Property(s => s.Status)
                .HasConversion<string>();

            builder.Entity<Review>()
                .Property(r => r.Status)
                .HasConversion<string>();

            builder.Entity<Notification>()
                .Property(n => n.Type)
                .HasConversion<string>();

            builder.Entity<InstructorApproval>()
                .Property(i => i.Status)
                .HasConversion<string>();

            // Configure value converters for list properties with value comparers
            var stringListComparer = new ValueComparer<List<string>>(
                (c1, c2) => c1.SequenceEqual(c2),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToList());

            builder.Entity<Course>()
                .Property(c => c.Features)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
                .Metadata.SetValueComparer(stringListComparer);

            builder.Entity<ApplicationUser>()
                .Property(u => u.NotificationPreferences)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
                .Metadata.SetValueComparer(stringListComparer);

            builder.Entity<SubscriptionPlan>()
                .Property(sp => sp.Features)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
                .Metadata.SetValueComparer(stringListComparer);

            // Configure relationships
            builder.Entity<Course>()
                .HasOne(c => c.Instructor)
                .WithMany(u => u.InstructedCourses)
                .HasForeignKey(c => c.InstructorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CourseModule>()
                .HasOne(m => m.Course)
                .WithMany(c => c.Modules)
                .HasForeignKey(m => m.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Lesson>()
                .HasOne(l => l.Module)
                .WithMany(m => m.Lessons)
                .HasForeignKey(l => l.ModuleId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Enrollment>()
                .HasOne(e => e.Student)
                .WithMany(u => u.Enrollments)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Enrollment>()
                .HasOne(e => e.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<LessonProgress>()
                .HasOne(lp => lp.Student)
                .WithMany()
                .HasForeignKey(lp => lp.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<LessonProgress>()
                .HasOne(lp => lp.Lesson)
                .WithMany()
                .HasForeignKey(lp => lp.LessonId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Review>()
                .HasOne(r => r.Student)
                .WithMany()
                .HasForeignKey(r => r.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Review>()
                .HasOne(r => r.Course)
                .WithMany(c => c.Reviews)
                .HasForeignKey(r => r.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<PasswordHistory>()
                .HasOne(ph => ph.User)
                .WithMany(u => u.PasswordHistories)
                .HasForeignKey(ph => ph.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<InstructorApproval>()
                .HasOne(ia => ia.User)
                .WithOne(u => u.InstructorApproval)
                .HasForeignKey<InstructorApproval>(ia => ia.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Subscription>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Subscription>()
                .HasOne(s => s.SubscriptionPlan)
                .WithMany(sp => sp.Subscriptions)
                .HasForeignKey(s => s.SubscriptionPlanId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CourseApproval>()
                .HasOne(ca => ca.Course)
                .WithMany()
                .HasForeignKey(ca => ca.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<CourseApproval>()
                .HasOne(ca => ca.SubmittedBy)
                .WithMany()
                .HasForeignKey(ca => ca.SubmittedById)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CourseApproval>()
                .HasOne(ca => ca.ReviewedBy)
                .WithMany()
                .HasForeignKey(ca => ca.ReviewedById)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure indexes
            builder.Entity<ApplicationUser>()
                .HasIndex(u => u.Email)
                .IsUnique();

            builder.Entity<Course>()
                .HasIndex(c => c.Status);

            builder.Entity<Course>()
                .HasIndex(c => c.Category);

            builder.Entity<Enrollment>()
                .HasIndex(e => new { e.StudentId, e.CourseId })
                .IsUnique();

            builder.Entity<LessonProgress>()
                .HasIndex(lp => new { lp.StudentId, lp.LessonId })
                .IsUnique();

            builder.Entity<RefreshToken>()
                .HasIndex(rt => rt.Token)
                .IsUnique();

            builder.Entity<RefreshToken>()
                .HasIndex(rt => rt.ExpiresAt);

            // Seed roles
            var roles = new List<IdentityRole>
            {
                new IdentityRole { Id = "1", Name = "Admin", NormalizedName = "ADMIN" },
                new IdentityRole { Id = "2", Name = "Instructor", NormalizedName = "INSTRUCTOR" },
                new IdentityRole { Id = "3", Name = "Student", NormalizedName = "STUDENT" }
            };

            builder.Entity<IdentityRole>().HasData(roles);
        }

        private static string ToSnakeCase(string input)
        {
            if (string.IsNullOrEmpty(input)) return input;
            
            var sb = new System.Text.StringBuilder();
            for (int i = 0; i < input.Length; i++)
            {
                if (i > 0 && char.IsUpper(input[i]))
                {
                    sb.Append('_');
                }
                sb.Append(char.ToLower(input[i]));
            }
            return sb.ToString();
        }
    }
}