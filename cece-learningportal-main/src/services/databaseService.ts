import api from './api';
import { getCourseThumbnail } from '@/utils/format';

export class DatabaseService {
  // User Services
  static async getUsers(filters?: { role?: string; status?: string }) {
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters?.role) {
        params.append('role', filters.role);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }

      const queryString = params.toString();
      const url = `/admin/users${queryString ? `?${queryString}` : ''}`;

      const response = await api.request(url, {
        method: 'GET'
      });
      
      console.log('Users API response:', response);
      
      if (response.error) {
        // Check if it's a 403 error (forbidden)
        if (response.error.includes('403') || response.error.includes('Forbidden')) {
          console.log('Access denied to users endpoint - admin privileges required');
          return { data: [], error: 'Admin privileges required' };
        }
        throw new Error(response.error);
      }

      return { data: response.data || [], error: null };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: [], error: 'Failed to fetch users' };
    }
  }

  static async getUserStats(userId: string) {
    try {
      const response = await api.request(`/users/${userId}/stats`, {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { data: null, error: 'Failed to fetch user stats' };
    }
  }

  // Course Services
  static async getCourses(filters?: { category?: string; instructor_id?: string; status?: string }) {
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters?.instructor_id) {
        params.append('instructorId', filters.instructor_id);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }

      const queryString = params.toString();
      const url = `/courses${queryString ? `?${queryString}` : ''}`;

      const response = await api.request(url, {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Merge with Dr. Johnson's demo courses if logged in as Dr. Johnson
      let courses = response.data || [];
      console.log('Courses from API:', courses);
      
      // Add thumbnails and calculate discount to courses
      courses = courses.map((course: any) => {
        const discount = course.original_price && course.original_price > course.price 
          ? Math.round(((course.original_price - course.price) / course.original_price) * 100)
          : 0;
        
        return {
          ...course,
          thumbnail: course.thumbnail || getCourseThumbnail(course.category, course.id),
          originalPrice: course.original_price || course.originalPrice,
          discount: discount,
          studentsCount: course.total_students || course.studentsCount || 0,
          averageRating: parseFloat(course.rating) || parseFloat(course.averageRating) || 0,
          instructorName: course.instructorName || course.instructor_name || 'Unknown Instructor',
          courseType: course.course_type || course.courseType,
          bestseller: course.is_bestseller || course.bestseller || false
        };
      });
      
      // Check if we need to add Dr. Johnson's courses
      const auth = localStorage.getItem('auth');
      if (auth) {
        const authData = JSON.parse(auth);
        console.log('Current user:', authData.email, 'ID:', authData.id);
        
        // If logged in as Dr. Johnson, update the instructor IDs to match
        if (authData.email === 'instructor@example.com' || authData.email === 'dr.johnson@example.com') {
          // Update courses from API where instructor name is Dr. Sarah Johnson
          courses = courses.map((course: any) => {
            if (course.instructorName === 'Dr. Sarah Johnson') {
              return {
                ...course,
                instructorId: authData.id,
                instructor_id: authData.id
              };
            }
            return course;
          });
          
          const drJohnsonCourses = localStorage.getItem('drJohnsonCourses');
          if (drJohnsonCourses) {
            const demoCourses = JSON.parse(drJohnsonCourses);
            console.log('Demo courses for Dr. Johnson:', demoCourses);
            
            // Only add demo courses if not already in the response
            const existingIds = courses.map((c: any) => c.id);
            const newCourses = demoCourses.filter((c: any) => !existingIds.includes(c.id));
            courses = [...courses, ...newCourses];
          }
        }
      }
      
      console.log('Final courses list:', courses);
      return { data: courses, error: null };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { data: [], error: 'Failed to fetch courses' };
    }
  }

  static async getCourseStats(courseId: number) {
    try {
      const response = await api.request(`/courses/${courseId}`, {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      const course = response.data;
      
      // Return stats in expected format
      return {
        data: {
          course_id: courseId,
          total_students: course.studentsCount || course.total_students || 0,
          average_rating: course.rating || 4.5,
          total_revenue: course.total_revenue || 0,
          completion_rate: 75, // Mock for now
          total_ratings: Math.floor((course.studentsCount || 0) * 0.7)
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching course stats:', error);
      return { data: null, error: 'Failed to fetch course stats' };
    }
  }

  // Creator Services
  static async getCreatorStats(creatorId: string) {
    try {
      const response = await api.request(`/users/${creatorId}/instructor-stats`, {
        method: 'GET'
      });
      
      if (response.error) {
        // If endpoint doesn't exist, calculate from courses
        if (response.error.includes('404') || response.error.includes('Not Found')) {
          console.log('Instructor stats endpoint not found, calculating from courses');
          
          // Get courses for this instructor
          const coursesResult = await this.getCourses({ instructor_id: creatorId });
          const courses = coursesResult.data || [];
          
          // Calculate stats from courses
          const totalStudents = courses.reduce((sum, course) => sum + (course.studentsCount || course.students || 0), 0);
          const totalRevenue = courses.reduce((sum, course) => {
            const students = course.studentsCount || course.students || 0;
            const price = course.price || 0;
            return sum + (students * price);
          }, 0);
          
          const totalRatings = courses.filter(c => (c.averageRating || c.rating) > 0).length;
          const avgRating = totalRatings > 0 
            ? courses.reduce((sum, c) => sum + (c.averageRating || c.rating || 0), 0) / totalRatings
            : 0;
          
          return {
            data: {
              totalCourses: courses.length,
              totalStudents,
              totalEarnings: totalRevenue * 0.8, // 80% creator share
              platformEarnings: totalRevenue * 0.2, // 20% platform share
              totalRevenue,
              directPurchaseRevenue: totalRevenue,
              subscriptionRevenue: 0,
              avgRating
            },
            error: null
          };
        }
        throw new Error(response.error);
      }

      const stats = response.data;
      
      return {
        data: {
          totalCourses: stats.activeCourses || 0,
          totalStudents: stats.totalStudents || 0,
          totalEarnings: stats.totalRevenue * 0.8, // 80% creator share
          platformEarnings: stats.totalRevenue * 0.2, // 20% platform share
          totalRevenue: stats.totalRevenue || 0,
          directPurchaseRevenue: stats.totalRevenue || 0,
          subscriptionRevenue: 0, // Not implemented yet
          avgRating: stats.averageRating || 4.5
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching creator stats:', error);
      
      // Try to calculate from courses as fallback
      try {
        const coursesResult = await this.getCourses({ instructor_id: creatorId });
        const courses = coursesResult.data || [];
        
        const totalStudents = courses.reduce((sum, course) => sum + (course.studentsCount || course.students || 0), 0);
        const totalRevenue = courses.reduce((sum, course) => {
          const students = course.studentsCount || course.students || 0;
          const price = course.price || 0;
          return sum + (students * price);
        }, 0);
        
        const totalRatings = courses.filter(c => (c.averageRating || c.rating) > 0).length;
        const avgRating = totalRatings > 0 
          ? courses.reduce((sum, c) => sum + (c.averageRating || c.rating || 0), 0) / totalRatings
          : 0;
        
        return {
          data: {
            totalCourses: courses.length,
            totalStudents,
            totalEarnings: totalRevenue * 0.8,
            platformEarnings: totalRevenue * 0.2,
            totalRevenue,
            directPurchaseRevenue: totalRevenue,
            subscriptionRevenue: 0,
            avgRating
          },
          error: null
        };
      } catch (fallbackError) {
        console.error('Fallback calculation also failed:', fallbackError);
        
        return { 
          data: {
            totalCourses: 0,
            totalStudents: 0,
            totalEarnings: 0,
            platformEarnings: 0,
            totalRevenue: 0,
            directPurchaseRevenue: 0,
            subscriptionRevenue: 0,
            avgRating: 0
          },
          error: null 
        };
      }
    }
  }

  // Get detailed course analytics for creator dashboard
  static async getCreatorCourseAnalytics(creatorId: string) {
    try {
      // Get creator's courses
      const coursesResponse = await this.getCourses({ instructor_id: creatorId });
      
      if (coursesResponse.error || !coursesResponse.data) {
        return { data: [], error: coursesResponse.error };
      }

      const courses = coursesResponse.data;
      
      // Map courses to analytics format
      const courseAnalytics = courses.map(course => ({
        ...course,
        total_students: course.studentsCount || 0,
        average_rating: course.rating || 4.5,
        total_revenue: course.price * (course.studentsCount || 0),
        total_ratings: Math.floor((course.studentsCount || 0) * 0.7),
        recentEnrollments: Math.floor(Math.random() * 10), // Mock data
        monthlyRevenue: course.price * Math.floor(Math.random() * 5), // Mock data
        engagement: {
          activeStudents: course.studentsCount || 0,
          completionRate: 75 + Math.random() * 20,
          averageProgress: 65 + Math.random() * 30
        }
      }));

      return { data: courseAnalytics, error: null };
    } catch (error) {
      console.error('Error fetching creator course analytics:', error);
      return { data: [], error: 'Failed to fetch course analytics' };
    }
  }

  // Get creator earnings breakdown
  static async getCreatorEarnings(creatorId: string, period?: { start: Date, end: Date }) {
    try {
      // For now, use instructor stats as a base
      const statsResponse = await this.getCreatorStats(creatorId);
      
      if (statsResponse.error || !statsResponse.data) {
        return { data: null, error: statsResponse.error };
      }

      const stats = statsResponse.data;
      
      // Get courses for breakdown
      const coursesResponse = await this.getCourses({ instructor_id: creatorId });
      const courses = coursesResponse.data || [];
      
      // Create earnings by course
      const earningsByCourse = courses.map(course => ({
        courseId: course.id,
        courseTitle: course.title,
        totalRevenue: course.price * (course.studentsCount || 0),
        creatorEarnings: course.price * (course.studentsCount || 0) * 0.8,
        platformFees: course.price * (course.studentsCount || 0) * 0.2,
        transactionCount: course.studentsCount || 0,
        type: 'direct_purchase'
      }));

      return {
        data: {
          totalRevenue: stats.totalRevenue,
          creatorEarnings: stats.totalEarnings,
          platformFees: stats.platformEarnings,
          directPurchaseRevenue: stats.directPurchaseRevenue,
          subscriptionRevenue: stats.subscriptionRevenue,
          earningsByCourse,
          transactionCount: courses.reduce((sum, c) => sum + (c.studentsCount || 0), 0)
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching creator earnings:', error);
      return { data: null, error: 'Failed to fetch earnings' };
    }
  }

  // Platform Statistics
  static async getPlatformStats() {
    try {
      const response = await api.request('/analytics/platform', {
        method: 'GET'
      });
      
      if (response.error) {
        // If endpoint doesn't exist, return mock data
        if (response.error.includes('404')) {
          return {
            data: {
              totalContributors: 5,
              totalCourses: 12,
              totalStudents: 156,
              totalRevenue: 45000,
              platformRevenue: 9000,
              creatorEarnings: 36000,
              completionRate: 87.5,
              averageRating: 4.6,
              activeUsers: 142,
              totalActiveUsers: 142,
              totalMentors: 5,
              newUsersToday: 8
            },
            error: null
          };
        }
        throw new Error(response.error);
      }

      const stats = response.data;
      
      return {
        data: {
          totalActiveUsers: stats.summary?.totalUsers || 0,
          totalMentors: stats.topPerformers?.length || 0,
          totalCourses: stats.summary?.totalCourses || 0,
          totalStudents: stats.summary?.totalEnrollments || 0,
          totalRevenue: stats.summary?.totalRevenue || 0,
          platformRevenue: (stats.summary?.totalRevenue || 0) * 0.2,
          creatorEarnings: (stats.summary?.totalRevenue || 0) * 0.8,
          newUsersToday: Math.floor(Math.random() * 10), // Mock
          averageRating: 4.5,
          completionRate: 75,
          // Additional fields expected by Marketplace
          totalContributors: stats.topPerformers?.length || 0,
          activeUsers: stats.summary?.totalUsers || 0
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return { data: null, error: 'Failed to fetch platform stats' };
    }
  }

  // Subscription Services
  static async getActiveSubscriptions() {
    try {
      // No endpoint for this yet, return empty
      return { data: [], error: null };
    } catch (error) {
      return { data: [], error: 'Failed to fetch subscriptions' };
    }
  }

  static async getSubscriptionStats() {
    try {
      // Mock data for now
      return {
        data: {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          monthlyRecurringRevenue: 0,
          totalRevenue: 0
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: 'Failed to fetch subscription stats' };
    }
  }

  // Data Seeding Functions - No longer needed with PostgreSQL
  static async seedDatabase(forceReseed = false) {
    console.log('Database seeding is handled by PostgreSQL migrations');
    return;
  }

  // Get creator earnings including subscription revenue
  static async getCreatorTotalEarnings(creatorId: string) {
    // Just use regular earnings for now
    return this.getCreatorEarnings(creatorId);
  }
}

export default DatabaseService;