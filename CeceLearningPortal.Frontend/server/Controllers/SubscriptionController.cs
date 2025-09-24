using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/subscriptions")]
    [Authorize]
    public class SubscriptionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SubscriptionController> _logger;

        public SubscriptionController(ApplicationDbContext context, ILogger<SubscriptionController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentSubscription()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var subscription = await _context.Subscriptions
                .Where(s => s.UserId == userId && s.Status == "active")
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new
                {
                    id = s.Id,
                    planId = s.PlanId,
                    status = s.Status,
                    startDate = s.StartedAt,
                    endDate = s.ExpiresAt,
                    amount = s.Amount,
                    createdAt = s.CreatedAt,
                    updatedAt = s.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (subscription == null)
            {
                return Ok(null);
            }

            return Ok(subscription);
        }

        [HttpGet("plans")]
        public IActionResult GetSubscriptionPlans()
        {
            var plans = new[]
            {
                new
                {
                    id = "basic",
                    name = "Basic Plan",
                    price = 29.99,
                    duration = "month",
                    features = new[]
                    {
                        "Access to 100+ courses",
                        "Standard video quality",
                        "Mobile app access",
                        "Community support"
                    },
                    popular = false
                },
                new
                {
                    id = "premium",
                    name = "Premium Plan",
                    price = 49.99,
                    duration = "month",
                    features = new[]
                    {
                        "Unlimited course access",
                        "HD video quality",
                        "Downloadable resources",
                        "Priority support",
                        "Early access to new courses"
                    },
                    popular = true
                },
                new
                {
                    id = "annual",
                    name = "Annual Premium",
                    price = 479.99,
                    duration = "year",
                    features = new[]
                    {
                        "Everything in Premium",
                        "Save $119.89 per year",
                        "Exclusive webinars",
                        "1-on-1 mentorship session"
                    },
                    popular = false
                }
            };

            return Ok(plans);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateSubscription([FromBody] CreateSubscriptionDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // Cancel any existing active subscriptions
            var existingSubscriptions = await _context.Subscriptions
                .Where(s => s.UserId == userId && s.Status == "active")
                .ToListAsync();

            foreach (var existing in existingSubscriptions)
            {
                existing.Status = "cancelled";
                existing.UpdatedAt = DateTime.UtcNow;
            }

            // Create new subscription
            var subscription = new Subscription
            {
                UserId = userId,
                PlanId = dto.PlanId,
                Status = "pending",
                StartedAt = DateTime.UtcNow,
                ExpiresAt = dto.PlanId == "annual" 
                    ? DateTime.UtcNow.AddYears(1) 
                    : DateTime.UtcNow.AddMonths(1),
                Amount = dto.Price,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            // In a real implementation, integrate with payment provider here
            // For now, return a mock checkout URL
            return Ok(new
            {
                subscriptionId = subscription.Id,
                checkout_url = $"https://checkout.example.com/subscription/{subscription.Id}?plan={dto.PlanId}"
            });
        }

        [HttpPost("cancel")]
        public async Task<IActionResult> CancelSubscription()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var subscription = await _context.Subscriptions
                .Where(s => s.UserId == userId && s.Status == "active")
                .FirstOrDefaultAsync();

            if (subscription == null)
            {
                return NotFound("No active subscription found");
            }

            subscription.Status = "cancelled";
            subscription.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Subscription cancelled successfully" });
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetSubscriptionHistory()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var subscriptions = await _context.Subscriptions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new
                {
                    id = s.Id,
                    planId = s.PlanId,
                    status = s.Status,
                    startDate = s.StartedAt,
                    endDate = s.ExpiresAt,
                    amount = s.Amount,
                    createdAt = s.CreatedAt
                })
                .ToListAsync();

            return Ok(subscriptions);
        }
    }

    public class CreateSubscriptionDto
    {
        public string PlanId { get; set; } = "";
        public string PlanName { get; set; } = "";
        public decimal Price { get; set; }
        public string Type { get; set; } = "subscription";
    }
}