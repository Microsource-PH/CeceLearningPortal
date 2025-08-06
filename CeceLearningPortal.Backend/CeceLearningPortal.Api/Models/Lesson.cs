namespace CeceLearningPortal.Api.Models
{
    public class Lesson
    {
        public int Id { get; set; }
        public int ModuleId { get; set; }
        public string Title { get; set; }
        public string Duration { get; set; }
        public LessonType Type { get; set; }
        public string? Content { get; set; }
        public string? VideoUrl { get; set; }
        public int Order { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual CourseModule Module { get; set; }
    }

    public enum LessonType
    {
        Video,
        Text,
        Quiz,
        Assignment
    }
}