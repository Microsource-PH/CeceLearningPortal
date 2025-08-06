namespace CeceLearningPortal.Api.Models
{
    public class LessonProgress
    {
        public int Id { get; set; }
        public string StudentId { get; set; }
        public int LessonId { get; set; }
        public ProgressStatus Status { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? QuizScore { get; set; }
        public string? AssignmentSubmissionUrl { get; set; }

        // Navigation properties
        public virtual ApplicationUser Student { get; set; }
        public virtual Lesson Lesson { get; set; }
    }

    public enum ProgressStatus
    {
        NotStarted,
        InProgress,
        Completed
    }
}