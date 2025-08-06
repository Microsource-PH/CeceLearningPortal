namespace CeceLearningPortal.Api.DTOs
{
    public class InstructorRevenueDto
    {
        public string InstructorId { get; set; }
        public string InstructorName { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal CreatorRevenue { get; set; } // 80% of total revenue
        public decimal PlatformRevenue { get; set; } // 20% of total revenue
        public decimal DirectSalesRevenue { get; set; }
        public decimal SubscriptionRevenue { get; set; }
        public int TotalCourses { get; set; }
        public List<CourseRevenueDto> CourseRevenues { get; set; } = new List<CourseRevenueDto>();
    }

    public class CourseRevenueDto
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public decimal CoursePrice { get; set; }
        public decimal DirectSalesRevenue { get; set; }
        public decimal SubscriptionRevenue { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal CreatorRevenue { get; set; } // 80% of total revenue
        public decimal PlatformRevenue { get; set; } // 20% of total revenue
        public int TotalEnrollments { get; set; }
        public int DirectPurchaseEnrollments { get; set; }
        public int SubscriptionEnrollments { get; set; }
    }
}