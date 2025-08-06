import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPHP } from "@/utils/currency";
import { 
  BookOpen, Clock, Award, Star, Users, BarChart3, Calendar, 
  Download, Video, FileText, CheckCircle, PlayCircle, Lock,
  ShoppingCart, CreditCard, DollarSign, Zap, Globe, Shield,
  ChevronDown, ChevronRight
} from "lucide-react";

interface CoursePreviewProps {
  course: any;
  isOpen: boolean;
  onClose: () => void;
  onEnroll?: () => void;
  isEnrolled?: boolean;
}

export const CoursePreview = ({ course, isOpen, onClose, onEnroll, isEnrolled = false }: CoursePreviewProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedModules, setExpandedModules] = useState<Set<number>>(() => {
    // Expand all modules by default
    if (course && course.modules) {
      return new Set(course.modules.map((m: any, i: number) => m.id || i));
    }
    return new Set();
  });
  
  if (!course) return null;

  const toggleModule = (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Format pricing based on pricing model
  const formatPricing = () => {
    if (!course.price || course.price === 0 || course.pricingModel === "Free") {
      return { text: "Free", subtext: "" };
    }
    
    switch (course.pricingModel) {
      case "Subscription":
        return { 
          text: `${formatPHP(course.price)}`, 
          subtext: `per ${course.subscriptionPeriod?.toLowerCase() || 'month'}` 
        };
      case "PaymentPlan":
        return { 
          text: `${formatPHP(course.paymentAmount || course.price / (course.numberOfPayments || 1))}`, 
          subtext: `x ${course.numberOfPayments} ${course.paymentFrequency?.toLowerCase() || 'monthly'} payments` 
        };
      case "OneTime":
      default:
        return { text: formatPHP(course.price), subtext: "one-time payment" };
    }
  };

  const pricing = formatPricing();

  // Get course type badge color
  const getCourseTypeBadge = () => {
    const typeColors = {
      Sprint: "bg-orange-500",
      Marathon: "bg-purple-500", 
      Membership: "bg-blue-500",
      Custom: "bg-green-500"
    };
    
    return (
      <Badge className={`${typeColors[course.courseType] || "bg-gray-500"} text-white`}>
        {course.courseType || "Course"}
      </Badge>
    );
  };

  // Get access type info
  const getAccessInfo = () => {
    if (course.accessType === "Limited") {
      return `${course.accessDuration || 30} days access`;
    }
    return "Lifetime access";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        {/* Header with course image */}
        <div className="relative h-48 bg-gradient-to-r from-primary/10 to-primary/5">
          {course.thumbnailUrl && (
            <img 
              src={course.thumbnailUrl} 
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getCourseTypeBadge()}
                  <Badge variant="outline">
                    {course.level || "All Levels"}
                  </Badge>
                  <Badge variant="outline">
                    {course.category || "General"}
                  </Badge>
                </div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  {course.title}
                </DialogTitle>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{pricing.text}</div>
                {pricing.subtext && (
                  <div className="text-sm text-muted-foreground">{pricing.subtext}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">About this course</h3>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div className="font-medium">{course.duration || "Self-paced"}</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Students</div>
                        <div className="font-medium">{course.enrollmentCount || 0}</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex items-center gap-2">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                        <div className="font-medium">{course.rating || 0}/5</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Access</div>
                        <div className="font-medium">{getAccessInfo()}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {course.objectives && course.objectives.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">What you'll learn</h3>
                    <ul className="space-y-2">
                      {course.objectives.map((objective: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Course Content</h3>
                  <div className="text-sm text-muted-foreground">
                    {course.modules?.length || 0} modules • {
                      course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0
                    } lessons
                  </div>
                </div>

                {course.modules && course.modules.length > 0 ? (
                  <div className="space-y-2">
                    {course.modules.map((module: any, index: number) => (
                      <Card key={module.id || index} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div 
                                className="flex items-center justify-between mb-1 cursor-pointer"
                                onClick={() => toggleModule(module.id || index)}
                              >
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    {expandedModules.has(module.id || index) ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <h4 className="font-medium">
                                    Module {index + 1}: {module.title}
                                  </h4>
                                </div>
                                {module.duration_minutes && (
                                  <span className="text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {module.duration_minutes} min
                                  </span>
                                )}
                              </div>
                              {module.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {module.description}
                                </p>
                              )}
                              {module.lessons && module.lessons.length > 0 && (
                                <>
                                  {!expandedModules.has(module.id || index) && (
                                    <div className="text-xs text-muted-foreground">
                                      {module.lessons.length} lesson{module.lessons.length > 1 ? 's' : ''}
                                    </div>
                                  )}
                                  {expandedModules.has(module.id || index) && (
                                    <div className="space-y-1 mt-3 pl-8">
                                      {module.lessons.map((lesson: any, lessonIndex: number) => (
                                    <div key={lesson.id || lessonIndex} className="flex items-center gap-2 text-sm">
                                      {(() => {
                                        const type = lesson.type?.toLowerCase();
                                        switch (type) {
                                          case "video":
                                            return <Video className="w-3 h-3 text-primary" />;
                                          case "assignment":
                                            return <FileText className="w-3 h-3 text-orange-500" />;
                                          case "quiz":
                                            return <BarChart3 className="w-3 h-3 text-purple-500" />;
                                          case "text":
                                            return <BookOpen className="w-3 h-3 text-blue-500" />;
                                          default:
                                            return <FileText className="w-3 h-3 text-muted-foreground" />;
                                        }
                                      })()}
                                      <span>{lesson.title}</span>
                                      {lesson.duration && (
                                        <span className="text-muted-foreground ml-auto">
                                          {lesson.duration}
                                        </span>
                                      )}
                                      {lesson.isPreview && !isEnrolled && (
                                        <Badge variant="secondary" className="ml-2">
                                          <PlayCircle className="w-3 h-3 mr-1" />
                                          Preview
                                        </Badge>
                                      )}
                                      {!isEnrolled && !lesson.isPreview && (
                                        <Lock className="w-3 h-3 ml-auto text-muted-foreground" />
                                      )}
                                    </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            {course.dripContent && (
                              <Badge variant="outline" className="ml-2">
                                <Zap className="w-3 h-3 mr-1" />
                                Drip
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Course curriculum will be available soon
                  </div>
                )}
              </TabsContent>

              <TabsContent value="instructor" className="space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={course.instructorAvatar || `https://api.dicebear.com/7.x/personas/svg?seed=${course.instructorName}`}
                    alt={course.instructorName}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{course.instructorName || "Course Instructor"}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {course.instructorTitle || "Professional Instructor"}
                    </p>
                    <p className="text-sm">
                      {course.instructorBio || "Experienced instructor with a passion for teaching."}
                    </p>
                  </div>
                </div>

                {course.instructorStats && (
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{course.instructorStats.total_courses || course.instructorStats.totalCourses || 0}</div>
                        <div className="text-sm text-muted-foreground">Courses</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{course.instructorStats.total_students || course.instructorStats.totalStudents || 0}</div>
                        <div className="text-sm text-muted-foreground">Students</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Math.round(course.instructorStats.average_rating || course.instructorStats.rating || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-lg font-bold">
                            {(course.instructorStats.average_rating || course.instructorStats.rating || 0).toFixed(1)}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Rating</div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <h3 className="font-semibold mb-4">Course Features</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {(course.courseFeatures?.certificate || course.hasCertificate) && (
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span>Certificate of Completion</span>
                    </div>
                  )}
                  {(course.courseFeatures?.community || course.hasCommunity) && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>Community Access</span>
                    </div>
                  )}
                  {(course.courseFeatures?.liveSessions || course.hasLiveSessions) && (
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-primary" />
                      <span>Live Sessions</span>
                    </div>
                  )}
                  {(course.courseFeatures?.downloadableResources || course.hasDownloadableResources) && (
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-primary" />
                      <span>Downloadable Resources</span>
                    </div>
                  )}
                  {(course.courseFeatures?.assignments || course.hasAssignments) && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>Assignments</span>
                    </div>
                  )}
                  {(course.courseFeatures?.quizzes || course.hasQuizzes) && (
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <span>Quizzes & Tests</span>
                    </div>
                  )}
                  
                  {/* Fallback for string array features */}
                  {course.features && Array.isArray(course.features) && course.features.length > 0 && !course.courseFeatures && (
                    <>
                      {course.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {course.language && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        Language: {course.language === 'en' ? 'English' : course.language}
                      </span>
                    </div>
                  </div>
                )}

                {course.enrollmentLimit && (
                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground">
                      Limited to {course.enrollmentLimit} students
                    </div>
                    <Progress 
                      value={(course.enrollmentCount || 0) / course.enrollmentLimit * 100} 
                      className="mt-1"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {course.enrollmentCount || 0} / {course.enrollmentLimit} enrolled
                    </div>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {!isEnrolled && (
              <Button onClick={onEnroll} className="min-w-[200px]">
                {course.price === 0 || course.pricingModel === "Free" ? (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Enroll for Free
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Enroll Now - {pricing.text}
                  </>
                )}
              </Button>
            )}
            {isEnrolled && (
              <Button onClick={() => navigate(`/learning/course/${course.id}`)}>
                <PlayCircle className="w-4 h-4 mr-2" />
                Continue Learning
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};