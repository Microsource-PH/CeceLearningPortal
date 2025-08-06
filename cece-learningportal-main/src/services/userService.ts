import api from './api';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  status: string;
  createdAt: string;
  lastLogin?: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  avatar?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalHours: number;
  certificates: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
}

class UserService {
  async getProfile(userId: string) {
    try {
      const response = await api.request(`/users/${userId}/profile`, {
        method: 'GET'
      });
      
      if (response.error) {
        // If endpoint doesn't exist, try alternative endpoint or return mock data
        if (response.error.includes('404')) {
          // Try the basic user endpoint instead
          const userResponse = await api.request(`/users/${userId}`, {
            method: 'GET'
          });
          
          if (userResponse.error && userResponse.error.includes('404')) {
            // Return mock profile data based on stored auth data
            const authData = localStorage.getItem('auth');
            if (authData) {
              const auth = JSON.parse(authData);
              return {
                data: {
                  id: auth.id,
                  fullName: auth.fullName,
                  email: auth.email,
                  bio: '',
                  location: '',
                  phoneNumber: '',
                  avatar: auth.avatar || null,
                  socialLinks: {
                    linkedin: '',
                    twitter: '',
                    github: ''
                  },
                  createdAt: new Date().toISOString()
                },
                error: null
              };
            }
          }
          
          return userResponse;
        }
        throw new Error(response.error);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch profile' 
      };
    }
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    try {
      const response = await api.request(`/users/${userId}/profile`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { 
        data: response.data, 
        error: null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: 'Failed to update profile' 
      };
    }
  }

  async changePassword(data: ChangePasswordDto) {
    const response = await api.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async getUserStats(userId: string) {
    try {
      const response = await api.request(`/users/${userId}/stats`, {
        method: 'GET'
      });
      
      if (response.error) {
        // Return default values if no stats exist
        return {
          data: {
            totalCourses: 0,
            completedCourses: 0,
            inProgressCourses: 0,
            totalHours: 0,
            certificates: 0,
            averageScore: 0,
            currentStreak: 0,
            longestStreak: 0
          },
          error: null
        };
      }
      
      return { 
        data: response.data, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch user stats' 
      };
    }
  }

  async getUserCertificates(userId: string) {
    try {
      const response = await api.request(`/users/${userId}/certificates`, {
        method: 'GET'
      });
      
      if (response.error) {
        // If endpoint doesn't exist, return empty certificates array
        if (response.error.includes('404')) {
          return {
            data: [],
            error: null
          };
        }
        throw new Error(response.error);
      }
      
      return { 
        data: response.data || [], 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return { 
        data: [], 
        error: null
      };
    }
  }

  async getActivityHistory(userId: string) {
    try {
      const response = await api.request(`/users/${userId}/activity`, {
        method: 'GET'
      });
      
      if (response.error) {
        // If endpoint doesn't exist, return empty activity array
        if (response.error.includes('404')) {
          return {
            data: [],
            error: null
          };
        }
        throw new Error(response.error);
      }
      
      return { 
        data: response.data || [], 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching activity history:', error);
      return { 
        data: [], 
        error: null
      };
    }
  }

  async uploadAvatar(file: File) {
    // In a real app, this would upload to a server
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock URL for the uploaded image
      const mockUrl = URL.createObjectURL(file);
      
      return { 
        data: { avatar: mockUrl }, 
        error: null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: 'Failed to upload avatar' 
      };
    }
  }

  async getNotificationPreferences() {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Return structure that matches NotificationSettings component
      return { 
        data: {
          email: {
            courseUpdates: true,
            newEnrollments: true,
            reviews: true,
            systemUpdates: false,
            marketing: false
          },
          inApp: {
            courseUpdates: true,
            newEnrollments: true,
            reviews: true,
            systemUpdates: true,
            marketing: true
          }
        }, 
        error: null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: 'Failed to fetch notification preferences' 
      };
    }
  }

  async updateNotificationPreferences(preferences: any) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { 
        data: preferences, 
        error: null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: 'Failed to update notification preferences' 
      };
    }
  }

  async getInstructorStats(userId: string) {
    try {
      const response = await api.request(`/users/${userId}/instructor-stats`, {
        method: 'GET'
      });
      
      if (response.error) {
        // Return default values if no stats exist
        return {
          data: {
            totalStudents: 0,
            activeCourses: 0,
            totalRevenue: 0,
            averageRating: 0,
            completionRate: 0,
            studentSatisfaction: 0,
            monthlyRevenue: []
          },
          error: null
        };
      }
      
      return { 
        data: response.data, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching instructor stats:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch instructor stats' 
      };
    }
  }

  async getAdminStats() {
    try {
      const response = await api.request('/admin/stats', {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { 
        data: response.data, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch admin stats' 
      };
    }
  }

  async downloadCertificate(certificateId: string) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would return a PDF or image URL
      // For now, we'll create a mock certificate download
      const mockCertificateUrl = `data:text/plain;charset=utf-8,Certificate ID: ${certificateId}\nThis is a mock certificate.\nIssued by: Cece Learning Portal`;
      
      return { 
        data: { url: mockCertificateUrl }, 
        error: null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: 'Failed to download certificate' 
      };
    }
  }
}

export const userService = new UserService();
export default userService;