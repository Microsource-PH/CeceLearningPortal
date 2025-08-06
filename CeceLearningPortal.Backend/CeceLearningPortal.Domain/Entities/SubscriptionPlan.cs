using System;
using System.Collections.Generic;

namespace CeceLearningPortal.Domain.Entities
{
    public class SubscriptionPlan
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // learner or creator
        public string BillingCycle { get; set; } = string.Empty; // monthly, quarterly, yearly, lifetime
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public List<string> Features { get; set; } = new List<string>();
        public Dictionary<string, object> Limits { get; set; } = new Dictionary<string, object>();
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    }
}