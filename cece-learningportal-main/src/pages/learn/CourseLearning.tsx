import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/LearningPortal/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import courseService from "@/services/courseService";
import { useToast } from "@/hooks/use-toast";
import { 
  PlayCircle,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Clock,
  Award,
  Download,
  MessageSquare,
  Flag,
  CheckSquare
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  type: string;
  duration: string;
  content?: string;
  videoUrl?: string;
  isCompleted?: boolean;
  order: number;
}

interface Module {
  id: number;
  title: string;
  description?: string;
  lessons: Lesson[];
  order: number;
}

interface Course {
  id: number;
  title: string;
  modules: Module[];
  progress?: number;
  instructorName?: string;
}

const CourseLearning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [courseProgress, setCourseProgress] = useState(0);
  const [lessonProgress, setLessonProgress] = useState<Map<number, number>>(new Map());
  const [currentVideoProgress, setCurrentVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('CourseLearning component mounted with courseId:', courseId);
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  useEffect(() => {
    // Cleanup YouTube progress tracking on unmount or lesson change
    return () => {
      if (youtubeIntervalRef.current) {
        clearInterval(youtubeIntervalRef.current);
      }
    };
  }, [currentModuleIndex, currentLessonIndex]);

  // Save progress periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (course && courseId) {
        // Save current progress state
        localStorage.setItem(`course_${courseId}_progress`, JSON.stringify({
          completedLessons: Array.from(completedLessons),
          lessonProgress: Array.from(lessonProgress.entries()),
          overallProgress: courseProgress,
          lastSaved: new Date().toISOString()
        }));
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [courseId, course, completedLessons, lessonProgress, courseProgress]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      console.log('CourseLearning: Fetching course data for courseId:', courseId);
      const response = await courseService.getCourseById(parseInt(courseId!));
      console.log('CourseLearning: Course response:', response);
      if (response.data) {
        setCourse(response.data);
        
        // Initialize completed lessons from backend if available
        if (response.data.completedLessons) {
          setCompletedLessons(new Set(response.data.completedLessons));
        }
        
        // Load saved progress from localStorage
        let savedCompletedLessons = new Set<number>();
        let savedLessonProgress = new Map<number, number>();
        
        const savedProgress = localStorage.getItem(`course_${courseId}_progress`);
        if (savedProgress) {
          const progressData = JSON.parse(savedProgress);
          savedCompletedLessons = new Set(progressData.completedLessons || []);
          savedLessonProgress = new Map(progressData.lessonProgress || []);
          setCompletedLessons(savedCompletedLessons);
          setLessonProgress(savedLessonProgress);
        }
        
        // Count total lessons
        const totalLessons = response.data.modules.reduce((sum: number, module: any) => 
          sum + (module.lessons?.length || 0), 0
        );
        
        // Calculate initial progress with the loaded data
        calculateProgress(response.data, savedCompletedLessons, savedLessonProgress);
        
        // Update course status in localStorage
        const hasStarted = savedCompletedLessons.size > 0 || Array.from(savedLessonProgress.values()).some(p => p > 0);
        if (!hasStarted) {
          // First time accessing the course
          updateCourseStatusInStorage(parseInt(courseId!), 'in_progress', 0, totalLessons);
        }
      }
    } catch (error) {
      console.error('CourseLearning: Error fetching course:', error);
      toast({
        title: "Error",
        description: "Failed to load course content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCourseStatusInStorage = (courseId: number, status: string, progress?: number, totalLessons?: number) => {
    const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    const courseIndex = enrolledCourses.findIndex((c: any) => c.courseId === courseId);
    
    if (courseIndex >= 0) {
      enrolledCourses[courseIndex].status = status;
      enrolledCourses[courseIndex].lastAccessedAt = new Date().toISOString();
      
      // Update total lessons if provided
      if (totalLessons !== undefined) {
        enrolledCourses[courseIndex].totalLessons = totalLessons;
      }
      
      if (progress !== undefined) {
        enrolledCourses[courseIndex].progress = progress;
        const total = enrolledCourses[courseIndex].totalLessons || 10;
        enrolledCourses[courseIndex].completedLessons = Math.round((progress / 100) * total);
      }
      
      if (status === 'completed') {
        enrolledCourses[courseIndex].completedAt = new Date().toISOString();
      }
      
      localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
      console.log('Updated course status:', courseId, status, progress);
    }
  };

  const calculateProgress = (courseData: Course, completed: Set<number>, lessonProgressMap?: Map<number, number>) => {
    const progressMap = lessonProgressMap || lessonProgress;
    let totalProgress = 0;
    let totalLessons = 0;

    courseData.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        totalLessons++;
        if (completed.has(lesson.id)) {
          totalProgress += 100;
        } else {
          const progress = progressMap.get(lesson.id) || 0;
          totalProgress += progress;
        }
      });
    });

    const overallProgress = totalLessons > 0 ? totalProgress / totalLessons : 0;
    const roundedProgress = Math.round(overallProgress);
    setCourseProgress(roundedProgress);
    
    // Save progress to localStorage
    if (courseId) {
      localStorage.setItem(`course_${courseId}_progress`, JSON.stringify({
        completedLessons: Array.from(completed),
        lessonProgress: Array.from(progressMap.entries()),
        overallProgress: roundedProgress
      }));
      
      // Update course status in enrolled courses
      const status = roundedProgress === 100 ? 'completed' : roundedProgress > 0 ? 'in_progress' : 'not_started';
      updateCourseStatusInStorage(parseInt(courseId), status, roundedProgress);
    }
  };

  const markLessonComplete = async (lessonId: number) => {
    try {
      // Mark lesson as complete
      const newCompleted = new Set(completedLessons);
      newCompleted.add(lessonId);
      setCompletedLessons(newCompleted);
      
      // Update lesson progress to 100%
      const newLessonProgress = new Map(lessonProgress);
      newLessonProgress.set(lessonId, 100);
      setLessonProgress(newLessonProgress);
      
      if (course) {
        calculateProgress(course, newCompleted, newLessonProgress);
      }
      
      // Call API to update progress
      try {
        await courseService.updateLessonProgress(lessonId, 'Completed');
      } catch (apiError) {
        console.error('Failed to update lesson progress in backend:', apiError);
      }
      
      toast({
        title: "Lesson completed!",
        description: "Great job! Keep going!"
      });
      
      // Auto-advance to next lesson after a short delay
      setTimeout(() => {
        goToNextLesson();
      }, 1500);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const goToNextLesson = () => {
    if (!course) return;
    
    const currentModule = course.modules[currentModuleIndex];
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentModuleIndex < course.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
    } else {
      // Course completed!
      toast({
        title: "Course Completed!",
        description: "Congratulations on completing the course!"
      });
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      const prevModule = course?.modules[currentModuleIndex - 1];
      if (prevModule) {
        setCurrentLessonIndex(prevModule.lessons.length - 1);
      }
    }
  };

  const navigateToLesson = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
    setCurrentVideoProgress(0);
    setVideoDuration(0);
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>, lessonId: number) => {
    const video = e.currentTarget;
    if (video.duration) {
      const progress = (video.currentTime / video.duration) * 100;
      setCurrentVideoProgress(progress);
      
      // Update lesson progress
      const newLessonProgress = new Map(lessonProgress);
      newLessonProgress.set(lessonId, progress);
      setLessonProgress(newLessonProgress);
      
      // Recalculate overall course progress
      if (course) {
        calculateProgress(course, completedLessons, newLessonProgress);
      }
      
      // Mark as complete if watched > 90%
      if (progress > 90 && !completedLessons.has(lessonId)) {
        markLessonComplete(lessonId);
      }
    }
  };

  const handleVideoLoaded = (e: React.SyntheticEvent<HTMLVideoElement>, lessonId: number) => {
    const video = e.currentTarget;
    setVideoDuration(video.duration);
    
    // Restore previous progress if available
    if (lessonProgress.has(lessonId)) {
      const savedProgress = lessonProgress.get(lessonId) || 0;
      video.currentTime = (savedProgress / 100) * video.duration;
    }
  };

  const handleVideoProgress = (lessonId: number) => {
    // Save progress periodically (every 5 seconds)
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      
      // Update lesson progress in localStorage
      const progressData = {
        lessonId: lessonId,
        progress: progress,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`lesson_${lessonId}_progress`, JSON.stringify(progressData));
    }
  };

  // Track YouTube/Vimeo progress for embedded videos
  const startEmbeddedVideoTracking = (lessonId: number, videoUrl: string) => {
    // For YouTube videos, we need to use postMessage API
    if (videoUrl && (videoUrl.includes('youtube') || videoUrl.includes('youtu.be'))) {
      console.log('Starting YouTube progress tracking for lesson:', lessonId);
      
      // Since we can't directly access YouTube player API in iframe,
      // we'll simulate progress based on assumed viewing
      let assumedProgress = lessonProgress.get(lessonId) || 0;
      
      youtubeIntervalRef.current = setInterval(() => {
        // Increment progress by 2% every 3 seconds (rough estimate)
        assumedProgress = Math.min(assumedProgress + 2, 100);
        setCurrentVideoProgress(assumedProgress);
        
        const newLessonProgress = new Map(lessonProgress);
        newLessonProgress.set(lessonId, assumedProgress);
        setLessonProgress(newLessonProgress);
        
        if (course) {
          calculateProgress(course, completedLessons, newLessonProgress);
        }
        
        // Mark as complete if watched > 90%
        if (assumedProgress > 90 && !completedLessons.has(lessonId)) {
          markLessonComplete(lessonId);
          if (youtubeIntervalRef.current) {
            clearInterval(youtubeIntervalRef.current);
          }
        }
      }, 3000);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return Video;
      case 'Text':
        return FileText;
      case 'Quiz':
        return CheckSquare;
      case 'Assignment':
        return BookOpen;
      default:
        return FileText;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading course content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Course not found</h1>
            <Button onClick={() => navigate('/my-courses')} className="mt-4">
              Back to My Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentModule = course.modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];
  const isLessonCompleted = currentLesson ? completedLessons.has(currentLesson.id) : false;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r overflow-hidden`}>
          <ScrollArea className="h-full">
            <div className="p-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/courses/${courseId}`)}
                className="w-full justify-start mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course Details
              </Button>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Course Progress</h3>
                <Progress value={courseProgress} className="mb-2" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {completedLessons.size} of {course.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons completed
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {courseProgress}% Complete
                  </p>
                  {courseProgress === 100 && (
                    <Badge className="mt-2" variant="default">
                      <Award className="w-3 h-3 mr-1" />
                      Course Completed!
                    </Badge>
                  )}
                </div>
              </div>
              
              <Separator className="mb-4" />
              
              <div className="space-y-6">
                {course.modules.map((module, moduleIndex) => (
                  <div key={module.id}>
                    <h4 className="font-semibold mb-3 text-sm">
                      Module {moduleIndex + 1}: {module.title}
                    </h4>
                    <div className="space-y-1">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isActive = moduleIndex === currentModuleIndex && lessonIndex === currentLessonIndex;
                        const isCompleted = completedLessons.has(lesson.id);
                        const LessonIcon = getLessonIcon(lesson.type);
                        
                        const progress = lessonProgress.get(lesson.id) || 0;
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => navigateToLesson(moduleIndex, lessonIndex)}
                            className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                              isActive 
                                ? 'bg-primary text-primary-foreground' 
                                : 'hover:bg-muted'
                            }`}
                          >
                            <div className="flex-shrink-0 relative">
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : progress > 0 ? (
                                <div className="relative">
                                  <LessonIcon className={`w-5 h-5 ${isActive ? '' : 'text-muted-foreground'}`} />
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-[8px] text-white font-bold">{Math.round(progress)}</span>
                                  </div>
                                </div>
                              ) : (
                                <LessonIcon className={`w-5 h-5 ${isActive ? '' : 'text-muted-foreground'}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${isActive ? '' : isCompleted ? 'text-muted-foreground' : ''}`}>
                                {lessonIndex + 1}. {lesson.title}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className={`text-xs ${isActive ? 'opacity-80' : 'text-muted-foreground'}`}>
                                  {lesson.duration}
                                </p>
                                {progress > 0 && !isCompleted && (
                                  <Progress value={progress} className="h-1 w-12" />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">{currentLesson?.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Module {currentModuleIndex + 1} • Lesson {currentLessonIndex + 1}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousLesson}
                  disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextLesson}
                  disabled={
                    currentModuleIndex === course.modules.length - 1 &&
                    currentLessonIndex === currentModule.lessons.length - 1
                  }
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Lesson Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {currentLesson?.type === 'Video' && currentLesson.videoUrl && (
                <div className="mb-6">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    {currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be') ? (
                      // Handle YouTube URLs
                      <iframe
                        key={currentLesson.id}
                        src={currentLesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={() => startEmbeddedVideoTracking(currentLesson.id, currentLesson.videoUrl)}
                      />
                    ) : currentLesson.videoUrl.includes('vimeo.com') ? (
                      // Handle Vimeo URLs
                      <iframe
                        key={currentLesson.id}
                        src={currentLesson.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        onLoad={() => startEmbeddedVideoTracking(currentLesson.id, currentLesson.videoUrl)}
                      />
                    ) : (
                      // Handle direct video files
                      <video
                        ref={videoRef}
                        key={currentLesson.id}
                        src={currentLesson.videoUrl}
                        controls
                        className="w-full h-full"
                        onTimeUpdate={(e) => handleVideoTimeUpdate(e, currentLesson.id)}
                        onLoadedMetadata={(e) => handleVideoLoaded(e, currentLesson.id)}
                        onEnded={() => !isLessonCompleted && markLessonComplete(currentLesson.id)}
                        onProgress={() => handleVideoProgress(currentLesson.id)}
                        onError={(e) => {
                          console.error('Video playback error:', e);
                          console.error('Failed URL:', currentLesson.videoUrl);
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                  {/* Video Progress Bar */}
                  {currentLesson.type === 'Video' && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Video Progress</span>
                        <span>{Math.round(currentVideoProgress)}%</span>
                      </div>
                      <Progress value={currentVideoProgress} className="h-2" />
                    </div>
                  )}
                </div>
              )}
              
              {currentLesson?.type === 'Text' && currentLesson.content && (
                <Card>
                  <CardContent className="prose prose-sm max-w-none p-6">
                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                  </CardContent>
                </Card>
              )}
              
              {currentLesson?.type === 'Quiz' && (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <CheckSquare className="w-12 h-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2">Quiz</h3>
                      <p className="text-muted-foreground mb-4">
                        Test your knowledge with this quiz
                      </p>
                      <Button>Start Quiz</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {currentLesson?.type === 'Assignment' && (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2">Assignment</h3>
                      <p className="text-muted-foreground mb-4">
                        Complete this assignment to practice what you've learned
                      </p>
                      <Button>View Assignment</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Lesson Actions */}
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {!isLessonCompleted && currentLesson && (
                    <Button
                      onClick={() => markLessonComplete(currentLesson.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </Button>
                  )}
                  {isLessonCompleted && (
                    <Badge variant="secondary" className="px-4 py-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Resources
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Discussion
                  </Button>
                  <Button variant="outline" size="sm">
                    <Flag className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </div>
              </div>
              
              {/* Course Completion */}
              {courseProgress === 100 && (
                <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <CardContent className="p-6 text-center">
                    <Award className="w-16 h-16 mx-auto mb-4 text-green-600" />
                    <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
                    <p className="text-muted-foreground mb-4">
                      You have successfully completed this course
                    </p>
                    <Button size="lg">
                      Get Certificate
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;