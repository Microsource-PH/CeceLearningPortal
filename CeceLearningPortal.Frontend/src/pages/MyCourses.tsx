import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/LearningPortal/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import studentService, { EnrolledCourse } from "@/services/studentService";
import courseService from "@/services/courseService";
import { formatPHP } from "@/utils/currency";
import {
  BookOpen,
  Clock,
  PlayCircle,
  Award,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  Zap,
  Crown
} from "lucide-react";

const MyCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<EnrolledCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    if (!user || (user.role !== 'Student' && user.role !== 'Learner')) {
      navigate('/');
      return;
    }
    fetchEnrolledCourses();
    
    // Refresh data when page gains focus
    const handleFocus = () => {
      fetchEnrolledCourses();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Also refresh every 30 seconds if page is active
    const refreshInterval = setInterval(() => {
      if (!document.hidden) {
        fetchEnrolledCourses();
      }
    }, 30000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(refreshInterval);
    };
  }, [user]);

  useEffect(() => {
    filterAndSortCourses();
  }, [enrolledCourses, searchQuery, statusFilter, sortBy]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const result = await studentService.getEnrolledCourses();
      
      if (result.data) {
        setEnrolledCourses(result.data);
      } else if (result.error && result.error.includes('404')) {
        // API endpoint doesn't exist, get from localStorage
        const storedCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        
        // Transform stored courses to match EnrolledCourse interface
        const transformedCourses: EnrolledCourse[] = storedCourses.map((course: any) => ({
          id: course.id || course.courseId,
          courseId: course.courseId,
          title: course.title,
          instructor: course.instructor || 'Instructor',
          thumbnail: course.thumbnail || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=400&h=250&fit=crop&auto=format`,
          progress: course.progress || 0,
          status: course.status || 'not_started',
          enrolledAt: course.enrolledAt || new Date().toISOString(),
          lastAccessedAt: course.lastAccessedAt,
          completedAt: course.completedAt,
          certificateUrl: course.certificateUrl,
          totalLessons: course.totalLessons || 10,
          completedLessons: course.completedLessons || 0,
          nextLesson: course.nextLesson || (course.status !== 'completed' ? {
            id: 1,
            title: 'Introduction',
            type: 'video'
          } : undefined)
        }));
        
        setEnrolledCourses(transformedCourses);
      } else if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load your courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCourses = () => {
    let filtered = [...enrolledCourses];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.lastAccessedAt || b.enrolledAt).getTime() - 
                              new Date(a.lastAccessedAt || a.enrolledAt).getTime());
        break;
      case "progress":
        filtered.sort((a, b) => b.progress - a.progress);
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredCourses(filtered);
  };

  const getCourseStats = () => {
    const total = enrolledCourses.length;
    const completed = enrolledCourses.filter(c => c.status === 'completed').length;
    const inProgress = enrolledCourses.filter(c => c.status === 'in_progress').length;
    const notStarted = enrolledCourses.filter(c => c.status === 'not_started').length;
    const avgProgress = total > 0 
      ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / total)
      : 0;

    return { total, completed, inProgress, notStarted, avgProgress };
  };

  const stats = getCourseStats();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-learning-success text-white">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-learning-warning text-white">In Progress</Badge>;
      case 'not_started':
        return <Badge variant="secondary">Not Started</Badge>;
      default:
        return null;
    }
  };

  const getNextLessonButton = (course: EnrolledCourse) => {
    if (course.status === 'completed' && course.certificateUrl) {
      return (
        <Button size="sm" variant="outline" onClick={() => window.open(course.certificateUrl, '_blank')}>
          <Award className="w-4 h-4 mr-2" />
          View Certificate
        </Button>
      );
    }

    if (course.nextLesson) {
      return (
        <Button size="sm" onClick={() => navigate(`/learn/course/${course.courseId}`)}>
          <PlayCircle className="w-4 h-4 mr-2" />
          {course.status === 'not_started' ? 'Start Course' : 'Continue'}
        </Button>
      );
    }

    return (
      <Button size="sm" onClick={() => navigate(`/courses/${course.courseId}`)}>
        <BookOpen className="w-4 h-4 mr-2" />
        View Course
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg">Loading your courses...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            My Courses
          </h1>
          <p className="text-muted-foreground">
            Track your learning progress and continue where you left off
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-learning-success">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-learning-success/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-learning-warning">{stats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-learning-warning/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Not Started</p>
                  <p className="text-2xl font-bold text-muted-foreground">{stats.notStarted}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-muted-foreground/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold text-learning-blue">{stats.avgProgress}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-learning-blue/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="recent">Recently Accessed</option>
            <option value="progress">Progress</option>
            <option value="title">Title</option>
          </select>
        </div>

        {/* Courses List */}
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-6">
            {filteredCourses.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all" 
                      ? "Try adjusting your filters" 
                      : "You haven't enrolled in any courses yet"}
                  </p>
                  {!searchQuery && statusFilter === "all" && (
                    <Button onClick={() => navigate('/marketplace')}>
                      Browse Courses
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="group hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                    <div className="relative overflow-hidden">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {/* Course Type Badge */}
                        {course.courseType && (
                          <Badge className={`${
                            course.courseType === 'Sprint' ? 'bg-orange-500' :
                            course.courseType === 'Marathon' ? 'bg-purple-500' :
                            course.courseType === 'Membership' ? 'bg-blue-500' :
                            'bg-green-500'
                          } text-white shadow-lg text-xs`}>
                            {course.courseType === 'Sprint' && <Zap className="w-3 h-3 mr-1" />}
                            {course.courseType === 'Marathon' && <TrendingUp className="w-3 h-3 mr-1" />}
                            {course.courseType === 'Membership' && <Crown className="w-3 h-3 mr-1" />}
                            {course.courseType === 'Custom' && <Star className="w-3 h-3 mr-1" />}
                            {course.courseType}
                          </Badge>
                        )}
                        {getStatusBadge(course.status)}
                      </div>
                      {course.progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                          <Progress value={course.progress} className="h-2" />
                          <p className="text-xs text-white mt-1 text-center">{course.progress}% Complete</p>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(course.enrolledAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {course.nextLesson && course.status !== 'completed' && (
                        <div className="text-sm bg-secondary/50 p-2 rounded">
                          <p className="text-xs text-muted-foreground">Next lesson:</p>
                          <p className="font-medium truncate">{course.nextLesson.title}</p>
                        </div>
                      )}

                      <div className="pt-2">
                        {getNextLessonButton(course)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            {filteredCourses.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all" 
                      ? "Try adjusting your filters" 
                      : "You haven't enrolled in any courses yet"}
                  </p>
                  {!searchQuery && statusFilter === "all" && (
                    <Button onClick={() => navigate('/marketplace')}>
                      Browse Courses
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-card-hover transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer"
                                  onClick={() => navigate(`/courses/${course.courseId}`)}>
                                {course.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              {/* Course Type Badge */}
                              {course.courseType && (
                                <Badge className={`${
                                  course.courseType === 'Sprint' ? 'bg-orange-500' :
                                  course.courseType === 'Marathon' ? 'bg-purple-500' :
                                  course.courseType === 'Membership' ? 'bg-blue-500' :
                                  'bg-green-500'
                                } text-white shadow-lg text-xs`}>
                                  {course.courseType === 'Sprint' && <Zap className="w-3 h-3 mr-1" />}
                                  {course.courseType === 'Marathon' && <TrendingUp className="w-3 h-3 mr-1" />}
                                  {course.courseType === 'Membership' && <Crown className="w-3 h-3 mr-1" />}
                                  {course.courseType === 'Custom' && <Star className="w-3 h-3 mr-1" />}
                                  {course.courseType}
                                </Badge>
                              )}
                              {getStatusBadge(course.status)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Enrolled {new Date(course.enrolledAt).toLocaleDateString()}</span>
                            </div>
                            {course.lastAccessedAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>Last accessed {new Date(course.lastAccessedAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Progress value={course.progress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">{course.progress}% Complete</p>
                            </div>
                            {getNextLessonButton(course)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyCourses;