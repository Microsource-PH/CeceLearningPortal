import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  DollarSign, 
  Users, 
  Zap, 
  Calendar,
  Award,
  MessageSquare,
  Video,
  Download,
  FileText,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  Star,
  TrendingUp,
  Crown,
  Settings,
  Plus,
  Trash,
  GraduationCap
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import courseService from '@/services/courseService';

interface CourseFormData {
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
  
  // GHL Course Type
  courseType: 'Sprint' | 'Marathon' | 'Membership' | 'Custom';
  
  // Pricing
  pricingModel: 'Free' | 'OneTime' | 'Subscription' | 'PaymentPlan';
  price: number;
  originalPrice?: number;
  currency: string;
  subscriptionPeriod?: 'Monthly' | 'Yearly';
  paymentPlanDetailsJson?: string; // JSON string for payment plan
  
  // Access
  accessType: 'Lifetime' | 'Limited';
  accessDuration?: number;
  enrollmentLimit?: number;
  
  // Features (boolean flags in backend)
  hasCertificate: boolean;
  hasCommunity: boolean;
  hasLiveSessions: boolean;
  hasDownloadableResources: boolean;
  hasAssignments: boolean;
  hasQuizzes: boolean;
  
  // Drip Content
  dripContent: boolean;
  dripScheduleJson?: string; // JSON string for drip schedule
  
  // Automation
  automationWelcomeEmail: boolean;
  automationCompletionCertificate: boolean;
  automationProgressReminders: boolean;
  automationAbandonmentSequence: boolean;
  
  // Content
  modules: Array<{
    title: string;
    description: string;
    order: number;
    lessons: Array<{
      title: string;
      type: 'Video' | 'Text' | 'Quiz' | 'Assignment';
      duration?: string;
      content?: string;
      videoUrl?: string;
      order: number;
    }>;
  }>;
}

const courseTypeConfig = {
  Sprint: {
    icon: Zap,
    color: 'bg-orange-500',
    description: '7-30 day intensive courses with daily commitments',
    defaultDuration: '7 days',
    features: {
      hasCertificate: true,
      hasCommunity: false,
      hasLiveSessions: false,
      hasDownloadableResources: true,
      hasAssignments: true,
      hasQuizzes: true
    }
  },
  Marathon: {
    icon: TrendingUp,
    color: 'bg-purple-500',
    description: '3-6 month comprehensive programs with live sessions',
    defaultDuration: '6 months',
    features: {
      hasCertificate: true,
      hasCommunity: true,
      hasLiveSessions: true,
      hasDownloadableResources: true,
      hasAssignments: true,
      hasQuizzes: true
    }
  },
  Membership: {
    icon: Crown,
    color: 'bg-blue-500',
    description: 'Ongoing access to course library with monthly updates',
    defaultDuration: 'Ongoing',
    features: {
      hasCertificate: false,
      hasCommunity: true,
      hasLiveSessions: true,
      hasDownloadableResources: true,
      hasAssignments: false,
      hasQuizzes: false
    }
  },
  Custom: {
    icon: Settings,
    color: 'bg-green-500',
    description: 'Flexible course structure tailored to your needs',
    defaultDuration: 'Self-paced',
    features: {
      hasCertificate: true,
      hasCommunity: true,
      hasLiveSessions: false,
      hasDownloadableResources: true,
      hasAssignments: true,
      hasQuizzes: true
    }
  }
};

const steps = [
  { id: 'type', name: 'Course Type', icon: BookOpen },
  { id: 'basic', name: 'Basic Info', icon: FileText },
  { id: 'pricing', name: 'Pricing', icon: DollarSign },
  { id: 'content', name: 'Content', icon: GraduationCap },
  { id: 'features', name: 'Features', icon: Star },
  { id: 'automation', name: 'Automation', icon: Zap },
  { id: 'review', name: 'Review', icon: Check }
];

interface CourseCreatorGHLProps {
  onComplete: (course: any) => void;
  onCancel: () => void;
}

export const CourseCreatorGHL = ({ onComplete, onCancel }: CourseCreatorGHLProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  console.log('CourseCreatorGHL component initialized');
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    level: 'Beginner',
    language: 'en',
    courseType: 'Sprint',
    pricingModel: 'OneTime',
    price: 0,
    currency: 'PHP',
    accessType: 'Lifetime',
    modules: [],
    hasCertificate: true,
    hasCommunity: false,
    hasLiveSessions: false,
    hasDownloadableResources: true,
    hasAssignments: false,
    hasQuizzes: false,
    dripContent: false,
    automationWelcomeEmail: true,
    automationCompletionCertificate: true,
    automationProgressReminders: true,
    automationAbandonmentSequence: false
  });

  // Track if this is the initial mount
  const [isInitialMount, setIsInitialMount] = useState(true);
  
  // Update form defaults based on course type
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    
    const config = courseTypeConfig[formData.courseType];
    console.log('Course type changed to:', formData.courseType);
    console.log('Config:', config);
    
    if (config) {
      setFormData(prev => {
        const newData = {
          ...prev,
          duration: config.defaultDuration,
          ...config.features,
          // Set pricing model defaults
          pricingModel: formData.courseType === 'Membership' ? 'Subscription' : 
                        formData.courseType === 'Marathon' ? 'PaymentPlan' : 'OneTime',
          // Set drip content defaults
          dripContent: formData.courseType === 'Marathon' || formData.courseType === 'Membership',
          // Set subscription period for membership
          subscriptionPeriod: formData.courseType === 'Membership' ? 'Monthly' : undefined,
          // Set access type
          accessType: formData.courseType === 'Membership' ? 'Limited' : 'Lifetime',
          accessDuration: formData.courseType === 'Membership' ? 30 : undefined
        };
        console.log('New form data:', newData);
        return newData;
      });
    }
  }, [formData.courseType]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Course Type
        if (!formData.courseType) errors.courseType = 'Please select a course type';
        break;
      case 1: // Basic Info
        if (!formData.title) errors.title = 'Title is required';
        if (!formData.description) errors.description = 'Description is required';
        if (!formData.category) errors.category = 'Category is required';
        
        // Course type specific validation
        if (formData.courseType === 'Sprint' && formData.duration) {
          const durationMatch = formData.duration.match(/(\d+)/);
          if (durationMatch) {
            const days = parseInt(durationMatch[1]);
            if (formData.duration.includes('day') && days > 30) {
              errors.duration = 'Sprint courses should be 30 days or less';
            } else if (formData.duration.includes('week') && days > 4) {
              errors.duration = 'Sprint courses should be 4 weeks or less';
            }
          }
        }
        break;
      case 2: // Pricing
        if (formData.pricingModel !== 'Free' && formData.price <= 0) {
          errors.price = 'Price must be greater than 0';
        }
        if (formData.pricingModel === 'PaymentPlan' && !formData.paymentPlanDetailsJson) {
          errors.paymentPlan = 'Payment plan details are required';
        }
        
        // Membership must be subscription
        if (formData.courseType === 'Membership' && formData.pricingModel !== 'Subscription') {
          errors.pricingModel = 'Membership courses must use subscription pricing';
        }
        break;
      case 3: // Content
        if (formData.modules.length === 0) {
          errors.modules = 'At least one module is required';
        }
        
        // Validate each module and its lessons
        formData.modules.forEach((module, index) => {
          if (!module.title.trim()) {
            errors[`module${index}`] = 'Module title is required';
          }
          if (module.lessons.length === 0) {
            errors[`module${index}lessons`] = 'At least one lesson is required per module';
          }
          
          // Validate each lesson
          module.lessons.forEach((lesson, lessonIndex) => {
            if (!lesson.title.trim()) {
              errors[`module${index}lesson${lessonIndex}title`] = 'Lesson title is required';
            }
            if (!lesson.duration || !lesson.duration.trim()) {
              errors[`module${index}lesson${lessonIndex}duration`] = 'Lesson duration is required';
            }
          });
        });
        
        // Sprint courses should have focused content
        if (formData.courseType === 'Sprint' && formData.modules.length > 5) {
          errors.modules = 'Sprint courses should have 5 or fewer modules for focused learning';
        }
        
        // Marathon courses need substantial content
        if (formData.courseType === 'Marathon' && formData.modules.length < 3) {
          errors.modules = 'Marathon courses should have at least 3 modules';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('Current form data:', formData);
    
    // Collect all validation errors from all steps
    let allErrors: Record<string, string> = {};
    let failedSteps: number[] = [];
    
    // Validate each step and collect errors
    for (let i = 0; i < 6; i++) {
      const errors: Record<string, string> = {};
      
      // Inline validation to collect errors immediately
      switch (i) {
        case 0: // Course Type
          if (!formData.courseType) {
            errors.courseType = 'Please select a course type';
            failedSteps.push(i);
          }
          break;
        case 1: // Basic Info
          if (!formData.title) errors.title = 'Title is required';
          if (!formData.description) errors.description = 'Description is required';
          if (!formData.category) errors.category = 'Category is required';
          if (Object.keys(errors).length > 0) failedSteps.push(i);
          break;
        case 2: // Pricing
          if (formData.pricingModel !== 'Free' && formData.price <= 0) {
            errors.price = 'Price must be greater than 0';
          }
          if (Object.keys(errors).length > 0) failedSteps.push(i);
          break;
        case 3: // Content
          if (formData.modules.length === 0) {
            errors.modules = 'At least one module is required';
            failedSteps.push(i);
          } else {
            // Check each module
            let hasContentErrors = false;
            formData.modules.forEach((module, index) => {
              if (!module.title.trim()) {
                errors[`module${index}`] = 'Module title is required';
                hasContentErrors = true;
              }
              if (module.lessons.length === 0) {
                errors[`module${index}lessons`] = 'At least one lesson is required per module';
                hasContentErrors = true;
              }
            });
            if (hasContentErrors) failedSteps.push(i);
          }
          break;
      }
      
      Object.assign(allErrors, errors);
    }
    
    if (failedSteps.length > 0) {
      console.log('Validation failed for steps:', failedSteps);
      console.log('All errors:', allErrors);
      
      const stepNames = ['Course Type', 'Basic Info', 'Pricing', 'Content', 'Features', 'Automation'];
      const failedStepNames = failedSteps.map(i => stepNames[i]).join(', ');
      
      const errorMessages = Object.values(allErrors)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join('\n');
      
      toast({
        title: `Validation Error in: ${failedStepNames}`,
        description: errorMessages || "Please check all required fields are filled correctly",
        variant: "destructive"
      });
      
      return;
    }

    console.log('Validation passed! Proceeding with course creation...');
    
    setIsLoading(true);
    try {
      // Prepare data for backend - map to match backend DTO structure
      const courseData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        category: formData.category,
        level: formData.level.charAt(0).toUpperCase() + formData.level.slice(1), // Ensure proper casing
        duration: formData.duration,
        language: formData.language,
        thumbnailUrl: formData.thumbnailUrl,
        features: [], // Add empty features array as backend expects it
        
        // GHL specific fields
        courseType: formData.courseType,
        pricingModel: formData.pricingModel,
        price: formData.price,
        currency: formData.currency,
        subscriptionPeriod: formData.subscriptionPeriod,
        accessType: formData.accessType,
        accessDuration: formData.accessDuration,
        enrollmentLimit: formData.enrollmentLimit,
        
        // Features object - map individual booleans to nested object
        courseFeatures: {
          certificate: formData.hasCertificate || false,
          community: formData.hasCommunity || false,
          liveSessions: formData.hasLiveSessions || false,
          downloadableResources: formData.hasDownloadableResources || false,
          assignments: formData.hasAssignments || false,
          quizzes: formData.hasQuizzes || false,
        },
        
        // Drip content
        dripContent: formData.dripContent,
        dripSchedule: formData.dripContent && formData.dripScheduleJson
          ? (() => {
              try {
                return JSON.parse(formData.dripScheduleJson);
              } catch {
                return undefined;
              }
            })()
          : undefined,
        
        // Payment plan details
        paymentPlanDetails: formData.pricingModel === 'PaymentPlan' && formData.paymentPlanDetailsJson
          ? (() => {
              try {
                return JSON.parse(formData.paymentPlanDetailsJson);
              } catch {
                return undefined;
              }
            })()
          : undefined,
        
        // Automation settings object
        automations: {
          welcomeEmail: formData.automationWelcomeEmail || false,
          completionCertificate: formData.automationCompletionCertificate || false,
          progressReminders: formData.automationProgressReminders || false,
          abandonmentSequence: formData.automationAbandonmentSequence || false,
        },
        
        // Modules
        modules: formData.modules
      };

      // Remove undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(courseData).filter(([_, value]) => value !== undefined)
      );
      
      console.log('Sending course data:', cleanedData);
      
      // Log modules to debug
      if (cleanedData.modules) {
        console.log('Modules being sent:', JSON.stringify(cleanedData.modules, null, 2));
      }
      
      const response = await courseService.createCourse(cleanedData);
      
      if (response.data) {
        toast({
          title: "Success!",
          description: "Course created successfully"
        });
        
        onComplete(response.data);
      } else {
        throw new Error(response.error || 'Failed to create course');
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      
      // Check if it's a validation error with details
      let errorMessage = "Failed to create course. Please try again.";
      
      if (error.response && error.response.errors) {
        // Format validation errors
        const validationErrors = Object.entries(error.response.errors)
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
          .join('\n');
        errorMessage = validationErrors;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, {
        title: '',
        description: '',
        order: prev.modules.length + 1,
        lessons: []
      }]
    }));
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].lessons.push({
      title: '',
      type: 'Video',
      duration: '10:00', // Default duration
      content: '',
      videoUrl: '',
      order: newModules[moduleIndex].lessons.length + 1
    });
    setFormData(prev => ({ ...prev, modules: newModules }));
  };

  const removeModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
    setFormData(prev => ({ ...prev, modules: newModules }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Course Type Selection
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(courseTypeConfig).map(([type, config]) => {
                const Icon = config.icon;
                const isSelected = formData.courseType === type;
                
                return (
                  <Card 
                    key={type}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary' : 'hover:shadow-lg'
                    }`}
                    onClick={() => {
                      console.log('Setting course type to:', type);
                      setFormData(prev => ({ ...prev, courseType: type as 'Sprint' | 'Marathon' | 'Membership' | 'Custom' }));
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Icon className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                        {isSelected && (
                          <Badge className="bg-primary text-white">Selected</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{type}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 1: // Basic Info
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter course title"
                  className={validationErrors.title ? 'border-red-500' : ''}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Brief description for course cards"
                  maxLength={150}
                />
              </div>

              <div>
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed course description"
                  rows={5}
                  className={validationErrors.description ? 'border-red-500' : ''}
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Programming, Design"
                    className={validationErrors.category ? 'border-red-500' : ''}
                  />
                  {validationErrors.category && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.category}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="level">Level</Label>
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
                      <SelectItem value="AllLevels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">
                    Duration
                    {formData.courseType === 'Sprint' && ' (7-30 days recommended)'}
                    {formData.courseType === 'Marathon' && ' (3-12 months recommended)'}
                    {formData.courseType === 'Membership' && ' (Ongoing)'}
                  </Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder={
                      formData.courseType === 'Sprint' ? 'e.g., 7 days, 2 weeks' :
                      formData.courseType === 'Marathon' ? 'e.g., 6 months, 1 year' :
                      formData.courseType === 'Membership' ? 'Ongoing' :
                      'e.g., 4 weeks, 6 months'
                    }
                    disabled={formData.courseType === 'Membership'}
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Pricing - Dynamic based on course type
        return (
          <div className="space-y-6">
            {/* Sprint courses - typically one-time payment */}
            {formData.courseType === 'Sprint' && (
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-orange-800">
                  Sprint courses are intensive, short-duration programs typically offered as one-time payments.
                </p>
              </div>
            )}
            
            {/* Marathon courses - typically payment plans */}
            {formData.courseType === 'Marathon' && (
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-purple-800">
                  Marathon courses are long-term programs often offered with payment plans for accessibility.
                </p>
              </div>
            )}
            
            {/* Membership courses - always subscription */}
            {formData.courseType === 'Membership' && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  Membership courses provide ongoing access and are subscription-based.
                </p>
              </div>
            )}

            <div>
              <Label>Pricing Model</Label>
              <Select
                value={formData.pricingModel}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, pricingModel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* Show different pricing options based on course type */}
                  {formData.courseType === 'Sprint' && (
                    <>
                      <SelectItem value="OneTime">One-Time Payment</SelectItem>
                      <SelectItem value="Free">Free</SelectItem>
                    </>
                  )}
                  {formData.courseType === 'Marathon' && (
                    <>
                      <SelectItem value="PaymentPlan">Payment Plan</SelectItem>
                      <SelectItem value="OneTime">One-Time Payment</SelectItem>
                      <SelectItem value="Free">Free</SelectItem>
                    </>
                  )}
                  {formData.courseType === 'Membership' && (
                    <>
                      <SelectItem value="Subscription">Subscription</SelectItem>
                    </>
                  )}
                  {formData.courseType === 'Custom' && (
                    <>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="OneTime">One-Time Payment</SelectItem>
                      <SelectItem value="Subscription">Subscription</SelectItem>
                      <SelectItem value="PaymentPlan">Payment Plan</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {formData.pricingModel !== 'Free' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className={validationErrors.price ? 'border-red-500' : ''}
                    />
                    {validationErrors.price && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.price}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="originalPrice">Original Price (for discount)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || undefined }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {formData.pricingModel === 'Subscription' && (
                  <div>
                    <Label>Subscription Period</Label>
                    <Select
                      value={formData.subscriptionPeriod}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, subscriptionPeriod: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.pricingModel === 'PaymentPlan' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Plan Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <PaymentPlanEditor
                        value={formData.paymentPlanDetailsJson}
                        onChange={(json) => setFormData(prev => ({ ...prev, paymentPlanDetailsJson: json }))}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <div className="space-y-4">
              <div>
                <Label>Access Type</Label>
                <Select
                  value={formData.accessType}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, accessType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lifetime">Lifetime Access</SelectItem>
                    <SelectItem value="Limited">Limited Access</SelectItem>
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
                    placeholder="30"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="enrollmentLimit">Enrollment Limit (optional)</Label>
                <Input
                  id="enrollmentLimit"
                  type="number"
                  value={formData.enrollmentLimit || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, enrollmentLimit: parseInt(e.target.value) || undefined }))}
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </div>
        );

      case 3: // Content
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Course Modules</h3>
              <Button onClick={addModule} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>

            {validationErrors.modules && (
              <p className="text-sm text-red-500">{validationErrors.modules}</p>
            )}

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
                      <div key={lessonIndex} className="space-y-2">
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
                              className={validationErrors[`module${moduleIndex}lesson${lessonIndex}title`] ? 'border-red-500' : ''}
                              required
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
                            <Input
                              value={lesson.duration}
                              onChange={(e) => {
                                const newModules = [...formData.modules];
                                newModules[moduleIndex].lessons[lessonIndex].duration = e.target.value;
                                setFormData(prev => ({ ...prev, modules: newModules }));
                              }}
                              placeholder="Duration (e.g., 15:00)"
                              className={validationErrors[`module${moduleIndex}lesson${lessonIndex}duration`] ? 'border-red-500' : ''}
                              required
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLesson(moduleIndex, lessonIndex)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        {lesson.type === 'Video' && (
                          <div className="ml-0">
                            <Input
                              value={lesson.videoUrl || ''}
                              onChange={(e) => {
                                const newModules = [...formData.modules];
                                newModules[moduleIndex].lessons[lessonIndex].videoUrl = e.target.value;
                                setFormData(prev => ({ ...prev, modules: newModules }));
                              }}
                              placeholder="Video URL (YouTube, Vimeo, or direct link)"
                              className="w-full"
                            />
                          </div>
                        )}
                        {lesson.type === 'Text' && (
                          <div className="ml-0">
                            <Textarea
                              value={lesson.content || ''}
                              onChange={(e) => {
                                const newModules = [...formData.modules];
                                newModules[moduleIndex].lessons[lessonIndex].content = e.target.value;
                                setFormData(prev => ({ ...prev, modules: newModules }));
                              }}
                              placeholder="Lesson content (supports HTML)"
                              className="w-full"
                              rows={3}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 4: // Features - Dynamic based on course type
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Course Features</h3>
            
            {/* Course type specific feature recommendations */}
            {formData.courseType === 'Sprint' && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-800 mb-2">Sprint courses typically include:</p>
                <ul className="text-sm text-orange-700 list-disc list-inside">
                  <li>Certificate of completion</li>
                  <li>Downloadable resources</li>
                  <li>Intensive assignments</li>
                  <li>Quick quizzes for reinforcement</li>
                </ul>
              </div>
            )}
            
            {formData.courseType === 'Marathon' && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-800 mb-2">Marathon courses typically include:</p>
                <ul className="text-sm text-purple-700 list-disc list-inside">
                  <li>Certificate of completion</li>
                  <li>Community access for peer support</li>
                  <li>Live sessions for Q&A</li>
                  <li>Comprehensive assignments</li>
                  <li>Progress tracking quizzes</li>
                </ul>
              </div>
            )}
            
            {formData.courseType === 'Membership' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">Membership courses typically include:</p>
                <ul className="text-sm text-blue-700 list-disc list-inside">
                  <li>Exclusive community access</li>
                  <li>Regular live sessions</li>
                  <li>Continuously updated resources</li>
                  <li>Member-only content</li>
                </ul>
              </div>
            )}
            
            {/* Sprint-specific features */}
            {formData.courseType === 'Sprint' && (
              <Card className="bg-orange-50 border-orange-200 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Sprint Intensity Settings</CardTitle>
                  <CardDescription>Configure the intensive nature of your sprint course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Daily Time Commitment (hours)</Label>
                    <Input
                      type="number"
                      className="w-24"
                      placeholder="2-4"
                      min="1"
                      max="8"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Daily Assignments</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Progress Tracking Dashboard</Label>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Marathon-specific features */}
            {formData.courseType === 'Marathon' && (
              <Card className="bg-purple-50 border-purple-200 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Marathon Pacing Settings</CardTitle>
                  <CardDescription>Configure the long-term structure of your marathon course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Weekly Milestones</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Cohort-based Learning</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Monthly Progress Reviews</Label>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Membership-specific features */}
            {formData.courseType === 'Membership' && (
              <Card className="bg-blue-50 border-blue-200 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Membership Benefits</CardTitle>
                  <CardDescription>Configure exclusive benefits for your members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Monthly Live Q&A Sessions</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Exclusive Member Forum</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Early Access to New Content</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Member-only Resources Library</Label>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-gray-400" />
                  <Label htmlFor="certificate">Certificate of Completion</Label>
                </div>
                <Switch
                  id="certificate"
                  checked={formData.hasCertificate}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasCertificate: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <Label htmlFor="community">Community Access</Label>
                </div>
                <Switch
                  id="community"
                  checked={formData.hasCommunity}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasCommunity: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-gray-400" />
                  <Label htmlFor="liveSessions">Live Sessions</Label>
                </div>
                <Switch
                  id="liveSessions"
                  checked={formData.hasLiveSessions}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasLiveSessions: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-gray-400" />
                  <Label htmlFor="downloadable">Downloadable Resources</Label>
                </div>
                <Switch
                  id="downloadable"
                  checked={formData.hasDownloadableResources}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasDownloadableResources: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <Label htmlFor="assignments">Assignments</Label>
                </div>
                <Switch
                  id="assignments"
                  checked={formData.hasAssignments}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasAssignments: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5 text-gray-400" />
                  <Label htmlFor="quizzes">Quizzes</Label>
                </div>
                <Switch
                  id="quizzes"
                  checked={formData.hasQuizzes}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasQuizzes: checked }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dripContent">Drip Content</Label>
                  <p className="text-sm text-gray-500">Release content on a schedule</p>
                </div>
                <Switch
                  id="dripContent"
                  checked={formData.dripContent}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dripContent: checked }))}
                />
              </div>

              {formData.dripContent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Drip Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DripScheduleEditor
                      value={formData.dripScheduleJson}
                      onChange={(json) => setFormData(prev => ({ ...prev, dripScheduleJson: json }))}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 5: // Automation
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Automation Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="welcomeEmail">Welcome Email</Label>
                  <p className="text-sm text-gray-500">Send automated welcome email to new students</p>
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
                  <p className="text-sm text-gray-500">Automatically issue certificate upon course completion</p>
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
                  <p className="text-sm text-gray-500">Send periodic reminders to encourage course progress</p>
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
                  <p className="text-sm text-gray-500">Re-engage students who haven't accessed course recently</p>
                </div>
                <Switch
                  id="abandonmentSequence"
                  checked={formData.automationAbandonmentSequence}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, automationAbandonmentSequence: checked }))}
                />
              </div>
            </div>
          </div>
        );

      case 6: // Review
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review Your Course</h3>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Title:</span> {formData.title}
                  </div>
                  <div>
                    <span className="text-sm font-medium">Type:</span> 
                    <Badge className="ml-2">{formData.courseType}</Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Category:</span> {formData.category}
                  </div>
                  <div>
                    <span className="text-sm font-medium">Level:</span> {formData.level}
                  </div>
                  <div>
                    <span className="text-sm font-medium">Duration:</span> {formData.duration}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Model:</span> {formData.pricingModel}
                  </div>
                  {formData.pricingModel !== 'Free' && (
                    <div>
                      <span className="text-sm font-medium">Price:</span> {formData.currency} {formData.price}
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium">Access:</span> {formData.accessType}
                    {formData.accessType === 'Limited' && ` (${formData.accessDuration} days)`}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <span className="text-sm font-medium">Modules:</span> {formData.modules.length}
                  </div>
                  <div>
                    <span className="text-sm font-medium">Total Lessons:</span> {
                      formData.modules.reduce((acc, module) => acc + module.lessons.length, 0)
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {formData.hasCertificate && <Badge variant="secondary">Certificate</Badge>}
                    {formData.hasCommunity && <Badge variant="secondary">Community</Badge>}
                    {formData.hasLiveSessions && <Badge variant="secondary">Live Sessions</Badge>}
                    {formData.hasDownloadableResources && <Badge variant="secondary">Resources</Badge>}
                    {formData.hasAssignments && <Badge variant="secondary">Assignments</Badge>}
                    {formData.hasQuizzes && <Badge variant="secondary">Quizzes</Badge>}
                    {formData.dripContent && <Badge variant="secondary">Drip Content</Badge>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Create New Course</h2>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isActive
                      ? 'bg-primary text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-2">
                  <p className={`text-sm ${isActive ? 'font-semibold' : ''}`}>
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevious}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={() => {
              console.log('Create Course button clicked');
              handleSubmit();
            }} 
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Course'}
          </Button>
        )}
      </div>
    </div>
  );
};

// Helper component for payment plan editor
const PaymentPlanEditor = ({ value, onChange }: { value?: string; onChange: (json: string) => void }) => {
  const [plan, setPlan] = useState(() => {
    try {
      return value ? JSON.parse(value) : { numberOfPayments: 3, paymentAmount: 0, frequency: 'Monthly' };
    } catch {
      return { numberOfPayments: 3, paymentAmount: 0, frequency: 'Monthly' };
    }
  });

  const updatePlan = (updates: any) => {
    const newPlan = { ...plan, ...updates };
    setPlan(newPlan);
    onChange(JSON.stringify(newPlan));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Number of Payments</Label>
        <Input
          type="number"
          value={plan.numberOfPayments}
          onChange={(e) => updatePlan({ numberOfPayments: parseInt(e.target.value) || 1 })}
          min="2"
          max="12"
        />
      </div>
      <div>
        <Label>Payment Amount</Label>
        <Input
          type="number"
          value={plan.paymentAmount}
          onChange={(e) => updatePlan({ paymentAmount: parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
        />
      </div>
      <div>
        <Label>Frequency</Label>
        <Select
          value={plan.frequency}
          onValueChange={(value) => updatePlan({ frequency: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Weekly">Weekly</SelectItem>
            <SelectItem value="Biweekly">Bi-weekly</SelectItem>
            <SelectItem value="Monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Helper component for drip schedule editor
const DripScheduleEditor = ({ value, onChange }: { value?: string; onChange: (json: string) => void }) => {
  const [schedule, setSchedule] = useState(() => {
    try {
      return value ? JSON.parse(value) : { type: 'sequential', delayDays: 7 };
    } catch {
      return { type: 'sequential', delayDays: 7 };
    }
  });

  const updateSchedule = (updates: any) => {
    const newSchedule = { ...schedule, ...updates };
    setSchedule(newSchedule);
    onChange(JSON.stringify(newSchedule));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Schedule Type</Label>
        <Select
          value={schedule.type}
          onValueChange={(value) => updateSchedule({ type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Immediate</SelectItem>
            <SelectItem value="sequential">Sequential</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {schedule.type !== 'immediate' && (
        <div>
          <Label>Delay (days)</Label>
          <Input
            type="number"
            value={schedule.delayDays}
            onChange={(e) => updateSchedule({ delayDays: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>
      )}
    </div>
  );
};