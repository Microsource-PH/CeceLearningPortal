import { UserProfile, UserStats } from './userService';

// Mock user profiles for different roles
export const mockUserProfiles: Record<string, UserProfile> = {
  'student-user': {
    id: 'student-user',
    email: 'student@example.com',
    fullName: 'John Smith',
    role: 'Learner',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
    bio: 'Passionate learner focused on web development and data science. Currently pursuing advanced React patterns and machine learning fundamentals.',
    location: 'San Francisco, CA',
    phoneNumber: '+1 (555) 123-4567',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johnsmith',
      twitter: 'https://twitter.com/johnsmith',
      github: 'https://github.com/johnsmith'
    },
    status: 'Active',
    createdAt: '2024-01-15T08:00:00Z',
    lastLogin: '2025-01-25T10:30:00Z'
  },
  'instructor-user': {
    id: 'instructor-user',
    email: 'instructor@example.com',
    fullName: 'Dr. Sarah Johnson',
    role: 'Creator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format',
    bio: 'Senior Software Engineer with 10+ years of experience. Specializing in React, Node.js, and cloud architecture. Passionate about teaching and mentoring.',
    location: 'New York, NY',
    phoneNumber: '+1 (555) 987-6543',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/drsarahjohnson',
      twitter: 'https://twitter.com/sarahcodes',
      github: 'https://github.com/sarahjohnson'
    },
    status: 'Active',
    createdAt: '2023-06-10T08:00:00Z',
    lastLogin: '2025-01-25T09:00:00Z'
  },
  'admin-user': {
    id: 'admin-user',
    email: 'admin@example.com',
    fullName: 'Michael Chen',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
    bio: 'Platform administrator and technical lead. Ensuring smooth operations and the best learning experience for all users.',
    location: 'Seattle, WA',
    phoneNumber: '+1 (555) 555-5555',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/michaelchen',
      twitter: 'https://twitter.com/mchen_admin',
      github: 'https://github.com/mchen'
    },
    status: 'Active',
    createdAt: '2023-01-01T08:00:00Z',
    lastLogin: '2025-01-25T08:00:00Z'
  }
};

// Mock user stats
export const mockUserStats: Record<string, UserStats> = {
  'student-user': {
    totalCourses: 15,
    completedCourses: 12,
    inProgressCourses: 3,
    totalHours: 156,
    certificates: 8,
    averageScore: 85,
    currentStreak: 7,
    longestStreak: 21
  },
  'instructor-user': {
    totalCourses: 8,
    completedCourses: 0,
    inProgressCourses: 0,
    totalHours: 0,
    certificates: 0,
    averageScore: 0,
    currentStreak: 0,
    longestStreak: 0
  },
  'admin-user': {
    totalCourses: 5,
    completedCourses: 5,
    inProgressCourses: 0,
    totalHours: 45,
    certificates: 3,
    averageScore: 92,
    currentStreak: 3,
    longestStreak: 15
  }
};

// Mock certificates
export const mockCertificates = {
  'student-user': [
    {
      id: 'cert-1',
      title: 'Advanced React Development',
      issueDate: '2024-12-15T08:00:00Z',
      credentialId: 'REACT-ADV-2024-001',
      validUntil: '2026-12-15T08:00:00Z',
      issuer: 'Cece Learning Portal',
      courseId: 'course-react-advanced',
      grade: 'A+',
      skills: ['React Hooks', 'Context API', 'Performance Optimization']
    },
    {
      id: 'cert-2',
      title: 'JavaScript Fundamentals',
      issueDate: '2024-11-20T08:00:00Z',
      credentialId: 'JS-FUND-2024-002',
      issuer: 'Cece Learning Portal',
      courseId: 'course-js-fundamentals',
      grade: 'A',
      skills: ['ES6+', 'Async Programming', 'DOM Manipulation']
    },
    {
      id: 'cert-3',
      title: 'Database Design & SQL',
      issueDate: '2024-10-10T08:00:00Z',
      credentialId: 'DB-SQL-2024-003',
      issuer: 'Cece Learning Portal',
      courseId: 'course-database-design',
      grade: 'A',
      skills: ['SQL', 'Database Design', 'Query Optimization']
    },
    {
      id: 'cert-4',
      title: 'Python for Data Science',
      issueDate: '2024-09-05T08:00:00Z',
      credentialId: 'PY-DS-2024-004',
      validUntil: '2026-09-05T08:00:00Z',
      issuer: 'Cece Learning Portal',
      courseId: 'course-python-ds',
      grade: 'B+',
      skills: ['Python', 'Pandas', 'NumPy', 'Data Visualization']
    }
  ],
  'instructor-user': [],
  'admin-user': [
    {
      id: 'cert-5',
      title: 'Platform Administration',
      issueDate: '2023-03-01T08:00:00Z',
      credentialId: 'ADMIN-2023-001',
      issuer: 'Cece Learning Portal',
      courseId: 'course-admin-training',
      grade: 'Pass',
      skills: ['User Management', 'Content Moderation', 'Analytics']
    }
  ]
};

// Mock activity history
export const mockActivityHistory = {
  'student-user': [
    {
      id: 'act-1',
      type: 'lesson_finished',
      title: 'Completed "React Hooks Deep Dive" lesson',
      date: '2025-01-25T09:00:00Z',
      courseId: 'course-react-advanced',
      details: { lessonId: 'lesson-hooks', duration: 45 }
    },
    {
      id: 'act-2',
      type: 'course_completed',
      title: 'Completed "Advanced React Development" course',
      date: '2025-01-24T16:00:00Z',
      courseId: 'course-react-advanced',
      details: { finalScore: 92, certificateId: 'cert-1' }
    },
    {
      id: 'act-3',
      type: 'certificate_earned',
      title: 'Earned certificate for "Advanced React Development"',
      date: '2025-01-24T16:30:00Z',
      courseId: 'course-react-advanced',
      details: { certificateId: 'cert-1' }
    },
    {
      id: 'act-4',
      type: 'enrollment',
      title: 'Enrolled in "Machine Learning Basics"',
      date: '2025-01-23T10:00:00Z',
      courseId: 'course-ml-basics',
      details: { price: 79.99 }
    },
    {
      id: 'act-5',
      type: 'lesson_finished',
      title: 'Completed "Introduction to Neural Networks" lesson',
      date: '2025-01-22T14:00:00Z',
      courseId: 'course-ml-basics',
      details: { lessonId: 'lesson-nn-intro', duration: 60 }
    }
  ],
  'instructor-user': [
    {
      id: 'act-6',
      type: 'course_published',
      title: 'Published "Advanced React Patterns & Performance"',
      date: '2025-01-20T08:00:00Z',
      courseId: 'course-react-patterns',
      details: { students: 0, price: 89 }
    },
    {
      id: 'act-7',
      type: 'content_updated',
      title: 'Updated course content for "JavaScript Fundamentals"',
      date: '2025-01-19T15:00:00Z',
      courseId: 'course-js-fundamentals',
      details: { lessonsUpdated: 3 }
    },
    {
      id: 'act-8',
      type: 'review_received',
      title: 'Received 5-star review on "JavaScript Fundamentals"',
      date: '2025-01-18T12:00:00Z',
      courseId: 'course-js-fundamentals',
      details: { rating: 5, studentId: 'student-123' }
    }
  ],
  'admin-user': [
    {
      id: 'act-9',
      type: 'user_approved',
      title: 'Approved instructor application for Jane Doe',
      date: '2025-01-25T07:00:00Z',
      details: { userId: 'user-jane-doe', role: 'Instructor' }
    },
    {
      id: 'act-10',
      type: 'course_reviewed',
      title: 'Reviewed and approved "Python Advanced Topics"',
      date: '2025-01-24T11:00:00Z',
      courseId: 'course-python-advanced',
      details: { status: 'approved' }
    },
    {
      id: 'act-11',
      type: 'platform_update',
      title: 'Updated platform security settings',
      date: '2025-01-23T16:00:00Z',
      details: { settings: ['2FA', 'Password Policy'] }
    }
  ]
};

// Mock notification preferences
export const mockNotificationPreferences = {
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
};

// Mock instructor stats
export const mockInstructorStats = {
  totalStudents: 1247,
  activeCourses: 8,
  totalRevenue: 12450,
  averageRating: 4.8,
  completionRate: 87,
  studentSatisfaction: 92,
  monthlyRevenue: [
    { month: 'Jan', revenue: 2450 },
    { month: 'Feb', revenue: 3200 },
    { month: 'Mar', revenue: 2800 },
    { month: 'Apr', revenue: 3550 }
  ]
};

// Mock admin stats
export const mockAdminStats = {
  totalUsers: 5432,
  newUsersToday: 47,
  activeCourses: 234,
  coursesUnderReview: 5,
  platformRevenue: 145000,
  supportTickets: 23,
  openTickets: 8,
  systemHealth: {
    uptime: 99.9,
    apiResponseTime: 145,
    errorRate: 0.02,
    activeUsers: 892
  }
};