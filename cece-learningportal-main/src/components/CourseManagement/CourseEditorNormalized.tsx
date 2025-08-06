import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPHP } from "@/utils/currency";
import { CourseRepository } from "@/services/courseRepository";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  X,
  Target,
  Tag,
  Book,
  Video,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { 
  Course, 
  CourseFeature, 
  CourseTag, 
  CourseObjective, 
  CoursePrerequisite,
  CourseModule,
  CourseLesson 
} from "@/types/database";

interface CourseEditorNormalizedProps {
  courseId?: number;
  onSave?: () => void;
  onComplete?: (data?: any) => void;
  onCancel: () => void;
}

export const CourseEditorNormalized = ({ courseId, onSave, onComplete, onCancel }: CourseEditorNormalizedProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Course data
  const [courseData, setCourseData] = useState<Partial<Course>>({
    title: '',
    description: '',
    price: 0,
    original_price: 0,
    category: '',
    duration: '',
    level: 'Beginner',
    status: 'draft',
    course_type: 'Custom',
    thumbnail: '',
    language: 'English',
    enrollment_limit: undefined
  });
  
  // Normalized data
  const [features, setFeatures] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [prerequisites, setPrerequisites] = useState<Partial<CoursePrerequisite>[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  
  // Input states
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      const courseWithDetails = await CourseRepository.getCourse(courseId);
      if (courseWithDetails) {
        setCourseData(courseWithDetails);
        setFeatures(courseWithDetails.features?.map(f => f.feature) || []);
        setTags(courseWithDetails.tags?.map(t => t.tag) || []);
        setObjectives(courseWithDetails.objectives?.map(o => o.objective) || []);
        setPrerequisites(courseWithDetails.prerequisites || []);
        setModules(courseWithDetails.modules || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load course data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!courseData.title || !courseData.description || !courseData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let savedCourseId = courseId;
      
      if (courseId) {
        // Update existing course with all metadata
        const updatedCourse = await CourseRepository.updateCourse(courseId, {
          ...courseData,
          features,
          tags,
          objectives,
          prerequisites
        });
      } else {
        // Create new course with details
        const newCourse = await CourseRepository.createCourseWithDetails(
          courseData,
          features,
          tags,
          objectives,
          prerequisites
        );
        if (newCourse) {
          savedCourseId = newCourse.id;
        }
      }

      // Save modules and lessons if we have a course ID
      if (savedCourseId) {
        // First, get existing modules to compare
        const existingCourse = await CourseRepository.getCourse(savedCourseId);
        const existingModules = existingCourse?.modules || [];
        
        // Process each module
        for (let i = 0; i < modules.length; i++) {
          const module = modules[i];
          
          if (module.id) {
            // Update existing module
            await api.request(`/courses/${savedCourseId}/modules/${module.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                title: module.title,
                description: module.description,
                display_order: i,
                duration_minutes: module.duration_minutes
              })
            });
            
            // Update lessons for this module
            const existingLessons = existingModules.find(m => m.id === module.id)?.lessons || [];
            
            for (let j = 0; j < module.lessons.length; j++) {
              const lesson = module.lessons[j];
              
              if (lesson.id) {
                // Update existing lesson
                await api.request(`/modules/${module.id}/lessons/${lesson.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    title: lesson.title,
                    description: lesson.description,
                    content_type: lesson.content_type,
                    content_url: lesson.content_url,
                    duration_minutes: lesson.duration_minutes,
                    display_order: j,
                    is_preview: lesson.is_preview
                  })
                });
              } else {
                // Create new lesson
                await CourseRepository.createLesson(module.id, {
                  title: lesson.title,
                  description: lesson.description,
                  content_type: lesson.content_type,
                  content_url: lesson.content_url,
                  duration_minutes: lesson.duration_minutes,
                  display_order: j,
                  is_preview: lesson.is_preview
                });
              }
            }
            
            // Delete removed lessons
            for (const existingLesson of existingLessons) {
              if (!module.lessons.find(l => l.id === existingLesson.id)) {
                await api.request(`/modules/${module.id}/lessons/${existingLesson.id}`, {
                  method: 'DELETE'
                });
              }
            }
          } else {
            // Create new module
            const newModule = await CourseRepository.createModule(savedCourseId, {
              title: module.title,
              description: module.description,
              display_order: i,
              duration_minutes: module.duration_minutes
            });
            
            if (newModule) {
              // Create lessons for the new module
              for (let j = 0; j < module.lessons.length; j++) {
                const lesson = module.lessons[j];
                await CourseRepository.createLesson(newModule.id, {
                  title: lesson.title,
                  description: lesson.description,
                  content_type: lesson.content_type,
                  content_url: lesson.content_url,
                  duration_minutes: lesson.duration_minutes,
                  display_order: j,
                  is_preview: lesson.is_preview
                });
              }
            }
          }
        }
        
        // Delete removed modules
        for (const existingModule of existingModules) {
          if (!modules.find(m => m.id === existingModule.id)) {
            await api.request(`/courses/${savedCourseId}/modules/${existingModule.id}`, {
              method: 'DELETE'
            });
          }
        }
      }

      // Reset unsaved changes flag
      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      
      toast({
        title: "Success",
        description: courseId ? "Course updated successfully" : "Course created successfully",
      });

      // Call the appropriate callback
      if (onComplete) {
        // Add a small delay to ensure the toast is visible
        setTimeout(() => {
          onComplete({ id: savedCourseId, ...courseData });
        }, 800);
      } else if (onSave) {
        setTimeout(() => {
          onSave();
        }, 800);
      }
      
      // Reset success state after animation
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Course save error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save course",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmCancel) return;
    }
    onCancel();
  };

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
      setHasUnsavedChanges(true);
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      setHasUnsavedChanges(true);
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const addObjective = () => {
    if (newObjective.trim() && !objectives.includes(newObjective.trim())) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective('');
      setHasUnsavedChanges(true);
    }
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setPrerequisites([...prerequisites, { prerequisite_text: newPrerequisite.trim() }]);
      setNewPrerequisite('');
      setHasUnsavedChanges(true);
    }
  };

  const removePrerequisite = (index: number) => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const addModule = () => {
    const newModule = {
      title: 'New Module',
      description: '',
      lessons: [],
      display_order: modules.length
    };
    setModules([...modules, newModule]);
    setHasUnsavedChanges(true);
  };

  const updateModule = (index: number, updates: any) => {
    const updatedModules = [...modules];
    updatedModules[index] = { ...updatedModules[index], ...updates };
    setModules(updatedModules);
    setHasUnsavedChanges(true);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const addLesson = (moduleIndex: number) => {
    const updatedModules = [...modules];
    const newLesson = {
      title: 'New Lesson',
      description: '',
      content_type: 'video',
      duration_minutes: 0,
      is_preview: false,
      display_order: updatedModules[moduleIndex].lessons.length
    };
    updatedModules[moduleIndex].lessons.push(newLesson);
    setModules(updatedModules);
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, updates: any) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons[lessonIndex] = {
      ...updatedModules[moduleIndex].lessons[lessonIndex],
      ...updates
    };
    setModules(updatedModules);
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons = updatedModules[moduleIndex].lessons.filter(
      (_: any, i: number) => i !== lessonIndex
    );
    setModules(updatedModules);
  };

  const categories = [
    'Web Development',
    'Programming',
    'Data Science',
    'Machine Learning',
    'Computer Vision',
    'Mobile Development',
    'Cloud Computing',
    'DevOps',
    'Cybersecurity',
    'Database'
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {courseId ? 'Edit Course' : 'Create New Course'}
          </CardTitle>
          <CardDescription>
            Fill in the details below to {courseId ? 'update your' : 'create a new'} course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="basic" className="relative">
                Basic Info
                {courseData.title && courseData.description && courseData.category && (
                  <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="details" className="relative">
                Details
                {(features.length > 0 || objectives.length > 0) && (
                  <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="relative">
                Curriculum
                {modules.length > 0 && (
                  <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="pricing" className="relative">
                Pricing
                {courseData.price !== undefined && courseData.price >= 0 && (
                  <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="relative">
                Settings
                {courseData.status && (
                  <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={courseData.title}
                    onChange={(e) => {
                      setCourseData({ ...courseData, title: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Enter a descriptive title for your course"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Course Description *</Label>
                  <Textarea
                    id="description"
                    value={courseData.description}
                    onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                    placeholder="Describe what students will learn"
                    className="mt-1 min-h-[150px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={courseData.category} 
                      onValueChange={(value) => setCourseData({ ...courseData, category: value })}
                    >
                      <SelectTrigger id="category" className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select 
                      value={courseData.level} 
                      onValueChange={(value) => setCourseData({ ...courseData, level: value as any })}
                    >
                      <SelectTrigger id="level" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={courseData.duration}
                      onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                      placeholder="e.g., 10 hours"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="course_type">Course Type</Label>
                    <Select 
                      value={courseData.course_type} 
                      onValueChange={(value) => setCourseData({ ...courseData, course_type: value as any })}
                    >
                      <SelectTrigger id="course_type" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sprint">Sprint</SelectItem>
                        <SelectItem value="Marathon">Marathon</SelectItem>
                        <SelectItem value="Membership">Membership</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={courseData.thumbnail}
                    onChange={(e) => setCourseData({ ...courseData, thumbnail: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Features */}
              <div>
                <Label>Course Features</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button onClick={addFeature} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {feature}
                        <X 
                          className="w-3 h-3 ml-2 cursor-pointer" 
                          onClick={() => removeFeature(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button onClick={addTag} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                        <X 
                          className="w-3 h-3 ml-2 cursor-pointer" 
                          onClick={() => removeTag(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learning Objectives */}
              <div>
                <Label>Learning Objectives</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      placeholder="What will students learn?"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                    />
                    <Button onClick={addObjective} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {objectives.map((objective, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                        <Target className="w-4 h-4 text-primary mt-0.5" />
                        <span className="flex-1 text-sm">{objective}</span>
                        <X 
                          className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                          onClick={() => removeObjective(index)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              <div>
                <Label>Prerequisites</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newPrerequisite}
                      onChange={(e) => setNewPrerequisite(e.target.value)}
                      placeholder="Add a prerequisite"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                    />
                    <Button onClick={addPrerequisite} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {prerequisites.map((prereq, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="flex-1 text-sm">{prereq.prerequisite_text}</span>
                        <X 
                          className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                          onClick={() => removePrerequisite(index)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Course Curriculum</h3>
                <Button onClick={addModule} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Module
                </Button>
              </div>

              <div className="space-y-4">
                {modules.map((module, moduleIndex) => (
                  <Card key={moduleIndex} className="p-4">
                    <div className="flex items-start gap-2 mb-4">
                      <GripVertical className="w-5 h-5 text-muted-foreground mt-1" />
                      <div className="flex-1 space-y-2">
                        <Input
                          value={module.title}
                          onChange={(e) => updateModule(moduleIndex, { title: e.target.value })}
                          placeholder="Module title"
                          className="font-semibold"
                        />
                        <Textarea
                          value={module.description}
                          onChange={(e) => updateModule(moduleIndex, { description: e.target.value })}
                          placeholder="Module description"
                          className="min-h-[60px]"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeModule(moduleIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="ml-7 space-y-2">
                      {module.lessons?.map((lesson: any, lessonIndex: number) => (
                        <div key={lessonIndex} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <Video className="w-4 h-4 text-muted-foreground" />
                          <Input
                            value={lesson.title}
                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, { title: e.target.value })}
                            placeholder="Lesson title"
                            className="flex-1"
                          />
                          <Select
                            value={lesson.content_type}
                            onValueChange={(value) => updateLesson(moduleIndex, lessonIndex, { content_type: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="quiz">Quiz</SelectItem>
                              <SelectItem value="assignment">Assignment</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            value={lesson.duration_minutes}
                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, { duration_minutes: parseInt(e.target.value) })}
                            placeholder="Min"
                            className="w-20"
                          />
                          <Switch
                            checked={lesson.is_preview}
                            onCheckedChange={(checked) => updateLesson(moduleIndex, lessonIndex, { is_preview: checked })}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLesson(moduleIndex, lessonIndex)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addLesson(moduleIndex)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Lesson
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Course Price (PHP)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      value={courseData.price}
                      onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) || 0 })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="original_price">Original Price (PHP)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="original_price"
                      type="number"
                      value={courseData.original_price}
                      onChange={(e) => setCourseData({ ...courseData, original_price: parseFloat(e.target.value) || 0 })}
                      className="pl-10"
                    />
                  </div>
                  {courseData.original_price && courseData.original_price > (courseData.price || 0) && (
                    <p className="text-sm text-green-600 mt-1">
                      {Math.round(((courseData.original_price - (courseData.price || 0)) / courseData.original_price) * 100)}% discount
                    </p>
                  )}
                </div>
              </div>

              <Card className="p-4 bg-muted">
                <h4 className="font-semibold mb-2">Pricing Preview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Course Price:</span>
                    <span className="font-bold text-primary">{formatPHP(courseData.price || 0)}</span>
                  </div>
                  {courseData.original_price && courseData.original_price > (courseData.price || 0) && (
                    <>
                      <div className="flex justify-between">
                        <span>Original Price:</span>
                        <span className="line-through text-muted-foreground">{formatPHP(courseData.original_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>You Save:</span>
                        <span className="text-green-600">{formatPHP(courseData.original_price - (courseData.price || 0))}</span>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Course Status</Label>
                  <Select 
                    value={courseData.status} 
                    onValueChange={(value) => setCourseData({ ...courseData, status: value as any })}
                  >
                    <SelectTrigger id="status" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="active">Published</SelectItem>
                      <SelectItem value="inactive">Unpublished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Course Language</Label>
                  <Input
                    id="language"
                    value={courseData.language}
                    onChange={(e) => setCourseData({ ...courseData, language: e.target.value })}
                    placeholder="e.g., English"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="enrollment_limit">Enrollment Limit (Optional)</Label>
                  <Input
                    id="enrollment_limit"
                    type="number"
                    value={courseData.enrollment_limit || ''}
                    onChange={(e) => setCourseData({ ...courseData, enrollment_limit: parseInt(e.target.value) || undefined })}
                    placeholder="Leave empty for unlimited"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={courseData.is_featured || false}
                    onCheckedChange={(checked) => setCourseData({ ...courseData, is_featured: checked })}
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Feature this course
                  </Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || !courseData.title || !courseData.description || !courseData.category}
              className={`min-w-[150px] transition-all duration-300 ${saveSuccess ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : saveSuccess ? (
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved!
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {courseId ? 'Update Course' : 'Create Course'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};