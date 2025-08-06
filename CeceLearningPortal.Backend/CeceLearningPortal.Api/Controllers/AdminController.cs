using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CeceLearningPortal.Api.Services;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.Models;
using CeceLearningPortal.Api.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly DataSeederService _seederService;
        private readonly ApplicationDbContext _context;
        private readonly IAdminService _adminService;
        private readonly ISubscriptionManagementService _subscriptionService;
        private readonly ISubscriptionPlanService _subscriptionPlanService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            DataSeederService seederService,
            ApplicationDbContext context,
            IAdminService adminService,
            ISubscriptionManagementService subscriptionService,
            ISubscriptionPlanService subscriptionPlanService,
            ILogger<AdminController> logger)
        {
            _seederService = seederService;
            _context = context;
            _adminService = adminService;
            _subscriptionService = subscriptionService;
            _subscriptionPlanService = subscriptionPlanService;
            _logger = logger;
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedData()
        {
            try
            {
                await _seederService.SeedDataAsync();
                return Ok(new { message = "Data seeding completed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during data seeding");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("fix-instructor-payments")]
        public async Task<IActionResult> FixInstructorPayments()
        {
            try
            {
                _logger.LogInformation("Fixing instructor payment data...");
                
                // Get all instructors
                var instructors = await _context.Users
                    .Where(u => u.Role == UserRole.Instructor)
                    .ToListAsync();

                foreach (var instructor in instructors)
                {
                    // Get instructor's courses with enrollments
                    var courses = await _context.Courses
                        .Include(c => c.Enrollments)
                        .Where(c => c.InstructorId == instructor.Id)
                        .ToListAsync();
                    
                    _logger.LogInformation($"Processing {instructor.FullName} with {courses.Count} courses");
                    
                    foreach (var course in courses)
                    {
                        foreach (var enrollment in course.Enrollments)
                        {
                            // Check if payment exists
                            var existingPayment = await _context.Payments
                                .FirstOrDefaultAsync(p => 
                                    p.UserId == enrollment.StudentId && 
                                    p.CourseId == enrollment.CourseId &&
                                    p.Status == PaymentStatus.Completed);
                            
                            if (existingPayment == null)
                            {
                                // Create payment record
                                var payment = new Payment
                                {
                                    UserId = enrollment.StudentId,
                                    CourseId = enrollment.CourseId,
                                    Amount = course.Price,
                                    Currency = "USD",
                                    Status = PaymentStatus.Completed,
                                    PaymentMethod = PaymentMethod.CreditCard,
                                    TransactionId = $"fix_{Guid.NewGuid().ToString()[..8]}",
                                    CreatedAt = enrollment.EnrolledAt
                                };
                                
                                _context.Payments.Add(payment);
                                _logger.LogInformation($"Created payment for enrollment {enrollment.Id}");
                            }
                        }
                    }
                }
                
                await _context.SaveChangesAsync();
                
                // Return summary
                var summary = await GetInstructorSummary();
                
                return Ok(new 
                { 
                    message = "Instructor payments fixed successfully",
                    summary = summary
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fixing instructor payments");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("verify-instructor-data")]
        public async Task<IActionResult> VerifyInstructorData()
        {
            try
            {
                var summary = await GetInstructorSummary();
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying instructor data");
                return BadRequest(new { error = ex.Message });
            }
        }

        private async Task<object> GetInstructorSummary()
        {
            var instructors = await _context.Users
                .Where(u => u.Role == UserRole.Instructor)
                .Select(u => new
                {
                    id = u.Id,
                    name = u.FullName,
                    email = u.Email,
                    totalCourses = _context.Courses.Count(c => c.InstructorId == u.Id),
                    totalEnrollments = _context.Enrollments.Count(e => e.Course.InstructorId == u.Id),
                    totalPayments = _context.Payments.Count(p => p.Course.InstructorId == u.Id && p.Status == PaymentStatus.Completed),
                    totalRevenue = _context.Payments
                        .Where(p => p.Course.InstructorId == u.Id && p.Status == PaymentStatus.Completed)
                        .Sum(p => p.Amount),
                    averageRating = _context.Reviews
                        .Where(r => r.Course.InstructorId == u.Id)
                        .Average(r => (double?)r.Rating) ?? 0
                })
                .ToListAsync();

            return instructors;
        }

        // User Management Endpoints
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] UserManagementFilterDto filter)
        {
            try
            {
                var users = await _adminService.GetUsersAsync(filter);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, new { error = "An error occurred while retrieving users" });
            }
        }

        [HttpGet("users/{userId}")]
        public async Task<IActionResult> GetUser(string userId)
        {
            try
            {
                var user = await _adminService.GetUserByIdAsync(userId);
                if (user == null)
                    return NotFound(new { error = "User not found" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {UserId}", userId);
                return StatusCode(500, new { error = "An error occurred while retrieving the user" });
            }
        }

        [HttpGet("users/stats")]
        public async Task<IActionResult> GetUserStats()
        {
            try
            {
                var stats = await _adminService.GetUserManagementStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user statistics");
                return StatusCode(500, new { error = "An error occurred while retrieving user statistics" });
            }
        }

        [HttpGet("users/pending-approval")]
        public async Task<IActionResult> GetPendingApprovalUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var filter = new UserManagementFilterDto
                {
                    Status = "PendingApproval",
                    Page = page,
                    PageSize = pageSize
                };

                var users = await _adminService.GetUsersAsync(filter);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending approval users");
                return StatusCode(500, new { error = "An error occurred while fetching pending users" });
            }
        }

        [HttpPost("users/approve")]
        public async Task<IActionResult> ApproveUser([FromBody] ApproveUserDto approveDto)
        {
            try
            {
                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var result = await _adminService.ApproveUserAsync(approveDto, adminId);
                
                if (!result)
                    return NotFound(new { error = "User not found" });

                return Ok(new { message = approveDto.Approve ? "User approved successfully" : "User rejected successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving user {UserId}", approveDto.UserId);
                return StatusCode(500, new { error = "An error occurred while processing the approval" });
            }
        }

        [HttpPost("users/status")]
        public async Task<IActionResult> UpdateUserStatus([FromBody] UpdateUserStatusDto statusDto)
        {
            try
            {
                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var result = await _adminService.UpdateUserStatusAsync(statusDto, adminId);
                
                if (!result)
                    return NotFound(new { error = "User not found" });

                return Ok(new { message = "User status updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user status for {UserId}", statusDto.UserId);
                return StatusCode(500, new { error = "An error occurred while updating user status" });
            }
        }

        [HttpPost("users/create-admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto createDto)
        {
            try
            {
                var newAdmin = await _adminService.CreateAdminAsync(createDto);
                return Ok(new 
                { 
                    message = "Admin user created successfully",
                    user = newAdmin
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating admin user");
                return StatusCode(500, new { error = "An error occurred while creating the admin user" });
            }
        }

        [HttpGet("instructor-approvals")]
        public async Task<IActionResult> GetPendingInstructorApprovals()
        {
            try
            {
                var approvals = await _adminService.GetPendingInstructorApprovalsAsync();
                return Ok(approvals);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving instructor approvals");
                return StatusCode(500, new { error = "An error occurred while retrieving instructor approvals" });
            }
        }

        [HttpPost("instructor-approvals/{approvalId}/review")]
        public async Task<IActionResult> ReviewInstructorApproval(int approvalId, [FromBody] ReviewInstructorApprovalDto reviewDto)
        {
            try
            {
                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var result = await _adminService.ReviewInstructorApprovalAsync(approvalId, reviewDto, adminId);
                
                if (!result)
                    return NotFound(new { error = "Approval request not found" });

                return Ok(new { message = "Instructor approval reviewed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reviewing instructor approval {ApprovalId}", approvalId);
                return StatusCode(500, new { error = "An error occurred while reviewing the instructor approval" });
            }
        }


        // Subscriber Management Endpoints
        [HttpGet("subscribers")]
        public async Task<IActionResult> GetSubscribers([FromQuery] SubscriberFilterDto filter)
        {
            try
            {
                var subscribers = await _subscriptionService.GetSubscribersAsync(filter);
                return Ok(subscribers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscribers");
                return StatusCode(500, new { error = "An error occurred while retrieving subscribers" });
            }
        }

        [HttpGet("subscribers/{subscriptionId}")]
        public async Task<IActionResult> GetSubscriber(int subscriptionId)
        {
            try
            {
                var subscriber = await _subscriptionService.GetSubscriberByIdAsync(subscriptionId);
                if (subscriber == null)
                    return NotFound(new { error = "Subscriber not found" });

                return Ok(subscriber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscriber {SubscriptionId}", subscriptionId);
                return StatusCode(500, new { error = "An error occurred while retrieving the subscriber" });
            }
        }

        [HttpPut("subscribers")]
        public async Task<IActionResult> UpdateSubscriber([FromBody] UpdateSubscriberDto updateDto)
        {
            try
            {
                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var result = await _subscriptionService.UpdateSubscriberAsync(updateDto, adminId);
                
                if (!result)
                    return NotFound(new { error = "Subscriber not found" });

                return Ok(new { message = "Subscriber updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subscriber {SubscriptionId}", updateDto.SubscriptionId);
                return StatusCode(500, new { error = "An error occurred while updating the subscriber" });
            }
        }

        [HttpPost("subscribers/{subscriptionId}/cancel")]
        public async Task<IActionResult> CancelSubscription(int subscriptionId, [FromBody] string reason)
        {
            try
            {
                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var result = await _subscriptionService.CancelSubscriptionAsync(subscriptionId, reason, adminId);
                
                if (!result)
                    return NotFound(new { error = "Subscription not found" });

                return Ok(new { message = "Subscription cancelled successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling subscription {SubscriptionId}", subscriptionId);
                return StatusCode(500, new { error = "An error occurred while cancelling the subscription" });
            }
        }

        [HttpGet("subscriptions/statistics")]
        public async Task<IActionResult> GetSubscriptionStatistics()
        {
            try
            {
                var stats = await _subscriptionService.GetSubscriptionStatisticsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription statistics");
                return StatusCode(500, new { error = "An error occurred while retrieving subscription statistics" });
            }
        }

        // Course Management Endpoints
        [HttpGet("courses")]
        public async Task<IActionResult> GetCoursesForManagement([FromQuery] CourseManagementFilterDto filter)
        {
            try
            {
                var courses = await _subscriptionService.GetCoursesForManagementAsync(filter);
                
                // Log course statuses for debugging
                foreach (var course in courses)
                {
                    _logger.LogInformation($"Admin API returning course {course.Id} '{course.Title}' with status: {course.Status} (raw value: {(int)course.Status})");
                }
                
                // Log the first course in detail
                var firstCourse = courses.FirstOrDefault();
                if (firstCourse != null)
                {
                    var json = System.Text.Json.JsonSerializer.Serialize(firstCourse, new System.Text.Json.JsonSerializerOptions
                    {
                        WriteIndented = true,
                        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
                    });
                    _logger.LogInformation($"First course serialized: {json}");
                }
                
                return Ok(courses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving courses for management");
                return StatusCode(500, new { error = "An error occurred while retrieving courses" });
            }
        }

        [HttpGet("courses/{courseId}")]
        public async Task<IActionResult> GetCourseForManagement(int courseId)
        {
            try
            {
                var course = await _subscriptionService.GetCourseByIdForManagementAsync(courseId);
                if (course == null)
                    return NotFound(new { error = "Course not found" });

                return Ok(course);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course {CourseId}", courseId);
                return StatusCode(500, new { error = "An error occurred while retrieving the course" });
            }
        }


        [HttpGet("courses/statistics")]
        public async Task<IActionResult> GetCourseStatistics()
        {
            try
            {
                var stats = await _subscriptionService.GetCourseManagementStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course statistics");
                return StatusCode(500, new { error = "An error occurred while retrieving course statistics" });
            }
        }

        #region New Admin Endpoints

        // User Role Management
        [HttpPut("users/{userId}/role")]
        public async Task<IActionResult> UpdateUserRole(string userId, [FromBody] UpdateUserRoleDto dto)
        {
            try
            {
                var result = await _adminService.UpdateUserRoleAsync(userId, dto.Role);
                if (!result)
                    return NotFound(new { error = "User not found" });

                return Ok(new { message = "User role updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user role for {UserId}", userId);
                return StatusCode(500, new { error = "An error occurred while updating user role" });
            }
        }

        // User Subscription Management
        [HttpGet("users/{userId}/subscription")]
        public async Task<IActionResult> GetUserSubscription(string userId)
        {
            try
            {
                var subscription = await _adminService.GetUserSubscriptionAsync(userId);
                return Ok(subscription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription for user {UserId}", userId);
                return StatusCode(500, new { error = "An error occurred while retrieving user subscription" });
            }
        }

        [HttpPut("users/{userId}/subscription")]
        public async Task<IActionResult> UpdateUserSubscription(string userId, [FromBody] UpdateUserSubscriptionDto dto)
        {
            try
            {
                var result = await _adminService.UpdateUserSubscriptionAsync(userId, dto.PlanId, dto.IsBilledYearly ?? false);
                if (!result)
                    return NotFound(new { error = "User or plan not found" });

                return Ok(new { message = "User subscription updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subscription for user {UserId}", userId);
                return StatusCode(500, new { error = "An error occurred while updating user subscription" });
            }
        }

        // Course Management - Admin Create/Update/Delete
        [HttpPost("courses")]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
        {
            try
            {
                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var course = await _adminService.CreateCourseAsync(dto, adminId);
                return CreatedAtAction(nameof(GetCourseForManagement), new { courseId = course.Id }, course);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating course");
                return StatusCode(500, new { error = "An error occurred while creating the course" });
            }
        }

        [HttpPut("courses/{courseId}")]
        public async Task<IActionResult> UpdateCourse(int courseId, [FromBody] UpdateCourseDto dto)
        {
            try
            {
                var course = await _adminService.UpdateCourseAsync(courseId, dto);
                if (course == null)
                    return NotFound(new { error = "Course not found" });

                return Ok(course);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating course {CourseId}", courseId);
                return StatusCode(500, new { error = "An error occurred while updating the course" });
            }
        }

        [HttpDelete("courses/{courseId}")]
        public async Task<IActionResult> DeleteCourse(int courseId)
        {
            try
            {
                var result = await _adminService.DeleteCourseAsync(courseId);
                if (!result)
                    return NotFound(new { error = "Course not found" });

                return Ok(new { message = "Course deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting course {CourseId}", courseId);
                return StatusCode(500, new { error = "An error occurred while deleting the course" });
            }
        }

        // Course Approval Workflow
        [HttpPost("courses/{courseId}/approve")]
        public async Task<IActionResult> ApproveCourse(int courseId)
        {
            try
            {
                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var result = await _adminService.ApproveCourseAsync(courseId, adminId);
                if (!result)
                    return NotFound(new { error = "Course not found" });

                return Ok(new { message = "Course approved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving course {CourseId}", courseId);
                return StatusCode(500, new { error = "An error occurred while approving the course" });
            }
        }

        [HttpPost("courses/{courseId}/reject")]
        public async Task<IActionResult> RejectCourse(int courseId, [FromBody] RejectCourseDto dto)
        {
            try
            {
                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var result = await _adminService.RejectCourseAsync(courseId, dto.Reason, adminId);
                if (!result)
                    return NotFound(new { error = "Course not found" });

                return Ok(new { message = "Course rejected successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting course {CourseId}", courseId);
                return StatusCode(500, new { error = "An error occurred while rejecting the course" });
            }
        }

        // Subscription Plans Management
        [HttpGet("subscription-plans")]
        public async Task<IActionResult> GetSubscriptionPlans()
        {
            try
            {
                var plans = await _subscriptionPlanService.GetAllPlansAsync();
                return Ok(plans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription plans");
                return StatusCode(500, new { error = "An error occurred while retrieving subscription plans" });
            }
        }

        [HttpGet("subscription-plans/{planId}")]
        public async Task<IActionResult> GetSubscriptionPlan(int planId)
        {
            try
            {
                var plan = await _subscriptionPlanService.GetPlanByIdAsync(planId);
                if (plan == null)
                    return NotFound(new { error = "Subscription plan not found" });

                return Ok(plan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription plan {PlanId}", planId);
                return StatusCode(500, new { error = "An error occurred while retrieving the subscription plan" });
            }
        }

        [HttpPost("subscription-plans")]
        public async Task<IActionResult> CreateSubscriptionPlan([FromBody] CreateSubscriptionPlanDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                
                var plan = await _subscriptionPlanService.CreatePlanAsync(dto);
                return CreatedAtAction(nameof(GetSubscriptionPlan), new { planId = plan.Id }, plan);
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error creating subscription plan");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subscription plan");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("subscription-plans/{planId}")]
        public async Task<IActionResult> UpdateSubscriptionPlan(int planId, [FromBody] UpdateSubscriptionPlanDto dto)
        {
            try
            {
                var plan = await _subscriptionPlanService.UpdatePlanAsync(planId, dto);
                return Ok(plan);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subscription plan {PlanId}", planId);
                return StatusCode(500, new { error = "An error occurred while updating the subscription plan" });
            }
        }

        [HttpDelete("subscription-plans/{planId}")]
        public async Task<IActionResult> DeleteSubscriptionPlan(int planId)
        {
            try
            {
                var result = await _subscriptionPlanService.DeletePlanAsync(planId);
                if (!result)
                    return NotFound(new { error = "Subscription plan not found" });

                return Ok(new { message = "Subscription plan deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting subscription plan {PlanId}", planId);
                return StatusCode(500, new { error = "An error occurred while deleting the subscription plan" });
            }
        }

        #endregion

        #region Dashboard Endpoints

        [HttpGet("stats")]
        public async Task<IActionResult> GetAdminStats()
        {
            try
            {
                var stats = new
                {
                    totalUsers = await _context.Users.CountAsync(),
                    newUsersToday = await _context.Users.CountAsync(u => u.CreatedAt.Date == DateTime.UtcNow.Date),
                    activeCourses = await _context.Courses.CountAsync(c => c.Status == CourseStatus.Active),
                    coursesUnderReview = await _context.Courses.CountAsync(c => c.Status == CourseStatus.Draft),
                    totalRevenue = await _context.Payments.Where(p => p.Status == PaymentStatus.Completed).SumAsync(p => p.Amount),
                    supportTickets = 0, // Placeholder - implement ticket system as needed
                    systemHealth = new
                    {
                        uptime = 99.9,
                        apiResponseTime = 145,
                        errorRate = 0.02,
                        activeUsers = await _context.Users.CountAsync(u => u.LastLoginAt > DateTime.UtcNow.AddMinutes(-30))
                    }
                };
                
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving admin stats");
                return StatusCode(500, new { error = "An error occurred while retrieving admin stats" });
            }
        }

        [HttpGet("course-completions")]
        public async Task<IActionResult> GetCourseCompletions([FromQuery] int limit = 10)
        {
            try
            {
                var completions = await _context.Enrollments
                    .Where(e => e.CompletedAt != null)
                    .OrderByDescending(e => e.CompletedAt)
                    .Take(limit)
                    .Select(e => new
                    {
                        id = e.Id,
                        studentName = e.Student.FullName,
                        studentAvatar = e.Student.Avatar,
                        studentEmail = e.Student.Email,
                        courseName = e.Course.Title,
                        courseId = e.CourseId.ToString(),
                        completionDate = e.CompletedAt.Value.ToString("yyyy-MM-dd"),
                        score = e.AverageQuizScore ?? 0,
                        badgeIssued = e.CertificateIssued,
                        certificateId = e.CertificateUrl
                    })
                    .ToListAsync();

                return Ok(completions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course completions");
                return StatusCode(500, new { error = "An error occurred while retrieving course completions" });
            }
        }

        [HttpGet("recent-signups")]
        public async Task<IActionResult> GetRecentSignups([FromQuery] int limit = 10)
        {
            try
            {
                var signups = await _context.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .Take(limit)
                    .Select(u => new
                    {
                        id = u.Id,
                        name = u.FullName,
                        email = u.Email,
                        joined = u.CreatedAt,
                        status = u.Status.ToString(),
                        role = u.Role.ToString(),
                        avatar = u.Avatar
                    })
                    .ToListAsync();

                return Ok(signups);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent signups");
                return StatusCode(500, new { error = "An error occurred while retrieving recent signups" });
            }
        }

        [HttpGet("course-statistics")]
        public async Task<IActionResult> GetCourseStatisticsDashboard()
        {
            try
            {
                var statistics = await _context.Courses
                    .Where(c => c.Status == CourseStatus.Active)
                    .OrderByDescending(c => c.Enrollments.Count)
                    .Take(10)
                    .Select(c => new
                    {
                        name = c.Title,
                        students = c.Enrollments.Count,
                        completion = c.Enrollments.Count > 0 
                            ? (int)((c.Enrollments.Count(e => e.CompletedAt != null) / (double)c.Enrollments.Count) * 100)
                            : 0,
                        rating = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0,
                        revenue = c.Enrollments.Where(e => e.Course.Price > 0).Sum(e => e.Course.Price).ToString("₱#,##0.00"),
                        category = c.Category,
                        instructor = c.Instructor.FullName,
                        lastUpdated = GetRelativeTime(c.UpdatedAt)
                    })
                    .ToListAsync();

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course statistics");
                return StatusCode(500, new { error = "An error occurred while retrieving course statistics" });
            }
        }

        [HttpGet("policies")]
        public async Task<IActionResult> GetPolicies()
        {
            try
            {
                // For now, return static policy data
                // In a real implementation, you might store these in a database
                var policies = new object[]
                {
                    new
                    {
                        id = "policy-001",
                        name = "Course Completion Requirements",
                        type = "Learning Policy",
                        status = "Active",
                        lastUpdated = DateTime.UtcNow.AddDays(-2).ToString("yyyy-MM-dd"),
                        updatedBy = "Michael Chen",
                        description = "Defines minimum requirements for course completion certificates",
                        compliance = 98
                    },
                    new
                    {
                        id = "policy-002",
                        name = "Assessment Guidelines",
                        type = "Learning Policy",
                        status = "Active",
                        lastUpdated = DateTime.UtcNow.AddDays(-7).ToString("yyyy-MM-dd"),
                        updatedBy = "Admin Team",
                        description = "Standards for creating and evaluating assessments",
                        compliance = 95
                    },
                    new
                    {
                        id = "policy-003",
                        name = "Data Privacy Policy",
                        type = "Compliance",
                        status = "Active",
                        lastUpdated = DateTime.UtcNow.AddDays(-15).ToString("yyyy-MM-dd"),
                        updatedBy = "Legal Team",
                        description = "GDPR and data protection compliance guidelines",
                        compliance = 100,
                        priority = "High"
                    },
                    new
                    {
                        id = "policy-004",
                        name = "Content Moderation Guidelines",
                        type = "Platform Policy",
                        status = "Under Review",
                        lastUpdated = DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-dd"),
                        updatedBy = "Content Team",
                        description = "Guidelines for appropriate content and community standards",
                        compliance = 88,
                        priority = "Medium"
                    }
                };

                return Ok(policies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving policies");
                return StatusCode(500, new { error = "An error occurred while retrieving policies" });
            }
        }

        [HttpGet("tasks")]
        public async Task<IActionResult> GetTasks([FromQuery] string status = null)
        {
            try
            {
                // For now, return static task data
                // In a real implementation, you would have a task management system
                var tasks = new object[]
                {
                    new
                    {
                        id = "task-001",
                        title = "Review new course submissions",
                        description = "Review and approve 5 pending course submissions",
                        status = "pending",
                        priority = "High",
                        assignee = "John Administrator",
                        dueDate = DateTime.UtcNow.AddDays(1).ToString("yyyy-MM-dd"),
                        createdDate = DateTime.UtcNow.AddDays(-2).ToString("yyyy-MM-dd")
                    },
                    new
                    {
                        id = "task-002",
                        title = "Update user permissions",
                        description = "Update permission settings for new instructors",
                        status = "pending",
                        priority = "Medium",
                        assignee = "Sarah Manager",
                        dueDate = DateTime.UtcNow.AddDays(2).ToString("yyyy-MM-dd"),
                        createdDate = DateTime.UtcNow.AddDays(-3).ToString("yyyy-MM-dd")
                    },
                    new
                    {
                        id = "task-003",
                        title = "Generate monthly report",
                        description = "Prepare January 2025 platform analytics report",
                        status = "pending",
                        priority = "Low",
                        dueDate = DateTime.UtcNow.AddDays(5).ToString("yyyy-MM-dd"),
                        createdDate = DateTime.UtcNow.AddDays(-5).ToString("yyyy-MM-dd")
                    }
                };

                if (!string.IsNullOrEmpty(status))
                {
                    tasks = tasks.Where(t => ((dynamic)t).status == status).ToArray();
                }

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tasks");
                return StatusCode(500, new { error = "An error occurred while retrieving tasks" });
            }
        }

        [HttpGet("onboarding-progress")]
        public async Task<IActionResult> GetOnboardingProgress()
        {
            try
            {
                var totalUsers = await _context.Users.CountAsync();
                var profileCompleted = await _context.Users.CountAsync(u => !string.IsNullOrEmpty(u.FullName));
                var firstEnrollment = await _context.Users.CountAsync(u => u.Enrollments.Any());
                var firstCertificate = await _context.Users.CountAsync(u => u.Enrollments.Any(e => e.CertificateIssued));
                
                var onboardingSteps = new[]
                {
                    new
                    {
                        step = "Account Setup",
                        completion = 92,
                        users = totalUsers,
                        averageTime = "5 minutes"
                    },
                    new
                    {
                        step = "Profile Completion",
                        completion = totalUsers > 0 ? (int)((profileCompleted / (double)totalUsers) * 100) : 0,
                        users = profileCompleted,
                        averageTime = "12 minutes"
                    },
                    new
                    {
                        step = "First Course Enrollment",
                        completion = totalUsers > 0 ? (int)((firstEnrollment / (double)totalUsers) * 100) : 0,
                        users = firstEnrollment,
                        averageTime = "2 days"
                    },
                    new
                    {
                        step = "First Certificate",
                        completion = totalUsers > 0 ? (int)((firstCertificate / (double)totalUsers) * 100) : 0,
                        users = firstCertificate,
                        averageTime = "14 days"
                    }
                };

                return Ok(onboardingSteps);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving onboarding progress");
                return StatusCode(500, new { error = "An error occurred while retrieving onboarding progress" });
            }
        }

        [HttpGet("team-members")]
        public async Task<IActionResult> GetTeamMembers()
        {
            try
            {
                var teamMembers = await _context.Users
                    .Where(u => u.Role == UserRole.Admin)
                    .Select(u => new
                    {
                        id = u.Id,
                        name = u.FullName,
                        role = "Admin",
                        email = u.Email,
                        status = u.LastLoginAt > DateTime.UtcNow.AddMinutes(-30) ? "Online" : 
                                u.LastLoginAt > DateTime.UtcNow.AddHours(-1) ? "Away" : "Offline",
                        lastActive = GetRelativeTime(u.LastLoginAt ?? u.CreatedAt),
                        avatar = u.Avatar,
                        permissions = new[] { "all" },
                        tasksAssigned = 0,
                        tasksCompleted = 0
                    })
                    .ToListAsync();

                return Ok(teamMembers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving team members");
                return StatusCode(500, new { error = "An error occurred while retrieving team members" });
            }
        }

        private static string GetRelativeTime(DateTime dateTime)
        {
            var timeSpan = DateTime.UtcNow - dateTime;
            
            if (timeSpan.TotalMinutes < 1)
                return "just now";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes}m ago";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours}h ago";
            if (timeSpan.TotalDays < 7)
                return $"{(int)timeSpan.TotalDays} days ago";
            if (timeSpan.TotalDays < 30)
                return $"{(int)(timeSpan.TotalDays / 7)} weeks ago";
            
            return dateTime.ToString("MMM dd, yyyy");
        }

        #endregion
    }
}