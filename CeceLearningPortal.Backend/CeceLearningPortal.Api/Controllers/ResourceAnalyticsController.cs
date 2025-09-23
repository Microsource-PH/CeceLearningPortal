using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/resource-analytics")]
    public class ResourceAnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public ResourceAnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("hub")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetHubAnalytics()
        {
            var totalResources = await _context.Resources.CountAsync();
            var totalSections = await _context.ResourceSections.CountAsync();
            var totalTags = await _context.ResourceTags.CountAsync();
            var totalProfiles = await _context.StudentProfiles.CountAsync(p => p.Status == "approved");
            var totalViews = await _context.Resources.SumAsync(r => (int?)r.Views) ?? 0;
            var totalDownloads = await _context.Resources.SumAsync(r => (int?)r.Downloads) ?? 0;
            var totalBookmarks = await _context.Resources.SumAsync(r => (int?)r.Bookmarks) ?? 0;

            var trending = await _context.Resources
                .Where(r => r.Status == "published")
                .OrderByDescending(r => r.Views)
                .ThenByDescending(r => r.UpdatedAt)
                .Take(10)
                .Select(r => new ResourceDto
                {
                    Id = r.Id,
                    Title = r.Title,
                    Slug = r.Slug,
                    Summary = r.Summary,
                    Type = r.Type,
                    ThumbnailUrl = r.ThumbnailUrl,
                    Views = r.Views,
                    Bookmarks = r.Bookmarks,
                    UpdatedAt = r.UpdatedAt
                }).ToListAsync();

            var popularSections = await _context.ResourceSections
                .Select(s => new ResourceSectionDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Slug = s.Slug,
                    ResourceCount = s.Resources.Count(r => r.Status == "published")
                })
                .OrderByDescending(s => s.ResourceCount)
                .Take(10)
                .ToListAsync();

            var popularTags = await _context.ResourceTags
                .OrderByDescending(t => t.UsageCount)
                .Take(20)
                .Select(t => new ResourceTagDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Slug = t.Slug,
                    UsageCount = t.UsageCount
                }).ToListAsync();

            var byType = await _context.Resources
                .GroupBy(r => r.Type)
                .Select(g => new { g.Key, Count = g.Count() })
                .ToListAsync();
            var byStatus = await _context.Resources
                .GroupBy(r => r.Status)
                .Select(g => new { g.Key, Count = g.Count() })
                .ToListAsync();

            var dto = new ResourceHubAnalyticsDto
            {
                TotalResources = totalResources,
                TotalSections = totalSections,
                TotalTags = totalTags,
                TotalProfiles = totalProfiles,
                TotalViews = totalViews,
                TotalDownloads = totalDownloads,
                TotalBookmarks = totalBookmarks,
                TrendingResources = trending,
                PopularSections = popularSections,
                PopularTags = popularTags,
                ResourcesByType = byType.ToDictionary(x => x.Key, x => x.Count),
                ResourcesByStatus = byStatus.ToDictionary(x => x.Key, x => x.Count)
            };
            return Ok(dto);
        }

        [HttpGet("resource/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> GetResourceAnalytics(Guid id)
        {
            var r = await _context.Resources.FirstOrDefaultAsync(x => x.Id == id);
            if (r == null) return NotFound();
            var dto = new ResourceAnalyticsDto
            {
                ResourceId = r.Id,
                Title = r.Title,
                TotalViews = r.Views,
                TotalDownloads = r.Downloads,
                TotalBookmarks = r.Bookmarks,
                DailyViews = new Dictionary<DateTime, int>(),
                DailyDownloads = new Dictionary<DateTime, int>(),
                TopReferrers = new List<string>()
            };
            return Ok(dto);
        }
    }
}

