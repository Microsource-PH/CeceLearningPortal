import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navigation } from "@/components/LearningPortal/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import analyticsService, { CourseAnalytics } from "@/services/analyticsService";
import { formatPHP } from "@/utils/currency";
import {
  ArrowLeft,
  Users,
  Star,
  Clock,
  BarChart3,
  Activity,
} from "lucide-react";

const CourseAnalyticsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const courseId = id ? parseInt(id, 10) : NaN;

  const [data, setData] = useState<CourseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getCourseAnalytics(courseId);
        if (!mounted) return;
        if (res.error) {
          setError(res.error);
        } else {
          setData(res.data);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (!Number.isNaN(courseId)) {
      load();
    } else {
      setError("Invalid course id");
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [courseId]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-6 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Course Analytics
          </h1>
          {!Number.isNaN(courseId) && (
            <Button onClick={() => navigate(`/courses/${courseId}`)}>
              View Course
            </Button>
          )}
        </div>

        {loading && <div>Loading analytics…</div>}
        {error && <div className="text-destructive">Error: {error}</div>}

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.summary?.totalEnrollments ?? 0}
                </div>
                <p className="text-sm text-muted-foreground">Total learners</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.summary?.averageRating?.toFixed?.(2) ?? "N/A"}
                </div>
                <p className="text-sm text-muted-foreground">Average rating</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatPHP(data.summary?.totalRevenue || 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total revenue</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Completion & Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    label: "Completion Rate",
                    value: data.summary?.completionRate ?? 0,
                  },
                  {
                    label: "Average Progress",
                    value: data.summary?.averageProgress ?? 0,
                  },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{row.label}</span>
                      <span>{Math.round(row.value)}%</span>
                    </div>
                    <Progress value={row.value} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseAnalyticsPage;
