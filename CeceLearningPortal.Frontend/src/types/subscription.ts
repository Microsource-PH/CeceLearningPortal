// Subscription and Pricing Plan Types

export type PlanType = 'free' | 'basic' | 'pro' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface PricingFeature {
  text: string;
  included: boolean;
  tooltip?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  type: PlanType;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PricingFeature[];
  recommended?: boolean;
  maxCourses?: number;
  supportLevel: string;
  certificateIncluded: boolean;
  downloadableContent: boolean;
  prioritySupport: boolean;
  teamFeatures?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  paymentMethod?: {
    type: 'card' | 'paypal';
    last4?: string;
    brand?: string;
  };
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'Learner' | 'Creator';
  subscription: Subscription;
  totalSpent: number;
  coursesEnrolled: number;
  joinDate: Date;
  lastActive: Date;
  company?: string;
  location?: string;
}