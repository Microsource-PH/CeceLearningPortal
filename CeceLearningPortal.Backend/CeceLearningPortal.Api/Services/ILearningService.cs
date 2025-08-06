using CeceLearningPortal.Api.DTOs;

namespace CeceLearningPortal.Api.Services
{
    public interface ILearningService
    {
        Task<LearnerDashboardDto> GetLearnerDashboardAsync(string userId);
        Task<List<LearningActivityDto>> GetLearningActivitiesAsync(string userId, string category = null);
        Task<List<WeeklyGoalDto>> GetWeeklyGoalsAsync(string userId);
        Task<WeeklyGoalDto> CreateWeeklyGoalAsync(string userId, CreateWeeklyGoalDto goalDto);
        Task<WeeklyGoalDto> UpdateWeeklyGoalAsync(string userId, string goalId, UpdateWeeklyGoalDto goalDto);
        Task<ActivityCompletionResultDto> CompleteActivityAsync(string userId, string activityId, CompleteActivityDto completeDto);
        Task<List<AchievementDto>> GetAchievementsAsync(string userId);
        Task<LeaderboardDto> GetLeaderboardAsync(string period = "weekly");
        Task<LearningCourseProgressDto> GetCourseProgressAsync(string userId, int courseId);
        Task<LearningCourseProgressDto> UpdateCourseProgressAsync(string userId, int courseId, UpdateProgressDto progressDto);
        Task<LearningStreakDto> GetLearningStreakAsync(string userId);
    }
}