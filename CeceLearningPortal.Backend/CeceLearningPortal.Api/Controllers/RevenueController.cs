using Microsoft.AspNetCore.Mvc;
using CeceLearningPortal.Api.Services;
using CeceLearningPortal.Api.DTOs;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RevenueController : ControllerBase
    {
        private readonly IRevenueCalculationService _revenueService;
        private readonly ILogger<RevenueController> _logger;

        public RevenueController(IRevenueCalculationService revenueService, ILogger<RevenueController> logger)
        {
            _revenueService = revenueService;
            _logger = logger;
        }

        [HttpGet("instructor/{instructorId}")]
        public async Task<IActionResult> GetInstructorRevenue(string instructorId)
        {
            try
            {
                var revenue = await _revenueService.CalculateInstructorRevenueAsync(instructorId);
                if (revenue == null)
                {
                    return NotFound(new { message = "Instructor not found" });
                }

                return Ok(revenue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating instructor revenue for {InstructorId}", instructorId);
                return StatusCode(500, new { message = "An error occurred while calculating revenue" });
            }
        }

        [HttpGet("courses/{instructorId}")]
        public async Task<IActionResult> GetCourseRevenues(string instructorId)
        {
            try
            {
                var courseRevenues = await _revenueService.CalculateCourseRevenuesAsync(instructorId);
                return Ok(courseRevenues);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating course revenues for {InstructorId}", instructorId);
                return StatusCode(500, new { message = "An error occurred while calculating course revenues" });
            }
        }

        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetCourseSubscriptionRevenue(int courseId)
        {
            try
            {
                var subscriptionRevenue = await _revenueService.CalculateSubscriptionRevenueForCourseAsync(courseId);
                return Ok(new { courseId, subscriptionRevenue });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating subscription revenue for course {CourseId}", courseId);
                return StatusCode(500, new { message = "An error occurred while calculating subscription revenue" });
            }
        }
    }
}