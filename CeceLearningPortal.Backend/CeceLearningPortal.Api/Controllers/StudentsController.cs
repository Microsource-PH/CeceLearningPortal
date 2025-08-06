using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;
using System.Security.Claims;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<StudentsController> _logger;

        public StudentsController(ApplicationDbContext context, ILogger<StudentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("courses")]
        public async Task<IActionResult> GetEnrolledCourses()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                var enrollments = await _context.Enrollments
                    .Include(e => e.Course)
                        .ThenInclude(c => c.Instructor)
                    .Include(e => e.Course)
                        .ThenInclude(c => c.Modules)
                        .ThenInclude(m => m.Lessons)
                    .Where(e => e.StudentId == userId)
                    .OrderByDescending(e => e.LastAccessedDate ?? e.EnrolledAt)
                    .ToListAsync();

                var enrolledCourses = enrollments.Select(e => new
                {
                    id = e.Id,
                    courseId = e.CourseId,
                    title = e.Course.Title,
                    instructor = e.Course.Instructor?.FullName ?? "Unknown Instructor",
                    thumbnail = e.Course.Thumbnail ?? "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop&auto=format",
                    progress = Math.Round(e.ProgressPercentage, 2),
                    status = e.ProgressPercentage >= 100 ? "completed" : 
                            e.ProgressPercentage > 0 ? "in_progress" : "not_started",
                    enrolledAt = e.EnrolledAt,
                    lastAccessedAt = e.LastAccessedDate,
                    completedAt = e.CompletedAt,
                    certificateUrl = e.CertificateUrl,
                    totalLessons = e.Course.Modules.Sum(m => m.Lessons.Count),
                    completedLessons = e.CompletedLessons,
                    nextLesson = GetNextLesson(e)
                }).ToList();

                return Ok(enrolledCourses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving enrolled courses");
                return StatusCode(500, new { message = "An error occurred while retrieving enrolled courses" });
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStudentStats()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                var enrollments = await _context.Enrollments
                    .Include(e => e.Course)
                    .Where(e => e.StudentId == userId)
                    .ToListAsync();

                var payments = await _context.Payments
                    .Where(p => p.UserId == userId && p.Status == Models.PaymentStatus.Completed)
                    .ToListAsync();

                var stats = new
                {
                    totalCourses = enrollments.Count,
                    completedCourses = enrollments.Count(e => e.CompletedAt.HasValue),
                    inProgressCourses = enrollments.Count(e => e.ProgressPercentage > 0 && e.ProgressPercentage < 100),
                    totalCertificates = enrollments.Count(e => e.CertificateIssued),
                    totalSpent = payments.Sum(p => p.Amount),
                    learningHours = Math.Round(enrollments.Sum(e => e.TotalTimeSpent) / 60.0, 2),
                    currentStreak = await GetCurrentStreak(userId),
                    longestStreak = await GetLongestStreak(userId),
                    averageScore = enrollments.Where(e => e.AverageQuizScore.HasValue)
                        .Select(e => e.AverageQuizScore.Value)
                        .DefaultIfEmpty(0)
                        .Average()
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student stats");
                return StatusCode(500, new { message = "An error occurred while retrieving student stats" });
            }
        }

        [HttpGet("courses/{courseId}/progress")]
        public async Task<IActionResult> GetCourseProgress(int courseId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                var enrollment = await _context.Enrollments
                    .Include(e => e.Course)
                        .ThenInclude(c => c.Modules)
                        .ThenInclude(m => m.Lessons)
                    .FirstOrDefaultAsync(e => e.StudentId == userId && e.CourseId == courseId);

                if (enrollment == null)
                {
                    return NotFound(new { message = "Course enrollment not found" });
                }

                var moduleProgress = enrollment.Course.Modules
                    .OrderBy(m => m.Order)
                    .Select(m => new
                    {
                        id = m.Id,
                        title = m.Title,
                        order = m.Order,
                        lessons = m.Lessons.OrderBy(l => l.Order).Select(l => new
                        {
                            id = l.Id,
                            title = l.Title,
                            type = l.Type.ToString().ToLower(),
                            duration = l.Duration,
                            isCompleted = IsLessonCompleted(userId, l.Id),
                            completedAt = GetLessonCompletionDate(userId, l.Id)
                        }),
                        progress = CalculateModuleProgress(userId, m)
                    });

                var result = new
                {
                    courseId = enrollment.CourseId,
                    enrollmentId = enrollment.Id,
                    modules = moduleProgress,
                    overallProgress = enrollment.ProgressPercentage,
                    lastAccessedLessonId = GetLastAccessedLessonId(userId, courseId)
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving course progress for course {courseId}");
                return StatusCode(500, new { message = "An error occurred while retrieving course progress" });
            }
        }

        [HttpPut("lessons/{lessonId}/progress")]
        public async Task<IActionResult> UpdateLessonProgress(int lessonId, [FromBody] UpdateLessonProgressDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                // Get the lesson and its course
                var lesson = await _context.Lessons
                    .Include(l => l.Module)
                        .ThenInclude(m => m.Course)
                    .FirstOrDefaultAsync(l => l.Id == lessonId);

                if (lesson == null)
                {
                    return NotFound(new { message = "Lesson not found" });
                }

                // Check if user is enrolled in the course
                var enrollment = await _context.Enrollments
                    .FirstOrDefaultAsync(e => e.StudentId == userId && e.CourseId == lesson.Module.CourseId);

                if (enrollment == null)
                {
                    return Forbid("You are not enrolled in this course");
                }

                // Update or create lesson progress
                var lessonProgress = await _context.LessonProgresses
                    .FirstOrDefaultAsync(lp => lp.StudentId == userId && lp.LessonId == lessonId);

                if (lessonProgress == null)
                {
                    lessonProgress = new Models.LessonProgress
                    {
                        StudentId = userId,
                        LessonId = lessonId,
                        StartedAt = DateTime.UtcNow
                    };
                    _context.LessonProgresses.Add(lessonProgress);
                }

                lessonProgress.Status = dto.Status == "completed" 
                    ? ProgressStatus.Completed 
                    : ProgressStatus.InProgress;
                
                if (dto.Status == "completed")
                {
                    lessonProgress.CompletedAt = DateTime.UtcNow;
                    enrollment.CompletedLessons++;
                }

                // Update last accessed through enrollment
                // lessonProgress doesn't have LastAccessedAt property
                enrollment.LastAccessedDate = DateTime.UtcNow;

                // Recalculate progress
                var totalLessons = lesson.Module.Course.Modules.Sum(m => m.Lessons.Count);
                enrollment.ProgressPercentage = (enrollment.CompletedLessons * 100.0) / totalLessons;

                // Check if course is completed
                if (enrollment.ProgressPercentage >= 100 && !enrollment.CompletedAt.HasValue)
                {
                    enrollment.CompletedAt = DateTime.UtcNow;
                    enrollment.CertificateIssued = true;
                    enrollment.CertificateUrl = $"/api/certificates/{enrollment.Id}";
                }

                await _context.SaveChangesAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating lesson progress for lesson {lessonId}");
                return StatusCode(500, new { message = "An error occurred while updating lesson progress" });
            }
        }

        [HttpGet("activity")]
        public async Task<IActionResult> GetLearningActivity([FromQuery] int limit = 10)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                // Get recent lesson progress
                var recentActivities = await _context.LessonProgresses
                    .Include(lp => lp.Lesson)
                        .ThenInclude(l => l.Module)
                        .ThenInclude(m => m.Course)
                    .Where(lp => lp.StudentId == userId)
                    .OrderByDescending(lp => lp.StartedAt)
                    .Take(limit)
                    .Select(lp => new
                    {
                        id = Guid.NewGuid().ToString(),
                        type = lp.Status == ProgressStatus.Completed ? "lesson_completed" : "lesson_progress",
                        title = lp.Status == ProgressStatus.Completed 
                            ? $"Completed lesson: {lp.Lesson.Title}"
                            : $"Started lesson: {lp.Lesson.Title}",
                        description = $"In course: {lp.Lesson.Module.Course.Title}",
                        timestamp = lp.StartedAt ?? DateTime.UtcNow,
                        courseId = lp.Lesson.Module.CourseId,
                        courseName = lp.Lesson.Module.Course.Title
                    })
                    .ToListAsync();

                return Ok(recentActivities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving learning activity");
                return StatusCode(500, new { message = "An error occurred while retrieving learning activity" });
            }
        }

        [HttpGet("certificates")]
        public async Task<IActionResult> GetCertificates()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                var certificates = await _context.Enrollments
                    .Include(e => e.Course)
                        .ThenInclude(c => c.Instructor)
                    .Where(e => e.StudentId == userId && e.CertificateIssued)
                    .Select(e => new
                    {
                        id = e.Id,
                        courseId = e.CourseId,
                        courseName = e.Course.Title,
                        instructorName = e.Course.Instructor.FullName,
                        completedAt = e.CompletedAt,
                        certificateUrl = e.CertificateUrl,
                        grade = e.AverageQuizScore.HasValue ? GetGrade(e.AverageQuizScore.Value) : "Pass"
                    })
                    .ToListAsync();

                return Ok(certificates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving certificates");
                return StatusCode(500, new { message = "An error occurred while retrieving certificates" });
            }
        }

        // Helper methods
        private object GetNextLesson(Models.Enrollment enrollment)
        {
            // Find the next uncompleted lesson
            foreach (var module in enrollment.Course.Modules.OrderBy(m => m.Order))
            {
                foreach (var lesson in module.Lessons.OrderBy(l => l.Order))
                {
                    if (!IsLessonCompleted(enrollment.StudentId, lesson.Id))
                    {
                        return new
                        {
                            id = lesson.Id,
                            title = lesson.Title,
                            type = lesson.Type.ToString().ToLower()
                        };
                    }
                }
            }
            return null;
        }

        private bool IsLessonCompleted(string userId, int lessonId)
        {
            return _context.LessonProgresses.Any(lp => 
                lp.StudentId == userId && 
                lp.LessonId == lessonId && 
                lp.Status == ProgressStatus.Completed);
        }

        private DateTime? GetLessonCompletionDate(string userId, int lessonId)
        {
            return _context.LessonProgresses
                .Where(lp => lp.StudentId == userId && lp.LessonId == lessonId && lp.CompletedAt.HasValue)
                .Select(lp => lp.CompletedAt)
                .FirstOrDefault();
        }

        private double CalculateModuleProgress(string userId, Models.CourseModule module)
        {
            var totalLessons = module.Lessons.Count;
            if (totalLessons == 0) return 0;

            var completedLessons = module.Lessons.Count(l => IsLessonCompleted(userId, l.Id));
            return Math.Round((completedLessons * 100.0) / totalLessons, 2);
        }

        private int? GetLastAccessedLessonId(string userId, int courseId)
        {
            return _context.LessonProgresses
                .Include(lp => lp.Lesson)
                .Where(lp => lp.StudentId == userId && lp.Lesson.Module.CourseId == courseId)
                .OrderByDescending(lp => lp.StartedAt)
                .Select(lp => lp.LessonId)
                .FirstOrDefault();
        }

        private async Task<int> GetCurrentStreak(string userId)
        {
            // In a real implementation, this would calculate based on daily activity
            return 7;
        }

        private async Task<int> GetLongestStreak(string userId)
        {
            // In a real implementation, this would calculate based on historical data
            return 15;
        }

        private string GetGrade(double score)
        {
            if (score >= 90) return "A";
            if (score >= 80) return "B";
            if (score >= 70) return "C";
            if (score >= 60) return "D";
            return "F";
        }
    }

}