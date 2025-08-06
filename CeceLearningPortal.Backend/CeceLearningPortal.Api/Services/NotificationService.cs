using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Hubs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            ApplicationDbContext context, 
            IHubContext<NotificationHub> hubContext,
            ILogger<NotificationService> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto notificationDto)
        {
            var notification = new Notification
            {
                UserId = notificationDto.UserId,
                Title = notificationDto.Title,
                Message = notificationDto.Message,
                Type = Enum.Parse<NotificationType>(notificationDto.Type),
                ActionUrl = notificationDto.ActionUrl,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Send real-time notification
            await _hubContext.Clients.Group($"user-{notification.UserId}")
                .SendAsync("ReceiveNotification", new
                {
                    notification.Id,
                    notification.Title,
                    notification.Message,
                    Type = notification.Type.ToString(),
                    notification.ActionUrl,
                    notification.CreatedAt
                });

            return new NotificationDto
            {
                Id = notification.Id,
                UserId = notification.UserId,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type.ToString(),
                IsRead = notification.IsRead,
                ActionUrl = notification.ActionUrl,
                CreatedAt = notification.CreatedAt
            };
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId, bool unreadOnly = false)
        {
            var query = _context.Notifications
                .Where(n => n.UserId == userId);

            if (unreadOnly)
            {
                query = query.Where(n => !n.IsRead);
            }

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    UserId = n.UserId,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type.ToString(),
                    IsRead = n.IsRead,
                    ActionUrl = n.ActionUrl,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();

            return notifications;
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, string userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null) return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            // Notify via SignalR
            await _hubContext.Clients.Group($"user-{userId}")
                .SendAsync("NotificationRead", notificationId);

            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(string userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();

            // Notify via SignalR
            await _hubContext.Clients.Group($"user-{userId}")
                .SendAsync("AllNotificationsRead");

            return true;
        }

        public async Task SendNotificationAsync(string userId, string title, string message, NotificationType type, string actionUrl = null)
        {
            var notificationDto = new CreateNotificationDto
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = type.ToString(),
                ActionUrl = actionUrl
            };

            await CreateNotificationAsync(notificationDto);
        }

        public async Task SendBulkNotificationAsync(IEnumerable<string> userIds, string title, string message, NotificationType type)
        {
            var notifications = userIds.Select(userId => new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = type,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            }).ToList();

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();

            // Send real-time notifications
            foreach (var userId in userIds)
            {
                await _hubContext.Clients.Group($"user-{userId}")
                    .SendAsync("ReceiveNotification", new
                    {
                        Title = title,
                        Message = message,
                        Type = type.ToString(),
                        Timestamp = DateTime.UtcNow
                    });
            }
        }

        public async Task SendRoleNotificationAsync(string role, string title, string message, NotificationType type)
        {
            await _hubContext.Clients.Group($"role-{role}")
                .SendAsync("ReceiveNotification", new
                {
                    Title = title,
                    Message = message,
                    Type = type.ToString(),
                    Timestamp = DateTime.UtcNow
                });

            // Also save to database for users in that role
            var userIds = await _context.Users
                .Where(u => u.Role.ToString() == role)
                .Select(u => u.Id)
                .ToListAsync();

            await SendBulkNotificationAsync(userIds, title, message, type);
        }
    }
}