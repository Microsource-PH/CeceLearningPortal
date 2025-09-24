import api from "./api";
import { 
  LearnerDashboard, 
  LearningActivity, 
  WeeklyGoal, 
  Achievement, 
  Leaderboard,
  CourseProgress,
  ActivityCompletionResult,
  LearningStreak
} from "../types/learning";

export const learningService = {
  async getDashboard(): Promise<{ data?: LearnerDashboard; error?: string }> {
    try {
      const response = await api.request('/learning/dashboard', {
        method: 'GET'
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch dashboard' };
    }
  },

  async getActivities(category?: string): Promise<{ data?: LearningActivity[]; error?: string }> {
    try {
      const params = category ? `?category=${category}` : '';
      const response = await api.request(`/learning/activities${params}`, {
        method: 'GET'
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch activities' };
    }
  },

  async getWeeklyGoals(): Promise<{ data?: WeeklyGoal[]; error?: string }> {
    try {
      const response = await api.request('/learning/weekly-goals', {
        method: 'GET'
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch weekly goals' };
    }
  },

  async createWeeklyGoal(goal: {
    title: string;
    description: string;
    category: string;
    target: number;
    unit: string;
    rewardPoints: number;
  }): Promise<{ data?: WeeklyGoal; error?: string }> {
    try {
      const response = await api.request('/learning/weekly-goals', {
        method: 'POST',
        data: goal
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to create goal' };
    }
  },

  async updateWeeklyGoal(goalId: string, updates: {
    title?: string;
    description?: string;
    target?: number;
    current?: number;
  }): Promise<{ data?: WeeklyGoal; error?: string }> {
    try {
      const response = await api.request(`/learning/weekly-goals/${goalId}`, {
        method: 'PUT',
        data: updates
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to update goal' };
    }
  },

  async completeActivity(activityId: string, completion: {
    score: number;
    timeSpentMinutes: number;
    completionStatus: 'completed' | 'partial' | 'skipped';
    additionalData?: Record<string, any>;
  }): Promise<{ data?: ActivityCompletionResult; error?: string }> {
    try {
      const response = await api.request(`/learning/activities/${activityId}/complete`, {
        method: 'POST',
        data: completion
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to complete activity' };
    }
  },

  async getAchievements(): Promise<{ data?: Achievement[]; error?: string }> {
    try {
      const response = await api.request('/learning/achievements', {
        method: 'GET'
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch achievements' };
    }
  },

  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<{ data?: Leaderboard; error?: string }> {
    try {
      const response = await api.request(`/learning/leaderboard?period=${period}`, {
        method: 'GET'
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch leaderboard' };
    }
  },

  async getCourseProgress(courseId: number): Promise<{ data?: CourseProgress; error?: string }> {
    try {
      const response = await api.request(`/learning/progress/${courseId}`, {
        method: 'GET'
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch course progress' };
    }
  },

  async updateCourseProgress(courseId: number, progress: {
    lessonId: number;
    isCompleted: boolean;
    timeSpentMinutes: number;
    quizScore?: number;
  }): Promise<{ data?: CourseProgress; error?: string }> {
    try {
      const response = await api.request(`/learning/progress/${courseId}/update`, {
        method: 'POST',
        data: progress
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to update progress' };
    }
  },

  async getLearningStreak(): Promise<{ data?: LearningStreak; error?: string }> {
    try {
      const response = await api.request('/learning/streak', {
        method: 'GET'
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch learning streak' };
    }
  }
};

export default learningService;