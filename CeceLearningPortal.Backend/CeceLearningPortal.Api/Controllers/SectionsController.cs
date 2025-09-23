using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/sections")]
    public class SectionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public SectionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] bool featuredOnly = false)
        {
            var q = _context.ResourceSections.AsQueryable();
            if (featuredOnly) q = q.Where(s => s.IsFeatured);

            var items = await q
                .OrderBy(s => s.SortOrder)
                .Select(s => new ResourceSectionDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Slug = s.Slug,
                    Description = s.Description,
                    SortOrder = s.SortOrder,
                    IsFeatured = s.IsFeatured,
                    Access = s.Access,
                    IconUrl = s.IconUrl,
                    Color = s.Color,
                    ResourceCount = s.Resources.Count(r => r.Status == "published"),
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                }).ToListAsync();
            return Ok(items);
        }

        [HttpGet("{slug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var s = await _context.ResourceSections.FirstOrDefaultAsync(x => x.Slug == slug);
            if (s == null) return NotFound();
            var dto = new ResourceSectionDto
            {
                Id = s.Id,
                Name = s.Name,
                Slug = s.Slug,
                Description = s.Description,
                SortOrder = s.SortOrder,
                IsFeatured = s.IsFeatured,
                Access = s.Access,
                IconUrl = s.IconUrl,
                Color = s.Color,
                ResourceCount = await _context.Resources.CountAsync(r => r.SectionId == s.Id && r.Status == "published"),
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            };
            return Ok(dto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateResourceSectionDto dto)
        {
            if (await _context.ResourceSections.AnyAsync(x => x.Slug == dto.Slug))
            {
                return Conflict(new { message = "Slug already exists" });
            }
            var entity = new ResourceSection
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Slug = dto.Slug,
                Description = dto.Description,
                SortOrder = dto.SortOrder,
                IsFeatured = dto.IsFeatured,
                Access = dto.Access,
                IconUrl = dto.IconUrl,
                Color = dto.Color,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.ResourceSections.Add(entity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBySlug), new { slug = entity.Slug }, new { id = entity.Id, slug = entity.Slug });
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateResourceSectionDto dto)
        {
            var s = await _context.ResourceSections.FindAsync(id);
            if (s == null) return NotFound();
            if (dto.Name != null) s.Name = dto.Name;
            if (dto.Description != null) s.Description = dto.Description;
            if (dto.SortOrder.HasValue) s.SortOrder = dto.SortOrder.Value;
            if (dto.IsFeatured.HasValue) s.IsFeatured = dto.IsFeatured.Value;
            if (dto.Access != null) s.Access = dto.Access;
            if (dto.IconUrl != null) s.IconUrl = dto.IconUrl;
            if (dto.Color != null) s.Color = dto.Color;
            s.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var s = await _context.ResourceSections.FindAsync(id);
            if (s == null) return NotFound();
            _context.ResourceSections.Remove(s);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

