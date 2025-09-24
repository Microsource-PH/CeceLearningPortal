import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import analyticsService from "@/services/analyticsService";
import DatabaseService from "@/services/databaseService";
import { formatPHP } from "@/utils/currency";
import { formatPercentage, formatRating } from "@/utils/format";
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  PieChart,
  BarChart3,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  BookOpen,
  Users,
  Star,
  Plus
} from "lucide-react";

interface EarningsReportProps {
  creatorId: string;
}

export const EarningsReport = ({ creatorId }: EarningsReportProps) => {
  const [revenue, setRevenue] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    fetchEarnings();
  }, [creatorId, selectedPeriod]);

  const fetchEarnings = async () => {
    try {
      // Fetch real revenue data from the revenue endpoint
      const revenueResult = await analyticsService.getInstructorRevenue(creatorId);
      if (revenueResult.data) {
        console.log('Revenue data from API:', revenueResult.data);
        
        // The API returns InstructorRevenueDto with these fields:
        // TotalRevenue, DirectSalesRevenue, SubscriptionRevenue, CourseRevenues
        const apiData = revenueResult.data;
        
        // Transform to match our expected format and apply 80/20 split
        setRevenue({
          totalRevenue: apiData.TotalRevenue || apiData.totalRevenue || 0,
          directSalesRevenue: apiData.DirectSalesRevenue || apiData.directSalesRevenue || 0,
          subscriptionRevenue: apiData.SubscriptionRevenue || apiData.subscriptionRevenue || 0,
          creatorEarnings: (apiData.TotalRevenue || apiData.totalRevenue || 0) * 0.8,
          platformFees: (apiData.TotalRevenue || apiData.totalRevenue || 0) * 0.2,
          courseRevenues: apiData.CourseRevenues || apiData.courseRevenues || []
        });
      }

      // Get analytics data for course performance and monthly data
      const analyticsResult = await analyticsService.getInstructorAnalytics(creatorId);
      if (analyticsResult.data) {
        console.log('Analytics data from API:', analyticsResult.data);
        setAnalytics(analyticsResult.data);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading earnings...</div>;
  }

  if (!revenue && !analytics) {
    return <div className="text-center p-8">No earnings data available</div>;
  }

  // Check if this is a new creator with no earnings
  const totalRevenueCheck = revenue?.totalRevenue || 0;
  const hasNoEarnings = totalRevenueCheck === 0 && (!analytics?.coursePerformance || analytics.coursePerformance.length === 0);

  if (hasNoEarnings) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Earnings Yet</h3>
        <p className="text-muted-foreground mb-4">
          Start creating and selling courses to see your earnings here.
        </p>
        <p className="text-sm text-muted-foreground">
          As a creator, you'll earn 80% of all course revenue after platform fees.
        </p>
      </div>
    );
  }

  // Use real data from revenue object
  const totalRevenue = revenue?.totalRevenue || 0;
  const directSalesRevenue = revenue?.directSalesRevenue || 0;
  const subscriptionRevenue = revenue?.subscriptionRevenue || 0;
  const platformFee = revenue?.platformFees || (totalRevenue * 0.2);
  const instructorEarnings = revenue?.creatorEarnings || (totalRevenue * 0.8);
  
  // Filter data based on selected period
  const getFilteredRevenue = () => {
    if (!analytics?.monthlyRevenue || selectedPeriod === 'all') {
      return revenue;
    }
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
    
    let filteredMonthlyRevenue = [];
    
    switch (selectedPeriod) {
      case 'year':
        // Filter for current year only
        filteredMonthlyRevenue = analytics.monthlyRevenue.filter(item => {
          const [year] = item.month.split('-').map(Number);
          return year === currentYear;
        });
        break;
      case 'month':
        // Filter for current month only
        filteredMonthlyRevenue = analytics.monthlyRevenue.filter(item => {
          const [year, month] = item.month.split('-').map(Number);
          return year === currentYear && month === currentMonth;
        });
        break;
      default:
        filteredMonthlyRevenue = analytics.monthlyRevenue;
    }
    
    // Calculate period-specific revenue from monthly data
    const periodRevenue = filteredMonthlyRevenue.reduce((sum, item) => sum + (item.revenue || 0), 0);
    
    // If we have no data for the period, return zeros
    if (periodRevenue === 0) {
      return {
        totalRevenue: 0,
        directSalesRevenue: 0,
        subscriptionRevenue: 0,
        creatorEarnings: 0,
        platformFees: 0,
        courseRevenues: []
      };
    }
    
    // Calculate proportional direct sales and subscription revenue
    const ratio = periodRevenue / (revenue?.totalRevenue || 1);
    const periodDirectSales = (revenue?.directSalesRevenue || 0) * ratio;
    const periodSubscription = (revenue?.subscriptionRevenue || 0) * ratio;
    
    // Filter course revenues for the period (if we have course-specific date data)
    const filteredCourseRevenues = revenue?.courseRevenues || [];
    
    return {
      totalRevenue: periodRevenue,
      directSalesRevenue: periodDirectSales,
      subscriptionRevenue: periodSubscription,
      creatorEarnings: periodRevenue * 0.8,
      platformFees: periodRevenue * 0.2,
      courseRevenues: filteredCourseRevenues
    };
  };
  
  const filteredRevenue = getFilteredRevenue();
  const displayTotalRevenue = filteredRevenue?.totalRevenue || 0;
  const displayDirectSales = filteredRevenue?.directSalesRevenue || 0;
  const displaySubscription = filteredRevenue?.subscriptionRevenue || 0;
  const displayPlatformFee = filteredRevenue?.platformFees || 0;
  const displayInstructorEarnings = filteredRevenue?.creatorEarnings || 0;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        <Button
          variant={selectedPeriod === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedPeriod('all')}
        >
          All Time
        </Button>
        <Button
          variant={selectedPeriod === 'year' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedPeriod('year')}
        >
          This Year
        </Button>
        <Button
          variant={selectedPeriod === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedPeriod('month')}
        >
          This Month
        </Button>
      </div>

      {/* Revenue Overview */}
      <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl bg-gradient-primary bg-clip-text text-transparent">
            Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mt-1">
                    {formatPHP(displayTotalRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Before platform fees
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
            
            <div className="p-5 bg-gradient-to-br from-learning-success/10 to-learning-success/5 rounded-xl border border-learning-success/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Your Earnings</p>
                  <p className="text-2xl font-bold text-learning-success mt-1">
                    {formatPHP(displayInstructorEarnings)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-learning-success" />
                    80% creator share
                  </p>
                </div>
                <div className="w-12 h-12 bg-learning-success/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-learning-success" />
                </div>
              </div>
            </div>
            
            <div className="p-5 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Platform Fees</p>
                  <p className="text-2xl font-bold text-foreground/80 mt-1">
                    {formatPHP(displayPlatformFee)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    20% commission
                  </p>
                </div>
                <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Revenue Sources Breakdown */}
          {(displayDirectSales > 0 || displaySubscription > 0) && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Revenue Sources</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Direct Sales</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPHP(displayDirectSales)}</p>
                    <p className="text-xs text-muted-foreground">
                      {displayTotalRevenue > 0 ? Math.round((displayDirectSales / displayTotalRevenue) * 100) : 0}% of total
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-learning-warning/5 to-transparent rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-learning-warning" />
                    <span className="text-sm font-medium">Subscription Revenue</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPHP(displaySubscription)}</p>
                    <p className="text-xs text-muted-foreground">
                      {displayTotalRevenue > 0 ? Math.round((displaySubscription / displayTotalRevenue) * 100) : 0}% of total
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Revenue Progress Bar */}
              <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden mt-3">
                <div 
                  className="absolute h-full bg-primary transition-all duration-500"
                  style={{ width: `${displayTotalRevenue > 0 ? (displayDirectSales / displayTotalRevenue) * 100 : 0}%` }}
                />
                <div 
                  className="absolute h-full bg-learning-warning transition-all duration-500"
                  style={{ 
                    width: `${displayTotalRevenue > 0 ? (displaySubscription / displayTotalRevenue) * 100 : 0}%`,
                    left: `${displayTotalRevenue > 0 ? (displayDirectSales / displayTotalRevenue) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Performance */}
      <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl bg-gradient-primary bg-clip-text text-transparent">
              Course Performance
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(revenue?.courseRevenues || analytics?.coursePerformance || []).map((course: any) => {
              // Use data from revenue API if available, otherwise fall back to analytics
              const courseRevenue = course.TotalRevenue || course.totalRevenue || course.revenue || 0;
              const courseTitle = course.CourseTitle || course.courseTitle || course.title || 'Unknown Course';
              const courseEnrollments = course.TotalEnrollments || course.totalEnrollments || course.enrollments || 0;
              const courseRating = course.averageRating || 0;
              const courseStatus = course.status || 'Active';
              const courseId = course.courseId || course.CourseId || course.id;
              
              // Apply period filter to course revenue based on filtered revenue ratio
              let displayCourseRevenue = courseRevenue;
              if (selectedPeriod !== 'all' && revenue?.totalRevenue > 0) {
                const periodRatio = displayTotalRevenue / revenue.totalRevenue;
                displayCourseRevenue = courseRevenue * periodRatio;
              }
              
              const revenuePercentage = displayTotalRevenue > 0 ? (displayCourseRevenue / displayTotalRevenue) * 100 : 0;
              const courseEarnings = displayCourseRevenue * 0.8;
              
              return (
                <div key={courseId} className="p-4 bg-gradient-to-r from-background to-muted/20 rounded-lg border border-border hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{courseTitle}</h4>
                        {courseStatus === 'Active' && (
                          <Badge className="bg-learning-success/10 text-learning-success border border-learning-success/20">
                            <div className="w-2 h-2 bg-learning-success rounded-full mr-1 animate-pulse"></div>
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4 text-primary" />
                          {courseEnrollments} students
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <PieChart className="w-4 h-4 text-learning-warning" />
                          {formatPercentage(revenuePercentage)} of total
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {formatRating(courseRating)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-learning-success">{formatPHP(courseEarnings)}</p>
                      <p className="text-xs text-muted-foreground">Your earnings</p>
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

      {/* Payment Schedule */}
      <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Payment Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-learning-success/10 via-primary/5 to-learning-success/10 rounded-xl border border-learning-success/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-learning-success/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-learning-success" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Next Payout</p>
                  <p className="text-sm text-muted-foreground">
                    Scheduled for {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-learning-success">
                  {formatPHP(displayInstructorEarnings * 0.25)}
                </p>
                <Badge className="bg-learning-warning/10 text-learning-warning border border-learning-warning/20 mt-1">
                  <div className="w-2 h-2 bg-learning-warning rounded-full mr-1 animate-pulse"></div>
                  Pending
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-primary/5 to-transparent rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">This Month</span>
                  <div className="w-8 h-8 bg-learning-success/10 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-learning-success" />
                  </div>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {formatPHP(displayInstructorEarnings * 0.3)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-learning-success" />
                  <p className="text-xs text-learning-success font-medium">+23% from last month</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-muted/30 to-transparent rounded-lg border border-border hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Last Month</span>
                  <div className="w-8 h-8 bg-muted/30 rounded-full flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-xl font-bold text-foreground/80">
                  {formatPHP(displayInstructorEarnings * 0.25)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <CreditCard className="w-3 h-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Paid on 1st</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
              <span className="bg-gradient-primary bg-clip-text text-transparent">Revenue Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-learning-success/10 to-learning-success/5 rounded-lg border border-learning-success/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-learning-success/20 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-learning-success rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Your Earnings</p>
                      <p className="text-xs text-muted-foreground">80% creator share</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-learning-success">{formatPHP(displayInstructorEarnings)}</p>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-primary rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Platform Fee</p>
                      <p className="text-xs text-muted-foreground">20% commission</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-primary">{formatPHP(displayPlatformFee)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl bg-gradient-primary bg-clip-text text-transparent">
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">Account ending in ****1234</p>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border border-primary/20">
                  <div className="w-2 h-2 bg-primary rounded-full mr-1"></div>
                  Primary
                </Badge>
              </div>
              <Button 
                variant="outline" 
                className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};