const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
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
  async register(email: string, password: string, fullName: string, role: string = 'Student') {
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