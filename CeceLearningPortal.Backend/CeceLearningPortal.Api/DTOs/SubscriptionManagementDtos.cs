using System.ComponentModel.DataAnnotations;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.DTOs
{
    // Subscription Plan Management
    public class SubscriptionPlanManagementDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public SubscriptionPlanType PlanType { get; set; }
        public decimal MonthlyPrice { get; set; }
        public decimal YearlyPrice { get; set; }
        
        // Learner-specific
        public int MaxCourseAccess { get; set; }
        public bool HasUnlimitedAccess { get; set; }
        
        // Creator-specific
        public int? MaxCoursesCanCreate { get; set; }
        public int? MaxStudentsPerCourse { get; set; }
        public decimal? TransactionFeePercentage { get; set; }
        public bool HasAnalytics { get; set; }
        public bool HasPrioritySupport { get; set; }
        
        public List<string> Features { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsRecommended { get; set; }
        public int ActiveSubscribers { get; set; }
        public decimal MonthlyRevenue { get; set; }
    }


    // Subscriber Management
    public class SubscriberManagementDto
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public UserRole Role { get; set; }
        public int SubscriptionId { get; set; }
        public string PlanName { get; set; }
        public SubscriptionPlanType PlanType { get; set; }
        public decimal Price { get; set; }
        public string BillingCycle { get; set; }
        public SubscriptionStatus Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? NextBillingDate { get; set; }
        public decimal TotalPaid { get; set; }
    }

    public class SubscriberFilterDto
    {
        public SubscriptionPlanType? PlanType { get; set; }
        public int? PlanId { get; set; }
        public SubscriptionStatus? Status { get; set; }
        public string? SearchTerm { get; set; }
        public DateTime? SubscribedAfter { get; set; }
        public DateTime? SubscribedBefore { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class UpdateSubscriberDto
    {
        [Required]
        public int SubscriptionId { get; set; }
        
        public int? NewPlanId { get; set; }
        public SubscriptionStatus? NewStatus { get; set; }
        public DateTime? ExtendEndDate { get; set; }
        public string? AdminNotes { get; set; }
    }

    public class SubscriptionStatisticsDto
    {
        public int TotalActiveSubscribers { get; set; }
        public int TotalLearnerSubscribers { get; set; }
        public int TotalCreatorSubscribers { get; set; }
        public decimal MonthlyRecurringRevenue { get; set; }
        public decimal YearlyRecurringRevenue { get; set; }
        public decimal AverageRevenuePerUser { get; set; }
        public Dictionary<string, int> SubscribersByPlan { get; set; }
        public Dictionary<string, decimal> RevenueByPlan { get; set; }
        public List<MonthlyGrowthDto> MonthlyGrowth { get; set; }
        public decimal ChurnRate { get; set; }
    }

    public class MonthlyGrowthDto
    {
        public string Month { get; set; }
        public int NewSubscribers { get; set; }
        public int CancelledSubscribers { get; set; }
        public int NetGrowth { get; set; }
        public decimal Revenue { get; set; }
    }

    // Course Management DTOs
    public class AdminCourseManagementDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string InstructorId { get; set; }
        public string InstructorName { get; set; }
        public decimal Price { get; set; }
        public string Category { get; set; }
        public CourseLevel Level { get; set; }
        public CourseStatus Status { get; set; }
        public int StudentsCount { get; set; }
        public double AverageRating { get; set; }
        public decimal TotalRevenue { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool NeedsReview { get; set; }
        public string? AdminNotes { get; set; }
    }

    public class AdminCreateCourseDto
    {
        [Required]
        public string Title { get; set; }
        
        [Required]
        public string Description { get; set; }
        
        [Required]
        public string InstructorId { get; set; }
        
        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }
        
        public decimal? OriginalPrice { get; set; }
        public int? Discount { get; set; }
        
        [Required]
        public string Duration { get; set; }
        
        [Required]
        public CourseLevel Level { get; set; }
        
        [Required]
        public string Category { get; set; }
        
        public string? Thumbnail { get; set; }
        public List<string> Features { get; set; } = new List<string>();
        public string? PreviewUrl { get; set; }
        public CourseStatus Status { get; set; } = CourseStatus.Draft;
    }

    public class AdminUpdateCourseDto : AdminCreateCourseDto
    {
        [Required]
        public int Id { get; set; }
        
        public string? AdminNotes { get; set; }
    }

    public class ApproveCourseDto
    {
        [Required]
        public int CourseId { get; set; }
        
        [Required]
        public bool Approve { get; set; }
        
        public string? Reason { get; set; }
        public string? AdminNotes { get; set; }
    }

    public class CourseManagementFilterDto
    {
        public CourseStatus? Status { get; set; }
        public string? Category { get; set; }
        public CourseLevel? Level { get; set; }
        public string? InstructorId { get; set; }
        public bool? NeedsReview { get; set; }
        public string? SearchTerm { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? MinStudents { get; set; }
        public DateTime? CreatedAfter { get; set; }
        public DateTime? CreatedBefore { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class CourseManagementStatsDto
    {
        public int TotalCourses { get; set; }
        public int ActiveCourses { get; set; }
        public int DraftCourses { get; set; }
        public int PendingReview { get; set; }
        public int TotalEnrollments { get; set; }
        public decimal TotalRevenue { get; set; }
        public Dictionary<string, int> CoursesByCategory { get; set; }
        public Dictionary<string, int> CoursesByLevel { get; set; }
        public List<TopPerformingCourseDto> TopPerformingCourses { get; set; }
    }

    public class TopPerformingCourseDto
    {
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string InstructorName { get; set; }
        public int EnrollmentCount { get; set; }
        public decimal Revenue { get; set; }
        public double Rating { get; set; }
    }
}