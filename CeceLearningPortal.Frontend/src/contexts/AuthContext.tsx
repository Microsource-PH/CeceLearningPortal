import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import api from "../services/api";

export type UserRole = "Learner" | "Creator" | "Admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  accessToken?: string;
  refreshToken?: string;
}

// Type definitions for API response data
interface AuthResponseData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
  status?: string;
}

interface SavedAuthData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    fullName: string,
    role?: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateUserRole?: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to migrate old role names
  const migrateRole = (role: string): UserRole => {
    switch (role) {
      case "Student":
        return "Learner";
      case "Instructor":
        return "Creator";
      case "Admin":
        return "Admin";
      default:
        return role as UserRole;
    }
  };

  // Check for saved auth on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("auth");
    if (savedAuth) {
      try {
        const authData: SavedAuthData = JSON.parse(savedAuth);
        const migratedRole = migrateRole(authData.role);

        // Update stored data if role was migrated
        if (migratedRole !== authData.role) {
          authData.role = migratedRole;
          localStorage.setItem("auth", JSON.stringify(authData));
        }

        setUser({
          id: authData.id,
          name: authData.fullName,
          email: authData.email,
          role: migratedRole,
          avatar: authData.avatar,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
        });
        api.setToken(authData.accessToken);
        if (authData.refreshToken) {
          api.setRefreshToken(authData.refreshToken);
        }
      } catch (error) {
        console.error("Failed to parse saved auth:", error);
        localStorage.removeItem("auth");
      }
    }
    setIsLoading(false);

    // Listen for token expiration events
    const handleTokenExpired = () => {
      console.log("Token expired, logging out user");
      logout();
    };

    window.addEventListener("auth:token-expired", handleTokenExpired);

    // Cleanup listener
    return () => {
      window.removeEventListener("auth:token-expired", handleTokenExpired);
    };
  }, []);

  const isAuthenticated = !!user;

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.login(email, password);

      if (response.error) {
        return { success: false, error: response.error };
      }

      const authData: AuthResponseData = response.data as AuthResponseData;
      const migratedRole = migrateRole(authData.role);
      const userData: User = {
        id: authData.id,
        name: authData.fullName,
        email: authData.email,
        role: migratedRole,
        avatar: authData.avatar,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      };

      setUser(userData);
      api.setToken(authData.accessToken);
      if (authData.refreshToken) {
        api.setRefreshToken(authData.refreshToken);
      }
      localStorage.setItem("auth", JSON.stringify(authData));

      // Set up demo data for specific users
      if (
        email === "instructor@example.com" ||
        email === "dr.johnson@example.com"
      ) {
        // This is Dr. Sarah Johnson - the instructor account
        userData.name = "Dr. Sarah Johnson";

        // Store demo courses for Dr. Johnson in localStorage
        const drJohnsonCourses = [
          {
            id: 1,
            instructor_id: userData.id,
            instructorId: userData.id,
            title: "Advanced React Patterns & Performance",
            description:
              "Master advanced React concepts including hooks, context, and performance optimization techniques.",
            category: "Web Development",
            thumbnail:
              "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&auto=format",
            status: "active",
            students: 1247,
            totalStudents: 1247,
            rating: 4.8,
            revenue: 422500,
            totalRevenue: 422500,
            lastUpdated: "2 days ago",
            price: 4499.0,
            originalPrice: 7499.0,
            duration: "8 hours",
            level: "Advanced",
            features: [
              "Live coding sessions",
              "Project-based learning",
              "Community access",
            ],
            enrollmentType: "one-time",
            lectures: 24,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            instructor_id: userData.id,
            instructorId: userData.id,
            title: "JavaScript Fundamentals for Beginners",
            description:
              "Learn JavaScript from scratch with hands-on projects and real-world examples.",
            category: "Programming",
            thumbnail:
              "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=250&fit=crop&auto=format",
            status: "draft",
            students: 0,
            totalStudents: 0,
            rating: 0,
            revenue: 0,
            totalRevenue: 0,
            lastUpdated: "5 days ago",
            price: 2999.0,
            originalPrice: 4999.0,
            duration: "12 hours",
            level: "Beginner",
            features: [
              "Interactive exercises",
              "Code challenges",
              "Certificate",
            ],
            enrollmentType: "one-time",
            lectures: 18,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        localStorage.setItem(
          "drJohnsonCourses",
          JSON.stringify(drJohnsonCourses)
        );
      }

      // Set up demo data for Sarah Wilson
      if (email === "sarah.wilson@example.com") {
        // Set up Pro subscription (matches the pricing plan ID)
        const subscriptionData = {
          id: "sub_pro_sarah",
          planId: "pro",
          planName: "Pro Plan",
          amount: 2499.0,
          status: "active",
          startDate: "2024-01-01T00:00:00Z",
          endDate: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(), // 1 year from now
          subscribedAt: "2024-01-01T00:00:00Z",
        };
        localStorage.setItem(
          "activeSubscription",
          JSON.stringify(subscriptionData)
        );

        // Set up enrolled courses via subscription
        const enrolledCourses = [
          {
            id: 1,
            courseId: 55,
            title: "Complete Web Development Bootcamp 2025",
            instructor: "Dr. Sarah Johnson",
            thumbnail:
              "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop&auto=format",
            progress: 75,
            status: "in_progress",
            enrolledAt: "2024-01-01T00:00:00Z",
            completedLessons: 18,
            totalLessons: 24,
            lastAccessedAt: new Date().toISOString(),
            enrollmentType: "subscription",
            price: 0,
            nextLesson: {
              id: 19,
              title: "Advanced React Hooks",
              type: "video",
            },
          },
          {
            id: 2,
            courseId: 56,
            title: "Computer Vision Fundamentals",
            instructor: "Prof. Michael Johnson",
            thumbnail:
              "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format",
            progress: 100,
            status: "completed",
            enrolledAt: "2024-01-15T00:00:00Z",
            completedAt: "2024-02-15T00:00:00Z",
            completedLessons: 12,
            totalLessons: 12,
            lastAccessedAt: "2024-02-15T00:00:00Z",
            enrollmentType: "subscription",
            price: 0,
            certificateUrl:
              "https://example.com/certificates/sarah-cv-fundamentals",
          },
          {
            id: 3,
            courseId: 57,
            title: "Machine Learning with Python & TensorFlow",
            instructor: "Dr. Emily Chen",
            thumbnail:
              "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop&auto=format",
            progress: 35,
            status: "in_progress",
            enrolledAt: "2024-02-01T00:00:00Z",
            completedLessons: 7,
            totalLessons: 20,
            lastAccessedAt: new Date().toISOString(),
            enrollmentType: "subscription",
            price: 0,
            nextLesson: {
              id: 8,
              title: "Neural Network Basics",
              type: "video",
            },
          },
        ];
        localStorage.setItem(
          "enrolledCourses",
          JSON.stringify(enrolledCourses)
        );

        // Set up learning streaks and goals
        localStorage.setItem("currentStreak", "12");
        localStorage.setItem("longestStreak", "18");
      }

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "Learner"
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Map UserRole to registration role (Learner -> Student, Creator -> Instructor)
      const registrationRole = role === "Creator" ? "Instructor" : "Student";
      const response = await api.register(
        email,
        password,
        fullName,
        registrationRole
      );

      if (response.error) {
        return { success: false, error: response.error };
      }

      const authData: AuthResponseData = response.data as AuthResponseData;

      // Check if user is pending approval
      if (authData.status === "PendingApproval") {
        return {
          success: true,
          error:
            "Your registration is pending admin approval. You will receive an email once your account is approved.",
        };
      }

      const migratedRole = migrateRole(authData.role);
      const userData: User = {
        id: authData.id,
        name: authData.fullName,
        email: authData.email,
        role: migratedRole,
        avatar: authData.avatar,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      };

      setUser(userData);
      api.setToken(authData.accessToken);
      if (authData.refreshToken) {
        api.setRefreshToken(authData.refreshToken);
      }
      localStorage.setItem("auth", JSON.stringify(authData));

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "Registration failed. Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      if (user?.accessToken) {
        await api.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      api.setToken(null);
      api.setRefreshToken(null);
      localStorage.removeItem("auth");
    }
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      // In a real app, this would require backend validation
      // For demo purposes, we'll allow role switching
      const updatedUser = { ...user, role };
      setUser(updatedUser);

      // Update localStorage
      const savedAuth = localStorage.getItem("auth");
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        authData.role = role;
        localStorage.setItem("auth", JSON.stringify(authData));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        updateUserRole: switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
