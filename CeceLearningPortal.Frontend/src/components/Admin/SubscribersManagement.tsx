import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Download, 
  Mail, 
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { seedSubscribers, getActiveSubscribers, calculateTotalRevenue } from '@/data/seedSubscribers';
import { pricingPlans } from '@/data/pricingPlans';
import { Subscriber } from '@/types/subscription';
import { formatPHP } from '@/utils/currency';
import subscriptionService from '@/services/subscriptionService';
import { toast } from '@/hooks/use-toast';

export const SubscribersManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'spent'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const result = await subscriptionService.getAllSubscriptions();
      if (result.data) {
        // Transform API data to match component structure
        const transformedSubscribers = result.data.map((sub: any) => ({
          id: sub.id,
          name: sub.user?.full_name || 'Unknown User',
          email: sub.user?.email || '',
          avatar: sub.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.user?.full_name || 'U')}&background=random`,
          company: sub.user?.company || '',
          joinDate: new Date(sub.startDate),
          totalSpent: sub.amount || 0,
          coursesEnrolled: sub.user?.coursesEnrolled || 0,
          subscription: {
            planId: sub.planId,
            planType: sub.planId,
            status: sub.status,
            billingCycle: sub.planId.includes('yearly') ? 'yearly' : 'monthly',
            nextBillingDate: new Date(sub.endDate),
            paymentMethod: 'card'
          }
        }));
        setSubscribers(transformedSubscribers);
      } else {
        // Fallback to mock data if API fails
        setSubscribers(seedSubscribers);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscribers. Using sample data.',
        variant: 'destructive'
      });
      // Fallback to mock data
      setSubscribers(seedSubscribers);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const activeSubscribers = subscribers.filter(sub => sub.subscription.status === 'active');
  const totalRevenue = subscribers.reduce((sum, sub) => sum + sub.totalSpent, 0);
  const averageRevenue = subscribers.length > 0 ? Math.round(totalRevenue / subscribers.length) : 0;
  const monthlyRecurring = activeSubscribers
    .filter(sub => sub.subscription.billingCycle === 'monthly')
    .reduce((sum, sub) => {
      const plan = pricingPlans.find(p => p.id === sub.subscription.planId);
      return sum + (plan?.monthlyPrice || 0);
    }, 0);

  // Filter and sort subscribers
  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = 
      subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlan = planFilter === 'all' || subscriber.subscription.planType === planFilter;
    const matchesStatus = statusFilter === 'all' || subscriber.subscription.status === statusFilter;
    
    return matchesSearch && matchesPlan && matchesStatus;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = a.joinDate.getTime() - b.joinDate.getTime();
        break;
      case 'spent':
        comparison = a.totalSpent - b.totalSpent;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Canceled</Badge>;
      case 'past_due':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Past Due</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Trial</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPlanBadge = (planType: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={colors[planType as keyof typeof colors] || ''}>
        {planType.charAt(0).toUpperCase() + planType.slice(1)}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const handleSort = (column: 'name' | 'date' | 'spent') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">{subscribers.length}</p>
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
                <p className="text-sm text-muted-foreground">Active Subscribers</p>
                <p className="text-2xl font-bold">{activeSubscribers.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {subscribers.length > 0 ? Math.round((activeSubscribers.length / subscribers.length) * 100) : 0}% of total
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatPHP(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {formatPHP(averageRevenue)}/subscriber
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-learning-success/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Recurring</p>
                <p className="text-2xl font-bold">{formatPHP(monthlyRecurring)}</p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +8% growth rate
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-learning-warning/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscribers Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Email Campaign
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="trialing">Trial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscribers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('name')}
                      className="h-auto p-0 font-semibold"
                    >
                      Subscriber
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('date')}
                      className="h-auto p-0 font-semibold"
                    >
                      Joined
                      {sortBy === 'date' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('spent')}
                      className="h-auto p-0 font-semibold"
                    >
                      Total Spent
                      {sortBy === 'spent' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={subscriber.avatar} alt={subscriber.name} />
                          <AvatarFallback>
                            {subscriber.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{subscriber.name}</div>
                          <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                          {subscriber.company && (
                            <div className="text-xs text-muted-foreground">{subscriber.company}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(subscriber.subscription.planType)}</TableCell>
                    <TableCell>{getStatusBadge(subscriber.subscription.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="capitalize">{subscriber.subscription.billingCycle}</div>
                        {subscriber.subscription.paymentMethod && (
                          <div className="text-xs text-muted-foreground">
                            {subscriber.subscription.paymentMethod.brand} ****{subscriber.subscription.paymentMethod.last4}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(subscriber.joinDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatPHP(subscriber.totalSpent)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{subscriber.coursesEnrolled}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredSubscribers.length} of {seedSubscribers.length} subscribers
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};