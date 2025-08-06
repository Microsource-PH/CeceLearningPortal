using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }
        public bool IsRead { get; set; }
        public string? ActionUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateNotificationDto
    {
        [Required]
        public string UserId { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Message { get; set; }

        [Required]
        public string Type { get; set; }

        public string? ActionUrl { get; set; }
    }
}