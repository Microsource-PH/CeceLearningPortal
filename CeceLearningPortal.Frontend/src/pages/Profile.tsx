import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserId } from "@/hooks/useUserId";
import userService, { UserProfile, UserStats } from "@/services/userService";
import studentService from "@/services/studentService";
import subscriptionService from "@/services/subscriptionService";
import { NotificationSettings } from "@/components/Profile/NotificationSettings";
import SecuritySettings from "@/components/Profile/SecuritySettings";
import BillingSettings from "@/components/Profile/BillingSettings";
import { CourseAnalytics } from "@/components/Creator/CourseAnalytics";
import { EarningsReport } from "@/components/Creator/EarningsReport";
import { formatPHP } from "@/utils/currency";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Award,
  BookOpen,
  Clock,
  Star,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Download,
  ExternalLink,
  Users,
  DollarSign,
  TrendingUp,
  Save,
  X,
  Camera,
  Phone,
  Linkedin,
  Twitter,
  Github,
  Briefcase,
  Target,
  FileText,
  BarChart3,
  Crown,
} from "lucide-react";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const userId = useUserId();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [instructorStats, setInstructorStats] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);

  const [editForm, setEditForm] = useState({
    fullName: "",
    bio: "",
    location: "",
    phoneNumber: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      github: "",
    },
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Use the mapped user ID from useUserId hook
      const mappedUserId = userId || user.id;

      // Fetch user profile
      const profileResponse = await userService.getProfile(mappedUserId);
      if (profileResponse.data) {
        const profile = profileResponse.data as UserProfile;
        setUserProfile(profile);
        setEditForm({
          fullName: profile.fullName || "",
          bio: profile.bio || "",
          location: profile.location || "",
          phoneNumber: profile.phoneNumber || "",
          socialLinks: profile.socialLinks || {
            linkedin: "",
            twitter: "",
            github: "",
          },
        });
      }

      // Fetch user stats
      const statsResponse = await userService.getUserStats(mappedUserId);
      if (statsResponse.data) {
        setUserStats(statsResponse.data as UserStats);
      }

      // Fetch certificates
      const certificatesResponse =
        await userService.getUserCertificates(mappedUserId);
      if (certificatesResponse.data) {
        setCertificates(certificatesResponse.data as any[]);
      }

      // Fetch activity history
      const activityResponse =
        await userService.getActivityHistory(mappedUserId);
      if (activityResponse.data) {
        setRecentActivity(activityResponse.data as any[]);
      }

      // Fetch role-specific stats
      if (user.role === "Learner") {
        // Fetch student stats
        const studentStatsResponse = await studentService.getStudentStats();
        if (studentStatsResponse.data) {
          setStudentStats(studentStatsResponse.data);
        }

        // Fetch subscription
        const subscriptionResponse =
          await subscriptionService.getMySubscription();
        if (subscriptionResponse.data) {
          setSubscription(subscriptionResponse.data);
        }

        // Fetch enrolled courses (limited to 5 for profile)
        const coursesResponse = await studentService.getEnrolledCourses();
        if (coursesResponse.data) {
          setEnrolledCourses(coursesResponse.data.slice(0, 5));
        }
      } else if (user.role === "Creator") {
        const instructorStatsResponse =
          await userService.getInstructorStats(mappedUserId);
        if (instructorStatsResponse.data) {
          setInstructorStats(instructorStatsResponse.data);
        }
      } else if (user.role === "Admin") {
        const adminStatsResponse = await userService.getAdminStats();
        if (adminStatsResponse.data) {
          setAdminStats(adminStatsResponse.data);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      const response = await userService.updateProfile(user.id, editForm);

      if (response.data) {
        setUserProfile(response.data);
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: response.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await userService.uploadAvatar(file);
      if (response.data) {
        await fetchUserData();
        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been updated.",
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "course_completed":
        return { icon: Award, color: "text-learning-success" };
      case "lesson_finished":
        return { icon: BookOpen, color: "text-learning-blue" };
      case "certificate_earned":
        return { icon: Award, color: "text-learning-warning" };
      case "enrollment":
        return { icon: Users, color: "text-primary" };
      default:
        return { icon: Clock, color: "text-muted-foreground" };
    }
  };

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

  const handleDownloadCertificate = async (certificateId: string) => {
    try {
      const response = await userService.downloadCertificate(certificateId);
      if (response.data?.url) {
        // Create a download link
        const link = document.createElement("a");
        link.href = response.data.url;
        link.download = `certificate-${certificateId}.txt`;
        link.click();

        toast({
          title: "Certificate Downloaded",
          description: "Your certificate has been downloaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyCertificate = (certificateId: string) => {
    // Open verification page in new tab
    window.open(`/verify-certificate/${certificateId}`, "_blank");
  };

  // Settings content component
  const SettingsContent = () => (
    <Tabs defaultValue="notifications" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="notifications" className="mt-6">
        <NotificationSettings />
      </TabsContent>
      <TabsContent value="security" className="mt-6">
        <SecuritySettings />
      </TabsContent>
      <TabsContent value="billing" className="mt-6">
        <BillingSettings />
      </TabsContent>
    </Tabs>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
            <p className="text-muted-foreground">
              Please try logging in again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    ...(user?.role === "Learner"
      ? [{ id: "certificates", label: "Certificates", icon: Award }]
      : []),
    ...(user?.role === "Creator"
      ? [
          { id: "teaching", label: "Teaching", icon: Briefcase },
          { id: "analytics", label: "Analytics", icon: BarChart3 },
          { id: "earnings", label: "Earnings", icon: DollarSign },
        ]
      : []),
    ...(user?.role === "Admin"
      ? [{ id: "administration", label: "Administration", icon: Shield }]
      : []),
    { id: "activity", label: "Activity", icon: Clock },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-card rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={
                    userProfile.avatar ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format"
                  }
                  alt={userProfile.fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                )}
              </div>

              <div>
                {isEditing ? (
                  <Input
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                    className="text-2xl font-bold mb-2"
                    placeholder="Full Name"
                  />
                ) : (
                  <h1 className="text-3xl font-bold mb-2">
                    {userProfile.fullName}
                  </h1>
                )}
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {userProfile.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      user?.role === "Admin"
                        ? "destructive"
                        : user?.role === "Creator"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {user?.role}
                  </Badge>
                </div>
                {(userProfile.location || isEditing) && (
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    {isEditing ? (
                      <Input
                        value={editForm.location}
                        onChange={(e) =>
                          setEditForm({ ...editForm, location: e.target.value })
                        }
                        placeholder="Location"
                        className="h-6"
                      />
                    ) : (
                      userProfile.location
                    )}
                  </p>
                )}
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(userProfile.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {(userProfile.bio || isEditing) && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">About</h3>
              {isEditing ? (
                <Textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              ) : (
                <p className="text-muted-foreground">{userProfile.bio}</p>
              )}
            </div>
          )}

          {/* Social Links */}
          {(userProfile.socialLinks || isEditing) && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Social Links</h3>
              <div className="flex gap-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={editForm.socialLinks.linkedin}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              linkedin: e.target.value,
                            },
                          })
                        }
                        placeholder="LinkedIn URL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={editForm.socialLinks.twitter}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              twitter: e.target.value,
                            },
                          })
                        }
                        placeholder="Twitter URL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="github">GitHub</Label>
                      <Input
                        id="github"
                        value={editForm.socialLinks.github}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              github: e.target.value,
                            },
                          })
                        }
                        placeholder="GitHub URL"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {userProfile.socialLinks?.linkedin && (
                      <a
                        href={userProfile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <Linkedin className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    {userProfile.socialLinks?.twitter && (
                      <a
                        href={userProfile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <Twitter className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    {userProfile.socialLinks?.github && (
                      <a
                        href={userProfile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <Github className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" &&
          user?.role === "Learner" &&
          studentStats && (
            <div className="space-y-8">
              {/* Student Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Courses
                        </p>
                        <p className="text-2xl font-bold text-learning-blue">
                          {studentStats.totalCourses}
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
                          Completed
                        </p>
                        <p className="text-2xl font-bold text-learning-success">
                          {studentStats.completedCourses}
                        </p>
                      </div>
                      <Award className="w-8 h-8 text-learning-success/60" />
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
                          {studentStats.learningHours}
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
                          Avg Score
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {studentStats.averageScore}%
                        </p>
                      </div>
                      <Star className="w-8 h-8 text-primary/60" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Subscription */}
              {subscription ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-learning-warning" />
                      Active Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gradient-card rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {subscription.planId === "premium"
                              ? "Premium Plan"
                              : subscription.planId === "basic"
                                ? "Basic Plan"
                                : subscription.planId === "annual"
                                  ? "Annual Premium"
                                  : "Subscription"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {subscription.planId === "basic"
                              ? "Access to 100+ courses"
                              : "Unlimited access to all courses"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Valid until:{" "}
                            {new Date(
                              subscription.endDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {formatPHP(subscription.amount)}
                            <span className="text-sm font-normal text-muted-foreground">
                              /
                              {subscription.planId === "annual"
                                ? "year"
                                : "month"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-muted-foreground" />
                      No Active Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Get unlimited access to all courses
                    </p>
                    <Button onClick={() => navigate("/pricing")}>
                      View Plans
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Learning Streak */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Streak</CardTitle>
                  <CardDescription>
                    Keep up your daily learning habit!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Current Streak
                      </p>
                      <p className="text-3xl font-bold text-learning-blue">
                        {studentStats.currentStreak} days
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Longest Streak
                      </p>
                      <p className="text-3xl font-bold text-learning-warning">
                        {studentStats.longestStreak} days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enrolled Courses */}
              {enrolledCourses.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>My Courses</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/courses")}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {enrolledCourses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg"
                        >
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{course.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{course.progress}% complete</span>
                              <span>
                                {course.completedLessons}/{course.totalLessons}{" "}
                                lessons
                              </span>
                            </div>
                          </div>
                          <Progress
                            value={course.progress}
                            className="w-20 h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

        {activeTab === "overview" && userStats && user?.role !== "Learner" && (
          <div className="space-y-8">
            {/* Non-student stats (keep existing code) */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-gradient-card shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Courses
                      </p>
                      <p className="text-2xl font-bold text-learning-blue">
                        {userStats.totalCourses}
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
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-learning-success">
                        {userStats.completedCourses}
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-learning-success/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Hours
                      </p>
                      <p className="text-2xl font-bold text-learning-warning">
                        {userStats.totalHours}
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
                      <p className="text-sm text-muted-foreground">Avg Score</p>
                      <p className="text-2xl font-bold text-primary">
                        {userStats.averageScore}%
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Streak */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Streak</CardTitle>
                <CardDescription>
                  Keep up your daily learning habit!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Current Streak
                    </p>
                    <p className="text-3xl font-bold text-learning-blue">
                      {userStats.currentStreak} days
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Longest Streak
                    </p>
                    <p className="text-3xl font-bold text-learning-warning">
                      {userStats.longestStreak} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "certificates" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <Card
                key={cert.id}
                className="hover:shadow-card-hover transition-all"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{cert.title}</CardTitle>
                  <CardDescription>
                    Issued on {formatDate(cert.issueDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Certificate ID: {cert.credentialId}
                    </p>
                    {cert.validUntil && (
                      <p className="text-sm text-muted-foreground">
                        Valid until: {formatDate(cert.validUntil)}
                      </p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCertificate(cert.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyCertificate(cert.id)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Verify
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "analytics" && user?.role === "Creator" && (
          <CourseAnalytics creatorId={userId || user.id} />
        )}

        {activeTab === "earnings" && user?.role === "Creator" && (
          <EarningsReport creatorId={userId || user.id} />
        )}

        {activeTab === "activity" && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your learning journey timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const { icon: Icon, color } = getActivityIcon(activity.type);
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 pb-4 border-b last:border-0"
                    >
                      <div className={`mt-1 ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "teaching" &&
          user?.role === "Creator" &&
          instructorStats && (
            <div className="space-y-8">
              {/* Instructor Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Students
                        </p>
                        <p className="text-2xl font-bold text-learning-blue">
                          {instructorStats.totalStudents.toLocaleString()}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-learning-blue/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Courses Created
                        </p>
                        <p className="text-2xl font-bold text-learning-success">
                          {instructorStats.activeCourses}
                        </p>
                      </div>
                      <BookOpen className="w-8 h-8 text-learning-success/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-bold text-learning-warning">
                          {formatPHP(instructorStats.totalRevenue)}
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
                          Avg Rating
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {instructorStats.averageRating}
                        </p>
                      </div>
                      <Star className="w-8 h-8 text-primary/60" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Teaching Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Teaching Performance</CardTitle>
                  <CardDescription>
                    Your instructor metrics and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Course Completion Rate</span>
                      <span className="font-medium">
                        {instructorStats.completionRate}%
                      </span>
                    </div>
                    <Progress
                      value={instructorStats.completionRate}
                      className="h-2"
                    />

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm">Student Satisfaction</span>
                      <span className="font-medium">
                        {instructorStats.studentSatisfaction}%
                      </span>
                    </div>
                    <Progress
                      value={instructorStats.studentSatisfaction}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        {activeTab === "administration" &&
          user?.role === "Admin" &&
          adminStats && (
            <div className="space-y-8">
              {/* Admin Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Users
                        </p>
                        <p className="text-2xl font-bold text-learning-blue">
                          {adminStats.totalUsers.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          +{adminStats.newUsersToday} today
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-learning-blue/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Active Courses
                        </p>
                        <p className="text-2xl font-bold text-learning-success">
                          {adminStats.activeCourses}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {adminStats.coursesUnderReview} under review
                        </p>
                      </div>
                      <BookOpen className="w-8 h-8 text-learning-success/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Platform Revenue
                        </p>
                        <p className="text-2xl font-bold text-learning-warning">
                          {formatPHP(adminStats.platformRevenue)}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-learning-warning/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Support Tickets
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {adminStats.supportTickets}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {adminStats.openTickets} open
                        </p>
                      </div>
                      <FileText className="w-8 h-8 text-primary/60" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Administrative Actions</CardTitle>
                  <CardDescription>
                    Quick access to admin functions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/admin/users")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/admin")}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Review Courses
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/admin")}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Platform Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/admin")}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

        {activeTab === "settings" && <SettingsContent />}
      </div>
    </div>
  );
};

export default Profile;
