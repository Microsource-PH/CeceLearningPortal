import api from './api';

export interface InstructorAnalytics {
  summary: {
    totalRevenue: number;
    totalStudents: number;
    totalEnrollments: number;
    totalCourses: number;
    averageRating: number;
    completionRate: number;
  };
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  coursePerformance: Array<{
    courseId: number;
    title: string;
    enrollments: number;
    revenue: number;
    completionRate: number;
    averageRating: number;
    status: string;
    monthlyEnrollments?: Array<{
      month: string;
      enrollments: number;
    }>;
  }>;
  studentEngagement: {
    averageProgressPercentage: number;
    activeStudents: number;
    completedStudents: number;
    inactiveStudents: number;
    progressDistribution: {
      notStarted: number;
      inProgress: number;
      completed: number;
    };
  };
  recentActivity: Array<{
    type: string;
    studentName: string;
    courseName: string;
    date: string;
    details: string;
  }>;
}

export interface PlatformAnalytics {
  summary: {
    totalUsers: number;
    totalCourses: number;
    totalRevenue: number;
    totalEnrollments: number;
    activeSubscriptions: number;
  };
  topPerformers: Array<{
    instructorId: string;
    instructorName: string;
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    averageRating: number;
  }>;
  popularCategories: Array<{
    category: string;
    courseCount: number;
    enrollmentCount: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    transactionCount: number;
  }>;
  userGrowth: {
    monthlyGrowth: Array<{
      month: string;
      newUsers: number;
    }>;
    totalNewUsers: number;
    averageMonthlyGrowth: number;
  };
  subscriptionMetrics: {
    byPlan: Array<{
      plan: string;
      count: number;
      monthlyRevenue: number;
    }>;
    totalActive: number;
    monthlyRecurringRevenue: number;
  };
}

export interface CourseAnalytics {
  courseId: number;
  title: string;
  summary: {
    totalRevenue: number;
    totalEnrollments: number;
    activeStudents: number;
    completedStudents: number;
    completionRate: number;
    averageProgress: number;
    averageRating: number;
    totalReviews: number;
  };
  enrollmentTrend: Array<{
    month: string;
    enrollments: number;
  }>;
  studentProgress: Array<{
    range: string;
    count: number;
  }>;
  lessonEngagement: {
    totalLessons: number;
    totalModules: number;
    averageLessonsPerModule: number;
  };
}

class AnalyticsService {
  async getInstructorAnalytics(instructorId: string): Promise<{ data: InstructorAnalytics | null; error: string | null }> {
    try {
      const response = await api.request(`/analytics/instructor/${instructorId}`, {
        method: 'GET'
      });
      
      if (response.error) {
        // Return empty data for 404 errors (new creators with no data)
        if (response.error.includes('404')) {
          const emptyData: InstructorAnalytics = {
            summary: {
              totalRevenue: 0,
              totalStudents: 0,
              totalEnrollments: 0,
              totalCourses: 0,
              averageRating: 0,
              completionRate: 0
            },
            monthlyRevenue: [],
            coursePerformance: [],
            studentEngagement: {
              averageProgressPercentage: 0,
              activeStudents: 0,
              completedStudents: 0,
              inactiveStudents: 0,
              progressDistribution: {
                notStarted: 0,
                inProgress: 0,
                completed: 0
              }
            },
            recentActivity: []
          };
          return { data: emptyData, error: null };
        }
        throw new Error(response.error);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching instructor analytics:', error);
      // Return empty data instead of mock data
      const emptyData: InstructorAnalytics = {
        summary: {
          totalRevenue: 0,
          totalStudents: 0,
          totalEnrollments: 0,
          totalCourses: 0,
          averageRating: 0,
          completionRate: 0
        },
        monthlyRevenue: [],
        coursePerformance: [],
        studentEngagement: {
          averageProgressPercentage: 0,
          activeStudents: 0,
          completedStudents: 0,
          inactiveStudents: 0,
          progressDistribution: {
            notStarted: 0,
            inProgress: 0,
            completed: 0
          }
        },
        recentActivity: []
      };
      return { data: emptyData, error: null };
    }
  }

  async getPlatformAnalytics(): Promise<{ data: PlatformAnalytics | null; error: string | null }> {
    try {
      const response = await api.request('/analytics/platform', {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching platform analytics:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch platform analytics' 
      };
    }
  }

  async getCourseAnalytics(courseId: number): Promise<{ data: CourseAnalytics | null; error: string | null }> {
    try {
      const response = await api.request(`/analytics/course/${courseId}/analytics`, {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch course analytics' 
      };
    }
  }

  async getInstructorRevenue(instructorId: string) {
    try {
      const response = await api.request(`/revenue/instructor/${instructorId}`, {
        method: 'GET'
      });
      
      if (response.error) {
        // Return empty data for 404 errors (new creators with no revenue)
        if (response.error.includes('404')) {
          const emptyData = {
            InstructorId: instructorId,
            InstructorName: 'New Creator',
            TotalRevenue: 0,
            DirectSalesRevenue: 0,
            SubscriptionRevenue: 0,
            TotalCourses: 0,
            CourseRevenues: []
          };
          return { data: emptyData, error: null };
        }
        throw new Error(response.error);
      }
      
      // Ensure data has correct format
      if (response.data) {
        console.log('Revenue API Response:', response.data);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching instructor revenue:', error);
      // Return empty data as fallback
      const emptyData = {
        InstructorId: instructorId,
        InstructorName: 'New Creator',
        TotalRevenue: 0,
        DirectSalesRevenue: 0,
        SubscriptionRevenue: 0,
        TotalCourses: 0,
        CourseRevenues: []
      };
      return { data: emptyData, error: null };
    }
  }

  async getCourseRevenues(instructorId: string) {
    try {
      const response = await api.request(`/revenue/courses/${instructorId}`, {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching course revenues:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch course revenues' 
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;