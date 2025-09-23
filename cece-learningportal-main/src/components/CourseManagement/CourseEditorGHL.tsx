import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import FileUpload from "@/components/ui/FileUpload";
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
  GraduationCap,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import courseService, {
  Course,
  UpdateCourseDto,
} from "@/services/courseService";

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
  courseType: "Sprint" | "Marathon" | "Membership" | "Custom";

  // Pricing
  pricingModel: "Free" | "OneTime" | "Subscription" | "PaymentPlan";
  price: number;
  originalPrice?: number;
  currency: string;
  subscriptionPeriod?: "Monthly" | "Yearly";
  paymentPlanDetailsJson?: string;

  // Access
  accessType: "Lifetime" | "Limited";
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
  dripScheduleJson?: string;

  // Automation
  automationWelcomeEmail: boolean;
  automationCompletionCertificate: boolean;
  automationProgressReminders: boolean;
  automationAbandonmentSequence: boolean;

  // Content
  modules: Array<{
    id?: number;
    title: string;
    description: string;
    order: number;
    lessons: Array<{
      id?: number;
      title: string;
      type: "Video" | "Text" | "Quiz" | "Assignment";
      duration?: string;
      content?: string;
      videoUrl?: string;
      order: number;
    }>;
  }>;
}

const steps = [
  { id: "basic", name: "Basic Info", icon: FileText },
  { id: "pricing", name: "Pricing", icon: DollarSign },
  { id: "content", name: "Content", icon: GraduationCap },
  { id: "features", name: "Features", icon: Star },
  { id: "automation", name: "Automation", icon: Zap },
  { id: "review", name: "Review", icon: Check },
];

interface CourseEditorGHLProps {
  courseId: number;
  onComplete: (course: any) => void;
  onCancel: () => void;
}

// Drip Schedule Editor Component
const DripScheduleEditor = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (json: string) => void;
}) => {
  const [schedule, setSchedule] = useState<
    Array<{ day: number; content: string }>
  >([]);

  useEffect(() => {
    if (value) {
      try {
        setSchedule(JSON.parse(value));
      } catch (e) {
        setSchedule([]);
      }
    }
  }, [value]);

  const addScheduleItem = () => {
    const newSchedule = [...schedule, { day: 1, content: "" }];
    setSchedule(newSchedule);
    onChange(JSON.stringify(newSchedule));
  };

  const updateScheduleItem = (
    index: number,
    field: "day" | "content",
    value: string | number
  ) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
    onChange(JSON.stringify(newSchedule));
  };

  const removeScheduleItem = (index: number) => {
    const newSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(newSchedule);
    onChange(JSON.stringify(newSchedule));
  };

  return (
    <div className="space-y-4">
      {schedule.map((item, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Label className="w-20">Day</Label>
          <Input
            type="number"
            value={item.day}
            onChange={(e) =>
              updateScheduleItem(index, "day", parseInt(e.target.value))
            }
            className="w-20"
            min="1"
          />
          <Input
            value={item.content}
            onChange={(e) =>
              updateScheduleItem(index, "content", e.target.value)
            }
            placeholder="Content to release"
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeScheduleItem(index)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addScheduleItem}>
        <Plus className="h-4 w-4 mr-2" /> Add Schedule Item
      </Button>
    </div>
  );
};

export const CourseEditorGHL = ({
  courseId,
  onComplete,
  onCancel,
}: CourseEditorGHLProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    shortDescription: "",
    category: "",
    level: "Beginner",
    language: "en",
    courseType: "Custom",
    pricingModel: "OneTime",
    price: 0,
    currency: "PHP",
    accessType: "Lifetime",
    modules: [],
    hasCertificate: false,
    hasCommunity: false,
    hasLiveSessions: false,
    hasDownloadableResources: false,
    hasAssignments: false,
    hasQuizzes: false,
    dripContent: false,
    automationWelcomeEmail: true,
    automationCompletionCertificate: true,
    automationProgressReminders: true,
    automationAbandonmentSequence: false,
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
        const course: any = response.data;

        // Map the course data to form data
        setFormData({
          title: course.title,
          description: course.description,
          shortDescription: course.shortDescription || "",
          category: course.category,
          level: course.level,
          language: course.language || "en",
          courseType:
            (course.courseType as
              | "Sprint"
              | "Marathon"
              | "Membership"
              | "Custom") || "Custom",
          pricingModel:
            (course.pricingModel as
              | "Free"
              | "OneTime"
              | "Subscription"
              | "PaymentPlan") || "OneTime",
          price: course.price,
          originalPrice: course.originalPrice,
          currency: course.currency || "PHP",
          subscriptionPeriod: course.subscriptionPeriod as
            | "Monthly"
            | "Yearly"
            | undefined,
          accessType:
            (course.accessType as "Lifetime" | "Limited") || "Lifetime",
          accessDuration: course.accessDuration,
          enrollmentLimit: course.enrollmentLimit,
          thumbnailUrl: course.thumbnailUrl,
          promoVideoUrl: course.promoVideoUrl,
          hasCertificate: course.courseFeatures?.certificate || false,
          hasCommunity: course.courseFeatures?.community || false,
          hasLiveSessions: course.courseFeatures?.liveSessions || false,
          hasDownloadableResources:
            course.courseFeatures?.downloadableResources || false,
          hasAssignments: course.courseFeatures?.assignments || false,
          hasQuizzes: course.courseFeatures?.quizzes || false,
          dripContent: course.dripContent || false,
          dripScheduleJson: course.dripSchedule
            ? JSON.stringify(course.dripSchedule)
            : undefined,
          automationWelcomeEmail: course.automations?.welcomeEmail ?? true,
          automationCompletionCertificate:
            course.automations?.completionCertificate ?? true,
          automationProgressReminders:
            course.automations?.progressReminders ?? true,
          automationAbandonmentSequence:
            course.automations?.abandonmentSequence ?? false,
          modules:
            course.modules?.map((m) => ({
              id: m.id,
              title: m.title,
              description: m.description || "",
              order: m.order,
              lessons:
                m.lessons?.map((l) => ({
                  id: l.id,
                  title: l.title,
                  type: l.type as "Video" | "Text" | "Quiz" | "Assignment",
                  duration: l.duration,
                  content: l.content,
                  videoUrl: l.videoUrl,
                  order: l.order,
                })) || [],
            })) || [],
        });
      }
    } catch (error) {
      console.error("Error loading course:", error);
      toast({
        title: "Error",
        description: "Failed to load course data",
        variant: "destructive",
      });
    } finally {
      setLoadingCourse(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Info
        if (!formData.title) errors.title = "Title is required";
        if (!formData.description)
          errors.description = "Description is required";
        if (!formData.category) errors.category = "Category is required";
        if (!formData.level) errors.level = "Level is required";
        break;

      case 1: // Pricing
        if (
          formData.pricingModel !== "Free" &&
          (!formData.price || formData.price < 0)
        ) {
          errors.price = "Valid price is required";
        }
        break;

      case 2: // Content
        if (formData.modules.length === 0) {
          errors.modules = "At least one module is required";
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      // Prepare the update data
      const updateData: UpdateCourseDto = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        category: formData.category,
        level: formData.level,
        language: formData.language,
        duration: formData.duration,
        thumbnailUrl: formData.thumbnailUrl,
        promoVideoUrl: formData.promoVideoUrl,
        courseType: formData.courseType.toLowerCase() as
          | "sprint"
          | "marathon"
          | "membership"
          | "custom",
        pricingModel: formData.pricingModel
          .toLowerCase()
          .replace("onetime", "one-time")
          .replace("paymentplan", "payment-plan") as
          | "free"
          | "one-time"
          | "subscription"
          | "payment-plan",
        price: formData.price,
        originalPrice: formData.originalPrice,
        currency: formData.currency,
        subscriptionPeriod: formData.subscriptionPeriod?.toLowerCase() as
          | "monthly"
          | "yearly"
          | undefined,
        accessType: formData.accessType.toLowerCase() as "lifetime" | "limited",
        accessDuration: formData.accessDuration,
        enrollmentLimit: formData.enrollmentLimit,
        hasCertificate: formData.hasCertificate,
        hasCommunity: formData.hasCommunity,
        hasLiveSessions: formData.hasLiveSessions,
        hasDownloadableResources: formData.hasDownloadableResources,
        hasAssignments: formData.hasAssignments,
        hasQuizzes: formData.hasQuizzes,
        dripContent: formData.dripContent,
        dripScheduleJson: formData.dripScheduleJson,
        automationWelcomeEmail: formData.automationWelcomeEmail,
        automationCompletionCertificate:
          formData.automationCompletionCertificate,
        automationProgressReminders: formData.automationProgressReminders,
        automationAbandonmentSequence: formData.automationAbandonmentSequence,
      };

      const response = await courseService.updateCourse(courseId, updateData);

      if (response.data) {
        toast({
          title: "Course Updated",
          description: "Your course has been updated successfully!",
        });
        onComplete(response.data);
      }
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addModule = () => {
    setFormData((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          title: "",
          description: "",
          order: prev.modules.length + 1,
          lessons: [],
        },
      ],
    }));
  };

  const updateModule = (index: number, field: string, value: any) => {
    const newModules = [...formData.modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setFormData((prev) => ({ ...prev, modules: newModules }));
  };

  const removeModule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].lessons.push({
      title: "",
      type: "Video",
      order: newModules[moduleIndex].lessons.length + 1,
    });
    setFormData((prev) => ({ ...prev, modules: newModules }));
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    field: string,
    value: any
  ) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].lessons[lessonIndex] = {
      ...newModules[moduleIndex].lessons[lessonIndex],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, modules: newModules }));
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter(
      (_, i) => i !== lessonIndex
    );
    setFormData((prev) => ({ ...prev, modules: newModules }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div>
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter course title"
                className={validationErrors.title ? "border-red-500" : ""}
              />
              {validationErrors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.title}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Course Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what students will learn"
                rows={6}
                className={validationErrors.description ? "border-red-500" : ""}
              />
              {validationErrors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    shortDescription: e.target.value,
                  }))
                }
                placeholder="Brief summary for course cards"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger
                    className={
                      validationErrors.category ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">
                      Web Development
                    </SelectItem>
                    <SelectItem value="Mobile Development">
                      Mobile Development
                    </SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Machine Learning">
                      Machine Learning
                    </SelectItem>
                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, level: value }))
                  }
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, language: value }))
                  }
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

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  placeholder="e.g., 10 hours"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Pricing
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Pricing & Access</h3>

            <div>
              <Label>Pricing Model</Label>
              <Select
                value={formData.pricingModel}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, pricingModel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="OneTime">One-time Payment</SelectItem>
                  <SelectItem value="Subscription">Subscription</SelectItem>
                  <SelectItem value="PaymentPlan">Payment Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.pricingModel !== "Free" && (
              <>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      ₱
                    </span>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className={`pl-10 ${validationErrors.price ? "border-red-500" : ""}`}
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  {validationErrors.price && (
                    <p className="text-sm text-red-500 mt-1">
                      {validationErrors.price}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="originalPrice">
                    Original Price (optional)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      ₱
                    </span>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          originalPrice:
                            parseFloat(e.target.value) || undefined,
                        }))
                      }
                      className="pl-10"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.pricingModel === "Subscription" && (
              <div>
                <Label>Subscription Period</Label>
                <Select
                  value={formData.subscriptionPeriod}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({
                      ...prev,
                      subscriptionPeriod: value,
                    }))
                  }
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

            <div>
              <Label>Access Type</Label>
              <Select
                value={formData.accessType}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({ ...prev, accessType: value }))
                }
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

            {formData.accessType === "Limited" && (
              <div>
                <Label htmlFor="accessDuration">Access Duration (days)</Label>
                <Input
                  id="accessDuration"
                  type="number"
                  value={formData.accessDuration || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accessDuration: parseInt(e.target.value) || undefined,
                    }))
                  }
                  placeholder="e.g., 90"
                />
              </div>
            )}

            <div>
              <Label htmlFor="enrollmentLimit">
                Enrollment Limit (optional)
              </Label>
              <Input
                id="enrollmentLimit"
                type="number"
                value={formData.enrollmentLimit || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    enrollmentLimit: parseInt(e.target.value) || undefined,
                  }))
                }
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>
        );

      case 2: // Content
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Course Content</h3>
              <Button onClick={addModule} size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Module
              </Button>
            </div>

            {validationErrors.modules && (
              <p className="text-sm text-red-500">{validationErrors.modules}</p>
            )}

            {formData.modules.map((module, moduleIndex) => (
              <Card key={moduleIndex}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={module.title}
                        onChange={(e) =>
                          updateModule(moduleIndex, "title", e.target.value)
                        }
                        placeholder="Module title"
                      />
                      <Textarea
                        value={module.description}
                        onChange={(e) =>
                          updateModule(
                            moduleIndex,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Module description"
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeModule(moduleIndex)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Lessons</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addLesson(moduleIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Lesson
                      </Button>
                    </div>

                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="flex gap-2 items-center"
                      >
                        <Input
                          value={lesson.title}
                          onChange={(e) =>
                            updateLesson(
                              moduleIndex,
                              lessonIndex,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="Lesson title"
                          className="flex-1"
                        />
                        <Select
                          value={lesson.type}
                          onValueChange={(value) =>
                            updateLesson(
                              moduleIndex,
                              lessonIndex,
                              "type",
                              value
                            )
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Video">Video</SelectItem>
                            <SelectItem value="Text">Text</SelectItem>
                            <SelectItem value="Quiz">Quiz</SelectItem>
                            <SelectItem value="Assignment">
                              Assignment
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={lesson.duration || ""}
                          onChange={(e) =>
                            updateLesson(
                              moduleIndex,
                              lessonIndex,
                              "duration",
                              e.target.value
                            )
                          }
                          placeholder="Duration"
                          className="w-24"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLesson(moduleIndex, lessonIndex)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 3: // Features
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Course Features</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-gray-400" />
                  <Label htmlFor="certificate">Certificate of Completion</Label>
                </div>
                <Switch
                  id="certificate"
                  checked={formData.hasCertificate}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      hasCertificate: checked,
                    }))
                  }
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
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, hasCommunity: checked }))
                  }
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
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      hasLiveSessions: checked,
                    }))
                  }
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
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      hasDownloadableResources: checked,
                    }))
                  }
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
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      hasAssignments: checked,
                    }))
                  }
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
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, hasQuizzes: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dripContent">Drip Content</Label>
                  <p className="text-sm text-gray-500">
                    Release content on a schedule
                  </p>
                </div>
                <Switch
                  id="dripContent"
                  checked={formData.dripContent}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, dripContent: checked }))
                  }
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
                      onChange={(json) =>
                        setFormData((prev) => ({
                          ...prev,
                          dripScheduleJson: json,
                        }))
                      }
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 4: // Automation
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Automation Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="welcomeEmail">Welcome Email</Label>
                  <p className="text-sm text-gray-500">
                    Send email when student enrolls
                  </p>
                </div>
                <Switch
                  id="welcomeEmail"
                  checked={formData.automationWelcomeEmail}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      automationWelcomeEmail: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="completionCert">Completion Certificate</Label>
                  <p className="text-sm text-gray-500">
                    Auto-issue certificate on completion
                  </p>
                </div>
                <Switch
                  id="completionCert"
                  checked={formData.automationCompletionCertificate}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      automationCompletionCertificate: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="progressReminders">Progress Reminders</Label>
                  <p className="text-sm text-gray-500">
                    Send reminders to keep students engaged
                  </p>
                </div>
                <Switch
                  id="progressReminders"
                  checked={formData.automationProgressReminders}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      automationProgressReminders: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="abandonmentSeq">Abandonment Sequence</Label>
                  <p className="text-sm text-gray-500">
                    Re-engage students who stop progress
                  </p>
                </div>
                <Switch
                  id="abandonmentSeq"
                  checked={formData.automationAbandonmentSequence}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      automationAbandonmentSequence: checked,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        );

      case 5: // Review
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review Your Course</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <strong>Title:</strong> {formData.title}
                  </div>
                  <div>
                    <strong>Category:</strong> {formData.category}
                  </div>
                  <div>
                    <strong>Level:</strong> {formData.level}
                  </div>
                  <div>
                    <strong>Language:</strong> {formData.language}
                  </div>
                  {formData.duration && (
                    <div>
                      <strong>Duration:</strong> {formData.duration}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <strong>Model:</strong> {formData.pricingModel}
                  </div>
                  {formData.pricingModel !== "Free" && (
                    <>
                      <div>
                        <strong>Price:</strong> ₱{formData.price}
                      </div>
                      {formData.originalPrice && (
                        <div>
                          <strong>Original Price:</strong> ₱
                          {formData.originalPrice}
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <strong>Access:</strong> {formData.accessType}
                  </div>
                  {formData.accessDuration && (
                    <div>
                      <strong>Duration:</strong> {formData.accessDuration} days
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <strong>Modules:</strong> {formData.modules.length}
                  </div>
                  <div>
                    <strong>Total Lessons:</strong>{" "}
                    {formData.modules.reduce(
                      (sum, m) => sum + m.lessons.length,
                      0
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {formData.hasCertificate && (
                      <Badge variant="secondary">Certificate</Badge>
                    )}
                    {formData.hasCommunity && (
                      <Badge variant="secondary">Community</Badge>
                    )}
                    {formData.hasLiveSessions && (
                      <Badge variant="secondary">Live Sessions</Badge>
                    )}
                    {formData.hasDownloadableResources && (
                      <Badge variant="secondary">Resources</Badge>
                    )}
                    {formData.hasAssignments && (
                      <Badge variant="secondary">Assignments</Badge>
                    )}
                    {formData.hasQuizzes && (
                      <Badge variant="secondary">Quizzes</Badge>
                    )}
                    {formData.dripContent && (
                      <Badge variant="secondary">Drip Content</Badge>
                    )}
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

  if (loadingCourse) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Loading course...
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Edit Course</h2>

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
                  index < steps.length - 1 ? "flex-1" : ""
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isActive
                      ? "bg-primary text-white"
                      : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">{renderStepContent()}</CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevious}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 0 ? "Cancel" : "Previous"}
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Update Course
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
