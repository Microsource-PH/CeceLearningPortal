using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/resources")]
    public class ResourcesHubController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ResourcesHubController> _logger;

        public ResourcesHubController(ApplicationDbContext context, ILogger<ResourcesHubController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Listing + basic search
        [HttpPost("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search([FromBody] ResourceSearchDto dto)
        {
            var q = _context.Resources
                .Include(r => r.Section)
                .Include(r => r.ResourceResourceTags).ThenInclude(rrt => rrt.Tag)
                .AsQueryable();

            // Access filtering for anonymous or authenticated users
            var isAdmin = User.IsInRole("Admin");
            var isAuthenticated = User.Identity?.IsAuthenticated == true;
            if (!isAdmin)
            {
                if (!isAuthenticated)
                {
                    q = q.Where(r => r.Access == "public");
                }
                else
                {
                    q = q.Where(r => r.Access == "public" || r.Access == "students");
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.Query))
            {
                var query = dto.Query.Trim().ToLower();
                q = q.Where(r => r.Title.ToLower().Contains(query) || (r.Summary != null && r.Summary.ToLower().Contains(query)));
            }
            if (dto.SectionId.HasValue)
            {
                q = q.Where(r => r.SectionId == dto.SectionId.Value);
            }
            if (dto.TagIds != null && dto.TagIds.Count > 0)
            {
                q = q.Where(r => r.ResourceResourceTags.Any(t => dto.TagIds.Contains(t.TagId)));
            }
            if (dto.Types != null && dto.Types.Count > 0)
            {
                q = q.Where(r => dto.Types.Contains(r.Type));
            }
            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                q = q.Where(r => r.Status == dto.Status);
            }
            else
            {
                // Default to published for anonymous listings
                q = q.Where(r => r.Status == "published");
            }

            q = dto.SortBy switch
            {
                "most-viewed" => q.OrderByDescending(r => r.Views),
                "most-bookmarked" => q.OrderByDescending(r => r.Bookmarks),
                _ => q.OrderByDescending(r => r.PublishedAt ?? r.UpdatedAt)
            };

            var page = dto.Page <= 0 ? 1 : dto.Page;
            var size = dto.PageSize <= 0 ? 20 : dto.PageSize;
            var skip = (page - 1) * size;

            var total = await q.CountAsync();
            var items = await q.Skip(skip).Take(size).ToListAsync();

            // Determine bookmarks for current user
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var bookmarkedSet = new HashSet<Guid>();
            if (!string.IsNullOrEmpty(userId))
            {
                bookmarkedSet = _context.ResourceBookmarks.Where(b => b.UserId == userId).Select(b => b.ResourceId).ToHashSet();
            }

            var results = items.Select(r => new ResourceDto
            {
                Id = r.Id,
                Title = r.Title,
                Slug = r.Slug,
                Summary = r.Summary,
                Type = r.Type,
                Source = r.Source,
                FileUrl = r.FileUrl,
                ExternalUrl = r.ExternalUrl,
                ThumbnailUrl = r.ThumbnailUrl,
                Section = new ResourceSectionDto { Id = r.Section.Id, Name = r.Section.Name, Slug = r.Section.Slug },
                Tags = r.ResourceResourceTags.Select(t => new ResourceTagDto { Id = t.Tag.Id, Name = t.Tag.Name, Slug = t.Tag.Slug, UsageCount = t.Tag.UsageCount }).ToList(),
                Access = r.Access,
                OwnerName = r.OwnerUserId,
                Status = r.Status,
                Version = r.Version,
                Views = r.Views,
                Downloads = r.Downloads,
                Bookmarks = r.Bookmarks,
                IsBookmarked = bookmarkedSet.Contains(r.Id),
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                PublishedAt = r.PublishedAt,
                FileSize = r.FileSize,
                MimeType = r.MimeType,
                Duration = r.Duration,
                PageCount = r.PageCount
            });

            return Ok(new { total, page, pageSize = size, items = results });
        }

        [HttpGet("{slug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var r = await _context.Resources
                .Include(x => x.Section)
                .Include(x => x.ResourceResourceTags).ThenInclude(rrt => rrt.Tag)
                .FirstOrDefaultAsync(x => x.Slug == slug);
            if (r == null) return NotFound();

            // Access control
            var isAdmin = User.IsInRole("Admin");
            var isAuthenticated = User.Identity?.IsAuthenticated == true;
            if (!isAdmin)
            {
                var allowed = r.Access == "public" || (isAuthenticated && r.Access == "students");
                if (!allowed) return Forbid();
                if (r.Status != "published") return Forbid();
            }

            // Increment views
            r.Views += 1;
            await _context.SaveChangesAsync();

            var dto = new ResourceDetailDto
            {
                Id = r.Id,
                Title = r.Title,
                Slug = r.Slug,
                Summary = r.Summary,
                Body = r.Body,
                Type = r.Type,
                Source = r.Source,
                FileUrl = r.FileUrl,
                ExternalUrl = r.ExternalUrl,
                ThumbnailUrl = r.ThumbnailUrl,
                Section = new ResourceSectionDto { Id = r.Section.Id, Name = r.Section.Name, Slug = r.Section.Slug },
                Tags = r.ResourceResourceTags.Select(t => new ResourceTagDto { Id = t.Tag.Id, Name = t.Tag.Name, Slug = t.Tag.Slug, UsageCount = t.Tag.UsageCount }).ToList(),
                Access = r.Access,
                OwnerName = r.OwnerUserId,
                Status = r.Status,
                Version = r.Version,
                Views = r.Views,
                Downloads = r.Downloads,
                Bookmarks = r.Bookmarks,
                IsBookmarked = false,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                PublishedAt = r.PublishedAt,
                FileSize = r.FileSize,
                MimeType = r.MimeType,
                Duration = r.Duration,
                PageCount = r.PageCount,
                MetaTitle = r.MetaTitle,
                MetaDescription = r.MetaDescription,
                OpenGraphImage = r.OpenGraphImage,
                RelatedResources = new List<ResourceDto>(),
                Comments = new List<ResourceCommentDto>()
            };
            return Ok(dto);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateResourceDto dto)
        {
            if (await _context.Resources.AnyAsync(x => x.Slug == dto.Slug))
            {
                return Conflict(new { message = "Slug already exists" });
            }
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var resource = new Resource
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Slug = dto.Slug,
                Summary = dto.Summary,
                Body = dto.Body,
                Type = dto.Type,
                Source = dto.Source,
                FileUrl = dto.FileUrl,
                ExternalUrl = dto.ExternalUrl,
                ThumbnailUrl = dto.ThumbnailUrl,
                SectionId = dto.SectionId,
                Access = dto.Access ?? "students",
                OwnerUserId = userId,
                Status = "draft",
                Version = 1,
                MetaTitle = dto.MetaTitle,
                MetaDescription = dto.MetaDescription,
                OpenGraphImage = dto.OpenGraphImage,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            if (dto.TagIds != null)
            {
                foreach (var tagId in dto.TagIds)
                {
                    resource.ResourceResourceTags.Add(new ResourceResourceTag
                    {
                        ResourceId = resource.Id,
                        TagId = tagId
                    });
                }
            }
            _context.Resources.Add(resource);
            await _context.SaveChangesAsync();
            return Ok(new { id = resource.Id, slug = resource.Slug });
        }

        [HttpPut("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateResourceDto dto)
        {
            var r = await _context.Resources.Include(x => x.ResourceResourceTags).FirstOrDefaultAsync(x => x.Id == id);
            if (r == null) return NotFound();
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!User.IsInRole("Admin") && r.OwnerUserId != userId) return Forbid();

            if (dto.Title != null) r.Title = dto.Title;
            if (dto.Summary != null) r.Summary = dto.Summary;
            if (dto.Body != null) r.Body = dto.Body;
            if (dto.FileUrl != null) r.FileUrl = dto.FileUrl;
            if (dto.ExternalUrl != null) r.ExternalUrl = dto.ExternalUrl;
            if (dto.ThumbnailUrl != null) r.ThumbnailUrl = dto.ThumbnailUrl;
            if (dto.SectionId.HasValue) r.SectionId = dto.SectionId.Value;
            if (dto.Access != null) r.Access = dto.Access;
            if (dto.Status != null) r.Status = dto.Status; // trust only Admin later
            if (dto.TagIds != null)
            {
                r.ResourceResourceTags.Clear();
                foreach (var tagId in dto.TagIds)
                {
                    r.ResourceResourceTags.Add(new ResourceResourceTag { ResourceId = r.Id, TagId = tagId });
                }
            }
            if (dto.MetaTitle != null) r.MetaTitle = dto.MetaTitle;
            if (dto.MetaDescription != null) r.MetaDescription = dto.MetaDescription;
            if (dto.OpenGraphImage != null) r.OpenGraphImage = dto.OpenGraphImage;
            r.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id:guid}/submit-for-review")]
        [Authorize]
        public async Task<IActionResult> SubmitForReview(Guid id)
        {
            var r = await _context.Resources.FindAsync(id);
            if (r == null) return NotFound();
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!User.IsInRole("Admin") && r.OwnerUserId != userId) return Forbid();
            r.Status = "in_review";
            r.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("{id:guid}/publish")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Publish(Guid id)
        {
            var r = await _context.Resources.FindAsync(id);
            if (r == null) return NotFound();
            r.Status = "published";
            r.PublishedAt = DateTime.UtcNow;
            r.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var r = await _context.Resources.FindAsync(id);
            if (r == null) return NotFound();
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!User.IsInRole("Admin") && r.OwnerUserId != userId) return Forbid();
            _context.Resources.Remove(r);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id:guid}/downloaded")]
        [AllowAnonymous]
        public async Task<IActionResult> MarkDownloaded(Guid id)
        {
            var r = await _context.Resources.FindAsync(id);
            if (r == null) return NotFound();
            r.Downloads += 1;
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
