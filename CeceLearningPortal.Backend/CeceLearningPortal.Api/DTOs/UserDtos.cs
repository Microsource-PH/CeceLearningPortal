using System.ComponentModel.DataAnnotations;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.DTOs
{
    public class UserFilterDto
    {
        public string? Role { get; set; }
        public string? Status { get; set; }
        public string? SearchTerm { get; set; }
        public DateTime? CreatedAfter { get; set; }
        public DateTime? CreatedBefore { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class UpdateUserDto
    {
        public string? FullName { get; set; }
        public string? Avatar { get; set; }
        public List<string>? NotificationPreferences { get; set; }
    }

    public class InstructorApprovalDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string Bio { get; set; }
        public string Qualifications { get; set; }
        public string TeachingExperience { get; set; }
        public string? LinkedInProfile { get; set; }
        public string? WebsiteUrl { get; set; }
        public string Status { get; set; }
        public string? ReviewerNotes { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedBy { get; set; }
    }

    public class SubmitInstructorApprovalDto
    {
        [Required]
        public string Bio { get; set; }

        [Required]
        public string Qualifications { get; set; }

        [Required]
        public string TeachingExperience { get; set; }

        public string? LinkedInProfile { get; set; }
        public string? WebsiteUrl { get; set; }
    }

    public class ReviewInstructorApprovalDto
    {
        [Required]
        public string Status { get; set; } // Approved, Rejected, MoreInfoRequired

        public string? ReviewerNotes { get; set; }
    }

    public class UserStatsDto
    {
        public int TotalCourses { get; set; }
        public int ActiveCourses { get; set; }
        public int TotalStudents { get; set; }
        public decimal TotalRevenue { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<string, int> StudentsByMonth { get; set; }
        public Dictionary<string, decimal> RevenueByMonth { get; set; }
    }

    // User Management DTOs for Admin
    public class UserManagementDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public UserRole Role { get; set; }
        public UserStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public bool EmailConfirmed { get; set; }
        public bool IsApproved => Status == UserStatus.Active;
    }

    public class ApproveUserDto
    {
        [Required]
        public string UserId { get; set; }
        
        [Required]
        public bool Approve { get; set; }
        
        public string? Reason { get; set; } // Reason for rejection if not approved
    }

    public class CreateAdminDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string UserName { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }
    }

    public class UpdateUserStatusDto
    {
        [Required]
        public string UserId { get; set; }

        [Required]
        public UserStatus Status { get; set; }

        public string? Reason { get; set; }
    }

    public class UserManagementFilterDto : UserFilterDto
    {
        public bool? PendingApprovalOnly { get; set; }
        public UserRole? RoleFilter { get; set; }
        public UserStatus? StatusFilter { get; set; }
    }

    public class UserManagementStatsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int PendingApprovals { get; set; }
        public int SuspendedUsers { get; set; }
        public Dictionary<string, int> UsersByRole { get; set; }
        public Dictionary<string, int> UsersByStatus { get; set; }
        public int NewUsersThisMonth { get; set; }
        public int NewUsersLastMonth { get; set; }
    }
}