import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import authService from '../services/authService';
import type { User } from '../services/authService';

interface LoginResult {
  success?: boolean;
  requires2FA?: boolean;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string, twoFactorCode?: string | null) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    username: string, 
    password: string, 
    twoFactorCode: string | null = null
  ): Promise<LoginResult> => {
    try {
      // First, authenticate with username/password
      const authResult = await authService.authenticateUserAndPassword(username, password);
      
      if (authResult.require_2fa && !twoFactorCode) {
        return { requires2FA: true, username: authResult.username };
      }

      if (authResult.require_2fa && twoFactorCode) {
        // Verify 2FA code
        await authService.verify2FA(username, password, twoFactorCode);
      }

      // Get user data after successful authentication
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Unknown error occurred');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      // Even if logout fails on server, clear local state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshAuth = async (): Promise<void> => {
    return await checkAuthStatus();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshAuth,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};