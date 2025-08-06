using Microsoft.AspNetCore.Identity;

namespace CeceLearningPortal.Api.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; }
        public string? Avatar { get; set; }
        public UserRole Role { get; set; }
        public UserStatus Status { get; set; } = UserStatus.Active;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
        public List<string> NotificationPreferences { get; set; } = new();

        // Navigation properties
        public virtual ICollection<Course> InstructedCourses { get; set; } = new List<Course>();
        public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public virtual ICollection<PasswordHistory> PasswordHistories { get; set; } = new List<PasswordHistory>();
        public virtual InstructorApproval? InstructorApproval { get; set; }
    }

    public enum UserRole
    {
        Student,
        Instructor,
        Admin
    }

    public enum UserStatus
    {
        Active,
        Inactive,
        Suspended,
        PendingApproval
    }
}