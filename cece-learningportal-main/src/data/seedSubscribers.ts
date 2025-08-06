import { Subscriber } from '@/types/subscription';

export const seedSubscribers: Subscriber[] = [
  // Free Plan Subscribers
  {
    id: 'sub_001',
    name: 'Emily Johnson',
    email: 'emily.j@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'Learner',
    subscription: {
      id: 'sub_free_001',
      userId: 'user_001',
      planId: 'free',
      planType: 'free',
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodStart: new Date('2024-01-01'),
      currentPeriodEnd: new Date('2024-02-01'),
      cancelAtPeriodEnd: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    totalSpent: 0,
    coursesEnrolled: 3,
    joinDate: new Date('2024-01-01'),
    lastActive: new Date('2024-01-20'),
    location: 'New York, USA'
  },
  {
    id: 'sub_002',
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'Learner',
    subscription: {
      id: 'sub_free_002',
      userId: 'user_002',
      planId: 'free',
      planType: 'free',
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodStart: new Date('2023-12-15'),
      currentPeriodEnd: new Date('2024-01-15'),
      cancelAtPeriodEnd: false,
      createdAt: new Date('2023-12-15'),
      updatedAt: new Date('2023-12-15')
    },
    totalSpent: 0,
    coursesEnrolled: 5,
    joinDate: new Date('2023-12-15'),
    lastActive: new Date('2024-01-19'),
    location: 'Toronto, Canada'
  },

  // Basic Plan Subscribers
  {
    id: 'sub_003',
    name: 'Sarah Williams',
    email: 'sarah.w@techcorp.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    role: 'Learner',
    subscription: {
      id: 'sub_basic_001',
      userId: 'user_003',
      planId: 'basic',
      planType: 'basic',
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodStart: new Date('2024-01-10'),
      currentPeriodEnd: new Date('2024-02-10'),
      cancelAtPeriodEnd: false,
      createdAt: new Date('2023-10-10'),
      updatedAt: new Date('2024-01-10'),
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'Visa'
      }
    },
    totalSpent: 2997, // 3 months * ₱999
    coursesEnrolled: 12,
    joinDate: new Date('2023-10-10'),
    lastActive: new Date('2024-01-21'),
    company: 'TechCorp',
    location: 'San Francisco, USA'
  },
  {
    id: 'sub_004',
    name: 'James Rodriguez',
    email: 'j.rodriguez@startup.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    role: 'Learner',
    subscription: {
      id: 'sub_basic_002',
      userId: 'user_004',
      planId: 'basic',
      planType: 'basic',
      status: 'active',
      billingCycle: 'yearly',
      currentPeriodStart: new Date('2023-08-01'),
      currentPeriodEnd: new Date('2024-08-01'),
      cancelAtPeriodEnd: false,
      createdAt: new Date('2023-08-01'),
      updatedAt: new Date('2023-08-01'),
      paymentMethod: {
        type: 'card',
        last4: '5555',
        brand: 'Mastercard'
      }
    },
    totalSpent: 9990, // 1 year basic
    coursesEnrolled: 28,
    joinDate: new Date('2023-08-01'),
    lastActive: new Date('2024-01-20'),
    company: 'StartupIO',
    location: 'Austin, USA'
  },

  // Pro Plan Subscribers
  {
    id: 'sub_005',
    name: 'Dr. Lisa Thompson',
    email: 'lisa.thompson@university.edu',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'Creator',
    subscription: {
      id: 'sub_pro_001',
      userId: 'user_005',
      planId: 'pro',
      planType: 'pro',
      status: 'active',
      billingCycle: 'yearly',
      currentPeriodStart: new Date('2023-06-01'),
      currentPeriodEnd: new Date('2024-06-01'),
      cancelAtPeriodEnd: false,
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date('2023-06-01'),
      paymentMethod: {
        type: 'card',
        last4: '1234',
        brand: 'Amex'
      }
    },
    totalSpent: 23990, // 1 year pro
    coursesEnrolled: 45,
    joinDate: new Date('2023-06-01'),
    lastActive: new Date('2024-01-21'),
    company: 'Tech University',
    location: 'Boston, USA'
  },
  {
    id: 'sub_006',
    name: 'Alex Kumar',
    email: 'alex.k@devconsult.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'Learner',
    subscription: {
      id: 'sub_pro_002',
      userId: 'user_006',
      planId: 'pro',
      planType: 'pro',
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodStart: new Date('2024-01-05'),
      currentPeriodEnd: new Date('2024-02-05'),
      cancelAtPeriodEnd: false,
      createdAt: new Date('2023-09-05'),
      updatedAt: new Date('2024-01-05'),
      paymentMethod: {
        type: 'paypal',
        last4: '7890'
      }
    },
    totalSpent: 12495, // 5 months * ₱2499
    coursesEnrolled: 67,
    joinDate: new Date('2023-09-05'),
    lastActive: new Date('2024-01-21'),
    company: 'DevConsult Inc',
    location: 'Seattle, USA'
  },
  {
    id: 'sub_007',
    name: 'Maria Garcia',
    email: 'maria.g@designstudio.co',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    role: 'Creator',
    subscription: {
      id: 'sub_pro_003',
      userId: 'user_007',
      planId: 'pro',
      planType: 'pro',
      status: 'active',
      billingCycle: 'yearly',
      currentPeriodStart: new Date('2023-11-15'),
      currentPeriodEnd: new Date('2024-11-15'),
      cancelAtPeriodEnd: false,
      createdAt: new Date('2023-11-15'),
      updatedAt: new Date('2023-11-15'),
      trialEnd: new Date('2023-11-22'),
      paymentMethod: {
        type: 'card',
        last4: '3456',
        brand: 'Visa'
      }
    },
    totalSpent: 23990, // 1 year pro
    coursesEnrolled: 89,
    joinDate: new Date('2023-11-15'),
    lastActive: new Date('2024-01-21'),
    company: 'Design Studio Pro',
    location: 'Mexico City, Mexico'
  },

  // Enterprise Plan Subscribers
  {
    id: 'sub_008',
    name: 'TechCorp Team',
    email: 'admin@techcorp.com',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop',
    role: 'Learner',
    subscription: {
      id: 'sub_ent_001',
      userId: 'user_008',
      planId: 'enterprise',
      planType: 'enterprise',
      status: 'active',
      billingCycle: 'yearly',
      currentPeriodStart: new Date('2023-04-01'),
      currentPeriodEnd: new Date('2024-04-01'),
      cancelAtPeriodEnd: false,
      createdAt: new Date('2023-04-01'),
      updatedAt: new Date('2023-04-01'),
      paymentMethod: {
        type: 'card',
        last4: '9999',
        brand: 'Corporate'
      }
    },
    totalSpent: 134970, // 3 years * ₱44990
    coursesEnrolled: 450,
    joinDate: new Date('2021-04-01'),
    lastActive: new Date('2024-01-21'),
    company: 'TechCorp',
    location: 'San Francisco, USA'
  },
  {
    id: 'sub_009',
    name: 'Global Consulting Inc',
    email: 'learning@globalconsult.com',
    role: 'Learner',
    subscription: {
      id: 'sub_ent_002',
      userId: 'user_009',
      planId: 'enterprise',
      planType: 'enterprise',
      status: 'active',
      billingCycle: 'yearly',
      currentPeriodStart: new Date('2023-07-01'),
      currentPeriodEnd: new Date('2024-07-01'),
      cancelAtPeriodEnd: false,
      createdAt: new Date('2023-07-01'),
      updatedAt: new Date('2023-07-01'),
      paymentMethod: {
        type: 'card',
        last4: '8888',
        brand: 'Corporate'
      }
    },
    totalSpent: 44990, // 1 year enterprise
    coursesEnrolled: 780,
    joinDate: new Date('2023-07-01'),
    lastActive: new Date('2024-01-21'),
    company: 'Global Consulting Inc',
    location: 'London, UK'
  },

  // Canceled/Past Due Examples
  {
    id: 'sub_010',
    name: 'John Davis',
    email: 'john.d@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    role: 'Learner',
    subscription: {
      id: 'sub_cancel_001',
      userId: 'user_010',
      planId: 'basic',
      planType: 'basic',
      status: 'canceled',
      billingCycle: 'monthly',
      currentPeriodStart: new Date('2023-12-01'),
      currentPeriodEnd: new Date('2024-01-01'),
      cancelAtPeriodEnd: true,
      createdAt: new Date('2023-10-01'),
      updatedAt: new Date('2023-12-15'),
      canceledAt: new Date('2023-12-15'),
      paymentMethod: {
        type: 'card',
        last4: '1111',
        brand: 'Visa'
      }
    },
    totalSpent: 2997, // 3 months basic
    coursesEnrolled: 8,
    joinDate: new Date('2023-10-01'),
    lastActive: new Date('2023-12-20'),
    location: 'Chicago, USA'
  },
  {
    id: 'sub_011',
    name: 'Rachel Green',
    email: 'rachel.g@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'Learner',
    subscription: {
      id: 'sub_past_001',
      userId: 'user_011',
      planId: 'pro',
      planType: 'pro',
      status: 'past_due',
      billingCycle: 'monthly',
      currentPeriodStart: new Date('2023-12-15'),
      currentPeriodEnd: new Date('2024-01-15'),
      cancelAtPeriodEnd: false,
      createdAt: new Date('2023-08-15'),
      updatedAt: new Date('2024-01-15'),
      paymentMethod: {
        type: 'card',
        last4: '2222',
        brand: 'Mastercard'
      }
    },
    totalSpent: 12495, // 5 months pro
    coursesEnrolled: 34,
    joinDate: new Date('2023-08-15'),
    lastActive: new Date('2024-01-10'),
    location: 'Miami, USA'
  }
];

// Helper function to get subscribers by plan type
export const getSubscribersByPlan = (planType: string) => {
  return seedSubscribers.filter(sub => sub.subscription.planType === planType);
};

// Helper function to get active subscribers
export const getActiveSubscribers = () => {
  return seedSubscribers.filter(sub => sub.subscription.status === 'active');
};

// Helper function to calculate total revenue
export const calculateTotalRevenue = () => {
  return seedSubscribers.reduce((total, sub) => total + sub.totalSpent, 0);
};