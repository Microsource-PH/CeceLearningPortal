using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Services;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IRevenueCalculationService _revenueService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, IRevenueCalculationService revenueService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _revenueService = revenueService;
            _logger = logger;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving user {id}");
                return StatusCode(500, new { message = "An error occurred while retrieving the user" });
            }
        }

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetUsers([FromQuery] UserFilterDto filter)
        {
            try
            {
                var users = await _userService.GetAllUsersAsync(filter);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, new { message = "An error occurred while retrieving users" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updateDto)
        {
            try
            {
                var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                
                // Users can only update their own profile unless they're admin
                if (currentUserId != id && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                var user = await _userService.UpdateUserAsync(id, updateDto);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }
                
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating user {id}");
                return StatusCode(500, new { message = "An error occurred while updating the user" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                var result = await _userService.DeleteUserAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "User not found" });
                }
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting user {id}");
                return StatusCode(500, new { message = "An error occurred while deleting the user" });
            }
        }

        [HttpPut("{id}/status")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ChangeUserStatus(string id, [FromBody] ChangeStatusDto dto)
        {
            try
            {
                var result = await _userService.ChangeUserStatusAsync(id, dto.Status);
                if (!result)
                {
                    return NotFound(new { message = "User not found" });
                }
                
                return Ok(new { message = "User status updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error changing status for user {id}");
                return StatusCode(500, new { message = "An error occurred while changing user status" });
            }
        }

        [HttpPut("{id}/role")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ChangeUserRole(string id, [FromBody] ChangeRoleDto dto)
        {
            try
            {
                var result = await _userService.ChangeUserRoleAsync(id, dto.Role);
                if (!result)
                {
                    return NotFound(new { message = "User not found" });
                }
                
                return Ok(new { message = "User role updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error changing role for user {id}");
                return StatusCode(500, new { message = "An error occurred while changing user role" });
            }
        }

        [HttpPost("instructor-approval")]
        public async Task<IActionResult> SubmitInstructorApproval([FromBody] SubmitInstructorApprovalDto approvalDto)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var approval = await _userService.SubmitInstructorApprovalAsync(userId, approvalDto);
                return Ok(approval);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting instructor approval");
                return StatusCode(500, new { message = "An error occurred while submitting instructor approval" });
            }
        }

        [HttpGet("{id}/instructor-approval")]
        public async Task<IActionResult> GetInstructorApproval(string id)
        {
            try
            {
                var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                
                // Users can only view their own approval unless they're admin
                if (currentUserId != id && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                var approval = await _userService.GetInstructorApprovalAsync(id);
                if (approval == null)
                {
                    return NotFound(new { message = "Instructor approval not found" });
                }
                
                return Ok(approval);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving instructor approval for user {id}");
                return StatusCode(500, new { message = "An error occurred while retrieving instructor approval" });
            }
        }

        [HttpPut("instructor-approval/{approvalId}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ReviewInstructorApproval(int approvalId, [FromBody] ReviewInstructorApprovalDto reviewDto)
        {
            try
            {
                var reviewerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var result = await _userService.ReviewInstructorApprovalAsync(approvalId, reviewDto, reviewerId);
                
                if (!result)
                {
                    return NotFound(new { message = "Instructor approval not found" });
                }
                
                return Ok(new { message = "Instructor approval reviewed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error reviewing instructor approval {approvalId}");
                return StatusCode(500, new { message = "An error occurred while reviewing instructor approval" });
            }
        }

        [HttpGet("{id}/stats")]
        public async Task<IActionResult> GetUserStats(string id)
        {
            try
            {
                var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                
                // Users can only view their own stats unless they're admin
                if (currentUserId != id && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                var stats = await _userService.GetUserStatsAsync(id);
                if (stats == null)
                {
                    return NotFound(new { message = "User not found" });
                }
                
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving stats for user {id}");
                return StatusCode(500, new { message = "An error occurred while retrieving user stats" });
            }
        }

        [HttpGet("{id}/revenue")]
        [Authorize(Policy = "InstructorOnly")]
        public async Task<IActionResult> GetInstructorRevenue(string id)
        {
            try
            {
                var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                
                // Users can only view their own revenue unless they're admin
                if (currentUserId != id && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                var revenue = await _revenueService.CalculateInstructorRevenueAsync(id);
                if (revenue == null)
                {
                    return NotFound(new { message = "Instructor not found" });
                }
                
                return Ok(revenue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving revenue for instructor {id}");
                return StatusCode(500, new { message = "An error occurred while retrieving instructor revenue" });
            }
        }
    }

    public class ChangeStatusDto
    {
        public string Status { get; set; }
    }

    public class ChangeRoleDto
    {
        public string Role { get; set; }
    }
}