// Shared course types for consistency across components

export interface Lecture {
  id?: number;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  content?: string;
  videoUrl?: string;
  order: number;
}

export interface CourseForDisplay {
  id: number;
  title: string;
  description: string;
  students: number;
  rating: number;
  revenue: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  duration: string;
  lectures: number; // Number of lectures for display
  level: string;
  category: string;
  thumbnail: string;
  status: string;
  bestseller?: boolean;
  lastUpdated: string;
  features: string[];
  preview?: string;
  enrollmentType: string;
}

export interface CourseForEditor {
  id?: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  category: string;
  thumbnail?: string;
  status: 'draft' | 'active' | 'inactive';
  features: string[];
  enrollmentType: 'one-time' | 'subscription';
  lectures: Lecture[]; // Array of lecture objects for editing
}

export interface CreatorStats {
  totalCourses: number;
  totalStudents: number;
  totalEarnings: number;
  avgRating: number;
}

export interface StudentStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  certificatesEarned: number;
}