import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/LearningPortal/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import adminService from "@/services/adminService";
import { UserSubscriptionManagement } from "@/components/Admin/UserSubscriptionManagement";
import { CourseManagement } from "@/components/Admin/CourseManagement";
import { SubscriptionPlansManagement } from "@/components/Admin/SubscriptionPlansManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  Shield, 
  Package,
  BarChart,
  Settings,
  FileText,
  Bell,
  Activity,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle,
  Plus,
  Trophy,
  Sparkles,
  Star,
  Target,
  Clock,
  ListTodo,
  UserPlus,
  BarChart3,
  Send,
  Eye,
  Trash2,
  Edit,
  MoreVertical,
  Calendar,
  AlertCircle,
  XCircle
} from "lucide-react";

const Admin: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [courseCompletions, setCourseCompletions] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [onboardingSteps, setOnboardingSteps] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [courseStatistics, setCourseStatistics] = useState<any[]>([]);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'Admin') {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [isAuthenticated, user, navigate, toast]);

  // Fetch metrics when dashboard is active
  useEffect(() => {
    if (activeTab === 'dashboard' && user?.role === 'Admin') {
      fetchMetrics();
    }
  }, [activeTab, user]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAdminMetrics();
      if (response.data) {
        setMetrics(response.data);
      }
      
      // Fetch course completions for badges
      const completionsResponse = await adminService.getCourseCompletions();
      if (completionsResponse.data) {
        setCourseCompletions(completionsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tab-specific data
  useEffect(() => {
    const fetchTabData = async () => {
      try {
        switch (activeTab) {
          case 'policies':
            const policiesResponse = await adminService.getPolicies();
            if (policiesResponse.data) setPolicies(policiesResponse.data);
            break;
          case 'tasks':
            const tasksResponse = await adminService.getTasks();
            if (tasksResponse.data) setTasks(tasksResponse.data);
            break;
          case 'onboarding':
            const onboardingResponse = await adminService.getOnboardingProgress();
            if (onboardingResponse.data) setOnboardingSteps(onboardingResponse.data);
            break;
          case 'team':
            const teamResponse = await adminService.getTeamMembers();
            if (teamResponse.data) setTeamMembers(teamResponse.data);
            break;
          case 'statistics':
            const statsResponse = await adminService.getCourseStatistics();
            if (statsResponse.data) setCourseStatistics(statsResponse.data);
            break;
        }
      } catch (error) {
        console.error('Failed to fetch tab data:', error);
      }
    };

    if (activeTab !== 'dashboard') {
      fetchTabData();
    }
  }, [activeTab]);

  // Badge issuing functionality
  const handleIssueBadge = async (completionId: number) => {
    try {
      const response = await adminService.issueBadge(completionId, {
        type: 'completion',
        issuedDate: new Date().toISOString()
      });
      
      if (response.success) {
        toast({
          title: "Badge Issued",
          description: "Certificate badge has been issued successfully!",
        });
        // Refresh completions
        const completionsResponse = await adminService.getCourseCompletions();
        if (completionsResponse.data) {
          setCourseCompletions(completionsResponse.data);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to issue badge",
        variant: "destructive",
      });
    }
  };

  // Task management
  const handleCreateTask = async (task: any) => {
    try {
      const response = await adminService.createTask(task);
      if (response.success) {
        toast({
          title: "Task Created",
          description: "New task has been created successfully!",
        });
        // Refresh tasks
        const tasksResponse = await adminService.getTasks();
        if (tasksResponse.data) setTasks(tasksResponse.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  // Policy management
  const handleUpdatePolicy = async (policyId: string, updates: any) => {
    try {
      const response = await adminService.updatePolicy(policyId, updates);
      if (response.success) {
        toast({
          title: "Policy Updated",
          description: "Policy has been updated successfully!",
        });
        // Refresh policies
        const policiesResponse = await adminService.getPolicies();
        if (policiesResponse.data) setPolicies(policiesResponse.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update policy",
        variant: "destructive",
      });
    }
  };

  // Format helpers
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
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

  if (!isAuthenticated || user?.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-blue-900 to-purple-900 text-white min-h-screen p-6">
          <div className="mb-8">
            <h2 className="font-bold text-lg">Admin Panel</h2>
            <p className="text-blue-200 text-sm">Management Center</p>
          </div>
          
          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("dashboard")}
              className={`w-full justify-start text-white hover:bg-white/20 ${activeTab === "dashboard" ? "bg-white/20" : ""}`}
            >
              <BarChart className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("users")}
              className={`w-full justify-start text-white hover:bg-white/20 ${activeTab === "users" ? "bg-white/20" : ""}`}
            >
              <Users className="mr-2 h-4 w-4" />
              Users & Subscriptions
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("courses")}
              className={`w-full justify-start text-white hover:bg-white/20 ${activeTab === "courses" ? "bg-white/20" : ""}`}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Course Management
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("badges")}
              className={`w-full justify-start text-white hover:bg-white/20 ${activeTab === "badges" ? "bg-white/20" : ""}`}
            >
              <Award className="mr-2 h-4 w-4" />
              Badge Management
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("subscriptions")}
              className={`w-full justify-start text-white hover:bg-white/20 ${activeTab === "subscriptions" ? "bg-white/20" : ""}`}
            >
              <Package className="mr-2 h-4 w-4" />
              Subscription Plans
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("policies")}
              className={`w-full justify-start text-white hover:bg-white/20 ${activeTab === "policies" ? "bg-white/20" : ""}`}
            >
              <Shield className="mr-2 h-4 w-4" />
              Policies
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("tasks")}
              className={`w-full justify-start text-white hover:bg-white/20 ${activeTab === "tasks" ? "bg-white/20" : ""}`}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Tasks
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("onboarding")}
              className={`w-full justify-start text-white hover:bg-white/20 ${activeTab === "onboarding" ? "bg-white/20" : ""}`}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Onboarding
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("team")}
              className={`w-full justify-start text-white hover:bg-white/20 ${activeTab === "team" ? "bg-white/20" : ""}`}
            >
              <Users className="mr-2 h-4 w-4" />
              Team
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("statistics")}
              className={`w-full justify-start text-white hover:bg-white/20 ${activeTab === "statistics" ? "bg-white/20" : ""}`}
            >
              <Activity className="mr-2 h-4 w-4" />
              Statistics
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("reports")}
              className={`w-full justify-start text-white hover:bg-white/20 ${activeTab === "reports" ? "bg-white/20" : ""}`}
            >
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("settings")}
              className={`w-full justify-start text-white hover:bg-white/20 ${activeTab === "settings" ? "bg-white/20" : ""}`}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            
            <TabsContent value="dashboard">
              {/* Dashboard Content */}
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-gradient-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Active Users</p>
                          <p className="text-2xl font-bold">{metrics?.totalActiveUsers || 0}</p>
                          <p className="text-xs text-green-600 mt-1">
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            +12% from last month
                          </p>
                        </div>
                        <Users className="w-8 h-8 text-primary/60" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl font-bold">₱{metrics?.totalRevenue?.toLocaleString() || 0}</p>
                          <p className="text-xs text-green-600 mt-1">
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            +8% from last month
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500/60" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Courses</p>
                          <p className="text-2xl font-bold">{metrics?.totalCourses || 0}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {metrics?.coursesUnderReview || 0} under review
                          </p>
                        </div>
                        <BookOpen className="w-8 h-8 text-blue-500/60" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Completion Rate</p>
                          <p className="text-2xl font-bold">{metrics?.averageCompletionRate || 0}%</p>
                          <p className="text-xs text-green-600 mt-1">
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Above target
                          </p>
                        </div>
                        <Award className="w-8 h-8 text-purple-500/60" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Activity</CardTitle>
                      <CardDescription>Real-time platform metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Active Now</span>
                          </div>
                          <span className="font-semibold">{metrics?.activeNow || 0} users</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">New Users Today</span>
                          </div>
                          <span className="font-semibold">{metrics?.newUsersToday || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-purple-500" />
                            <span className="text-sm">Courses in Progress</span>
                          </div>
                          <span className="font-semibold">{metrics?.newTrainingsOrganized || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-orange-500" />
                            <span className="text-sm">Support Tickets</span>
                          </div>
                          <span className="font-semibold">{metrics?.supportTickets || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Learning Satisfaction</CardTitle>
                      <CardDescription>User feedback and satisfaction metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Satisfaction Rate</span>
                            <span className="font-semibold">{metrics?.learningSatisfactionRate?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${metrics?.learningSatisfactionRate || 0}%` }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{metrics?.positiveFeedback || 0}</p>
                            <p className="text-sm text-muted-foreground">Positive Reviews</p>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">{metrics?.negativeFeedback || 0}</p>
                            <p className="text-sm text-muted-foreground">Negative Reviews</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            
            <TabsContent value="users">
              <UserSubscriptionManagement />
            </TabsContent>
            
            <TabsContent value="courses">
              <CourseManagement />
            </TabsContent>
            
            <TabsContent value="subscriptions">
              <SubscriptionPlansManagement />
            </TabsContent>
            
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>Generate and export various reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 justify-start">
                      <FileText className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <p className="font-medium">User Activity Report</p>
                        <p className="text-sm text-muted-foreground">Export user engagement data</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 justify-start">
                      <DollarSign className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <p className="font-medium">Revenue Report</p>
                        <p className="text-sm text-muted-foreground">Financial performance metrics</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 justify-start">
                      <BookOpen className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <p className="font-medium">Course Performance</p>
                        <p className="text-sm text-muted-foreground">Course completion and ratings</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 justify-start">
                      <Users className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <p className="font-medium">Instructor Report</p>
                        <p className="text-sm text-muted-foreground">Creator performance metrics</p>
                      </div>
                    </Button>
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
                    <p className="text-muted-foreground mt-1">Issue certificates and badges to course completers</p>
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
                          <p className="text-sm text-muted-foreground mt-2">Preview Badge</p>
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
                        <div key={completion.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={completion.studentAvatar} alt={completion.studentName} />
                                <AvatarFallback>{completion.studentName?.charAt(0) || 'S'}</AvatarFallback>
                              </Avatar>
                              {completion.score >= 90 && (
                                <div className="absolute -top-1 -right-1">
                                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{completion.studentName}</h4>
                              <p className="text-sm text-gray-600">{completion.courseName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  Score: {completion.score}%
                                </Badge>
                                <span className="text-xs text-gray-500">{formatDate(completion.completionDate)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {completion.badgeIssued ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <Badge className="bg-green-100 text-green-700">Badge Issued</Badge>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => handleIssueBadge(completion.id)}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                              >
                                <Award className="w-4 h-4 mr-2" />
                                Issue Badge
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="policies">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Policies</CardTitle>
                  <CardDescription>Manage platform rules and guidelines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {policies.map((policy) => (
                      <div key={policy.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{policy.name}</h4>
                          <Badge className={policy.status === 'Active' ? 'bg-green-100 text-green-800' : ''}>
                            {policy.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{policy.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Last updated by {policy.updatedBy} on {formatDate(policy.lastUpdated)}
                          </span>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Task Management</CardTitle>
                      <CardDescription>Track and manage admin tasks</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          New Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Task</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Title</Label>
                            <Input placeholder="Task title" />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea placeholder="Task description" />
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <Select defaultValue="Medium">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Due Date</Label>
                            <Input type="date" />
                          </div>
                          <Button className="w-full">Create Task</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{task.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }>
                              {task.priority}
                            </Badge>
                            <Badge className={
                              task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'
                            }>
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Due: {formatDate(task.dueDate)}</span>
                          {task.assignee && <span className="text-muted-foreground">Assigned to: {task.assignee}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="onboarding">
              <Card>
                <CardHeader>
                  <CardTitle>User Onboarding Progress</CardTitle>
                  <CardDescription>Monitor and optimize the user onboarding experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {onboardingSteps.map((step, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{step.step}</h4>
                          <span className="text-sm text-muted-foreground">
                            {step.users} users ({step.completion}% completion)
                          </span>
                        </div>
                        <Progress value={step.completion} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                          Average time: {step.averageTime}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>Manage admin team and permissions</CardDescription>
                    </div>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>{member.name?.charAt(0) || 'T'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-muted-foreground">{member.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{member.role}</TableCell>
                          <TableCell>
                            <Badge className={
                              member.status === 'Online' ? 'bg-green-100 text-green-800' : 
                              member.status === 'Away' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }>
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{member.tasksAssigned} assigned</div>
                              <div className="text-muted-foreground">{member.tasksCompleted} completed</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(member.lastActive)}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="statistics">
              <Card>
                <CardHeader>
                  <CardTitle>Course Statistics</CardTitle>
                  <CardDescription>Detailed analytics for all courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Completion</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courseStatistics.map((course, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{course.name}</TableCell>
                          <TableCell>{course.instructor}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{course.category}</Badge>
                          </TableCell>
                          <TableCell>{course.students}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={course.completion} className="w-20 h-2" />
                              <span className="text-sm">{course.completion}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{course.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {course.revenue}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Settings</CardTitle>
                  <CardDescription>Configure platform settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Platform Configuration</h3>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="w-4 h-4 mr-2" />
                          Security Settings
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Bell className="w-4 h-4 mr-2" />
                          Notification Preferences
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Payment Gateway Configuration
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Package className="w-4 h-4 mr-2" />
                          API Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;