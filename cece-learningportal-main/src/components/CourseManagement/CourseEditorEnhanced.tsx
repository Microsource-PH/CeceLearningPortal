import { useState, useEffect } from "react";
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
  Archive
} from "lucide-react";

import { CourseForEditor, Lecture } from "@/types/course";

interface CourseEditorEnhancedProps {
  course?: CourseForEditor;
  onSave: (course: CourseForEditor) => void;
  onCancel: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

interface PublishingValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export const CourseEditorEnhanced = ({ course, onSave, onCancel }: CourseEditorEnhancedProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [validationResult, setValidationResult] = useState<PublishingValidation | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  
  const [formData, setFormData] = useState<CourseForEditor>(course || {
    title: '',
    description: '',
    price: 0,
    duration: '',
    level: 'Beginner',
    category: '',
    status: 'draft',
    features: [],
    enrollmentType: 'one-time',
    lectures: []
  });

  const [newFeature, setNewFeature] = useState('');
  const [newLecture, setNewLecture] = useState<Lecture>({
    title: '',
    duration: '',
    type: 'video',
    order: formData.lectures.length + 1
  });

  // Validation function for publishing
  const validateForPublishing = (): PublishingValidation => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Required fields validation
    if (!formData.title || formData.title.length < 5) {
      errors.push({ field: 'title', message: 'Course title must be at least 5 characters long' });
    }

    if (!formData.description || formData.description.length < 50) {
      errors.push({ field: 'description', message: 'Course description must be at least 50 characters long' });
    }

    if (!formData.price || formData.price <= 0) {
      errors.push({ field: 'price', message: 'Course must have a valid price' });
    }

    if (!formData.duration) {
      errors.push({ field: 'duration', message: 'Course duration is required' });
    }

    if (!formData.category) {
      errors.push({ field: 'category', message: 'Course category is required' });
    }

    if (!formData.level) {
      errors.push({ field: 'level', message: 'Course level is required' });
    }

    // Content validation
    if (!formData.lectures || formData.lectures.length === 0) {
      errors.push({ field: 'content', message: 'Course must have at least one lecture' });
    } else if (formData.lectures.length < 3) {
      warnings.push({ field: 'content', message: 'Courses with at least 3 lectures perform better' });
    }

    // Features validation
    if (!formData.features || formData.features.length === 0) {
      warnings.push({ field: 'features', message: 'Adding course features helps with conversions' });
    }

    // Thumbnail validation
    if (!formData.thumbnail) {
      warnings.push({ field: 'thumbnail', message: 'Courses with thumbnails get 2x more enrollments' });
    }

    // Price validation
    if (formData.originalPrice && formData.originalPrice <= formData.price) {
      warnings.push({ field: 'originalPrice', message: 'Original price should be higher than current price for discount display' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (formData.status === 'draft') {
      const autoSaveInterval = setInterval(() => {
        handleSaveDraft(true);
      }, 30000);

      return () => clearInterval(autoSaveInterval);
    }
  }, [formData]);

  const handleSaveDraft = async (isAutoSave = false) => {
    setIsSaving(true);
    try {
      const draftData = { ...formData, status: 'draft' as const };
      
      if (course?.id) {
        // Update existing course
        await courseService.updateCourse(course.id, draftData);
      } else {
        // Create new course as draft
        const response = await courseService.saveDraft(draftData);
        if (response.data) {
          setFormData(prev => ({ ...prev, id: response.data.id }));
        }
      }

      if (!isAutoSave) {
        toast({
          title: "Draft saved",
          description: "Your course has been saved as draft",
        });
      }
      
      onSave(draftData);
    } catch (error) {
      toast({
        title: "Error saving draft",
        description: "Failed to save course draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const validation = validateForPublishing();
    setValidationResult(validation);

    if (!validation.isValid) {
      toast({
        title: "Cannot publish course",
        description: "Please fix all errors before publishing",
        variant: "destructive"
      });
      
      // Navigate to first tab with error
      const errorFields = validation.errors.map(e => e.field);
      if (errorFields.includes('title') || errorFields.includes('description') || errorFields.includes('category') || errorFields.includes('level')) {
        setActiveTab('basic');
      } else if (errorFields.includes('price')) {
        setActiveTab('pricing');
      } else if (errorFields.includes('content')) {
        setActiveTab('content');
      }
      
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      const confirmPublish = window.confirm(
        `There are ${validation.warnings.length} warnings:\n\n` +
        validation.warnings.map(w => `• ${w.message}`).join('\n') +
        '\n\nDo you still want to publish?'
      );
      
      if (!confirmPublish) return;
    }

    setIsPublishing(true);
    try {
      const publishData = { ...formData, status: 'active' as const };
      
      if (course?.id || formData.id) {
        const courseId = course?.id || formData.id!;
        await courseService.updateCourseStatus(courseId, 'active');
      } else {
        // Create and publish new course
        const response = await courseService.createCourse(publishData);
        if (response.data) {
          setFormData(prev => ({ ...prev, id: response.data.id, status: 'active' }));
        }
      }

      toast({
        title: "Course published!",
        description: "Your course is now live and available for students",
      });
      
      onSave({ ...formData, status: 'active' });
    } catch (error) {
      toast({
        title: "Error publishing course",
        description: "Failed to publish course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!course?.id && !formData.id) return;

    const confirmUnpublish = window.confirm(
      'Are you sure you want to unpublish this course?\n\n' +
      'The course will no longer be available for new enrollments, but existing students will still have access.'
    );
    
    if (!confirmUnpublish) return;

    setIsPublishing(true);
    try {
      const courseId = course?.id || formData.id!;
      await courseService.updateCourseStatus(courseId, 'inactive');
      
      setFormData(prev => ({ ...prev, status: 'inactive' }));
      
      toast({
        title: "Course unpublished",
        description: "Course is no longer available for new enrollments",
      });
      
      onSave({ ...formData, status: 'inactive' });
    } catch (error) {
      toast({
        title: "Error unpublishing course",
        description: "Failed to unpublish course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addLecture = () => {
    if (newLecture.title.trim()) {
      setFormData(prev => ({
        ...prev,
        lectures: [...prev.lectures, { ...newLecture, id: Date.now() }]
      }));
      setNewLecture({
        title: '',
        duration: '',
        type: 'video',
        order: formData.lectures.length + 2
      });
    }
  };

  const removeLecture = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lectures: prev.lectures.filter((_, i) => i !== index)
    }));
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>{course ? 'Edit Course' : 'Create New Course'}</span>
              {getStatusBadge()}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              
              {formData.status === 'draft' && (
                <Button 
                  variant="outline" 
                  onClick={() => handleSaveDraft(false)}
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
              )}
              
              {formData.status === 'draft' && (
                <Button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isPublishing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Send className="w-4 h-4 mr-2" />
                  Publish Course
                </Button>
              )}
              
              {formData.status === 'active' && (
                <>
                  <Button 
                    onClick={() => handleSaveDraft(false)}
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleUnpublish}
                    disabled={isPublishing}
                  >
                    {isPublishing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Archive className="w-4 h-4 mr-2" />
                    Unpublish
                  </Button>
                </>
              )}
              
              {formData.status === 'inactive' && (
                <Button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isPublishing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Send className="w-4 h-4 mr-2" />
                  Republish Course
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Validation Alerts */}
          {validationResult && (
            <div className="mb-6 space-y-3">
              {validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Errors must be fixed before publishing:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {validationResult.errors.map((error, idx) => (
                        <li key={idx}>{error.message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {validationResult.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warnings (optional improvements):</strong>
                    <ul className="list-disc list-inside mt-2">
                      {validationResult.warnings.map((warning, idx) => (
                        <li key={idx}>{warning.message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter course title"
                    className={validationResult?.errors.find(e => e.field === 'title') ? 'border-red-500' : ''}
                  />
                  {validationResult?.errors.find(e => e.field === 'title') && (
                    <p className="text-sm text-red-500 mt-1">
                      {validationResult.errors.find(e => e.field === 'title')?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Course Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what students will learn"
                    rows={4}
                    className={validationResult?.errors.find(e => e.field === 'description') ? 'border-red-500' : ''}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.description.length}/50 characters (minimum 50)
                  </p>
                  {validationResult?.errors.find(e => e.field === 'description') && (
                    <p className="text-sm text-red-500 mt-1">
                      {validationResult.errors.find(e => e.field === 'description')?.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className={validationResult?.errors.find(e => e.field === 'category') ? 'border-red-500' : ''}>
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
                      onValueChange={(value) => setFormData(prev => ({ ...prev, level: value as any }))}
                    >
                      <SelectTrigger className={validationResult?.errors.find(e => e.field === 'level') ? 'border-red-500' : ''}>
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

                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 10 hours"
                    className={validationResult?.errors.find(e => e.field === 'duration') ? 'border-red-500' : ''}
                  />
                </div>

                <div>
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="thumbnail"
                      value={formData.thumbnail || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                    <Button variant="outline">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  {validationResult?.warnings.find(w => w.field === 'thumbnail') && (
                    <p className="text-sm text-yellow-600 mt-1">
                      {validationResult.warnings.find(w => w.field === 'thumbnail')?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Course Features</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button onClick={addFeature} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {feature}
                        <button onClick={() => removeFeature(index)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {validationResult?.warnings.find(w => w.field === 'features') && (
                    <p className="text-sm text-yellow-600 mt-1">
                      {validationResult.warnings.find(w => w.field === 'features')?.message}
                    </p>
                  )}
                </div>
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
                      <Label>Enrollment Type</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Switch
                          checked={formData.enrollmentType === 'subscription'}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, enrollmentType: checked ? 'subscription' : 'one-time' }))
                          }
                        />
                        <Label>Subscription-based course</Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="price">
                        {formData.enrollmentType === 'subscription' ? 'Monthly Price' : 'Course Price'} *
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₱</span>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className={`pl-10 ${validationResult?.errors.find(e => e.field === 'price') ? 'border-red-500' : ''}`}
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      {validationResult?.errors.find(e => e.field === 'price') && (
                        <p className="text-sm text-red-500 mt-1">
                          {validationResult.errors.find(e => e.field === 'price')?.message}
                        </p>
                      )}
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
                      {validationResult?.warnings.find(w => w.field === 'originalPrice') && (
                        <p className="text-sm text-yellow-600 mt-1">
                          {validationResult.warnings.find(w => w.field === 'originalPrice')?.message}
                        </p>
                      )}
                    </div>
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Course Content</h3>
                <Button onClick={addLecture}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lecture
                </Button>
              </div>

              {validationResult?.errors.find(e => e.field === 'content') && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validationResult.errors.find(e => e.field === 'content')?.message}
                  </AlertDescription>
                </Alert>
              )}

              {validationResult?.warnings.find(w => w.field === 'content') && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validationResult.warnings.find(w => w.field === 'content')?.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Add New Lecture */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add New Lecture</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      value={newLecture.title}
                      onChange={(e) => setNewLecture(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Lecture title"
                    />
                    <Select value={newLecture.type} onValueChange={(value: any) => setNewLecture(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="text">Text/Article</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={newLecture.duration}
                      onChange={(e) => setNewLecture(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="Duration (e.g., 15 min)"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Existing Lectures */}
              <div className="space-y-2">
                {formData.lectures.map((lecture, index) => (
                  <Card key={lecture.id || index}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{lecture.title}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {lecture.type === 'video' && <Play className="w-3 h-3" />}
                              {lecture.type === 'text' && <FileText className="w-3 h-3" />}
                              {lecture.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lecture.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLecture(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {formData.lectures.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="text-center py-10">
                    <p className="text-muted-foreground">No lectures added yet. Add your first lecture to get started.</p>
                  </CardContent>
                </Card>
              )}
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

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Status History</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Created as draft</span>
                        </div>
                        {formData.status === 'active' && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            <span>Published</span>
                          </div>
                        )}
                      </div>
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
                      <h4 className="text-sm font-medium mb-2">Publishing Tips:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Complete all required fields</li>
                        <li>• Add at least 3 lectures</li>
                        <li>• Upload an eye-catching thumbnail</li>
                        <li>• Set competitive pricing</li>
                        <li>• Write detailed descriptions</li>
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