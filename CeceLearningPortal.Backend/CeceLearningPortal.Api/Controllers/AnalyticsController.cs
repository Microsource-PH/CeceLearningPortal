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
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(ApplicationDbContext context, ILogger<AnalyticsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("instructor/{instructorId}")]
        public async Task<IActionResult> GetInstructorAnalytics(string instructorId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            // Only allow instructors to view their own analytics or admins to view any
            if (userId != instructorId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var courses = await _context.Courses
                .Where(c => c.InstructorId == instructorId)
                .Include(c => c.Enrollments)
                    .ThenInclude(e => e.Student)
                .Include(c => c.Reviews)
                .ToListAsync();

            var totalRevenue = await _context.Payments
                .Where(p => p.Course.InstructorId == instructorId && p.Status == PaymentStatus.Completed)
                .SumAsync(p => p.Amount);

            var totalStudents = courses.SelectMany(c => c.Enrollments).Select(e => e.StudentId).Distinct().Count();
            var totalEnrollments = courses.Sum(c => c.Enrollments.Count);
            var averageRating = courses.SelectMany(c => c.Reviews).Any() 
                ? courses.SelectMany(c => c.Reviews).Average(r => r.Rating) 
                : 0;

            var monthlyRevenue = await GetMonthlyRevenue(instructorId);
            var coursePerformance = GetCoursePerformance(courses);
            var studentEngagement = GetStudentEngagement(courses);

            return Ok(new
            {
                summary = new
                {
                    totalRevenue = totalRevenue,
                    totalStudents = totalStudents,
                    totalEnrollments = totalEnrollments,
                    totalCourses = courses.Count,
                    averageRating = Math.Round(averageRating, 2),
                    completionRate = CalculateCompletionRate(courses)
                },
                monthlyRevenue = monthlyRevenue,
                coursePerformance = coursePerformance,
                studentEngagement = studentEngagement,
                recentActivity = await GetRecentActivity(instructorId)
            });
        }

        [HttpGet("platform")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPlatformAnalytics()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalCourses = await _context.Courses.CountAsync();
            var totalRevenue = await _context.Payments
                .Where(p => p.Status == PaymentStatus.Completed)
                .SumAsync(p => p.Amount);
            var totalEnrollments = await _context.Enrollments.CountAsync();

            var topInstructors = await GetTopInstructors();
            var popularCategories = await GetPopularCategories();
            var revenueByMonth = await GetPlatformMonthlyRevenue();
            var userGrowth = await GetUserGrowth();

            return Ok(new
            {
                summary = new
                {
                    totalUsers = totalUsers,
                    totalCourses = totalCourses,
                    totalRevenue = totalRevenue,
                    totalEnrollments = totalEnrollments,
                    activeSubscriptions = await _context.Subscriptions
                        .CountAsync(s => s.Status == SubscriptionStatus.Active)
                },
                topPerformers = topInstructors,
                popularCategories = popularCategories,
                revenueByMonth = revenueByMonth,
                userGrowth = userGrowth,
                subscriptionMetrics = await GetSubscriptionMetrics()
            });
        }

        [HttpGet("course/{courseId}/analytics")]
        public async Task<IActionResult> GetCourseAnalytics(int courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Enrollments)
                    .ThenInclude(e => e.Student)
                .Include(c => c.Reviews)
                .Include(c => c.Modules)
                    .ThenInclude(m => m.Lessons)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null)
            {
                return NotFound();
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (course.InstructorId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var revenue = await _context.Payments
                .Where(p => p.CourseId == courseId && p.Status == PaymentStatus.Completed)
                .SumAsync(p => p.Amount);

            var completionRate = course.Enrollments.Any() 
                ? (double)course.Enrollments.Count(e => e.CompletedAt.HasValue) / course.Enrollments.Count * 100 
                : 0;

            var avgProgress = course.Enrollments.Any() 
                ? course.Enrollments.Average(e => e.ProgressPercentage) 
                : 0;

            var avgRating = course.Reviews.Any() 
                ? course.Reviews.Average(r => r.Rating) 
                : 0;

            return Ok(new
            {
                courseId = course.Id,
                title = course.Title,
                summary = new
                {
                    totalRevenue = revenue,
                    totalEnrollments = course.Enrollments.Count,
                    activeStudents = course.Enrollments.Count(e => e.ProgressPercentage > 0 && e.ProgressPercentage < 100),
                    completedStudents = course.Enrollments.Count(e => e.CompletedAt.HasValue),
                    completionRate = Math.Round(completionRate, 2),
                    averageProgress = Math.Round(avgProgress, 2),
                    averageRating = Math.Round(avgRating, 2),
                    totalReviews = course.Reviews.Count
                },
                enrollmentTrend = GetEnrollmentTrend(course),
                studentProgress = GetStudentProgressDistribution(course),
                lessonEngagement = GetLessonEngagement(course)
            });
        }

        private async Task<List<object>> GetMonthlyRevenue(string instructorId)
        {
            var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-12);
            
            var payments = await _context.Payments
                .Where(p => p.Course.InstructorId == instructorId && 
                           p.Status == PaymentStatus.Completed &&
                           p.CreatedAt >= twelveMonthsAgo)
                .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Revenue = g.Sum(p => p.Amount)
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            // If no real data, return mock data for demo purposes
            if (!payments.Any())
            {
                var currentDate = DateTime.UtcNow;
                var mockData = new List<object>();
                for (int i = 5; i >= 0; i--)
                {
                    var date = currentDate.AddMonths(-i);
                    mockData.Add(new
                    {
                        month = date.Year + "-" + date.Month.ToString("D2"),
                        revenue = 1500m + (new Random(i).Next(0, 2000))
                    });
                }
                return mockData;
            }

            return payments.Select(p => new
            {
                month = p.Year + "-" + p.Month.ToString("D2"),
                revenue = p.Revenue
            }).Cast<object>().ToList();
        }

        private List<object> GetCoursePerformance(List<Course> courses)
        {
            return courses.Select(c => new
            {
                courseId = c.Id,
                title = c.Title,
                enrollments = c.Enrollments.Count,
                revenue = _context.Payments
                    .Where(p => p.CourseId == c.Id && p.Status == PaymentStatus.Completed)
                    .Sum(p => p.Amount),
                completionRate = c.Enrollments.Any() 
                    ? Math.Round((double)c.Enrollments.Count(e => e.CompletedAt.HasValue) / c.Enrollments.Count * 100, 2)
                    : 0,
                averageRating = c.Reviews.Any() 
                    ? Math.Round(c.Reviews.Average(r => r.Rating), 2) 
                    : 0,
                status = c.Status.ToString()
            }).Cast<object>().ToList();
        }

        private object GetStudentEngagement(List<Course> courses)
        {
            var allEnrollments = courses.SelectMany(c => c.Enrollments).ToList();
            
            return new
            {
                averageProgressPercentage = allEnrollments.Any() 
                    ? Math.Round(allEnrollments.Average(e => e.ProgressPercentage), 2) 
                    : 0,
                activeStudents = allEnrollments.Count(e => e.ProgressPercentage > 0 && e.ProgressPercentage < 100),
                completedStudents = allEnrollments.Count(e => e.CompletedAt.HasValue),
                inactiveStudents = allEnrollments.Count(e => e.ProgressPercentage == 0),
                progressDistribution = new
                {
                    notStarted = allEnrollments.Count(e => e.ProgressPercentage == 0),
                    inProgress = allEnrollments.Count(e => e.ProgressPercentage > 0 && e.ProgressPercentage < 100),
                    completed = allEnrollments.Count(e => e.ProgressPercentage == 100)
                }
            };
        }

        private double CalculateCompletionRate(List<Course> courses)
        {
            var allEnrollments = courses.SelectMany(c => c.Enrollments).ToList();
            if (!allEnrollments.Any()) return 0;
            
            return Math.Round((double)allEnrollments.Count(e => e.CompletedAt.HasValue) / allEnrollments.Count * 100, 2);
        }

        private async Task<List<object>> GetRecentActivity(string instructorId)
        {
            var recentEnrollments = await _context.Enrollments
                .Include(e => e.Student)
                .Include(e => e.Course)
                .Where(e => e.Course.InstructorId == instructorId)
                .OrderByDescending(e => e.EnrolledAt)
                .Take(10)
                .Select(e => new
                {
                    type = "Enrollment",
                    studentName = e.Student.FullName,
                    courseName = e.Course.Title,
                    date = e.EnrolledAt,
                    details = $"{e.Student.FullName} enrolled in {e.Course.Title}"
                })
                .ToListAsync();

            var recentReviews = await _context.Reviews
                .Include(r => r.Student)
                .Include(r => r.Course)
                .Where(r => r.Course.InstructorId == instructorId)
                .OrderByDescending(r => r.CreatedAt)
                .Take(10)
                .Select(r => new
                {
                    type = "Review",
                    studentName = r.Student.FullName,
                    courseName = r.Course.Title,
                    date = r.CreatedAt,
                    details = $"{r.Student.FullName} rated {r.Course.Title} {r.Rating} stars"
                })
                .ToListAsync();

            return recentEnrollments.Concat(recentReviews)
                .OrderByDescending(a => a.date)
                .Take(10)
                .Cast<object>()
                .ToList();
        }

        private async Task<List<object>> GetTopInstructors()
        {
            var instructors = await _context.Users
                .Where(u => u.Role == UserRole.Instructor)
                .Select(u => new
                {
                    instructorId = u.Id,
                    instructorName = u.FullName,
                    totalCourses = _context.Courses.Count(c => c.InstructorId == u.Id),
                    totalStudents = _context.Enrollments.Count(e => e.Course.InstructorId == u.Id),
                    totalRevenue = _context.Payments
                        .Where(p => p.Course.InstructorId == u.Id && p.Status == PaymentStatus.Completed)
                        .Sum(p => p.Amount),
                    averageRating = _context.Reviews
                        .Where(r => r.Course.InstructorId == u.Id)
                        .Average(r => (double?)r.Rating) ?? 0
                })
                .OrderByDescending(i => i.totalRevenue)
                .Take(10)
                .ToListAsync();

            return instructors.Cast<object>().ToList();
        }

        private async Task<List<object>> GetPopularCategories()
        {
            return await _context.Courses
                .GroupBy(c => c.Category)
                .Select(g => new
                {
                    category = g.Key,
                    courseCount = g.Count(),
                    enrollmentCount = g.Sum(c => c.Enrollments.Count),
                    revenue = _context.Payments
                        .Where(p => p.Course.Category == g.Key && p.Status == PaymentStatus.Completed)
                        .Sum(p => p.Amount)
                })
                .OrderByDescending(c => c.enrollmentCount)
                .Cast<object>()
                .ToListAsync();
        }

        private async Task<List<object>> GetPlatformMonthlyRevenue()
        {
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
            
            var groupedPayments = await _context.Payments
                .Where(p => p.Status == PaymentStatus.Completed && p.CreatedAt >= sixMonthsAgo)
                .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Revenue = g.Sum(p => p.Amount),
                    TransactionCount = g.Count()
                })
                .ToListAsync();

            return groupedPayments.Select(g => new
            {
                month = g.Year + "-" + g.Month.ToString("D2"),
                revenue = g.Revenue,
                transactionCount = g.TransactionCount
            })
            .OrderBy(x => x.month)
            .Cast<object>()
            .ToList();
        }

        private async Task<object> GetUserGrowth()
        {
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
            
            var groupedUsers = await _context.Users
                .Where(u => u.CreatedAt >= sixMonthsAgo)
                .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    NewUsers = g.Count()
                })
                .ToListAsync();

            var userGrowth = groupedUsers.Select(g => new
            {
                month = g.Year + "-" + g.Month.ToString("D2"),
                newUsers = g.NewUsers
            })
            .OrderBy(x => x.month)
            .ToList();

            return new
            {
                monthlyGrowth = userGrowth,
                totalNewUsers = userGrowth.Sum(g => g.newUsers),
                averageMonthlyGrowth = userGrowth.Any() ? userGrowth.Average(g => g.newUsers) : 0
            };
        }

        private async Task<object> GetSubscriptionMetrics()
        {
            var activeSubscriptions = await _context.Subscriptions
                .Where(s => s.Status == SubscriptionStatus.Active)
                .GroupBy(s => s.PlanName)
                .Select(g => new
                {
                    plan = g.Key,
                    count = g.Count(),
                    monthlyRevenue = g.Sum(s => s.Price)
                })
                .ToListAsync();

            return new
            {
                byPlan = activeSubscriptions,
                totalActive = activeSubscriptions.Sum(s => s.count),
                monthlyRecurringRevenue = activeSubscriptions.Sum(s => s.monthlyRevenue)
            };
        }

        private List<object> GetEnrollmentTrend(Course course)
        {
            var groupedEnrollments = course.Enrollments
                .GroupBy(e => new { e.EnrolledAt.Year, e.EnrolledAt.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Enrollments = g.Count()
                })
                .ToList();

            return groupedEnrollments.Select(g => new
            {
                month = g.Year + "-" + g.Month.ToString("D2"),
                enrollments = g.Enrollments
            })
            .OrderBy(x => x.month)
            .Cast<object>()
            .ToList();
        }

        private object GetStudentProgressDistribution(Course course)
        {
            var ranges = new[] { 0, 25, 50, 75, 100 };
            var distribution = new List<object>();

            for (int i = 0; i < ranges.Length - 1; i++)
            {
                var min = ranges[i];
                var max = ranges[i + 1];
                distribution.Add(new
                {
                    range = $"{min}-{max}%",
                    count = course.Enrollments.Count(e => e.ProgressPercentage >= min && e.ProgressPercentage < max)
                });
            }

            distribution.Add(new
            {
                range = "100%",
                count = course.Enrollments.Count(e => e.ProgressPercentage == 100)
            });

            return distribution;
        }

        private object GetLessonEngagement(Course course)
        {
            var totalLessons = course.Modules.Sum(m => m.Lessons.Count);
            
            return new
            {
                totalLessons = totalLessons,
                totalModules = course.Modules.Count,
                averageLessonsPerModule = course.Modules.Any() 
                    ? Math.Round((double)totalLessons / course.Modules.Count, 2) 
                    : 0
            };
        }
    }
}