using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public interface INotificationService
    {
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto notificationDto);
        Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId, bool unreadOnly = false);
        Task<bool> MarkAsReadAsync(int notificationId, string userId);
        Task<bool> MarkAllAsReadAsync(string userId);
        Task SendNotificationAsync(string userId, string title, string message, NotificationType type, string actionUrl = null);
        Task SendBulkNotificationAsync(IEnumerable<string> userIds, string title, string message, NotificationType type);
        Task SendRoleNotificationAsync(string role, string title, string message, NotificationType type);
    }
}