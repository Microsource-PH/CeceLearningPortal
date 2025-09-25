import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import adminService from "@/services/adminService";
import {
  Users,
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Star,
  ChevronDown,
  Filter,
  Download,
  Search,
  BarChart3,
  PieChart,
  Calendar,
  UserCheck,
  Medal,
  Trophy,
  CheckCircle,
  Send,
  Eye,
  Plus,
  Sparkles,
  Shield,
  Settings,
  Briefcase,
  DollarSign,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, CreditCard } from "lucide-react";
import { SubscribersManagement } from "@/components/Admin/SubscribersManagement";
import { UserManagementEnhanced } from "@/components/Admin/UserManagementEnhanced";
import { CourseManagement } from "@/components/Admin/CourseManagement";
import { formatRating, formatDecimal, formatPercentage } from "@/utils/format";
import { formatPHP } from "@/utils/currency";

const Admin: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("This month");
  const [selectedYear, setSelectedYear] = useState("This year");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState<{ [key: string]: boolean }>({});

  // Data states
  const [adminMetrics, setAdminMetrics] = useState<any>(null);
  const [courseCompletions, setCourseCompletions] = useState<any[]>([]);
  const [topMentors, setTopMentors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [onboardingSteps, setOnboardingSteps] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [courseStatistics, setCourseStatistics] = useState<any[]>([]);
  const [recentSignups, setRecentSignups] = useState<any[]>([]);

  // User management states
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilters, setUserFilters] = useState({
    role: "all",
    status: "all",
  });

  // Check authentication and role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "Admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
  }, [isAuthenticated, user, navigate, toast]);

  useEffect(() => {
    if (user?.role === "Admin") {
      fetchAdminData();
    }
  }, [selectedPeriod, selectedYear, user]);

  // Optimize data fetching - only fetch when tab becomes active
  useEffect(() => {
    if (activeTab === "dashboard") return; // Dashboard data already fetched
    fetchTabSpecificData(activeTab);
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch admin metrics (always needed for dashboard)
      const metricsResponse =
        await adminService.getAdminMetrics(selectedPeriod);
      if (metricsResponse.data) {
        setAdminMetrics(metricsResponse.data);
      } else if (metricsResponse.error) {
        console.error("Failed to fetch admin metrics:", metricsResponse.error);
        // Set default metrics to prevent blank page
        setAdminMetrics({
          totalActiveUsers: 0,
          totalMentors: 0,
          newTrainingsOrganized: 0,
          trainingHoursPerUser: 0,
          learningSatisfactionRate: 0,
          positiveFeedback: 0,
          negativeFeedback: 0,
          averageCompletionRate: 0,
          totalCourses: 0,
          totalRevenue: 0,
          newUsersToday: 0,
          activeNow: 0,
          supportTickets: 0,
          coursesUnderReview: 0,
        });
      }

      // Fetch dashboard-specific data
      const completionsResponse = await adminService.getCourseCompletions();
      if (completionsResponse.data) {
        setCourseCompletions(completionsResponse.data);
      }

      const mentorsResponse = await adminService.getTopMentors(selectedYear);
      if (mentorsResponse.data) {
        setTopMentors(mentorsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTabSpecificData = async (tab: string) => {
    try {
      setTabLoading((prev) => ({ ...prev, [tab]: true }));
      switch (tab) {
        case "users":
        case "team":
          const usersResponse = await adminService.getAllUsers();
          if (usersResponse.data) {
            setUsers(usersResponse.data);
          }
          const teamResponse = await adminService.getTeamMembers();
          if (teamResponse.data) {
            setTeamMembers(teamResponse.data);
          }
          break;
        case "courses":
        case "statistics":
          const coursesResponse = await adminService.getAllCourses();
          if (coursesResponse.data) {
            setCourses(coursesResponse.data);
          }
          const statsResponse = await adminService.getCourseStatistics();
          if (statsResponse.data) {
            setCourseStatistics(statsResponse.data);
          }
          break;
        case "policies":
          const policiesResponse = await adminService.getPolicies();
          if (policiesResponse.data) {
            setPolicies(policiesResponse.data);
          }
          break;
        case "tasks":
          const tasksResponse = await adminService.getTasks();
          if (tasksResponse.data) {
            setTasks(tasksResponse.data);
          }
          break;
        case "onboarding":
          const onboardingResponse = await adminService.getOnboardingProgress();
          if (onboardingResponse.data) {
            setOnboardingSteps(onboardingResponse.data);
          }
          const signupsResponse = await adminService.getRecentSignups();
          if (signupsResponse.data) {
            setRecentSignups(signupsResponse.data);
          }
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
    } finally {
      setTabLoading((prev) => ({ ...prev, [tab]: false }));
    }
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "User Management", icon: Users },
    { id: "courses", label: "Course Management", icon: BookOpen },
    { id: "subscribers", label: "Subscribers", icon: CreditCard },
    { id: "badges", label: "Badge Management", icon: Award },
    { id: "policies", label: "Policies", icon: BookOpen },
    { id: "tasks", label: "Tasks", icon: Target },
    { id: "onboarding", label: "Onboarding", icon: UserCheck },
    { id: "team", label: "My team", icon: Users },
    { id: "statistics", label: "Course Statistics", icon: PieChart },
  ];

  const issueBadge = async (completionId: number) => {
    try {
      const response = await adminService.issueBadge(completionId, {
        type: "completion",
        timestamp: new Date().toISOString(),
      });

      if (response.success) {
        toast({
          title: "Badge Issued",
          description: "Certificate badge has been issued successfully.",
        });
        // Refresh data if needed
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to issue badge",
        variant: "destructive",
      });
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await adminService.updateUserStatus(userId, newStatus);
      if (response.success) {
        toast({
          title: "Status Updated",
          description: "User status has been updated successfully.",
        });

        // Refresh users
        const usersResponse = await adminService.getAllUsers();
        if (usersResponse.data) {
          setUsers(usersResponse.data);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;

    return date.toLocaleDateString();
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesRole =
      userFilters.role === "all" || user.role === userFilters.role;
    const matchesStatus =
      userFilters.status === "all" || user.status === userFilters.status;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleExportReport = async (type: string) => {
    try {
      const response = await adminService.exportReport(type);
      if (response.data?.url) {
        // Create download link
        const link = document.createElement("a");
        link.href = response.data.url;
        link.download = `admin-report-${type}-${new Date().toISOString()}.txt`;
        link.click();

        toast({
          title: "Report Exported",
          description: "Your report has been downloaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      });
    }
  };

  const CertificationBadge = () => (
    <div className="relative inline-block">
      <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
        <div className="text-center">
          <Award className="w-8 h-8 text-white mx-auto mb-1" />
          <div className="text-xs font-bold text-white">CERTIFIED</div>
        </div>
      </div>
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-blue-600"></div>
      </div>
      <div className="absolute -top-1 -right-1">
        <Sparkles className="w-4 h-4 text-yellow-400" />
      </div>
    </div>
  );

  // Check if user has access before rendering
  if (!isAuthenticated || user?.role !== "Admin") {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You need admin privileges to access this page.
            </p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-lg">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  // If no admin metrics after loading, show error state
  if (!adminMetrics) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              Failed to Load Admin Panel
            </h2>
            <p className="text-muted-foreground mb-4">
              Unable to fetch admin data.
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex">
        {/* Enhanced Admin Sidebar */}
        <div className="w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-purple-900 text-white min-h-screen p-6 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-blue-200 text-sm">Management Center</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setActiveTab(item.id)}
                disabled={tabLoading[item.id]}
                className={`w-full justify-start text-left p-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id
                    ? "bg-white/20 text-white shadow-lg border border-white/10"
                    : "text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1"
                } ${tabLoading[item.id] ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
                {tabLoading[item.id] && (
                  <div className="ml-auto">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </Button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-blue-100">Quick Actions</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs text-cyan-300 hover:text-white"
              >
                Export Reports
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content with Enhanced Design */}
        <div className="flex-1 p-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsContent value="dashboard">
              {/* Enhanced Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your learning platform efficiently
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search users, courses..."
                      className="pl-10 w-96 bg-white/50 backdrop-blur-sm border-white/20"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-white/50 backdrop-blur-sm"
                  >
                    {selectedPeriod}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Enhanced Metrics Grid */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 bg-gradient-to-br from-blue-50 to-white border-blue-200/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 text-blue-500" />
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {(adminMetrics?.totalActiveUsers || 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Active Users
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 bg-gradient-to-br from-purple-50 to-white border-purple-200/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <UserCheck className="w-8 h-8 text-purple-500" />
                      <Badge className="bg-purple-100 text-purple-700">
                        +5%
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {adminMetrics?.totalMentors || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expert Mentors
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 bg-gradient-to-br from-green-50 to-white border-green-200/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <BookOpen className="w-8 h-8 text-green-500" />
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {adminMetrics?.newTrainingsOrganized || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      New Trainings
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 bg-gradient-to-br from-orange-50 to-white border-orange-200/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Clock className="w-8 h-8 text-orange-500" />
                      <Badge className="bg-orange-100 text-orange-700">
                        Avg
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {adminMetrics?.trainingHoursPerUser || 0}h
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hours per User
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Top Mentors Section */}
              <Card className="shadow-elegant bg-white/80 backdrop-blur-sm border-white/50">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    🌟 Top Mentors
                  </CardTitle>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-white/70"
                  >
                    {selectedYear}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">
                            Mentor
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">
                            Specialization
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">
                            Trainings
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">
                            People Trained
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">
                            Rating
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {topMentors.map((mentor) => (
                          <tr
                            key={mentor.id}
                            className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-25 hover:to-purple-25 transition-all duration-200"
                          >
                            <td className="py-5 px-4">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <img
                                    src={mentor.avatar}
                                    alt={mentor.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                  />
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <span className="font-semibold text-gray-800">
                                  {mentor.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-5 px-4">
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-700"
                              >
                                {mentor.specialization}
                              </Badge>
                            </td>
                            <td className="py-5 px-4 font-semibold text-blue-600">
                              {mentor.trainingsOrganized}
                            </td>
                            <td className="py-5 px-4 font-semibold text-green-600">
                              {mentor.peopleTrained}
                            </td>
                            <td className="py-5 px-4">
                              <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-gray-800">
                                  {formatRating(mentor.rating)}
                                </span>
                                <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                  Top
                                </Badge>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="badges">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Badge Management
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Issue certificates and badges to course completers
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Badge
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Certification Badge</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 p-4">
                        <div className="text-center">
                          <CertificationBadge />
                          <p className="text-sm text-muted-foreground mt-2">
                            Preview Badge
                          </p>
                        </div>
                        <Input placeholder="Badge Title" />
                        <Input placeholder="Course Name" />
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                          Create Badge Template
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Course Completions for Badge Issuance */}
                <Card className="shadow-elegant bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                      Recent Course Completions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {courseCompletions.map((completion) => (
                        <div
                          key={completion.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={completion.studentAvatar}
                                alt={completion.studentName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                              {completion.score >= 90 && (
                                <div className="absolute -top-1 -right-1">
                                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {completion.studentName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {completion.courseName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  Score: {formatPercentage(completion.score)}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {completion.completionDate}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {completion.badgeIssued ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <Badge className="bg-green-100 text-green-700">
                                  Badge Issued
                                </Badge>
                              </div>
                            ) : (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                  >
                                    <Award className="w-4 h-4 mr-2" />
                                    Issue Badge
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Issue Certification Badge
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-6 p-4">
                                    <div className="text-center">
                                      <CertificationBadge />
                                      <h3 className="font-bold text-lg mt-3">
                                        {completion.studentName}
                                      </h3>
                                      <p className="text-muted-foreground">
                                        {completion.courseName}
                                      </p>
                                      <Badge className="bg-green-100 text-green-700 mt-2">
                                        Score:{" "}
                                        {formatPercentage(completion.score)}
                                      </Badge>
                                    </div>

                                    <div className="space-y-3">
                                      <div className="p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-semibold text-blue-800">
                                          Certification Details
                                        </h4>
                                        <p className="text-sm text-blue-600 mt-1">
                                          This badge certifies that{" "}
                                          {completion.studentName} has
                                          successfully completed
                                          {completion.courseName} with a score
                                          of{" "}
                                          {formatPercentage(completion.score)}.
                                        </p>
                                      </div>

                                      <Button
                                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                                        onClick={() =>
                                          issueBadge(completion.id)
                                        }
                                      >
                                        <Send className="w-4 h-4 mr-2" />
                                        Issue Certificate Badge
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Policies Management */}
            <TabsContent value="policies">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Policies Management
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Manage learning policies and guidelines
                    </p>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Policy
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                        Learning Policies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        {
                          name: "Course Completion Requirements",
                          status: "Active",
                          updated: "2 days ago",
                        },
                        {
                          name: "Assessment Guidelines",
                          status: "Active",
                          updated: "1 week ago",
                        },
                        {
                          name: "Certificate Standards",
                          status: "Draft",
                          updated: "3 days ago",
                        },
                      ].map((policy, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{policy.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Updated {policy.updated}
                            </p>
                          </div>
                          <Badge
                            variant={
                              policy.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {policy.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        Compliance Rules
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        {
                          name: "Data Privacy Policy",
                          compliance: "100%",
                          priority: "High",
                        },
                        {
                          name: "User Safety Guidelines",
                          compliance: "95%",
                          priority: "High",
                        },
                        {
                          name: "Content Moderation",
                          compliance: "88%",
                          priority: "Medium",
                        },
                      ].map((rule, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{rule.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Compliance: {rule.compliance}
                            </p>
                          </div>
                          <Badge
                            variant={
                              rule.priority === "High"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {rule.priority}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Subscribers Management */}
            <TabsContent value="subscribers">
              <SubscribersManagement />
            </TabsContent>

            {/* Tasks Management */}
            <TabsContent value="tasks">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Task Management
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Manage administrative tasks and assignments
                    </p>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <Card className="shadow-elegant">
                    <CardHeader className="bg-yellow-50">
                      <CardTitle className="text-yellow-800">
                        Pending Tasks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {[
                        {
                          task: "Review new course submissions",
                          due: "Today",
                          priority: "High",
                        },
                        {
                          task: "Update user permissions",
                          due: "Tomorrow",
                          priority: "Medium",
                        },
                        {
                          task: "Generate monthly report",
                          due: "2 days",
                          priority: "Low",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white border rounded-lg"
                        >
                          <p className="font-medium text-sm">{item.task}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-muted-foreground">
                              Due: {item.due}
                            </span>
                            <Badge
                              variant={
                                item.priority === "High"
                                  ? "destructive"
                                  : item.priority === "Medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {item.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="shadow-elegant">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-blue-800">
                        In Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {[
                        {
                          task: "Course content audit",
                          progress: "75%",
                          assignee: "John Doe",
                        },
                        {
                          task: "User feedback analysis",
                          progress: "40%",
                          assignee: "Jane Smith",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white border rounded-lg"
                        >
                          <p className="font-medium text-sm">{item.task}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Assignee: {item.assignee}
                          </p>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{item.progress}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: item.progress }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="shadow-elegant">
                    <CardHeader className="bg-green-50">
                      <CardTitle className="text-green-800">
                        Completed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {[
                        {
                          task: "Monthly backup verification",
                          completed: "Yesterday",
                        },
                        { task: "Security audit", completed: "2 days ago" },
                        {
                          task: "Database optimization",
                          completed: "1 week ago",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white border rounded-lg"
                        >
                          <p className="font-medium text-sm">{item.task}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-muted-foreground">
                              Completed {item.completed}
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Onboarding */}
            <TabsContent value="onboarding">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      User Onboarding
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Manage new user onboarding process
                    </p>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-500" />
                        Onboarding Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          {
                            step: "Account Setup",
                            completion: 92,
                            users: 1645,
                          },
                          {
                            step: "Profile Completion",
                            completion: 78,
                            users: 1384,
                          },
                          {
                            step: "First Course Enrollment",
                            completion: 65,
                            users: 1161,
                          },
                          {
                            step: "First Assessment",
                            completion: 43,
                            users: 768,
                          },
                        ].map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{item.step}</span>
                              <span className="text-muted-foreground">
                                {formatPercentage(item.completion)} (
                                {item.users} users)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                style={{ width: `${item.completion}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-500" />
                        Recent Signups
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            name: "Alice Cooper",
                            email: "alice@example.com",
                            joined: "2 hours ago",
                            status: "Active",
                          },
                          {
                            name: "Bob Wilson",
                            email: "bob@example.com",
                            joined: "5 hours ago",
                            status: "In Progress",
                          },
                          {
                            name: "Carol Brown",
                            email: "carol@example.com",
                            joined: "1 day ago",
                            status: "Completed",
                          },
                          {
                            name: "David Lee",
                            email: "david@example.com",
                            joined: "2 days ago",
                            status: "Pending",
                          },
                        ].map((user, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Joined {user.joined}
                              </p>
                            </div>
                            <Badge
                              variant={
                                user.status === "Completed"
                                  ? "default"
                                  : user.status === "Active"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {user.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* My Team */}
            <TabsContent value="team">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Team Management
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Manage your administrative team
                    </p>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>

                <div className="grid lg:grid-cols-4 gap-6 mb-6">
                  <Card className="shadow-elegant bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-6 text-center">
                      <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-muted-foreground">
                        Total Members
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-elegant bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="p-6 text-center">
                      <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">9</div>
                      <div className="text-sm text-muted-foreground">
                        Active Today
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-elegant bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-6 text-center">
                      <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">
                        3
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Admins
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-elegant bg-gradient-to-br from-orange-50 to-white">
                    <CardContent className="p-6 text-center">
                      <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600">
                        24
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tasks Assigned
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          name: "John Administrator",
                          role: "Super Admin",
                          email: "john@admin.com",
                          status: "Online",
                          lastActive: "Now",
                          avatar:
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format",
                        },
                        {
                          name: "Sarah Manager",
                          role: "Content Manager",
                          email: "sarah@admin.com",
                          status: "Online",
                          lastActive: "5m ago",
                          avatar:
                            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face&auto=format",
                        },
                        {
                          name: "Mike Moderator",
                          role: "Moderator",
                          email: "mike@admin.com",
                          status: "Away",
                          lastActive: "1h ago",
                          avatar:
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format",
                        },
                        {
                          name: "Lisa Support",
                          role: "Support",
                          email: "lisa@admin.com",
                          status: "Offline",
                          lastActive: "2h ago",
                          avatar:
                            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format",
                        },
                      ].map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                              <div
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                  member.status === "Online"
                                    ? "bg-green-500"
                                    : member.status === "Away"
                                      ? "bg-yellow-500"
                                      : "bg-gray-400"
                                }`}
                              ></div>
                            </div>
                            <div>
                              <h4 className="font-semibold">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {member.email}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Last active: {member.lastActive}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                member.role === "Super Admin"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {member.role}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Course Statistics */}
            <TabsContent value="statistics">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Course Statistics
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Detailed analytics and course performance metrics
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => handleExportReport("statistics")}
                  >
                    <Download className="w-4 h-4" />
                    Export Report
                  </Button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                  <Card className="shadow-elegant bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Courses
                          </p>
                          <p className="text-3xl font-bold text-blue-600">
                            156
                          </p>
                        </div>
                        <BookOpen className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="mt-4">
                        <Badge className="bg-green-100 text-green-700">
                          +12 this month
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-elegant bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Avg Completion Rate
                          </p>
                          <p className="text-3xl font-bold text-green-600">
                            {formatPercentage(87)}
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500" />
                      </div>
                      <div className="mt-4">
                        <Badge className="bg-green-100 text-green-700">
                          +5% from last month
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-elegant bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Student Satisfaction
                          </p>
                          <p className="text-3xl font-bold text-purple-600">
                            4.8
                          </p>
                        </div>
                        <Star className="w-8 h-8 text-purple-500" />
                      </div>
                      <div className="mt-4">
                        <Badge className="bg-purple-100 text-purple-700">
                          Excellent
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>Top Performing Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          name: "React Advanced Patterns",
                          students: 1247,
                          completion: 92,
                          rating: 4.9,
                          revenue: formatPHP(698320),
                        },
                        {
                          name: "JavaScript Fundamentals",
                          students: 2156,
                          completion: 89,
                          rating: 4.8,
                          revenue: formatPHP(1207360),
                        },
                        {
                          name: "UI/UX Design Principles",
                          students: 987,
                          completion: 85,
                          rating: 4.7,
                          revenue: formatPHP(552720),
                        },
                        {
                          name: "Node.js Backend Development",
                          students: 1543,
                          completion: 88,
                          rating: 4.8,
                          revenue: formatPHP(864080),
                        },
                        {
                          name: "Python for Beginners",
                          students: 1876,
                          completion: 91,
                          rating: 4.9,
                          revenue: formatPHP(1050560),
                        },
                      ].map((course, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-6 gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                        >
                          <div className="col-span-2">
                            <h4 className="font-semibold">{course.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {course.students} students enrolled
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-green-600">
                              {formatPercentage(course.completion)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Completion
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">
                                {formatRating(course.rating)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Rating
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-blue-600">
                              {course.revenue}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Revenue
                            </p>
                          </div>
                          <div className="flex justify-center">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* User Management */}
            <TabsContent value="users">
              <UserManagementEnhanced />
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="shadow-elegant bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Users
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {users.length}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant bg-gradient-to-br from-green-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Active Users
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {users.filter((u) => u.status === "Active").length}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant bg-gradient-to-br from-purple-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Creators
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {users.filter((u) => u.role === "Creator").length}
                        </p>
                      </div>
                      <Briefcase className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-elegant bg-gradient-to-br from-orange-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Revenue/User
                        </p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatPHP(
                            users.length > 0
                              ? users.reduce(
                                  (sum, u) => sum + (u.totalSpent || 0),
                                  0
                                ) / users.length
                              : 0
                          )}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Users Management Card */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex items-center gap-4">
                      <Select
                        value={userFilters.role}
                        onValueChange={(value) =>
                          setUserFilters({ ...userFilters, role: value })
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="Learner">Learners</SelectItem>
                          <SelectItem value="Creator">Creators</SelectItem>
                          <SelectItem value="Admin">Admins</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={userFilters.status}
                        onValueChange={(value) =>
                          setUserFilters({ ...userFilters, status: value })
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="ml-auto">
                        <Input
                          placeholder="Search users..."
                          className="w-[250px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* User Table */}
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Courses</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full"
                                  />
                                  <div>
                                    <div className="font-medium">
                                      {user.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.role === "Admin"
                                      ? "destructive"
                                      : user.role === "Creator"
                                        ? "secondary"
                                        : "default"
                                  }
                                >
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.status === "Active"
                                      ? "outline"
                                      : "secondary"
                                  }
                                >
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {formatDate(user.joinedDate)}
                              </TableCell>
                              <TableCell>
                                {user.coursesCompleted}/{user.coursesEnrolled}
                              </TableCell>
                              <TableCell>
                                {formatPHP(user.totalSpent)}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Send Message
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUserStatusChange(
                                          user.id,
                                          user.status === "Active"
                                            ? "Suspended"
                                            : "Active"
                                        )
                                      }
                                    >
                                      {user.status === "Active"
                                        ? "Suspend User"
                                        : "Activate User"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      Delete User
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Course Management */}
            <TabsContent value="courses">
              <CourseManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
