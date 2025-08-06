using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public class SubscriptionManagementService : ISubscriptionManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly ILogger<SubscriptionManagementService> _logger;

        public SubscriptionManagementService(
            ApplicationDbContext context,
            INotificationService notificationService,
            ILogger<SubscriptionManagementService> logger)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
        }

        // Subscription Plan Management
        public async Task<IEnumerable<SubscriptionPlanManagementDto>> GetSubscriptionPlansAsync(SubscriptionPlanType? planType = null)
        {
            var query = _context.SubscriptionPlans.AsQueryable();
            
            if (planType.HasValue)
            {
                query = query.Where(p => p.PlanType == planType.Value);
            }

            var plans = await query
                .OrderBy(p => p.DisplayOrder)
                .ThenBy(p => p.MonthlyPrice)
                .Select(p => new SubscriptionPlanManagementDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    PlanType = p.PlanType,
                    MonthlyPrice = p.MonthlyPrice,
                    YearlyPrice = p.YearlyPrice,
                    MaxCourseAccess = p.MaxCourseAccess,
                    HasUnlimitedAccess = p.HasUnlimitedAccess,
                    MaxCoursesCanCreate = p.MaxCoursesCanCreate,
                    MaxStudentsPerCourse = p.MaxStudentsPerCourse,
                    TransactionFeePercentage = p.TransactionFeePercentage,
                    HasAnalytics = p.HasAnalytics,
                    HasPrioritySupport = p.HasPrioritySupport,
                    Features = p.Features,
                    IsActive = p.IsActive,
                    DisplayOrder = p.DisplayOrder,
                    IsRecommended = p.IsRecommended,
                    ActiveSubscribers = p.Subscriptions.Count(s => s.Status == SubscriptionStatus.Active),
                    MonthlyRevenue = p.Subscriptions
                        .Where(s => s.Status == SubscriptionStatus.Active)
                        .Sum(s => s.BillingCycle == "Monthly" ? s.Price : s.Price / 12)
                })
                .ToListAsync();

            return plans;
        }

        public async Task<SubscriptionPlanManagementDto> GetSubscriptionPlanByIdAsync(int planId)
        {
            var plan = await _context.SubscriptionPlans
                .Where(p => p.Id == planId)
                .Select(p => new SubscriptionPlanManagementDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    PlanType = p.PlanType,
                    MonthlyPrice = p.MonthlyPrice,
                    YearlyPrice = p.YearlyPrice,
                    MaxCourseAccess = p.MaxCourseAccess,
                    HasUnlimitedAccess = p.HasUnlimitedAccess,
                    MaxCoursesCanCreate = p.MaxCoursesCanCreate,
                    MaxStudentsPerCourse = p.MaxStudentsPerCourse,
                    TransactionFeePercentage = p.TransactionFeePercentage,
                    HasAnalytics = p.HasAnalytics,
                    HasPrioritySupport = p.HasPrioritySupport,
                    Features = p.Features,
                    IsActive = p.IsActive,
                    DisplayOrder = p.DisplayOrder,
                    IsRecommended = p.IsRecommended,
                    ActiveSubscribers = p.Subscriptions.Count(s => s.Status == SubscriptionStatus.Active),
                    MonthlyRevenue = p.Subscriptions
                        .Where(s => s.Status == SubscriptionStatus.Active)
                        .Sum(s => s.BillingCycle == "Monthly" ? s.Price : s.Price / 12)
                })
                .FirstOrDefaultAsync();

            return plan;
        }

        public async Task<SubscriptionPlanManagementDto> CreateSubscriptionPlanAsync(CreateSubscriptionPlanDto createDto)
        {
            var plan = new SubscriptionPlan
            {
                Name = createDto.Name,
                Description = createDto.Description,
                PlanType = createDto.PlanType,
                MonthlyPrice = createDto.MonthlyPrice,
                YearlyPrice = createDto.YearlyPrice,
                MaxCourseAccess = createDto.MaxCourseAccess,
                HasUnlimitedAccess = createDto.HasUnlimitedAccess,
                MaxCoursesCanCreate = createDto.MaxCoursesCanCreate,
                MaxStudentsPerCourse = createDto.MaxStudentsPerCourse,
                TransactionFeePercentage = createDto.TransactionFeePercentage,
                HasAnalytics = createDto.HasAnalytics,
                HasPrioritySupport = createDto.HasPrioritySupport,
                Features = createDto.Features,
                IsActive = true,
                DisplayOrder = createDto.DisplayOrder,
                IsRecommended = createDto.IsRecommended,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.SubscriptionPlans.Add(plan);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created new subscription plan: {PlanName} ({PlanType})", plan.Name, plan.PlanType);

            return await GetSubscriptionPlanByIdAsync(plan.Id);
        }

        public async Task<SubscriptionPlanManagementDto> UpdateSubscriptionPlanAsync(UpdateSubscriptionPlanDto updateDto)
        {
            var plan = await _context.SubscriptionPlans.FindAsync(updateDto.Id);
            if (plan == null) return null;

            if (updateDto.Name != null) plan.Name = updateDto.Name;
            if (updateDto.Description != null) plan.Description = updateDto.Description;
            if (updateDto.MonthlyPrice.HasValue) plan.MonthlyPrice = updateDto.MonthlyPrice.Value;
            if (updateDto.YearlyPrice.HasValue) plan.YearlyPrice = updateDto.YearlyPrice.Value;
            if (updateDto.MaxCourseAccess.HasValue) plan.MaxCourseAccess = updateDto.MaxCourseAccess.Value;
            if (updateDto.HasUnlimitedAccess.HasValue) plan.HasUnlimitedAccess = updateDto.HasUnlimitedAccess.Value;
            plan.MaxCoursesCanCreate = updateDto.MaxCoursesCanCreate;
            plan.MaxStudentsPerCourse = updateDto.MaxStudentsPerCourse;
            plan.TransactionFeePercentage = updateDto.TransactionFeePercentage;
            if (updateDto.HasAnalytics.HasValue) plan.HasAnalytics = updateDto.HasAnalytics.Value;
            if (updateDto.HasPrioritySupport.HasValue) plan.HasPrioritySupport = updateDto.HasPrioritySupport.Value;
            if (updateDto.Features != null) plan.Features = updateDto.Features;
            if (updateDto.IsActive.HasValue) plan.IsActive = updateDto.IsActive.Value;
            if (updateDto.DisplayOrder.HasValue) plan.DisplayOrder = updateDto.DisplayOrder.Value;
            if (updateDto.IsRecommended.HasValue) plan.IsRecommended = updateDto.IsRecommended.Value;
            plan.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated subscription plan: {PlanId} - {PlanName}", plan.Id, plan.Name);

            return await GetSubscriptionPlanByIdAsync(plan.Id);
        }

        public async Task<bool> DeleteSubscriptionPlanAsync(int planId)
        {
            var plan = await _context.SubscriptionPlans
                .Include(p => p.Subscriptions)
                .FirstOrDefaultAsync(p => p.Id == planId);

            if (plan == null) return false;

            // Check if there are active subscriptions
            if (plan.Subscriptions.Any(s => s.Status == SubscriptionStatus.Active))
            {
                throw new InvalidOperationException("Cannot delete plan with active subscriptions");
            }

            _context.SubscriptionPlans.Remove(plan);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted subscription plan: {PlanId} - {PlanName}", plan.Id, plan.Name);

            return true;
        }

        public async Task<bool> TogglePlanStatusAsync(int planId, bool isActive)
        {
            var plan = await _context.SubscriptionPlans.FindAsync(planId);
            if (plan == null) return false;

            plan.IsActive = isActive;
            plan.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Toggled subscription plan status: {PlanId} - IsActive: {IsActive}", planId, isActive);

            return true;
        }

        // Subscriber Management
        public async Task<IEnumerable<SubscriberManagementDto>> GetSubscribersAsync(SubscriberFilterDto filter)
        {
            var query = _context.Subscriptions
                .Include(s => s.User)
                .Include(s => s.SubscriptionPlan)
                .AsQueryable();

            // Apply filters
            if (filter.PlanType.HasValue)
            {
                query = query.Where(s => s.SubscriptionPlan.PlanType == filter.PlanType.Value);
            }

            if (filter.PlanId.HasValue)
            {
                query = query.Where(s => s.SubscriptionPlanId == filter.PlanId.Value);
            }

            if (filter.Status.HasValue)
            {
                query = query.Where(s => s.Status == filter.Status.Value);
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                query = query.Where(s => 
                    s.User.FullName.Contains(filter.SearchTerm) ||
                    s.User.Email.Contains(filter.SearchTerm) ||
                    s.User.UserName.Contains(filter.SearchTerm));
            }

            if (filter.SubscribedAfter.HasValue)
            {
                query = query.Where(s => s.StartDate >= filter.SubscribedAfter.Value);
            }

            if (filter.SubscribedBefore.HasValue)
            {
                query = query.Where(s => s.StartDate <= filter.SubscribedBefore.Value);
            }

            // Calculate total paid for each subscription
            var subscribers = await query
                .OrderByDescending(s => s.StartDate)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(s => new SubscriberManagementDto
                {
                    UserId = s.UserId,
                    UserName = s.User.UserName,
                    Email = s.User.Email,
                    FullName = s.User.FullName,
                    Role = s.User.Role,
                    SubscriptionId = s.Id,
                    PlanName = s.SubscriptionPlan.Name,
                    PlanType = s.SubscriptionPlan.PlanType,
                    Price = s.Price,
                    BillingCycle = s.BillingCycle,
                    Status = s.Status,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    NextBillingDate = s.NextBillingDate,
                    TotalPaid = _context.Payments
                        .Where(p => p.SubscriptionId == s.Id && p.Status == PaymentStatus.Completed)
                        .Sum(p => p.Amount)
                })
                .ToListAsync();

            return subscribers;
        }

        public async Task<SubscriberManagementDto> GetSubscriberByIdAsync(int subscriptionId)
        {
            var subscriber = await _context.Subscriptions
                .Include(s => s.User)
                .Include(s => s.SubscriptionPlan)
                .Where(s => s.Id == subscriptionId)
                .Select(s => new SubscriberManagementDto
                {
                    UserId = s.UserId,
                    UserName = s.User.UserName,
                    Email = s.User.Email,
                    FullName = s.User.FullName,
                    Role = s.User.Role,
                    SubscriptionId = s.Id,
                    PlanName = s.SubscriptionPlan.Name,
                    PlanType = s.SubscriptionPlan.PlanType,
                    Price = s.Price,
                    BillingCycle = s.BillingCycle,
                    Status = s.Status,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    NextBillingDate = s.NextBillingDate,
                    TotalPaid = _context.Payments
                        .Where(p => p.SubscriptionId == s.Id && p.Status == PaymentStatus.Completed)
                        .Sum(p => p.Amount)
                })
                .FirstOrDefaultAsync();

            return subscriber;
        }

        public async Task<bool> UpdateSubscriberAsync(UpdateSubscriberDto updateDto, string adminId)
        {
            var subscription = await _context.Subscriptions
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == updateDto.SubscriptionId);

            if (subscription == null) return false;

            var changes = new List<string>();

            if (updateDto.NewPlanId.HasValue)
            {
                var newPlan = await _context.SubscriptionPlans.FindAsync(updateDto.NewPlanId.Value);
                if (newPlan != null)
                {
                    subscription.SubscriptionPlanId = newPlan.Id;
                    subscription.Price = subscription.BillingCycle == "Monthly" ? newPlan.MonthlyPrice : newPlan.YearlyPrice;
                    changes.Add($"Plan changed to {newPlan.Name}");
                }
            }

            if (updateDto.NewStatus.HasValue)
            {
                subscription.Status = updateDto.NewStatus.Value;
                changes.Add($"Status changed to {updateDto.NewStatus.Value}");
            }

            if (updateDto.ExtendEndDate.HasValue)
            {
                subscription.EndDate = updateDto.ExtendEndDate.Value;
                subscription.NextBillingDate = updateDto.ExtendEndDate.Value;
                changes.Add($"End date extended to {updateDto.ExtendEndDate.Value:yyyy-MM-dd}");
            }

            await _context.SaveChangesAsync();

            // Notify user about changes
            if (changes.Any())
            {
                await NotifySubscriptionChangeAsync(
                    subscription.UserId,
                    "Subscription Updated",
                    $"Your subscription has been updated by an administrator. Changes: {string.Join(", ", changes)}. {updateDto.AdminNotes}"
                );
            }

            _logger.LogInformation("Admin {AdminId} updated subscription {SubscriptionId}. Changes: {Changes}", 
                adminId, updateDto.SubscriptionId, string.Join(", ", changes));

            return true;
        }

        public async Task<bool> CancelSubscriptionAsync(int subscriptionId, string reason, string adminId)
        {
            var subscription = await _context.Subscriptions.FindAsync(subscriptionId);
            if (subscription == null) return false;

            subscription.Status = SubscriptionStatus.Cancelled;
            subscription.EndDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await NotifySubscriptionChangeAsync(
                subscription.UserId,
                "Subscription Cancelled",
                $"Your subscription has been cancelled by an administrator. Reason: {reason}"
            );

            _logger.LogInformation("Admin {AdminId} cancelled subscription {SubscriptionId}. Reason: {Reason}", 
                adminId, subscriptionId, reason);

            return true;
        }

        // Statistics
        public async Task<SubscriptionStatisticsDto> GetSubscriptionStatisticsAsync()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var lastSixMonths = Enumerable.Range(0, 6)
                .Select(i => startOfMonth.AddMonths(-i))
                .OrderBy(d => d)
                .ToList();

            var activeSubscriptions = await _context.Subscriptions
                .Include(s => s.SubscriptionPlan)
                .Where(s => s.Status == SubscriptionStatus.Active)
                .ToListAsync();

            var stats = new SubscriptionStatisticsDto
            {
                TotalActiveSubscribers = activeSubscriptions.Count,
                TotalLearnerSubscribers = activeSubscriptions.Count(s => s.SubscriptionPlan.PlanType == SubscriptionPlanType.Learner),
                TotalCreatorSubscribers = activeSubscriptions.Count(s => s.SubscriptionPlan.PlanType == SubscriptionPlanType.Creator),
                MonthlyRecurringRevenue = activeSubscriptions.Sum(s => s.BillingCycle == "Monthly" ? s.Price : s.Price / 12),
                YearlyRecurringRevenue = activeSubscriptions.Sum(s => s.BillingCycle == "Monthly" ? s.Price * 12 : s.Price),
                AverageRevenuePerUser = activeSubscriptions.Any() ? activeSubscriptions.Average(s => s.Price) : 0,
                SubscribersByPlan = activeSubscriptions
                    .GroupBy(s => s.SubscriptionPlan.Name)
                    .ToDictionary(g => g.Key, g => g.Count()),
                RevenueByPlan = activeSubscriptions
                    .GroupBy(s => s.SubscriptionPlan.Name)
                    .ToDictionary(g => g.Key, g => g.Sum(s => s.BillingCycle == "Monthly" ? s.Price : s.Price / 12)),
                MonthlyGrowth = new List<MonthlyGrowthDto>()
            };

            // Calculate monthly growth
            foreach (var month in lastSixMonths)
            {
                var nextMonth = month.AddMonths(1);
                var newSubscribers = await _context.Subscriptions
                    .CountAsync(s => s.StartDate >= month && s.StartDate < nextMonth);
                var cancelledSubscribers = await _context.Subscriptions
                    .CountAsync(s => s.Status == SubscriptionStatus.Cancelled && 
                                   s.EndDate >= month && s.EndDate < nextMonth);
                var revenue = await _context.Payments
                    .Where(p => p.SubscriptionId != null && 
                               p.Status == PaymentStatus.Completed &&
                               p.CreatedAt >= month && p.CreatedAt < nextMonth)
                    .SumAsync(p => p.Amount);

                stats.MonthlyGrowth.Add(new MonthlyGrowthDto
                {
                    Month = month.ToString("yyyy-MM"),
                    NewSubscribers = newSubscribers,
                    CancelledSubscribers = cancelledSubscribers,
                    NetGrowth = newSubscribers - cancelledSubscribers,
                    Revenue = revenue
                });
            }

            // Calculate churn rate (last month)
            var lastMonth = startOfMonth.AddMonths(-1);
            var activeLastMonth = await _context.Subscriptions
                .CountAsync(s => s.Status == SubscriptionStatus.Active && s.StartDate < lastMonth);
            var cancelledLastMonth = await _context.Subscriptions
                .CountAsync(s => s.Status == SubscriptionStatus.Cancelled && 
                               s.EndDate >= lastMonth && s.EndDate < startOfMonth);
            
            stats.ChurnRate = activeLastMonth > 0 ? (decimal)cancelledLastMonth / activeLastMonth * 100 : 0;

            return stats;
        }

        public async Task<Dictionary<string, decimal>> CalculateMonthlyRecurringRevenueAsync()
        {
            var activeSubscriptions = await _context.Subscriptions
                .Include(s => s.SubscriptionPlan)
                .Where(s => s.Status == SubscriptionStatus.Active)
                .ToListAsync();

            var mrr = new Dictionary<string, decimal>
            {
                ["Total"] = activeSubscriptions.Sum(s => s.BillingCycle == "Monthly" ? s.Price : s.Price / 12),
                ["Learner"] = activeSubscriptions
                    .Where(s => s.SubscriptionPlan.PlanType == SubscriptionPlanType.Learner)
                    .Sum(s => s.BillingCycle == "Monthly" ? s.Price : s.Price / 12),
                ["Creator"] = activeSubscriptions
                    .Where(s => s.SubscriptionPlan.PlanType == SubscriptionPlanType.Creator)
                    .Sum(s => s.BillingCycle == "Monthly" ? s.Price : s.Price / 12)
            };

            return mrr;
        }

        // Course Management
        public async Task<IEnumerable<AdminCourseManagementDto>> GetCoursesForManagementAsync(CourseManagementFilterDto filter)
        {
            var query = _context.Courses
                .Include(c => c.Instructor)
                .Include(c => c.Enrollments)
                .Include(c => c.Reviews)
                .AsQueryable();

            // Apply filters
            if (filter.Status.HasValue)
            {
                query = query.Where(c => c.Status == filter.Status.Value);
            }

            if (!string.IsNullOrEmpty(filter.Category))
            {
                query = query.Where(c => c.Category == filter.Category);
            }

            if (filter.Level.HasValue)
            {
                query = query.Where(c => c.Level == filter.Level.Value);
            }

            if (!string.IsNullOrEmpty(filter.InstructorId))
            {
                query = query.Where(c => c.InstructorId == filter.InstructorId);
            }

            if (filter.NeedsReview == true)
            {
                query = query.Where(c => c.Status == CourseStatus.Draft || 
                                       c.Reviews.Any(r => r.IsFlagged));
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                query = query.Where(c => 
                    c.Title.Contains(filter.SearchTerm) ||
                    c.Description.Contains(filter.SearchTerm) ||
                    c.Instructor.FullName.Contains(filter.SearchTerm));
            }

            if (filter.MinPrice.HasValue)
            {
                query = query.Where(c => c.Price >= filter.MinPrice.Value);
            }

            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(c => c.Price <= filter.MaxPrice.Value);
            }

            if (filter.MinStudents.HasValue)
            {
                query = query.Where(c => c.Enrollments.Count >= filter.MinStudents.Value);
            }

            if (filter.CreatedAfter.HasValue)
            {
                query = query.Where(c => c.CreatedAt >= filter.CreatedAfter.Value);
            }

            if (filter.CreatedBefore.HasValue)
            {
                query = query.Where(c => c.CreatedAt <= filter.CreatedBefore.Value);
            }

            var courses = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(c => new AdminCourseManagementDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    InstructorId = c.InstructorId,
                    InstructorName = c.Instructor.FullName,
                    Price = c.Price,
                    Category = c.Category,
                    Level = c.Level,
                    Status = c.Status,
                    StudentsCount = c.Enrollments.Count,
                    AverageRating = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0,
                    TotalRevenue = c.Enrollments.Count * c.Price * 0.8m, // 80% to creator
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    NeedsReview = c.Status == CourseStatus.Draft,
                    AdminNotes = null // This would come from a separate admin notes table
                })
                .ToListAsync();

            return courses;
        }

        public async Task<AdminCourseManagementDto> GetCourseByIdForManagementAsync(int courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Instructor)
                .Include(c => c.Enrollments)
                .Include(c => c.Reviews)
                .Where(c => c.Id == courseId)
                .Select(c => new AdminCourseManagementDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    InstructorId = c.InstructorId,
                    InstructorName = c.Instructor.FullName,
                    Price = c.Price,
                    Category = c.Category,
                    Level = c.Level,
                    Status = c.Status,
                    StudentsCount = c.Enrollments.Count,
                    AverageRating = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0,
                    TotalRevenue = c.Enrollments.Count * c.Price * 0.8m,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    NeedsReview = c.Status == CourseStatus.Draft,
                    AdminNotes = null
                })
                .FirstOrDefaultAsync();

            return course;
        }

        public async Task<AdminCourseManagementDto> CreateCourseAsync(AdminCreateCourseDto createDto)
        {
            var course = new Course
            {
                Title = createDto.Title,
                Description = createDto.Description,
                InstructorId = createDto.InstructorId,
                Price = createDto.Price,
                OriginalPrice = createDto.OriginalPrice,
                Discount = createDto.Discount,
                Duration = createDto.Duration,
                Level = createDto.Level,
                Category = createDto.Category,
                Thumbnail = createDto.Thumbnail,
                Features = createDto.Features,
                PreviewUrl = createDto.PreviewUrl,
                Status = createDto.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Admin created course: {CourseId} - {Title}", course.Id, course.Title);

            return await GetCourseByIdForManagementAsync(course.Id);
        }

        public async Task<AdminCourseManagementDto> UpdateCourseAsync(AdminUpdateCourseDto updateDto)
        {
            var course = await _context.Courses.FindAsync(updateDto.Id);
            if (course == null) return null;

            course.Title = updateDto.Title;
            course.Description = updateDto.Description;
            course.InstructorId = updateDto.InstructorId;
            course.Price = updateDto.Price;
            course.OriginalPrice = updateDto.OriginalPrice;
            course.Discount = updateDto.Discount;
            course.Duration = updateDto.Duration;
            course.Level = updateDto.Level;
            course.Category = updateDto.Category;
            course.Thumbnail = updateDto.Thumbnail;
            course.Features = updateDto.Features;
            course.PreviewUrl = updateDto.PreviewUrl;
            course.Status = updateDto.Status;
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Admin updated course: {CourseId} - {Title}", course.Id, course.Title);

            // Notify instructor about the update
            await NotifyCourseApprovalAsync(
                course.InstructorId,
                course.Id,
                true,
                $"Your course has been updated by an administrator. {updateDto.AdminNotes}"
            );

            return await GetCourseByIdForManagementAsync(course.Id);
        }

        public async Task<bool> DeleteCourseAsync(int courseId, string adminId)
        {
            var course = await _context.Courses
                .Include(c => c.Enrollments)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null) return false;

            // Check if there are active enrollments
            if (course.Enrollments.Any())
            {
                throw new InvalidOperationException("Cannot delete course with active enrollments");
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Admin {AdminId} deleted course: {CourseId} - {Title}", adminId, course.Id, course.Title);

            return true;
        }

        public async Task<bool> ApproveCourseAsync(ApproveCourseDto approveDto, string adminId)
        {
            var course = await _context.Courses.FindAsync(approveDto.CourseId);
            if (course == null) return false;

            course.Status = approveDto.Approve ? CourseStatus.Active : CourseStatus.Inactive;
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await NotifyCourseApprovalAsync(
                course.InstructorId,
                course.Id,
                approveDto.Approve,
                approveDto.Reason
            );

            _logger.LogInformation("Admin {AdminId} {Action} course: {CourseId}. Reason: {Reason}", 
                adminId, approveDto.Approve ? "approved" : "rejected", approveDto.CourseId, approveDto.Reason);

            return true;
        }

        public async Task<CourseManagementStatsDto> GetCourseManagementStatsAsync()
        {
            var courses = await _context.Courses
                .Include(c => c.Enrollments)
                .Include(c => c.Reviews)
                .Include(c => c.Instructor)
                .ToListAsync();

            var stats = new CourseManagementStatsDto
            {
                TotalCourses = courses.Count,
                ActiveCourses = courses.Count(c => c.Status == CourseStatus.Active),
                DraftCourses = courses.Count(c => c.Status == CourseStatus.Draft),
                PendingReview = courses.Count(c => c.Status == CourseStatus.Draft),
                TotalEnrollments = courses.Sum(c => c.Enrollments.Count),
                TotalRevenue = courses.Sum(c => c.Enrollments.Count * c.Price),
                CoursesByCategory = courses
                    .GroupBy(c => c.Category)
                    .ToDictionary(g => g.Key, g => g.Count()),
                CoursesByLevel = courses
                    .GroupBy(c => c.Level.ToString())
                    .ToDictionary(g => g.Key, g => g.Count()),
                TopPerformingCourses = courses
                    .Where(c => c.Status == CourseStatus.Active)
                    .OrderByDescending(c => c.Enrollments.Count * c.Price)
                    .Take(10)
                    .Select(c => new TopPerformingCourseDto
                    {
                        CourseId = c.Id,
                        Title = c.Title,
                        InstructorName = c.Instructor.FullName,
                        EnrollmentCount = c.Enrollments.Count,
                        Revenue = c.Enrollments.Count * c.Price,
                        Rating = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0
                    })
                    .ToList()
            };

            return stats;
        }

        // Notifications
        public async Task NotifySubscriptionChangeAsync(string userId, string changeType, string details)
        {
            await _notificationService.SendNotificationAsync(
                userId,
                changeType,
                details,
                NotificationType.AccountUpdate
            );
        }

        public async Task NotifyCourseApprovalAsync(string instructorId, int courseId, bool approved, string reason = null)
        {
            var message = approved
                ? $"Your course has been approved and is now active. {reason}"
                : $"Your course was not approved. Reason: {reason}";

            await _notificationService.SendNotificationAsync(
                instructorId,
                "Course Review Update",
                message,
                NotificationType.CourseUpdate
            );
        }
    }
}