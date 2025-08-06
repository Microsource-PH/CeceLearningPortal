using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public class SubscriptionPlanService : ISubscriptionPlanService
    {
        private readonly ApplicationDbContext _context;

        public SubscriptionPlanService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<SubscriptionPlanDto>> GetAllPlansAsync()
        {
            var plans = await _context.SubscriptionPlans
                .Include(p => p.Subscriptions)
                .ToListAsync();

            return plans.Select(p => MapToDto(p)).ToList();
        }

        public async Task<SubscriptionPlanDto?> GetPlanByIdAsync(int id)
        {
            var plan = await _context.SubscriptionPlans
                .Include(p => p.Subscriptions)
                .FirstOrDefaultAsync(p => p.Id == id);

            return plan != null ? MapToDto(plan) : null;
        }

        public async Task<SubscriptionPlanDto> CreatePlanAsync(CreateSubscriptionPlanDto dto)
        {
            var plan = new SubscriptionPlan
            {
                Name = dto.Name,
                Description = dto.Description,
                PlanType = Enum.Parse<SubscriptionPlanType>(dto.Type),
                MonthlyPrice = dto.Price,
                YearlyPrice = dto.Price * 10, // Default yearly price
                Features = dto.Features,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                HasUnlimitedAccess = dto.Type.ToLower() == "learner",
                MaxCourseAccess = dto.Type.ToLower() == "learner" ? -1 : 0,
                HasAnalytics = dto.Type.ToLower() == "creator",
                HasPrioritySupport = false,
                DisplayOrder = 0,
                IsRecommended = false
            };

            // Map limits if provided
            if (dto.Limits != null)
            {
                if (dto.Limits.ContainsKey("maxCourses"))
                    plan.MaxCoursesCanCreate = Convert.ToInt32(dto.Limits["maxCourses"]);
                if (dto.Limits.ContainsKey("maxStudents"))
                    plan.MaxStudentsPerCourse = Convert.ToInt32(dto.Limits["maxStudents"]);
            }

            _context.SubscriptionPlans.Add(plan);
            await _context.SaveChangesAsync();

            return MapToDto(plan);
        }

        public async Task<SubscriptionPlanDto> UpdatePlanAsync(int id, UpdateSubscriptionPlanDto dto)
        {
            var plan = await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Id == id);
            if (plan == null)
            {
                throw new InvalidOperationException("Subscription plan not found");
            }

            if (!string.IsNullOrEmpty(dto.Name))
                plan.Name = dto.Name;
            if (!string.IsNullOrEmpty(dto.Description))
                plan.Description = dto.Description;
            if (!string.IsNullOrEmpty(dto.Type))
                plan.PlanType = Enum.Parse<SubscriptionPlanType>(dto.Type);
            if (dto.Price.HasValue)
            {
                plan.MonthlyPrice = dto.Price.Value;
                plan.YearlyPrice = dto.Price.Value * 10;
            }
            if (dto.Features != null)
                plan.Features = dto.Features;
            if (dto.IsActive.HasValue)
                plan.IsActive = dto.IsActive.Value;

            // Map limits to specific properties
            if (dto.Limits != null)
            {
                if (dto.Limits.ContainsKey("maxCourses"))
                    plan.MaxCoursesCanCreate = Convert.ToInt32(dto.Limits["maxCourses"]);
                if (dto.Limits.ContainsKey("maxStudents"))
                    plan.MaxStudentsPerCourse = Convert.ToInt32(dto.Limits["maxStudents"]);
            }

            plan.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updatedPlan = await _context.SubscriptionPlans
                .Include(p => p.Subscriptions)
                .FirstAsync(p => p.Id == plan.Id);

            return MapToDto(updatedPlan);
        }

        public async Task<bool> DeletePlanAsync(int id)
        {
            var plan = await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Id == id);
            if (plan == null)
            {
                return false;
            }

            // Don't delete if there are active subscriptions
            var hasActiveSubscriptions = await _context.Subscriptions
                .AnyAsync(s => s.SubscriptionPlanId == plan.Id && s.Status == SubscriptionStatus.Active);

            if (hasActiveSubscriptions)
            {
                // Mark as inactive instead of deleting
                plan.IsActive = false;
                plan.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return true;
            }

            _context.SubscriptionPlans.Remove(plan);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> TogglePlanStatusAsync(int id, bool isActive)
        {
            var plan = await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Id == id);
            if (plan == null)
            {
                return false;
            }

            plan.IsActive = isActive;
            plan.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        private SubscriptionPlanDto MapToDto(SubscriptionPlan plan)
        {
            var activeSubscriptions = plan.Subscriptions.Where(s => s.Status == SubscriptionStatus.Active).ToList();
            var revenue = activeSubscriptions.Sum(s => s.Price);

            return new SubscriptionPlanDto
            {
                Id = plan.Id.ToString(),
                Name = plan.Name,
                Description = plan.Description,
                Type = plan.PlanType.ToString().ToLower(),
                BillingCycle = "monthly", // Default to monthly
                Price = plan.MonthlyPrice,
                Currency = "USD",
                Features = plan.Features,
                Limits = new Dictionary<string, object>
                {
                    { "maxCourses", plan.MaxCoursesCanCreate ?? -1 },
                    { "maxStudents", plan.MaxStudentsPerCourse ?? -1 },
                    { "maxCourseAccess", plan.MaxCourseAccess }
                },
                IsActive = plan.IsActive,
                SubscriberCount = activeSubscriptions.Count,
                Revenue = revenue,
                CreatedAt = plan.CreatedAt,
                UpdatedAt = plan.UpdatedAt
            };
        }
    }
}