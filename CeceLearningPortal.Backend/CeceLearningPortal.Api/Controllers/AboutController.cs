using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/hub-about")]
    public class AboutController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public AboutController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Get()
        {
            var about = await _context.ResourceHubAbout.FirstOrDefaultAsync() ?? new Models.ResourceHubAbout();
            var dto = new ResourceHubAboutDto
            {
                Title = about.Title,
                HeroImageUrl = about.HeroImageUrl,
                Body = about.Body,
                CtaButtons = string.IsNullOrWhiteSpace(about.CtaButtonsJson) ? new List<CtaButtonDto>() : JsonSerializer.Deserialize<List<CtaButtonDto>>(about.CtaButtonsJson)!,
                UpdatedAt = about.UpdatedAt
            };
            return Ok(dto);
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update([FromBody] UpdateResourceHubAboutDto dto)
        {
            var about = await _context.ResourceHubAbout.FirstOrDefaultAsync();
            if (about == null)
            {
                about = new Models.ResourceHubAbout
                {
                    Title = dto.Title ?? "About Our Resource Hub",
                    HeroImageUrl = dto.HeroImageUrl,
                    Body = dto.Body,
                    CtaButtonsJson = JsonSerializer.Serialize(dto.CtaButtons ?? new List<CtaButtonDto>()),
                    UpdatedAt = DateTime.UtcNow
                };
                _context.ResourceHubAbout.Add(about);
            }
            else
            {
                if (dto.Title != null) about.Title = dto.Title;
                if (dto.HeroImageUrl != null) about.HeroImageUrl = dto.HeroImageUrl;
                if (dto.Body != null) about.Body = dto.Body;
                if (dto.CtaButtons != null) about.CtaButtonsJson = JsonSerializer.Serialize(dto.CtaButtons);
                about.UpdatedAt = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

