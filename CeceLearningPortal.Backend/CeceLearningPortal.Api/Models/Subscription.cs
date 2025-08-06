namespace CeceLearningPortal.Api.Models
{
    public class Subscription
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int SubscriptionPlanId { get; set; }
        public string PlanName { get; set; } // Keep for backward compatibility
        public decimal Price { get; set; }
        public string BillingCycle { get; set; } // Monthly, Yearly
        public SubscriptionStatus Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? NextBillingDate { get; set; }
        public string? StripeSubscriptionId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser User { get; set; }
        public virtual SubscriptionPlan SubscriptionPlan { get; set; }
    }

    public enum SubscriptionStatus
    {
        Active,
        Cancelled,
        Expired,
        Suspended
    }
}