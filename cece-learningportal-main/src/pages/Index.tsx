import { useState, useEffect } from "react";
import { Navigation } from "@/components/LearningPortal/Navigation";
import { HeroSection } from "@/components/LearningPortal/HeroSection";
import { DashboardSection } from "@/components/LearningPortal/DashboardSection";
import { CourseSection } from "@/components/LearningPortal/CourseSection";
import { CreatorDashboard } from "@/components/CourseManagement/CreatorDashboard";
import { CourseCreatorGHL } from "@/components/CourseManagement/CourseCreatorGHL";
import { CreatorHeroSection } from "@/components/LearningPortal/CreatorHeroSection";
import { StatsSection } from "@/components/LearningPortal/StatsSection";
import { FeaturesSection } from "@/components/LearningPortal/FeaturesSection";
import { TestimonialsSection } from "@/components/LearningPortal/TestimonialsSection";
import { CourseAnalytics } from "@/components/Creator/CourseAnalytics";
import { EarningsReport } from "@/components/Creator/EarningsReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPHP } from "@/utils/currency";
import { getCourseThumbnail, formatRating } from "@/utils/format";
import { 
  Plus, 
  BookOpen, 
  Users, 
  DollarSign, 
  Star,
  Search,
  Edit, 
  Eye, 
  BarChart3,
  Award,
  Clock
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useUserId } from "@/hooks/useUserId";
import DatabaseService from "@/services/databaseService";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const userId = useUserId();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [creatorCourses, setCreatorCourses] = useState<any[]>([]);
  const [creatorStats, setCreatorStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showGHLCreator, setShowGHLCreator] = useState(false);

  useEffect(() => {
    if (user?.role === 'Creator' || user?.role === 'Instructor') {
      fetchCreatorData();
    }
  }, [user, userId]);

  const fetchCreatorData = async () => {
    if (!userId) return;
    
    try {
      // Fetch all courses
      const coursesResult = await DatabaseService.getCourses();
      if (coursesResult.data) {
        console.log('All courses:', coursesResult.data);
        console.log('Current userId:', userId);
        
        // Filter courses for this creator
        const myCourses = coursesResult.data.filter(course => {
          console.log('Course:', course.title, 'instructorId:', course.instructorId, 'instructorName:', course.instructorName, 'userId:', userId, 'userName:', user?.name);
          // Handle both camelCase and snake_case field names, and match by name for demo
          return course.instructorId === userId || 
                 course.instructor_id === userId || 
                 course.instructor?.id === userId ||
                 (user?.name && course.instructorName === user.name);
        });
        
        console.log('Filtered courses for creator:', myCourses);
        setCreatorCourses(myCourses);
      }

      // Fetch creator stats
      const statsResult = await DatabaseService.getCreatorStats(userId);
      if (statsResult.data) {
        setCreatorStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error fetching creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => {
    if (!isAuthenticated) {
      // Guest users see full landing experience
      return (
        <>
          <HeroSection />
          <CourseSection />
          <StatsSection />
          <FeaturesSection />
          <TestimonialsSection />
        </>
      );
    }

    switch (user?.role) {
      case 'Learner':
      case 'Student': // Fallback for old data
        // Learners see learning dashboard + courses + progress features
        return (
          <>
            <HeroSection userName={user?.name} userRole={user?.role} />
            <DashboardSection />
            <CourseSection />
            <StatsSection />
            <FeaturesSection />
          </>
        );
      case 'Creator':
      case 'Instructor': // Fallback for old data
        // Use real data from database or fallback to mock data
        const coursesData = creatorCourses.length > 0 ? creatorCourses : [
          {
            id: 1,
            title: "Advanced React Patterns & Performance",
            description: "Master advanced React concepts including hooks, context, and performance optimization techniques.",
            category: "Web Development",
            thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&auto=format",
            status: "active",
            students: 1247,
            rating: 4.8,
            revenue: "₱422,500",
            lastUpdated: "2 days ago",
            price: 4499.00,
            originalPrice: 7499.00,
            duration: "8 hours",
            level: "Advanced",
            features: ["Live coding sessions", "Project-based learning", "Community access"],
            enrollmentType: "one-time",
            lectures: 24
          },
          {
            id: 2,
            title: "JavaScript Fundamentals for Beginners",
            description: "Learn JavaScript from scratch with hands-on projects and real-world examples.",
            category: "Programming",
            thumbnail: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=250&fit=crop&auto=format",
            status: "draft",
            students: 0,
            rating: 0,
            revenue: "₱0",
            lastUpdated: "5 days ago",
            price: 2999.00,
            originalPrice: 4999.00,
            duration: "12 hours",
            level: "Beginner",
            features: ["Interactive exercises", "Code challenges", "Certificate"],
            enrollmentType: "one-time",
            lectures: 18
          }
        ];

        const statsData = creatorStats || {
          totalCourses: coursesData.length,
          totalStudents: coursesData.reduce((sum, course) => sum + (course.students || course.totalStudents || 0), 0),
          totalEarnings: coursesData.reduce((sum, course) => {
            const revenue = typeof course.revenue === 'string' 
              ? parseFloat(course.revenue.replace(/[₱,]/g, '')) 
              : (course.revenue || course.totalRevenue || 0);
            return sum + revenue;
          }, 0),
          avgRating: coursesData.reduce((sum, course) => sum + (course.rating || 0), 0) / coursesData.length || 4.5
        };

        const handleCreateCourse = () => {
          setShowGHLCreator(true);
        };

        const handleEditCourse = (courseId: number) => {
          console.log('Editing course:', courseId);
        };

        const filteredCourses = coursesData.filter(course => {
          const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesStatus = selectedFilter === "all" || course.status === selectedFilter;
          return matchesSearch && matchesStatus;
        });

        const handleGHLCourseComplete = (courseData: any) => {
          console.log('Course created:', courseData);
          setShowGHLCreator(false);
          fetchCreatorData(); // Refresh the course list
        };

        if (showGHLCreator) {
          return (
            <section className="py-16">
              <div className="container mx-auto px-6">
                <CourseCreatorGHL
                  onComplete={handleGHLCourseComplete}
                  onCancel={() => setShowGHLCreator(false)}
                />
              </div>
            </section>
          );
        }

        return (
          <>
            <CreatorHeroSection 
              onCreateCourse={handleCreateCourse}
              stats={statsData}
              userName={user?.name}
            />
            
            {/* Creator Dashboard with Tabs */}
            <section className="py-16">
              <div className="container mx-auto px-6">
                <Tabs defaultValue="my-courses" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="my-courses">My Courses</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="earnings">Earnings</TabsTrigger>
                  </TabsList>

                  {/* My Courses Tab */}
                  <TabsContent value="my-courses" className="mt-6">
                    <div className="space-y-6">
                      {/* Header Actions */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex flex-col md:flex-row gap-4 flex-1">
                          <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              placeholder="Search courses..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <select 
                            value={selectedFilter} 
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="px-3 py-2 border rounded-md bg-background"
                          >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="active">Published</option>
                            <option value="inactive">Unpublished</option>
                          </select>
                        </div>
                        
                        <Button onClick={handleCreateCourse}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Course
                        </Button>
                      </div>

                      {/* Courses Grid */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.map((course) => (
                          <Card key={course.id} className="group hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col h-full">
                            {/* Course Image */}
                            <div className="relative overflow-hidden">
                              <img 
                                src={course.thumbnail || getCourseThumbnail(course.category, course.id)} 
                                alt={course.title}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = getCourseThumbnail(course.category, course.id);
                                }}
                              />
                              
                              {/* Top Badges */}
                              <div className="absolute top-4 left-4 flex flex-col gap-2 max-w-[calc(100%-2rem)]">
                                {(course.studentsCount || course.students || 0) > 1000 && (
                                  <Badge className="bg-learning-warning text-white shadow-lg text-xs">
                                    <Award className="w-3 h-3 mr-1" />
                                    Bestseller
                                  </Badge>
                                )}
                                {course.category && (
                                  <Badge variant="secondary" className="bg-black/70 text-white border-0 text-xs truncate">
                                    {course.category}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Discount Badge */}
                              {course.discount > 0 && (
                                <div className="absolute top-4 right-4">
                                  <Badge className="bg-destructive text-white shadow-lg">
                                    {course.discount}% OFF
                                  </Badge>
                                </div>
                              )}
                              
                              {/* Level Badge */}
                              <div className="absolute bottom-4 left-4">
                                <Badge className={`${
                                  course.level === "Beginner" ? "bg-green-500/90 text-white" :
                                  course.level === "Intermediate" ? "bg-yellow-500/90 text-white" :
                                  course.level === "Advanced" ? "bg-red-500/90 text-white" :
                                  "bg-blue-500/90 text-white"
                                } shadow-lg border-0 text-xs`}>
                                  {course.level || 'All Levels'}
                                </Badge>
                              </div>
                              
                              {/* Status Badge */}
                              <div className="absolute bottom-4 right-4">
                                <Badge className={`${
                                  course.status === 'active' ? 'bg-green-500/90 text-white' : 
                                  course.status === 'draft' ? 'bg-yellow-500/90 text-white' : 
                                  'bg-gray-500/90 text-white'
                                } shadow-lg border-0 text-xs`}>
                                  {course.status === 'active' ? 'Published' : 
                                   course.status === 'draft' ? 'Draft' : 'Unpublished'}
                                </Badge>
                              </div>
                            </div>

                            <CardHeader className="pb-4">
                              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors h-14 flex items-center">
                                <span 
                                  className="overflow-hidden text-ellipsis"
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}
                                >
                                  {course.title}
                                </span>
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">by {course.instructorName || 'You'}</p>
                            </CardHeader>

                            <CardContent className="pt-0 space-y-4 flex-1 flex flex-col justify-between">
                              {/* Course Stats */}
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1 min-w-0">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                                  <span className="font-medium">{formatRating(course.rating || course.averageRating || 0)}</span>
                                  <span className="truncate">({(course.students || course.studentsCount || 0).toLocaleString()})</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Clock className="w-4 h-4" />
                                  <span>{course.duration || 'N/A'}</span>
                                </div>
                              </div>

                              {/* Revenue for Creator */}
                              <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                                <span className="text-sm text-muted-foreground">Revenue</span>
                                <span className="text-sm font-semibold">{formatPHP(course.revenue || 0)}</span>
                              </div>

                              {/* Price and Actions */}
                              <div className="flex items-center justify-between pt-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-lg font-bold text-learning-blue">{formatPHP(course.price)}</span>
                                  {course.originalPrice && course.originalPrice > course.price && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      {formatPHP(course.originalPrice)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => handleEditCourse(course.id)}
                                    className="h-8 w-8"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="icon" className="h-8 w-8">
                                    <BarChart3 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {filteredCourses.length === 0 && (
                        <div className="text-center py-12">
                          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                          <p className="text-muted-foreground mb-4">
                            {searchQuery || selectedFilter !== "all" 
                              ? "Try adjusting your search or filters" 
                              : "Start creating your first course"}
                          </p>
                          {!searchQuery && selectedFilter === "all" && (
                            <Button onClick={handleCreateCourse}>
                              <Plus className="w-4 h-4 mr-2" />
                              Create Your First Course
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Analytics Tab */}
                  <TabsContent value="analytics" className="mt-6">
                    {/* Stats Overview - Show accurate creator stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                      <Card className="bg-gradient-card shadow-card">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Courses</p>
                              <p className="text-2xl font-bold text-learning-blue">{statsData.totalCourses}</p>
                            </div>
                            <BookOpen className="w-8 h-8 text-learning-blue/60" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-card shadow-card">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Students</p>
                              <p className="text-2xl font-bold text-learning-success">{statsData.totalStudents.toLocaleString()}</p>
                            </div>
                            <Users className="w-8 h-8 text-learning-success/60" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-card shadow-card">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Earnings</p>
                              <p className="text-2xl font-bold text-learning-warning">{formatPHP(statsData.totalEarnings)}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-learning-warning/60" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-card shadow-card">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Average Rating</p>
                              <p className="text-2xl font-bold text-primary">{formatRating(statsData.avgRating)}</p>
                            </div>
                            <Star className="w-8 h-8 text-primary/60" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Course Analytics - without duplicate stats */}
                    <CourseAnalytics creatorId={userId || ''} />
                  </TabsContent>

                  {/* Earnings Tab */}
                  <TabsContent value="earnings" className="mt-6">
                    <EarningsReport creatorId={userId || ''} />
                  </TabsContent>
                </Tabs>
              </div>
            </section>
            
            <StatsSection />
            <TestimonialsSection />
          </>
        );
      case 'Admin':
        // Admins see comprehensive dashboard with all platform sections
        return (
          <>
            <HeroSection userName={user?.name} userRole={user?.role} />
            <DashboardSection />
            <CourseSection />
            <StatsSection />
            <FeaturesSection />
            <TestimonialsSection />
          </>
        );
      default:
        // Fallback for unknown roles or migration issues
        console.warn('Unknown user role:', user?.role);
        return (
          <>
            <HeroSection userName={user?.name} userRole={user?.role} />
            <DashboardSection />
            <CourseSection />
            <StatsSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {renderDashboard()}
    </div>
  );
};

export default Index;