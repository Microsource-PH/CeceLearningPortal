import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { formatPHP } from "@/utils/currency";
import { formatRating } from "@/utils/format";
import {
  Plus,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Star,
  Calendar,
  Search,
  Filter,
  Download,
  Send,
} from "lucide-react";
import { CourseEditor } from "./CourseEditor";
import { CourseEditorEnhanced } from "./CourseEditorEnhanced";
import { CourseCreatorGHL } from "./CourseCreatorGHL";
import { CourseEditorGHL } from "./CourseEditorGHL";
import { CourseForDisplay, CourseForEditor } from "@/types/course";
import { CourseAnalytics } from "@/components/Creator/CourseAnalytics";
import { EarningsReport } from "@/components/Creator/EarningsReport";
import { CoursePreview } from "./CoursePreview";
import api from "@/services/api";

interface CreatorDashboardProps {
  courses: CourseForDisplay[];
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalEarnings: number;
    avgRating: number;
  };
  onCreateCourse: () => void;
  onEditCourse: (courseId: number) => void;
  onDeleteCourse: (courseId: number) => void;
  onPublishCourse?: (courseId: number) => void;
  userId?: string | null;
}

export const CreatorDashboard = ({
  courses,
  stats,
  onCreateCourse,
  onEditCourse,
  onDeleteCourse,
  onPublishCourse,
  userId,
}: CreatorDashboardProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEditor, setShowEditor] = useState(false);
  const [showGHLCreator, setShowGHLCreator] = useState(false);
  const [editingCourse, setEditingCourse] = useState<
    CourseForDisplay | undefined
  >();
  const [previewCourse, setPreviewCourse] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCourse = () => {
    setEditingCourse(undefined);
    setShowGHLCreator(true);
  };

  const handleEditCourse = (course: CourseForDisplay) => {
    // Prefer route-based editor for consistency across app
    navigate(`/courses/edit/${course.id}`);
  };

  const handleViewCourse = (course: CourseForDisplay) => {
    navigate(`/courses/${course.id}`);
  };

  const handleViewAnalytics = (course: CourseForDisplay) => {
    navigate(`/analytics/course/${course.id}`);
  };

  // Convert display course to editor format
  const convertToEditorFormat = (course: CourseForDisplay): CourseForEditor => {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      originalPrice: course.originalPrice,
      duration: course.duration,
      level: (course.level as any) || "Beginner",
      category: course.category,
      thumbnail: course.thumbnail,
      status: (course.status as any) || "draft",
      features: course.features,
      enrollmentType: (course.enrollmentType as any) || "one-time",
      lectures: [], // Would be populated from database in real implementation
    };
  };

  const handleSaveCourse = (courseData: any) => {
    // Handle save logic here
    console.log("Saving course:", courseData);
    setShowEditor(false);
    setEditingCourse(undefined);
    onCreateCourse();
  };

  const handleGHLCourseComplete = (courseData: any) => {
    console.log("Course created:", courseData);
    setShowGHLCreator(false);
    onCreateCourse();
  };

  if (showGHLCreator) {
    return (
      <CourseCreatorGHL
        onComplete={handleGHLCourseComplete}
        onCancel={() => setShowGHLCreator(false)}
      />
    );
  }

  if (showEditor && editingCourse) {
    console.log("Rendering CourseEditorGHL with courseId:", editingCourse.id);
    return (
      <CourseEditorGHL
        courseId={editingCourse.id}
        onComplete={(data) => {
          console.log("Course updated:", data);
          setShowEditor(false);
          setEditingCourse(undefined);
          onCreateCourse(); // Refresh the list
        }}
        onCancel={() => {
          setShowEditor(false);
          setEditingCourse(undefined);
        }}
      />
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="space-y-6">
          {/* Main Content */}
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="mt-6">
              {/* Header Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="Draft">Draft</option>
                    <option value="Active">Published</option>
                    <option value="Inactive">Unpublished</option>
                    <option value="PendingApproval">Pending Approval</option>
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
                  <Card
                    key={course.id}
                    className="group hover:shadow-card-hover transition-all duration-300 overflow-hidden"
                  >
                    {/* Course Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge
                          className={`${
                            course.level === "Beginner"
                              ? "bg-green-100 text-green-800"
                              : course.level === "Intermediate"
                                ? "bg-yellow-100 text-yellow-800"
                                : course.level === "Advanced"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {course.level}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge
                          variant="secondary"
                          className="bg-black/70 text-white"
                        >
                          {course.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/70 rounded-lg p-2">
                          <div className="flex justify-between text-white text-xs mb-1">
                            <span>Status</span>
                            <span
                              className={`${
                                course.status === "Active" ||
                                course.status === "active"
                                  ? "text-green-400"
                                  : course.status === "Draft" ||
                                      course.status === "draft"
                                    ? "text-yellow-400"
                                    : course.status === "PendingApproval"
                                      ? "text-blue-400"
                                      : "text-gray-400"
                              }`}
                            >
                              {course.status === "Active" ||
                              course.status === "active"
                                ? "Published"
                                : course.status === "Draft" ||
                                    course.status === "draft"
                                  ? "Draft"
                                  : course.status === "PendingApproval"
                                    ? "Pending Approval"
                                    : "Unpublished"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Updated {course.lastUpdated}
                      </p>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-4">
                      {/* Course Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {formatRating(course.rating)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.students.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {formatPHP(
                              (course.students || 0) * (course.price || 0)
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xl font-bold text-learning-blue">
                          {formatPHP(course.price)}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCourse(course)}
                            className="group-hover:translate-x-1 transition-transform"
                            title="Edit Course"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="ml-1">EDIT</span>
                          </Button>
                          {(course.status === "Draft" ||
                            course.status === "draft") &&
                            onPublishCourse && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPublishCourse(course.id)}
                                className="text-green-600 hover:text-green-700"
                                title="Publish Course"
                              >
                                <Send className="w-4 h-4" />
                                <span className="ml-1">PUBLISH</span>
                              </Button>
                            )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCourse(course)}
                            disabled={isLoadingCourse}
                            title="View Course"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAnalytics(course)}
                            title="View Analytics"
                          >
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
                  <h3 className="text-lg font-semibold mb-2">
                    No courses found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Start creating your first course"}
                  </p>
                  {!searchQuery && statusFilter === "all" && (
                    <Button onClick={handleCreateCourse}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Course
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Courses
                        </p>
                        <p className="text-2xl font-bold text-learning-blue">
                          {stats.totalCourses}
                        </p>
                      </div>
                      <BookOpen className="w-8 h-8 text-learning-blue/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Students
                        </p>
                        <p className="text-2xl font-bold text-learning-success">
                          {stats.totalStudents.toLocaleString()}
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
                        <p className="text-sm text-muted-foreground">
                          Total Earnings
                        </p>
                        <p className="text-2xl font-bold text-learning-warning">
                          {formatPHP(stats.totalEarnings)}
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
                        <p className="text-sm text-muted-foreground">
                          Average Rating
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {stats.avgRating}
                        </p>
                      </div>
                      <Star className="w-8 h-8 text-primary/60" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <CourseAnalytics creatorId={userId || ""} />
            </TabsContent>

            <TabsContent value="earnings" className="mt-6">
              <EarningsReport creatorId={userId || ""} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Course Preview Modal */}
      {previewCourse && (
        <CoursePreview
          course={previewCourse}
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setPreviewCourse(null);
          }}
        />
      )}
    </section>
  );
};
