namespace CeceLearningPortal.Api.Models
{
    public class Review
    {
        public int Id { get; set; }
        public string StudentId { get; set; }
        public int CourseId { get; set; }
        public int Rating { get; set; } // 1-5
        public string? Comment { get; set; }
        public ReviewStatus Status { get; set; } = ReviewStatus.Pending;
        public bool IsFlagged { get; set; } = false;
        public DateTime CreatedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? ApprovedBy { get; set; }

        // Navigation properties
        public virtual ApplicationUser Student { get; set; }
        public virtual Course Course { get; set; }
    }

    public enum ReviewStatus
    {
        Pending,
        Approved,
        Rejected
    }
}