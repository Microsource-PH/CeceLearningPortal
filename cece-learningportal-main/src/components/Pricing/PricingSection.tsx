import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Shield, 
  Users,
  ArrowRight,
  Sparkles,
  Crown,
  Building,
  CheckCircle
} from 'lucide-react';
import { pricingPlans } from '@/data/pricingPlans';
import { PricingPlan, BillingCycle } from '@/types/subscription';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatPHP } from '@/utils/currency';
import subscriptionService, { Subscription } from '@/services/subscriptionService';

export const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'Student' || user?.role === 'Learner')) {
      fetchCurrentSubscription();
    }
  }, [isAuthenticated, user]);

  const fetchCurrentSubscription = async () => {
    const result = await subscriptionService.getMySubscription();
    if (result.data && result.data.status === 'active') {
      setCurrentSubscription(result.data);
    } else if (result.error && result.error.includes('404')) {
      // Check localStorage for active subscription
      const storedSubscription = localStorage.getItem('activeSubscription');
      if (storedSubscription) {
        const subscription = JSON.parse(storedSubscription);
        // Check if subscription is still active
        if (new Date(subscription.endDate) > new Date()) {
          setCurrentSubscription(subscription);
        }
      }
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'free': return <Zap className="w-6 h-6" />;
      case 'basic': return <Star className="w-6 h-6" />;
      case 'pro': return <Crown className="w-6 h-6" />;
      case 'enterprise': return <Building className="w-6 h-6" />;
      default: return <Shield className="w-6 h-6" />;
    }
  };

  const getPrice = (plan: PricingPlan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getMonthlyEquivalent = (plan: PricingPlan) => {
    if (billingCycle === 'yearly' && plan.yearlyPrice > 0) {
      return Math.round(plan.yearlyPrice / 12);
    }
    return plan.monthlyPrice;
  };

  const getSavings = (plan: PricingPlan) => {
    if (billingCycle === 'yearly' && plan.monthlyPrice > 0) {
      const yearlyCost = plan.monthlyPrice * 12;
      const savings = yearlyCost - plan.yearlyPrice;
      const percentage = Math.round((savings / yearlyCost) * 100);
      return { amount: savings, percentage };
    }
    return null;
  };

  const handleSelectPlan = (plan: PricingPlan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // In a real app, this would initiate the payment process
    console.log('Selected plan:', plan.name, 'Billing:', billingCycle);
    alert(`Proceeding to checkout for ${plan.name} plan (${billingCycle})`);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Choose Your Learning Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock your potential with our flexible pricing plans. Start free and upgrade as you grow.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Label htmlFor="billing-toggle" className="text-base">
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={billingCycle === 'yearly'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
          />
          <Label htmlFor="billing-toggle" className="text-base">
            Yearly
            <Badge className="ml-2 bg-green-100 text-green-800">Save up to 25%</Badge>
          </Label>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pricingPlans.map((plan) => {
            const savings = getSavings(plan);
            const monthlyEquivalent = getMonthlyEquivalent(plan);
            
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  currentSubscription?.planId === plan.id ? 'border-2 border-learning-success shadow-lg ring-2 ring-learning-success/20' :
                  plan.recommended ? 'border-2 border-primary shadow-lg scale-105' : 'hover:scale-102'
                }`}
              >
                {currentSubscription?.planId === plan.id ? (
                  <div className="absolute top-0 right-0 bg-learning-success text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    CURRENT PLAN
                  </div>
                ) : plan.recommended && (
                  <div className="absolute top-0 right-0 bg-gradient-primary text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    RECOMMENDED
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${
                      plan.type === 'free' ? 'bg-gray-100' :
                      plan.type === 'basic' ? 'bg-blue-100' :
                      plan.type === 'pro' ? 'bg-purple-100' :
                      'bg-orange-100'
                    }`}>
                      {getPlanIcon(plan.type)}
                    </div>
                    {savings && billingCycle === 'yearly' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Save {formatPHP(savings.amount)}
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">
                        {formatPHP(billingCycle === 'yearly' ? monthlyEquivalent : plan.monthlyPrice)}
                      </span>
                      <span className="text-muted-foreground ml-2">/month</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatPHP(plan.yearlyPrice)} billed annually
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Key Features */}
                  <div className="space-y-2">
                    {plan.features.slice(0, 6).map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${
                          feature.included ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action Button */}
                  {currentSubscription?.planId === plan.id ? (
                    <Button 
                      className="w-full"
                      variant="secondary"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${
                        plan.recommended && !currentSubscription ? 'bg-gradient-primary hover:opacity-90' : ''
                      }`}
                      variant={plan.recommended && !currentSubscription ? 'default' : 'outline'}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {currentSubscription ? 
                        (plan.monthlyPrice > (currentSubscription.amount || 0) ? 'Upgrade' : 'Downgrade') :
                        (plan.type === 'free' ? 'Start Free' : 'Get Started')
                      }
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  
                  {/* Additional Info */}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-center text-muted-foreground">
                      {currentSubscription?.planId === plan.id ? 
                        `Renews on ${new Date(currentSubscription.endDate).toLocaleDateString()}` :
                        plan.type === 'free' ? 'No credit card required' :
                        plan.type === 'enterprise' ? 'Contact for custom pricing' :
                        '7-day free trial included'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Subscriber Stats */}
        <div className="bg-gradient-card rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold mb-4">Trusted by Learners Worldwide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Active Subscribers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-learning-success">4.8/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-learning-warning">98%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-learning-blue">24/7</div>
              <div className="text-sm text-muted-foreground">Support Available</div>
            </div>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            All plans include access to our mobile app and community forums
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="link" className="text-primary">
              <Users className="w-4 h-4 mr-2" />
              Compare all features
            </Button>
            <Button variant="link" className="text-primary">
              <Shield className="w-4 h-4 mr-2" />
              View security & privacy
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};