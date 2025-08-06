using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public class RevenueCalculationService : IRevenueCalculationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RevenueCalculationService> _logger;

        public RevenueCalculationService(ApplicationDbContext context, ILogger<RevenueCalculationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<InstructorRevenueDto> CalculateInstructorRevenueAsync(string instructorId)
        {
            var instructor = await _context.Users.FindAsync(instructorId);
            if (instructor == null)
                return null;

            var courses = await _context.Courses
                .Where(c => c.InstructorId == instructorId)
                .ToListAsync();

            decimal totalDirectSales = 0;
            decimal totalSubscriptionRevenue = 0;
            var courseRevenues = new List<CourseRevenueDto>();

            decimal totalCreatorRevenue = 0;
            decimal totalPlatformRevenue = 0;

            foreach (var course in courses)
            {
                var courseRevenue = await CalculateCourseRevenueAsync(course.Id);
                courseRevenues.Add(courseRevenue);
                totalDirectSales += courseRevenue.DirectSalesRevenue;
                totalSubscriptionRevenue += courseRevenue.SubscriptionRevenue;
                totalCreatorRevenue += courseRevenue.CreatorRevenue;
                totalPlatformRevenue += courseRevenue.PlatformRevenue;
            }

            var totalRevenue = totalDirectSales + totalSubscriptionRevenue;

            return new InstructorRevenueDto
            {
                InstructorId = instructorId,
                InstructorName = instructor.FullName,
                TotalRevenue = totalRevenue,
                CreatorRevenue = totalCreatorRevenue,
                PlatformRevenue = totalPlatformRevenue,
                DirectSalesRevenue = totalDirectSales,
                SubscriptionRevenue = totalSubscriptionRevenue,
                TotalCourses = courses.Count,
                CourseRevenues = courseRevenues
            };
        }

        public async Task<List<CourseRevenueDto>> CalculateCourseRevenuesAsync(string instructorId)
        {
            var courses = await _context.Courses
                .Where(c => c.InstructorId == instructorId)
                .ToListAsync();

            var courseRevenues = new List<CourseRevenueDto>();

            foreach (var course in courses)
            {
                var courseRevenue = await CalculateCourseRevenueAsync(course.Id);
                courseRevenues.Add(courseRevenue);
            }

            return courseRevenues;
        }

        private async Task<CourseRevenueDto> CalculateCourseRevenueAsync(int courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
                return null;

            // Count enrollments
            var totalEnrollments = await _context.Enrollments
                .CountAsync(e => e.CourseId == courseId);

            var directEnrollments = await _context.Enrollments
                .Where(e => e.CourseId == courseId)
                .CountAsync(e => !_context.Subscriptions.Any(s => s.UserId == e.StudentId && 
                                                                 s.Status == SubscriptionStatus.Active &&
                                                                 s.StartDate <= e.EnrolledAt));

            var subscriptionEnrollments = totalEnrollments - directEnrollments;

            // Calculate direct sales revenue using the formula: Students × Price
            var directSalesRevenue = directEnrollments * course.Price;

            // Calculate subscription revenue for this course
            var subscriptionRevenue = await CalculateSubscriptionRevenueForCourseAsync(courseId);

            // Calculate total revenue and apply 80/20 split
            var totalRevenue = directSalesRevenue + subscriptionRevenue;
            var creatorRevenue = totalRevenue * 0.8m; // Creator gets 80%
            var platformRevenue = totalRevenue * 0.2m; // Platform gets 20%

            return new CourseRevenueDto
            {
                CourseId = courseId,
                CourseTitle = course.Title,
                CoursePrice = course.Price,
                DirectSalesRevenue = directSalesRevenue,
                SubscriptionRevenue = subscriptionRevenue,
                TotalRevenue = totalRevenue,
                CreatorRevenue = creatorRevenue,
                PlatformRevenue = platformRevenue,
                TotalEnrollments = totalEnrollments,
                DirectPurchaseEnrollments = directEnrollments,
                SubscriptionEnrollments = subscriptionEnrollments
            };
        }

        public async Task<decimal> CalculateSubscriptionRevenueForCourseAsync(int courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
                return 0;

            // Count subscription-based enrollments
            var subscriptionEnrollments = await _context.Enrollments
                .Where(e => e.CourseId == courseId)
                .CountAsync(e => _context.Subscriptions.Any(s => s.UserId == e.StudentId && 
                                                                s.Status == SubscriptionStatus.Active &&
                                                                s.StartDate <= e.EnrolledAt));

            // For subscription revenue, we use the same formula: Students × Price
            // This represents the value of the course regardless of payment method
            var subscriptionRevenue = subscriptionEnrollments * course.Price;

            return subscriptionRevenue;
        }

    }
}