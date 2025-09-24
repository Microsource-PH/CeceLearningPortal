import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatRating } from "@/utils/format";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  Star,
  ArrowRight,
  Calendar,
  Award
} from "lucide-react";

export const DashboardSection = () => {
  const recentCourses = [
    {
      id: 1,
      title: "React Advanced Patterns",
      progress: 75,
      timeLeft: "2 hours",
      status: "In Progress",
      rating: 4.8,
      lessons: 12,
      completedLessons: 9
    },
    {
      id: 2,
      title: "GoHighLevel Integration",
      progress: 45,
      timeLeft: "4 hours",
      status: "In Progress",
      rating: 4.9,
      lessons: 8,
      completedLessons: 4
    },
    {
      id: 3,
      title: "Database Design Fundamentals",
      progress: 100,
      timeLeft: "Completed",
      status: "Completed",
      rating: 4.7,
      lessons: 15,
      completedLessons: 15
    }
  ];

  const weeklyGoals = [
    { label: "Complete 3 lessons", progress: 67, completed: 2, total: 3 },
    { label: "Study 5 hours", progress: 80, completed: 4, total: 5 },
    { label: "Take 1 quiz", progress: 100, completed: 1, total: 1 }
  ];

  return (
    <div className="py-16 bg-muted/20">
      <div className="container mx-auto px-6">
        {/* Dashboard Header */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Your Learning Dashboard</h2>
          <p className="text-muted-foreground text-lg">
            Track your progress and continue your learning journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Courses in Progress</p>
                      <p className="text-2xl font-bold text-learning-blue">3</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-learning-blue" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-learning-success">12</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-learning-success" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Certificates</p>
                      <p className="text-2xl font-bold text-learning-purple">8</p>
                    </div>
                    <Award className="w-8 h-8 text-learning-purple" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Courses */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Continue Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {recentCourses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-6 hover:shadow-card transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <PlayCircle className="w-4 h-4" />
                            {course.completedLessons}/{course.lessons} lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.timeLeft}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {formatRating(course.rating)}
                          </span>
                        </div>
                      </div>
                      <Badge variant={course.status === "Completed" ? "default" : "secondary"}>
                        {course.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button 
                        variant={course.status === "Completed" ? "outline" : "learning"} 
                        size="sm"
                        className="group-hover:translate-x-1 transition-transform"
                      >
                        {course.status === "Completed" ? "Review" : "Continue"}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Goals */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Weekly Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weeklyGoals.map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{goal.label}</span>
                      <span className="text-muted-foreground">
                        {goal.completed}/{goal.total}
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Learning Streak */}
            <Card className="shadow-card bg-gradient-primary text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold mb-2">🔥 7</div>
                <p className="text-sm opacity-90">Day Learning Streak</p>
                <p className="text-xs opacity-75 mt-2">Keep it up! You're on fire!</p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="ghost">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </Button>
                <Button className="w-full justify-start" variant="ghost">
                  <Award className="w-4 h-4 mr-2" />
                  View Certificates
                </Button>
                <Button className="w-full justify-start" variant="ghost">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Study Time
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};