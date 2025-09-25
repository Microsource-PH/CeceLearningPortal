import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CreatorDashboard } from "@/components/CourseManagement/CreatorDashboard";
import { CourseEditorWithFeatures } from "@/components/CourseManagement/CourseEditorWithFeatures";
import { CourseCreatorGHL } from "@/components/CourseManagement/CourseCreatorGHL";
import { CourseAnalytics } from "@/components/Creator/CourseAnalytics";
import { EarningsReport } from "@/components/Creator/EarningsReport";
import { CourseForDisplay, CourseForEditor } from "@/types/course";
import { useAuth } from "@/contexts/AuthContext";
import { formatPHP } from "@/utils/currency";
import DatabaseService from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";
import { useEnrollment } from "@/hooks/useEnrollment";
import { formatRating, getCourseThumbnail } from "@/utils/format";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptionPlans";
import { useUserId } from "@/hooks/useUserId";
import studentService from "@/services/studentService";
import subscriptionService from "@/services/subscriptionService";
import analyticsService from "@/services/analyticsService";
import courseService from "@/services/courseService";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/services/api";
import {
  Users,
  Star,
  BookOpen,
  Eye,
  ThumbsUp,
  TrendingUp,
  Award,
  Calendar,
  MapPin,
  ExternalLink,
  Mail,
  Linkedin,
  Github,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Filter,
  Search,
  Heart,
  Play,
  Clock,
  Download,
  Crown,
  GraduationCap,
  PlayCircle,
  ArrowRight,
  Plus,
  Edit,
  BarChart3,
  Zap,
  Database,
  MessageCircle,
  Video,
  Globe,
  Send,
} from "lucide-react";

const Marketplace = () => {
  // Local light types to improve safety within this component
  type PlatformStatsLite = {
    totalContributors: number;
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    platformRevenue: number;
    creatorEarnings: number;
    activeSubscriptions?: number;
    topPerformers?: any[];
    popularCategories?: any[];
    revenueByMonth?: any[];
    subscriptionMetrics?: any;
  } | null;

  type CourseLike = {
    id: number;
    title: string;
    price?: number;
    studentsCount?: number;
    students?: number;
    total_students?: number;
    rating?: number;
    averageRating?: number;
    average_rating?: number;
    instructor?: string;
    instructorName?: string;
    instructorId?: string;
    instructor_id?: string;
    status?: string;
    isPublished?: boolean;
    publishedAt?: string;
    courseType?: string;
    thumbnail?: string;
    category?: string;
  };
  const { user } = useAuth();
  const userId = useUserId();
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams();
  const editCourseId = params.id ? parseInt(params.id) : null;
  const { enrollInCourse } = useEnrollment();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCourseEditor, setShowCourseEditor] = useState(false);
  const [showGHLCreator, setShowGHLCreator] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseForDisplay | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Data from database
  const [courses, setCourses] = useState<any[]>([]);
  const [unfilteredCourses, setUnfilteredCourses] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStatsLite>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [creatorStats, setCreatorStats] = useState<any>(null);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();

    // Refresh data when page gains focus
    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener("focus", handleFocus);

    // Also refresh every 30 seconds if page is active
    const refreshInterval = setInterval(() => {
      if (!document.hidden) {
        fetchData();
      }
    }, 30000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(refreshInterval);
    };
  }, [user, userId]);

  // Handle editing course from route
  useEffect(() => {
    if (editCourseId && (courses.length > 0 || unfilteredCourses.length > 0)) {
      // Try to find in filtered courses first
      let courseToEdit = courses.find((c) => c.id === editCourseId);

      // If not found and user is creator, check unfiltered courses
      if (!courseToEdit && user?.role === "Creator") {
        courseToEdit = unfilteredCourses.find((c) => c.id === editCourseId);
      }

      if (courseToEdit) {
        handleEditCourse(editCourseId);
      }
    }
  }, [editCourseId, courses, unfilteredCourses, user]);

  // Separate effect to handle instructor loading after courses are loaded
  useEffect(() => {
    const loadInstructors = async () => {
      if (courses.length === 0) {
        console.log("No courses available yet, skipping instructor loading");
        return;
      }

      console.log("Loading instructors, courses available:", courses.length);

      try {
        // First try to get real data from platform analytics
        const analyticsResult = await analyticsService.getPlatformAnalytics();
        console.log("Platform analytics for instructors:", analyticsResult);

        if (
          analyticsResult.data?.topPerformers &&
          analyticsResult.data.topPerformers.length > 0
        ) {
          // Use real data from analytics
          const instructorsData = await Promise.all(
            analyticsResult.data.topPerformers.map(async (performer: any) => {
              // Get instructor's actual courses from backend
              let instructorCourses: any[] = [];
              try {
                // Try to get instructor's courses via API
                const coursesResult = await courseService.getCourses({
                  instructorId: performer.instructorId,
                });

                if (
                  Array.isArray(coursesResult.data) &&
                  coursesResult.data.length > 0
                ) {
                  instructorCourses = coursesResult.data as any[];
                  console.log(
                    `Fetched ${instructorCourses.length} courses for ${performer.instructorName}`
                  );
                } else {
                  // Fallback to local courses
                  instructorCourses = courses.filter(
                    (c) =>
                      c.instructorId === performer.instructorId ||
                      c.instructor_id === performer.instructorId ||
                      c.instructorName === performer.instructorName
                  );
                  console.log(
                    `Using local courses for ${performer.instructorName}: ${instructorCourses.length} courses`
                  );
                }
              } catch (error) {
                console.log(
                  "Failed to fetch instructor courses, using local data:",
                  error
                );
                instructorCourses = courses.filter(
                  (c) =>
                    c.instructorId === performer.instructorId ||
                    c.instructor_id === performer.instructorId ||
                    c.instructorName === performer.instructorName
                );
              }

              return {
                id: performer.instructorId,
                name: performer.instructorName,
                title: "Professional Instructor",
                location: "Philippines",
                joinDate: new Date().toISOString(),
                avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${performer.instructorName}`,
                verified: performer.totalCourses > 2,
                rating: performer.averageRating || 0, // Use real rating from backend
                totalCourses: performer.totalCourses, // Real from backend
                totalStudents: performer.totalStudents, // Real from backend
                totalRevenue: performer.totalRevenue || 0, // Real from backend
                creatorEarnings: (performer.totalRevenue || 0) * 0.8, // Real calculation
                platformShare: (performer.totalRevenue || 0) * 0.2, // Real calculation
                courses: instructorCourses.slice(0, 4).map((course) => ({
                  id: course.id,
                  title: course.title,
                  price: course.price || 0,
                  students:
                    course.studentsCount ||
                    course.students ||
                    course.total_students ||
                    0,
                  rating:
                    course.averageRating ||
                    course.rating ||
                    course.average_rating ||
                    0,
                  status: course.status || "active",
                })),
              };
            })
          );

          console.log(
            "Setting instructors from analytics with real data:",
            instructorsData
          );
          setInstructors(instructorsData);
        } else {
          // Fallback: Group courses by instructor
          console.log("No analytics data, using course-based grouping");
          const instructorMap = new Map();

          courses.forEach((course) => {
            const instructorName =
              course.instructorName ||
              course.instructor ||
              "Unknown Instructor";
            const instructorId =
              course.instructorId || course.instructor_id || instructorName;

            if (!instructorMap.has(instructorName)) {
              instructorMap.set(instructorName, {
                id: instructorId,
                name: instructorName,
                courses: [],
              });
            }

            instructorMap.get(instructorName).courses.push(course);
          });

          console.log("Instructor map:", instructorMap);

          const instructorsData = Array.from(instructorMap.values()).map(
            (instructor) => {
              const instructorCourses = instructor.courses;

              // Calculate stats from courses
              const totalStudents = instructorCourses.reduce(
                (sum, c) => sum + (c.studentsCount || c.students || 0),
                0
              );
              const totalRevenue = instructorCourses.reduce(
                (sum, c) =>
                  sum + (c.studentsCount || c.students || 0) * (c.price || 0),
                0
              );
              const avgRating =
                instructorCourses.length > 0
                  ? instructorCourses.reduce(
                      (sum, c) => sum + (c.averageRating || c.rating || 0),
                      0
                    ) / instructorCourses.length
                  : 0;

              return {
                id: instructor.id,
                name: instructor.name,
                title: "Professional Instructor",
                location: "Philippines",
                joinDate: new Date().toISOString(),
                avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${instructor.name}`,
                verified: instructorCourses.length > 2,
                rating: avgRating,
                totalCourses: instructorCourses.length,
                totalStudents,
                totalRevenue: totalRevenue, // Keep as number
                creatorEarnings: totalRevenue * 0.8, // Keep as number
                platformShare: totalRevenue * 0.2, // Keep as number
                courses: instructorCourses.map((course) => ({
                  id: course.id,
                  title: course.title,
                  price: course.price || 0,
                  students: course.studentsCount || course.students || 0,
                  rating: course.averageRating || course.rating || 4.5,
                  status: course.status || "active",
                })),
              };
            }
          );

          console.log("Setting instructors from courses:", instructorsData);
          setInstructors(instructorsData.filter((i) => i.totalCourses > 0));
        }
      } catch (error) {
        console.error("Error loading instructors:", error);
        // Still try to show instructors from courses even if analytics fails
        const instructorMap = new Map();

        courses.forEach((course) => {
          const instructorName =
            course.instructorName || course.instructor || "Unknown Instructor";
          const instructorId =
            course.instructorId || course.instructor_id || instructorName;

          if (!instructorMap.has(instructorName)) {
            instructorMap.set(instructorName, {
              id: instructorId,
              name: instructorName,
              courses: [],
            });
          }

          instructorMap.get(instructorName).courses.push(course);
        });

        const instructorsData = Array.from(instructorMap.values()).map(
          (instructor) => {
            const instructorCourses = instructor.courses;

            const totalStudents = instructorCourses.reduce(
              (sum, c) => sum + (c.studentsCount || c.students || 0),
              0
            );
            const totalRevenue = instructorCourses.reduce(
              (sum, c) =>
                sum + (c.studentsCount || c.students || 0) * (c.price || 0),
              0
            );
            const avgRating =
              instructorCourses.length > 0
                ? instructorCourses.reduce(
                    (sum, c) => sum + (c.averageRating || c.rating || 0),
                    0
                  ) / instructorCourses.length
                : 0;

            return {
              id: instructor.id,
              name: instructor.name,
              title: "Professional Instructor",
              location: "Philippines",
              joinDate: new Date().toISOString(),
              avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${instructor.name}`,
              verified: instructorCourses.length > 2,
              rating: avgRating,
              totalCourses: instructorCourses.length,
              totalStudents,
              totalRevenue: totalRevenue,
              creatorEarnings: totalRevenue * 0.8,
              platformShare: totalRevenue * 0.2,
              courses: instructorCourses.map((course) => ({
                id: course.id,
                title: course.title,
                price: course.price || 0,
                students: course.studentsCount || course.students || 0,
                rating: course.averageRating || course.rating || 4.5,
                status: course.status || "active",
              })),
            };
          }
        );

        setInstructors(instructorsData.filter((i) => i.totalCourses > 0));
      }
    };

    loadInstructors();
  }, [courses]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Try to seed database if needed
      await DatabaseService.seedDatabase();

      // Only fetch users if the current user is an admin
      let allUsers: any[] = [];
      if (user?.role === "Admin") {
        const usersResult = await DatabaseService.getUsers();
        allUsers = Array.isArray(usersResult.data)
          ? (usersResult.data as any[])
          : [];
      }

      // Fetch courses with stats
      const coursesResult = await DatabaseService.getCourses();
      const list: unknown = coursesResult.data ?? [];
      if (Array.isArray(list)) {
        // Ensure courses have proper instructor IDs
        const coursesWithInstructorIds = (list as CourseLike[]).map(
          (course) => {
            // Ensure instructorId is set properly
            if (!course.instructorId) {
              // Try to find instructor by name or email
              const instructorName = course.instructorName || course.instructor;
              if (instructorName) {
                const instructor = allUsers.find(
                  (u) =>
                    u.fullName === instructorName ||
                    u.name === instructorName ||
                    (u.email === "instructor@example.com" &&
                      instructorName === "Dr. Sarah Johnson")
                );
                if (instructor) {
                  course.instructorId = instructor.id;
                }
              }
            }

            // Also ensure instructor_id is set (for backward compatibility)
            if (!course.instructor_id && course.instructorId) {
              course.instructor_id = course.instructorId;
            }

            // Ensure instructorName is set
            if (!course.instructorName && !course.instructor) {
              course.instructorName = "Dr. Sarah Johnson"; // Default instructor
            }

            return course;
          }
        );
        // Store all courses for creator dashboard
        setUnfilteredCourses(coursesWithInstructorIds as any[]);

        // Debug: Check all statuses
        console.log(
          "All course statuses:",
          coursesWithInstructorIds.map((c) => ({
            title: c.title,
            status: c.status,
            isPublished: c.isPublished,
            publishedAt: c.publishedAt,
          }))
        );

        // Only show Active courses in the public marketplace
        const activeCourses = (coursesWithInstructorIds as CourseLike[]).filter(
          (course) => {
            const isActive =
              course.status === "Active" ||
              course.status === "active" ||
              course.status === "Published" ||
              course.status === "published";
            if (!isActive && course.isPublished) {
              console.log(
                "Published course with non-active status:",
                course.title,
                "Status:",
                course.status
              );
            }
            return isActive;
          }
        );

        setCourses(activeCourses as any[]);
        console.log(
          "Active courses found:",
          activeCourses.length,
          "out of",
          coursesWithInstructorIds.length
        );
        console.log("Courses with instructor IDs:", coursesWithInstructorIds);
        console.log("Sample course:", coursesWithInstructorIds[0]);
        console.log(
          "Course types:",
          coursesWithInstructorIds.map((c) => ({
            title: c.title,
            courseType: c.courseType,
          }))
        );
      }

      // Fetch platform statistics - Use analytics service for admins
      if (user?.role === "Admin") {
        const analyticsResult = await analyticsService.getPlatformAnalytics();
        if (analyticsResult.data) {
          // Convert analytics format to platform stats format
          setPlatformStats({
            totalContributors: analyticsResult.data.topPerformers.length,
            totalCourses: analyticsResult.data.summary.totalCourses,
            totalStudents: analyticsResult.data.summary.totalEnrollments,
            totalRevenue: analyticsResult.data.summary.totalRevenue,
            platformRevenue: analyticsResult.data.summary.totalRevenue * 0.2,
            creatorEarnings: analyticsResult.data.summary.totalRevenue * 0.8,
            activeSubscriptions:
              analyticsResult.data.summary.activeSubscriptions,
            topPerformers: analyticsResult.data.topPerformers,
            popularCategories: analyticsResult.data.popularCategories,
            revenueByMonth: analyticsResult.data.revenueByMonth,
            subscriptionMetrics: analyticsResult.data.subscriptionMetrics,
          });
        }
      } else {
        // For non-admins, use the database service
        const platformResult = await DatabaseService.getPlatformStats();
        if (platformResult.data) {
          setPlatformStats(platformResult.data);
        }
      }

      // Fetch user-specific stats
      if (user && userId) {
        if (user.role === "Learner") {
          // Fetch student stats
          const statsResult = await studentService.getStudentStats();
          if (statsResult.data) {
            setStudentStats(statsResult.data);
          } else {
            console.error("Failed to fetch student stats:", statsResult.error);
            toast({
              title: "Warning",
              description: "Could not load student statistics",
              variant: "destructive",
            });
          }

          // Fetch enrolled courses
          const coursesResult = await studentService.getEnrolledCourses();
          let enrolledData = [];

          if (coursesResult.data) {
            enrolledData = coursesResult.data;
          } else if (coursesResult.error) {
            console.error(
              "Failed to fetch enrolled courses:",
              coursesResult.error
            );
            // Fallback to localStorage
            const storedCourses = JSON.parse(
              localStorage.getItem("enrolledCourses") || "[]"
            );
            enrolledData = storedCourses;
          }

          // Always merge with localStorage for latest progress
          const storedCourses = JSON.parse(
            localStorage.getItem("enrolledCourses") || "[]"
          );
          const mergedCourses = enrolledData.map((course: any) => {
            const stored = storedCourses.find(
              (s: any) => s.courseId === course.courseId
            );
            if (stored) {
              // Use the latest progress from localStorage
              return {
                ...course,
                progress: stored.progress || course.progress || 0,
                status: stored.status || course.status || "not_started",
                completedLessons:
                  stored.completedLessons || course.completedLessons || 0,
                totalLessons: stored.totalLessons || course.totalLessons || 10,
                lastAccessedAt: stored.lastAccessedAt || course.lastAccessedAt,
              };
            }
            return course;
          });

          setEnrolledCourses(mergedCourses);

          // Fetch active subscription
          const subscriptionResult =
            await subscriptionService.getMySubscription();
          if (subscriptionResult.data) {
            setActiveSubscription(subscriptionResult.data);
          } else if (subscriptionResult.error) {
            console.error(
              "Failed to fetch subscription:",
              subscriptionResult.error
            );
          }
        } else if (user.role === "Creator") {
          // Fetch instructor analytics and revenue
          const [analyticsResult, revenueResult] = await Promise.all([
            analyticsService.getInstructorAnalytics(userId),
            analyticsService.getInstructorRevenue(userId),
          ]);

          if (analyticsResult.data) {
            setCreatorStats({
              totalCourses: analyticsResult.data.summary.totalCourses,
              totalStudents: analyticsResult.data.summary.totalStudents,
              totalEarnings:
                ((revenueResult.data &&
                  (revenueResult.data as any).creatorEarnings) as
                  | number
                  | undefined) ??
                analyticsResult.data.summary.totalRevenue * 0.8,
              totalRevenue: analyticsResult.data.summary.totalRevenue,
              avgRating: analyticsResult.data.summary.averageRating,
              monthlyRevenue: analyticsResult.data.monthlyRevenue,
              coursePerformance: analyticsResult.data.coursePerformance,
            });
          } else {
            // Fallback to database service
            const creatorResult = await DatabaseService.getCreatorStats(userId);
            if (creatorResult.data) {
              setCreatorStats(creatorResult.data);
            }
          }
        }
      }

      // Instructors are now loaded in a separate useEffect after courses are fetched
      // This ensures we have course data available for mapping
      console.log("Instructors will be loaded after courses are fetched");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Using demo data instead.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fallback data for demo purposes - Only used when no real data is available
  const contributors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      title: "Senior Software Engineer",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format",
      location: "New York, NY",
      email: "instructor@example.com",
      linkedin: "https://linkedin.com/in/drsarahjohnson",
      github: "https://github.com/sarahjohnson",
      joinDate: "2023-01-15",
      rating: 4.8,
      totalCourses: 2,
      totalStudents: 1247,
      totalRevenue: "₱422,500",
      platformShare: "₱175,000", // 20% platform commission
      creatorEarnings: "₱700,000", // 80% creator share
      specialties: ["React", "Node.js", "Full Stack Development"],
      verified: true,
      courses: [
        {
          id: 1,
          title: "Advanced React Patterns & Performance",
          description:
            "Master advanced React concepts including hooks, context, and performance optimization techniques.",
          students: 1247,
          rating: 4.8,
          revenue: "₱422,500",
          price: 4499.0,
          originalPrice: 7499.0,
          discount: 40,
          duration: "8 hours",
          lectures: 24,
          level: "Advanced",
          category: "Web Development",
          thumbnail:
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&auto=format",
          status: "active",
          bestseller: true,
          lastUpdated: "2 days ago",
          features: [
            "Live coding sessions",
            "Project-based learning",
            "Community access",
          ],
          preview: "https://example.com/preview1",
          enrollmentType: "one-time",
        },
        {
          id: 2,
          title: "JavaScript Fundamentals for Beginners",
          description:
            "Learn JavaScript from scratch with hands-on projects and real-world examples.",
          students: 0,
          rating: 0,
          revenue: "₱0",
          price: 2999.0,
          originalPrice: 4999.0,
          discount: 40,
          duration: "12 hours",
          lectures: 18,
          level: "Beginner",
          category: "Programming",
          thumbnail:
            "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=250&fit=crop&auto=format",
          status: "draft",
          bestseller: false,
          lastUpdated: "5 days ago",
          features: ["Interactive exercises", "Code challenges", "Certificate"],
          preview: "https://example.com/preview2",
          enrollmentType: "one-time",
        },
      ],
    },
    {
      id: 2,
      name: "Prof. Michael Johnson",
      title: "Full Stack Developer",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format",
      location: "New York, NY",
      email: "michael.johnson@example.com",
      linkedin: "https://linkedin.com/in/michaeljohnson",
      github: "https://github.com/mjohnson",
      joinDate: "2023-03-22",
      rating: 4.8,
      totalCourses: 5,
      totalStudents: 1892,
      totalRevenue: "₱472,500",
      platformShare: "₱94,500",
      creatorEarnings: "₱378,000",
      specialties: ["React", "Node.js", "Full Stack Development"],
      verified: true,
      courses: [
        {
          id: 4,
          title: "React Complete Course 2024",
          description:
            "Complete React course from beginner to advanced with real projects",
          students: 1892,
          rating: 4.9,
          revenue: "₱472,500",
          price: 1899.0,
          originalPrice: 99.99,
          discount: 30,
          duration: "50 hours",
          lectures: 200,
          level: "All Levels",
          category: "Web Development",
          thumbnail:
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&auto=format",
          status: "active",
          bestseller: true,
          lastUpdated: "2024-01-25",
          features: [
            "Lifetime Access",
            "Certificate",
            "Mobile Access",
            "Source Code",
          ],
          preview: "https://example.com/preview4",
          enrollmentType: "one-time",
        },
      ],
    },
  ];

  // Import subscription plans from configuration
  const subscriptionPlans = SUBSCRIPTION_PLANS;

  // Get all courses for marketplace view
  const allCourses =
    courses.length > 0
      ? courses.map((course) => ({
          ...course,
          instructor:
            course.instructorName || course.instructor || "Unknown Instructor",
          instructorAvatar: course.instructorAvatar || null,
          instructorRating: course.instructorRating || 0,
          verified: course.verified || false,
          students: course.studentsCount || course.students || 0,
          rating: course.averageRating || course.rating || 0,
          lectures: course.lecturesCount || course.lectures || 0,
          thumbnail:
            course.thumbnail ||
            `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&auto=format`,
          features: course.features || [
            "Online Access",
            "Certificate of Completion",
          ],
        }))
      : contributors.flatMap((contributor) =>
          contributor.courses.map((course) => ({
            ...course,
            instructor: contributor.name,
            instructorAvatar: contributor.avatar,
            instructorRating: contributor.rating,
            verified: contributor.verified,
          }))
        );

  // Filter courses based on selected filters
  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.instructor || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || course.category === selectedCategory;
    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "free" && course.price === 0) ||
      (priceRange === "paid" && course.price > 0) ||
      (priceRange === "under-50" && course.price < 50) ||
      (priceRange === "50-100" && course.price >= 50 && course.price <= 100) ||
      (priceRange === "over-100" && course.price > 100);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Get top performers from actual data
  const getTopPerformers = () => {
    if (creators.length > 0) {
      // Sort creators by their actual revenue/students from courses
      const creatorsWithStats = creators.map((creator) => {
        const creatorCourses = courses.filter(
          (c) => c.instructor_id === creator.id
        );
        const totalRevenue = creatorCourses.reduce(
          (sum, course) => sum + (course.totalRevenue || 0),
          0
        );
        const totalStudents = creatorCourses.reduce(
          (sum, course) => sum + (course.totalStudents || 0),
          0
        );
        const avgRating =
          creatorCourses.length > 0
            ? creatorCourses.reduce(
                (sum, course) => sum + (course.rating || 0),
                0
              ) / creatorCourses.length
            : 0;

        return {
          ...creator,
          totalRevenue,
          totalStudents,
          rating: avgRating,
          title: "Creator",
          totalCourses: creatorCourses.length,
        };
      });

      // Sort by total revenue (highest first)
      return creatorsWithStats
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 3);
    }

    // Fallback to mock data
    return contributors.sort((a, b) => b.rating - a.rating).slice(0, 3);
  };

  const topPerformers = getTopPerformers();

  // Calculate real statistics from actual data
  const calculateRealStats = () => {
    // Calculate total revenue from all courses
    const totalRevenue = courses.reduce((sum, course) => {
      const students = course.studentsCount || course.students || 0;
      const price = course.price || 0;
      return sum + students * price;
    }, 0);

    // Calculate unique instructors
    const uniqueInstructors = new Set(
      courses.map((c) => c.instructorId || c.instructor_id)
    ).size;

    // Calculate total students
    const totalStudents = courses.reduce((sum, course) => {
      return sum + (course.studentsCount || course.students || 0);
    }, 0);

    return {
      totalContributors:
        uniqueInstructors || creators.length || contributors.length,
      totalCourses: courses.length,
      totalStudents: totalStudents,
      totalRevenue: totalRevenue,
      platformRevenue: totalRevenue * 0.2, // 20% platform commission
      creatorEarnings: totalRevenue * 0.8, // 80% creator share
      averageCoursePrice: courses.length > 0 ? totalRevenue / totalStudents : 0,
      conversionRate: 12.5, // This would need real tracking data
    };
  };

  const totalStats = platformStats || calculateRealStats();

  const handlePurchaseCourse = async (
    courseId: number,
    price: number,
    courseName: string
  ) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // Enroll in the course
      const result = await enrollInCourse(
        courseId,
        courseName,
        price,
        "purchase"
      );

      if (result.success) {
        toast({
          title: "Course Purchased!",
          description: `Successfully enrolled in ${courseName}. You can start learning immediately.`,
        });

        // Refresh the page data to show new enrollment
        await fetchData();

        // Navigate to My Courses
        setTimeout(() => {
          navigate("/my-courses");
        }, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        title: "Enrollment Failed",
        description: "Could not enroll in course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async (
    planId: string,
    planName: string,
    price: number
  ) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // For demo purposes, simulate subscription activation
      const subscriptionData = {
        id: Date.now(),
        planId,
        planName,
        amount: price,
        status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(
          Date.now() + (planId === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        subscribedAt: new Date().toISOString(),
      };

      // Store subscription
      localStorage.setItem(
        "activeSubscription",
        JSON.stringify(subscriptionData)
      );

      // Auto-enroll in sample courses for subscription
      const sampleCourses = [
        {
          id: 55,
          name: "Complete Web Development Bootcamp 2025",
          price: 89.99,
        },
        { id: 56, name: "Advanced React & Redux Masterclass", price: 79.99 },
        {
          id: 57,
          name: "Machine Learning with Python & TensorFlow",
          price: 99.99,
        },
      ];

      for (const course of sampleCourses) {
        await enrollInCourse(
          course.id,
          course.name,
          course.price,
          "subscription"
        );
      }

      toast({
        title: "Subscription Activated!",
        description: `${planName} is now active. You have access to all courses in our library.`,
      });

      // Refresh the page data
      await fetchData();

      // Navigate to dashboard
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: "Could not activate subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Student stats with real data
  const studentStatsDisplay = studentStats || {
    totalCourses: 0,
    completedCourses: 0,
    totalCertificates: 0,
    totalSpent: 0,
    learningHours: 0,
    currentStreak: 0,
    averageScore: 0,
  };

  const creatorStatsDisplay = creatorStats || {
    totalCourses: contributors[0]?.totalCourses || 0,
    totalStudents: contributors[0]?.totalStudents || 0,
    totalEarnings: parseInt(
      contributors[0]?.creatorEarnings?.replace(/[₱,]/g, "") || "0"
    ),
    avgRating: 4.8,
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowGHLCreator(true);
  };

  const handleEditCourse = (courseId: number) => {
    console.log("Edit course clicked in Marketplace, courseId:", courseId);
    // Find the course to edit from all courses (including unfiltered for creators)
    let courseToEdit = courses.find((course) => course.id === courseId);

    // If not found in filtered courses and user is creator, check unfiltered courses
    if (!courseToEdit && user?.role === "Creator") {
      courseToEdit = unfilteredCourses.find((course) => course.id === courseId);
    }

    if (courseToEdit) {
      console.log("Found course to edit:", courseToEdit);
      console.log("Setting editingCourse and showCourseEditor to true");
      setEditingCourse(courseToEdit);
      setShowCourseEditor(true);
      console.log("States set, showCourseEditor should be true now");
    } else {
      console.error("Course not found for editing:", courseId);
      toast({
        title: "Error",
        description: "Course not found. Please refresh and try again.",
        variant: "destructive",
      });
    }
  };

  const handlePublishCourse = async (courseId: number) => {
    try {
      const response = await courseService.publishCourse(courseId);

      if (response.data) {
        toast({
          title: "Course Submitted",
          description:
            "Your course has been submitted for admin approval. You will be notified once it's approved.",
        });

        // Refresh courses to update status
        await fetchData();
      } else {
        throw new Error(response.error || "Failed to publish course");
      }
    } catch (error) {
      console.error("Error publishing course:", error);
      toast({
        title: "Error",
        description: "Failed to publish course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewCourse = (courseId: number) => {
    navigate(`/courses/${courseId}`);
  };

  const handleDeleteCourse = (courseId: number) => {
    if (
      confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      // In a real app, this would make an API call to delete the course
      console.log("Delete course:", courseId);
      alert("Course deleted successfully!");
    }
  };

  const handleSaveCourse = (courseData: CourseForEditor) => {
    // In a real app, this would make an API call to save the course
    console.log("Saving course:", courseData);
    alert("Course saved successfully!");
    setShowCourseEditor(false);
    setEditingCourse(null);
  };

  const handleCancelCourseEditor = () => {
    setShowCourseEditor(false);
    setEditingCourse(null);
  };

  // Seed Sarah Johnson data function
  const seedSarahJohnsonData = async () => {
    console.log("Starting to seed data for Dr. Sarah Johnson...");

    try {
      // First ensure the database is initialized
      await DatabaseService.seedDatabase();

      // Get or create Sarah Johnson
      const users = await DatabaseService.getUsers();
      const userList: any[] = Array.isArray(users.data)
        ? (users.data as any[])
        : [];
      let sarah = userList.find(
        (u) =>
          u.email === "sarah.johnson@example.com" ||
          u.email === "instructor@example.com"
      );

      if (!sarah) {
        console.log("Creating Sarah Johnson account...");
        // Create Sarah if she doesn't exist
        const sarahId = "sarah-johnson-" + Date.now();
        const newSarah = {
          id: sarahId,
          email: "sarah.johnson@example.com",
          fullName: "Dr. Sarah Johnson",
          role: "Creator",
          avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format",
          createdAt: new Date(
            Date.now() - 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };

        // Add to users
        const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
        existingUsers.push(newSarah);
        localStorage.setItem("users", JSON.stringify(existingUsers));

        // Add authentication entry
        const authUsers = JSON.parse(localStorage.getItem("authUsers") || "[]");
        authUsers.push({
          id: sarahId,
          email: "sarah.johnson@example.com",
          password: "Creator123!", // In real app, this would be hashed
          fullName: "Dr. Sarah Johnson",
          role: "Creator",
        });
        localStorage.setItem("authUsers", JSON.stringify(authUsers));

        sarah = newSarah;
        console.log(
          "Created Sarah Johnson account with email: sarah.johnson@example.com"
        );
      } else if (sarah.email === "instructor@example.com") {
        // Update existing instructor account to use Sarah Johnson email
        console.log("Found existing instructor account, updating email...");
        sarah.email = "sarah.johnson@example.com";
        sarah.fullName = "Dr. Sarah Johnson";

        // Update in users list
        const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const userIndex = existingUsers.findIndex(
          (u: any) => u.id === sarah.id
        );
        if (userIndex >= 0) {
          existingUsers[userIndex] = sarah;
          localStorage.setItem("users", JSON.stringify(existingUsers));
        }

        // Update auth entry
        const authUsers = JSON.parse(localStorage.getItem("authUsers") || "[]");
        const authIndex = authUsers.findIndex((u: any) => u.id === sarah.id);
        if (authIndex >= 0) {
          authUsers[authIndex].email = "sarah.johnson@example.com";
          authUsers[authIndex].fullName = "Dr. Sarah Johnson";
        } else {
          // Create auth entry if it doesn't exist
          authUsers.push({
            id: sarah.id,
            email: "sarah.johnson@example.com",
            password: "Creator123!",
            fullName: "Dr. Sarah Johnson",
            role: "Creator",
          });
        }
        localStorage.setItem("authUsers", JSON.stringify(authUsers));
      }

      // Create payment and enrollment data
      const getRandomPastDate = (daysAgo: number) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
        return date.toISOString();
      };

      // Get all students
      const students =
        userList.filter((u) => u.role === "Learner").slice(0, 10) || [];

      // Get Sarah's courses
      const allCourses = await DatabaseService.getCourses();
      const courseList: any[] = Array.isArray(allCourses.data)
        ? (allCourses.data as any[])
        : [];
      const sarahCourses =
        courseList.filter(
          (c) =>
            c.instructorName === "Dr. Sarah Johnson" ||
            c.instructor === "Dr. Sarah Johnson"
        ) || [];

      if (sarahCourses.length === 0) {
        console.log(
          "No courses found for Sarah. The initial seed should have created them."
        );
        return;
      }

      console.log(`Found ${sarahCourses.length} courses for Sarah`);

      // Clear existing enrollments and payments for Sarah's courses
      const existingEnrollments = JSON.parse(
        localStorage.getItem("enrollments") || "[]"
      );
      const existingPayments = JSON.parse(
        localStorage.getItem("payments") || "[]"
      );
      const existingReviews = JSON.parse(
        localStorage.getItem("reviews") || "[]"
      );

      const filteredEnrollments = existingEnrollments.filter(
        (e: any) => !sarahCourses.some((c) => c.id === e.courseId)
      );
      const filteredPayments = existingPayments.filter(
        (p: any) => !sarahCourses.some((c) => c.id === p.courseId)
      );
      const filteredReviews = existingReviews.filter(
        (r: any) => !sarahCourses.some((c) => c.id === r.courseId)
      );

      // For each course, create realistic enrollments
      for (const course of sarahCourses) {
        const isAdvancedCourse = course.title.includes("Advanced");
        const enrollmentCount = isAdvancedCourse ? 50 : 30;
        const daysRange = isAdvancedCourse ? 180 : 120;

        for (let i = 0; i < enrollmentCount && i < students.length * 5; i++) {
          const student = students[i % students.length];
          const enrollmentDate = getRandomPastDate(daysRange);

          // Determine progress
          let progressPercentage: number;
          let completedAt = null;
          let certificateUrl = null;

          if (i < enrollmentCount * 0.4) {
            // 40% completed
            progressPercentage = 100;
            completedAt = new Date(
              new Date(enrollmentDate).getTime() + 30 * 24 * 60 * 60 * 1000
            ).toISOString();
            certificateUrl = `https://example.com/certificate/${course.id}-${student.id}-${i}`;
          } else if (i < enrollmentCount * 0.8) {
            // 40% in progress
            progressPercentage = 30 + Math.random() * 60;
          } else {
            // 20% not started
            progressPercentage = 0;
          }

          // Create enrollment
          const enrollment = {
            id: Date.now() + i,
            studentId: student.id,
            courseId: course.id,
            courseName: course.title,
            instructor: course.instructor || course.instructorName,
            thumbnail: course.thumbnail,
            enrolledAt: enrollmentDate,
            progressPercentage,
            completedAt,
            certificateUrl,
            lastAccessedAt: getRandomPastDate(7),
            status:
              progressPercentage === 100
                ? "completed"
                : progressPercentage > 0
                  ? "in_progress"
                  : "not_started",
          };

          filteredEnrollments.push(enrollment);

          // Create payment
          const payment = {
            id: Date.now() + i + 10000,
            userId: student.id,
            courseId: course.id,
            amount: course.price || 0,
            currency: "PHP",
            status: "Completed",
            paymentMethod: "Credit Card",
            transactionId: `TXN-${Date.now()}-${i}`,
            description: `Payment for ${course.title}`,
            createdAt: enrollmentDate,
            updatedAt: enrollmentDate,
          };

          filteredPayments.push(payment);

          // Add review for completed courses
          if (progressPercentage === 100 && Math.random() > 0.3) {
            const review = {
              id: Date.now() + i + 20000,
              courseId: course.id,
              studentId: student.id,
              studentName: student.fullName,
              rating: isAdvancedCourse
                ? 4.5 + Math.random() * 0.5
                : 4.3 + Math.random() * 0.7,
              comment: isAdvancedCourse
                ? "Excellent course! Learned so much about React patterns and performance optimization. Dr. Johnson explains complex concepts very clearly."
                : "Great course for beginners! Very clear explanations and good pacing. Perfect for someone just starting with JavaScript.",
              createdAt: new Date(
                new Date(enrollmentDate).getTime() + 35 * 24 * 60 * 60 * 1000
              ).toISOString(),
              helpful: Math.floor(Math.random() * 20),
            };

            filteredReviews.push(review);
          }
        }

        console.log(
          `Created ${enrollmentCount} enrollments for ${course.title}`
        );
      }

      // Save all data
      localStorage.setItem("enrollments", JSON.stringify(filteredEnrollments));
      localStorage.setItem("payments", JSON.stringify(filteredPayments));
      localStorage.setItem("reviews", JSON.stringify(filteredReviews));

      console.log("Successfully seeded data for Dr. Sarah Johnson!");
      console.log(
        `Total enrollments created: ${filteredEnrollments.length - existingEnrollments.length}`
      );
      console.log(
        `Total payments created: ${filteredPayments.length - existingPayments.length}`
      );
      console.log(
        `Total reviews created: ${filteredReviews.length - existingReviews.length}`
      );
    } catch (error) {
      console.error("Error seeding data:", error);
      throw error;
    }
  };

  // Convert display course to editor format
  const convertToEditorFormat = (course: CourseForDisplay): CourseForEditor => {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      originalPrice: course.originalPrice,
      duration: course.duration,
      level: (course.level as any) || "Beginner",
      category: course.category,
      thumbnail: course.thumbnail,
      status: (course.status as any) || "draft",
      features: course.features,
      enrollmentType: (course.enrollmentType as any) || "one-time",
      lectures: [], // Would be populated from database in real implementation
    };
  };

  // Role-based rendering
  const renderContent = () => {
    if (user?.role === "Creator") {
      // Support both new and old role names
      // Creators see marketplace with tabs for their courses and analytics
      return (
        <>
          {/* Creator Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Creator Hub
            </h1>
            <p className="text-muted-foreground">
              Manage your courses, track analytics, and explore the marketplace
            </p>
          </div>

          {/* Tabbed Interface */}
          <Tabs defaultValue="my-courses" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="my-courses">My Courses</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            </TabsList>

            {/* My Courses Tab - Extract courses grid from CreatorDashboard */}
            <TabsContent value="my-courses">
              <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="all">All Status</option>
                      <option value="Draft">Draft</option>
                      <option value="PendingApproval">Pending Approval</option>
                      <option value="Active">Published</option>
                      <option value="Inactive">Unpublished</option>
                    </select>
                  </div>

                  <Button onClick={handleCreateCourse}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </div>

                {/* Courses Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(() => {
                    // Get ALL courses from database for this creator (including pending approval)
                    const userCourses = unfilteredCourses.filter(
                      (c) =>
                        c.instructorId === userId ||
                        c.instructor_id === userId ||
                        c.instructor?.id === userId ||
                        (user?.name && c.instructorName === user.name)
                    );

                    // Return the creator's courses or empty array
                    return userCourses;
                  })()
                    .filter((course) => {
                      const matchesSearch = course.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                      const matchesStatus =
                        selectedFilter === "all" ||
                        course.status === selectedFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((course) => (
                      <Card
                        key={course.id}
                        className="group hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col h-full"
                      >
                        {/* Course Image */}
                        <div className="relative overflow-hidden">
                          <img
                            src={
                              course.thumbnail ||
                              getCourseThumbnail(course.category, course.id)
                            }
                            alt={course.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getCourseThumbnail(
                                course.category,
                                course.id
                              );
                            }}
                          />

                          {/* Top Badges */}
                          <div className="absolute top-4 left-4 flex flex-col gap-2 max-w-[calc(100%-2rem)]">
                            {/* Course Type Badge */}
                            {!!course.courseType && (
                              <Badge
                                className={`${
                                  course.courseType === "Sprint"
                                    ? "bg-orange-500"
                                    : course.courseType === "Marathon"
                                      ? "bg-purple-500"
                                      : course.courseType === "Membership"
                                        ? "bg-blue-500"
                                        : "bg-green-500"
                                } text-white shadow-lg text-xs`}
                              >
                                {course.courseType === "Sprint" ? (
                                  <Zap className="w-3 h-3 mr-1" />
                                ) : null}
                                {course.courseType === "Marathon" ? (
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                ) : null}
                                {course.courseType === "Membership" ? (
                                  <Crown className="w-3 h-3 mr-1" />
                                ) : null}
                                {course.courseType === "Custom" ? (
                                  <Star className="w-3 h-3 mr-1" />
                                ) : null}
                                {course.courseType}
                              </Badge>
                            )}
                            {(course.studentsCount || course.students || 0) >
                              1000 && (
                              <Badge className="bg-learning-warning text-white shadow-lg text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                Bestseller
                              </Badge>
                            )}
                            {!!course.category && (
                              <Badge
                                variant="secondary"
                                className="bg-black/70 text-white border-0 text-xs truncate"
                              >
                                {course.category}
                              </Badge>
                            )}
                          </div>

                          {/* Discount Badge */}
                          {!!course.discount && course.discount > 0 && (
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-destructive text-white shadow-lg">
                                {course.discount}% OFF
                              </Badge>
                            </div>
                          )}

                          {/* Level Badge */}
                          <div className="absolute bottom-4 left-4">
                            <Badge
                              className={`${
                                course.level === "Beginner"
                                  ? "bg-green-500/90 text-white"
                                  : course.level === "Intermediate"
                                    ? "bg-yellow-500/90 text-white"
                                    : course.level === "Advanced"
                                      ? "bg-red-500/90 text-white"
                                      : "bg-blue-500/90 text-white"
                              } shadow-lg border-0 text-xs`}
                            >
                              {course.level || "All Levels"}
                            </Badge>
                          </div>

                          {/* Status Badge */}
                          <div className="absolute bottom-4 right-4">
                            <Badge
                              className={`${
                                course.status === "Active" ||
                                course.status === "active"
                                  ? "bg-green-500/90 text-white"
                                  : course.status === "Draft" ||
                                      course.status === "draft"
                                    ? "bg-yellow-500/90 text-white"
                                    : course.status === "PendingApproval" ||
                                        course.status === "pendingapproval"
                                      ? "bg-blue-500/90 text-white"
                                      : "bg-gray-500/90 text-white"
                              } shadow-lg border-0 text-xs`}
                            >
                              {course.status === "Active" ||
                              course.status === "active"
                                ? "Published"
                                : course.status === "Draft" ||
                                    course.status === "draft"
                                  ? "Draft"
                                  : course.status === "PendingApproval" ||
                                      course.status === "pendingapproval"
                                    ? "Pending Approval"
                                    : "Unpublished"}
                            </Badge>
                          </div>
                        </div>

                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors h-14 flex items-center">
                            <span
                              className="overflow-hidden text-ellipsis"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {course.title}
                            </span>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            by {course.instructorName || "You"}
                          </p>
                        </CardHeader>

                        <CardContent className="pt-0 space-y-4 flex-1 flex flex-col justify-between">
                          {/* Course Stats */}
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1 min-w-0">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                              <span className="font-medium">
                                {formatRating(
                                  course.rating || course.averageRating || 0
                                )}
                              </span>
                              <span className="truncate">
                                (
                                {(
                                  course.students ||
                                  course.studentsCount ||
                                  0
                                ).toLocaleString()}
                                )
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Clock className="w-4 h-4" />
                              <span>{course.duration || "N/A"}</span>
                            </div>
                          </div>

                          {/* Revenue for Creator */}
                          <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">
                              Revenue
                            </span>
                            <span className="text-sm font-semibold">
                              {formatPHP(
                                (course.studentsCount || course.students || 0) *
                                  (course.price || 0)
                              )}
                            </span>
                          </div>

                          {/* Price and Actions */}
                          <div className="flex items-center justify-between pt-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-lg font-bold text-learning-blue">
                                {formatPHP(course.price)}
                              </span>
                              {!!course.originalPrice &&
                                course.originalPrice > course.price && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatPHP(course.originalPrice)}
                                  </span>
                                )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  console.log(
                                    "Edit button clicked for course:",
                                    course
                                  );
                                  handleEditCourse(course.id);
                                }}
                                className="h-8 w-8"
                                title="Edit Course"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {(course.status === "draft" ||
                                course.status === "Draft") && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handlePublishCourse(course.id)}
                                  className="h-8 w-8 text-green-600 hover:text-green-700"
                                  title="Publish Course"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleViewCourse(course.id)}
                                title="View Course"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  navigate(`/analytics/course/${course.id}`)
                                }
                                title="View Analytics"
                              >
                                <BarChart3 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {courses.filter(
                  (c) =>
                    c.instructorId === userId ||
                    c.instructor_id === userId ||
                    c.instructor?.id === userId ||
                    (user?.name && c.instructorName === user.name)
                ).length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No courses found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || selectedFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Start creating your first course"}
                    </p>
                    {!searchQuery && selectedFilter === "all" && (
                      <Button onClick={handleCreateCourse}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Course
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              {/* Stats Overview - Show accurate creator stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Courses
                        </p>
                        <p className="text-2xl font-bold text-learning-blue">
                          {creatorStatsDisplay.totalCourses}
                        </p>
                      </div>
                      <BookOpen className="w-8 h-8 text-learning-blue/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Students
                        </p>
                        <p className="text-2xl font-bold text-learning-success">
                          {creatorStatsDisplay.totalStudents.toLocaleString()}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-learning-success/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Earnings
                        </p>
                        <p className="text-2xl font-bold text-learning-warning">
                          {formatPHP(creatorStatsDisplay.totalEarnings)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-learning-warning/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Average Rating
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {formatRating(creatorStatsDisplay.avgRating)}
                        </p>
                      </div>
                      <Star className="w-8 h-8 text-primary/60" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Course Analytics - without duplicate stats */}
              <CourseAnalytics creatorId={userId || ""} />
            </TabsContent>

            {/* Earnings Tab */}
            <TabsContent value="earnings">
              <EarningsReport creatorId={userId || ""} />
            </TabsContent>

            {/* Marketplace Tab */}
            <TabsContent value="marketplace">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Explore Other Courses</h2>
                  <Badge variant="secondary">Browse as Creator</Badge>
                </div>
                {renderMarketplace(true)}
              </div>
            </TabsContent>
          </Tabs>
        </>
      );
    }

    if (user?.role === "Learner") {
      // Students see marketplace with their analytics
      return (
        <>
          {/* Student Analytics Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              My Learning Dashboard
            </h1>
            <p className="text-muted-foreground mb-6">
              Track your learning progress and subscriptions
            </p>

            {/* Student Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-card shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Courses
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {studentStatsDisplay.totalCourses}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {studentStatsDisplay.inProgressCourses || 0} in progress
                      </p>
                    </div>
                    <BookOpen className="w-8 h-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Completed Courses
                      </p>
                      <p className="text-2xl font-bold text-learning-success">
                        {studentStatsDisplay.completedCourses}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {studentStatsDisplay.averageScore}% avg score
                      </p>
                    </div>
                    <GraduationCap className="w-8 h-8 text-learning-success/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Learning Hours
                      </p>
                      <p className="text-2xl font-bold text-learning-warning">
                        {studentStatsDisplay.learningHours}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {studentStatsDisplay.currentStreak} day streak
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-learning-warning/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Spent
                      </p>
                      <p className="text-2xl font-bold text-learning-blue">
                        {formatPHP(studentStatsDisplay.totalSpent)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {studentStatsDisplay.totalCertificates} certificates
                      </p>
                    </div>
                    <CreditCard className="w-8 h-8 text-learning-blue/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Subscription Card */}
            {activeSubscription ? (
              <Card className="mb-8 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-learning-warning" />
                    My Active Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {activeSubscription.planId === "premium"
                          ? "Premium Plan"
                          : activeSubscription.planId === "basic"
                            ? "Basic Plan"
                            : activeSubscription.planId === "annual"
                              ? "Annual Premium"
                              : "Subscription"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {activeSubscription.planId === "basic"
                          ? "Access to 100+ courses"
                          : "Unlimited access to all courses"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Valid until:{" "}
                        {new Date(
                          activeSubscription.endDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatPHP(activeSubscription.amount)}
                        {activeSubscription.planId === "annual"
                          ? "/year"
                          : "/month"}
                      </p>
                      <Badge className="bg-learning-success text-white">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Manage Subscription
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Benefits
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-8 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-muted-foreground" />
                    No Active Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Get unlimited access to all courses with a subscription plan
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => {
                      const element =
                        document.getElementById("subscriptions-tab");
                      if (element) element.click();
                    }}
                  >
                    View Subscription Plans
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Enrolled Courses Overview */}
            {enrolledCourses.length > 0 && (
              <Card className="mb-8 shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>My Learning Progress</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/my-courses")}
                    >
                      View All Courses
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enrolledCourses.slice(0, 3).map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center gap-4 p-4 bg-gradient-card rounded-lg hover:shadow-md transition-shadow"
                      >
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{course.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            by {course.instructor}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Progress
                              value={course.progress}
                              className="flex-1 h-2"
                            />
                            <span className="text-sm font-medium">
                              {course.progress}%
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate(`/courses/${course.courseId}`)
                          }
                        >
                          {course.status === "not_started"
                            ? "Start"
                            : "Continue"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Marketplace for Students */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Marketplace</h2>
            {renderMarketplace(false, true)}
          </div>
        </>
      );
    }

    // Default marketplace view for guests and admins
    return renderMarketplace();
  };

  const renderMarketplace = (isCreator = false, isStudent = false) => (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Marketplace
        </h1>
        <p className="text-muted-foreground">
          Discover premium courses from expert instructors and boost your skills
        </p>
      </div>

      {/* Overview Stats - Only show for guests and non-student/creator users */}
      {!isCreator && !isStudent && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Contributors
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {totalStats.totalContributors}
                  </p>
                </div>
                <Users className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold text-learning-blue">
                    {totalStats.totalCourses}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-learning-blue/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-learning-success">
                    {totalStats.totalStudents.toLocaleString()}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-learning-success/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-learning-warning">
                    {formatPHP(totalStats.totalRevenue)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-learning-warning/60" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Performers - Only show for Admin */}
      {!isCreator && !isStudent && (
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-learning-warning" />
              Top Performing Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topPerformers.map((contributor, index) => (
                <div
                  key={contributor.id}
                  className="flex items-center space-x-4 p-4 bg-gradient-card rounded-lg"
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={contributor.avatar || contributor.avatar_url}
                        alt={contributor.name || contributor.full_name}
                      />
                      <AvatarFallback>
                        {(contributor.name || contributor.full_name)
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-learning-warning rounded-full flex items-center justify-center">
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {contributor.name || contributor.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {contributor.title || "Creator"}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-learning-warning fill-current" />
                      <span className="text-sm font-medium">
                        {formatRating(contributor.rating || 0)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        • {(contributor.totalStudents || 0).toLocaleString()}{" "}
                        students
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList
          className={`grid w-full ${!isCreator && !isStudent ? "grid-cols-4" : "grid-cols-3"}`}
        >
          <TabsTrigger value="courses">Browse Courses</TabsTrigger>
          <TabsTrigger value="subscriptions" id="subscriptions-tab">
            Subscription Plans
          </TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
          {!isCreator && !isStudent && (
            <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="courses" className="mt-8">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search courses or instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Machine Learning">
                    Machine Learning
                  </SelectItem>
                  <SelectItem value="Web Development">
                    Web Development
                  </SelectItem>
                  <SelectItem value="Computer Vision">
                    Computer Vision
                  </SelectItem>
                  <SelectItem value="Deep Learning">Deep Learning</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="under-50">Under ₱2,500</SelectItem>
                  <SelectItem value="50-100">₱2,500 - ₱5,000</SelectItem>
                  <SelectItem value="over-100">Over ₱5,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="group hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  {/* Course Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        course.thumbnail ||
                        getCourseThumbnail(course.category, course.id)
                      }
                      alt={course.title || "Course"}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getCourseThumbnail(
                          course.category,
                          course.id
                        );
                      }}
                    />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 max-w-[calc(100%-2rem)]">
                      {/* Course Type Badge */}
                      {!!course.courseType && (
                        <Badge
                          className={`${
                            course.courseType === "Sprint"
                              ? "bg-orange-500"
                              : course.courseType === "Marathon"
                                ? "bg-purple-500"
                                : course.courseType === "Membership"
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                          } text-white shadow-lg text-xs`}
                        >
                          {course.courseType === "Sprint" ? (
                            <Zap className="w-3 h-3 mr-1" />
                          ) : null}
                          {course.courseType === "Marathon" ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : null}
                          {course.courseType === "Membership" ? (
                            <Crown className="w-3 h-3 mr-1" />
                          ) : null}
                          {course.courseType === "Custom" ? (
                            <Star className="w-3 h-3 mr-1" />
                          ) : null}
                          {course.courseType}
                        </Badge>
                      )}
                      {!!course.bestseller && (
                        <Badge className="bg-learning-warning text-white shadow-lg text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          Bestseller
                        </Badge>
                      )}
                      {!!course.category && (
                        <Badge
                          variant="secondary"
                          className="bg-black/70 text-white border-0 text-xs truncate"
                        >
                          {course.category}
                        </Badge>
                      )}
                    </div>

                    {/* Discount Badge */}
                    {!!course.discount && course.discount > 0 && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-destructive text-white shadow-lg">
                          {course.discount}% OFF
                        </Badge>
                      </div>
                    )}

                    {/* Level Badge */}
                    <div className="absolute bottom-4 left-4">
                      <Badge
                        className={`${
                          course.level === "Beginner"
                            ? "bg-green-500/90 text-white"
                            : course.level === "Intermediate"
                              ? "bg-yellow-500/90 text-white"
                              : course.level === "Advanced"
                                ? "bg-red-500/90 text-white"
                                : "bg-blue-500/90 text-white"
                        } shadow-lg border-0 text-xs`}
                      >
                        {course.level || "All Levels"}
                      </Badge>
                    </div>

                    {/* Hover Preview */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/courses/${course.id}`);
                        }}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Preview Course
                      </Button>
                    </div>
                  </div>

                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors h-14 flex items-center">
                      <span
                        className="overflow-hidden text-ellipsis"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {course.title || "Untitled Course"}
                      </span>
                    </CardTitle>

                    {/* Instructor Info */}
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="w-6 h-6 flex-shrink-0">
                        <AvatarImage
                          src={course.instructorAvatar}
                          alt={course.instructor || "Instructor"}
                        />
                        <AvatarFallback className="text-xs">
                          {(course.instructor || "UI")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground truncate">
                        by {course.instructor || "Unknown Instructor"}
                      </span>
                      {!!course.verified && (
                        <Crown className="w-4 h-4 text-learning-warning flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4 flex-1 flex flex-col justify-between">
                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 min-w-0">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                        <span className="font-medium">
                          {formatRating(course.rating || 0)}
                        </span>
                        {!!course.students && course.students > 0 && (
                          <span className="truncate">
                            ({course.students.toLocaleString()})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration || "N/A"}</span>
                      </div>
                    </div>

                    {/* Course Features */}
                    <div className="space-y-1">
                      {(course.features || [])
                        .slice(0, 2)
                        .map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></div>
                            <span className="truncate">{feature}</span>
                          </div>
                        ))}
                      {!!course.lectures && course.lectures > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></div>
                          <span>{course.lectures} lectures</span>
                        </div>
                      )}
                    </div>

                    {/* Course Type Features Icons */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {course.courseFeatures?.certificate && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Award className="w-3 h-3" />
                          <span>Certificate</span>
                        </div>
                      )}
                      {course.courseFeatures?.community && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageCircle className="w-3 h-3" />
                          <span>Community</span>
                        </div>
                      )}
                      {course.courseFeatures?.liveSessions && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Video className="w-3 h-3" />
                          <span>Live</span>
                        </div>
                      )}
                      {course.language && course.language !== "en" && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          <span>{course.language.toUpperCase()}</span>
                        </div>
                      )}
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-learning-blue">
                          {formatPHP(course.price || 0)}
                        </span>
                        {!!course.originalPrice &&
                          course.originalPrice !== course.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPHP(course.originalPrice)}
                            </span>
                          )}
                      </div>
                      <Button
                        onClick={() =>
                          handlePurchaseCourse(
                            course.id,
                            course.price || 0,
                            course.title || "Course"
                          )
                        }
                        size="sm"
                        className="bg-gradient-primary hover:opacity-90 group-hover:translate-x-1 transition-transform flex-shrink-0"
                      >
                        <span className="hidden sm:inline">Enroll Now</span>
                        <span className="sm:hidden">Enroll</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Choose Your Learning Plan
              </h2>
              <p className="text-muted-foreground">
                Get unlimited access to our entire course library
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative shadow-card hover:shadow-card-hover transition-all duration-300 ${plan.popularPlan ? "ring-2 ring-primary" : ""}`}
                >
                  {!!plan.popularPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">
                        {formatPHP(plan.price)}
                      </span>
                      <span className="text-muted-foreground">
                        /{plan.duration}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() =>
                        handleSubscribe(plan.id, plan.name, plan.price)
                      }
                      className={`w-full ${plan.popularPlan ? "bg-gradient-primary" : ""}`}
                      variant={plan.popularPlan ? "default" : "outline"}
                    >
                      Subscribe Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="instructors" className="mt-8">
          {/* Enhanced instructor profiles with earnings */}
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading instructors...</p>
              </div>
            </div>
          ) : instructors.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No instructors found with published courses.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {instructors.map((contributor) => (
                <Card
                  key={contributor.id}
                  className="shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Profile Section */}
                      <div className="lg:w-1/3">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <Avatar className="w-16 h-16">
                              <AvatarImage
                                src={contributor.avatar}
                                alt={contributor.name}
                              />
                              <AvatarFallback className="text-lg font-semibold">
                                {contributor.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {!!contributor.verified && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Crown className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold">
                              {contributor.name}
                            </h3>
                            <p className="text-muted-foreground mb-2">
                              {contributor.title}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {contributor.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Joined{" "}
                                {new Date(contributor.joinDate).getFullYear()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Revenue Breakdown - Only show for Admin and Creators */}
                        {(user?.role === "Admin" ||
                          user?.role === "Creator") && (
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-gradient-card rounded-lg">
                              <p className="text-xl font-bold text-learning-success">
                                {formatPHP(contributor.creatorEarnings)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Creator Earnings (80%)
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gradient-card rounded-lg">
                              <p className="text-xl font-bold text-learning-warning">
                                {formatPHP(contributor.platformShare)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Platform Share (20%)
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Overall Stats - Always visible but different layout for learners */}
                        <div
                          className={`grid ${user?.role === "Learner" ? "grid-cols-3" : "grid-cols-2"} gap-4`}
                        >
                          <div className="text-center p-3 bg-gradient-card rounded-lg">
                            <p className="text-2xl font-bold text-primary">
                              {contributor.totalCourses}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Courses
                            </p>
                          </div>
                          <div className="text-center p-3 bg-gradient-card rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Star className="w-4 h-4 text-learning-warning fill-current" />
                              <span className="text-xl font-bold">
                                {formatRating(contributor.rating || 0)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Rating
                            </p>
                          </div>
                          {/* Add students count for learners */}
                          {user?.role === "Learner" && (
                            <div className="text-center p-3 bg-gradient-card rounded-lg">
                              <p className="text-2xl font-bold text-learning-blue">
                                {contributor.totalStudents.toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Students
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Courses Section */}
                      <div className="lg:w-2/3">
                        <h4 className="text-lg font-semibold mb-4">
                          Published Courses
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {contributor.courses.map((course, index) => (
                            <div
                              key={index}
                              className="p-4 border border-border rounded-lg bg-gradient-card"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h5 className="font-semibold mb-1">
                                    {course.title}
                                  </h5>
                                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Eye className="w-4 h-4" />
                                      {course.students.toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-learning-warning fill-current" />
                                      {formatRating(course.rating || 0)}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-primary">
                                    {formatPHP(course.price)}
                                  </p>
                                  <Badge
                                    variant={
                                      course.status === "Active" ||
                                      course.status === "active"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="mt-1"
                                  >
                                    {course.status === "Active" ||
                                    course.status === "active"
                                      ? "Published"
                                      : course.status === "Draft" ||
                                          course.status === "draft"
                                        ? "Draft"
                                        : course.status === "PendingApproval" ||
                                            course.status === "pendingapproval"
                                          ? "Pending"
                                          : course.status}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                onClick={() =>
                                  handlePurchaseCourse(
                                    course.id,
                                    course.price,
                                    course.title
                                  )
                                }
                                size="sm"
                                className="w-full"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Enroll - {formatPHP(course.price)}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {!isCreator && !isStudent && user?.role === "Admin" && (
          <TabsContent value="analytics" className="mt-8">
            <div className="space-y-8">
              {/* Key Metrics */}
              <div>
                <h3 className="text-xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                  Platform Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Platform Revenue
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {formatPHP(totalStats.platformRevenue)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            20% Commission
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Creator Earnings
                          </p>
                          <p className="text-2xl font-bold text-learning-success">
                            {formatPHP(totalStats.creatorEarnings)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            80% Share
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-learning-success/10 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-learning-success" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Avg Course Price
                          </p>
                          <p className="text-2xl font-bold text-learning-blue">
                            {formatPHP(
                              courses.length > 0
                                ? courses.reduce(
                                    (sum, c) => sum + (c.price || 0),
                                    0
                                  ) / courses.length
                                : 0
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {courses.length} courses
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-learning-blue/10 rounded-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-learning-blue" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Enrollments
                          </p>
                          <p className="text-2xl font-bold text-learning-warning">
                            {totalStats.totalStudents}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Active students
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-learning-warning/10 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-learning-warning" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Course Performance Analysis */}
              <div>
                <h3 className="text-xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                  Course Performance
                </h3>
                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {courses.slice(0, 5).map((course) => {
                        const revenue =
                          (course.studentsCount || 0) * (course.price || 0);
                        const revenuePercentage =
                          totalStats.totalRevenue > 0
                            ? (revenue / totalStats.totalRevenue) * 100
                            : 0;

                        return (
                          <div
                            key={course.id}
                            className="p-4 bg-gradient-to-r from-background to-muted/20 rounded-lg border border-border"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold">
                                  {course.title}
                                </h4>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <span>by {course.instructorName}</span>
                                  <span>{course.category}</span>
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                    {formatRating(course.averageRating || 0)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {formatPHP(revenue)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {course.studentsCount || 0} students
                                </p>
                              </div>
                            </div>
                            <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                              <div
                                className="absolute h-full bg-gradient-to-r from-primary to-learning-success rounded-full transition-all duration-500"
                                style={{ width: `${revenuePercentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Analytics */}
              <div>
                <h3 className="text-xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                  Category Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(() => {
                    // Use popular categories from platform stats if available
                    if (
                      platformStats?.popularCategories &&
                      platformStats.popularCategories.length > 0
                    ) {
                      return platformStats.popularCategories.map((cat) => (
                        <Card
                          key={cat.category}
                          className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300"
                        >
                          <CardContent className="p-6">
                            <h4 className="font-semibold mb-3">
                              {cat.category}
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Courses
                                </span>
                                <span className="font-medium">
                                  {cat.courseCount}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Students
                                </span>
                                <span className="font-medium">
                                  {cat.enrollmentCount}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Revenue
                                </span>
                                <span className="font-medium text-learning-success">
                                  {formatPHP(cat.revenue)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ));
                    }

                    // Fallback to calculating from courses
                    const categoryStats = courses.reduce(
                      (acc, course) => {
                        const category = course.category || "Other";
                        if (!acc[category]) {
                          acc[category] = { count: 0, revenue: 0, students: 0 };
                        }
                        acc[category].count++;
                        acc[category].revenue +=
                          (course.studentsCount || 0) * (course.price || 0);
                        acc[category].students += course.studentsCount || 0;
                        return acc;
                      },
                      {} as Record<
                        string,
                        { count: number; revenue: number; students: number }
                      >
                    );

                    return (
                      Object.entries(categoryStats) as Array<
                        [
                          string,
                          { count: number; revenue: number; students: number },
                        ]
                      >
                    ).map(([category, stats]) => (
                      <Card
                        key={category}
                        className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300"
                      >
                        <CardContent className="p-6">
                          <h4 className="font-semibold mb-3">{category}</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Courses
                              </span>
                              <span className="font-medium">{stats.count}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Students
                              </span>
                              <span className="font-medium">
                                {stats.students}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Revenue
                              </span>
                              <span className="font-medium text-learning-success">
                                {formatPHP(stats.revenue)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ));
                  })()}
                </div>
              </div>

              {/* Subscription Metrics if available */}
              {platformStats?.subscriptionMetrics && (
                <div>
                  <h3 className="text-xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                    Subscription Analytics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-card shadow-card">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Active Subscriptions
                            </p>
                            <p className="text-2xl font-bold text-primary">
                              {platformStats.subscriptionMetrics.totalActive}
                            </p>
                          </div>
                          <Crown className="w-8 h-8 text-primary/60" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-card shadow-card">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Monthly Recurring Revenue
                            </p>
                            <p className="text-2xl font-bold text-learning-success">
                              {formatPHP(
                                platformStats.subscriptionMetrics
                                  .monthlyRecurringRevenue
                              )}
                            </p>
                          </div>
                          <DollarSign className="w-8 h-8 text-learning-success/60" />
                        </div>
                      </CardContent>
                    </Card>

                    {platformStats.subscriptionMetrics.byPlan &&
                      platformStats.subscriptionMetrics.byPlan.length > 0 && (
                        <Card className="bg-gradient-card shadow-card">
                          <CardContent className="p-6">
                            <h4 className="font-semibold mb-3">By Plan</h4>
                            <div className="space-y-2">
                              {platformStats.subscriptionMetrics.byPlan.map(
                                (plan) => (
                                  <div
                                    key={plan.plan}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="text-muted-foreground">
                                      {plan.plan}
                                    </span>
                                    <span className="font-medium">
                                      {plan.count} (
                                      {formatPHP(plan.monthlyRevenue)})
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </>
  );

  // Show GHL course creator if creating new course
  if (showGHLCreator) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <CourseCreatorGHL
            onComplete={(courseData) => {
              console.log("Course created:", courseData);
              setShowGHLCreator(false);
              fetchData(); // Refresh the data
            }}
            onCancel={() => setShowGHLCreator(false)}
          />
        </div>
      </div>
    );
  }

  // Show course editor if editing existing course
  if (showCourseEditor && editingCourse) {
    console.log(
      "Rendering CourseEditorWithFeatures for course:",
      editingCourse
    );
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <CourseEditorWithFeatures
            courseId={editingCourse.id}
            onComplete={(data) => {
              console.log("Course updated:", data);
              handleCancelCourseEditor();
              // Refresh courses list
              fetchData();

              // If we came from an edit route, navigate back to marketplace
              if (editCourseId) {
                navigate("/marketplace");
              }
            }}
            onCancel={() => {
              handleCancelCourseEditor();
              // If we came from an edit route, navigate back to marketplace
              if (editCourseId) {
                navigate("/marketplace");
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Admin seed button */}
        {user?.role === "Admin" && (
          <div className="mb-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  toast({
                    title: "Seeding Data",
                    description:
                      "Creating realistic data for Dr. Sarah Johnson...",
                  });

                  // First try to register Sarah in the backend
                  try {
                    const registerResponse = await api.register(
                      "sarah.johnson@example.com",
                      "Creator123!",
                      "Dr. Sarah Johnson",
                      "Instructor"
                    );

                    if (registerResponse.data) {
                      console.log(
                        "Sarah Johnson registered in backend:",
                        registerResponse.data
                      );

                      // For demo purposes, we'll use the existing instructor account
                      toast({
                        title: "Account Created",
                        description:
                          "Sarah Johnson has been registered. Please use instructor@example.com / instructor123 to login.",
                      });
                    }
                  } catch (error) {
                    console.log(
                      "Sarah may already exist or backend registration failed, continuing with local seed..."
                    );
                  }

                  await seedSarahJohnsonData();
                  toast({
                    title: "Data Seeded Successfully",
                    description:
                      "Sarah Johnson's courses, enrollments, and payments have been created.",
                  });
                  // Refresh data
                  await fetchData();
                } catch (error) {
                  toast({
                    title: "Seeding Failed",
                    description:
                      "Could not seed data. Please check the console.",
                    variant: "destructive",
                  });
                  console.error("Seeding error:", error);
                }
              }}
            >
              <Database className="w-4 h-4 mr-2" />
              Seed Sarah Johnson Data
            </Button>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default Marketplace;
