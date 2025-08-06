import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/LearningPortal/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreatorDashboard } from "@/components/CourseManagement/CreatorDashboard";
import { useAuth } from "@/contexts/AuthContext";
import courseService, { Course } from "@/services/courseService";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useToast } from "@/hooks/use-toast";
import { formatPHP } from "@/utils/currency";
import { formatRating } from "@/utils/format";
import { 
  Clock, 
  Users, 
  Star, 
  PlayCircle,
  BookOpen,
  ArrowRight,
  Filter,
  Search,
  Grid3X3,
  List,
  Plus,
  DollarSign,
  TrendingUp,
  Edit,
  Eye,
  BarChart3,
  Zap,
  Crown
} from "lucide-react";

const Courses = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { enrollInCourse, enrolling } = useEnrollment();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [courses, setCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect to marketplace
  useEffect(() => {
    navigate('/marketplace');
  }, []);

  // Fetch courses and enrollments
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses
      const coursesResponse = await courseService.getCourses();
      if (coursesResponse.data) {
        setCourses(coursesResponse.data);
      }

      // Fetch enrollments if authenticated
      if (isAuthenticated) {
        const enrollmentsResponse = await courseService.getMyEnrollments();
        if (enrollmentsResponse.data) {
          setMyEnrollments(enrollmentsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Map backend course data to UI format
  const allCourses = courses.map(course => {
    const enrollment = myEnrollments.find(e => e.courseId === course.id);
    return {
      id: course.id,
      title: course.title,
      instructor: course.instructor,
      rating: course.rating || 0,
      students: course.studentsCount,
      duration: course.duration,
      level: course.level,
      progress: enrollment ? enrollment.progressPercentage || 0 : 0,
      price: formatPHP(course.price),
      originalPrice: course.originalPrice ? formatPHP(course.originalPrice) : undefined,
      category: course.category,
      description: course.description,
      image: course.thumbnail || `https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&auto=format`,
      status: course.status,
      features: course.features || [],
      isBestseller: course.isBestseller || false,
      discount: course.discount,
      courseType: course.courseType
    };
  });

  const categories = ["All", "Development", "Marketing", "Design", "Business", "Data Science"];

  const filteredCourses = allCourses.filter(course => {
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesSearch = searchTerm === "" || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const isActive = user?.role === 'Admin' || course.status === 'Active';
    
    return matchesCategory && matchesSearch && isActive;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleEnrollOrView = async (course: any) => {
    if (course.progress > 0) {
      navigate(`/courses/${course.id}`);
    } else if (isAuthenticated) {
      const result = await enrollInCourse(course.id);
      if (result.success) {
        toast({
          title: "Enrollment Successful!",
          description: `You have been enrolled in ${course.title}`,
        });
        fetchData(); // Refresh enrollments
      } else {
        toast({
          title: "Enrollment Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } else {
      navigate(`/courses/${course.id}`);
    }
  };

  // Role-based rendering
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading courses...</div>
        </div>
      );
    }

    if (user?.role === 'Instructor' || user?.role === 'Creator') {
      // Course creators see their dashboard for managing courses
      const instructorCourses = allCourses.filter(course => 
        courses.find(c => c.id === course.id && c.instructorId === user.id)
      );

      const stats = {
        totalCourses: instructorCourses.length,
        totalStudents: instructorCourses.reduce((sum, course) => sum + course.students, 0),
        totalEarnings: instructorCourses.reduce((sum, course) => {
          const price = parseFloat(course.price.replace('$', ''));
          return sum + (price * course.students);
        }, 0),
        avgRating: instructorCourses.reduce((sum, course) => sum + course.rating, 0) / instructorCourses.length || 0
      };

      return (
        <CreatorDashboard 
          courses={instructorCourses.map(course => ({
            ...course,
            revenue: `$${(parseFloat(course.price.replace('$', '')) * course.students).toFixed(2)}`,
            lastUpdated: "Recently",
            lectures: Math.floor(Math.random() * 50) + 10
          }))}
          stats={stats}
          onCreateCourse={() => navigate('/create-course')}
          onEditCourse={(id) => navigate(`/edit-course/${id}`)}
          onDeleteCourse={async (id) => {
            const result = await courseService.deleteCourse(id);
            if (result.data) {
              toast({
                title: "Course Deleted",
                description: "The course has been successfully deleted.",
              });
              fetchData();
            }
          }}
        />
      );
    }

    if (user?.role === 'Admin') {
      // Admins see all courses with admin controls
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Course Management</h1>
              <p className="text-muted-foreground">
                Manage all courses, instructors, and platform content
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
              <Button onClick={() => navigate('/create-course')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>
          </div>

          {/* Admin Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Courses</p>
                    <p className="text-2xl font-bold text-learning-blue">{courses.length}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-learning-blue/60" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Students</p>
                    <p className="text-2xl font-bold text-learning-success">
                      {allCourses.reduce((sum, course) => sum + course.students, 0).toLocaleString()}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-learning-success/60" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-learning-warning">
                      ${allCourses.reduce((sum, course) => {
                        const price = parseFloat(course.price.replace('$', ''));
                        return sum + (price * course.students);
                      }, 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-learning-warning/60" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatRating(allCourses.reduce((sum, course) => sum + course.rating, 0) / allCourses.length || 0)}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {renderLearnerCourses()}
        </div>
      );
    }

    // Default view for learners and guests
    return renderLearnerCourses();
  };

  const renderLearnerCourses = () => (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {user?.role === 'Admin' ? 'All Courses' : 
           isAuthenticated ? 'Your Courses' : 'Available Courses'}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === 'Admin' ? 'Manage and monitor all platform courses' :
           isAuthenticated ? 'Continue learning and discover new courses' :
           'Explore our comprehensive course library and enhance your skills'}
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button 
              key={category} 
              variant={category === selectedCategory ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64"
            />
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex border border-input rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Course Results */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          Showing {filteredCourses.length} courses
        </p>
      </div>

      {/* Course Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="group hover:shadow-card-hover transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden">
                <img 
                  src={course.image} 
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
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    {course.category}
                  </Badge>
                </div>
                {course.progress > 0 && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/70 rounded-lg p-2">
                      <div className="flex justify-between text-white text-xs mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-1" />
                    </div>
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
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{formatRating(course.rating)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-xl font-bold text-learning-blue">
                      {typeof course.price === 'string' ? course.price : formatPHP(course.price || 0)}
                    </div>
                    {course.originalPrice && (
                      <div className="text-sm text-muted-foreground line-through">
                        {typeof course.originalPrice === 'string' ? course.originalPrice : formatPHP(course.originalPrice || 0)}
                      </div>
                    )}
                  </div>
                  {user?.role === 'Admin' ? (
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/edit-course/${course.id}`)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/courses/${course.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/analytics/course/${course.id}`)}>
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant={course.progress > 0 ? "learning" : "outline"} 
                      size="sm"
                      className="group-hover:translate-x-1 transition-transform"
                      disabled={enrolling}
                      onClick={() => handleEnrollOrView(course)}
                    >
                      {course.progress > 0 ? (
                        <>
                          Continue
                          <PlayCircle className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          {isAuthenticated ? 'Enroll Now' : 'View Course'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="group hover:shadow-card-hover transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-48 h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-2">
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
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <div className="text-xl font-bold text-learning-blue">
                          {typeof course.price === 'string' ? course.price : formatPHP(course.price || 0)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">by {course.instructor}</p>
                      <p className="text-muted-foreground">{course.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{formatRating(course.rating)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.students.toLocaleString()} students</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <Badge variant="secondary">{course.category}</Badge>
                      </div>

                      {user?.role === 'Admin' ? (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/edit-course/${course.id}`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/analytics/course/${course.id}`)}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant={course.progress > 0 ? "learning" : "outline"} 
                          className="group-hover:translate-x-1 transition-transform"
                          disabled={enrolling}
                          onClick={() => handleEnrollOrView(course)}
                        >
                          {course.progress > 0 ? (
                            <>
                              Continue
                              <PlayCircle className="w-4 h-4 ml-2" />
                            </>
                          ) : (
                            <>
                              {isAuthenticated ? 'Enroll Now' : 'View Course'}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {course.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default Courses;