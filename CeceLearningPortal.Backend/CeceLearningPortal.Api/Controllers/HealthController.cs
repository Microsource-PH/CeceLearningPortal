using Microsoft.AspNetCore.Mvc;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "CeceLearningPortal API",
                version = "1.0.0"
            });
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new
            {
                message = "API is working!",
                backend_port = 5295,
                frontend_should_proxy_to = "http://localhost:5295"
            });
        }
    }
}