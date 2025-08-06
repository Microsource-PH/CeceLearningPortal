namespace CeceLearningPortal.Api.Models
{
    public class InstructorApproval
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Bio { get; set; }
        public string Qualifications { get; set; }
        public string TeachingExperience { get; set; }
        public string? LinkedInProfile { get; set; }
        public string? WebsiteUrl { get; set; }
        public ApprovalStatus Status { get; set; } = ApprovalStatus.Pending;
        public string? ReviewerNotes { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedBy { get; set; }

        // Navigation properties
        public virtual ApplicationUser User { get; set; }
    }

    public enum ApprovalStatus
    {
        Pending,
        Approved,
        Rejected,
        MoreInfoRequired
    }
}