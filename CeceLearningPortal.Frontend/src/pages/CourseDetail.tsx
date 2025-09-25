import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import courseService from "@/services/courseService";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useToast } from "@/hooks/use-toast";
import { formatPHP } from "@/utils/currency";
import {
  Clock,
  Users,
  Star,
  PlayCircle,
  BookOpen,
  ArrowLeft,
  Award,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  Crown,
  CheckCircle,
  Download,
  MessageCircle,
  Video,
  FileText,
  Lock,
  Unlock,
  DollarSign,
  Mail,
  Edit,
  Calendar,
  Target,
  BarChart,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { enrollInCourse, enrolling } = useEnrollment();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(parseInt(id!));
      if (response.data) {
        const data = response.data as any;
        console.log("Course data:", data);
        console.log("Course modules:", data.modules);
        if (data.modules && data.modules.length > 0) {
          data.modules.forEach((module: any, index: number) => {
            console.log(`Module ${index}:`, module);
            if (module.lessons) {
              module.lessons.forEach((lesson: any, lessonIndex: number) => {
                console.log(`  Lesson ${lessonIndex}:`, lesson);
                if (lesson.videoUrl) {
                  console.log(`    Video URL: ${lesson.videoUrl}`);
                }
              });
            }
          });
        }
        setCourse(data);

        // Check enrollment status
        if (isAuthenticated) {
          console.log("Checking enrollment status...");

          // First check API
          let enrolled = false;
          try {
            const enrollmentsResponse = await courseService.getMyEnrollments();
            console.log("Enrollments response:", enrollmentsResponse);
            if (enrollmentsResponse.data) {
              const enr = enrollmentsResponse.data as any[];
              console.log("User enrollments:", enr);
              console.log("Checking for courseId:", parseInt(id!));

              // Check multiple possible field names for course ID
              enrolled = enr.some((e: any) => {
                const courseIdMatch =
                  e.courseId === parseInt(id!) ||
                  e.course_id === parseInt(id!) ||
                  e.CourseId === parseInt(id!) ||
                  (e.course && e.course.id === parseInt(id!));
                console.log("Enrollment:", e, "Match:", courseIdMatch);
                return courseIdMatch;
              });
            }
          } catch (error) {
            console.error("Error fetching enrollments from API:", error);
          }

          // Also check localStorage as fallback
          if (!enrolled) {
            console.log("Checking localStorage enrollments...");
            const localEnrollments = JSON.parse(
              localStorage.getItem("enrolledCourses") || "[]"
            );
            console.log("Local enrollments:", localEnrollments);
            enrolled = localEnrollments.some(
              (e: any) => e.courseId === parseInt(id!)
            );
            console.log("Found in localStorage:", enrolled);
          }

          console.log("Final enrollment status:", enrolled);
          setIsEnrolled(enrolled);
        }
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const result = await enrollInCourse(
        course.id,
        course.title,
        course.price || 0,
        "purchase"
      );

      if (result.success) {
        setIsEnrolled(true);
        toast({
          title: "Success!",
          description: "You have been enrolled in this course",
        });

        // Optionally navigate to the course learning page
        setTimeout(() => {
          navigate("/my-courses");
        }, 2000);
      } else {
        toast({
          title: "Enrollment Failed",
          description: result.error || "Failed to enroll in course",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleStartCourse = () => {
    console.log("Start Course clicked");
    console.log("isEnrolled:", isEnrolled);
    console.log("isInstructor:", isInstructor);
    console.log("course.id:", course?.id);

    if (isEnrolled || isInstructor) {
      console.log("Navigating to:", `/learn/course/${course.id}`);
      navigate(`/learn/course/${course.id}`);
    } else {
      console.log("Not enrolled, showing error");
      toast({
        title: "Enrollment Required",
        description: "Please enroll in this course to start learning",
        variant: "destructive",
      });
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handlePreviewVideo = (videoUrl: string) => {
    console.log("Preview video URL:", videoUrl);

    // Clean up the URL if needed
    let cleanUrl = videoUrl.trim();

    // Handle YouTube URLs more robustly
    if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
      // Extract video ID
      let videoId = "";
      if (cleanUrl.includes("youtube.com/watch")) {
        const match = cleanUrl.match(/[?&]v=([^&]+)/);
        if (match) videoId = match[1];
      } else if (cleanUrl.includes("youtu.be/")) {
        const match = cleanUrl.match(/youtu\.be\/([^?]+)/);
        if (match) videoId = match[1];
      } else if (cleanUrl.includes("youtube.com/embed/")) {
        const match = cleanUrl.match(/embed\/([^?]+)/);
        if (match) videoId = match[1];
      }

      if (videoId) {
        cleanUrl = `https://www.youtube.com/embed/${videoId}`;
        console.log("Converted YouTube URL to embed format:", cleanUrl);
      }
    }

    setPreviewVideo(cleanUrl);
    setShowVideoDialog(true);
  };

  const canPreviewLesson = (lesson: any) => {
    // Allow preview for the first lesson of the first module, or if marked as preview
    return lesson.isPreview || (lesson.moduleOrder === 1 && lesson.order === 1);
  };

  const getCourseTypeIcon = (type: string) => {
    const icons: any = {
      Sprint: Zap,
      Marathon: TrendingUp,
      Membership: Crown,
      Custom: Star,
    };
    return icons[type] || Star;
  };

  const isInstructor = user?.id === course?.instructorId;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">
                Loading course details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Course not found</h1>
            <Button onClick={() => navigate("/marketplace")} className="mt-4">
              Back to Marketplace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const CourseTypeIcon = getCourseTypeIcon(course.courseType);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/marketplace")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Course Info */}
            <div className="lg:col-span-2">
              {/* Course Type & Category */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {course.courseType && (
                  <Badge
                    className={`
                    ${course.courseType === "Sprint" ? "bg-orange-500" : ""}
                    ${course.courseType === "Marathon" ? "bg-purple-500" : ""}
                    ${course.courseType === "Membership" ? "bg-blue-500" : ""}
                    ${course.courseType === "Custom" ? "bg-green-500" : ""}
                    text-white
                  `}
                  >
                    <CourseTypeIcon className="w-3 h-3 mr-1" />
                    {course.courseType}
                  </Badge>
                )}
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
                {course.isBestseller && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Bestseller
                  </Badge>
                )}
              </div>

              {/* Title & Description */}
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              {course.shortDescription && (
                <p className="text-xl text-muted-foreground mb-4">
                  {course.shortDescription}
                </p>
              )}

              {/* Course Stats */}
              <div className="flex items-center gap-6 mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">
                    {course.averageRating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-muted-foreground">
                    ({course.totalReviews || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span>{course.studentsCount || 0} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span>{course.duration || "Self-paced"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <span>
                    {course.language === "en"
                      ? "English"
                      : course.language || "English"}
                  </span>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="flex items-center gap-4 bg-background p-4 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={course.instructorAvatar} />
                  <AvatarFallback>
                    {course.instructorName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Created by</p>
                  <p className="font-semibold">{course.instructorName}</p>
                  {course.instructorBio && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {course.instructorBio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Enrollment Card */}
            <div>
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  {course.thumbnail && (
                    <div className="relative mb-6">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {course.promoVideoUrl && (
                        <button
                          onClick={() =>
                            handlePreviewVideo(course.promoVideoUrl)
                          }
                          className="absolute inset-0 flex items-center justify-center group"
                        >
                          <div className="bg-black/60 rounded-full p-3 group-hover:bg-black/80 transition-colors">
                            <PlayCircle className="w-8 h-8 text-white" />
                          </div>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold">
                        {formatPHP(course.price)}
                      </span>
                      {course.originalPrice &&
                        course.originalPrice > course.price && (
                          <>
                            <span className="text-lg text-muted-foreground line-through">
                              {formatPHP(course.originalPrice)}
                            </span>
                            <Badge variant="destructive">
                              {Math.round(
                                ((course.originalPrice - course.price) /
                                  course.originalPrice) *
                                  100
                              )}
                              % OFF
                            </Badge>
                          </>
                        )}
                    </div>
                    {course.pricingModel && (
                      <p className="text-sm text-muted-foreground">
                        {course.pricingModel}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isInstructor ? (
                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => navigate(`/courses/edit/${course.id}`)}
                      >
                        <Edit className="w-5 h-5 mr-2" />
                        Edit Course
                      </Button>
                      <Button
                        className="w-full"
                        size="lg"
                        variant="outline"
                        onClick={handleStartCourse}
                      >
                        <PlayCircle className="w-5 h-5 mr-2" />
                        Preview Course
                      </Button>
                    </div>
                  ) : isEnrolled ? (
                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleStartCourse}
                      >
                        <PlayCircle className="w-5 h-5 mr-2" />
                        Start Course
                      </Button>
                      <Button
                        className="w-full"
                        size="lg"
                        variant="outline"
                        onClick={() => navigate("/my-courses")}
                      >
                        <BookOpen className="w-5 h-5 mr-2" />
                        Go to My Courses
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? "Enrolling..." : "Enroll Now"}
                    </Button>
                  )}

                  {/* Course Includes */}
                  <div className="mt-6 space-y-3">
                    <h4 className="font-semibold">This course includes:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>
                          {course.accessType === "Lifetime"
                            ? "Lifetime access"
                            : `${course.accessDuration || 90} days access`}
                        </span>
                      </div>
                      {course.courseFeatures?.certificate && (
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-green-500" />
                          <span>Certificate of completion</span>
                        </div>
                      )}
                      {course.courseFeatures?.downloadableResources && (
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-green-500" />
                          <span>Downloadable resources</span>
                        </div>
                      )}
                      {course.courseFeatures?.community && (
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          <span>Access to community</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>30-day money-back guarantee</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            {course.features && course.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    What you'll learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.features.map((feature: string, index: number) => (
                      <div key={index} className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{course.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Course Content/Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Course Content
                  </span>
                  <Badge variant="outline">
                    {course.modules?.length || 0} modules •{" "}
                    {course.lecturesCount || 0} lectures •{" "}
                    {course.duration || "Self-paced"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.modules && course.modules.length > 0 ? (
                  <div className="space-y-4">
                    {course.modules.map((module: any, moduleIndex: number) => (
                      <Collapsible
                        key={module.id}
                        open={expandedModules.includes(module.id)}
                        onOpenChange={() => toggleModule(module.id)}
                      >
                        <div className="border rounded-lg overflow-hidden">
                          <CollapsibleTrigger className="w-full">
                            <div className="bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {expandedModules.includes(module.id) ? (
                                    <ChevronUp className="w-5 h-5" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5" />
                                  )}
                                  <h4 className="font-semibold text-left">
                                    Module {moduleIndex + 1}: {module.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-muted-foreground">
                                    {module.lessons?.length || 0} lessons
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {module.duration || "30 min"}
                                  </span>
                                </div>
                              </div>
                              {module.description && (
                                <p className="text-sm text-muted-foreground mt-1 ml-8 text-left">
                                  {module.description}
                                </p>
                              )}
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            {module.lessons && module.lessons.length > 0 && (
                              <div className="p-4 space-y-1">
                                {module.lessons.map(
                                  (lesson: any, lessonIndex: number) => {
                                    const isAccessible =
                                      isEnrolled || isInstructor;
                                    const canPreview =
                                      canPreviewLesson(lesson) ||
                                      (moduleIndex === 0 && lessonIndex === 0);

                                    return (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center gap-3 py-3 hover:bg-muted/30 rounded-lg px-2 transition-colors"
                                      >
                                        {isAccessible ? (
                                          <Unlock className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        ) : (
                                          <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        )}
                                        <div className="flex-1 flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            {lesson.type === "Video" && (
                                              <Video className="w-4 h-4 text-muted-foreground" />
                                            )}
                                            {lesson.type === "Text" && (
                                              <FileText className="w-4 h-4 text-muted-foreground" />
                                            )}
                                            {lesson.type === "Quiz" && (
                                              <BookOpen className="w-4 h-4 text-muted-foreground" />
                                            )}
                                            {lesson.type === "Assignment" && (
                                              <FileText className="w-4 h-4 text-muted-foreground" />
                                            )}
                                            <span className="text-sm">
                                              {lessonIndex + 1}. {lesson.title}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            {lesson.type === "Video" &&
                                              lesson.videoUrl &&
                                              (canPreview || isAccessible) && (
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => {
                                                    console.log(
                                                      "Clicking watch for lesson:",
                                                      lesson.title
                                                    );
                                                    console.log(
                                                      "Video URL:",
                                                      lesson.videoUrl
                                                    );
                                                    handlePreviewVideo(
                                                      lesson.videoUrl
                                                    );
                                                  }}
                                                  className="text-primary hover:text-primary/80"
                                                >
                                                  <PlayCircle className="w-4 h-4 mr-1" />
                                                  {canPreview && !isAccessible
                                                    ? "Preview"
                                                    : "Watch"}
                                                </Button>
                                              )}
                                            <span className="text-sm text-muted-foreground">
                                              {lesson.duration || "5 min"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4" />
                    <p>Course curriculum will be available soon</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Student Reviews
                  </span>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">
                      {course.averageRating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-muted-foreground">
                      ({course.totalReviews || 0} reviews)
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.recentReviews && course.recentReviews.length > 0 ? (
                  <div className="space-y-6">
                    {course.recentReviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="border-b last:border-0 pb-6 last:pb-0"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={review.studentAvatar} />
                            <AvatarFallback>
                              {review.studentName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">
                                {review.studentName}
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <p className="text-sm">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="w-12 h-12 mx-auto mb-4" />
                    <p>No reviews yet. Be the first to review this course!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            {/* Course Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course.courseFeatures?.certificate && (
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Certificate of Completion</p>
                        <p className="text-sm text-muted-foreground">
                          Earn a certificate upon completion
                        </p>
                      </div>
                    </div>
                  )}
                  {course.courseFeatures?.liveSessions && (
                    <div className="flex items-start gap-3">
                      <Video className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Live Sessions</p>
                        <p className="text-sm text-muted-foreground">
                          Regular Q&A with instructor
                        </p>
                      </div>
                    </div>
                  )}
                  {course.courseFeatures?.assignments && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Practical Assignments</p>
                        <p className="text-sm text-muted-foreground">
                          Hands-on practice exercises
                        </p>
                      </div>
                    </div>
                  )}
                  {course.courseFeatures?.quizzes && (
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Quizzes</p>
                        <p className="text-sm text-muted-foreground">
                          Test your knowledge
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>Basic understanding of {course.category}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>Computer with internet connection</span>
                  </div>
                  {course.level === "Advanced" && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span>Prior experience in the field recommended</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructor Stats */}
            {(course.instructorCourseCount ||
              course.instructorStudentCount) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    About the Instructor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={course.instructorAvatar} />
                        <AvatarFallback>
                          {course.instructorName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{course.instructorName}</p>
                        <p className="text-sm text-muted-foreground">
                          Course Creator
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Students</p>
                        <p className="font-semibold">
                          {course.instructorStudentCount || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Courses</p>
                        <p className="font-semibold">
                          {course.instructorCourseCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Video Preview Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-black/50 hover:bg-black/70"
              onClick={() => setShowVideoDialog(false)}
            >
              <X className="h-4 w-4 text-white" />
            </Button>
            {previewVideo && (
              <div className="aspect-video bg-black">
                {previewVideo.includes("youtube.com/embed/") ? (
                  // Handle YouTube embeds (already formatted)
                  <iframe
                    src={previewVideo}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : previewVideo.includes("vimeo.com") ? (
                  // Handle Vimeo URLs
                  <iframe
                    src={previewVideo.replace(
                      "vimeo.com/",
                      "player.vimeo.com/video/"
                    )}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // Handle direct video files
                  <video
                    src={previewVideo}
                    controls
                    autoPlay
                    className="w-full h-full"
                    onError={(e) => {
                      console.error("Video playback error:", e);
                      toast({
                        title: "Video Error",
                        description:
                          "Unable to play this video. Please check the URL format.",
                        variant: "destructive",
                      });
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetail;
