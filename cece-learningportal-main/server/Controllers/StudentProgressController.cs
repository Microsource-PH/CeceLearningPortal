using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/students")]
    [Authorize(Roles = "Student,Learner")]
    public class StudentProgressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<StudentProgressController> _logger;

        public StudentProgressController(ApplicationDbContext context, ILogger<StudentProgressController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStudentStats()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var enrollments = await _context.Enrollments
                .Where(e => e.UserId == userId)
                .Include(e => e.Course)
                .ToListAsync();

            var completedCourses = enrollments.Count(e => e.CompletionPercentage == 100);
            var inProgressCourses = enrollments.Count(e => e.CompletionPercentage > 0 && e.CompletionPercentage < 100);
            var totalCertificates = await _context.Certificates.CountAsync(c => c.UserId == userId);
            
            var totalSpent = await _context.Payments
                .Where(p => p.UserId == userId && p.Status == "paid")
                .SumAsync(p => p.Amount);

            var learningActivities = await _context.LessonProgress
                .Where(lp => lp.UserId == userId)
                .ToListAsync();

            var totalLearningMinutes = learningActivities.Sum(la => la.TimeSpentMinutes ?? 0);
            var learningHours = totalLearningMinutes / 60;

            // Calculate streaks
            var activities = await _context.LessonProgress
                .Where(lp => lp.UserId == userId && lp.CompletedAt.HasValue)
                .OrderBy(lp => lp.CompletedAt)
                .Select(lp => lp.CompletedAt!.Value.Date)
                .Distinct()
                .ToListAsync();

            var (currentStreak, longestStreak) = CalculateStreaks(activities);

            // Calculate average score from quizzes
            var avgScore = await _context.QuizAttempts
                .Where(qa => qa.UserId == userId && qa.Score.HasValue)
                .AverageAsync(qa => (double?)qa.Score) ?? 0;

            return Ok(new
            {
                totalCourses = enrollments.Count,
                completedCourses,
                inProgressCourses,
                totalCertificates,
                totalSpent,
                learningHours,
                currentStreak,
                longestStreak,
                averageScore = Math.Round(avgScore, 1)
            });
        }

        [HttpGet("courses")]
        public async Task<IActionResult> GetEnrolledCourses()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var enrollments = await _context.Enrollments
                .Where(e => e.UserId == userId)
                .Include(e => e.Course)
                    .ThenInclude(c => c.Instructor)
                .Include(e => e.Course)
                    .ThenInclude(c => c.Modules)
                    .ThenInclude(m => m.Lessons)
                .Select(e => new
                {
                    id = e.Id,
                    courseId = e.CourseId,
                    title = e.Course.Title,
                    instructor = e.Course.Instructor.FullName,
                    thumbnail = e.Course.Thumbnail,
                    progress = e.CompletionPercentage,
                    status = e.CompletionPercentage == 0 ? "not_started" : 
                             e.CompletionPercentage == 100 ? "completed" : "in_progress",
                    enrolledAt = e.EnrolledAt,
                    lastAccessedAt = e.LastAccessedAt,
                    completedAt = e.CompletedAt,
                    certificateUrl = e.CertificateId.HasValue ? $"/api/certificates/{e.CertificateId}" : null,
                    totalLessons = e.Course.Modules.Sum(m => m.Lessons.Count),
                    completedLessons = _context.LessonProgress
                        .Count(lp => lp.UserId == userId && 
                               lp.Lesson.Module.CourseId == e.CourseId && 
                               lp.Status == "Completed"),
                    nextLesson = GetNextLesson(e.CourseId, userId)
                })
                .ToListAsync();

            return Ok(enrollments);
        }

        [HttpGet("courses/{courseId}/progress")]
        public async Task<IActionResult> GetCourseProgress(int courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

            if (enrollment == null)
            {
                return NotFound("Not enrolled in this course");
            }

            var modules = await _context.Modules
                .Where(m => m.CourseId == courseId)
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
                        type = l.Type,
                        duration = l.Duration,
                        isCompleted = _context.LessonProgress
                            .Any(lp => lp.LessonId == l.Id && 
                                      lp.UserId == userId && 
                                      lp.Status == "Completed"),
                        completedAt = _context.LessonProgress
                            .Where(lp => lp.LessonId == l.Id && 
                                        lp.UserId == userId && 
                                        lp.Status == "Completed")
                            .Select(lp => lp.CompletedAt)
                            .FirstOrDefault()
                    }).ToList(),
                    progress = 0.0
                })
                .ToListAsync();

            // Calculate module progress
            foreach (var module in modules)
            {
                var totalLessons = module.lessons.Count();
                var completedLessons = module.lessons.Count(l => l.isCompleted);
                module = module with { progress = totalLessons > 0 ? (double)completedLessons / totalLessons * 100 : 0 };
            }

            var lastAccessedLessonId = await _context.LessonProgress
                .Where(lp => lp.UserId == userId && lp.Lesson.Module.CourseId == courseId)
                .OrderByDescending(lp => lp.UpdatedAt)
                .Select(lp => lp.LessonId)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                courseId,
                enrollmentId = enrollment.Id,
                modules,
                overallProgress = enrollment.CompletionPercentage,
                lastAccessedLessonId
            });
        }

        [HttpPut("lessons/{lessonId}/progress")]
        public async Task<IActionResult> UpdateLessonProgress(int lessonId, [FromBody] UpdateLessonProgressDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var lesson = await _context.Lessons
                .Include(l => l.Module)
                .FirstOrDefaultAsync(l => l.Id == lessonId);

            if (lesson == null)
            {
                return NotFound("Lesson not found");
            }

            // Check enrollment
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == lesson.Module.CourseId);

            if (enrollment == null)
            {
                return Forbid("Not enrolled in this course");
            }

            // Update or create lesson progress
            var progress = await _context.LessonProgress
                .FirstOrDefaultAsync(lp => lp.LessonId == lessonId && lp.UserId == userId);

            if (progress == null)
            {
                progress = new LessonProgress
                {
                    LessonId = lessonId,
                    UserId = userId,
                    Status = dto.Status == "completed" ? "Completed" : "InProgress",
                    StartedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.LessonProgress.Add(progress);
            }
            else
            {
                progress.Status = dto.Status == "completed" ? "Completed" : "InProgress";
                progress.UpdatedAt = DateTime.UtcNow;
                
                if (dto.Status == "completed" && !progress.CompletedAt.HasValue)
                {
                    progress.CompletedAt = DateTime.UtcNow;
                }
            }

            // Update enrollment
            enrollment.LastAccessedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            // Recalculate course progress
            await RecalculateCourseProgress(enrollment.Id);

            return Ok(new { success = true });
        }

        [HttpGet("activity")]
        public async Task<IActionResult> GetLearningActivity([FromQuery] int limit = 10)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var activities = new List<object>();

            // Get recent lesson completions
            var lessonCompletions = await _context.LessonProgress
                .Where(lp => lp.UserId == userId && lp.Status == "Completed")
                .OrderByDescending(lp => lp.CompletedAt)
                .Take(limit)
                .Include(lp => lp.Lesson)
                    .ThenInclude(l => l.Module)
                    .ThenInclude(m => m.Course)
                .Select(lp => new
                {
                    id = $"lesson_{lp.Id}",
                    type = "lesson_completed",
                    title = $"Completed: {lp.Lesson.Title}",
                    description = $"Lesson in {lp.Lesson.Module.Course.Title}",
                    timestamp = lp.CompletedAt!.Value,
                    courseId = lp.Lesson.Module.CourseId,
                    courseName = lp.Lesson.Module.Course.Title
                })
                .ToListAsync();

            activities.AddRange(lessonCompletions);

            // Get recent enrollments
            var enrollments = await _context.Enrollments
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.EnrolledAt)
                .Take(limit / 2)
                .Include(e => e.Course)
                .Select(e => new
                {
                    id = $"enrollment_{e.Id}",
                    type = "course_enrolled",
                    title = $"Enrolled in: {e.Course.Title}",
                    description = "Started learning a new course",
                    timestamp = e.EnrolledAt,
                    courseId = e.CourseId,
                    courseName = e.Course.Title
                })
                .ToListAsync();

            activities.AddRange(enrollments);

            // Get certificates earned
            var certificates = await _context.Certificates
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.IssuedAt)
                .Take(limit / 2)
                .Include(c => c.Course)
                .Select(c => new
                {
                    id = $"certificate_{c.Id}",
                    type = "certificate_earned",
                    title = $"Certificate earned: {c.Course.Title}",
                    description = "Successfully completed the course",
                    timestamp = c.IssuedAt,
                    courseId = c.CourseId,
                    courseName = c.Course.Title
                })
                .ToListAsync();

            activities.AddRange(certificates);

            // Sort by timestamp and take the limit
            var sortedActivities = activities
                .OrderByDescending(a => ((dynamic)a).timestamp)
                .Take(limit)
                .ToList();

            return Ok(sortedActivities);
        }

        [HttpGet("certificates")]
        public async Task<IActionResult> GetCertificates()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var certificates = await _context.Certificates
                .Where(c => c.UserId == userId)
                .Include(c => c.Course)
                .Select(c => new
                {
                    id = c.Id,
                    courseId = c.CourseId,
                    courseName = c.Course.Title,
                    certificateNumber = c.CertificateNumber,
                    issuedAt = c.IssuedAt,
                    validUntil = c.ValidUntil,
                    verificationUrl = $"/verify-certificate/{c.CertificateNumber}"
                })
                .OrderByDescending(c => c.issuedAt)
                .ToListAsync();

            return Ok(certificates);
        }

        private async Task RecalculateCourseProgress(int enrollmentId)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.Course)
                    .ThenInclude(c => c.Modules)
                    .ThenInclude(m => m.Lessons)
                .FirstOrDefaultAsync(e => e.Id == enrollmentId);

            if (enrollment == null) return;

            var totalLessons = enrollment.Course.Modules.Sum(m => m.Lessons.Count);
            var completedLessons = await _context.LessonProgress
                .CountAsync(lp => lp.UserId == enrollment.UserId && 
                                 lp.Lesson.Module.CourseId == enrollment.CourseId && 
                                 lp.Status == "Completed");

            enrollment.CompletionPercentage = totalLessons > 0 
                ? Math.Round((double)completedLessons / totalLessons * 100, 2) 
                : 0;

            if (enrollment.CompletionPercentage == 100 && !enrollment.CompletedAt.HasValue)
            {
                enrollment.CompletedAt = DateTime.UtcNow;
                
                // Generate certificate
                var certificate = new Certificate
                {
                    UserId = enrollment.UserId,
                    CourseId = enrollment.CourseId,
                    CertificateNumber = GenerateCertificateNumber(),
                    IssuedAt = DateTime.UtcNow,
                    ValidUntil = DateTime.UtcNow.AddYears(2)
                };
                
                _context.Certificates.Add(certificate);
                await _context.SaveChangesAsync();
                
                enrollment.CertificateId = certificate.Id;
            }

            await _context.SaveChangesAsync();
        }

        private object? GetNextLesson(int courseId, string userId)
        {
            var modules = _context.Modules
                .Where(m => m.CourseId == courseId)
                .OrderBy(m => m.Order)
                .Include(m => m.Lessons)
                .ToList();

            foreach (var module in modules)
            {
                foreach (var lesson in module.Lessons.OrderBy(l => l.Order))
                {
                    var isCompleted = _context.LessonProgress
                        .Any(lp => lp.LessonId == lesson.Id && 
                                  lp.UserId == userId && 
                                  lp.Status == "Completed");

                    if (!isCompleted)
                    {
                        return new
                        {
                            id = lesson.Id,
                            title = lesson.Title,
                            type = lesson.Type
                        };
                    }
                }
            }

            return null;
        }

        private (int currentStreak, int longestStreak) CalculateStreaks(List<DateTime> activityDates)
        {
            if (!activityDates.Any()) return (0, 0);

            var currentStreak = 0;
            var longestStreak = 0;
            var tempStreak = 1;
            var today = DateTime.UtcNow.Date;

            // Check if user was active today or yesterday for current streak
            if (activityDates.Last() == today || activityDates.Last() == today.AddDays(-1))
            {
                currentStreak = 1;
                var checkDate = activityDates.Last().AddDays(-1);
                
                for (int i = activityDates.Count - 2; i >= 0; i--)
                {
                    if (activityDates[i] == checkDate)
                    {
                        currentStreak++;
                        checkDate = checkDate.AddDays(-1);
                    }
                    else
                    {
                        break;
                    }
                }
            }

            // Calculate longest streak
            for (int i = 1; i < activityDates.Count; i++)
            {
                if ((activityDates[i] - activityDates[i - 1]).TotalDays == 1)
                {
                    tempStreak++;
                }
                else
                {
                    longestStreak = Math.Max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
            longestStreak = Math.Max(longestStreak, tempStreak);

            return (currentStreak, longestStreak);
        }

        private string GenerateCertificateNumber()
        {
            return $"CERT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
        }
    }

    public class UpdateLessonProgressDto
    {
        public string Status { get; set; } = "";
        public int? TimeSpentMinutes { get; set; }
    }
}