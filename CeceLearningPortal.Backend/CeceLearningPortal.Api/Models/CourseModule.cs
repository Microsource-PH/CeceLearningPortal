namespace CeceLearningPortal.Api.Models
{
    public class CourseModule
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int Order { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual Course Course { get; set; }
        public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    }
}