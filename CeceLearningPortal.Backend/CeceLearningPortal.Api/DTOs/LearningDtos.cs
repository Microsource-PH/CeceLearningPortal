namespace CeceLearningPortal.Api.DTOs
{
    public class LearnerDashboardDto
    {
        public LearnerStatsDto Stats { get; set; }
        public List<LearningCourseProgressDto> RecentCourses { get; set; }
        public List<LearningActivityDto> SuggestedActivities { get; set; }
        public List<WeeklyGoalDto> WeeklyGoals { get; set; }
        public LearningStreakDto Streak { get; set; }
        public GamificationStatsDto Gamification { get; set; }
    }

    public class LearnerStatsDto
    {
        public int TotalCourses { get; set; }
        public int CompletedCourses { get; set; }
        public int InProgressCourses { get; set; }
        public double TotalLearningHours { get; set; }
        public int CertificatesEarned { get; set; }
        public double AverageQuizScore { get; set; }
    }

    public class LearningCourseProgressDto
    {
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string Thumbnail { get; set; }
        public string Category { get; set; }
        public double Progress { get; set; }
        public int CompletedLessons { get; set; }
        public int TotalLessons { get; set; }
        public string EstimatedTimeLeft { get; set; }
        public DateTime LastAccessed { get; set; }
        public string Status { get; set; } // "in-progress", "completed", "not-started"
        public double Rating { get; set; }
    }

    public class LearningActivityDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; } // "video", "quiz", "assignment", "reading", "practice"
        public string Category { get; set; }
        public int EstimatedMinutes { get; set; }
        public int Points { get; set; }
        public string Difficulty { get; set; } // "easy", "medium", "hard"
        public string CourseId { get; set; }
        public string CourseName { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class WeeklyGoalDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; } // "lessons", "time", "quizzes", "assignments", "streak"
        public int Target { get; set; }
        public int Current { get; set; }
        public string Unit { get; set; } // "items", "minutes", "days"
        public RewardDto Reward { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class RewardDto
    {
        public int Points { get; set; }
        public string BadgeId { get; set; }
        public string BadgeName { get; set; }
        public string BadgeIcon { get; set; }
    }

    public class CreateWeeklyGoalDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public int Target { get; set; }
        public string Unit { get; set; }
        public int RewardPoints { get; set; }
    }

    public class UpdateWeeklyGoalDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int? Target { get; set; }
        public int? Current { get; set; }
    }

    public class CompleteActivityDto
    {
        public int Score { get; set; }
        public int TimeSpentMinutes { get; set; }
        public string CompletionStatus { get; set; } // "completed", "partial", "skipped"
        public Dictionary<string, object> AdditionalData { get; set; }
    }

    public class ActivityCompletionResultDto
    {
        public bool Success { get; set; }
        public int PointsEarned { get; set; }
        public List<AchievementUnlockedDto> UnlockedAchievements { get; set; }
        public List<GoalProgressDto> GoalProgress { get; set; }
        public LevelProgressDto LevelProgress { get; set; }
    }

    public class AchievementDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public string Category { get; set; }
        public int Points { get; set; }
        public bool IsUnlocked { get; set; }
        public DateTime? UnlockedAt { get; set; }
        public double Progress { get; set; }
        public string Rarity { get; set; } // "common", "rare", "epic", "legendary"
    }

    public class AchievementUnlockedDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Icon { get; set; }
        public int Points { get; set; }
    }

    public class GoalProgressDto
    {
        public string GoalId { get; set; }
        public string GoalTitle { get; set; }
        public int PreviousProgress { get; set; }
        public int CurrentProgress { get; set; }
        public int Target { get; set; }
        public bool JustCompleted { get; set; }
    }

    public class LearningStreakDto
    {
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime? LastActivityDate { get; set; }
        public bool IsActiveToday { get; set; }
        public int DaysUntilMilestone { get; set; }
        public int NextMilestone { get; set; }
    }

    public class GamificationStatsDto
    {
        public int TotalPoints { get; set; }
        public int CurrentLevel { get; set; }
        public string LevelName { get; set; }
        public int PointsToNextLevel { get; set; }
        public double LevelProgress { get; set; }
        public int TotalBadges { get; set; }
        public int Ranking { get; set; }
        public List<BadgeDto> RecentBadges { get; set; }
    }

    public class BadgeDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Icon { get; set; }
        public string Description { get; set; }
        public DateTime EarnedAt { get; set; }
    }

    public class LeaderboardDto
    {
        public string Period { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<LeaderboardEntryDto> Entries { get; set; }
        public LeaderboardEntryDto CurrentUserEntry { get; set; }
    }

    public class LeaderboardEntryDto
    {
        public int Rank { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string UserAvatar { get; set; }
        public int Points { get; set; }
        public int Level { get; set; }
        public int StreakDays { get; set; }
        public bool IsCurrentUser { get; set; }
    }

    public class UpdateProgressDto
    {
        public int LessonId { get; set; }
        public bool IsCompleted { get; set; }
        public int TimeSpentMinutes { get; set; }
        public double? QuizScore { get; set; }
    }

    public class LevelProgressDto
    {
        public int PreviousLevel { get; set; }
        public int CurrentLevel { get; set; }
        public bool LeveledUp { get; set; }
        public string NewLevelName { get; set; }
        public int BonusPoints { get; set; }
    }
}