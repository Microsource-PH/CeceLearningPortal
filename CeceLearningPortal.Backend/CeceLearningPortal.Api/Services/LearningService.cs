using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;
using CeceLearningPortal.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace CeceLearningPortal.Api.Services
{
    public class LearningService : ILearningService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LearningService> _logger;

        // Gamification level thresholds
        private readonly Dictionary<int, (string name, int points)> _levels = new()
        {
            { 1, ("Beginner", 0) },
            { 2, ("Learner", 100) },
            { 3, ("Student", 300) },
            { 4, ("Scholar", 600) },
            { 5, ("Expert", 1000) },
            { 6, ("Master", 1500) },
            { 7, ("Guru", 2500) },
            { 8, ("Sage", 4000) },
            { 9, ("Legend", 6000) },
            { 10, ("Grandmaster", 10000) }
        };

        public LearningService(ApplicationDbContext context, ILogger<LearningService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<LearnerDashboardDto> GetLearnerDashboardAsync(string userId)
        {
            try
            {
                // Get user's enrollments and progress
                var enrollments = await _context.Enrollments
                    .Include(e => e.Course)
                    .ThenInclude(c => c.Modules)
                    .ThenInclude(m => m.Lessons)
                    .Where(e => e.StudentId == userId)
                    .ToListAsync();

                // Calculate stats
                var stats = new LearnerStatsDto
                {
                    TotalCourses = enrollments.Count,
                    CompletedCourses = enrollments.Count(e => e.CompletedAt.HasValue),
                    InProgressCourses = enrollments.Count(e => !e.CompletedAt.HasValue && e.ProgressPercentage > 0),
                    TotalLearningHours = enrollments.Sum(e => e.TotalTimeSpent) / 60.0,
                    CertificatesEarned = enrollments.Count(e => e.CertificateIssued),
                    AverageQuizScore = enrollments.Where(e => e.AverageQuizScore.HasValue)
                        .Select(e => e.AverageQuizScore.Value)
                        .DefaultIfEmpty(0)
                        .Average()
                };

                // Get recent courses
                var recentCourses = enrollments
                    .OrderByDescending(e => e.LastAccessedDate ?? e.EnrolledAt)
                    .Take(5)
                    .Select(e => new LearningCourseProgressDto
                    {
                        CourseId = e.CourseId,
                        Title = e.Course.Title,
                        Thumbnail = e.Course.Thumbnail,
                        Category = e.Course.Category,
                        Progress = e.ProgressPercentage,
                        CompletedLessons = e.CompletedLessons,
                        TotalLessons = e.Course.Modules.Sum(m => m.Lessons.Count),
                        EstimatedTimeLeft = CalculateEstimatedTimeLeft(e),
                        LastAccessed = e.LastAccessedDate ?? e.EnrolledAt,
                        Status = e.CompletedAt.HasValue ? "completed" : e.ProgressPercentage > 0 ? "in-progress" : "not-started",
                        Rating = e.Course.AverageRating
                    })
                    .ToList();

                // Get suggested activities
                var suggestedActivities = await GetSuggestedActivitiesForUser(userId);

                // Get weekly goals
                var weeklyGoals = await GetWeeklyGoalsAsync(userId);

                // Get learning streak
                var streak = await GetLearningStreakAsync(userId);

                // Get gamification stats
                var gamification = await GetGamificationStatsAsync(userId);

                return new LearnerDashboardDto
                {
                    Stats = stats,
                    RecentCourses = recentCourses,
                    SuggestedActivities = suggestedActivities,
                    WeeklyGoals = weeklyGoals,
                    Streak = streak,
                    Gamification = gamification
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting learner dashboard for user {userId}");
                throw;
            }
        }

        public async Task<List<LearningActivityDto>> GetLearningActivitiesAsync(string userId, string category = null)
        {
            try
            {
                var query = from enrollment in _context.Enrollments
                           join course in _context.Courses on enrollment.CourseId equals course.Id
                           join module in _context.CourseModules on course.Id equals module.CourseId
                           join lesson in _context.Lessons on module.Id equals lesson.ModuleId
                           where enrollment.StudentId == userId && !enrollment.CompletedAt.HasValue
                           select new { enrollment, course, module, lesson };

                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(x => x.lesson.Type.ToString() == category);
                }

                var activities = await query
                    .OrderBy(x => x.module.Order)
                    .ThenBy(x => x.lesson.Order)
                    .Take(20)
                    .Select(x => new LearningActivityDto
                    {
                        Id = x.lesson.Id.ToString(),
                        Title = x.lesson.Title,
                        Description = x.lesson.Content ?? "",
                        Type = x.lesson.Type.ToString(),
                        Category = x.course.Category,
                        EstimatedMinutes = ParseDuration(x.lesson.Duration),
                        Points = CalculateActivityPoints(x.lesson.Type.ToString()),
                        Difficulty = DetermineDifficulty(x.course.Level.ToString()),
                        CourseId = x.course.Id.ToString(),
                        CourseName = x.course.Title,
                        IsCompleted = false // Would check progress table in real implementation
                    })
                    .ToListAsync();

                return activities;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting learning activities for user {userId}");
                throw;
            }
        }

        public async Task<List<WeeklyGoalDto>> GetWeeklyGoalsAsync(string userId)
        {
            try
            {
                // Get current week's goals
                var startOfWeek = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
                var endOfWeek = startOfWeek.AddDays(7);

                // In a real implementation, fetch from database
                // For now, return default goals with calculated progress
                var goals = new List<WeeklyGoalDto>
                {
                    new WeeklyGoalDto
                    {
                        Id = "1",
                        Title = "Complete 5 lessons",
                        Description = "Finish 5 lessons from any course",
                        Category = "lessons",
                        Target = 5,
                        Current = await GetWeeklyLessonCount(userId, startOfWeek, endOfWeek),
                        Unit = "lessons",
                        Reward = new RewardDto { Points = 50 },
                        StartDate = startOfWeek,
                        EndDate = endOfWeek
                    },
                    new WeeklyGoalDto
                    {
                        Id = "2",
                        Title = "Study for 3 hours",
                        Description = "Spend at least 3 hours learning",
                        Category = "time",
                        Target = 180,
                        Current = await GetWeeklyStudyMinutes(userId, startOfWeek, endOfWeek),
                        Unit = "minutes",
                        Reward = new RewardDto { Points = 75 },
                        StartDate = startOfWeek,
                        EndDate = endOfWeek
                    },
                    new WeeklyGoalDto
                    {
                        Id = "3",
                        Title = "Complete 2 quizzes",
                        Description = "Take and complete 2 quizzes",
                        Category = "quizzes",
                        Target = 2,
                        Current = await GetWeeklyQuizCount(userId, startOfWeek, endOfWeek),
                        Unit = "quizzes",
                        Reward = new RewardDto { Points = 100 },
                        StartDate = startOfWeek,
                        EndDate = endOfWeek
                    },
                    new WeeklyGoalDto
                    {
                        Id = "4",
                        Title = "Maintain 7-day streak",
                        Description = "Learn something every day for 7 days",
                        Category = "streak",
                        Target = 7,
                        Current = (await GetLearningStreakAsync(userId)).CurrentStreak,
                        Unit = "days",
                        Reward = new RewardDto 
                        { 
                            Points = 150,
                            BadgeId = "streak_master",
                            BadgeName = "Streak Master",
                            BadgeIcon = "🔥"
                        },
                        StartDate = startOfWeek,
                        EndDate = endOfWeek
                    }
                };

                // Mark completed goals
                foreach (var goal in goals)
                {
                    goal.IsCompleted = goal.Current >= goal.Target;
                }

                return goals;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting weekly goals for user {userId}");
                throw;
            }
        }

        public async Task<WeeklyGoalDto> CreateWeeklyGoalAsync(string userId, CreateWeeklyGoalDto goalDto)
        {
            try
            {
                // In real implementation, save to database
                var goal = new WeeklyGoalDto
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = goalDto.Title,
                    Description = goalDto.Description,
                    Category = goalDto.Category,
                    Target = goalDto.Target,
                    Current = 0,
                    Unit = goalDto.Unit,
                    Reward = new RewardDto { Points = goalDto.RewardPoints },
                    StartDate = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek),
                    EndDate = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek).AddDays(7),
                    IsCompleted = false
                };

                return goal;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating weekly goal for user {userId}");
                throw;
            }
        }

        public async Task<WeeklyGoalDto> UpdateWeeklyGoalAsync(string userId, string goalId, UpdateWeeklyGoalDto goalDto)
        {
            try
            {
                // In real implementation, update in database
                // For now, return a sample updated goal
                var goal = new WeeklyGoalDto
                {
                    Id = goalId,
                    Title = goalDto.Title ?? "Updated Goal",
                    Description = goalDto.Description ?? "Updated Description",
                    Target = goalDto.Target ?? 5,
                    Current = goalDto.Current ?? 0
                };

                return goal;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating weekly goal {goalId} for user {userId}");
                throw;
            }
        }

        public async Task<ActivityCompletionResultDto> CompleteActivityAsync(string userId, string activityId, CompleteActivityDto completeDto)
        {
            try
            {
                // Calculate points earned
                var basePoints = CalculateActivityPoints(completeDto.CompletionStatus);
                var bonusPoints = completeDto.Score >= 80 ? 20 : completeDto.Score >= 60 ? 10 : 0;
                var totalPoints = basePoints + bonusPoints;

                // Check for achievements
                var unlockedAchievements = new List<AchievementUnlockedDto>();
                
                // Check for first completion achievement
                var completionCount = await GetUserCompletionCount(userId);
                if (completionCount == 1)
                {
                    unlockedAchievements.Add(new AchievementUnlockedDto
                    {
                        Id = "first_step",
                        Name = "First Step",
                        Icon = "🎯",
                        Points = 10
                    });
                }

                // Update goal progress
                var goalProgress = await UpdateGoalProgressForActivity(userId, activityId, completeDto);

                // Check for level up
                var levelProgress = await CheckLevelProgress(userId, totalPoints);

                return new ActivityCompletionResultDto
                {
                    Success = true,
                    PointsEarned = totalPoints,
                    UnlockedAchievements = unlockedAchievements,
                    GoalProgress = goalProgress,
                    LevelProgress = levelProgress
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error completing activity {activityId} for user {userId}");
                throw;
            }
        }

        public async Task<List<AchievementDto>> GetAchievementsAsync(string userId)
        {
            try
            {
                // In real implementation, fetch from database
                var achievements = new List<AchievementDto>
                {
                    new AchievementDto
                    {
                        Id = "first_step",
                        Name = "First Step",
                        Description = "Complete your first activity",
                        Icon = "🎯",
                        Category = "Getting Started",
                        Points = 10,
                        IsUnlocked = true,
                        UnlockedAt = DateTime.UtcNow.AddDays(-5),
                        Progress = 100,
                        Rarity = "common"
                    },
                    new AchievementDto
                    {
                        Id = "week_warrior",
                        Name = "Week Warrior",
                        Description = "Complete all weekly goals",
                        Icon = "⚔️",
                        Category = "Goals",
                        Points = 100,
                        IsUnlocked = false,
                        Progress = 75,
                        Rarity = "rare"
                    },
                    new AchievementDto
                    {
                        Id = "quiz_master",
                        Name = "Quiz Master",
                        Description = "Score 100% on 10 quizzes",
                        Icon = "🧠",
                        Category = "Performance",
                        Points = 200,
                        IsUnlocked = false,
                        Progress = 30,
                        Rarity = "epic"
                    }
                };

                return achievements;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting achievements for user {userId}");
                throw;
            }
        }

        public async Task<LeaderboardDto> GetLeaderboardAsync(string period = "weekly")
        {
            try
            {
                var (startDate, endDate) = GetPeriodDates(period);

                // In real implementation, query from database
                var entries = new List<LeaderboardEntryDto>
                {
                    new LeaderboardEntryDto
                    {
                        Rank = 1,
                        UserId = "user1",
                        UserName = "John Doe",
                        UserAvatar = "/avatars/john.jpg",
                        Points = 850,
                        Level = 5,
                        StreakDays = 15
                    },
                    new LeaderboardEntryDto
                    {
                        Rank = 2,
                        UserId = "user2",
                        UserName = "Jane Smith",
                        UserAvatar = "/avatars/jane.jpg",
                        Points = 720,
                        Level = 4,
                        StreakDays = 10
                    },
                    new LeaderboardEntryDto
                    {
                        Rank = 3,
                        UserId = "user3",
                        UserName = "Bob Johnson",
                        UserAvatar = "/avatars/bob.jpg",
                        Points = 680,
                        Level = 4,
                        StreakDays = 7
                    }
                };

                return new LeaderboardDto
                {
                    Period = period,
                    StartDate = startDate,
                    EndDate = endDate,
                    Entries = entries
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting leaderboard for period {period}");
                throw;
            }
        }

        public async Task<LearningCourseProgressDto> GetCourseProgressAsync(string userId, int courseId)
        {
            try
            {
                var enrollment = await _context.Enrollments
                    .Include(e => e.Course)
                    .ThenInclude(c => c.Modules)
                    .ThenInclude(m => m.Lessons)
                    .FirstOrDefaultAsync(e => e.StudentId == userId && e.CourseId == courseId);

                if (enrollment == null)
                    return null;

                return new LearningCourseProgressDto
                {
                    CourseId = enrollment.CourseId,
                    Title = enrollment.Course.Title,
                    Thumbnail = enrollment.Course.Thumbnail,
                    Category = enrollment.Course.Category,
                    Progress = enrollment.ProgressPercentage,
                    CompletedLessons = enrollment.CompletedLessons,
                    TotalLessons = enrollment.Course.Modules.Sum(m => m.Lessons.Count),
                    EstimatedTimeLeft = CalculateEstimatedTimeLeft(enrollment),
                    LastAccessed = enrollment.LastAccessedDate ?? enrollment.EnrolledAt,
                    Status = enrollment.CompletedAt.HasValue ? "completed" : enrollment.ProgressPercentage > 0 ? "in-progress" : "not-started",
                    Rating = enrollment.Course.AverageRating
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting course progress for user {userId} and course {courseId}");
                throw;
            }
        }

        public async Task<LearningCourseProgressDto> UpdateCourseProgressAsync(string userId, int courseId, UpdateProgressDto progressDto)
        {
            try
            {
                var enrollment = await _context.Enrollments
                    .Include(e => e.Course)
                    .FirstOrDefaultAsync(e => e.StudentId == userId && e.CourseId == courseId);

                if (enrollment == null)
                    return null;

                // Update progress
                enrollment.LastAccessedDate = DateTime.UtcNow;
                enrollment.TotalTimeSpent += progressDto.TimeSpentMinutes;

                if (progressDto.IsCompleted)
                {
                    enrollment.CompletedLessons++;
                    enrollment.ProgressPercentage = (enrollment.CompletedLessons * 100.0) / enrollment.Course.Modules.Sum(m => m.Lessons.Count);
                }

                if (progressDto.QuizScore.HasValue)
                {
                    // Update average quiz score
                    var quizCount = enrollment.QuizCount ?? 0;
                    var totalScore = (enrollment.AverageQuizScore ?? 0) * quizCount;
                    enrollment.AverageQuizScore = (totalScore + progressDto.QuizScore.Value) / (quizCount + 1);
                    enrollment.QuizCount = quizCount + 1;
                }

                // Check if course is completed
                if (enrollment.ProgressPercentage >= 100 && !enrollment.CompletedAt.HasValue)
                {
                    enrollment.CompletedAt = DateTime.UtcNow;
                    enrollment.CertificateIssued = true;
                }

                await _context.SaveChangesAsync();

                return await GetCourseProgressAsync(userId, courseId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating course progress for user {userId} and course {courseId}");
                throw;
            }
        }

        public async Task<LearningStreakDto> GetLearningStreakAsync(string userId)
        {
            try
            {
                // In real implementation, calculate from activity log
                var currentStreak = 7;
                var longestStreak = 15;
                var lastActivityDate = DateTime.UtcNow.Date;
                var isActiveToday = true;

                // Calculate days until next milestone
                var milestones = new[] { 7, 14, 30, 60, 100, 365 };
                var nextMilestone = milestones.FirstOrDefault(m => m > currentStreak);
                var daysUntilMilestone = nextMilestone > 0 ? nextMilestone - currentStreak : 0;

                return new LearningStreakDto
                {
                    CurrentStreak = currentStreak,
                    LongestStreak = longestStreak,
                    LastActivityDate = lastActivityDate,
                    IsActiveToday = isActiveToday,
                    DaysUntilMilestone = daysUntilMilestone,
                    NextMilestone = nextMilestone
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting learning streak for user {userId}");
                throw;
            }
        }

        // Helper methods
        private string CalculateEstimatedTimeLeft(Enrollment enrollment)
        {
            var remainingLessons = enrollment.Course.Modules.Sum(m => m.Lessons.Count) - enrollment.CompletedLessons;
            var avgTimePerLesson = enrollment.TotalTimeSpent > 0 && enrollment.CompletedLessons > 0
                ? enrollment.TotalTimeSpent / enrollment.CompletedLessons
                : 30; // Default 30 minutes per lesson

            var estimatedMinutes = remainingLessons * avgTimePerLesson;
            
            if (estimatedMinutes < 60)
                return $"{estimatedMinutes} minutes";
            else if (estimatedMinutes < 1440)
                return $"{estimatedMinutes / 60} hours";
            else
                return $"{estimatedMinutes / 1440} days";
        }

        private async Task<List<LearningActivityDto>> GetSuggestedActivitiesForUser(string userId)
        {
            // Algorithm to suggest activities based on:
            // 1. Current progress in enrolled courses
            // 2. Learning patterns and preferences
            // 3. Difficulty progression
            // 4. Time since last activity in a course

            var activities = await GetLearningActivitiesAsync(userId);
            
            // Prioritize activities from courses with recent activity
            // Mix different types (video, quiz, reading) for variety
            // Consider user's performance to suggest appropriate difficulty

            return activities.Take(5).ToList();
        }

        private async Task<GamificationStatsDto> GetGamificationStatsAsync(string userId)
        {
            // In real implementation, fetch from user profile
            var totalPoints = 1250;
            var currentLevel = GetLevelFromPoints(totalPoints);
            var levelInfo = _levels[currentLevel];
            var nextLevelInfo = _levels.ContainsKey(currentLevel + 1) ? _levels[currentLevel + 1] : _levels[currentLevel];

            return new GamificationStatsDto
            {
                TotalPoints = totalPoints,
                CurrentLevel = currentLevel,
                LevelName = levelInfo.name,
                PointsToNextLevel = nextLevelInfo.points - totalPoints,
                LevelProgress = ((double)(totalPoints - levelInfo.points) / (nextLevelInfo.points - levelInfo.points)) * 100,
                TotalBadges = 5,
                Ranking = 42,
                RecentBadges = new List<BadgeDto>
                {
                    new BadgeDto
                    {
                        Id = "week_warrior",
                        Name = "Week Warrior",
                        Icon = "⚔️",
                        Description = "Completed all weekly goals",
                        EarnedAt = DateTime.UtcNow.AddDays(-2)
                    }
                }
            };
        }

        private int GetLevelFromPoints(int points)
        {
            foreach (var level in _levels.OrderByDescending(l => l.Value.points))
            {
                if (points >= level.Value.points)
                    return level.Key;
            }
            return 1;
        }

        private int ParseDuration(string duration)
        {
            // Parse duration string like "15 min", "1.5 hours" to minutes
            if (string.IsNullOrEmpty(duration))
                return 30;

            var parts = duration.ToLower().Split(' ');
            if (parts.Length < 2)
                return 30;

            if (!double.TryParse(parts[0], out var value))
                return 30;

            if (parts[1].StartsWith("hour"))
                return (int)(value * 60);
            else if (parts[1].StartsWith("min"))
                return (int)value;
            
            return 30;
        }

        private int CalculateActivityPoints(string activityType)
        {
            return activityType?.ToLower() switch
            {
                "video" => 10,
                "quiz" => 20,
                "assignment" => 30,
                "reading" => 15,
                "practice" => 25,
                _ => 10
            };
        }

        private string DetermineDifficulty(string courseLevel)
        {
            return courseLevel?.ToLower() switch
            {
                "beginner" => "easy",
                "intermediate" => "medium",
                "advanced" => "hard",
                _ => "medium"
            };
        }

        private async Task<int> GetWeeklyLessonCount(string userId, DateTime startDate, DateTime endDate)
        {
            // In real implementation, query activity log
            return 3;
        }

        private async Task<int> GetWeeklyStudyMinutes(string userId, DateTime startDate, DateTime endDate)
        {
            // In real implementation, query activity log
            return 120;
        }

        private async Task<int> GetWeeklyQuizCount(string userId, DateTime startDate, DateTime endDate)
        {
            // In real implementation, query activity log
            return 1;
        }

        private async Task<int> GetUserCompletionCount(string userId)
        {
            // In real implementation, query activity log
            return 1;
        }

        private async Task<List<GoalProgressDto>> UpdateGoalProgressForActivity(string userId, string activityId, CompleteActivityDto completeDto)
        {
            var progress = new List<GoalProgressDto>();
            
            // Update relevant goals based on activity type
            // In real implementation, update database

            return progress;
        }

        private async Task<LevelProgressDto> CheckLevelProgress(string userId, int pointsEarned)
        {
            // In real implementation, update user points and check for level up
            var previousLevel = 3;
            var newTotalPoints = 950 + pointsEarned;
            var newLevel = GetLevelFromPoints(newTotalPoints);

            return new LevelProgressDto
            {
                PreviousLevel = previousLevel,
                CurrentLevel = newLevel,
                LeveledUp = newLevel > previousLevel,
                NewLevelName = _levels[newLevel].name,
                BonusPoints = newLevel > previousLevel ? 50 : 0
            };
        }

        private (DateTime startDate, DateTime endDate) GetPeriodDates(string period)
        {
            var now = DateTime.UtcNow;
            return period.ToLower() switch
            {
                "daily" => (now.Date, now.Date.AddDays(1)),
                "weekly" => (now.Date.AddDays(-(int)now.DayOfWeek), now.Date.AddDays(-(int)now.DayOfWeek).AddDays(7)),
                "monthly" => (new DateTime(now.Year, now.Month, 1), new DateTime(now.Year, now.Month, 1).AddMonths(1)),
                _ => (now.Date.AddDays(-(int)now.DayOfWeek), now.Date.AddDays(-(int)now.DayOfWeek).AddDays(7))
            };
        }
    }
}