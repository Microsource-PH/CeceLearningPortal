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
    [Route("api" )]
    public class CommentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CommentsController> _logger;

        public CommentsController(ApplicationDbContext context, ILogger<CommentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("/api/resources/{resourceId:guid}/comments")]
        [AllowAnonymous]
        public async Task<IActionResult> GetForResource(Guid resourceId)
        {
            var exists = await _context.Resources.AnyAsync(r => r.Id == resourceId);
            if (!exists) return NotFound();

            var comments = await _context.ResourceComments
                .Where(c => c.ResourceId == resourceId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            var dtoMap = comments.ToDictionary(
                c => c.Id,
                c => new ResourceCommentDto
                {
                    Id = c.Id,
                    ResourceId = c.ResourceId,
                    UserId = c.UserId,
                    UserName = string.Empty,
                    UserAvatar = string.Empty,
                    ParentCommentId = c.ParentCommentId,
                    Content = c.IsDeleted ? "[deleted]" : c.Content,
                    IsEdited = c.IsEdited,
                    IsDeleted = c.IsDeleted,
                    Replies = new List<ResourceCommentDto>(),
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                });

            // Build tree
            ResourceCommentDto? root;
            var roots = new List<ResourceCommentDto>();
            foreach (var c in comments)
            {
                var dto = dtoMap[c.Id];
                if (c.ParentCommentId.HasValue && dtoMap.TryGetValue(c.ParentCommentId.Value, out var parentDto))
                {
                    parentDto.Replies.Add(dto);
                }
                else
                {
                    roots.Add(dto);
                }
            }

            return Ok(roots);
        }

        [HttpPost("/api/resources/{resourceId:guid}/comments")]
        [Authorize]
        public async Task<IActionResult> Add(Guid resourceId, [FromBody] CreateResourceCommentDto dto)
        {
            var resource = await _context.Resources.FindAsync(resourceId);
            if (resource == null) return NotFound();
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var comment = new ResourceComment
            {
                Id = Guid.NewGuid(),
                ResourceId = resourceId,
                UserId = userId!,
                ParentCommentId = dto.ParentCommentId,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.ResourceComments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new { id = comment.Id });
        }

        [HttpPut("/api/comments/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateResourceCommentDto dto)
        {
            var c = await _context.ResourceComments.FindAsync(id);
            if (c == null) return NotFound();
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!User.IsInRole("Admin") && c.UserId != userId) return Forbid();
            if (c.IsDeleted) return BadRequest(new { message = "Cannot edit deleted comment" });
            c.Content = dto.Content;
            c.IsEdited = true;
            c.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("/api/comments/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var c = await _context.ResourceComments.FindAsync(id);
            if (c == null) return NotFound();
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!User.IsInRole("Admin") && c.UserId != userId) return Forbid();
            c.IsDeleted = true;
            c.Content = string.Empty;
            c.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

