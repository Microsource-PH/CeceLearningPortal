import api from './api';

export interface LessonProgress {
  id: number;
  lessonId: number;
  courseId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number;
  timeSpent: number; // in minutes
  lastAccessedAt: string;
  completedAt?: string;
  quizScore?: number;
  notes?: string;
}

export interface CourseProgress {
  id: number;
  courseId: number;
  userId: string;
  overallProgress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
  totalTimeSpent: number; // in minutes
  currentLessonId?: number;
  lessonsCompleted: number;
  totalLessons: number;
  certificateEarned: boolean;
  lastAccessedAt: string;
  streak: number; // consecutive days
  averageQuizScore?: number;
}

export interface LearningStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  notStartedCourses: number;
  totalTimeSpent: number; // in minutes
  averageProgress: number;
  currentStreak: number;
  longestStreak: number;
  certificatesEarned: number;
  averageQuizScore: number;
  totalLessonsCompleted: number;
  learningGoalProgress: number;
  weeklyLearningTime: number; // this week
  monthlyLearningTime: number; // this month
}

export interface LearningGoal {
  id: number;
  userId: string;
  type: 'courses_per_month' | 'hours_per_week' | 'lessons_per_day' | 'certification_target';
  target: number;
  current: number;
  deadline?: string;
  isActive: boolean;
  createdAt: string;
}

class LearningTrackingService {
  // Course Progress Management
  async getCourseProgress(courseId: number): Promise<{ data: CourseProgress | null; error: string | null }> {
    try {
      const response = await api.request<CourseProgress>(`/learning/courses/${courseId}/progress`, {
        method: 'GET'
      });
      
      if (response.error) {
        // If endpoint doesn't exist, return mock progress data
        if (response.error.includes('404')) {
          return {
            data: {
              id: 1,
              courseId,
              userId: 'current-user',
              overallProgress: 0,
              status: 'not_started',
              enrolledAt: new Date().toISOString(),
              totalTimeSpent: 0,
              lessonsCompleted: 0,
              totalLessons: 10,
              certificateEarned: false,
              lastAccessedAt: new Date().toISOString(),
              streak: 0
            },
            error: null
          };
        }
        throw new Error(response.error);
      }
      
      return { data: response.data || null, error: null };
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch course progress' 
      };
    }
  }

  async updateCourseProgress(courseId: number, progressData: Partial<CourseProgress>): Promise<{ data: CourseProgress | null; error: string | null }> {
    try {
      const response = await api.request<CourseProgress>(`/learning/courses/${courseId}/progress`, {
        method: 'PUT',
        body: JSON.stringify(progressData)
      });
      
      if (response.error) {
        // Mock successful update
        if (response.error.includes('404')) {
          return {
            data: {
              id: 1,
              courseId,
              userId: 'current-user',
              overallProgress: progressData.overallProgress || 0,
              status: progressData.status || 'in_progress',
              enrolledAt: new Date().toISOString(),
              totalTimeSpent: progressData.totalTimeSpent || 0,
              lessonsCompleted: progressData.lessonsCompleted || 0,
              totalLessons: 10,
              certificateEarned: false,
              lastAccessedAt: new Date().toISOString(),
              streak: progressData.streak || 0,
              ...progressData
            },
            error: null
          };
        }
        throw new Error(response.error);
      }
      
      return { data: response.data || null, error: null };
    } catch (error) {
      console.error('Error updating course progress:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update course progress' 
      };
    }
  }

  // Lesson Progress Management
  async updateLessonProgress(lessonId: number, progressData: Partial<LessonProgress>): Promise<{ data: LessonProgress | null; error: string | null }> {
    try {
      const response = await api.request<LessonProgress>(`/learning/lessons/${lessonId}/progress`, {
        method: 'PUT',
        body: JSON.stringify(progressData)
      });
      
      if (response.error) {
        // Mock successful update
        if (response.error.includes('404')) {
          return {
            data: {
              id: 1,
              lessonId,
              courseId: progressData.courseId || 1,
              status: progressData.status || 'completed',
              progressPercentage: progressData.progressPercentage || 100,
              timeSpent: progressData.timeSpent || 0,
              lastAccessedAt: new Date().toISOString(),
              completedAt: progressData.status === 'completed' ? new Date().toISOString() : undefined,
              ...progressData
            },
            error: null
          };
        }
        throw new Error(response.error);
      }
      
      return { data: response.data || null, error: null };
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update lesson progress' 
      };
    }
  }

  // Learning Statistics
  async getLearningStats(): Promise<{ data: LearningStats | null; error: string | null }> {
    try {
      const response = await api.request<LearningStats>('/learning/stats', {
        method: 'GET'
      });
      
      if (response.error) {
        // Return mock learning stats
        if (response.error.includes('404')) {
          return {
            data: {
              totalCourses: 5,
              completedCourses: 2,
              inProgressCourses: 2,
              notStartedCourses: 1,
              totalTimeSpent: 1440, // 24 hours
              averageProgress: 65,
              currentStreak: 7,
              longestStreak: 15,
              certificatesEarned: 2,
              averageQuizScore: 87,
              totalLessonsCompleted: 45,
              learningGoalProgress: 80,
              weeklyLearningTime: 480, // 8 hours this week
              monthlyLearningTime: 1800 // 30 hours this month
            },
            error: null
          };
        }
        throw new Error(response.error);
      }
      
      return { data: response.data || null, error: null };
    } catch (error) {
      console.error('Error fetching learning stats:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch learning stats' 
      };
    }
  }

  // Progress Calculation Algorithm
  calculateCourseProgress(lessons: LessonProgress[]): number {
    if (lessons.length === 0) return 0;
    
    const totalProgress = lessons.reduce((sum, lesson) => sum + lesson.progressPercentage, 0);
    return Math.round(totalProgress / lessons.length);
  }

  // Completion Tracking Algorithm
  async markLessonComplete(lessonId: number, courseId: number, timeSpent: number, quizScore?: number): Promise<{ data: any; error: string | null }> {
    try {
      // 1. Update lesson progress
      const lessonResult = await this.updateLessonProgress(lessonId, {
        status: 'completed',
        progressPercentage: 100,
        timeSpent,
        quizScore,
        completedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString()
      });

      if (lessonResult.error) {
        return { data: null, error: lessonResult.error };
      }

      // 2. Get current course progress
      const courseProgressResult = await this.getCourseProgress(courseId);
      if (courseProgressResult.error) {
        return { data: null, error: courseProgressResult.error };
      }

      const currentProgress = courseProgressResult.data;
      if (!currentProgress) {
        return { data: null, error: 'Course progress not found' };
      }

      // 3. Calculate new course progress
      const newLessonsCompleted = currentProgress.lessonsCompleted + 1;
      const newOverallProgress = Math.round((newLessonsCompleted / currentProgress.totalLessons) * 100);
      const newTotalTimeSpent = currentProgress.totalTimeSpent + timeSpent;
      
      // 4. Determine if course is completed
      const isCompleted = newLessonsCompleted >= currentProgress.totalLessons;
      const newStatus = isCompleted ? 'completed' : 'in_progress';

      // 5. Update course progress
      const updatedCourseProgress = await this.updateCourseProgress(courseId, {
        lessonsCompleted: newLessonsCompleted,
        overallProgress: newOverallProgress,
        totalTimeSpent: newTotalTimeSpent,
        status: newStatus,
        completedAt: isCompleted ? new Date().toISOString() : undefined,
        lastAccessedAt: new Date().toISOString(),
        currentLessonId: lessonId,
        certificateEarned: isCompleted
      });

      // 6. Update learning streak
      await this.updateLearningStreak();

      return {
        data: {
          lessonProgress: lessonResult.data,
          courseProgress: updatedCourseProgress.data,
          courseCompleted: isCompleted,
          certificateEarned: isCompleted
        },
        error: null
      };
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to mark lesson complete'
      };
    }
  }

  // Streak Tracking
  async updateLearningStreak(): Promise<{ data: number | null; error: string | null }> {
    try {
      const response = await api.request<{ streak: number }>('/learning/streak', {
        method: 'POST',
        body: JSON.stringify({ date: new Date().toISOString() })
      });
      
      if (response.error) {
        // Mock streak update
        if (response.error.includes('404')) {
          // Store streak in localStorage as fallback
          const lastActivity = localStorage.getItem('lastLearningActivity');
          const currentStreak = localStorage.getItem('currentStreak') || '0';
          const today = new Date().toDateString();
          
          if (lastActivity !== today) {
            const newStreak = lastActivity === new Date(Date.now() - 86400000).toDateString() 
              ? parseInt(currentStreak) + 1 
              : 1;
            
            localStorage.setItem('lastLearningActivity', today);
            localStorage.setItem('currentStreak', newStreak.toString());
            
            return { data: newStreak, error: null };
          }
          
          return { data: parseInt(currentStreak), error: null };
        }
        throw new Error(response.error);
      }
      
      return { data: response.data?.streak || null, error: null };
    } catch (error) {
      console.error('Error updating learning streak:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update learning streak' 
      };
    }
  }

  // Learning Goals
  async setLearningGoal(goal: Omit<LearningGoal, 'id' | 'userId' | 'current' | 'createdAt'>): Promise<{ data: LearningGoal | null; error: string | null }> {
    try {
      const response = await api.request<LearningGoal>('/learning/goals', {
        method: 'POST',
        body: JSON.stringify(goal)
      });
      
      if (response.error) {
        // Mock goal creation
        if (response.error.includes('404')) {
          const newGoal: LearningGoal = {
            id: Date.now(),
            userId: 'current-user',
            current: 0,
            createdAt: new Date().toISOString(),
            ...goal
          };
          
          // Store in localStorage as fallback
          const goals = JSON.parse(localStorage.getItem('learningGoals') || '[]');
          goals.push(newGoal);
          localStorage.setItem('learningGoals', JSON.stringify(goals));
          
          return { data: newGoal, error: null };
        }
        throw new Error(response.error);
      }
      
      return { data: response.data || null, error: null };
    } catch (error) {
      console.error('Error setting learning goal:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to set learning goal' 
      };
    }
  }

  async getLearningGoals(): Promise<{ data: LearningGoal[] | null; error: string | null }> {
    try {
      const response = await api.request<LearningGoal[]>('/learning/goals', {
        method: 'GET'
      });
      
      if (response.error) {
        // Return goals from localStorage as fallback
        if (response.error.includes('404')) {
          const goals = JSON.parse(localStorage.getItem('learningGoals') || '[]');
          return { data: goals, error: null };
        }
        throw new Error(response.error);
      }
      
      return { data: response.data || [], error: null };
    } catch (error) {
      console.error('Error fetching learning goals:', error);
      return { 
        data: [], 
        error: null
      };
    }
  }
}

export default new LearningTrackingService();