using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CeceLearningPortal.Api.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            _logger.LogInformation($"User {userId} connected to notification hub");
            
            // Add user to their personal group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
            
            // Add user to role-based groups
            var userRole = Context.User?.FindFirst("role")?.Value;
            if (!string.IsNullOrEmpty(userRole))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"role-{userRole}");
            }
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.UserIdentifier;
            _logger.LogInformation($"User {userId} disconnected from notification hub");
            
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
            
            var userRole = Context.User?.FindFirst("role")?.Value;
            if (!string.IsNullOrEmpty(userRole))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"role-{userRole}");
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendNotificationToUser(string userId, string title, string message)
        {
            await Clients.Group($"user-{userId}").SendAsync("ReceiveNotification", new
            {
                Title = title,
                Message = message,
                Timestamp = DateTime.UtcNow
            });
        }

        public async Task SendNotificationToRole(string role, string title, string message)
        {
            await Clients.Group($"role-{role}").SendAsync("ReceiveNotification", new
            {
                Title = title,
                Message = message,
                Timestamp = DateTime.UtcNow
            });
        }

        public async Task MarkNotificationAsRead(int notificationId)
        {
            // This would typically update the database
            await Clients.Caller.SendAsync("NotificationRead", notificationId);
        }
    }
}