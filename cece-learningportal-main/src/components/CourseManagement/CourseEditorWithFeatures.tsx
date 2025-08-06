import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPHP } from "@/utils/currency";
import courseService from "@/services/courseService";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Upload, 
  Eye, 
  Plus, 
  Trash2, 
  GripVertical,
  Play,
  FileText,
  DollarSign,
  Clock,
  Users,
  Star,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send,
  Archive,
  Award,
  MessageSquare,
  Video,
  Download,
  HelpCircle,
  X,
  Zap,
  TrendingUp,
  Crown,
  BookOpen,
  GraduationCap,
  Trash,
  Settings
} from "lucide-react";
import { CourseDetailDto } from "@/types/api";

interface CourseFormData {
  // Course Type
  courseType: 'Sprint' | 'Marathon' | 'Membership' | 'Custom';
  
  // Basic Info
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  level: string;
  language: string;
  duration?: string;
  thumbnailUrl?: string;
  promoVideoUrl?: string;
  
  // Pricing
  pricingModel: string;
  price: number;
  originalPrice?: number;
  currency: string;
  subscriptionPeriod?: string;
  accessType: string;
  accessDuration?: number;
  enrollmentLimit?: number;
  
  // Features as boolean fields
  hasCertificate: boolean;
  hasCommunity: boolean;
  hasLiveSessions: boolean;
  hasDownloadableResources: boolean;
  hasAssignments: boolean;
  hasQuizzes: boolean;
  
  // Automation
  automationWelcomeEmail: boolean;
  automationCompletionCertificate: boolean;
  automationProgressReminders: boolean;
  automationAbandonmentSequence: boolean;
  
  // Status
  status: 'draft' | 'active' | 'inactive';
  
  // Content
  modules: Array<{
    id?: number;
    title: string;
    description: string;
    order: number;
    lessons: Array<{
      id?: number;
      title: string;
      type: string;
      duration?: string;
      content?: string;
      videoUrl?: string;
      order: number;
    }>;
  }>;
}

interface CourseEditorWithFeaturesProps {
  courseId: number;
  onComplete: (course: any) => void;
  onCancel: () => void;
}

export const CourseEditorWithFeatures = ({ courseId, onComplete, onCancel }: CourseEditorWithFeaturesProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [detectingDuration, setDetectingDuration] = useState<{[key: string]: boolean}>({});
  
  const [formData, setFormData] = useState<CourseFormData>({
    courseType: 'Custom',
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    level: 'Beginner',
    language: 'en',
    duration: '',
    pricingModel: 'OneTime',
    price: 0,
    currency: 'PHP',
    accessType: 'Lifetime',
    status: 'draft',
    modules: [],
    hasCertificate: false,
    hasCommunity: false,
    hasLiveSessions: false,
    hasDownloadableResources: false,
    hasAssignments: false,
    hasQuizzes: false,
    automationWelcomeEmail: true,
    automationCompletionCertificate: true,
    automationProgressReminders: true,
    automationAbandonmentSequence: false
  });


  // Load existing course data
  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    setLoadingCourse(true);
    try {
      const response = await courseService.getCourse(courseId);
      if (response.data) {
        const course: CourseDetailDto = response.data;
        
        setFormData({
          courseType: (course.courseType as 'Sprint' | 'Marathon' | 'Membership' | 'Custom') || 'Custom',
          title: course.title,
          description: course.description,
          shortDescription: course.shortDescription || '',
          category: course.category,
          level: course.level,
          language: course.language || 'en',
          duration: course.duration || '',
          thumbnailUrl: course.thumbnailUrl,
          promoVideoUrl: course.promoVideoUrl,
          pricingModel: course.pricingModel || 'OneTime',
          price: course.price,
          originalPrice: course.originalPrice,
          currency: course.currency || 'PHP',
          subscriptionPeriod: course.subscriptionPeriod,
          accessType: course.accessType || 'Lifetime',
          accessDuration: course.accessDuration,
          enrollmentLimit: course.enrollmentLimit,
          status: course.status?.toLowerCase() as 'draft' | 'active' | 'inactive' || 'draft',
          hasCertificate: course.courseFeatures?.certificate || false,
          hasCommunity: course.courseFeatures?.community || false,
          hasLiveSessions: course.courseFeatures?.liveSessions || false,
          hasDownloadableResources: course.courseFeatures?.downloadableResources || false,
          hasAssignments: course.courseFeatures?.assignments || false,
          hasQuizzes: course.courseFeatures?.quizzes || false,
          automationWelcomeEmail: course.automations?.welcomeEmail ?? true,
          automationCompletionCertificate: course.automations?.completionCertificate ?? true,
          automationProgressReminders: course.automations?.progressReminders ?? true,
          automationAbandonmentSequence: course.automations?.abandonmentSequence ?? false,
          modules: course.modules?.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description || '',
            order: m.order,
            lessons: m.lessons?.map(l => ({
              id: l.id,
              title: l.title,
              type: l.type,
              duration: l.duration,
              content: l.content,
              videoUrl: l.videoUrl,
              order: l.order
            })) || []
          })) || []
        });
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast({
        title: "Error",
        description: "Failed to load course data",
        variant: "destructive"
      });
    } finally {
      setLoadingCourse(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Check if user is authenticated
    const auth = localStorage.getItem('auth');
    console.log('Auth status:', auth ? 'Token exists' : 'No token');
    console.log('User from context:', user);
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue",
        variant: "destructive"
      });
      setIsSaving(false);
      return;
    }
    
    try {
      // Build update data with all fields
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || '',
        category: formData.category,
        level: formData.level,
        price: formData.price,
        originalPrice: formData.originalPrice,
        duration: formData.duration || '',
        thumbnail: formData.thumbnail,
        thumbnailUrl: formData.thumbnailUrl || '',
        promoVideoUrl: formData.promoVideoUrl || '',
        language: formData.language || 'en',
        features: formData.features || [],
        previewUrl: formData.previewUrl || '',
        enrollmentType: formData.enrollmentType,
        // GHL specific fields
        courseType: formData.courseType || 'Custom',
        pricingModel: formData.pricingModel || 'OneTime',
        currency: formData.currency || 'PHP',
        accessType: formData.accessType || 'Lifetime',
        accessDuration: formData.accessDuration,
        enrollmentLimit: formData.enrollmentLimit,
        courseFeatures: {
          certificate: formData.hasCertificate || false,
          community: formData.hasCommunity || false,
          liveSessions: formData.hasLiveSessions || false,
          downloadableResources: formData.hasDownloadableResources || false,
          assignments: formData.hasAssignments || false,
          quizzes: formData.hasQuizzes || false,
        },
        dripContent: formData.dripContent || false,
        dripSchedule: formData.dripSchedule,
        automations: {
          welcomeEmail: formData.automationWelcomeEmail ?? true,
          completionCertificate: formData.automationCompletionCertificate ?? true,
          progressReminders: formData.automationProgressReminders ?? true,
          abandonmentSequence: formData.automationAbandonmentSequence ?? false,
        },
        // Include modules and lessons
        modules: formData.modules,
      };

      console.log('Sending update data:', updateData);
      console.log('Course features being sent:', updateData.courseFeatures);
      console.log('Form data features:', {
        hasCertificate: formData.hasCertificate,
        hasCommunity: formData.hasCommunity,
        hasLiveSessions: formData.hasLiveSessions,
        hasDownloadableResources: formData.hasDownloadableResources,
        hasAssignments: formData.hasAssignments,
        hasQuizzes: formData.hasQuizzes
      });
      
      // Debug modules and lessons
      if (updateData.modules) {
        console.log('Modules being sent:', JSON.stringify(updateData.modules, null, 2));
      }
      const response = await courseService.updateCourse(courseId, updateData);
      
      if (response.error) {
        console.error('Update failed:', response);
        toast({
          title: "Error",
          description: response.error || "Failed to update course",
          variant: "destructive"
        });
        return;
      }
      
      if (response.data) {
        console.log('Course update response:', response.data);
        toast({
          title: "Course Updated",
          description: "Your course has been updated successfully!",
        });
        onComplete(response.data);
      }
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await courseService.updateCourseStatus(courseId, 'active');
      setFormData(prev => ({ ...prev, status: 'active' }));
      
      toast({
        title: "Course Published!",
        description: "Your course is now live and available for students",
      });
      
      // Save and complete
      handleSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish course",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async () => {
    const confirmUnpublish = window.confirm(
      'Are you sure you want to unpublish this course?\n\n' +
      'The course will no longer be available for new enrollments.'
    );
    
    if (!confirmUnpublish) return;

    setIsLoading(true);
    try {
      await courseService.updateCourseStatus(courseId, 'inactive');
      setFormData(prev => ({ ...prev, status: 'inactive' }));
      
      toast({
        title: "Course Unpublished",
        description: "Course is no longer available for new enrollments",
      });
      
      // Save and complete
      handleSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unpublish course",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const detectVideoDuration = async (videoUrl: string, moduleIndex: number, lessonIndex: number) => {
    const key = `${moduleIndex}-${lessonIndex}`;
    setDetectingDuration(prev => ({ ...prev, [key]: true }));
    
    try {
      // For YouTube videos, we can use the YouTube API or oEmbed
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        // Extract video ID
        let videoId = '';
        if (videoUrl.includes('youtube.com/watch')) {
          const match = videoUrl.match(/[?&]v=([^&]+)/);
          if (match) videoId = match[1];
        } else if (videoUrl.includes('youtu.be/')) {
          const match = videoUrl.match(/youtu\.be\/([^?]+)/);
          if (match) videoId = match[1];
        }
        
        if (videoId) {
          // Use noembed service to get video info without API key
          try {
            const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
            const data = await response.json();
            
            if (data.duration) {
              const minutes = Math.floor(data.duration / 60);
              const seconds = data.duration % 60;
              const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
              updateLessonDuration(moduleIndex, lessonIndex, duration);
              toast({
                title: "Duration Set",
                description: `Video duration: ${duration}`,
              });
            } else {
              // Fallback to a reasonable default
              updateLessonDuration(moduleIndex, lessonIndex, '10:00');
              toast({
                title: "Duration Set",
                description: "Duration set to default (10:00). You can adjust manually.",
              });
            }
          } catch (error) {
            console.error('Error fetching YouTube metadata:', error);
            // Fallback duration
            updateLessonDuration(moduleIndex, lessonIndex, '10:00');
          }
        }
      } else if (videoUrl.includes('vimeo.com')) {
        // For Vimeo, extract video ID and use oEmbed
        const match = videoUrl.match(/vimeo\.com\/(\d+)/);
        if (match) {
          const videoId = match[1];
          try {
            const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`);
            const data = await response.json();
            if (data.duration) {
              const minutes = Math.floor(data.duration / 60);
              const seconds = data.duration % 60;
              const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
              updateLessonDuration(moduleIndex, lessonIndex, duration);
              toast({
                title: "Duration Set",
                description: `Video duration: ${duration}`,
              });
            }
          } catch (error) {
            console.error('Error fetching Vimeo metadata:', error);
          }
        }
      } else {
        // For direct video files, create a video element to get duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = function() {
          const duration = video.duration;
          if (duration) {
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            updateLessonDuration(moduleIndex, lessonIndex, formattedDuration);
            toast({
              title: "Duration Set",
              description: `Video duration: ${formattedDuration}`,
            });
          }
          setDetectingDuration(prev => ({ ...prev, [key]: false }));
        };
        
        video.onerror = function() {
          console.error('Error loading video metadata');
          setDetectingDuration(prev => ({ ...prev, [key]: false }));
        };
        
        video.src = videoUrl;
      }
    } catch (error) {
      console.error('Error detecting video duration:', error);
    } finally {
      setDetectingDuration(prev => ({ ...prev, [key]: false }));
    }
  };

  const updateLessonDuration = (moduleIndex: number, lessonIndex: number, duration: string) => {
    setFormData(prev => {
      const newModules = [...prev.modules];
      newModules[moduleIndex].lessons[lessonIndex].duration = duration;
      return { ...prev, modules: newModules };
    });
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, {
        title: `Module ${prev.modules.length + 1}`,
        description: '',
        order: prev.modules.length + 1,
        lessons: []
      }]
    }));
  };

  const removeModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].lessons.push({
      title: `Lesson ${newModules[moduleIndex].lessons.length + 1}`,
      type: 'Video',
      duration: '10:00',
      order: newModules[moduleIndex].lessons.length + 1
    });
    setFormData(prev => ({ ...prev, modules: newModules }));
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
    setFormData(prev => ({ ...prev, modules: newModules }));
  };

  const getStatusBadge = () => {
    switch (formData.status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-600">Published</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Unpublished</Badge>;
      default:
        return null;
    }
  };

  if (loadingCourse) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading course...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Edit Course</span>
              {getStatusBadge()}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>

              {formData.status === 'draft' && (
                <Button 
                  onClick={handlePublish}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Send className="w-4 h-4 mr-2" />
                  Publish Course
                </Button>
              )}
              
              {formData.status === 'active' && (
                <Button 
                  variant="destructive"
                  onClick={handleUnpublish}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Archive className="w-4 h-4 mr-2" />
                  Unpublish
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="type">Course Type</TabsTrigger>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            <TabsContent value="type" className="space-y-6 mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Select Course Type</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Choose the structure that best fits your teaching style and content delivery
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all ${
                      formData.courseType === 'Sprint' 
                        ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, courseType: 'Sprint' }))}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 text-white rounded-lg">
                          <Zap className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Sprint</CardTitle>
                          <Badge className="mt-1" variant="secondary">4 weeks or less</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Intensive, fast-paced learning experience for quick skill acquisition
                      </p>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Daily assignments
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Quick completion
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Focused curriculum
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all ${
                      formData.courseType === 'Marathon' 
                        ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, courseType: 'Marathon' }))}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 text-white rounded-lg">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Marathon</CardTitle>
                          <Badge className="mt-1" variant="secondary">8-16 weeks</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Comprehensive, in-depth learning journey with sustained progress
                      </p>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Deep dive content
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Community support
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Milestone tracking
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all ${
                      formData.courseType === 'Membership' 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, courseType: 'Membership' }))}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 text-white rounded-lg">
                          <Crown className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Membership</CardTitle>
                          <Badge className="mt-1" variant="secondary">Ongoing access</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Exclusive ongoing access with continuously updated content
                      </p>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Monthly updates
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Exclusive content
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Live sessions
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all ${
                      formData.courseType === 'Custom' 
                        ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, courseType: 'Custom' }))}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 text-white rounded-lg">
                          <Settings className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Custom</CardTitle>
                          <Badge className="mt-1" variant="secondary">Flexible duration</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Flexible course structure tailored to your specific needs
                      </p>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Self-paced option
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Custom features
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Flexible pricing
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Course Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what students will learn"
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="Brief summary for course cards"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                        <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level">Level *</Label>
                    <Select 
                      value={formData.level} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="All Levels">All Levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 10 hours"
                    />
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={formData.language} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="thumbnail"
                      value={formData.thumbnailUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                    <Button variant="outline">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-6 mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Course Features</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Select the features that will be available in this course
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Award className="h-6 w-6 text-primary" />
                          <div>
                            <Label htmlFor="certificate" className="text-base cursor-pointer">
                              Certificate of Completion
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Students receive a certificate upon course completion
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="certificate"
                          checked={formData.hasCertificate}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasCertificate: checked }))}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Users className="h-6 w-6 text-primary" />
                          <div>
                            <Label htmlFor="community" className="text-base cursor-pointer">
                              Community Access
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Students can interact in a dedicated community forum
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="community"
                          checked={formData.hasCommunity}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasCommunity: checked }))}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Video className="h-6 w-6 text-primary" />
                          <div>
                            <Label htmlFor="liveSessions" className="text-base cursor-pointer">
                              Live Sessions
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Include live Q&A or teaching sessions
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="liveSessions"
                          checked={formData.hasLiveSessions}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasLiveSessions: checked }))}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Download className="h-6 w-6 text-primary" />
                          <div>
                            <Label htmlFor="downloadable" className="text-base cursor-pointer">
                              Downloadable Resources
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              PDFs, templates, and other downloadable materials
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="downloadable"
                          checked={formData.hasDownloadableResources}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasDownloadableResources: checked }))}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-6 w-6 text-primary" />
                          <div>
                            <Label htmlFor="assignments" className="text-base cursor-pointer">
                              Assignments
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Practical assignments to reinforce learning
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="assignments"
                          checked={formData.hasAssignments}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasAssignments: checked }))}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <HelpCircle className="h-6 w-6 text-primary" />
                          <div>
                            <Label htmlFor="quizzes" className="text-base cursor-pointer">
                              Quizzes
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Test student knowledge with quizzes
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="quizzes"
                          checked={formData.hasQuizzes}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasQuizzes: checked }))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Features help students understand what's included in your course and can improve enrollment rates.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pricing Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₱</span>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className="pl-10"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="originalPrice">Original Price (for discounts)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₱</span>
                        <Input
                          id="originalPrice"
                          type="number"
                          value={formData.originalPrice || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || undefined }))}
                          className="pl-10"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Access Type</Label>
                      <Select 
                        value={formData.accessType} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, accessType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lifetime">Lifetime Access</SelectItem>
                          <SelectItem value="Limited">Limited Time Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.accessType === 'Limited' && (
                      <div>
                        <Label htmlFor="accessDuration">Access Duration (days)</Label>
                        <Input
                          id="accessDuration"
                          type="number"
                          value={formData.accessDuration || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, accessDuration: parseInt(e.target.value) || undefined }))}
                          placeholder="e.g., 90"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Sharing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Creator Share (80%)</span>
                        <span className="font-semibold">{formatPHP(formData.price * 0.8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee (20%)</span>
                        <span className="font-semibold">{formatPHP(formData.price * 0.2)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formatPHP(formData.price)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Course Content</h3>
                <Button onClick={addModule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>

              {formData.modules.map((module, moduleIndex) => (
                <Card key={moduleIndex}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-4">
                        <Input
                          value={module.title}
                          onChange={(e) => {
                            const newModules = [...formData.modules];
                            newModules[moduleIndex].title = e.target.value;
                            setFormData(prev => ({ ...prev, modules: newModules }));
                          }}
                          placeholder="Module title"
                        />
                        <Textarea
                          value={module.description}
                          onChange={(e) => {
                            const newModules = [...formData.modules];
                            newModules[moduleIndex].description = e.target.value;
                            setFormData(prev => ({ ...prev, modules: newModules }));
                          }}
                          placeholder="Module description"
                          rows={2}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeModule(moduleIndex)}
                        className="ml-2"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Lessons</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addLesson(moduleIndex)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Lesson
                        </Button>
                      </div>

                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                          <div className="flex gap-2 items-start">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                              <Input
                                value={lesson.title}
                                onChange={(e) => {
                                  const newModules = [...formData.modules];
                                  newModules[moduleIndex].lessons[lessonIndex].title = e.target.value;
                                  setFormData(prev => ({ ...prev, modules: newModules }));
                                }}
                                placeholder="Lesson title"
                              />
                              <Select
                                value={lesson.type}
                                onValueChange={(value: any) => {
                                  const newModules = [...formData.modules];
                                  newModules[moduleIndex].lessons[lessonIndex].type = value;
                                  setFormData(prev => ({ ...prev, modules: newModules }));
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Video">Video</SelectItem>
                                  <SelectItem value="Text">Text</SelectItem>
                                  <SelectItem value="Quiz">Quiz</SelectItem>
                                  <SelectItem value="Assignment">Assignment</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="relative">
                                <Input
                                  value={lesson.duration || ''}
                                  onChange={(e) => {
                                    const newModules = [...formData.modules];
                                    newModules[moduleIndex].lessons[lessonIndex].duration = e.target.value;
                                    setFormData(prev => ({ ...prev, modules: newModules }));
                                  }}
                                  placeholder="Duration (e.g., 15:00)"
                                  disabled={detectingDuration[`${moduleIndex}-${lessonIndex}`]}
                                />
                                {detectingDuration[`${moduleIndex}-${lessonIndex}`] && (
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLesson(moduleIndex, lessonIndex)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Content fields based on lesson type */}
                          {lesson.type === 'Video' && (
                            <div className="space-y-2">
                              <Label htmlFor={`video-url-${moduleIndex}-${lessonIndex}`}>Video URL</Label>
                              <Input
                                id={`video-url-${moduleIndex}-${lessonIndex}`}
                                value={lesson.videoUrl || ''}
                                onChange={(e) => {
                                  const newModules = [...formData.modules];
                                  newModules[moduleIndex].lessons[lessonIndex].videoUrl = e.target.value;
                                  setFormData(prev => ({ ...prev, modules: newModules }));
                                  
                                  // Auto-detect video duration
                                  if (e.target.value) {
                                    detectVideoDuration(e.target.value, moduleIndex, lessonIndex);
                                  }
                                }}
                                onBlur={(e) => {
                                  // Also detect on blur in case onChange missed it
                                  if (e.target.value && !lesson.duration) {
                                    detectVideoDuration(e.target.value, moduleIndex, lessonIndex);
                                  }
                                }}
                                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                              />
                              <p className="text-xs text-muted-foreground">
                                You can also upload videos to your preferred hosting service and paste the link here.
                                Duration will be detected automatically for supported video platforms.
                              </p>
                            </div>
                          )}
                          
                          {(lesson.type === 'Text' || lesson.type === 'Assignment') && (
                            <div className="space-y-2">
                              <Label htmlFor={`content-${moduleIndex}-${lessonIndex}`}>
                                {lesson.type === 'Text' ? 'Lesson Content' : 'Assignment Instructions'}
                              </Label>
                              <Textarea
                                id={`content-${moduleIndex}-${lessonIndex}`}
                                value={lesson.content || ''}
                                onChange={(e) => {
                                  const newModules = [...formData.modules];
                                  newModules[moduleIndex].lessons[lessonIndex].content = e.target.value;
                                  setFormData(prev => ({ ...prev, modules: newModules }));
                                }}
                                placeholder={lesson.type === 'Text' ? 'Enter lesson content...' : 'Enter assignment instructions...'}
                                rows={4}
                              />
                            </div>
                          )}
                          
                          {lesson.type === 'Quiz' && (
                            <div className="space-y-2">
                              <Label htmlFor={`quiz-content-${moduleIndex}-${lessonIndex}`}>Quiz Questions</Label>
                              <Textarea
                                id={`quiz-content-${moduleIndex}-${lessonIndex}`}
                                value={lesson.content || ''}
                                onChange={(e) => {
                                  const newModules = [...formData.modules];
                                  newModules[moduleIndex].lessons[lessonIndex].content = e.target.value;
                                  setFormData(prev => ({ ...prev, modules: newModules }));
                                }}
                                placeholder="Enter quiz questions and format (you can use JSON or plain text format)"
                                rows={4}
                              />
                              <p className="text-xs text-muted-foreground">
                                Example: Question 1: What is...? a) Option A b) Option B c) Option C
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {formData.modules.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="text-center py-10">
                    <p className="text-muted-foreground">No modules added yet. Create your first module to get started.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="automation" className="space-y-6 mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Automation Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="welcomeEmail">Welcome Email</Label>
                      <p className="text-sm text-muted-foreground">Send automated welcome email to new students</p>
                    </div>
                    <Switch
                      id="welcomeEmail"
                      checked={formData.automationWelcomeEmail}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, automationWelcomeEmail: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="completionCertificate">Completion Certificate</Label>
                      <p className="text-sm text-muted-foreground">Automatically issue certificate upon course completion</p>
                    </div>
                    <Switch
                      id="completionCertificate"
                      checked={formData.automationCompletionCertificate}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, automationCompletionCertificate: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="progressReminders">Progress Reminders</Label>
                      <p className="text-sm text-muted-foreground">Send periodic reminders to encourage course progress</p>
                    </div>
                    <Switch
                      id="progressReminders"
                      checked={formData.automationProgressReminders}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, automationProgressReminders: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="abandonmentSequence">Abandonment Sequence</Label>
                      <p className="text-sm text-muted-foreground">Re-engage students who haven't accessed course recently</p>
                    </div>
                    <Switch
                      id="abandonmentSequence"
                      checked={formData.automationAbandonmentSequence}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, automationAbandonmentSequence: checked }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-6 mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Review Your Course</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Course Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Course Type:</span>
                        <Badge variant="outline" className="ml-2">{formData.courseType}</Badge>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Title:</span>
                        <p className="font-medium">{formData.title || 'No title set'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Category:</span>
                        <p className="font-medium">{formData.category || 'No category set'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Level:</span>
                        <p className="font-medium">{formData.level}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Duration:</span>
                        <p className="font-medium">{formData.duration || 'Not specified'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pricing & Access</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Price:</span>
                        <p className="font-medium">{formatPHP(formData.price)}</p>
                      </div>
                      {formData.originalPrice && (
                        <div>
                          <span className="text-sm text-muted-foreground">Original Price:</span>
                          <p className="font-medium">{formatPHP(formData.originalPrice)}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-muted-foreground">Access Type:</span>
                        <p className="font-medium">{formData.accessType}</p>
                      </div>
                      {formData.accessDuration && (
                        <div>
                          <span className="text-sm text-muted-foreground">Access Duration:</span>
                          <p className="font-medium">{formData.accessDuration} days</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Content Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Modules:</span>
                        <p className="font-medium">{formData.modules.length}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Total Lessons:</span>
                        <p className="font-medium">{formData.modules.reduce((sum, m) => sum + m.lessons.length, 0)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Features & Automation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Features:</span>
                          <div className="mt-1 space-y-1">
                            {formData.hasCertificate && <Badge variant="secondary" className="mr-1">Certificate</Badge>}
                            {formData.hasCommunity && <Badge variant="secondary" className="mr-1">Community</Badge>}
                            {formData.hasLiveSessions && <Badge variant="secondary" className="mr-1">Live Sessions</Badge>}
                            {formData.hasDownloadableResources && <Badge variant="secondary" className="mr-1">Downloads</Badge>}
                            {formData.hasAssignments && <Badge variant="secondary" className="mr-1">Assignments</Badge>}
                            {formData.hasQuizzes && <Badge variant="secondary" className="mr-1">Quizzes</Badge>}
                          </div>
                        </div>
                        <div className="text-sm mt-3">
                          <span className="text-muted-foreground">Automation:</span>
                          <div className="mt-1 space-y-1">
                            {formData.automationWelcomeEmail && <Badge variant="outline" className="mr-1">Welcome Email</Badge>}
                            {formData.automationCompletionCertificate && <Badge variant="outline" className="mr-1">Auto Certificate</Badge>}
                            {formData.automationProgressReminders && <Badge variant="outline" className="mr-1">Progress Reminders</Badge>}
                            {formData.automationAbandonmentSequence && <Badge variant="outline" className="mr-1">Re-engagement</Badge>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Review all details carefully before saving. You can always come back to edit your course later.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Publishing Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Current Status</Label>
                      <div className="mt-2">
                        {getStatusBadge()}
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {formData.status === 'draft' && 'Course is in draft mode and not visible to students. Publish when ready.'}
                        {formData.status === 'active' && 'Course is published and available for enrollment.'}
                        {formData.status === 'inactive' && 'Course is unpublished but existing students can still access it.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preview & Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Course
                    </Button>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Quick Stats</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {formData.modules.length} modules</li>
                        <li>• {formData.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons</li>
                        <li>• {Object.entries(formData).filter(([key, value]) => key.startsWith('has') && value).length} features enabled</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};