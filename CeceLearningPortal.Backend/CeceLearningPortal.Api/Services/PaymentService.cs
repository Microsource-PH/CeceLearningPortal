using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(
            ApplicationDbContext context, 
            INotificationService notificationService,
            ILogger<PaymentService> logger)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto paymentDto, string userId)
        {
            // Validate payment amount matches course price if it's a course payment
            if (paymentDto.CourseId.HasValue)
            {
                var course = await _context.Courses.FindAsync(paymentDto.CourseId.Value);
                if (course == null)
                {
                    throw new InvalidOperationException("Course not found");
                }

                // Ensure payment amount matches course price
                if (paymentDto.Amount != course.Price)
                {
                    _logger.LogWarning("Payment amount {Amount} does not match course price {Price} for course {CourseId}", 
                        paymentDto.Amount, course.Price, paymentDto.CourseId.Value);
                    throw new InvalidOperationException($"Payment amount must match course price of ${course.Price}");
                }
            }

            var payment = new Payment
            {
                UserId = userId,
                CourseId = paymentDto.CourseId,
                SubscriptionId = paymentDto.SubscriptionId,
                Amount = paymentDto.Amount,
                Currency = "USD",
                Status = PaymentStatus.Pending,
                PaymentMethod = Enum.Parse<PaymentMethod>(paymentDto.PaymentMethod),
                PaymentIntentId = paymentDto.PaymentIntentId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return await GetPaymentDtoAsync(payment.Id);
        }

        public async Task<PaymentDto> ProcessPaymentAsync(int paymentId, ProcessPaymentDto processDto)
        {
            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null) return null;

            // Validate payment amount one more time before processing
            if (payment.CourseId.HasValue && processDto.Status == "Completed")
            {
                var course = await _context.Courses.FindAsync(payment.CourseId.Value);
                if (course != null && payment.Amount != course.Price)
                {
                    _logger.LogError("Payment amount {Amount} does not match course price {Price} for payment {PaymentId}", 
                        payment.Amount, course.Price, paymentId);
                    payment.Status = PaymentStatus.Failed;
                    payment.ProcessedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    throw new InvalidOperationException("Payment amount does not match course price");
                }
            }

            payment.Status = Enum.Parse<PaymentStatus>(processDto.Status);
            payment.TransactionId = processDto.TransactionId;
            payment.ProcessedAt = DateTime.UtcNow;

            if (payment.Status == PaymentStatus.Completed)
            {
                // If it's a course payment, enroll the student
                if (payment.CourseId.HasValue)
                {
                    var enrollment = new Enrollment
                    {
                        StudentId = payment.UserId,
                        CourseId = payment.CourseId.Value,
                        EnrolledAt = DateTime.UtcNow,
                        ProgressPercentage = 0
                    };

                    _context.Enrollments.Add(enrollment);
                }

                // Send success notification
                await _notificationService.SendNotificationAsync(
                    payment.UserId,
                    "Payment Successful",
                    $"Your payment of ${payment.Amount} has been processed successfully.",
                    NotificationType.PaymentSuccess
                );
            }
            else if (payment.Status == PaymentStatus.Failed)
            {
                // Send failure notification
                await _notificationService.SendNotificationAsync(
                    payment.UserId,
                    "Payment Failed",
                    $"Your payment of ${payment.Amount} could not be processed. Reason: {processDto.FailureReason}",
                    NotificationType.PaymentFailed
                );
            }

            await _context.SaveChangesAsync();
            return await GetPaymentDtoAsync(payment.Id);
        }

        public async Task<PaymentDto> GetPaymentAsync(int paymentId, string userId)
        {
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.Id == paymentId && p.UserId == userId);

            if (payment == null) return null;

            return await GetPaymentDtoAsync(payment.Id);
        }

        public async Task<IEnumerable<PaymentDto>> GetUserPaymentsAsync(string userId)
        {
            var payments = await _context.Payments
                .Include(p => p.User)
                .Include(p => p.Course)
                .Include(p => p.Subscription)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaymentDto
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    UserName = p.User.FullName,
                    CourseId = p.CourseId,
                    CourseTitle = p.Course != null ? p.Course.Title : null,
                    SubscriptionId = p.SubscriptionId,
                    SubscriptionPlan = p.Subscription != null ? p.Subscription.PlanName : null,
                    Amount = p.Amount,
                    Currency = p.Currency,
                    Status = p.Status.ToString(),
                    PaymentMethod = p.PaymentMethod.ToString(),
                    TransactionId = p.TransactionId,
                    CreatedAt = p.CreatedAt,
                    ProcessedAt = p.ProcessedAt
                })
                .ToListAsync();

            return payments;
        }

        public async Task<bool> RefundPaymentAsync(int paymentId, RefundPaymentDto refundDto)
        {
            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null || payment.Status != PaymentStatus.Completed) return false;

            payment.Status = PaymentStatus.Refunded;
            
            // Create refund record (simplified)
            var refundAmount = refundDto.RefundAmount ?? payment.Amount;
            
            // If it's a course payment, potentially remove enrollment
            if (payment.CourseId.HasValue)
            {
                var enrollment = await _context.Enrollments
                    .FirstOrDefaultAsync(e => e.StudentId == payment.UserId && e.CourseId == payment.CourseId.Value);
                
                if (enrollment != null && enrollment.ProgressPercentage == 0)
                {
                    _context.Enrollments.Remove(enrollment);
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PaymentStatsDto> GetPaymentStatsAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.Payments.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(p => p.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(p => p.CreatedAt <= endDate.Value);

            var payments = await query.ToListAsync();

            var stats = new PaymentStatsDto
            {
                TotalRevenue = payments.Where(p => p.Status == PaymentStatus.Completed).Sum(p => p.Amount),
                TotalTransactions = payments.Count,
                SuccessfulTransactions = payments.Count(p => p.Status == PaymentStatus.Completed),
                FailedTransactions = payments.Count(p => p.Status == PaymentStatus.Failed),
                AverageTransactionAmount = payments.Any() ? payments.Average(p => p.Amount) : 0,
                RevenueByPaymentMethod = payments
                    .Where(p => p.Status == PaymentStatus.Completed)
                    .GroupBy(p => p.PaymentMethod.ToString())
                    .ToDictionary(g => g.Key, g => g.Sum(p => p.Amount)),
                RevenueByMonth = payments
                    .Where(p => p.Status == PaymentStatus.Completed)
                    .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
                    .ToDictionary(g => $"{g.Key.Year}-{g.Key.Month:D2}", g => g.Sum(p => p.Amount)),
                TopCoursesByRevenue = new List<TopCourseRevenueDto>()
            };

            return stats;
        }

        public async Task<SubscriptionDto> CreateSubscriptionAsync(CreateSubscriptionDto subscriptionDto, string userId)
        {
            var subscription = new Subscription
            {
                UserId = userId,
                PlanName = subscriptionDto.PlanName,
                Price = subscriptionDto.Price,
                BillingCycle = subscriptionDto.BillingCycle,
                Status = SubscriptionStatus.Active,
                StartDate = DateTime.UtcNow,
                NextBillingDate = subscriptionDto.BillingCycle == "Monthly" 
                    ? DateTime.UtcNow.AddMonths(1) 
                    : DateTime.UtcNow.AddYears(1),
                StripeSubscriptionId = subscriptionDto.StripeSubscriptionId
            };

            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            return await GetSubscriptionDtoAsync(subscription.Id);
        }

        public async Task<SubscriptionDto> CancelSubscriptionAsync(int subscriptionId, string userId)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.Id == subscriptionId && s.UserId == userId);

            if (subscription == null) return null;

            subscription.Status = SubscriptionStatus.Cancelled;
            subscription.EndDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetSubscriptionDtoAsync(subscription.Id);
        }

        public async Task<IEnumerable<SubscriptionDto>> GetUserSubscriptionsAsync(string userId)
        {
            var subscriptions = await _context.Subscriptions
                .Include(s => s.User)
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.StartDate)
                .Select(s => new SubscriptionDto
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    UserName = s.User.FullName,
                    PlanName = s.PlanName,
                    Price = s.Price,
                    BillingCycle = s.BillingCycle,
                    Status = s.Status.ToString(),
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    NextBillingDate = s.NextBillingDate
                })
                .ToListAsync();

            return subscriptions;
        }

        private async Task<PaymentDto> GetPaymentDtoAsync(int paymentId)
        {
            var payment = await _context.Payments
                .Include(p => p.User)
                .Include(p => p.Course)
                .Include(p => p.Subscription)
                .FirstOrDefaultAsync(p => p.Id == paymentId);

            if (payment == null) return null;

            return new PaymentDto
            {
                Id = payment.Id,
                UserId = payment.UserId,
                UserName = payment.User.FullName,
                CourseId = payment.CourseId,
                CourseTitle = payment.Course?.Title,
                SubscriptionId = payment.SubscriptionId,
                SubscriptionPlan = payment.Subscription?.PlanName,
                Amount = payment.Amount,
                Currency = payment.Currency,
                Status = payment.Status.ToString(),
                PaymentMethod = payment.PaymentMethod.ToString(),
                TransactionId = payment.TransactionId,
                CreatedAt = payment.CreatedAt,
                ProcessedAt = payment.ProcessedAt
            };
        }

        private async Task<SubscriptionDto> GetSubscriptionDtoAsync(int subscriptionId)
        {
            var subscription = await _context.Subscriptions
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == subscriptionId);

            if (subscription == null) return null;

            return new SubscriptionDto
            {
                Id = subscription.Id,
                UserId = subscription.UserId,
                UserName = subscription.User.FullName,
                PlanName = subscription.PlanName,
                Price = subscription.Price,
                BillingCycle = subscription.BillingCycle,
                Status = subscription.Status.ToString(),
                StartDate = subscription.StartDate,
                EndDate = subscription.EndDate,
                NextBillingDate = subscription.NextBillingDate
            };
        }
    }
}