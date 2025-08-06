namespace CeceLearningPortal.Api.Models
{
    public class PasswordHistory
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string PasswordHash { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser User { get; set; }
    }
}