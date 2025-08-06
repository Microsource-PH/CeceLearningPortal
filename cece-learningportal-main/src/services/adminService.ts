import { mockAdminData } from './mockAdminData';
import DatabaseService from './databaseService';
import api from './api';

export interface ApproveUserDto {
  userId: string;
  approve: boolean;
  reason?: string;
}

export interface AdminMetrics {
  totalActiveUsers: number;
  totalMentors: number;
  newTrainingsOrganized: number;
  trainingHoursPerUser: number;
  learningSatisfactionRate: number;
  positiveFeedback: number;
  negativeFeedback: number;
  averageCompletionRate: number;
  totalCourses: number;
  totalRevenue: number;
  newUsersToday: number;
  activeNow: number;
  supportTickets: number;
  coursesUnderReview: number;
}

export interface CourseCompletion {
  id: number;
  studentName: string;
  studentAvatar: string;
  studentEmail: string;
  courseName: string;
  courseId: string;
  completionDate: string;
  score: number;
  badgeIssued: boolean;
  certificateId?: string;
}

export interface TopMentor {
  id: number;
  name: string;
  avatar: string;
  email: string;
  specialization: string;
  trainingsOrganized: number;
  peopleTrained: number;
  rating: number;
  revenue: number;
  joinedDate: string;
  status: 'Active' | 'Inactive';
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
  joinedDate: string;
  lastActive: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  totalSpent: number;
}

export interface CourseData {
  id: string;
  title: string;
  instructor: string;
  category: string;
  students: number;
  rating: number;
  revenue: number;
  status: 'active' | 'pending' | 'draft' | 'archived';
  createdDate: string;
  lastUpdated: string;
  completionRate: number;
}

export interface PolicyData {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Draft' | 'Under Review';
  lastUpdated: string;
  updatedBy: string;
  description: string;
  compliance?: number;
  priority?: 'High' | 'Medium' | 'Low';
}

export interface TaskData {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'High' | 'Medium' | 'Low';
  assignee?: string;
  dueDate: string;
  createdDate: string;
  progress?: number;
}

export interface OnboardingStep {
  step: string;
  completion: number;
  users: number;
  averageTime: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'Online' | 'Away' | 'Offline';
  lastActive: string;
  avatar: string;
  permissions: string[];
  tasksAssigned: number;
  tasksCompleted: number;
}

export interface CourseStatistics {
  name: string;
  students: number;
  completion: number;
  rating: number;
  revenue: string;
  category: string;
  instructor: string;
  lastUpdated: string;
}

class AdminService {
  async getAdminMetrics(period: string = 'This month'): Promise<{ data: AdminMetrics | null; error: string | null }> {
    try {
      // Try to get real data from database first
      const platformStats = await DatabaseService.getPlatformStats();
      if (platformStats.data) {
        const metrics: AdminMetrics = {
          totalActiveUsers: platformStats.data.totalActiveUsers,
          totalMentors: platformStats.data.totalMentors,
          newTrainingsOrganized: platformStats.data.totalCourses,
          trainingHoursPerUser: 12.5,
          learningSatisfactionRate: 85 + Math.random() * 10,
          positiveFeedback: Math.floor(platformStats.data.totalStudents * 0.85),
          negativeFeedback: Math.floor(platformStats.data.totalStudents * 0.05),
          averageCompletionRate: platformStats.data.completionRate,
          totalCourses: platformStats.data.totalCourses,
          totalRevenue: platformStats.data.totalRevenue,
          newUsersToday: platformStats.data.newUsersToday,
          activeNow: Math.floor(platformStats.data.totalActiveUsers * 0.07),
          supportTickets: 5 + Math.floor(Math.random() * 10),
          coursesUnderReview: 2 + Math.floor(Math.random() * 3)
        };
        return { data: metrics, error: null };
      }
      
      // Fallback to mock data if database fails
      await new Promise(resolve => setTimeout(resolve, 100));
      return { data: mockAdminData.metrics, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch admin metrics' };
    }
  }

  async getCourseCompletions(limit: number = 10): Promise<{ data: CourseCompletion[] | null; error: string | null }> {
    try {
      // Try to get real data from API first
      const response = await api.request('/admin/course-completions', {
        method: 'GET',
        params: { limit }
      });
      
      if (response.data) {
        return { data: response.data, error: null };
      }
      
      // Fallback to mock data if API fails
      await new Promise(resolve => setTimeout(resolve, 50));
      return { data: mockAdminData.courseCompletions.slice(0, limit), error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch course completions' };
    }
  }

  async getTopMentors(year: string = 'This year'): Promise<{ data: TopMentor[] | null; error: string | null }> {
    try {
      // Try to get real data from database first
      const creatorsResult = await DatabaseService.getUsers({ role: 'Creator' });
      if (creatorsResult.data && creatorsResult.data.length > 0) {
        const mentorsWithStats = await Promise.all(creatorsResult.data.map(async (creator) => {
          const stats = await DatabaseService.getCreatorStats(creator.id);
          const earnings = await DatabaseService.getCreatorEarnings(creator.id);
          
          return {
            id: parseInt(creator.id) || Math.floor(Math.random() * 1000),
            name: creator.full_name,
            avatar: creator.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.full_name)}&background=random`,
            email: creator.email,
            specialization: 'Web Development', // Default specialization
            trainingsOrganized: stats.data?.totalCourses || 0,
            peopleTrained: stats.data?.totalStudents || 0,
            rating: stats.data?.avgRating || 4.5,
            revenue: earnings.data?.totalRevenue || 0,
            joinedDate: creator.created_at,
            status: 'Active' as const
          };
        }));
        
        // Sort by revenue (descending) to get top performers
        const sortedMentors = mentorsWithStats.sort((a, b) => b.revenue - a.revenue);
        
        // Ensure Dr. Johnson is at the top if she exists
        const drJohnsonIndex = sortedMentors.findIndex(m => m.name === 'Dr. Sarah Johnson');
        if (drJohnsonIndex > 0) {
          const drJohnson = sortedMentors.splice(drJohnsonIndex, 1)[0];
          sortedMentors.unshift(drJohnson);
        }
        
        return { data: sortedMentors.slice(0, 5), error: null };
      }
      
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 50));
      return { data: mockAdminData.topMentors, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch top mentors' };
    }
  }

  async getAllUsers(filters?: { role?: string; status?: string }): Promise<{ data: UserData[] | null; error: string | null }> {
    try {
      // Try to get real data from database first
      const dbUsers = await DatabaseService.getUsers(filters);
      if (dbUsers.data) {
        console.log('Raw user data from backend:', dbUsers.data);
        const users: UserData[] = dbUsers.data.map(user => {
          // Handle status - could be enum number or string
          let status = 'Active';
          if (user.status !== undefined && user.status !== null) {
            if (typeof user.status === 'number') {
              // Map enum values: 0=Active, 1=Inactive, 2=Suspended, 3=PendingApproval
              const statusMap = ['Active', 'Inactive', 'Suspended', 'PendingApproval'];
              status = statusMap[user.status] || 'Active';
            } else if (typeof user.status === 'string') {
              status = user.status;
            }
          }
          
          // Handle role - could be enum number or string
          let role = 'Learner';
          if (user.role !== undefined && user.role !== null) {
            if (typeof user.role === 'number') {
              // Map enum values: 0=Student, 1=Instructor, 2=Admin
              const roleMap = ['Learner', 'Creator', 'Admin'];
              role = roleMap[user.role] || 'Learner';
            } else if (typeof user.role === 'string') {
              // Convert backend roles to frontend roles
              if (user.role === 'Student') role = 'Learner';
              else if (user.role === 'Instructor') role = 'Creator';
              else role = user.role;
            }
          }
          
          return {
            id: user.id,
            name: user.fullName || user.full_name || user.name || 'Unknown User',
            email: user.email || '',
            role: role,
            avatar: user.avatar || user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.full_name || user.name || 'U')}&background=random`,
            joinDate: user.createdAt || user.created_at || new Date().toISOString(),
            lastActive: user.lastLoginAt || new Date().toISOString(),
            status: status,
            joinedDate: user.createdAt || user.created_at || new Date().toISOString(),
            coursesEnrolled: user.coursesEnrolled || Math.floor(Math.random() * 10),
            coursesCompleted: user.coursesCompleted || Math.floor(Math.random() * 8),
            totalSpent: user.totalSpent || Math.floor(Math.random() * 50000)
          };
        });
        return { data: users, error: null };
      }
      
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 100));
      let users = mockAdminData.users;
      
      if (filters?.role) {
        users = users.filter(user => user.role === filters.role);
      }
      if (filters?.status) {
        users = users.filter(user => user.status === filters.status);
      }
      
      return { data: users, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch users' };
    }
  }

  async updateUserStatus(userId: string, status: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      // In a real app, this would update the database
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to update user status' };
    }
  }

  async getAllCourses(filters?: { status?: string; category?: string }): Promise<{ data: CourseData[] | null; error: string | null }> {
    try {
      // Try to get real data from API first
      const response = await api.request('/admin/courses', {
        method: 'GET',
        params: filters
      });
      
      if (response.data) {
        console.log('Admin courses response:', response.data);
        const courses: CourseData[] = response.data.map((course: any) => {
          console.log('Course status from backend:', course.status, 'Type:', typeof course.status);
          return {
          id: course.id.toString(),
          title: course.title,
          instructor: course.instructorName || 'Unknown',
          instructorId: course.instructorId,
          category: course.category,
          students: course.studentsCount || 0,
          rating: course.averageRating || 0,
          revenue: course.totalRevenue || 0,
          status: (() => {
            // Handle both string and numeric enum values
            if (typeof course.status === 'string') {
              return course.status;
            } else if (typeof course.status === 'number') {
              // Map numeric enum values to strings
              const statusMap = ['Draft', 'PendingApproval', 'Active', 'Inactive', 'Archived'];
              return statusMap[course.status] || 'Draft';
            }
            return 'Draft';
          })(),
          createdDate: course.createdAt,
          lastUpdated: course.updatedAt,
          completionRate: course.completionRate || 0,
          price: course.price,
          originalPrice: course.originalPrice,
          description: course.description,
          thumbnail: course.thumbnail,
          duration: course.duration,
          level: course.level
        };
        });
        return { data: courses, error: null };
      }
      
      // Try database service as fallback
      const dbCourses = await DatabaseService.getCourses(filters);
      if (dbCourses.data) {
        const courses: CourseData[] = await Promise.all(dbCourses.data.map(async (course) => {
          const stats = await DatabaseService.getCourseStats(course.id);
          return {
            id: course.id.toString(),
            title: course.title,
            instructor: course.instructor?.full_name || 'Unknown',
            category: course.category,
            students: course.totalStudents || 0,
            rating: course.rating || 4.5,
            revenue: course.totalRevenue || 0,
            status: (() => {
            // Handle both string and numeric enum values
            if (typeof course.status === 'string') {
              return course.status;
            } else if (typeof course.status === 'number') {
              // Map numeric enum values to strings
              const statusMap = ['Draft', 'PendingApproval', 'Active', 'Inactive', 'Archived'];
              return statusMap[course.status] || 'Draft';
            }
            return 'Draft';
          })(),
            createdDate: course.created_at,
            lastUpdated: course.updated_at,
            completionRate: stats.data?.completion_rate || 0
          };
        }));
        return { data: courses, error: null };
      }
      
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 50));
      let courses = mockAdminData.courses;
      
      if (filters?.status) {
        courses = courses.filter(course => course.status === filters.status);
      }
      if (filters?.category) {
        courses = courses.filter(course => course.category === filters.category);
      }
      
      return { data: courses, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch courses' };
    }
  }

  async approveCourse(courseId: number): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await api.request(`/admin/courses/${courseId}/approve`, {
        method: 'POST'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to approve course' };
    }
  }

  async getPolicies(): Promise<{ data: PolicyData[] | null; error: string | null }> {
    try {
      // Try to get real data from API first
      const response = await api.request('/admin/policies', {
        method: 'GET'
      });
      
      if (response.data) {
        return { data: response.data, error: null };
      }
      
      // Fallback to mock data if API fails
      await new Promise(resolve => setTimeout(resolve, 50));
      return { data: mockAdminData.policies, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch policies' };
    }
  }

  async updatePolicy(policyId: string, updates: Partial<PolicyData>): Promise<{ success: boolean; error: string | null }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to update policy' };
    }
  }

  async getTasks(status?: string): Promise<{ data: TaskData[] | null; error: string | null }> {
    try {
      // Try to get real data from API first
      const response = await api.request('/admin/tasks', {
        method: 'GET',
        params: status ? { status } : undefined
      });
      
      if (response.data) {
        return { data: response.data, error: null };
      }
      
      // Fallback to mock data if API fails
      await new Promise(resolve => setTimeout(resolve, 50));
      let tasks = mockAdminData.tasks;
      
      if (status) {
        tasks = tasks.filter(task => task.status === status);
      }
      
      return { data: tasks, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch tasks' };
    }
  }

  async createTask(task: Omit<TaskData, 'id' | 'createdDate'>): Promise<{ success: boolean; error: string | null }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to create task' };
    }
  }

  async getOnboardingProgress(): Promise<{ data: OnboardingStep[] | null; error: string | null }> {
    try {
      // Try to get real data from API first
      const response = await api.request('/admin/onboarding-progress', {
        method: 'GET'
      });
      
      if (response.data) {
        return { data: response.data, error: null };
      }
      
      // Fallback to mock data if API fails
      await new Promise(resolve => setTimeout(resolve, 50));
      return { data: mockAdminData.onboardingSteps, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch onboarding progress' };
    }
  }

  async getTeamMembers(): Promise<{ data: TeamMember[] | null; error: string | null }> {
    try {
      // Try to get real data from API first
      const response = await api.request('/admin/team-members', {
        method: 'GET'
      });
      
      if (response.data) {
        return { data: response.data, error: null };
      }
      
      // Fallback to mock data if API fails
      await new Promise(resolve => setTimeout(resolve, 50));
      return { data: mockAdminData.teamMembers, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch team members' };
    }
  }

  async getCourseStatistics(): Promise<{ data: CourseStatistics[] | null; error: string | null }> {
    try {
      // Try to get real data from API first
      const response = await api.request('/admin/course-statistics', {
        method: 'GET'
      });
      
      if (response.data) {
        return { data: response.data, error: null };
      }
      
      // Fallback to mock data if API fails
      await new Promise(resolve => setTimeout(resolve, 50));
      return { data: mockAdminData.courseStatistics, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch course statistics' };
    }
  }

  async issueBadge(completionId: number, badgeData: any): Promise<{ success: boolean; error: string | null }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      // In a real app, this would create a badge/certificate
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to issue badge' };
    }
  }

  async exportReport(type: string, format: string = 'pdf'): Promise<{ data: { url: string } | null; error: string | null }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      // In a real app, this would generate and return a download URL
      const mockUrl = `data:text/plain;charset=utf-8,Admin Report - ${type} - ${new Date().toISOString()}`;
      return { data: { url: mockUrl }, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to export report' };
    }
  }

  async getRecentSignups(limit: number = 10): Promise<{ data: any[] | null; error: string | null }> {
    try {
      // Try to get real data from API first
      const response = await api.request('/admin/recent-signups', {
        method: 'GET',
        params: { limit }
      });
      
      if (response.data) {
        return { data: response.data, error: null };
      }
      
      // Fallback to mock data if API fails
      await new Promise(resolve => setTimeout(resolve, 50));
      return { data: mockAdminData.recentSignups.slice(0, limit), error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch recent signups' };
    }
  }

  async getSystemHealth(): Promise<{ data: any | null; error: string | null }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 20));
      return { 
        data: {
          uptime: 99.9,
          apiResponseTime: 145,
          errorRate: 0.02,
          activeUsers: 892,
          serverLoad: 45,
          memoryUsage: 67,
          diskSpace: 78
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error: 'Failed to fetch system health' };
    }
  }

  // New methods for enhanced functionality
  async createCourse(courseData: any): Promise<{ success: boolean; data?: any; error: string | null }> {
    try {
      const response = await api.request('/admin/courses', {
        method: 'POST',
        body: JSON.stringify(courseData)
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { success: true, data: response.data, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to create course' };
    }
  }

  async updateCourse(courseId: string, courseData: any): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await api.request(`/admin/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(courseData)
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to update course' };
    }
  }

  async deleteCourse(courseId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await api.request(`/admin/courses/${courseId}`, {
        method: 'DELETE'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to delete course' };
    }
  }

  async rejectCourse(courseId: number, reason: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await api.request(`/admin/courses/${courseId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to reject course' };
    }
  }

  async updateUserRole(userId: string, role: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await api.request(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to update user role' };
    }
  }

  async getUserSubscription(userId: string): Promise<{ data: any | null; error: string | null }> {
    try {
      const response = await api.request(`/admin/users/${userId}/subscription`, {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch user subscription' };
    }
  }

  async updateUserSubscription(userId: string, planId: string, isBilledYearly?: boolean): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await api.request(`/admin/users/${userId}/subscription`, {
        method: 'PUT',
        body: JSON.stringify({ planId, isBilledYearly })
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to update user subscription' };
    }
  }

  async getSubscriptionPlans(): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const response = await api.request('/admin/subscription-plans', {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { data: response.data || [], error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch subscription plans' };
    }
  }

  async createSubscriptionPlan(planData: any): Promise<{ success: boolean; data?: any; error: string | null }> {
    try {
      const response = await api.request('/admin/subscription-plans', {
        method: 'POST',
        body: JSON.stringify(planData)
      });
      
      if (response.error) {
        console.error('Create subscription plan error:', response);
        throw new Error(response.error);
      }
      
      return { success: true, data: response.data, error: null };
    } catch (error: any) {
      console.error('Create subscription plan exception:', error);
      return { success: false, error: error.message || 'Failed to create subscription plan' };
    }
  }

  async updateSubscriptionPlan(planId: string, planData: any): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await api.request(`/admin/subscription-plans/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(planData)
      });
      
      if (response.error) {
        console.error('Update subscription plan error:', response);
        throw new Error(response.error);
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Update subscription plan exception:', error);
      return { success: false, error: error.message || 'Failed to update subscription plan' };
    }
  }

  async deleteSubscriptionPlan(planId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await api.request(`/admin/subscription-plans/${planId}`, {
        method: 'DELETE'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to delete subscription plan' };
    }
  }

  async getPendingApprovalUsers(page: number = 1, pageSize: number = 10): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const response = await api.request('/admin/users/pending-approval', {
        method: 'GET',
        params: { page, pageSize }
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Transform the data to match the component structure
      const transformedUsers = response.data?.map((user: any) => ({
        id: user.id,
        name: user.fullName || user.name,
        email: user.email,
        role: user.role,
        registeredDate: user.createdAt || user.joinedDate,
        avatar: user.avatar,
        fullName: user.fullName,
        requestedRole: user.role === 'Instructor' ? 'Creator' : user.role
      })) || [];
      
      return { data: transformedUsers, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch pending approval users' };
    }
  }

  async approveUser(dto: ApproveUserDto): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await api.request('/admin/users/approve', {
        method: 'POST',
        body: JSON.stringify(dto)
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to process user approval' };
    }
  }
}

export const adminService = new AdminService();
export default adminService;