using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/tags")]
    public class TagsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public TagsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var tags = await _context.ResourceTags
                .OrderByDescending(t => t.UsageCount)
                .Select(t => new ResourceTagDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Slug = t.Slug,
                    UsageCount = t.UsageCount
                }).ToListAsync();
            return Ok(tags);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateResourceTagDto dto)
        {
            if (await _context.ResourceTags.AnyAsync(x => x.Slug == dto.Slug))
            {
                return Conflict(new { message = "Slug already exists" });
            }
            var tag = new ResourceTag
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Slug = dto.Slug,
                CreatedAt = DateTime.UtcNow
            };
            _context.ResourceTags.Add(tag);
            await _context.SaveChangesAsync();
            return Ok(new { id = tag.Id, slug = tag.Slug });
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var tag = await _context.ResourceTags.FindAsync(id);
            if (tag == null) return NotFound();
            _context.ResourceTags.Remove(tag);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

