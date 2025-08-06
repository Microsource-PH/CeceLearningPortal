using CeceLearningPortal.Api.DTOs;

namespace CeceLearningPortal.Api.Services
{
    public interface IRevenueCalculationService
    {
        Task<InstructorRevenueDto> CalculateInstructorRevenueAsync(string instructorId);
        Task<List<CourseRevenueDto>> CalculateCourseRevenuesAsync(string instructorId);
        Task<decimal> CalculateSubscriptionRevenueForCourseAsync(int courseId);
    }
}