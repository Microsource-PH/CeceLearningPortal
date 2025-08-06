using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.DTOs
{
    public class PaymentDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public int? CourseId { get; set; }
        public string? CourseTitle { get; set; }
        public int? SubscriptionId { get; set; }
        public string? SubscriptionPlan { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Status { get; set; }
        public string PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
    }

    public class CreatePaymentDto
    {
        public int? CourseId { get; set; }
        public int? SubscriptionId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public string PaymentMethod { get; set; }

        public string? PaymentIntentId { get; set; }
    }

    public class ProcessPaymentDto
    {
        [Required]
        public string TransactionId { get; set; }

        [Required]
        public string Status { get; set; } // Completed, Failed

        public string? FailureReason { get; set; }
    }

    public class RefundPaymentDto
    {
        [Required]
        public string Reason { get; set; }

        public decimal? RefundAmount { get; set; } // Partial refund if specified
    }

    public class PaymentStatsDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalTransactions { get; set; }
        public int SuccessfulTransactions { get; set; }
        public int FailedTransactions { get; set; }
        public decimal AverageTransactionAmount { get; set; }
        public Dictionary<string, decimal> RevenueByPaymentMethod { get; set; }
        public Dictionary<string, decimal> RevenueByMonth { get; set; }
        public List<TopCourseRevenueDto> TopCoursesByRevenue { get; set; }
    }

    public class TopCourseRevenueDto
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalSales { get; set; }
    }

    public class SubscriptionDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string PlanName { get; set; }
        public decimal Price { get; set; }
        public string BillingCycle { get; set; }
        public string Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? NextBillingDate { get; set; }
    }

    public class CreateSubscriptionDto
    {
        [Required]
        public string PlanName { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        public string BillingCycle { get; set; } // Monthly, Yearly

        public string? StripeSubscriptionId { get; set; }
    }
}