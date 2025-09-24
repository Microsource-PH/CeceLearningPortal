import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatPHP } from "@/utils/currency";
import DatabaseService from "@/services/databaseService";
import { getCourseThumbnail, formatRating } from "@/utils/format";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  Users, 
  Star, 
  PlayCircle,
  BookOpen,
  ArrowRight,
  Filter,
  Search,
  Award
} from "lucide-react";

export const CourseSection = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const result = await DatabaseService.getCourses();
      if (result.data) {
        // Sort by student count and rating to get top courses
        const sortedCourses = result.data
          .filter(course => course.status === 'active')
          .sort((a, b) => {
            const scoreA = (a.studentsCount || 0) * 0.7 + (a.averageRating || 0) * 100;
            const scoreB = (b.studentsCount || 0) * 0.7 + (b.averageRating || 0) * 100;
            return scoreB - scoreA;
          })
          .slice(0, 8); // Get top 8 courses
        setCourses(sortedCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from courses
  const categories = ["All", ...new Set(courses.map(c => c.category).filter(Boolean))];

  // Filter courses based on search and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Courses</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our most popular courses designed to accelerate your learning journey
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button 
                key={category} 
                variant={selectedCategory === category ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => {
              const discount = course.originalPrice && course.originalPrice > course.price 
                ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
                : 0;
              
              return (
                <Card key={course.id} className="group hover:shadow-card-hover transition-all duration-300 overflow-hidden">
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
                    <div className="absolute top-4 left-4">
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      <Badge variant="secondary" className="bg-black/70 text-white">
                        {course.category}
                      </Badge>
                      {discount > 0 && (
                        <Badge className="bg-destructive text-white">
                          {discount}% OFF
                        </Badge>
                      )}
                    </div>
                    {(course.studentsCount || 0) > 1000 && (
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-learning-warning text-white">
                          <Award className="w-3 h-3 mr-1" />
                          Bestseller
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">by {course.instructorName}</p>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{formatRating(course.averageRating || 0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{(course.studentsCount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <div className="text-xl font-bold text-learning-blue">
                          {formatPHP(course.price)}
                        </div>
                        {course.originalPrice && course.originalPrice > course.price && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatPHP(course.originalPrice)}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="group-hover:translate-x-1 transition-transform"
                        onClick={() => navigate('/marketplace')}
                      >
                        Enroll Now
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="learning" size="lg" onClick={() => navigate('/marketplace')}>
            <BookOpen className="w-4 h-4 mr-2" />
            View All Courses
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};