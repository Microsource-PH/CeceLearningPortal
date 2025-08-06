namespace CeceLearningPortal.Api.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public NotificationType Type { get; set; }
        public bool IsRead { get; set; }
        public string? ActionUrl { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser User { get; set; }
    }

    public enum NotificationType
    {
        General,
        CourseEnrollment,
        CourseUpdate,
        PaymentSuccess,
        PaymentFailed,
        ReviewReceived,
        InstructorApproval,
        SystemAlert,
        AccountUpdate
    }
}