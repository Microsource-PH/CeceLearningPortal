// Subscription plan configuration with revenue sharing model

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: 'month' | 'year';
  features: string[];
  coursesIncluded: number | 'unlimited';
  accessibleCategories?: string[]; // If specified, only courses in these categories are accessible
  popularPlan?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 1499.00,
    duration: 'month',
    features: [
      'Access to 100+ courses',
      'Mobile app access',
      'Basic support'
    ],
    coursesIncluded: 100,
    accessibleCategories: ['Web Development', 'UI/UX Design'],
    popularPlan: false
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 2499.00,
    duration: 'month',
    features: [
      'Access to all courses',
      'Mobile app access',
      'Priority support',
      'Certificates',
      'Offline downloads'
    ],
    coursesIncluded: 'unlimited',
    popularPlan: true
  },
  {
    id: 'annual',
    name: 'Annual Premium',
    price: 19999.00,
    duration: 'year',
    features: [
      'Access to all courses',
      'Mobile app access', 
      'Priority support',
      'Certificates',
      'Offline downloads',
      'Save 33%'
    ],
    coursesIncluded: 'unlimited',
    popularPlan: false
  }
];

/**
 * Calculate creator revenue from subscription
 * Revenue is distributed proportionally based on:
 * 1. Number of creator's courses accessible in the plan
 * 2. Total number of courses accessible in the plan
 * 3. Platform takes 20% commission
 */
export function calculateSubscriptionRevenue(
  planId: string,
  creatorId: string,
  allCourses: Array<{ instructor_id: string; category: string; status: string }>
): { creatorRevenue: number; platformRevenue: number } {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  if (!plan) {
    return { creatorRevenue: 0, platformRevenue: 0 };
  }

  // Filter active courses
  const activeCourses = allCourses.filter(c => c.status === 'active');
  
  // Determine accessible courses based on plan
  let accessibleCourses = activeCourses;
  if (plan.accessibleCategories && plan.accessibleCategories.length > 0) {
    accessibleCourses = activeCourses.filter(c => 
      plan.accessibleCategories!.includes(c.category)
    );
  }
  
  // If plan has course limit, take only that many courses
  if (typeof plan.coursesIncluded === 'number') {
    accessibleCourses = accessibleCourses.slice(0, plan.coursesIncluded);
  }
  
  // Count creator's courses in accessible courses
  const creatorCoursesCount = accessibleCourses.filter(
    c => c.instructor_id === creatorId
  ).length;
  
  const totalAccessibleCourses = accessibleCourses.length;
  
  if (totalAccessibleCourses === 0) {
    return { creatorRevenue: 0, platformRevenue: 0 };
  }
  
  // Calculate monthly revenue (convert annual to monthly)
  const monthlyRevenue = plan.duration === 'year' 
    ? plan.price / 12 
    : plan.price;
  
  // Platform takes 20%
  const platformRevenue = monthlyRevenue * 0.2;
  const totalCreatorPool = monthlyRevenue * 0.8;
  
  // Creator gets proportional share based on their courses
  const creatorRevenue = (creatorCoursesCount / totalAccessibleCourses) * totalCreatorPool;
  
  return {
    creatorRevenue: parseFloat(creatorRevenue.toFixed(2)),
    platformRevenue: parseFloat(platformRevenue.toFixed(2))
  };
}

/**
 * Calculate total subscription revenue for a creator across all active subscriptions
 */
export function calculateCreatorSubscriptionRevenue(
  creatorId: string,
  activeSubscriptions: Array<{ plan_id: string; user_id: string }>,
  allCourses: Array<{ instructor_id: string; category: string; status: string }>
): { totalRevenue: number; subscriptionBreakdown: Record<string, { count: number; revenue: number }> } {
  const breakdown: Record<string, { count: number; revenue: number }> = {};
  let totalRevenue = 0;
  
  for (const subscription of activeSubscriptions) {
    const { creatorRevenue } = calculateSubscriptionRevenue(
      subscription.plan_id,
      creatorId,
      allCourses
    );
    
    if (!breakdown[subscription.plan_id]) {
      breakdown[subscription.plan_id] = { count: 0, revenue: 0 };
    }
    
    breakdown[subscription.plan_id].count++;
    breakdown[subscription.plan_id].revenue += creatorRevenue;
    totalRevenue += creatorRevenue;
  }
  
  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    subscriptionBreakdown: breakdown
  };
}