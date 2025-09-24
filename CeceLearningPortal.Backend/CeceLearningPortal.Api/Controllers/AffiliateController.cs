using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CeceLearningPortal.Api.Controllers
{
  [ApiController]
  [Route("api/affiliate")]
  [Authorize]
  public class AffiliateController : ControllerBase
  {
    [HttpGet("me")]
    public IActionResult GetMyAffiliate()
    {
      var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "unknown";
      var code = $"CECE-{(userId.Length >= 6 ? userId.Substring(0, 6).ToUpper() : userId.ToUpper())}";
      // Stub stats; replace with real data when persistence is added
      return Ok(new
      {
        code,
        referrals = 0,
        clicks = 0,
        earnings = 0.0,
      });
    }

    [HttpPost("register")]
    public IActionResult Register()
    {
      // No-op placeholder; real implementation would persist an affiliate record for the user
      return Ok(new { registered = true });
    }
  }
}
