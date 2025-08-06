using System;

namespace CeceLearningPortal.Api.Models
{
    public class CourseApproval
    {
        public Guid Id { get; set; }
        public int CourseId { get; set; }
        public string SubmittedById { get; set; } = string.Empty;
        public string? ReviewedById { get; set; }
        public string Status { get; set; } = "pending"; // pending, approved, rejected, revision_requested
        public string? Feedback { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public Course Course { get; set; } = null!;
        public ApplicationUser SubmittedBy { get; set; } = null!;
        public ApplicationUser? ReviewedBy { get; set; }
    }
}