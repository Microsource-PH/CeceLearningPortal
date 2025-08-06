using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.DTOs
{
    public class EnrollmentDto
    {
        public int Id { get; set; }
        public string StudentId { get; set; }
        public string StudentName { get; set; }
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public string CourseThumbnail { get; set; }
        public string InstructorName { get; set; }
        public DateTime EnrolledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public double ProgressPercentage { get; set; }
        public string? CertificateUrl { get; set; }
    }

    public class LessonProgressDto
    {
        public int LessonId { get; set; }
        public string LessonTitle { get; set; }
        public string Status { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? QuizScore { get; set; }
        public string? AssignmentSubmissionUrl { get; set; }
    }

    public class UpdateLessonProgressDto
    {
        [Required]
        public string Status { get; set; } // InProgress, Completed

        public int? QuizScore { get; set; }
        public string? AssignmentSubmissionUrl { get; set; }
    }

    public class CourseProgressDto
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public double OverallProgress { get; set; }
        public int TotalLessons { get; set; }
        public int CompletedLessons { get; set; }
        public int InProgressLessons { get; set; }
        public List<ModuleProgressDto> ModuleProgress { get; set; }
    }

    public class ModuleProgressDto
    {
        public int ModuleId { get; set; }
        public string ModuleTitle { get; set; }
        public double Progress { get; set; }
        public int TotalLessons { get; set; }
        public int CompletedLessons { get; set; }
        public List<LessonProgressDto> Lessons { get; set; }
    }

    public class CertificateDto
    {
        public string StudentName { get; set; }
        public string CourseTitle { get; set; }
        public string InstructorName { get; set; }
        public DateTime CompletionDate { get; set; }
        public string CertificateId { get; set; }
        public string CertificateUrl { get; set; }
    }

    public class StudentStatsDto
    {
        public int CoursesEnrolled { get; set; }
        public int CoursesCompleted { get; set; }
        public int CoursesInProgress { get; set; }
        public int CertificatesEarned { get; set; }
        public double AverageProgress { get; set; }
        public int TotalLearningHours { get; set; }
        public Dictionary<string, int> CoursesByCategory { get; set; }
        public List<RecentActivityDto> RecentActivities { get; set; }
    }

    public class RecentActivityDto
    {
        public string Type { get; set; } // LessonCompleted, CourseEnrolled, CertificateEarned
        public string Description { get; set; }
        public DateTime Timestamp { get; set; }
    }
}