using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/directory")]
    public class DirectoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DirectoryController> _logger;

        public DirectoryController(ApplicationDbContext context, ILogger<DirectoryController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("submit")]
        [Authorize]
        public async Task<IActionResult> Submit([FromBody] CreateStudentProfileDto dto)
        {
            if (!dto.ConsentPublicListing)
            {
                return BadRequest(new { message = "ConsentPublicListing is required" });
            }
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var existing = await _context.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (existing != null)
            {
                return Conflict(new { message = "Profile already exists" });
            }
            var profile = new StudentProfile
            {
                Id = Guid.NewGuid(),
                UserId = userId!,
                DisplayName = dto.DisplayName,
                Headline = dto.Headline,
                About = dto.About,
                Skills = dto.Skills,
                LocationCity = dto.LocationCity,
                LocationCountry = dto.LocationCountry,
                TimeZone = dto.TimeZone,
                Languages = dto.Languages,
                PhotoUrl = dto.PhotoUrl,
                PortfolioLinksJson = JsonSerializer.Serialize(dto.PortfolioLinks ?? new Dictionary<string, string>()),
                LinkedInUrl = dto.LinkedInUrl,
                TwitterUrl = dto.TwitterUrl,
                FacebookUrl = dto.FacebookUrl,
                WebsiteUrl = dto.WebsiteUrl,
                GitHubUrl = dto.GitHubUrl,
                Availability = dto.Availability ?? "unavailable",
                Services = dto.Services ?? new List<string>(),
                HourlyRate = dto.HourlyRate,
                CertificationsJson = JsonSerializer.Serialize(dto.Certifications ?? new List<CertificationDto>()),
                ConsentPublicListing = dto.ConsentPublicListing,
                Status = "pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.StudentProfiles.Add(profile);
            await _context.SaveChangesAsync();
            return Ok(new { id = profile.Id, status = profile.Status });
        }

        [HttpPost("{id:guid}/review")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Review(Guid id, [FromBody] ReviewStudentProfileDto dto)
        {
            var p = await _context.StudentProfiles.FindAsync(id);
            if (p == null) return NotFound();
            if (dto.Status != "approved" && dto.Status != "rejected")
            {
                return BadRequest(new { message = "Invalid status" });
            }
            p.Status = dto.Status;
            p.RejectionReason = dto.Status == "rejected" ? dto.RejectionReason : null;
            p.ApprovedById = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            p.ApprovedAt = DateTime.UtcNow;
            p.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search([FromBody] StudentProfileSearchDto dto)
        {
            var q = _context.StudentProfiles.Where(p => p.Status == "approved").AsQueryable();
            if (!string.IsNullOrWhiteSpace(dto.Query))
            {
                var query = dto.Query.Trim().ToLower();
                q = q.Where(p => p.DisplayName.ToLower().Contains(query) || (p.Headline != null && p.Headline.ToLower().Contains(query)) || (p.About != null && p.About.ToLower().Contains(query)));
            }
            if (dto.Skills != null && dto.Skills.Count > 0)
            {
                foreach (var skill in dto.Skills)
                {
                    var s = skill.ToLower();
                    q = q.Where(p => p.Skills.Any(x => x.ToLower() == s));
                }
            }
            if (!string.IsNullOrWhiteSpace(dto.Availability))
            {
                q = q.Where(p => p.Availability == dto.Availability);
            }
            if (!string.IsNullOrWhiteSpace(dto.LocationCity))
            {
                q = q.Where(p => p.LocationCity == dto.LocationCity);
            }
            if (!string.IsNullOrWhiteSpace(dto.LocationCountry))
            {
                q = q.Where(p => p.LocationCountry == dto.LocationCountry);
            }

            var page = dto.Page <= 0 ? 1 : dto.Page;
            var size = dto.PageSize <= 0 ? 20 : dto.PageSize;
            var skip = (page - 1) * size;

            var total = await q.CountAsync();
            var items = await q.OrderByDescending(p => p.UpdatedAt).Skip(skip).Take(size).ToListAsync();
            var result = items.Select(p => new StudentProfileDto
            {
                Id = p.Id,
                UserId = p.UserId,
                DisplayName = p.DisplayName,
                Headline = p.Headline,
                About = p.About,
                Skills = p.Skills,
                LocationCity = p.LocationCity,
                LocationCountry = p.LocationCountry,
                TimeZone = p.TimeZone,
                Languages = p.Languages,
                PhotoUrl = p.PhotoUrl,
                LinkedInUrl = p.LinkedInUrl,
                TwitterUrl = p.TwitterUrl,
                FacebookUrl = p.FacebookUrl,
                WebsiteUrl = p.WebsiteUrl,
                GitHubUrl = p.GitHubUrl,
                Availability = p.Availability,
                Services = p.Services,
                HourlyRate = p.HourlyRate,
                Status = p.Status,
                ProfileViews = p.ProfileViews,
                ContactClicks = p.ContactClicks,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            });
            return Ok(new { total, page, pageSize = size, items = result });
        }

        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var p = await _context.StudentProfiles.FirstOrDefaultAsync(x => x.Id == id && x.Status == "approved");
            if (p == null) return NotFound();
            p.ProfileViews += 1;
            await _context.SaveChangesAsync();
            var dto = new StudentProfileDto
            {
                Id = p.Id,
                UserId = p.UserId,
                DisplayName = p.DisplayName,
                Headline = p.Headline,
                About = p.About,
                Skills = p.Skills,
                LocationCity = p.LocationCity,
                LocationCountry = p.LocationCountry,
                TimeZone = p.TimeZone,
                Languages = p.Languages,
                PhotoUrl = p.PhotoUrl,
                LinkedInUrl = p.LinkedInUrl,
                TwitterUrl = p.TwitterUrl,
                FacebookUrl = p.FacebookUrl,
                WebsiteUrl = p.WebsiteUrl,
                GitHubUrl = p.GitHubUrl,
                Availability = p.Availability,
                Services = p.Services,
                HourlyRate = p.HourlyRate,
                Status = p.Status,
                ProfileViews = p.ProfileViews,
                ContactClicks = p.ContactClicks,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            };
            return Ok(dto);
        }
    }
}

