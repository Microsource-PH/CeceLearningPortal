import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Search,
  Filter,
  UserPlus,
  Edit,
  Ban,
  Shield,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Award,
  Eye,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import adminService from "@/services/adminService";
import subscriptionService from "@/services/subscriptionService";
import { toast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/utils/format";
import { formatPHP } from "@/utils/currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
  joinedDate: string;
  lastActive: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  totalSpent: number;
  phone?: string;
  location?: string;
  company?: string;
  subscription?: {
    id?: string;
    plan: string;
    planId?: string;
    status: string;
    expiresAt?: string;
    billingCycle?: string;
    price?: number;
    paymentMethod?: any;
    nextBillingDate?: string;
    startDate?: string;
  };
}

interface SubscriptionPlan {
  id: string | number;
  name: string;
  // Some backends return `type`, others `planType`, and sometimes as numeric enums
  type?: "learner" | "creator" | number;
  planType?: "learner" | "creator" | number;
  price: number;
  yearlyPrice?: number;
  billingCycle?: string;
  features: string[];
}

export const UserSubscriptionManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [sortBy, setSortBy] = useState<"name" | "date" | "spent">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState("overview");
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalNote, setApprovalNote] = useState("");
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchSubscriptionPlans()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers();
      if (response.data) {
        // Merge with subscription data
        const usersWithSubscriptions = await Promise.all(
          response.data.map(async (user) => {
            try {
              const subResponse = await adminService.getUserSubscription(
                user.id
              );
              if (subResponse.data) {
                console.log(`Subscription for ${user.name}:`, subResponse.data);
                // Handle the nested subscription structure from backend
                if (
                  subResponse.data.hasSubscription &&
                  subResponse.data.subscription
                ) {
                  return {
                    ...user,
                    subscription: {
                      id: subResponse.data.subscription.id?.toString(),
                      plan: subResponse.data.subscription.plan,
                      planId: subResponse.data.subscription.planId?.toString(),
                      status:
                        typeof subResponse.data.subscription.status === "number"
                          ? [
                              "Active",
                              "Inactive",
                              "Cancelled",
                              "PastDue",
                              "Trialing",
                            ][subResponse.data.subscription.status] || "Active"
                          : subResponse.data.subscription.status?.toString() ||
                            "Active",
                      expiresAt: subResponse.data.subscription.expiresAt,
                      billingCycle:
                        subResponse.data.subscription.billingCycle || "Monthly",
                      price: subResponse.data.subscription.amount,
                      nextBillingDate:
                        subResponse.data.subscription.nextBillingDate,
                      startDate: subResponse.data.subscription.startDate,
                    },
                  };
                }
              }
              return {
                ...user,
                subscription: undefined,
              };
            } catch {
              return user;
            }
          })
        );
        console.log("Users with subscriptions:", usersWithSubscriptions);
        setUsers(usersWithSubscriptions);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await adminService.getSubscriptionPlans();
      if (response.data) {
        console.log("Available subscription plans:", response.data);
        setSubscriptionPlans(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch subscription plans:", error);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await adminService.updateUserStatus(userId, newStatus);
      if (response.success) {
        toast({
          title: "Success",
          description: `User status updated to ${newStatus}`,
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await adminService.updateUserRole(userId, newRole);
      if (response.success) {
        toast({
          title: "Success",
          description: `User role updated to ${newRole}`,
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleSubscriptionUpdate = async () => {
    if (!selectedUser || !selectedPlan) return;

    try {
      const plan = subscriptionPlans.find(
        (p) => p.id?.toString() === selectedPlan
      );
      if (!plan) return;

      const response = await adminService.updateUserSubscription(
        selectedUser.id,
        selectedPlan,
        billingCycle === "yearly"
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Subscription updated successfully",
        });
        setIsSubscriptionModalOpen(false);
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const response =
        await subscriptionService.cancelSubscription(subscriptionId);
      if (response.data) {
        toast({
          title: "Success",
          description: "Subscription cancelled successfully",
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async () => {
    if (!selectedUser) return;

    setIsApproving(true);
    setProcessingUserId(selectedUser.id);
    try {
      const response = await adminService.approveUser({
        userId: selectedUser.id,
        approve: true,
        reason: approvalNote || "Welcome to the platform!",
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `${selectedUser.name} has been approved successfully`,
        });
        setIsApprovalModalOpen(false);
        setApprovalNote("");
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    } finally {
      setProcessingUserId(null);
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setIsRejecting(true);
    setProcessingUserId(selectedUser.id);
    try {
      const response = await adminService.approveUser({
        userId: selectedUser.id,
        approve: false,
        reason: rejectionReason,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `${selectedUser.name}'s registration has been rejected`,
        });
        setIsRejectionModalOpen(false);
        setRejectionReason("");
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
    } finally {
      setProcessingUserId(null);
      setIsRejecting(false);
    }
  };

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const openSubscriptionModal = (user: User) => {
    setSelectedUser(user);
    setSelectedPlan(user.subscription?.planId || "");
    setBillingCycle(
      user.subscription?.billingCycle === "Yearly" ? "yearly" : "monthly"
    );
    setIsSubscriptionModalOpen(true);
  };

  const openApprovalModal = (user: User) => {
    setSelectedUser(user);
    setIsApprovalModalOpen(true);
  };

  const openRejectionModal = (user: User) => {
    setSelectedUser(user);
    setIsRejectionModalOpen(true);
  };

  const handleSort = (column: "name" | "date" | "spent") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.company?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      const matchesSubscription =
        subscriptionFilter === "all" ||
        (subscriptionFilter === "active" &&
          user.subscription?.status?.toLowerCase() === "active") ||
        (subscriptionFilter === "inactive" &&
          (!user.subscription ||
            user.subscription.status?.toLowerCase() !== "active")) ||
        (subscriptionFilter === "cancelled" &&
          user.subscription?.status?.toLowerCase() === "cancelled");

      return (
        matchesSearch && matchesRole && matchesStatus && matchesSubscription
      );
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison =
            new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime();
          break;
        case "spent":
          comparison = a.totalSpent - b.totalSpent;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const pendingUsers = users.filter(
    (u) => u.status === "PendingApproval"
  ).length;
  const activeSubscribers = users.filter(
    (u) => u.subscription?.status?.toLowerCase() === "active"
  ).length;
  const totalRevenue = users.reduce((sum, user) => sum + user.totalSpent, 0);
  const monthlyRecurring = users
    .filter(
      (u) =>
        u.subscription?.status?.toLowerCase() === "active" &&
        u.subscription?.billingCycle === "Monthly"
    )
    .reduce((sum, user) => sum + (user.subscription?.price || 0), 0);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Active: { icon: CheckCircle, class: "bg-green-100 text-green-800" },
      Inactive: { icon: XCircle, class: "bg-gray-100 text-gray-800" },
      Suspended: { icon: Ban, class: "bg-red-100 text-red-800" },
      PendingApproval: { icon: Clock, class: "bg-yellow-100 text-yellow-800" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.Inactive;
    const Icon = config.icon;

    return (
      <Badge className={config.class}>
        <Icon className="w-3 h-3 mr-1" />
        {status === "PendingApproval" ? "Pending" : status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      Admin: { icon: Shield, class: "bg-purple-100 text-purple-800" },
      Creator: { icon: Award, class: "bg-blue-100 text-blue-800" },
      Learner: { icon: BookOpen, class: "bg-orange-100 text-orange-800" },
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.Learner;
    const Icon = config.icon;

    return (
      <Badge className={config.class}>
        <Icon className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    );
  };

  const getSubscriptionBadge = (subscription?: User["subscription"]) => {
    if (!subscription || subscription.status?.toLowerCase() !== "active") {
      return <Badge variant="outline">No Subscription</Badge>;
    }

    const statusColors = {
      active: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
      past_due: "bg-red-100 text-red-800",
      trialing: "bg-blue-100 text-blue-800",
    };

    return (
      <Badge
        className={
          statusColors[
            subscription.status.toLowerCase() as keyof typeof statusColors
          ] || ""
        }
      >
        <CreditCard className="w-3 h-3 mr-1" />
        {subscription.plan} ({subscription.billingCycle})
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert for pending approvals */}
      {pendingUsers > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Pending Approvals</AlertTitle>
          <AlertDescription>
            You have {pendingUsers} user registration
            {pendingUsers !== 1 ? "s" : ""} waiting for approval.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">{totalUsers}</p>
              </div>
              <Users className="w-6 h-6 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-xl font-bold">{activeUsers}</p>
              </div>
              <UserCheck className="w-6 h-6 text-green-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{pendingUsers}</p>
              </div>
              <Clock className="w-6 h-6 text-yellow-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Subscribers</p>
                <p className="text-xl font-bold">{activeSubscribers}</p>
              </div>
              <CreditCard className="w-6 h-6 text-purple-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-xl font-bold">{formatPHP(totalRevenue)}</p>
              </div>
              <DollarSign className="w-6 h-6 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">MRR</p>
                <p className="text-xl font-bold">
                  {formatPHP(monthlyRecurring)}
                </p>
              </div>
              <Calendar className="w-6 h-6 text-learning-warning/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User & Subscription Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pending">
                Pending Approval
                {pendingUsers > 0 && (
                  <Badge
                    className="ml-2 bg-yellow-100 text-yellow-800"
                    variant="secondary"
                  >
                    {pendingUsers}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="subscribers">Active Subscribers</TabsTrigger>
              <TabsTrigger value="inactive">Inactive Users</TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Creator">Creator</SelectItem>
                  <SelectItem value="Learner">Learner</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={subscriptionFilter}
                onValueChange={setSubscriptionFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Subscription status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Subscription</SelectItem>
                  <SelectItem value="inactive">No Subscription</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="overview">
              {/* Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("name")}
                          className="h-auto p-0 font-semibold"
                        >
                          User
                          {sortBy === "name" &&
                            (sortOrder === "asc" ? (
                              <ChevronUp className="w-4 h-4 ml-1" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-1" />
                            ))}
                        </Button>
                      </TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("spent")}
                          className="h-auto p-0 font-semibold"
                        >
                          Total Spent
                          {sortBy === "spent" &&
                            (sortOrder === "asc" ? (
                              <ChevronUp className="w-4 h-4 ml-1" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-1" />
                            ))}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("date")}
                          className="h-auto p-0 font-semibold"
                        >
                          Joined
                          {sortBy === "date" &&
                            (sortOrder === "asc" ? (
                              <ChevronUp className="w-4 h-4 ml-1" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-1" />
                            ))}
                        </Button>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>
                                {user.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                              {user.company && (
                                <div className="text-xs text-muted-foreground">
                                  {user.company}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          {getSubscriptionBadge(user.subscription)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{user.coursesEnrolled} enrolled</div>
                            <div className="text-muted-foreground">
                              {user.coursesCompleted} completed
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatPHP(user.totalSpent)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(user.joinedDate)}</div>
                            <div className="text-muted-foreground">
                              Last: {formatDate(user.lastActive)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openUserDetails(user)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {user.status === "PendingApproval" ? (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => openApprovalModal(user)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve Registration
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openRejectionModal(user)}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject Registration
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => openSubscriptionModal(user)}
                                  >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Manage Subscription
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRoleChange(user.id, "Creator")
                                    }
                                  >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Change Role
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(
                                    user.id,
                                    user.status === "Active"
                                      ? "Suspended"
                                      : "Active"
                                  )
                                }
                                className={
                                  user.status === "Active"
                                    ? "text-red-600"
                                    : "text-green-600"
                                }
                              >
                                {user.status === "Active" ? (
                                  <>
                                    <Ban className="w-4 h-4 mr-2" />
                                    Suspend User
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Activate User
                                  </>
                                )}
                              </DropdownMenuItem>
                              {user.subscription?.status?.toLowerCase() ===
                                "active" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    const sid = user.subscription?.id;
                                    if (sid) handleCancelSubscription(sid);
                                  }}
                                  className="text-red-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Subscription
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pending">
              {/* Pending Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Requested Role</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers
                      .filter((user) => user.status === "PendingApproval")
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={user.avatar}
                                  alt={user.name}
                                />
                                <AvatarFallback>
                                  {user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {user.email}
                                </div>
                                {user.company && (
                                  <div className="text-xs text-muted-foreground">
                                    {user.company}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(user.joinedDate)}</div>
                              <div className="text-muted-foreground">
                                {new Date(user.joinedDate).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => openApprovalModal(user)}
                                disabled={processingUserId === user.id}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectionModal(user)}
                                disabled={processingUserId === user.id}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {filteredUsers.filter(
                  (user) => user.status === "PendingApproval"
                ).length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Pending Approvals
                    </h3>
                    <p className="text-muted-foreground">
                      All user registrations have been processed.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="subscribers">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subscriber</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead>Next Payment</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers
                      .filter(
                        (user) =>
                          user.subscription?.status?.toLowerCase() === "active"
                      )
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={user.avatar}
                                  alt={user.name}
                                />
                                <AvatarFallback>
                                  {user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-700">
                              {user.subscription.plan}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{user.subscription.billingCycle}</div>
                              <div className="text-muted-foreground">
                                {formatPHP(user.subscription.price || 0)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.subscription.nextBillingDate ||
                            user.subscription.expiresAt
                              ? formatDate(
                                  user.subscription.nextBillingDate ||
                                    user.subscription.expiresAt!
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell>{formatPHP(user.totalSpent)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openSubscriptionModal(user)}
                            >
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {filteredUsers.filter(
                  (user) =>
                    user.subscription?.status?.toLowerCase() === "active"
                ).length === 0 && (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Active Subscribers
                    </h3>
                    <p className="text-muted-foreground">
                      There are currently no users with active subscriptions.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="inactive">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Previous Plan</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers
                      .filter(
                        (user) =>
                          !user.subscription ||
                          user.subscription.status?.toLowerCase() !== "active"
                      )
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={user.avatar}
                                  alt={user.name}
                                />
                                <AvatarFallback>
                                  {user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(user.lastActive)}</TableCell>
                          <TableCell>
                            {user.subscription ? (
                              <Badge variant="outline">
                                {user.subscription.plan}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">
                                No previous plan
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{formatPHP(user.totalSpent)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openSubscriptionModal(user)}
                            >
                              Add Subscription
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                  />
                  <AvatarFallback>
                    {selectedUser.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">
                    {selectedUser.phone || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {selectedUser.location || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Joined Date</p>
                  <p className="font-medium">
                    {formatDate(selectedUser.joinedDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="font-medium">
                    {formatDate(selectedUser.lastActive)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Learning Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {selectedUser.coursesEnrolled}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Courses Enrolled
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {selectedUser.coursesCompleted}
                      </div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {formatPHP(selectedUser.totalSpent)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total Spent
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {selectedUser.subscription && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Subscription Details</h4>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Plan
                          </span>
                          <span className="font-medium">
                            {selectedUser.subscription.plan}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Status
                          </span>
                          <Badge
                            className={
                              selectedUser.subscription.status?.toLowerCase() ===
                              "active"
                                ? "bg-green-100 text-green-800"
                                : ""
                            }
                          >
                            {selectedUser.subscription.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Billing Cycle
                          </span>
                          <span className="font-medium">
                            {selectedUser.subscription.billingCycle}
                          </span>
                        </div>
                        {selectedUser.subscription.expiresAt && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Expires
                            </span>
                            <span className="font-medium">
                              {formatDate(selectedUser.subscription.expiresAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Management Modal */}
      <Dialog
        open={isSubscriptionModalOpen}
        onOpenChange={setIsSubscriptionModalOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              Update subscription plan for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <Select
                value={billingCycle}
                onValueChange={(value: "monthly" | "yearly") =>
                  setBillingCycle(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Subscription Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Subscription</SelectItem>
                  {subscriptionPlans
                    .filter((plan) => {
                      console.log(
                        "Filtering plan:",
                        plan,
                        "for role:",
                        selectedUser?.role
                      );
                      // Handle both 'type' and 'planType' fields, and handle enum values
                      const planType = plan.type || plan.planType;
                      const planTypeStr =
                        typeof planType === "number"
                          ? ["learner", "creator"][planType]
                          : planType?.toLowerCase();

                      return (
                        (selectedUser?.role === "Creator" &&
                          planTypeStr === "creator") ||
                        (selectedUser?.role === "Learner" &&
                          planTypeStr === "learner") ||
                        selectedUser?.role === "Admin"
                      ); // Admin can see all plans
                    })
                    .map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.name} -{" "}
                        {formatPHP(
                          billingCycle === "yearly"
                            ? plan.yearlyPrice || plan.price * 12
                            : plan.price
                        )}
                        /{billingCycle}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlan && selectedPlan !== "none" && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Plan Features</h4>
                  <ul className="space-y-1">
                    {subscriptionPlans
                      .find((p) => p.id?.toString() === selectedPlan)
                      ?.features.map((feature, index) => (
                        <li
                          key={index}
                          className="text-sm flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSubscriptionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubscriptionUpdate}>
              Update Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Modal */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve User Registration</DialogTitle>
            <DialogDescription>
              Approve registration for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">User Details</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {selectedUser?.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedUser?.email}
                </p>
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  {selectedUser?.role}
                </p>
                <p>
                  <span className="font-medium">Registered:</span>{" "}
                  {selectedUser && formatDate(selectedUser.joinedDate)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approval-note">Welcome Message (Optional)</Label>
              <Textarea
                id="approval-note"
                placeholder="Add a personalized welcome message for the user..."
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApprovalModalOpen(false);
                setApprovalNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? "Approving..." : "Approve User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog
        open={isRejectionModalOpen}
        onOpenChange={setIsRejectionModalOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject User Registration</DialogTitle>
            <DialogDescription>
              Reject registration for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                This action will reject the user's registration. They will be
                notified via email.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">User Details</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {selectedUser?.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedUser?.email}
                </p>
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  {selectedUser?.role}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Reason for Rejection <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a reason for rejecting this registration..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectionModalOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isRejecting || !rejectionReason.trim()}
              variant="destructive"
            >
              {isRejecting ? "Rejecting..." : "Reject User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
