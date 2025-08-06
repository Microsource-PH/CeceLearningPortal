using System;
using System.Collections.Generic;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.DTOs
{
    public class SubscriptionPlanDto
    {
        public string Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public List<string> Features { get; set; } = new List<string>();
        public Dictionary<string, object> Limits { get; set; } = new Dictionary<string, object>();
        public bool IsActive { get; set; }
        public int SubscriberCount { get; set; }
        public decimal Revenue { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateSubscriptionPlanDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = string.Empty;
        public SubscriptionPlanType PlanType { get; set; }
        public decimal Price { get; set; }
        public decimal MonthlyPrice { get; set; }
        public decimal YearlyPrice { get; set; }
        public string Currency { get; set; } = "USD";
        public List<string> Features { get; set; } = new List<string>();
        public Dictionary<string, object> Limits { get; set; } = new Dictionary<string, object>();
        
        // Learner-specific properties
        public int MaxCourseAccess { get; set; }
        public bool HasUnlimitedAccess { get; set; }
        
        // Creator-specific properties
        public int? MaxCoursesCanCreate { get; set; }
        public int? MaxStudentsPerCourse { get; set; }
        public decimal? TransactionFeePercentage { get; set; }
        public bool HasAnalytics { get; set; }
        public bool HasPrioritySupport { get; set; }
        
        public int DisplayOrder { get; set; }
        public bool IsRecommended { get; set; }
    }

    public class UpdateSubscriptionPlanDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Type { get; set; }
        public string? BillingCycle { get; set; }
        public decimal? Price { get; set; }
        public decimal? MonthlyPrice { get; set; }
        public decimal? YearlyPrice { get; set; }
        public string? Currency { get; set; }
        public List<string>? Features { get; set; }
        public Dictionary<string, object>? Limits { get; set; }
        public bool? IsActive { get; set; }
        
        // Learner-specific properties
        public int? MaxCourseAccess { get; set; }
        public bool? HasUnlimitedAccess { get; set; }
        
        // Creator-specific properties
        public int? MaxCoursesCanCreate { get; set; }
        public int? MaxStudentsPerCourse { get; set; }
        public decimal? TransactionFeePercentage { get; set; }
        public bool? HasAnalytics { get; set; }
        public bool? HasPrioritySupport { get; set; }
        
        public int? DisplayOrder { get; set; }
        public bool? IsRecommended { get; set; }
    }
}