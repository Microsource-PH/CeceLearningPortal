import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../services/api';

export type UserRole = 'Learner' | 'Creator' | 'Admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  accessToken?: string;
  refreshToken?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateUserRole?: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to migrate old role names
  const migrateRole = (role: string): UserRole => {
    switch (role) {
      case 'Student':
        return 'Learner';
      case 'Instructor':
        return 'Creator';
      case 'Admin':
        return 'Admin';
      default:
        return role as UserRole;
    }
  };

  // Check for saved auth on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        const migratedRole = migrateRole(authData.role);
        
        // Update stored data if role was migrated
        if (migratedRole !== authData.role) {
          authData.role = migratedRole;
          localStorage.setItem('auth', JSON.stringify(authData));
        }
        
        setUser({
          id: authData.id,
          name: authData.fullName,
          email: authData.email,
          role: migratedRole,
          avatar: authData.avatar,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken
        });
        api.setToken(authData.accessToken);
      } catch (error) {
        console.error('Failed to parse saved auth:', error);
        localStorage.removeItem('auth');
      }
    }
    setIsLoading(false);
  }, []);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.login(email, password);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      const authData = response.data;
      const migratedRole = migrateRole(authData.role);
      const userData: User = {
        id: authData.id,
        name: authData.fullName,
        email: authData.email,
        role: migratedRole,
        avatar: authData.avatar,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken
      };

      setUser(userData);
      api.setToken(authData.accessToken);
      localStorage.setItem('auth', JSON.stringify(authData));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (email: string, password: string, fullName: string, role: UserRole = 'Learner'): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.register(email, password, fullName, role);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      const authData = response.data;
      const migratedRole = migrateRole(authData.role);
      const userData: User = {
        id: authData.id,
        name: authData.fullName,
        email: authData.email,
        role: migratedRole,
        avatar: authData.avatar,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken
      };

      setUser(userData);
      api.setToken(authData.accessToken);
      localStorage.setItem('auth', JSON.stringify(authData));
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      if (user?.accessToken) {
        await api.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      api.setToken(null);
      localStorage.removeItem('auth');
    }
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      // In a real app, this would require backend validation
      // For demo purposes, we'll allow role switching
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      
      // Update localStorage
      const savedAuth = localStorage.getItem('auth');
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        authData.role = role;
        localStorage.setItem('auth', JSON.stringify(authData));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        updateUserRole: switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};