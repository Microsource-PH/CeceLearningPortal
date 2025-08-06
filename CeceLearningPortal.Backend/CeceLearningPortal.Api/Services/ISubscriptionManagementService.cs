using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public interface ISubscriptionManagementService
    {
        // Subscription Plan Management
        Task<IEnumerable<SubscriptionPlanManagementDto>> GetSubscriptionPlansAsync(SubscriptionPlanType? planType = null);
        Task<SubscriptionPlanManagementDto> GetSubscriptionPlanByIdAsync(int planId);
        Task<SubscriptionPlanManagementDto> CreateSubscriptionPlanAsync(CreateSubscriptionPlanDto createDto);
        Task<SubscriptionPlanManagementDto> UpdateSubscriptionPlanAsync(UpdateSubscriptionPlanDto updateDto);
        Task<bool> DeleteSubscriptionPlanAsync(int planId);
        Task<bool> TogglePlanStatusAsync(int planId, bool isActive);
        
        // Subscriber Management
        Task<IEnumerable<SubscriberManagementDto>> GetSubscribersAsync(SubscriberFilterDto filter);
        Task<SubscriberManagementDto> GetSubscriberByIdAsync(int subscriptionId);
        Task<bool> UpdateSubscriberAsync(UpdateSubscriberDto updateDto, string adminId);
        Task<bool> CancelSubscriptionAsync(int subscriptionId, string reason, string adminId);
        
        // Statistics
        Task<SubscriptionStatisticsDto> GetSubscriptionStatisticsAsync();
        Task<Dictionary<string, decimal>> CalculateMonthlyRecurringRevenueAsync();
        
        // Course Management
        Task<IEnumerable<AdminCourseManagementDto>> GetCoursesForManagementAsync(CourseManagementFilterDto filter);
        Task<AdminCourseManagementDto> GetCourseByIdForManagementAsync(int courseId);
        Task<AdminCourseManagementDto> CreateCourseAsync(AdminCreateCourseDto createDto);
        Task<AdminCourseManagementDto> UpdateCourseAsync(AdminUpdateCourseDto updateDto);
        Task<bool> DeleteCourseAsync(int courseId, string adminId);
        Task<bool> ApproveCourseAsync(ApproveCourseDto approveDto, string adminId);
        Task<CourseManagementStatsDto> GetCourseManagementStatsAsync();
        
        // Notifications
        Task NotifySubscriptionChangeAsync(string userId, string changeType, string details);
        Task NotifyCourseApprovalAsync(string instructorId, int courseId, bool approved, string reason = null);
    }
}