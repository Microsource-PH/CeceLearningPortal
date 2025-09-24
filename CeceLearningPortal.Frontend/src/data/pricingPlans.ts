import { PricingPlan } from '@/types/subscription';

// Pricing in Philippine Peso (PHP)
// All prices are in Philippine Peso (₱)
export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    type: 'free',
    description: 'Get started with basic courses',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: 'Access to 5 free courses', included: true },
      { text: 'Basic course materials', included: true },
      { text: 'Community forum access', included: true },
      { text: 'Course completion certificates', included: false },
      { text: 'Downloadable resources', included: false },
      { text: 'Priority support', included: false },
      { text: 'Offline access', included: false },
      { text: 'Advanced analytics', included: false }
    ],
    maxCourses: 5,
    supportLevel: 'Community',
    certificateIncluded: false,
    downloadableContent: false,
    prioritySupport: false
  },
  {
    id: 'basic',
    name: 'Basic',
    type: 'basic',
    description: 'Perfect for individual learners',
    monthlyPrice: 999.00,
    yearlyPrice: 9990.00,    // ~17% discount on yearly
    features: [
      { text: 'Access to 50+ courses', included: true },
      { text: 'Course completion certificates', included: true },
      { text: 'Downloadable resources', included: true },
      { text: 'Mobile app access', included: true },
      { text: 'Email support', included: true },
      { text: 'Priority support', included: false },
      { text: 'Offline access', included: false },
      { text: 'Advanced analytics', included: false }
    ],
    maxCourses: 50,
    supportLevel: 'Email',
    certificateIncluded: true,
    downloadableContent: true,
    prioritySupport: false
  },
  {
    id: 'pro',
    name: 'Pro',
    type: 'pro',
    description: 'For serious learners & professionals',
    monthlyPrice: 2499.00,
    yearlyPrice: 23990.00,   // ~20% discount on yearly
    recommended: true,
    features: [
      { text: 'Unlimited course access', included: true },
      { text: 'Course completion certificates', included: true },
      { text: 'Downloadable resources', included: true },
      { text: 'Mobile app access', included: true },
      { text: 'Priority support', included: true },
      { text: 'Offline access', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Early access to new courses', included: true },
      { text: '1-on-1 mentoring sessions (2/month)', included: true }
    ],
    supportLevel: 'Priority 24/7',
    certificateIncluded: true,
    downloadableContent: true,
    prioritySupport: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    type: 'enterprise',
    description: 'For teams and organizations',
    monthlyPrice: 4999.00,
    yearlyPrice: 44990.00,   // ~25% discount on yearly
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Team management dashboard', included: true },
      { text: 'Custom learning paths', included: true },
      { text: 'API access', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Advanced reporting', included: true },
      { text: 'SSO authentication', included: true },
      { text: 'Unlimited team members', included: true }
    ],
    supportLevel: 'Dedicated',
    certificateIncluded: true,
    downloadableContent: true,
    prioritySupport: true,
    teamFeatures: true
  }
];