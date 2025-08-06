using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Services;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EnrollmentsController : ControllerBase
    {
        private readonly IEnrollmentService _enrollmentService;
        private readonly ILogger<EnrollmentsController> _logger;

        public EnrollmentsController(IEnrollmentService enrollmentService, ILogger<EnrollmentsController> logger)
        {
            _enrollmentService = enrollmentService;
            _logger = logger;
        }

        [HttpPost("courses/{courseId}")]
        public async Task<IActionResult> EnrollInCourse(int courseId)
        {
            try
            {
                var studentId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(studentId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }
                var enrollment = await _enrollmentService.EnrollInCourseAsync(courseId, studentId);
                return Ok(enrollment);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error enrolling in course {courseId}");
                return StatusCode(500, new { message = "An error occurred while enrolling in the course" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetMyEnrollments()
        {
            try
            {
                var studentId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var enrollments = await _enrollmentService.GetStudentEnrollmentsAsync(studentId);
                return Ok(enrollments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving enrollments");
                return StatusCode(500, new { message = "An error occurred while retrieving enrollments" });
            }
        }

        [HttpGet("{enrollmentId}")]
        public async Task<IActionResult> GetEnrollment(int enrollmentId)
        {
            try
            {
                var studentId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var enrollment = await _enrollmentService.GetEnrollmentAsync(enrollmentId, studentId);
                
                if (enrollment == null)
                {
                    return NotFound(new { message = "Enrollment not found" });
                }
                
                return Ok(enrollment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving enrollment {enrollmentId}");
                return StatusCode(500, new { message = "An error occurred while retrieving the enrollment" });
            }
        }

        [HttpPut("lessons/{lessonId}/progress")]
        public async Task<IActionResult> UpdateLessonProgress(int lessonId, [FromBody] UpdateLessonProgressDto progressDto)
        {
            try
            {
                var studentId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var result = await _enrollmentService.UpdateLessonProgressAsync(lessonId, studentId, progressDto);
                
                if (!result)
                {
                    return NotFound(new { message = "Lesson not found or you're not enrolled in the course" });
                }
                
                return Ok(new { message = "Lesson progress updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating progress for lesson {lessonId}");
                return StatusCode(500, new { message = "An error occurred while updating lesson progress" });
            }
        }

        [HttpGet("lessons/{lessonId}/progress")]
        public async Task<IActionResult> GetLessonProgress(int lessonId)
        {
            try
            {
                var studentId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var progress = await _enrollmentService.GetLessonProgressAsync(lessonId, studentId);
                
                if (progress == null)
                {
                    return NotFound(new { message = "Lesson progress not found" });
                }
                
                return Ok(progress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving progress for lesson {lessonId}");
                return StatusCode(500, new { message = "An error occurred while retrieving lesson progress" });
            }
        }

        [HttpGet("courses/{courseId}/progress")]
        public async Task<IActionResult> GetCourseProgress(int courseId)
        {
            try
            {
                var studentId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var progress = await _enrollmentService.GetCourseProgressAsync(courseId, studentId);
                
                if (progress == null)
                {
                    return NotFound(new { message = "Course progress not found or you're not enrolled" });
                }
                
                return Ok(progress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving progress for course {courseId}");
                return StatusCode(500, new { message = "An error occurred while retrieving course progress" });
            }
        }

        [HttpPost("courses/{courseId}/certificate")]
        public async Task<IActionResult> GenerateCertificate(int courseId)
        {
            try
            {
                var studentId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var certificate = await _enrollmentService.GenerateCertificateAsync(courseId, studentId);
                return Ok(certificate);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating certificate for course {courseId}");
                return StatusCode(500, new { message = "An error occurred while generating the certificate" });
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetMyStats()
        {
            try
            {
                var studentId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var stats = await _enrollmentService.GetStudentStatsAsync(studentId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student stats");
                return StatusCode(500, new { message = "An error occurred while retrieving student stats" });
            }
        }
    }
}