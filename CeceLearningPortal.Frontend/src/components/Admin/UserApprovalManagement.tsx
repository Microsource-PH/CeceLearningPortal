import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users, 
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Search,
  Filter,
  RefreshCw,
  Eye,
  MessageSquare
} from 'lucide-react';
import adminService from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/format';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredDate: string;
  avatar?: string;
  fullName: string;
  requestedRole: string;
}

export const UserApprovalManagement = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    totalPending: 0,
    studentsCount: 0,
    creatorsCount: 0,
    todayCount: 0
  });

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await adminService.getPendingApprovalUsers();
      if (response.data) {
        setPendingUsers(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch pending approval users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (users: PendingUser[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setStats({
      totalPending: users.length,
      studentsCount: users.filter(u => u.requestedRole === 'Student').length,
      creatorsCount: users.filter(u => u.requestedRole === 'Creator').length,
      todayCount: users.filter(u => {
        const regDate = new Date(u.registeredDate);
        regDate.setHours(0, 0, 0, 0);
        return regDate.getTime() === today.getTime();
      }).length
    });
  };

  const handleApprove = async () => {
    if (!selectedUser) return;

    setProcessingUserId(selectedUser.id);
    try {
      const response = await adminService.approveUser({
        userId: selectedUser.id,
        approve: true,
        reason: approvalNote || 'Welcome to the platform!'
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: `${selectedUser.name} has been approved successfully`
        });
        setIsApprovalModalOpen(false);
        setApprovalNote('');
        fetchPendingUsers(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve user',
        variant: 'destructive'
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive'
      });
      return;
    }

    setProcessingUserId(selectedUser.id);
    try {
      const response = await adminService.approveUser({
        userId: selectedUser.id,
        approve: false,
        reason: rejectionReason
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: `${selectedUser.name}'s registration has been rejected`
        });
        setIsRejectionModalOpen(false);
        setRejectionReason('');
        fetchPendingUsers(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject user',
        variant: 'destructive'
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  const openApprovalModal = (user: PendingUser) => {
    setSelectedUser(user);
    setIsApprovalModalOpen(true);
  };

  const openRejectionModal = (user: PendingUser) => {
    setSelectedUser(user);
    setIsRejectionModalOpen(true);
  };

  const filteredUsers = pendingUsers.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      Student: { icon: Users, class: 'bg-blue-100 text-blue-800' },
      Creator: { icon: UserCheck, class: 'bg-purple-100 text-purple-800' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.Student;
    const Icon = config.icon;
    
    return (
      <Badge className={config.class}>
        <Icon className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-2xl font-bold">{stats.totalPending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Student Requests</p>
                <p className="text-2xl font-bold">{stats.studentsCount}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Creator Requests</p>
                <p className="text-2xl font-bold">{stats.creatorsCount}</p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Requests</p>
                <p className="text-2xl font-bold">{stats.todayCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for pending approvals */}
      {stats.totalPending > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pending Approvals</AlertTitle>
          <AlertDescription>
            You have {stats.totalPending} user registration{stats.totalPending !== 1 ? 's' : ''} waiting for approval.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Registration Approvals</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPendingUsers(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Approvals</h3>
              <p className="text-muted-foreground">All user registrations have been processed.</p>
            </div>
          ) : (
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
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.requestedRole)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(user.registeredDate)}</div>
                          <div className="text-muted-foreground">
                            {new Date(user.registeredDate).toLocaleTimeString()}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Modal */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve User Registration</DialogTitle>
            <DialogDescription>
              You are about to approve {selectedUser?.name} as a {selectedUser?.requestedRole}.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                  <div className="mt-1">{getRoleBadge(selectedUser.requestedRole)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Welcome Message (Optional)</Label>
                <Textarea
                  placeholder="Add a welcome message for the user..."
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  rows={3}
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The user will receive an email notification about the approval and will be able to log in immediately.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processingUserId === selectedUser?.id}>
              {processingUserId === selectedUser?.id ? 'Processing...' : 'Approve User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={isRejectionModalOpen} onOpenChange={setIsRejectionModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject User Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedUser?.name}'s registration.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                  <div className="mt-1">{getRoleBadge(selectedUser.requestedRole)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rejection Reason *</Label>
                <Textarea
                  placeholder="Please provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  The user will receive an email with the rejection reason and will need to contact support if they wish to appeal.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectionModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={processingUserId === selectedUser?.id || !rejectionReason.trim()}
            >
              {processingUserId === selectedUser?.id ? 'Processing...' : 'Reject Registration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};