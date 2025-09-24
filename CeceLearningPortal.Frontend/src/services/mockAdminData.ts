export const mockAdminData = {
  metrics: {
    totalActiveUsers: 4739,
    totalMentors: 13,
    newTrainingsOrganized: 28,
    trainingHoursPerUser: 12.50,
    learningSatisfactionRate: 87.30,
    positiveFeedback: 432,
    negativeFeedback: 38,
    averageCompletionRate: 73.00,
    totalCourses: 156,
    totalRevenue: 1329000,
    newUsersToday: 12,
    activeNow: 347,
    supportTickets: 8,
    coursesUnderReview: 3
  },

  courseCompletions: [
    {
      id: 1,
      studentName: "Sarah Johnson",
      studentAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face&auto=format",
      studentEmail: "sarah.j@example.com",
      courseName: "React Advanced Patterns",
      courseId: "course-001",
      completionDate: "2025-01-25",
      score: 95,
      badgeIssued: false,
      certificateId: ""
    },
    {
      id: 2,
      studentName: "Mike Chen",
      studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format",
      studentEmail: "mike.chen@example.com",
      courseName: "JavaScript Fundamentals",
      courseId: "course-002",
      completionDate: "2025-01-24",
      score: 88,
      badgeIssued: true,
      certificateId: "CERT-2025-0124"
    },
    {
      id: 3,
      studentName: "Emma Davis",
      studentAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format",
      studentEmail: "emma.d@example.com",
      courseName: "UI/UX Design Principles",
      courseId: "course-003",
      completionDate: "2025-01-24",
      score: 92,
      badgeIssued: false,
      certificateId: ""
    },
    {
      id: 4,
      studentName: "Alex Rivera",
      studentAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format",
      studentEmail: "alex.r@example.com",
      courseName: "Node.js Backend Development",
      courseId: "course-004",
      completionDate: "2025-01-23",
      score: 91,
      badgeIssued: true,
      certificateId: "CERT-2025-0123"
    },
    {
      id: 5,
      studentName: "Lisa Wang",
      studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face&auto=format",
      studentEmail: "lisa.w@example.com",
      courseName: "Python for Data Science",
      courseId: "course-005",
      completionDate: "2025-01-23",
      score: 97,
      badgeIssued: false,
      certificateId: ""
    }
  ],

  topMentors: [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face&auto=format",
      email: "instructor@example.com",
      specialization: "Web Development",
      trainingsOrganized: 5,
      peopleTrained: 3250,
      rating: 4.90,
      revenue: 875000,
      joinedDate: "2023-06-10",
      status: "Active" as const
    },
    {
      id: 2,
      name: "Prof. Michael Torres",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format",
      email: "m.torres@instructor.com",
      specialization: "Data Science",
      trainingsOrganized: 5,
      peopleTrained: 892,
      rating: 4.70,
      revenue: 169550,
      joinedDate: "2023-08-15",
      status: "Active" as const
    },
    {
      id: 3,
      name: "Jennifer Kim",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format",
      email: "j.kim@instructor.com",
      specialization: "UI/UX Design",
      trainingsOrganized: 6,
      peopleTrained: 356,
      rating: 4.60,
      revenue: 87600,
      joinedDate: "2023-07-20",
      status: "Active" as const
    },
    {
      id: 4,
      name: "David Martinez",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face&auto=format",
      email: "d.martinez@instructor.com",
      specialization: "Mobile Development",
      trainingsOrganized: 4,
      peopleTrained: 243,
      rating: 4.50,
      revenue: 65400,
      joinedDate: "2023-09-05",
      status: "Active" as const
    }
  ],

  users: [
    {
      id: "user-001",
      name: "John Smith",
      email: "john.smith@example.com",
      role: "Learner",
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format",
      joinedDate: "2024-01-15",
      lastActive: "2025-01-25",
      coursesEnrolled: 15,
      coursesCompleted: 12,
      totalSpent: 450
    },
    {
      id: "user-002",
      name: "Dr. Sarah Johnson",
      email: "instructor@example.com",
      role: "Creator",
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face&auto=format",
      joinedDate: "2023-06-10",
      lastActive: "2025-01-25",
      coursesEnrolled: 0,
      coursesCompleted: 0,
      totalSpent: 0
    },
    {
      id: "user-003",
      name: "Emily Chen",
      email: "emily.chen@example.com",
      role: "Learner",
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face&auto=format",
      joinedDate: "2024-03-20",
      lastActive: "2025-01-24",
      coursesEnrolled: 8,
      coursesCompleted: 6,
      totalSpent: 280
    },
    {
      id: "user-004",
      name: "Michael Chen",
      email: "admin@example.com",
      role: "Admin",
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format",
      joinedDate: "2023-01-01",
      lastActive: "2025-01-25",
      coursesEnrolled: 5,
      coursesCompleted: 5,
      totalSpent: 0
    },
    {
      id: "user-005",
      name: "Robert Brown",
      email: "robert.b@example.com",
      role: "Learner",
      status: "Suspended",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face&auto=format",
      joinedDate: "2024-05-10",
      lastActive: "2025-01-10",
      coursesEnrolled: 3,
      coursesCompleted: 1,
      totalSpent: 120
    }
  ],

  courses: [
    {
      id: "course-001",
      title: "React Advanced Patterns & Performance",
      instructor: "Dr. Sarah Johnson",
      category: "Web Development",
      students: 347,
      rating: 4.80,
      revenue: 89450,
      status: "active" as const,
      createdDate: "2024-01-10",
      lastUpdated: "2025-01-20",
      completionRate: 92
    },
    {
      id: "course-002",
      title: "JavaScript Fundamentals for Beginners",
      instructor: "Dr. Sarah Johnson",
      category: "Programming",
      students: 456,
      rating: 4.90,
      revenue: 68400,
      status: "active" as const,
      createdDate: "2023-11-15",
      lastUpdated: "2025-01-15",
      completionRate: 89
    },
    {
      id: "course-003",
      title: "UI/UX Design Principles",
      instructor: "Jennifer Kim",
      category: "Design",
      students: 256,
      rating: 4.70,
      revenue: 38400,
      status: "active" as const,
      createdDate: "2024-02-20",
      lastUpdated: "2025-01-18",
      completionRate: 85
    },
    {
      id: "course-004",
      title: "Advanced Python Machine Learning",
      instructor: "Prof. Michael Torres",
      category: "Data Science",
      students: 0,
      rating: 0.00,
      revenue: 0,
      status: "pending" as const,
      createdDate: "2025-01-22",
      lastUpdated: "2025-01-22",
      completionRate: 0
    },
    {
      id: "course-005",
      title: "Mobile App Development with Flutter",
      instructor: "David Martinez",
      category: "Mobile Development",
      students: 143,
      rating: 4.60,
      revenue: 32580,
      status: "active" as const,
      createdDate: "2024-04-10",
      lastUpdated: "2025-01-10",
      completionRate: 78
    }
  ],

  policies: [
    {
      id: "policy-001",
      name: "Course Completion Requirements",
      type: "Learning Policy",
      status: "Active" as const,
      lastUpdated: "2025-01-23",
      updatedBy: "Michael Chen",
      description: "Defines minimum requirements for course completion certificates",
      compliance: 98
    },
    {
      id: "policy-002",
      name: "Assessment Guidelines",
      type: "Learning Policy",
      status: "Active" as const,
      lastUpdated: "2025-01-18",
      updatedBy: "Admin Team",
      description: "Standards for creating and evaluating assessments",
      compliance: 95
    },
    {
      id: "policy-003",
      name: "Data Privacy Policy",
      type: "Compliance",
      status: "Active" as const,
      lastUpdated: "2025-01-10",
      updatedBy: "Legal Team",
      description: "GDPR and data protection compliance guidelines",
      compliance: 100,
      priority: "High" as const
    },
    {
      id: "policy-004",
      name: "Content Moderation Guidelines",
      type: "Platform Policy",
      status: "Under Review" as const,
      lastUpdated: "2025-01-24",
      updatedBy: "Content Team",
      description: "Guidelines for appropriate content and community standards",
      compliance: 88,
      priority: "Medium" as const
    }
  ],

  tasks: [
    {
      id: "task-001",
      title: "Review new course submissions",
      description: "Review and approve 5 pending course submissions",
      status: "pending" as const,
      priority: "High" as const,
      assignee: "John Administrator",
      dueDate: "2025-01-26",
      createdDate: "2025-01-24"
    },
    {
      id: "task-002",
      title: "Update user permissions",
      description: "Update permission settings for new instructors",
      status: "pending" as const,
      priority: "Medium" as const,
      assignee: "Sarah Manager",
      dueDate: "2025-01-27",
      createdDate: "2025-01-23"
    },
    {
      id: "task-003",
      title: "Generate monthly report",
      description: "Prepare January 2025 platform analytics report",
      status: "pending" as const,
      priority: "Low" as const,
      dueDate: "2025-01-30",
      createdDate: "2025-01-20"
    },
    {
      id: "task-004",
      title: "Course content audit",
      description: "Audit top 10 courses for quality standards",
      status: "in_progress" as const,
      priority: "High" as const,
      assignee: "John Administrator",
      dueDate: "2025-01-28",
      createdDate: "2025-01-22",
      progress: 75
    },
    {
      id: "task-005",
      title: "User feedback analysis",
      description: "Analyze Q4 2024 user feedback and suggestions",
      status: "in_progress" as const,
      priority: "Medium" as const,
      assignee: "Sarah Manager",
      dueDate: "2025-01-29",
      createdDate: "2025-01-21",
      progress: 40
    },
    {
      id: "task-006",
      title: "Security audit",
      description: "Complete quarterly security audit",
      status: "completed" as const,
      priority: "High" as const,
      assignee: "Mike Moderator",
      dueDate: "2025-01-23",
      createdDate: "2025-01-15"
    }
  ],

  onboardingSteps: [
    {
      step: "Account Setup",
      completion: 92,
      users: 5012,
      averageTime: "5 minutes"
    },
    {
      step: "Profile Completion",
      completion: 78,
      users: 4234,
      averageTime: "12 minutes"
    },
    {
      step: "First Course Enrollment",
      completion: 65,
      users: 3528,
      averageTime: "2 days"
    },
    {
      step: "First Assessment",
      completion: 43,
      users: 2337,
      averageTime: "5 days"
    },
    {
      step: "First Certificate",
      completion: 28,
      users: 1521,
      averageTime: "14 days"
    }
  ],

  teamMembers: [
    {
      id: "admin-001",
      name: "Michael Chen",
      role: "Super Admin",
      email: "michael@admin.com",
      status: "Online" as const,
      lastActive: "Now",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format",
      permissions: ["all"],
      tasksAssigned: 8,
      tasksCompleted: 6
    },
    {
      id: "admin-002",
      name: "Sarah Williams",
      role: "Content Manager",
      email: "sarah@admin.com",
      status: "Online" as const,
      lastActive: "5m ago",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face&auto=format",
      permissions: ["content", "users", "courses"],
      tasksAssigned: 12,
      tasksCompleted: 10
    },
    {
      id: "admin-003",
      name: "James Rodriguez",
      role: "User Support Lead",
      email: "james@admin.com",
      status: "Away" as const,
      lastActive: "1h ago",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face&auto=format",
      permissions: ["users", "support"],
      tasksAssigned: 6,
      tasksCompleted: 5
    },
    {
      id: "admin-004",
      name: "Lisa Chen",
      role: "Moderator",
      email: "lisa@admin.com",
      status: "Online" as const,
      lastActive: "10m ago",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format",
      permissions: ["content", "moderation"],
      tasksAssigned: 4,
      tasksCompleted: 4
    }
  ],

  courseStatistics: [
    {
      name: "React Advanced Patterns",
      students: 347,
      completion: 92,
      rating: 4.90,
      revenue: "₱5,009,200",
      category: "Web Development",
      instructor: "Dr. Sarah Johnson",
      lastUpdated: "2 days ago"
    },
    {
      name: "JavaScript Fundamentals",
      students: 456,
      completion: 89,
      rating: 4.80,
      revenue: "₱7,210,560",
      category: "Programming",
      instructor: "Dr. Sarah Johnson",
      lastUpdated: "1 week ago"
    },
    {
      name: "Python for Data Science",
      students: 276,
      completion: 91,
      rating: 4.90,
      revenue: "₱6,303,360",
      category: "Data Science",
      instructor: "Prof. Michael Torres",
      lastUpdated: "3 days ago"
    },
    {
      name: "UI/UX Design Principles",
      students: 256,
      completion: 85,
      rating: 4.70,
      revenue: "₱2,540,160",
      category: "Design",
      instructor: "Jennifer Kim",
      lastUpdated: "1 week ago"
    },
    {
      name: "Node.js Backend Development",
      students: 343,
      completion: 88,
      rating: 4.80,
      revenue: "₱5,184,480",
      category: "Backend Development",
      instructor: "Dr. Sarah Johnson",
      lastUpdated: "4 days ago"
    }
  ],

  recentSignups: [
    {
      id: "signup-001",
      name: "Alice Cooper",
      email: "alice@example.com",
      joined: "2025-01-25T08:00:00Z",
      status: "Active",
      role: "Learner",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face&auto=format"
    },
    {
      id: "signup-002",
      name: "Bob Wilson",
      email: "bob@example.com",
      joined: "2025-01-25T03:00:00Z",
      status: "In Progress",
      role: "Learner",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format"
    },
    {
      id: "signup-003",
      name: "Carol Brown",
      email: "carol@example.com",
      joined: "2025-01-24T10:00:00Z",
      status: "Completed",
      role: "Learner",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format"
    },
    {
      id: "signup-004",
      name: "David Lee",
      email: "david@example.com",
      joined: "2025-01-23T15:00:00Z",
      status: "Pending",
      role: "Creator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face&auto=format"
    },
    {
      id: "signup-005",
      name: "Eva Martinez",
      email: "eva@example.com",
      joined: "2025-01-23T09:00:00Z",
      status: "Active",
      role: "Learner",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face&auto=format"
    }
  ]
};