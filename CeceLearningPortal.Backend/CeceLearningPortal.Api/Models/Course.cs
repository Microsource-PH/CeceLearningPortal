namespace CeceLearningPortal.Api.Models
{
    public class Course
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string? ShortDescription { get; set; }
        public string InstructorId { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int? Discount { get; set; }
        public string? Duration { get; set; }
        public CourseLevel Level { get; set; }
        public string Category { get; set; }
        public string? Thumbnail { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? PromoVideoUrl { get; set; }
        public CourseStatus Status { get; set; } = CourseStatus.Draft;
        public bool IsBestseller { get; set; }
        public List<string> Features { get; set; } = new();
        public string? PreviewUrl { get; set; }
        public EnrollmentType EnrollmentType { get; set; }
        public bool IsPublished { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Go High Level specific fields
        public CourseType CourseType { get; set; } = CourseType.Custom;
        public PricingModel PricingModel { get; set; } = PricingModel.OneTime;
        public string Currency { get; set; } = "PHP";
        public SubscriptionPeriod? SubscriptionPeriod { get; set; }
        public string? PaymentPlanDetailsJson { get; set; } // Store as JSON
        public AccessType AccessType { get; set; } = AccessType.Lifetime;
        public int? AccessDuration { get; set; } // in days
        public int? EnrollmentLimit { get; set; }
        public string Language { get; set; } = "en";
        
        // Features flags
        public bool HasCertificate { get; set; }
        public bool HasCommunity { get; set; }
        public bool HasLiveSessions { get; set; }
        public bool HasDownloadableResources { get; set; }
        public bool HasAssignments { get; set; }
        public bool HasQuizzes { get; set; }
        
        // Drip content settings
        public bool DripContent { get; set; }
        public string? DripScheduleJson { get; set; } // Store as JSON
        
        // Automation settings
        public bool AutomationWelcomeEmail { get; set; } = true;
        public bool AutomationCompletionCertificate { get; set; } = true;
        public bool AutomationProgressReminders { get; set; } = true;
        public bool AutomationAbandonmentSequence { get; set; }

        // Navigation properties
        public virtual ApplicationUser Instructor { get; set; }
        public virtual ICollection<CourseModule> Modules { get; set; } = new List<CourseModule>();
        public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

        // Computed properties
        public int StudentsCount => Enrollments?.Count ?? 0;
        public double AverageRating => Reviews?.Any() == true ? Reviews.Average(r => r.Rating) : 0;
        public int LecturesCount => Modules?.Sum(m => m.Lessons?.Count ?? 0) ?? 0;
    }

    public enum CourseLevel
    {
        Beginner,
        Intermediate,
        Advanced,
        AllLevels
    }

    public enum CourseStatus
    {
        Draft,
        PendingApproval,
        Active,
        Inactive,
        Archived
    }

    public enum EnrollmentType
    {
        OneTime,
        Subscription
    }

    public enum CourseType
    {
        Sprint,
        Marathon,
        Membership,
        Custom
    }

    public enum PricingModel
    {
        Free,
        OneTime,
        Subscription,
        PaymentPlan
    }

    public enum SubscriptionPeriod
    {
        Monthly,
        Yearly
    }

    public enum AccessType
    {
        Lifetime,
        Limited
    }
}