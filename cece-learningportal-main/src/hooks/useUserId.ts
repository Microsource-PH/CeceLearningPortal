import { useAuth } from '@/contexts/AuthContext';

/**
 * Returns the user ID for database queries
 * Now uses actual database UUIDs from authentication
 */
export function useUserId(): string | null {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Return the actual user ID from authentication
  return user.id;
}