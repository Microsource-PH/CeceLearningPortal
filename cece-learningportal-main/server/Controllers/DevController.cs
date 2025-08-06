using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Server.Services;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/dev")]
    [AllowAnonymous] // For development only - should be restricted in production
    public class DevController : ControllerBase
    {
        private readonly DataSeederService _seederService;
        private readonly IWebHostEnvironment _env;

        public DevController(DataSeederService seederService, IWebHostEnvironment env)
        {
            _seederService = seederService;
            _env = env;
        }

        [HttpPost("seed-sarah-wilson")]
        public async Task<IActionResult> SeedSarahWilson()
        {
            // Only allow in development
            if (!_env.IsDevelopment())
            {
                return Forbid("This endpoint is only available in development mode");
            }

            try
            {
                await _seederService.SeedSarahWilsonData();
                return Ok(new { success = true, message = "Sarah Wilson's data has been seeded successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Failed to seed data", error = ex.Message });
            }
        }
    }
}