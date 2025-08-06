import api from './api';

export interface StudentStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalCertificates: number;
  totalSpent: number;
  learningHours: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
}

export interface EnrolledCourse {
  id: number;
  courseId: number;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  enrolledAt: string;
  lastAccessedAt?: string;
  completedAt?: string;
  certificateUrl?: string;
  totalLessons: number;
  completedLessons: number;
  nextLesson?: {
    id: number;
    title: string;
    type: string;
  };
  // Go High Level specific fields
  courseType?: 'Sprint' | 'Marathon' | 'Membership' | 'Custom';
  // Additional course features
  courseFeatures?: {
    certificate: boolean;
    community: boolean;
    liveSessions: boolean;
    downloadableResources: boolean;
    assignments: boolean;
    quizzes: boolean;
  };
  language?: string;
  level?: string;
  category?: string;
}

export interface LearningActivity {
  id: string;
  type: 'lesson_completed' | 'course_enrolled' | 'certificate_earned' | 'quiz_passed';
  title: string;
  description: string;
  timestamp: string;
  courseId?: number;
  courseName?: string;
}

export interface CourseProgress {
  courseId: number;
  enrollmentId: number;
  modules: Array<{
    id: number;
    title: string;
    order: number;
    lessons: Array<{
      id: number;
      title: string;
      type: string;
      duration: string;
      isCompleted: boolean;
      completedAt?: string;
    }>;
    progress: number;
  }>;
  overallProgress: number;
  lastAccessedLessonId?: number;
}

class StudentService {
  async getStudentStats(): Promise<{ data: StudentStats | null; error: string | null }> {
    try {
      const response = await api.request<StudentStats>('/students/stats', {
        method: 'GET'
      });
      
      if (response.error) {
        // If endpoint doesn't exist, try to get data from learning tracking service
        if (response.error.includes('404')) {
          // Check if user has a subscription
          const subscriptionResponse = await api.request('/subscriptions/current', { method: 'GET' });
          const hasSubscription = !subscriptionResponse.error;
          
          // Get stored enrollment data
          const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
          const completedCourses = enrolledCourses.filter((c: any) => c.progress >= 100);
          const inProgressCourses = enrolledCourses.filter((c: any) => c.progress > 0 && c.progress < 100);
          
          // Calculate total spent (subscription + individual purchases)
          let totalSpent = 0;
          if (hasSubscription) {
            totalSpent += 49.99; // Monthly subscription
          }
          
          // Add individual course purchases
          const purchases = JSON.parse(localStorage.getItem('coursePurchases') || '[]');
          totalSpent += purchases.reduce((sum: number, purchase: any) => sum + purchase.amount, 0);
          
          return {
            data: {
              totalCourses: enrolledCourses.length,
              completedCourses: completedCourses.length,
              inProgressCourses: inProgressCourses.length,
              totalCertificates: completedCourses.length,
              totalSpent,
              learningHours: enrolledCourses.reduce((sum: number, course: any) => sum + (course.timeSpent || 0), 0) / 60,
              currentStreak: parseInt(localStorage.getItem('currentStreak') || '0'),
              longestStreak: parseInt(localStorage.getItem('longestStreak') || '0'),
              averageScore: 87,
              weeklyGoalProgress: 75,
              coursesThisMonth: completedCourses.filter((c: any) => {
                const completedDate = new Date(c.completedAt || Date.now());
                const thisMonth = new Date();
                return completedDate.getMonth() === thisMonth.getMonth() && 
                       completedDate.getFullYear() === thisMonth.getFullYear();
              }).length
            },
            error: null
          };
        }
        throw new Error(response.error);
      }
      
      return { data: response.data || null, error: null };
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch student stats' 
      };
    }
  }

  async getEnrolledCourses(): Promise<{ data: EnrolledCourse[] | null; error: string | null }> {
    try {
      const response = await api.request<EnrolledCourse[]>('/students/courses', {
        method: 'GET'
      });
      
      if (response.error) {
        // If endpoint doesn't exist, return mock data
        if (response.error.includes('404')) {
          return {
            data: [
              {
                id: 1,
                courseId: 55,
                title: "Complete Web Development Bootcamp 2025",
                instructor: "Dr. Sarah Johnson",
                thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop&auto=format",
                progress: 65,
                status: "in_progress",
                enrolledAt: "2025-01-15T00:00:00Z",
                completedLessons: 15,
                totalLessons: 23,
                lastAccessedAt: "2025-01-25T00:00:00Z"
              }
            ],
            error: null
          };
        }
        throw new Error(response.error);
      }
      
      return { data: response.data || null, error: null };
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch enrolled courses' 
      };
    }
  }

  async getCourseProgress(courseId: number): Promise<{ data: CourseProgress | null; error: string | null }> {
    try {
      const response = await api.request(`/students/courses/${courseId}/progress`, {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch course progress' 
      };
    }
  }

  async updateLessonProgress(lessonId: number, status: 'completed' | 'in_progress'): Promise<{ data: boolean; error: string | null }> {
    try {
      const response = await api.request(`/students/lessons/${lessonId}/progress`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return { 
        data: false, 
        error: error instanceof Error ? error.message : 'Failed to update lesson progress' 
      };
    }
  }

  async getLearningActivity(limit: number = 10): Promise<{ data: LearningActivity[] | null; error: string | null }> {
    try {
      const response = await api.request(`/students/activity?limit=${limit}`, {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching learning activity:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch learning activity' 
      };
    }
  }

  async getCertificates(): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const response = await api.request('/students/certificates', {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch certificates' 
      };
    }
  }
}

export const studentService = new StudentService();
export default studentService;