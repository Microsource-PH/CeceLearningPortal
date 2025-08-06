import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LearnerDashboard } from "@/types/learning";
import { formatPHP } from "@/utils/currency";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  Star,
  ArrowRight,
  Calendar,
  Award,
  Target,
  Trophy,
  Flame,
  TrendingUp,
  Brain,
  FileText,
  Video,
  HelpCircle,
  ChevronRight,
  Plus,
  Settings,
  Zap,
  Gift,
  Medal,
  BarChart3
} from "lucide-react";

interface LearningActivity {
  id: string;
  type: 'video' | 'quiz' | 'assignment' | 'reading' | 'practice';
  title: string;
  description: string;
  points: number;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  courseId?: number;
  courseName?: string;
  isCompleted: boolean;
  completedAt?: Date;
}

interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  category: 'lessons' | 'time' | 'quizzes' | 'assignments' | 'streak';
  reward: {
    points: number;
    badge?: string;
  };
  deadline: Date;
  isActive: boolean;
}

interface LearningStats {
  totalPoints: number;
  weeklyPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalLearningTime: number;
  weeklyLearningTime: number;
  completedActivities: number;
  level: number;
  nextLevelProgress: number;
  badges: Badge[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface LearningDashboardEnhancedProps {
  dashboardData: LearnerDashboard | null;
  onActivityComplete: (activityId: string, completion: any) => Promise<void>;
  onGoalUpdate: (goalId: string, updates: any) => Promise<void>;
  onRefresh: () => void;
}

const ACTIVITY_TYPES = {
  video: { icon: Video, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  quiz: { icon: HelpCircle, color: 'text-green-500', bgColor: 'bg-green-100' },
  assignment: { icon: FileText, color: 'text-purple-500', bgColor: 'bg-purple-100' },
  reading: { icon: BookOpen, color: 'text-orange-500', bgColor: 'bg-orange-100' },
  practice: { icon: Brain, color: 'text-pink-500', bgColor: 'bg-pink-100' }
};

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700'
};

export const LearningDashboardEnhanced = ({ 
  dashboardData, 
  onActivityComplete, 
  onGoalUpdate, 
  onRefresh 
}: LearningDashboardEnhancedProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedActivity, setSelectedActivity] = useState<LearningActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);

  // Extract data from dashboard prop
  const stats = dashboardData?.stats;
  const recentCourses = dashboardData?.recentCourses || [];
  const weeklyGoals = dashboardData?.weeklyGoals || [];
  const suggestedActivities = dashboardData?.suggestedActivities || [];
  const learningStreak = dashboardData?.streak;
  const gamificationStats = dashboardData?.gamification;

  const learningStats: LearningStats = {
    totalPoints: gamificationStats?.totalPoints || 0,
    weeklyPoints: 0, // Would calculate from activities
    currentStreak: learningStreak?.currentStreak || 0,
    longestStreak: learningStreak?.longestStreak || 0,
    totalLearningTime: stats?.totalLearningHours || 0,
    weeklyLearningTime: 0, // Would calculate from activities
    completedActivities: stats?.completedCourses || 0,
    level: gamificationStats?.currentLevel || 1,
    nextLevelProgress: gamificationStats?.levelProgress || 0,
    badges: gamificationStats?.recentBadges?.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      earnedAt: new Date(b.earnedAt),
      rarity: 'common' as const
    })) || []
  };

  useEffect(() => {
    // Merge localStorage progress with API data
    const storedCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    
    if (recentCourses.length > 0) {
      const mergedCourses = recentCourses.map((course: any) => {
        const stored = storedCourses.find((s: any) => s.courseId === course.id || s.courseId === course.courseId);
        if (stored) {
          return {
            ...course,
            progressPercentage: stored.progress || course.progressPercentage || 0,
            completedLessons: stored.completedLessons || course.completedLessons || 0,
            totalLessons: stored.totalLessons || course.totalLessons || 10,
            status: stored.status || course.status || 'not_started',
            lastAccessedAt: stored.lastAccessedAt || course.lastAccessedAt
          };
        }
        return course;
      });
      setEnrolledCourses(mergedCourses);
    } else {
      // If no recent courses from API, use localStorage data
      setEnrolledCourses(storedCourses);
    }
    
    // Set up interval to check and update goals
    const interval = setInterval(checkGoalProgress, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [recentCourses]);
  
  // Refresh enrolled courses from localStorage periodically
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      const storedCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      
      if (recentCourses.length > 0) {
        const mergedCourses = recentCourses.map((course: any) => {
          const stored = storedCourses.find((s: any) => s.courseId === course.id || s.courseId === course.courseId);
          if (stored) {
            return {
              ...course,
              progressPercentage: stored.progress || course.progressPercentage || 0,
              completedLessons: stored.completedLessons || course.completedLessons || 0,
              totalLessons: stored.totalLessons || course.totalLessons || 10,
              status: stored.status || course.status || 'not_started',
              lastAccessedAt: stored.lastAccessedAt || course.lastAccessedAt
            };
          }
          return course;
        });
        setEnrolledCourses(mergedCourses);
      }
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(refreshInterval);
  }, [recentCourses]);

  const fetchDashboardData = async () => {
    try {
      onRefresh();

      // Initialize weekly goals
      initializeWeeklyGoals();
      
      // Generate suggested activities
      generateSuggestedActivities();
      
      // Load learning stats
      loadLearningStats();
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: "Please refresh the page to try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeWeeklyGoals = () => {
    // Weekly goals would be initialized from API or local state management
  };

  const generateSuggestedActivities = () => {
    // In real implementation, this would use AI/ML to suggest activities
  };

  const loadLearningStats = () => {
    // In real implementation, this would fetch from backend
  };

  const getWeekEndDate = () => {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  };

  const checkGoalProgress = () => {
    // Check and update goal progress
    // In real implementation, this would sync with backend
  };

  const completeGoal = async (goal: WeeklyGoal) => {
    try {
      toast({
        title: "🎉 Goal Completed!",
        description: `You've earned ${goal.reward.points} points${goal.reward.badge ? ' and a new badge!' : ''}`,
      });

      // In real implementation, this would update the backend
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  const startActivity = async (activity: LearningActivity) => {
    try {
      // Navigate to activity based on type
      toast({
        title: "Starting Activity",
        description: `Loading ${activity.title}...`,
      });
      
      // In real implementation, this would navigate to the activity
      // and track the start time
      console.log('Starting activity:', activity);
    } catch (error) {
      console.error('Error starting activity:', error);
    }
  };

  const completeActivity = async (activity: LearningActivity) => {
    try {
      // In real implementation, this would update the backend
      toast({
        title: "Activity Completed!",
        description: `You've earned ${activity.points} points!`,
      });
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  };

  const updateGoalProgress = (activity: LearningActivity) => {
    // In real implementation, this would update goal progress
  };

  const calculateLevel = (points: number) => {
    return Math.floor(points / 300) + 1;
  };

  const calculateNextLevelProgress = (points: number) => {
    return (points % 300) / 300 * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header with Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and achieve your learning goals</p>
      </div>

      {/* Top Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold">{learningStats.level}</p>
                <Progress value={learningStats.nextLevelProgress} className="h-1 mt-2" />
              </div>
              <Trophy className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{learningStats.totalPoints}</p>
                <p className="text-xs text-green-600">+{learningStats.weeklyPoints} this week</p>
              </div>
              <Zap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{learningStats.currentStreak} days</p>
                <p className="text-xs text-orange-600">Best: {learningStats.longestStreak} days</p>
              </div>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Learning Time</p>
                <p className="text-2xl font-bold">{learningStats.weeklyLearningTime}h</p>
                <p className="text-xs text-purple-600">This week</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Badges</p>
                <p className="text-2xl font-bold">{learningStats.badges.length}</p>
                <p className="text-xs text-pink-600">Earned</p>
              </div>
              <Medal className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="goals">Weekly Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Continue Learning */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Continue Learning
                    </span>
                    <Button variant="ghost" size="sm">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enrolledCourses.slice(0, 3).map((course) => (
                    <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold">{course.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {course.completedLessons}/{course.totalLessons} lessons completed
                          </p>
                        </div>
                        <Badge variant={course.progressPercentage === 100 ? 'default' : 'secondary'}>
                          {course.progressPercentage === 100 ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{course.progressPercentage}%</span>
                        </div>
                        <Progress value={course.progressPercentage} className="h-2" />
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{course.estimatedTimeLeft || '2 hours left'}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => navigate(`/learn/course/${course.courseId || course.id}`)}
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Today's Goals Progress */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Today's Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="relative inline-flex">
                        <div className="w-32 h-32">
                          <svg className="transform -rotate-90 w-32 h-32">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              className="text-gray-200"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              strokeDasharray={351.86}
                              strokeDashoffset={351.86 * (1 - 0.65)}
                              className="text-primary"
                            />
                          </svg>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div>
                            <p className="text-3xl font-bold">65%</p>
                            <p className="text-sm text-muted-foreground">Complete</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">2 activities completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">1.5 hours studied</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">45 points earned</span>
                      </div>
                    </div>

                    <Button className="w-full" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Suggested Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Suggested Activities
                </span>
                <Button variant="ghost" size="sm">
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedActivities.slice(0, 6).map((activity) => {
                  const ActivityIcon = ACTIVITY_TYPES[activity.type].icon;
                  
                  return (
                    <Card 
                      key={activity.id} 
                      className={`hover:shadow-md transition-all cursor-pointer ${
                        activity.isCompleted ? 'opacity-60' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg ${ACTIVITY_TYPES[activity.type].bgColor}`}>
                            <ActivityIcon className={`w-5 h-5 ${ACTIVITY_TYPES[activity.type].color}`} />
                          </div>
                          <Badge className={DIFFICULTY_COLORS[activity.difficulty]} variant="secondary">
                            {activity.difficulty}
                          </Badge>
                        </div>

                        <h4 className="font-semibold text-sm mb-1">{activity.title}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{activity.description}</p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {activity.points} pts
                          </span>
                        </div>

                        {activity.courseName && (
                          <p className="text-xs text-muted-foreground mb-3">
                            From: {activity.courseName}
                          </p>
                        )}

                        <Button 
                          size="sm" 
                          className="w-full"
                          variant={activity.isCompleted ? "secondary" : "default"}
                          onClick={() => activity.isCompleted ? null : startActivity(activity)}
                          disabled={activity.isCompleted}
                        >
                          {activity.isCompleted ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Completed
                            </>
                          ) : (
                            <>
                              Start Activity
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestedActivities.map((activity) => {
                  const ActivityIcon = ACTIVITY_TYPES[activity.type].icon;
                  
                  return (
                    <div 
                      key={activity.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${ACTIVITY_TYPES[activity.type].bgColor}`}>
                          <ActivityIcon className={`w-6 h-6 ${ACTIVITY_TYPES[activity.type].color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{activity.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{activity.courseName}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {activity.duration}
                            </span>
                            <Badge className={DIFFICULTY_COLORS[activity.difficulty]} variant="secondary">
                              {activity.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{activity.points} pts</p>
                          {activity.isCompleted && (
                            <p className="text-xs text-green-600">Completed</p>
                          )}
                        </div>
                        <Button 
                          size="sm"
                          variant={activity.isCompleted ? "secondary" : "default"}
                          onClick={() => activity.isCompleted ? null : startActivity(activity)}
                          disabled={activity.isCompleted}
                        >
                          {activity.isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <>
                              Start
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Active Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Active Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weeklyGoals.filter(goal => goal.isActive).map((goal) => (
                  <div key={goal.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      <Badge variant="outline">
                        <Zap className="w-3 h-3 mr-1" />
                        {goal.reward.points} pts
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {goal.current}/{goal.target} {goal.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(goal.current / goal.target) * 100} 
                        className="h-3"
                      />
                    </div>

                    {goal.reward.badge && (
                      <div className="flex items-center gap-2 mt-3 text-sm">
                        <Medal className="w-4 h-4 text-yellow-500" />
                        <span>Unlocks "{goal.reward.badge}" badge</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <span>
                        Ends {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                      {goal.current >= goal.target && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => completeGoal(goal)}
                        >
                          Claim Reward
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Goal Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recommended Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Zap className="w-4 h-4" />
                  <AlertDescription>
                    Based on your learning patterns, here are some personalized goal suggestions:
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 mt-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold">Complete React Course</h4>
                    <p className="text-sm text-muted-foreground">
                      You're 75% done - finish it this week!
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline">
                        <Zap className="w-3 h-3 mr-1" />
                        300 pts
                      </Badge>
                      <Button size="sm" variant="outline">
                        Add Goal
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold">10-Day Learning Streak</h4>
                    <p className="text-sm text-muted-foreground">
                      Extend your current 3-day streak!
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline">
                        <Zap className="w-3 h-3 mr-1" />
                        400 pts
                      </Badge>
                      <Button size="sm" variant="outline">
                        Add Goal
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold">Master JavaScript Basics</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete all basic JS modules
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline">
                        <Zap className="w-3 h-3 mr-1" />
                        250 pts
                      </Badge>
                      <Button size="sm" variant="outline">
                        Add Goal
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goal History */}
          <Card>
            <CardHeader>
              <CardTitle>Completed Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weeklyGoals.filter(goal => !goal.isActive).map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">{goal.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Completed on {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+{goal.reward.points} pts</p>
                      {goal.reward.badge && (
                        <p className="text-xs text-muted-foreground">Badge earned</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Level Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold mb-2">Level {learningStats.level}</div>
                  <p className="text-muted-foreground mb-4">Learning Expert</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Next Level</span>
                      <span className="font-medium">
                        {learningStats.totalPoints % 300}/300 XP
                      </span>
                    </div>
                    <Progress value={learningStats.nextLevelProgress} className="h-3" />
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Level {learningStats.level + 1} Rewards:</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Unlock advanced courses</p>
                      <p>• Exclusive "Expert" badge</p>
                      <p>• 20% discount on premium content</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Medal className="w-5 h-5" />
                    Badges Collection
                  </span>
                  <Badge variant="outline">
                    {learningStats.badges.length} Earned
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {learningStats.badges.map((badge) => (
                    <div 
                      key={badge.id}
                      className="text-center p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <p className="text-sm font-medium">{badge.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {badge.description}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`mt-2 text-xs ${
                          badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                          badge.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                          badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {badge.rarity}
                      </Badge>
                    </div>
                  ))}
                  
                  {/* Locked badges preview */}
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={`locked-${i}`}
                      className="text-center p-4 rounded-lg border border-dashed opacity-50"
                    >
                      <div className="text-4xl mb-2 grayscale">🔒</div>
                      <p className="text-sm font-medium">Locked</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Keep learning!
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'You', points: learningStats.weeklyPoints, avatar: '👤' },
                  { rank: 2, name: 'Sarah Chen', points: 285, avatar: '👩' },
                  { rank: 3, name: 'Mike Johnson', points: 275, avatar: '👨' },
                  { rank: 4, name: 'Lisa Park', points: 260, avatar: '👩' },
                  { rank: 5, name: 'David Kim', points: 245, avatar: '👨' },
                ].map((user) => (
                  <div 
                    key={user.rank}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user.rank === 1 ? 'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200' : 'border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`font-bold text-lg ${
                        user.rank === 1 ? 'text-yellow-600' :
                        user.rank === 2 ? 'text-gray-500' :
                        user.rank === 3 ? 'text-orange-600' :
                        'text-muted-foreground'
                      }`}>
                        #{user.rank}
                      </div>
                      <div className="text-2xl">{user.avatar}</div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.points} points this week</p>
                      </div>
                    </div>
                    {user.rank <= 3 && (
                      <Trophy className={`w-5 h-5 ${
                        user.rank === 1 ? 'text-yellow-500' :
                        user.rank === 2 ? 'text-gray-400' :
                        'text-orange-500'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};