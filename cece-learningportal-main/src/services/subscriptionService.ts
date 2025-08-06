import api from './api';

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

class SubscriptionService {
  async getMySubscription(): Promise<{ data: Subscription | null; error: string | null }> {
    try {
      const response = await api.request<Subscription>('/subscriptions/current', {
        method: 'GET'
      });
      
      if (response.error) {
        // If endpoint doesn't exist, check localStorage for subscription
        if (response.error.includes('404')) {
          const storedSubscription = localStorage.getItem('activeSubscription');
          if (storedSubscription) {
            const subscription = JSON.parse(storedSubscription);
            // Check if subscription is still active
            if (new Date(subscription.endDate) > new Date()) {
              return {
                data: subscription,
                error: null
              };
            } else {
              // Subscription expired, remove it
              localStorage.removeItem('activeSubscription');
            }
          }
          
          return {
            data: null,
            error: null
          };
        }
        throw new Error(response.error);
      }
      
      return { data: response.data || null, error: null };
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch subscription' 
      };
    }
  }

  async getSubscriptionPlans(): Promise<{ data: SubscriptionPlan[] | null; error: string | null }> {
    try {
      const response = await api.request('/subscriptions/plans', {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch subscription plans' 
      };
    }
  }

  async createSubscription(planId: string): Promise<{ data: any; error: string | null }> {
    try {
      const response = await api.request('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ planId })
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to create subscription' 
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<{ data: boolean; error: string | null }> {
    try {
      const response = await api.request(`/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { 
        data: false, 
        error: error instanceof Error ? error.message : 'Failed to cancel subscription' 
      };
    }
  }

  async getAllSubscriptions(filters?: { status?: string }): Promise<{ data: Subscription[] | null; error: string | null }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) {
        params.append('status', filters.status);
      }

      const queryString = params.toString();
      const url = `/admin/subscriptions${queryString ? `?${queryString}` : ''}`;

      const response = await api.request<Subscription[]>(url, {
        method: 'GET'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return { data: response.data || [], error: null };
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch subscriptions' 
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;