namespace CeceLearningPortal.Api.Models
{
    public class Enrollment
    {
        public int Id { get; set; }
        public string StudentId { get; set; }
        public int CourseId { get; set; }
        public DateTime EnrolledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public double ProgressPercentage { get; set; }
        public string? CertificateUrl { get; set; }
        
        // Additional properties for learning tracking
        public int CompletedLessons { get; set; }
        public int TotalTimeSpent { get; set; } // in minutes
        public DateTime? LastAccessedDate { get; set; }
        public double? AverageQuizScore { get; set; }
        public int? QuizCount { get; set; }
        public bool CertificateIssued { get; set; }

        // Navigation properties
        public virtual ApplicationUser Student { get; set; }
        public virtual Course Course { get; set; }
    }
}