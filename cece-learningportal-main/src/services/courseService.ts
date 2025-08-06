import api from './api';

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  status: 'Draft' | 'Active' | 'Archived';
  thumbnail?: string;
  rating?: number;
  studentsCount: number;
  features?: string[];
  enrollmentType: 'OneTime' | 'Subscription';
  isBestseller?: boolean;
  createdAt: string;
  updatedAt: string;
  // Go High Level specific field
  courseType?: 'Sprint' | 'Marathon' | 'Membership' | 'Custom';
}

export interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  order: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  duration: string;
  type: 'Video' | 'Text' | 'Quiz' | 'Assignment';
  videoUrl?: string;
  content?: string;
  order: number;
  isCompleted?: boolean;
}

export interface CreateCourseDto {
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  duration?: string;
  level: string;
  category: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  promoVideoUrl?: string;
  features?: string[];
  enrollmentType?: string;
  status?: 'draft' | 'active' | 'inactive';
  modules?: CourseModule[];
  
  // Go High Level specific fields
  courseType?: 'sprint' | 'marathon' | 'membership' | 'custom';
  pricingModel?: 'free' | 'one-time' | 'subscription' | 'payment-plan';
  currency?: string;
  subscriptionPeriod?: 'monthly' | 'yearly';
  paymentPlanDetails?: {
    numberOfPayments: number;
    paymentAmount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  };
  accessType?: 'lifetime' | 'limited';
  accessDuration?: number;
  enrollmentLimit?: number;
  language?: string;
  
  // Feature flags - matches backend boolean fields
  hasCertificate?: boolean;
  hasCommunity?: boolean;
  hasLiveSessions?: boolean;
  hasDownloadableResources?: boolean;
  hasAssignments?: boolean;
  hasQuizzes?: boolean;
  
  // Drip content settings
  dripContent?: boolean;
  dripScheduleJson?: string; // Store as JSON string
  
  // Automation settings - matches backend boolean fields
  automationWelcomeEmail?: boolean;
  automationCompletionCertificate?: boolean;
  automationProgressReminders?: boolean;
  automationAbandonmentSequence?: boolean;
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}

export interface CourseFilters {
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  instructorId?: string;
  status?: string;
}

class CourseService {
  async getCourses(filters?: CourseFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.request(`/courses${params.toString() ? `?${params.toString()}` : ''}`, {
      method: 'GET'
    });
    return response;
  }

  async getCourse(id: number) {
    const response = await api.request(`/courses/${id}`, {
      method: 'GET'
    });
    return response;
  }

  async getCourseById(id: number) {
    const response = await api.request(`/courses/${id}`, {
      method: 'GET'
    });
    return response;
  }

  async createCourse(courseData: CreateCourseDto) {
    const response = await api.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
    return response;
  }

  async updateCourse(id: number, courseData: UpdateCourseDto) {
    const response = await api.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
    return response;
  }

  async deleteCourse(id: number) {
    const response = await api.request(`/courses/${id}`, {
      method: 'DELETE'
    });
    return response;
  }

  async publishCourse(id: number) {
    const response = await api.request(`/courses/${id}/publish`, {
      method: 'POST'
    });
    return response;
  }

  async enrollInCourse(courseId: number) {
    const response = await api.request(`/enrollments/courses/${courseId}`, {
      method: 'POST'
    });
    return response;
  }

  async getMyEnrollments() {
    const response = await api.request('/enrollments', {
      method: 'GET'
    });
    return response;
  }

  async updateLessonProgress(lessonId: number, status: 'InProgress' | 'Completed') {
    const response = await api.request(`/enrollments/lessons/${lessonId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    return response;
  }

  // Publishing-related methods
  async saveDraft(courseData: CreateCourseDto) {
    const draftData = { ...courseData, status: 'draft' as const };
    return this.createCourse(draftData);
  }

  async publishCourse(courseId: number) {
    const response = await api.request(`/courses/${courseId}/publish`, {
      method: 'POST'
    });
    return response;
  }

  async unpublishCourse(courseId: number) {
    const response = await api.request(`/courses/${courseId}/unpublish`, {
      method: 'PUT'
    });
    return response;
  }

  async validateCourseForPublishing(courseId: number) {
    const response = await api.request(`/courses/${courseId}/validate`, {
      method: 'GET'
    });
    return response;
  }

  async updateCourseStatus(courseId: number, status: 'draft' | 'active' | 'inactive') {
    const response = await api.request(`/courses/${courseId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    return response;
  }
}

export const courseService = new CourseService();
export default courseService;