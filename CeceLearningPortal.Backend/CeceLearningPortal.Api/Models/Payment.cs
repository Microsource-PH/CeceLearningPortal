namespace CeceLearningPortal.Api.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int? CourseId { get; set; }
        public int? SubscriptionId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public PaymentStatus Status { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public string? PaymentIntentId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser User { get; set; }
        public virtual Course? Course { get; set; }
        public virtual Subscription? Subscription { get; set; }
    }

    public enum PaymentStatus
    {
        Pending,
        Processing,
        Completed,
        Failed,
        Refunded
    }

    public enum PaymentMethod
    {
        CreditCard,
        DebitCard,
        PayPal,
        Stripe,
        BankTransfer
    }
}