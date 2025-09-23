using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/bookmarks")]
    [Authorize]
    public class BookmarksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public BookmarksController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyBookmarks()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var bookmarks = await _context.ResourceBookmarks
                .Where(b => b.UserId == userId)
                .Include(b => b.Resource).ThenInclude(r => r.Section)
                .ToListAsync();

            var result = bookmarks.Select(b => new ResourceBookmarkDto
            {
                ResourceId = b.ResourceId,
                Notes = b.Notes,
                CreatedAt = b.CreatedAt,
                Resource = new ResourceDto
                {
                    Id = b.Resource.Id,
                    Title = b.Resource.Title,
                    Slug = b.Resource.Slug,
                    Summary = b.Resource.Summary,
                    Type = b.Resource.Type,
                    ThumbnailUrl = b.Resource.ThumbnailUrl,
                    Section = new ResourceSectionDto { Id = b.Resource.Section.Id, Name = b.Resource.Section.Name, Slug = b.Resource.Section.Slug },
                    UpdatedAt = b.Resource.UpdatedAt
                }
            });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] CreateResourceBookmarkDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var exists = await _context.ResourceBookmarks.AnyAsync(b => b.UserId == userId && b.ResourceId == dto.ResourceId);
            if (exists) return Conflict(new { message = "Already bookmarked" });

            _context.ResourceBookmarks.Add(new Models.ResourceBookmark
            {
                UserId = userId!,
                ResourceId = dto.ResourceId,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            });
            // increment counter
            var res = await _context.Resources.FindAsync(dto.ResourceId);
            if (res != null) res.Bookmarks += 1;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{resourceId:guid}")]
        public async Task<IActionResult> Remove(Guid resourceId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var bm = await _context.ResourceBookmarks.FindAsync(userId, resourceId);
            if (bm == null) return NotFound();
            _context.ResourceBookmarks.Remove(bm);
            var res = await _context.Resources.FindAsync(resourceId);
            if (res != null && res.Bookmarks > 0) res.Bookmarks -= 1;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

