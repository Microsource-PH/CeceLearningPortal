namespace CeceLearningPortal.Api.DTOs
{
    public class CourseApprovalDto
    {
        public int CourseId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Feedback { get; set; }
    }

}