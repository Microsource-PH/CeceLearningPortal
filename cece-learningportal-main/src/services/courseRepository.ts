import api from './api';
import { 
  Course, 
  CourseWithDetails, 
  CourseFeature, 
  CourseTag,
  CoursePrerequisite,
  CourseObjective,
  CourseModule,
  CourseLesson,
  CourseResource,
  CourseReview,
  CourseAnnouncement
} from '@/types/database';

export class CourseRepository {
  // Course CRUD operations
  static async getCourse(id: number): Promise<CourseWithDetails | null> {
    try {
      const response = await api.request<CourseWithDetails>(`/courses/${id}`, {
        method: 'GET'
      });
      
      if (response.error) {
        console.error('Error fetching course:', response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  }

  static async createCourse(courseData: Partial<Course>): Promise<Course | null> {
    try {
      const response = await api.request<Course>('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData)
      });
      
      if (response.error) {
        console.error('Error creating course:', response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error creating course:', error);
      return null;
    }
  }

  static async updateCourse(id: number, courseData: any): Promise<Course | null> {
    try {
      // Extract the base course data, removing arrays that aren't part of the Course model
      const { features, tags, objectives, prerequisites, ...baseCourseData } = courseData;
      
      const response = await api.request<Course>(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(baseCourseData)
      });
      
      if (response.error) {
        console.error('Error updating course:', response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error updating course:', error);
      return null;
    }
  }

  // Course Features
  static async addCourseFeatures(courseId: number, features: string[]): Promise<CourseFeature[]> {
    try {
      const response = await api.request<CourseFeature[]>(`/courses/${courseId}/features`, {
        method: 'POST',
        body: JSON.stringify({ features })
      });
      
      if (response.error) {
        console.error('Error adding features:', response.error);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error adding features:', error);
      return [];
    }
  }

  static async removeCourseFeature(courseId: number, featureId: number): Promise<boolean> {
    try {
      const response = await api.request(`/courses/${courseId}/features/${featureId}`, {
        method: 'DELETE'
      });
      
      return !response.error;
    } catch (error) {
      console.error('Error removing feature:', error);
      return false;
    }
  }

  static async updateFeatureOrder(courseId: number, features: { id: number; display_order: number }[]): Promise<boolean> {
    try {
      const response = await api.request(`/courses/${courseId}/features/order`, {
        method: 'PUT',
        body: JSON.stringify({ features })
      });
      
      return !response.error;
    } catch (error) {
      console.error('Error updating feature order:', error);
      return false;
    }
  }

  // Course Tags
  static async addCourseTags(courseId: number, tags: string[]): Promise<CourseTag[]> {
    try {
      const response = await api.request<CourseTag[]>(`/courses/${courseId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tags })
      });
      
      if (response.error) {
        console.error('Error adding tags:', response.error);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error adding tags:', error);
      return [];
    }
  }

  static async removeCourseTag(courseId: number, tagId: number): Promise<boolean> {
    try {
      const response = await api.request(`/courses/${courseId}/tags/${tagId}`, {
        method: 'DELETE'
      });
      
      return !response.error;
    } catch (error) {
      console.error('Error removing tag:', error);
      return false;
    }
  }

  // Course Prerequisites
  static async addCoursePrerequisites(courseId: number, prerequisites: Partial<CoursePrerequisite>[]): Promise<CoursePrerequisite[]> {
    try {
      const response = await api.request<CoursePrerequisite[]>(`/courses/${courseId}/prerequisites`, {
        method: 'POST',
        body: JSON.stringify({ prerequisites })
      });
      
      if (response.error) {
        console.error('Error adding prerequisites:', response.error);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error adding prerequisites:', error);
      return [];
    }
  }

  // Course Objectives
  static async addCourseObjectives(courseId: number, objectives: string[]): Promise<CourseObjective[]> {
    try {
      const response = await api.request<CourseObjective[]>(`/courses/${courseId}/objectives`, {
        method: 'POST',
        body: JSON.stringify({ objectives })
      });
      
      if (response.error) {
        console.error('Error adding objectives:', response.error);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error adding objectives:', error);
      return [];
    }
  }

  // Course Modules and Lessons
  static async createModule(courseId: number, moduleData: Partial<CourseModule>): Promise<CourseModule | null> {
    try {
      const response = await api.request<CourseModule>(`/courses/${courseId}/modules`, {
        method: 'POST',
        body: JSON.stringify(moduleData)
      });
      
      if (response.error) {
        console.error('Error creating module:', response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error creating module:', error);
      return null;
    }
  }

  static async createLesson(moduleId: number, lessonData: Partial<CourseLesson>): Promise<CourseLesson | null> {
    try {
      const response = await api.request<CourseLesson>(`/modules/${moduleId}/lessons`, {
        method: 'POST',
        body: JSON.stringify(lessonData)
      });
      
      if (response.error) {
        console.error('Error creating lesson:', response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error creating lesson:', error);
      return null;
    }
  }

  static async updateModuleOrder(courseId: number, modules: { id: number; display_order: number }[]): Promise<boolean> {
    try {
      const response = await api.request(`/courses/${courseId}/modules/order`, {
        method: 'PUT',
        body: JSON.stringify({ modules })
      });
      
      return !response.error;
    } catch (error) {
      console.error('Error updating module order:', error);
      return false;
    }
  }

  static async updateLessonOrder(moduleId: number, lessons: { id: number; display_order: number }[]): Promise<boolean> {
    try {
      const response = await api.request(`/modules/${moduleId}/lessons/order`, {
        method: 'PUT',
        body: JSON.stringify({ lessons })
      });
      
      return !response.error;
    } catch (error) {
      console.error('Error updating lesson order:', error);
      return false;
    }
  }

  // Course Resources
  static async addCourseResource(resourceData: Partial<CourseResource>): Promise<CourseResource | null> {
    try {
      const response = await api.request<CourseResource>('/course-resources', {
        method: 'POST',
        body: JSON.stringify(resourceData)
      });
      
      if (response.error) {
        console.error('Error adding resource:', response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error adding resource:', error);
      return null;
    }
  }

  // Course Reviews
  static async getCourseReviews(courseId: number, page: number = 1, limit: number = 10): Promise<{ reviews: CourseReview[], total: number }> {
    try {
      const response = await api.request<{ reviews: CourseReview[], total: number }>(
        `/courses/${courseId}/reviews?page=${page}&limit=${limit}`,
        { method: 'GET' }
      );
      
      if (response.error) {
        console.error('Error fetching reviews:', response.error);
        return { reviews: [], total: 0 };
      }

      return response.data || { reviews: [], total: 0 };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return { reviews: [], total: 0 };
    }
  }

  static async addCourseReview(courseId: number, reviewData: Partial<CourseReview>): Promise<CourseReview | null> {
    try {
      const response = await api.request<CourseReview>(`/courses/${courseId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });
      
      if (response.error) {
        console.error('Error adding review:', response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error adding review:', error);
      return null;
    }
  }

  static async respondToReview(reviewId: number, response: string): Promise<boolean> {
    try {
      const apiResponse = await api.request(`/reviews/${reviewId}/response`, {
        method: 'POST',
        body: JSON.stringify({ response })
      });
      
      return !apiResponse.error;
    } catch (error) {
      console.error('Error responding to review:', error);
      return false;
    }
  }

  // Course Announcements
  static async createAnnouncement(courseId: number, announcementData: Partial<CourseAnnouncement>): Promise<CourseAnnouncement | null> {
    try {
      const response = await api.request<CourseAnnouncement>(`/courses/${courseId}/announcements`, {
        method: 'POST',
        body: JSON.stringify(announcementData)
      });
      
      if (response.error) {
        console.error('Error creating announcement:', response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error creating announcement:', error);
      return null;
    }
  }

  // Bulk operations for course creation
  static async createCourseWithDetails(
    courseData: Partial<Course>,
    features: string[] = [],
    tags: string[] = [],
    objectives: string[] = [],
    prerequisites: Partial<CoursePrerequisite>[] = []
  ): Promise<CourseWithDetails | null> {
    try {
      // First create the course
      const courseResponse = await api.request<Course>('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData)
      });
      
      if (courseResponse.error || !courseResponse.data) {
        console.error('Error creating course:', courseResponse.error);
        throw new Error(courseResponse.error || 'Failed to create course');
      }

      const createdCourse = courseResponse.data;
      
      // Then add features, tags, objectives, and prerequisites
      // Note: These endpoints may need to be implemented in the backend
      // For now, return the created course
      return {
        ...createdCourse,
        features: [],
        tags: [],
        objectives: [],
        prerequisites: [],
        modules: []
      } as CourseWithDetails;
    } catch (error) {
      console.error('Error creating course with details:', error);
      throw error;
    }
  }

  // Search and filter
  static async searchCourses(query: string, filters?: {
    category?: string;
    level?: string;
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    tags?: string[];
  }): Promise<Course[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, String(value));
            }
          }
        });
      }

      const response = await api.request<Course[]>(`/courses/search?${params.toString()}`, {
        method: 'GET'
      });
      
      if (response.error) {
        console.error('Error searching courses:', response.error);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error searching courses:', error);
      return [];
    }
  }
}