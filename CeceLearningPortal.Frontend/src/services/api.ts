const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  setToken(token: string | null) {
    this.token = token;
  }

  setRefreshToken(refreshToken: string | null) {
    this.refreshToken = refreshToken;
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: this.token,
          refreshToken: this.refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.accessToken);
        this.setRefreshToken(data.refreshToken);

        // Update localStorage
        const savedAuth = localStorage.getItem('auth');
        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          authData.accessToken = data.accessToken;
          authData.refreshToken = data.refreshToken;
          localStorage.setItem('auth', JSON.stringify(authData));
        }

        return data.accessToken;
      } else {
        // Refresh failed, user needs to log in again
        this.setToken(null);
        this.setRefreshToken(null);
        localStorage.removeItem('auth');
        // Redirect to login or emit an event for the AuthContext to handle
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
        return null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && this.refreshToken && !this.isRefreshing) {
        if (this.isRefreshing) {
          // If already refreshing, wait for it to complete
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => {
            // Retry the original request with new token
            return this.request(url, options);
          });
        }

        this.isRefreshing = true;

        try {
          const newToken = await this.refreshAccessToken();
          this.isRefreshing = false;
          this.processQueue(null, newToken);

          if (newToken) {
            // Retry the original request with new token
            return this.request(url, options);
          } else {
            return { error: 'Authentication failed. Please log in again.' };
          }
        } catch (refreshError) {
          this.isRefreshing = false;
          this.processQueue(refreshError, null);
          return { error: 'Authentication failed. Please log in again.' };
        }
      }

      if (!response.ok) {
        let error = `HTTP error! status: ${response.status}`;
        let errorResponse: any = { error };
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              console.error('API Error Response:', errorData);
              console.error('Full error details:', {
                message: errorData.message,
                error: errorData.error,
                innerError: errorData.innerError,
                allData: errorData
              });

              // Handle validation errors specifically
              if (errorData.errors) {
                console.error('Validation errors:', errorData.errors);
                errorResponse = {
                  error: 'Validation failed',
                  response: errorData
                };
              } else {
                error = errorData.message || errorData.error || error;
                errorResponse = { error, ...errorData };
              }
            } catch {
              console.error('API Error Text:', errorText);
              error = errorText;
              errorResponse = { error };
            }
          }
        } catch {
          // If we can't read the response, use the default error
        }
        return errorResponse;
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Auth endpoints
  async register(email: string, password: string, fullName: string, role: string = 'Learner') {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, role })
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Course endpoints
  async getCourses(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/courses${queryString}`);
  }

  async getCourse(id: number) {
    return this.request(`/courses/${id}`);
  }

  async createCourse(courseData: any) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: number, courseData: any) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: number) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // Enrollment endpoints
  async enrollInCourse(courseId: number) {
    return this.request(`/enrollments/courses/${courseId}`, {
      method: 'POST',
    });
  }

  async getMyEnrollments() {
    return this.request('/enrollments');
  }

  async updateLessonProgress(lessonId: number, status: string) {
    return this.request(`/enrollments/lessons/${lessonId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // User endpoints
  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(data: any) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserStats(id: string) {
    return this.request(`/users/${id}/stats`);
  }

  async getUserCertificates(id: string) {
    return this.request(`/users/${id}/certificates`);
  }

  async getActivityHistory(id: string) {
    return this.request(`/users/${id}/activity`);
  }

  async uploadAvatar(formData: FormData) {
    return this.request('/users/avatar', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary
      },
      body: formData,
    });
  }
}

export const api = new ApiService();
export default api;