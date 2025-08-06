using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly INotificationService _notificationService;
        private readonly ILogger<AdminService> _logger;

        public AdminService(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            INotificationService notificationService,
            ILogger<AdminService> logger)
        {
            _context = context;
            _userManager = userManager;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<IEnumerable<UserManagementDto>> GetUsersAsync(UserManagementFilterDto filter)
        {
            var query = _context.Users.AsQueryable();

            // Apply filters
            if (filter.PendingApprovalOnly == true)
            {
                query = query.Where(u => u.Status == UserStatus.PendingApproval);
            }

            if (filter.RoleFilter.HasValue)
            {
                query = query.Where(u => u.Role == filter.RoleFilter.Value);
            }

            if (filter.StatusFilter.HasValue)
            {
                query = query.Where(u => u.Status == filter.StatusFilter.Value);
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                query = query.Where(u => 
                    u.FullName.Contains(filter.SearchTerm) ||
                    u.Email.Contains(filter.SearchTerm) ||
                    u.UserName.Contains(filter.SearchTerm));
            }

            if (filter.CreatedAfter.HasValue)
            {
                query = query.Where(u => u.CreatedAt >= filter.CreatedAfter.Value);
            }

            if (filter.CreatedBefore.HasValue)
            {
                query = query.Where(u => u.CreatedAt <= filter.CreatedBefore.Value);
            }

            // Apply pagination
            var totalCount = await query.CountAsync();
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(u => new UserManagementDto
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    Email = u.Email,
                    FullName = u.FullName,
                    Role = u.Role,
                    Status = u.Status,
                    CreatedAt = u.CreatedAt,
                    LastLoginAt = u.LastLoginAt,
                    EmailConfirmed = u.EmailConfirmed
                })
                .ToListAsync();

            return users;
        }

        public async Task<UserManagementDto> GetUserByIdAsync(string userId)
        {
            var user = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new UserManagementDto
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    Email = u.Email,
                    FullName = u.FullName,
                    Role = u.Role,
                    Status = u.Status,
                    CreatedAt = u.CreatedAt,
                    LastLoginAt = u.LastLoginAt,
                    EmailConfirmed = u.EmailConfirmed
                })
                .FirstOrDefaultAsync();

            return user;
        }

        public async Task<UserManagementStatsDto> GetUserManagementStatsAsync()
        {
            var currentDate = DateTime.UtcNow;
            var startOfMonth = new DateTime(currentDate.Year, currentDate.Month, 1);
            var startOfLastMonth = startOfMonth.AddMonths(-1);

            var stats = new UserManagementStatsDto
            {
                TotalUsers = await _context.Users.CountAsync(),
                ActiveUsers = await _context.Users.CountAsync(u => u.Status == UserStatus.Active),
                PendingApprovals = await _context.Users.CountAsync(u => u.Status == UserStatus.PendingApproval),
                SuspendedUsers = await _context.Users.CountAsync(u => u.Status == UserStatus.Suspended),
                
                UsersByRole = await _context.Users
                    .GroupBy(u => u.Role.ToString())
                    .Select(g => new { Role = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(g => g.Role, g => g.Count),
                
                UsersByStatus = await _context.Users
                    .GroupBy(u => u.Status.ToString())
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(g => g.Status, g => g.Count),
                
                NewUsersThisMonth = await _context.Users
                    .CountAsync(u => u.CreatedAt >= startOfMonth),
                
                NewUsersLastMonth = await _context.Users
                    .CountAsync(u => u.CreatedAt >= startOfLastMonth && u.CreatedAt < startOfMonth)
            };

            return stats;
        }

        public async Task<bool> ApproveUserAsync(ApproveUserDto approveDto, string adminId)
        {
            var user = await _context.Users.FindAsync(approveDto.UserId);
            if (user == null) return false;

            if (approveDto.Approve)
            {
                user.Status = UserStatus.Active;
                _logger.LogInformation("User {UserId} approved by admin {AdminId}", approveDto.UserId, adminId);
            }
            else
            {
                user.Status = UserStatus.Suspended;
                _logger.LogInformation("User {UserId} rejected by admin {AdminId}. Reason: {Reason}", 
                    approveDto.UserId, adminId, approveDto.Reason);
            }

            await _context.SaveChangesAsync();
            
            // Send notification
            await SendApprovalNotificationAsync(user.Id, approveDto.Approve, approveDto.Reason);

            return true;
        }

        public async Task<bool> UpdateUserStatusAsync(UpdateUserStatusDto statusDto, string adminId)
        {
            var user = await _context.Users.FindAsync(statusDto.UserId);
            if (user == null) return false;

            var oldStatus = user.Status;
            user.Status = statusDto.Status;

            _logger.LogInformation("User {UserId} status changed from {OldStatus} to {NewStatus} by admin {AdminId}. Reason: {Reason}", 
                statusDto.UserId, oldStatus, statusDto.Status, adminId, statusDto.Reason);

            await _context.SaveChangesAsync();
            
            // Send notification
            await SendStatusChangeNotificationAsync(user.Id, statusDto.Status, statusDto.Reason);

            return true;
        }

        public async Task<UserManagementDto> CreateAdminAsync(CreateAdminDto createDto)
        {
            var user = new ApplicationUser
            {
                UserName = createDto.UserName,
                Email = createDto.Email,
                FullName = createDto.FullName,
                Role = UserRole.Admin,
                Status = UserStatus.Active,
                CreatedAt = DateTime.UtcNow,
                EmailConfirmed = true // Auto-confirm admin accounts
            };

            var result = await _userManager.CreateAsync(user, createDto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to create admin user: {errors}");
            }

            // Add to Admin role
            await _userManager.AddToRoleAsync(user, "Admin");

            _logger.LogInformation("New admin user created: {UserId} ({Email})", user.Id, user.Email);

            return new UserManagementDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                Status = user.Status,
                CreatedAt = user.CreatedAt,
                EmailConfirmed = user.EmailConfirmed
            };
        }

        public async Task<IEnumerable<InstructorApprovalDto>> GetPendingInstructorApprovalsAsync()
        {
            var approvals = await _context.InstructorApprovals
                .Include(a => a.User)
                .Where(a => a.Status == ApprovalStatus.Pending)
                .OrderBy(a => a.SubmittedAt)
                .Select(a => new InstructorApprovalDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    UserName = a.User.FullName,
                    UserEmail = a.User.Email,
                    Bio = a.Bio,
                    Qualifications = a.Qualifications,
                    TeachingExperience = a.TeachingExperience,
                    LinkedInProfile = a.LinkedInProfile,
                    WebsiteUrl = a.WebsiteUrl,
                    Status = a.Status.ToString(),
                    ReviewerNotes = a.ReviewerNotes,
                    SubmittedAt = a.SubmittedAt,
                    ReviewedAt = a.ReviewedAt,
                    ReviewedBy = a.ReviewedBy
                })
                .ToListAsync();

            return approvals;
        }

        public async Task<bool> ReviewInstructorApprovalAsync(int approvalId, ReviewInstructorApprovalDto reviewDto, string adminId)
        {
            var approval = await _context.InstructorApprovals
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == approvalId);

            if (approval == null) return false;

            approval.Status = Enum.Parse<ApprovalStatus>(reviewDto.Status);
            approval.ReviewerNotes = reviewDto.ReviewerNotes;
            approval.ReviewedAt = DateTime.UtcNow;
            approval.ReviewedBy = adminId;

            // Update user role if approved
            if (approval.Status == ApprovalStatus.Approved)
            {
                approval.User.Role = UserRole.Instructor;
                approval.User.Status = UserStatus.Active;
                
                // Add to Instructor role
                await _userManager.AddToRoleAsync(approval.User, "Instructor");
                await _userManager.RemoveFromRoleAsync(approval.User, "Student");
            }

            await _context.SaveChangesAsync();

            // Send notification
            await _notificationService.SendNotificationAsync(
                approval.UserId,
                $"Instructor Application {approval.Status}",
                approval.Status == ApprovalStatus.Approved 
                    ? "Congratulations! Your instructor application has been approved. You can now create and manage courses."
                    : $"Your instructor application has been {approval.Status.ToString().ToLower()}. {reviewDto.ReviewerNotes}",
                NotificationType.AccountUpdate
            );

            _logger.LogInformation("Instructor approval {ApprovalId} reviewed by admin {AdminId}. Status: {Status}", 
                approvalId, adminId, approval.Status);

            return true;
        }

        public async Task SendApprovalNotificationAsync(string userId, bool approved, string reason = null)
        {
            var title = approved ? "Account Approved" : "Account Not Approved";
            var message = approved 
                ? "Your account has been approved. You can now access all features."
                : $"Your account approval was declined. {reason ?? "Please contact support for more information."}";

            await _notificationService.SendNotificationAsync(
                userId,
                title,
                message,
                NotificationType.AccountUpdate
            );
        }

        public async Task SendStatusChangeNotificationAsync(string userId, UserStatus newStatus, string reason = null)
        {
            var statusMessage = newStatus switch
            {
                UserStatus.Active => "Your account has been activated.",
                UserStatus.Suspended => $"Your account has been suspended. {reason ?? "Please contact support for more information."}",
                UserStatus.Inactive => "Your account has been marked as inactive.",
                _ => $"Your account status has been changed to {newStatus}."
            };

            await _notificationService.SendNotificationAsync(
                userId,
                "Account Status Update",
                statusMessage,
                NotificationType.AccountUpdate
            );
        }

        // New methods for enhanced admin functionality
        public async Task<bool> UpdateUserRoleAsync(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            // Validate role
            if (!Enum.TryParse<UserRole>(role, out var userRole))
                return false;

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, role);

            user.Role = userRole;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("User {UserId} role updated to {Role}", userId, role);
            return true;
        }

        public async Task<object> GetUserSubscriptionAsync(string userId)
        {
            var subscription = await _context.Subscriptions
                .Include(s => s.User)
                .Where(s => s.UserId == userId && s.Status == SubscriptionStatus.Active)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            if (subscription == null)
                return new { hasSubscription = false };

            var plan = await _context.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Id == subscription.SubscriptionPlanId);

            return new
            {
                hasSubscription = true,
                subscription = new
                {
                    id = subscription.Id,
                    planId = subscription.SubscriptionPlanId,
                    plan = plan?.Name ?? "Unknown Plan",
                    status = subscription.Status,
                    startDate = subscription.StartDate,
                    expiresAt = subscription.EndDate,
                    amount = subscription.Price,
                    nextBillingDate = subscription.NextBillingDate,
                    autoRenew = true
                }
            };
        }

        public async Task<bool> UpdateUserSubscriptionAsync(string userId, string planId, bool isBilledYearly = false)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            var plan = await _context.SubscriptionPlans.FindAsync(int.Parse(planId));
            if (plan == null) return false;

            // Cancel existing active subscriptions
            var existingSubscriptions = await _context.Subscriptions
                .Where(s => s.UserId == userId && s.Status == SubscriptionStatus.Active)
                .ToListAsync();

            foreach (var sub in existingSubscriptions)
            {
                sub.Status = SubscriptionStatus.Cancelled;
                sub.UpdatedAt = DateTime.UtcNow;
            }

            // Create new subscription
            var subscription = new Subscription
            {
                UserId = userId,
                SubscriptionPlanId = int.Parse(planId),
                Status = SubscriptionStatus.Active,
                PlanName = plan.Name,
                Price = isBilledYearly ? plan.YearlyPrice : plan.MonthlyPrice,
                BillingCycle = isBilledYearly ? "Yearly" : "Monthly",
                StartDate = DateTime.UtcNow,
                EndDate = isBilledYearly ? DateTime.UtcNow.AddYears(1) : DateTime.UtcNow.AddMonths(1),
                NextBillingDate = plan.PlanType switch
                {
                    SubscriptionPlanType.Learner => isBilledYearly ? DateTime.UtcNow.AddYears(1) : DateTime.UtcNow.AddMonths(1),
                    SubscriptionPlanType.Creator => isBilledYearly ? DateTime.UtcNow.AddYears(1) : DateTime.UtcNow.AddMonths(1),
                    _ => DateTime.UtcNow.AddMonths(1)
                },
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} subscription updated to plan {PlanId}", userId, planId);
            return true;
        }

        public async Task<CourseDto> CreateCourseAsync(CreateCourseDto dto, string adminId)
        {
            var course = new Course
            {
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                Price = dto.Price,
                OriginalPrice = dto.OriginalPrice,
                Duration = dto.Duration,
                Level = Enum.Parse<CourseLevel>(dto.Level),
                Thumbnail = dto.Thumbnail,
                Status = Enum.Parse<CourseStatus>(dto.Status),
                InstructorId = adminId, // Admin creates as instructor
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsPublished = dto.Status == "active",
                PublishedAt = dto.Status == "active" ? DateTime.UtcNow : null
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            // Create approval record (auto-approved for admin)
            var approval = new CourseApproval
            {
                CourseId = course.Id,
                SubmittedById = adminId,
                ReviewedById = adminId,
                Status = "approved",
                Feedback = "Admin-created course",
                SubmittedAt = DateTime.UtcNow,
                ReviewedAt = DateTime.UtcNow
            };

            _context.CourseApprovals.Add(approval);
            await _context.SaveChangesAsync();

            return MapToCourseDto(course);
        }

        public async Task<CourseDto> UpdateCourseAsync(int courseId, UpdateCourseDto dto)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null) return null;

            if (!string.IsNullOrEmpty(dto.Title))
                course.Title = dto.Title;
            if (!string.IsNullOrEmpty(dto.Description))
                course.Description = dto.Description;
            if (!string.IsNullOrEmpty(dto.Category))
                course.Category = dto.Category;
            if (dto.Price.HasValue)
                course.Price = dto.Price.Value;
            if (dto.OriginalPrice.HasValue)
                course.OriginalPrice = dto.OriginalPrice.Value;
            if (!string.IsNullOrEmpty(dto.Duration))
                course.Duration = dto.Duration;
            if (!string.IsNullOrEmpty(dto.Level))
                course.Level = Enum.Parse<CourseLevel>(dto.Level);
            if (!string.IsNullOrEmpty(dto.Thumbnail))
                course.Thumbnail = dto.Thumbnail;
            if (!string.IsNullOrEmpty(dto.Status))
            {
                course.Status = Enum.Parse<CourseStatus>(dto.Status);
                course.IsPublished = dto.Status == "active";
                if (course.IsPublished && !course.PublishedAt.HasValue)
                    course.PublishedAt = DateTime.UtcNow;
            }

            course.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToCourseDto(course);
        }

        public async Task<bool> DeleteCourseAsync(int courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null) return false;

            // Soft delete
            course.Status = CourseStatus.Archived;
            course.IsPublished = false;
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ApproveCourseAsync(int courseId, string adminId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null) return false;

            course.Status = CourseStatus.Active;
            course.IsPublished = true;
            course.PublishedAt = DateTime.UtcNow;
            course.UpdatedAt = DateTime.UtcNow;

            // Update or create approval record
            var approval = await _context.CourseApprovals
                .FirstOrDefaultAsync(a => a.CourseId == courseId && a.Status == "pending");

            if (approval != null)
            {
                approval.Status = "approved";
                approval.ReviewedById = adminId;
                approval.ReviewedAt = DateTime.UtcNow;
            }
            else
            {
                approval = new CourseApproval
                {
                    CourseId = courseId,
                    SubmittedById = course.InstructorId,
                    ReviewedById = adminId,
                    Status = "approved",
                    SubmittedAt = DateTime.UtcNow,
                    ReviewedAt = DateTime.UtcNow
                };
                _context.CourseApprovals.Add(approval);
            }

            await _context.SaveChangesAsync();

            // Notify instructor
            await _notificationService.SendNotificationAsync(
                course.InstructorId,
                "Course Approved",
                $"Your course '{course.Title}' has been approved and is now live!",
                NotificationType.CourseUpdate
            );

            return true;
        }

        public async Task<bool> RejectCourseAsync(int courseId, string reason, string adminId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null) return false;

            course.Status = CourseStatus.Draft;
            course.IsPublished = false;
            course.UpdatedAt = DateTime.UtcNow;

            // Update or create approval record
            var approval = await _context.CourseApprovals
                .FirstOrDefaultAsync(a => a.CourseId == courseId && a.Status == "pending");

            if (approval != null)
            {
                approval.Status = "rejected";
                approval.ReviewedById = adminId;
                approval.ReviewedAt = DateTime.UtcNow;
                approval.Feedback = reason;
            }
            else
            {
                approval = new CourseApproval
                {
                    CourseId = courseId,
                    SubmittedById = course.InstructorId,
                    ReviewedById = adminId,
                    Status = "rejected",
                    Feedback = reason,
                    SubmittedAt = DateTime.UtcNow,
                    ReviewedAt = DateTime.UtcNow
                };
                _context.CourseApprovals.Add(approval);
            }

            await _context.SaveChangesAsync();

            // Notify instructor
            await _notificationService.SendNotificationAsync(
                course.InstructorId,
                "Course Revision Required",
                $"Your course '{course.Title}' requires revision. Reason: {reason}",
                NotificationType.CourseUpdate
            );

            return true;
        }

        private CourseDto MapToCourseDto(Course course)
        {
            return new CourseDto
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                Category = course.Category,
                Price = course.Price,
                OriginalPrice = course.OriginalPrice,
                Duration = course.Duration,
                Level = course.Level.ToString(),
                Thumbnail = course.Thumbnail,
                Status = course.Status.ToString(),
                InstructorId = course.InstructorId,
                InstructorName = course.Instructor?.FullName ?? "Unknown",
                IsBestseller = false, // Default value
                Features = course.Features ?? new List<string>(),
                PreviewUrl = null, // Can be set later
                EnrollmentType = course.EnrollmentType.ToString(),
                StudentsCount = course.Enrollments?.Count ?? 0,
                AverageRating = course.Reviews?.Any() == true ? course.Reviews.Average(r => r.Rating) : 0,
                LecturesCount = course.Modules?.Sum(m => m.Lessons?.Count ?? 0) ?? 0,
                CreatedAt = course.CreatedAt,
                UpdatedAt = course.UpdatedAt
            };
        }
    }
}