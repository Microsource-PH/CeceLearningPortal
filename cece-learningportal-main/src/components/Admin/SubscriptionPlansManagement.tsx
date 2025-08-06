import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { 
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  BookOpen,
  Settings,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import adminService from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  type: 'learner' | 'creator';
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  price: number;
  currency: string;
  features: string[];
  limits: {
    courses_per_month?: number;
    max_courses?: number;
    max_students?: number;
    revenue_share?: number;
    certificates?: boolean;
    mentoring_hours?: number;
  };
  isActive: boolean;
  subscriberCount?: number;
  revenue?: number;
}

export const SubscriptionPlansManagement = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'learner' as const,
    billingCycle: 'monthly' as const,
    price: '',
    features: [''],
    limits: {
      courses_per_month: '',
      max_courses: '',
      max_students: '',
      revenue_share: '',
      certificates: true,
      mentoring_hours: ''
    }
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSubscriptionPlans();
      if (response.data) {
        setPlans(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription plans',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast({
          title: 'Error',
          description: 'Plan name is required',
          variant: 'destructive'
        });
        return;
      }
      
      if (!formData.price || isNaN(parseFloat(formData.price))) {
        toast({
          title: 'Error',
          description: 'Valid price is required',
          variant: 'destructive'
        });
        return;
      }
      
      console.log('Creating plan with data:', formData);
      
      const price = parseFloat(formData.price);
      const planData = {
        name: formData.name,
        description: formData.description,
        type: formData.type === 'learner' ? 'Learner' : 'Creator', // Capitalize for enum parsing
        billingCycle: formData.billingCycle,
        planType: formData.type === 'learner' ? 0 : 1, // 0 for Learner, 1 for Creator
        price: price,
        monthlyPrice: formData.billingCycle === 'monthly' ? price : price / 12,
        yearlyPrice: formData.billingCycle === 'yearly' ? price : price * 12,
        currency: 'PHP',
        features: formData.features.filter(f => f.trim() !== ''),
        limits: {},
        // Learner-specific
        maxCourseAccess: formData.type === 'learner' && formData.limits.max_courses ? 
          parseInt(formData.limits.max_courses) : 999,
        hasUnlimitedAccess: formData.type === 'learner' && !formData.limits.max_courses,
        // Creator-specific
        maxCoursesCanCreate: formData.type === 'creator' && formData.limits.max_courses ? 
          parseInt(formData.limits.max_courses) : null,
        maxStudentsPerCourse: formData.type === 'creator' && formData.limits.max_students ? 
          parseInt(formData.limits.max_students) : null,
        transactionFeePercentage: formData.type === 'creator' && formData.limits.revenue_share ? 
          parseFloat(formData.limits.revenue_share) : null,
        hasAnalytics: formData.type === 'creator',
        hasPrioritySupport: true,
        displayOrder: 1,
        isRecommended: false
      };
      
      console.log('Sending plan data to backend:', planData);
      const response = await adminService.createSubscriptionPlan(planData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Subscription plan created successfully'
        });
        setIsCreateModalOpen(false);
        resetForm();
        fetchPlans();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create subscription plan',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create subscription plan',
        variant: 'destructive'
      });
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;
    
    try {
      const price = parseFloat(formData.price);
      const planData = {
        // Remove id from body - it should only be in URL
        name: formData.name,
        description: formData.description,
        type: formData.type === 'learner' ? 'Learner' : 'Creator', // Capitalize for enum parsing
        billingCycle: formData.billingCycle,
        planType: formData.type === 'learner' ? 0 : 1,
        price: price,
        monthlyPrice: formData.billingCycle === 'monthly' ? price : price / 12,
        yearlyPrice: formData.billingCycle === 'yearly' ? price : price * 12,
        currency: 'PHP',
        features: formData.features.filter(f => f.trim() !== ''),
        limits: {},
        // Learner-specific
        maxCourseAccess: formData.type === 'learner' && formData.limits.max_courses ? 
          parseInt(formData.limits.max_courses) : 999,
        hasUnlimitedAccess: formData.type === 'learner' && !formData.limits.max_courses,
        // Creator-specific
        maxCoursesCanCreate: formData.type === 'creator' && formData.limits.max_courses ? 
          parseInt(formData.limits.max_courses) : null,
        maxStudentsPerCourse: formData.type === 'creator' && formData.limits.max_students ? 
          parseInt(formData.limits.max_students) : null,
        transactionFeePercentage: formData.type === 'creator' && formData.limits.revenue_share ? 
          parseFloat(formData.limits.revenue_share) : null,
        hasAnalytics: formData.type === 'creator',
        hasPrioritySupport: true,
        displayOrder: selectedPlan.displayOrder || 1,
        isRecommended: selectedPlan.isRecommended || false
      };
      
      const response = await adminService.updateSubscriptionPlan(selectedPlan.id, planData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Subscription plan updated successfully'
        });
        setIsEditModalOpen(false);
        resetForm();
        fetchPlans();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update subscription plan',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription plan',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan? Existing subscribers will not be affected.')) return;
    
    try {
      const response = await adminService.deleteSubscriptionPlan(planId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Subscription plan deleted successfully'
        });
        fetchPlans();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subscription plan',
        variant: 'destructive'
      });
    }
  };

  const togglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      const response = await adminService.updateSubscriptionPlan(planId, { isActive });
      if (response.success) {
        toast({
          title: 'Success',
          description: `Plan ${isActive ? 'activated' : 'deactivated'} successfully`
        });
        fetchPlans();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update plan status',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'learner',
      billingCycle: 'monthly',
      price: '',
      features: [''],
      limits: {
        courses_per_month: '',
        max_courses: '',
        max_students: '',
        revenue_share: '',
        certificates: true,
        mentoring_hours: ''
      }
    });
    setSelectedPlan(null);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      type: plan.type,
      billingCycle: plan.billingCycle,
      price: plan.price.toString(),
      features: plan.features.length > 0 ? plan.features : [''],
      limits: {
        courses_per_month: plan.limits.courses_per_month?.toString() || '',
        max_courses: plan.limits.max_courses?.toString() || '',
        max_students: plan.limits.max_students?.toString() || '',
        revenue_share: plan.limits.revenue_share ? (plan.limits.revenue_share * 100).toString() : '',
        certificates: plan.limits.certificates || false,
        mentoring_hours: plan.limits.mentoring_hours?.toString() || ''
      }
    });
    setIsEditModalOpen(true);
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const learnerPlans = plans.filter(p => p.type === 'learner');
  const creatorPlans = plans.filter(p => p.type === 'creator');

  // Calculate statistics
  const totalPlans = plans.length;
  const activePlans = plans.filter(p => p.isActive).length;
  const totalSubscribers = plans.reduce((sum, plan) => sum + (plan.subscriberCount || 0), 0);
  const totalRevenue = plans.reduce((sum, plan) => sum + (plan.revenue || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Plans</p>
                <p className="text-2xl font-bold">{totalPlans}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activePlans} active
                </p>
              </div>
              <Settings className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">{totalSubscribers}</p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +15% this month
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
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-green-600 mt-1">
                  Recurring income
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
                <p className="text-sm text-muted-foreground">Avg. Plan Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalPlans > 0 ? totalRevenue / totalPlans : 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Per plan revenue
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscription Plans</CardTitle>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Learner Plans */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              Learner Plans
            </h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {learnerPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-sm text-muted-foreground">{plan.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(plan.price)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {plan.billingCycle}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {plan.features.slice(0, 2).join(', ')}
                          {plan.features.length > 2 && ` +${plan.features.length - 2} more`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {plan.subscriberCount || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={plan.isActive}
                          onCheckedChange={(checked) => togglePlanStatus(plan.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(plan)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Creator Plans */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Creator Plans
            </h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creatorPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-sm text-muted-foreground">{plan.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(plan.price)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {plan.billingCycle}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {plan.features.slice(0, 2).join(', ')}
                          {plan.features.length > 2 && ` +${plan.features.length - 2} more`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {plan.subscriberCount || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={plan.isActive}
                          onCheckedChange={(checked) => togglePlanStatus(plan.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(plan)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Plan Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? 'Edit' : 'Create'} Subscription Plan</DialogTitle>
            <DialogDescription>
              Configure the subscription plan details and features.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Pro Learner"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Plan Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learner">Learner</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the plan"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="billingCycle">Billing Cycle</Label>
                <Select value={formData.billingCycle} onValueChange={(value) => setFormData({ ...formData, billingCycle: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Features</Label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="Enter feature"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                    disabled={formData.features.length === 1}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addFeature} className="w-fit">
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Plan Limits</h4>
              
              {formData.type === 'learner' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="courses_per_month">Courses per Month (-1 for unlimited)</Label>
                    <Input
                      id="courses_per_month"
                      type="number"
                      value={formData.limits.courses_per_month}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        limits: { ...formData.limits, courses_per_month: e.target.value }
                      })}
                      placeholder="-1"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="mentoring_hours">Mentoring Hours per Month</Label>
                    <Input
                      id="mentoring_hours"
                      type="number"
                      value={formData.limits.mentoring_hours}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        limits: { ...formData.limits, mentoring_hours: e.target.value }
                      })}
                      placeholder="0"
                    />
                  </div>
                </>
              )}
              
              {formData.type === 'creator' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="max_courses">Max Courses (-1 for unlimited)</Label>
                      <Input
                        id="max_courses"
                        type="number"
                        value={formData.limits.max_courses}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          limits: { ...formData.limits, max_courses: e.target.value }
                        })}
                        placeholder="-1"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="max_students">Max Students (-1 for unlimited)</Label>
                      <Input
                        id="max_students"
                        type="number"
                        value={formData.limits.max_students}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          limits: { ...formData.limits, max_students: e.target.value }
                        })}
                        placeholder="-1"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="revenue_share">Revenue Share (%)</Label>
                    <Input
                      id="revenue_share"
                      type="number"
                      value={formData.limits.revenue_share}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        limits: { ...formData.limits, revenue_share: e.target.value }
                      })}
                      placeholder="70"
                      min="0"
                      max="100"
                    />
                  </div>
                </>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="certificates"
                  checked={formData.limits.certificates}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    limits: { ...formData.limits, certificates: checked }
                  })}
                />
                <Label htmlFor="certificates">Include Certificates</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={isEditModalOpen ? handleUpdatePlan : handleCreatePlan}>
              {isEditModalOpen ? 'Update' : 'Create'} Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};