using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Services;
using System.Security.Claims;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LearningController : ControllerBase
    {
        private readonly ILearningService _learningService;
        private readonly ILogger<LearningController> _logger;

        public LearningController(ILearningService learningService, ILogger<LearningController> logger)
        {
            _learningService = learningService;
            _logger = logger;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var dashboard = await _learningService.GetLearnerDashboardAsync(userId);
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving learning dashboard");
                return StatusCode(500, new { message = "An error occurred while retrieving dashboard" });
            }
        }

        [HttpGet("activities")]
        public async Task<IActionResult> GetActivities([FromQuery] string category = null)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var activities = await _learningService.GetLearningActivitiesAsync(userId, category);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving learning activities");
                return StatusCode(500, new { message = "An error occurred while retrieving activities" });
            }
        }

        [HttpGet("weekly-goals")]
        public async Task<IActionResult> GetWeeklyGoals()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var goals = await _learningService.GetWeeklyGoalsAsync(userId);
                return Ok(goals);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving weekly goals");
                return StatusCode(500, new { message = "An error occurred while retrieving goals" });
            }
        }

        [HttpPost("weekly-goals")]
        public async Task<IActionResult> CreateWeeklyGoal([FromBody] CreateWeeklyGoalDto goalDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var goal = await _learningService.CreateWeeklyGoalAsync(userId, goalDto);
                return Ok(goal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating weekly goal");
                return StatusCode(500, new { message = "An error occurred while creating goal" });
            }
        }

        [HttpPut("weekly-goals/{goalId}")]
        public async Task<IActionResult> UpdateWeeklyGoal(string goalId, [FromBody] UpdateWeeklyGoalDto goalDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var goal = await _learningService.UpdateWeeklyGoalAsync(userId, goalId, goalDto);
                
                if (goal == null)
                {
                    return NotFound(new { message = "Goal not found" });
                }
                
                return Ok(goal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating weekly goal {goalId}");
                return StatusCode(500, new { message = "An error occurred while updating goal" });
            }
        }

        [HttpPost("activities/{activityId}/complete")]
        public async Task<IActionResult> CompleteActivity(string activityId, [FromBody] CompleteActivityDto completeDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var result = await _learningService.CompleteActivityAsync(userId, activityId, completeDto);
                
                if (result == null)
                {
                    return NotFound(new { message = "Activity not found" });
                }
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error completing activity {activityId}");
                return StatusCode(500, new { message = "An error occurred while completing activity" });
            }
        }

        [HttpGet("achievements")]
        public async Task<IActionResult> GetAchievements()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var achievements = await _learningService.GetAchievementsAsync(userId);
                return Ok(achievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievements");
                return StatusCode(500, new { message = "An error occurred while retrieving achievements" });
            }
        }

        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard([FromQuery] string period = "weekly")
        {
            try
            {
                var leaderboard = await _learningService.GetLeaderboardAsync(period);
                return Ok(leaderboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving leaderboard");
                return StatusCode(500, new { message = "An error occurred while retrieving leaderboard" });
            }
        }

        [HttpGet("progress/{courseId}")]
        public async Task<IActionResult> GetCourseProgress(int courseId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var progress = await _learningService.GetCourseProgressAsync(userId, courseId);
                
                if (progress == null)
                {
                    return NotFound(new { message = "Course progress not found" });
                }
                
                return Ok(progress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving progress for course {courseId}");
                return StatusCode(500, new { message = "An error occurred while retrieving progress" });
            }
        }

        [HttpPost("progress/{courseId}/update")]
        public async Task<IActionResult> UpdateCourseProgress(int courseId, [FromBody] UpdateProgressDto progressDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var progress = await _learningService.UpdateCourseProgressAsync(userId, courseId, progressDto);
                
                if (progress == null)
                {
                    return NotFound(new { message = "Course not found or not enrolled" });
                }
                
                return Ok(progress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating progress for course {courseId}");
                return StatusCode(500, new { message = "An error occurred while updating progress" });
            }
        }

        [HttpGet("streak")]
        public async Task<IActionResult> GetLearningStreak()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var streak = await _learningService.GetLearningStreakAsync(userId);
                return Ok(streak);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving learning streak");
                return StatusCode(500, new { message = "An error occurred while retrieving streak" });
            }
        }
    }
}