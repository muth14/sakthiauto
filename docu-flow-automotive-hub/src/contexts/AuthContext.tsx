import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../lib/services/authService';
import { User as ApiUser } from '../lib/api';

// Adapt the API User type to our frontend User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Supervisor' | 'Line Incharge' | 'Operator' | 'Auditor';
  department: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert API User to frontend User
const mapApiUserToUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser._id,
    name: apiUser.fullName || `${apiUser.firstName} ${apiUser.lastName}`,
    email: apiUser.email,
    role: apiUser.role,
    department: apiUser.department,
    avatar: apiUser.profilePicture
  };
};

// Mock users for demo - will be used as fallback if API is not available
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Demo Admin',
    email: 'admin@sakthiauto.com',
    role: 'Admin',
    department: 'IT'
  },
  {
    id: '2',
    name: 'John Supervisor',
    email: 'supervisor@sakthiauto.com',
    role: 'Supervisor',
    department: 'Production'
  },
  {
    id: '3',
    name: 'Mike Line Incharge',
    email: 'lineincharge@sakthiauto.com',
    role: 'Line Incharge',
    department: 'Assembly'
  },
  {
    id: '4',
    name: 'Sarah Operator',
    email: 'operator@sakthiauto.com',
    role: 'Operator',
    department: 'Quality Control'
  },
  {
    id: '5',
    name: 'David Auditor',
    email: 'auditor@sakthiauto.com',
    role: 'Auditor',
    department: 'Compliance'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          // Try to get current user from API
          try {
            const apiUser = await authService.getCurrentUser();
            const frontendUser = mapApiUserToUser(apiUser);
            setUser(frontendUser);
          } catch (error) {
            console.error('Failed to get current user:', error);
            // Fallback to stored user data
            const storedUser = authService.getStoredUser();
            if (storedUser) {
              const frontendUser = mapApiUserToUser(storedUser);
              setUser(frontendUser);
            } else {
              // Clear invalid token
              authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Store system users for job generation
    const systemUsers = [
      { firstName: 'System', lastName: 'Administrator', role: 'Admin', department: 'IT' },
      { firstName: 'John', lastName: 'Supervisor', role: 'Supervisor', department: 'Production' },
      { firstName: 'Mike', lastName: 'Line Incharge', role: 'Line Incharge', department: 'Assembly' },
      { firstName: 'Sarah', lastName: 'Operator', role: 'Operator', department: 'Quality Control' },
      { firstName: 'David', lastName: 'Auditor', role: 'Auditor', department: 'Compliance' },
      { firstName: 'Lisa', lastName: 'Safety Officer', role: 'Operator', department: 'Safety' }
    ];
    localStorage.setItem('systemUsers', JSON.stringify(systemUsers));

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Try API authentication first
      const loginResponse = await authService.login({ email, password });
      const frontendUser = mapApiUserToUser(loginResponse.user);
      setUser(frontendUser);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('API login failed, trying mock authentication:', error);

      // Fallback to mock authentication for demo purposes
      const foundUser = mockUsers.find(u => u.email === email);

      if (foundUser && password === 'password') {
        setUser(foundUser);

        // Set a mock token for API authentication
        const mockToken = `mock_token_${foundUser.id}_${Date.now()}`;
        localStorage.setItem('sakthiauto_token', mockToken);

        localStorage.setItem('sakthiauto_user', JSON.stringify({
          _id: foundUser.id,
          username: foundUser.email.split('@')[0],
          email: foundUser.email,
          firstName: foundUser.name.split(' ')[0],
          lastName: foundUser.name.split(' ').slice(1).join(' '),
          fullName: foundUser.name,
          role: foundUser.role,
          department: foundUser.department,
          employeeId: foundUser.id,
          createdAt: new Date().toISOString()
        }));
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all authentication data
      localStorage.removeItem('sakthiauto_token');
      localStorage.removeItem('sakthiauto_user');
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};