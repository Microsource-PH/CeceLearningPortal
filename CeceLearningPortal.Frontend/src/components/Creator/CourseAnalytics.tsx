import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import analyticsService, { InstructorAnalytics } from "@/services/analyticsService";
import { formatPHP } from "@/utils/currency";
import { formatPercentage, formatRating } from "@/utils/format";
import {
  BarChart3,
  TrendingUp,
  Users,
  Star,
  Clock,
  BookOpen,
  DollarSign,
  Activity
} from "lucide-react";

interface CourseAnalyticsProps {
  creatorId: string;
}

export const CourseAnalytics = ({ creatorId }: CourseAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<InstructorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [creatorId]);

  const fetchAnalytics = async () => {
    try {
      const result = await analyticsService.getInstructorAnalytics(creatorId);
      if (result.data) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="flex justify-center p-8">No analytics data available</div>;
  }

  // Check if this is a new creator with no data
  const hasNoData = analytics.summary.totalCourses === 0 && 
                    analytics.summary.totalRevenue === 0 &&
                    analytics.summary.totalStudents === 0;

  if (hasNoData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
        <p className="text-muted-foreground">
          Start creating courses and enrolling students to see your analytics here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Revenue Trend */}
      {analytics.monthlyRevenue && analytics.monthlyRevenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.monthlyRevenue.map((month) => {
                const maxRevenue = Math.max(...analytics.monthlyRevenue.map(m => m.revenue));
                const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={month.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      <span className="font-semibold">{formatPHP(month.revenue)}</span>
                    </div>
                    <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-gradient-to-r from-primary to-learning-success rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <h3 className="text-lg font-semibold">Course Performance</h3>
      <div className="grid grid-cols-1 gap-6">
        {analytics.coursePerformance.map((course) => (
          <Card key={course.courseId} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <Badge variant={course.status === 'Active' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatPHP(course.revenue)}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Enrollments</span>
                  </div>
                  <p className="text-xl font-semibold">{course.enrollments}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-semibold">{formatRating(course.averageRating)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                  </div>
                  <p className="text-xl font-semibold">{formatPercentage(course.completionRate)}</p>
                  <Progress value={course.completionRate} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Revenue/Student</span>
                  </div>
                  <p className="text-xl font-semibold">
                    {formatPHP(course.enrollments > 0 ? (course.revenue / course.enrollments) : 0)}
                  </p>
                </div>
              </div>

              {/* Course Stats Summary */}
              <div className="space-y-4">
                <h4 className="font-medium">Performance Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-lg font-semibold">{formatPHP(course.revenue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-lg font-semibold">{formatPercentage(course.completionRate)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Student Engagement Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Student Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Active Students</span>
              </div>
              <p className="text-xl font-semibold">{analytics.studentEngagement?.activeStudents || 0}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Average Progress</span>
              </div>
              <p className="text-xl font-semibold">{formatPercentage(analytics.studentEngagement?.averageProgressPercentage || 0)}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Completed Students</span>
              </div>
              <p className="text-xl font-semibold">{analytics.studentEngagement?.completedStudents || 0}</p>
            </div>
          </div>

          {/* Progress Distribution */}
          {analytics.studentEngagement?.progressDistribution && (
            <div className="mt-6 space-y-2">
              <h4 className="font-medium text-sm">Progress Distribution</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Not Started</span>
                  <span className="text-sm font-medium">{analytics.studentEngagement.progressDistribution.notStarted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="text-sm font-medium">{analytics.studentEngagement.progressDistribution.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="text-sm font-medium">{analytics.studentEngagement.progressDistribution.completed}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};