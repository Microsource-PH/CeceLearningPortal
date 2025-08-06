using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.DTOs
{
    public class CourseDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string InstructorId { get; set; }
        public string InstructorName { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int? Discount { get; set; }
        public string Duration { get; set; }
        public string Level { get; set; }
        public string Category { get; set; }
        public string? Thumbnail { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? PromoVideoUrl { get; set; }
        public string Status { get; set; }
        public bool IsBestseller { get; set; }
        public List<string> Features { get; set; }
        public string? PreviewUrl { get; set; }
        public string EnrollmentType { get; set; }
        public int StudentsCount { get; set; }
        public double AverageRating { get; set; }
        public int LecturesCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Go High Level specific field
        public string? CourseType { get; set; }
    }

    public class CreateCourseDto
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }
        
        public string? ShortDescription { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public decimal? OriginalPrice { get; set; }

        public string? Duration { get; set; }

        [Required]
        public string Level { get; set; }

        [Required]
        public string Category { get; set; }

        public string? Thumbnail { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? PromoVideoUrl { get; set; }
        public List<string> Features { get; set; } = new();
        public string? PreviewUrl { get; set; }

        public string? EnrollmentType { get; set; }
        
        public string Status { get; set; } = "Draft";
        
        // Go High Level specific fields
        public string? CourseType { get; set; }
        public string? PricingModel { get; set; }
        public string Currency { get; set; } = "PHP";
        public string? SubscriptionPeriod { get; set; }
        public PaymentPlanDetailsDto? PaymentPlanDetails { get; set; }
        public string? AccessType { get; set; }
        public int? AccessDuration { get; set; }
        public int? EnrollmentLimit { get; set; }
        public string Language { get; set; } = "en";
        
        // Features object
        public CourseFeaturesDto? CourseFeatures { get; set; }
        
        // Drip content settings
        public bool DripContent { get; set; }
        public DripScheduleDto? DripSchedule { get; set; }
        
        // Automation settings
        public AutomationSettingsDto? Automations { get; set; }
        
        // Modules
        public List<CreateModuleDto>? Modules { get; set; }
    }
    
    public class PaymentPlanDetailsDto
    {
        public int NumberOfPayments { get; set; }
        public decimal PaymentAmount { get; set; }
        public string Frequency { get; set; } // weekly, biweekly, monthly
    }
    
    public class CourseFeaturesDto
    {
        public bool Certificate { get; set; }
        public bool Community { get; set; }
        public bool LiveSessions { get; set; }
        public bool DownloadableResources { get; set; }
        public bool Assignments { get; set; }
        public bool Quizzes { get; set; }
    }
    
    public class DripScheduleDto
    {
        public string Type { get; set; } // immediate, scheduled, sequential
        public int? DelayDays { get; set; }
    }
    
    public class AutomationSettingsDto
    {
        public bool WelcomeEmail { get; set; }
        public bool CompletionCertificate { get; set; }
        public bool ProgressReminders { get; set; }
        public bool AbandonmentSequence { get; set; }
    }

    public class UpdateCourseDto
    {
        [StringLength(200)]
        public string? Title { get; set; }
        
        [StringLength(2000)]
        public string? Description { get; set; }
        
        [StringLength(500)]
        public string? ShortDescription { get; set; }
        
        [Range(0, 999999.99)]
        public decimal? Price { get; set; }
        
        [Range(0, 999999.99)]
        public decimal? OriginalPrice { get; set; }
        
        public string? Duration { get; set; }
        public string? Level { get; set; }
        public string? Category { get; set; }
        public string? Thumbnail { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? PromoVideoUrl { get; set; }
        public string? Language { get; set; }
        public List<string>? Features { get; set; }
        public string? PreviewUrl { get; set; }
        public string? EnrollmentType { get; set; }
        public string? Status { get; set; }
        public CourseFeaturesDto? CourseFeatures { get; set; }
        
        // GHL specific fields
        public string? CourseType { get; set; }
        public string? PricingModel { get; set; }
        public string? Currency { get; set; }
        public string? AccessType { get; set; }
        
        [Range(1, 365)]
        public int? AccessDuration { get; set; }
        
        public AutomationSettingsDto? Automations { get; set; }
        
        // Modules for updating course content
        public List<CreateModuleDto>? Modules { get; set; }
    }

    public class CourseFilterDto
    {
        public string? Category { get; set; }
        public string? Level { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? SearchTerm { get; set; }
        public string? Status { get; set; }
        public bool? IsBestseller { get; set; }
        public string? SortBy { get; set; } = "CreatedAt";
        public bool SortDescending { get; set; } = true;
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class CourseModuleDto
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int Order { get; set; }
        public List<LessonDto> Lessons { get; set; }
    }

    public class CreateModuleDto
    {
        [Required]
        public string Title { get; set; }
        public string? Description { get; set; }
        public int Order { get; set; }
        public List<CreateLessonDto>? Lessons { get; set; }
    }

    public class LessonDto
    {
        public int Id { get; set; }
        public int ModuleId { get; set; }
        public string Title { get; set; }
        public string Duration { get; set; }
        public string Type { get; set; }
        public string? Content { get; set; }
        public string? VideoUrl { get; set; }
        public int Order { get; set; }
    }

    public class CreateLessonDto
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Duration { get; set; }

        [Required]
        public string Type { get; set; }

        public string? Content { get; set; }
        public string? VideoUrl { get; set; }
        public int Order { get; set; }
    }

    public class CourseStatsDto
    {
        public int TotalStudents { get; set; }
        public decimal TotalRevenue { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public double CompletionRate { get; set; }
        public Dictionary<string, int> EnrollmentsByMonth { get; set; }
    }

    public class CourseDetailDto : CourseDto
    {
        public string? ShortDescription { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? PromoVideoUrl { get; set; }
        public string? InstructorAvatar { get; set; }
        public string? InstructorBio { get; set; }
        public int InstructorCourseCount { get; set; }
        public int InstructorStudentCount { get; set; }
        public List<CourseModuleDto> Modules { get; set; } = new();
        public List<ReviewDto> RecentReviews { get; set; } = new();
        
        // Go High Level specific fields
        public string? PricingModel { get; set; }
        public string? Currency { get; set; }
        public string? SubscriptionPeriod { get; set; }
        public PaymentPlanDetailsDto? PaymentPlanDetails { get; set; }
        public string? AccessType { get; set; }
        public int? AccessDuration { get; set; }
        public int? EnrollmentLimit { get; set; }
        public string? Language { get; set; }
        public CourseFeaturesDto? CourseFeatures { get; set; }
        public bool DripContent { get; set; }
        public DripScheduleDto? DripSchedule { get; set; }
        public AutomationSettingsDto? Automations { get; set; }
    }
    
    public class ReviewDto
    {
        public int Id { get; set; }
        public string StudentName { get; set; }
        public string StudentAvatar { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}