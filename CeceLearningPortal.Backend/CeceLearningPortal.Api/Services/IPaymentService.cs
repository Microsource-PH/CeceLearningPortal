using CeceLearningPortal.Api.DTOs;

namespace CeceLearningPortal.Api.Services
{
    public interface IPaymentService
    {
        Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto paymentDto, string userId);
        Task<PaymentDto> ProcessPaymentAsync(int paymentId, ProcessPaymentDto processDto);
        Task<PaymentDto> GetPaymentAsync(int paymentId, string userId);
        Task<IEnumerable<PaymentDto>> GetUserPaymentsAsync(string userId);
        Task<bool> RefundPaymentAsync(int paymentId, RefundPaymentDto refundDto);
        Task<PaymentStatsDto> GetPaymentStatsAsync(DateTime? startDate = null, DateTime? endDate = null);
        Task<SubscriptionDto> CreateSubscriptionAsync(CreateSubscriptionDto subscriptionDto, string userId);
        Task<SubscriptionDto> CancelSubscriptionAsync(int subscriptionId, string userId);
        Task<IEnumerable<SubscriptionDto>> GetUserSubscriptionsAsync(string userId);
    }
}