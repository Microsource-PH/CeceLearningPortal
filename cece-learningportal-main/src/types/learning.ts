export interface LearnerDashboard {
  stats: LearnerStats;
  recentCourses: CourseProgress[];
  suggestedActivities: LearningActivity[];
  weeklyGoals: WeeklyGoal[];
  streak: LearningStreak;
  gamification: GamificationStats;
}

export interface LearnerStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalLearningHours: number;
  certificatesEarned: number;
  averageQuizScore: number;
}

export interface CourseProgress {
  courseId: number;
  title: string;
  thumbnail: string;
  category: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  estimatedTimeLeft: string;
  lastAccessed: string;
  status: 'in-progress' | 'completed' | 'not-started';
  rating: number;
}

export interface LearningActivity {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'quiz' | 'assignment' | 'reading' | 'practice';
  category: string;
  estimatedMinutes: number;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  courseId: string;
  courseName: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  category: 'lessons' | 'time' | 'quizzes' | 'assignments' | 'streak';
  target: number;
  current: number;
  unit: string;
  reward: Reward;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Reward {
  points: number;
  badgeId?: string;
  badgeName?: string;
  badgeIcon?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  isActiveToday: boolean;
  daysUntilMilestone: number;
  nextMilestone: number;
}

export interface GamificationStats {
  totalPoints: number;
  currentLevel: number;
  levelName: string;
  pointsToNextLevel: number;
  levelProgress: number;
  totalBadges: number;
  ranking: number;
  recentBadges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

export interface Leaderboard {
  period: string;
  startDate: string;
  endDate: string;
  entries: LeaderboardEntry[];
  currentUserEntry?: LeaderboardEntry;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  points: number;
  level: number;
  streakDays: number;
  isCurrentUser?: boolean;
}

export interface ActivityCompletionResult {
  success: boolean;
  pointsEarned: number;
  unlockedAchievements: UnlockedAchievement[];
  goalProgress: GoalProgress[];
  levelProgress: LevelProgress;
}

export interface UnlockedAchievement {
  id: string;
  name: string;
  icon: string;
  points: number;
}

export interface GoalProgress {
  goalId: string;
  goalTitle: string;
  previousProgress: number;
  currentProgress: number;
  target: number;
  justCompleted: boolean;
}

export interface LevelProgress {
  previousLevel: number;
  currentLevel: number;
  leveledUp: boolean;
  newLevelName?: string;
  bonusPoints: number;
}