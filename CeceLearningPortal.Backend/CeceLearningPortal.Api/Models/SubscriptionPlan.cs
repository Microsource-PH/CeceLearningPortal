namespace CeceLearningPortal.Api.Models
{
    public class SubscriptionPlan
    {
        public int Id { get; set; }
        public string Name { get; set; } // Free, Basic, Premium, Enterprise
        public string Description { get; set; }
        public SubscriptionPlanType PlanType { get; set; } // Learner or Creator
        public decimal MonthlyPrice { get; set; }
        public decimal YearlyPrice { get; set; }
        
        // Learner-specific properties
        public int MaxCourseAccess { get; set; } // -1 for unlimited
        public bool HasUnlimitedAccess { get; set; }
        
        // Creator-specific properties
        public int? MaxCoursesCanCreate { get; set; } // null for unlimited
        public int? MaxStudentsPerCourse { get; set; } // null for unlimited
        public decimal? TransactionFeePercentage { get; set; } // Platform fee percentage for creators
        public bool HasAnalytics { get; set; }
        public bool HasPrioritySupport { get; set; }
        
        public List<string> Features { get; set; } = new List<string>();
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsRecommended { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    }

    public enum SubscriptionPlanType
    {
        Learner,
        Creator
    }
}