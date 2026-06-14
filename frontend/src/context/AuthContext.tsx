import React, { createContext, useState, useEffect } from 'react';
import apiClient, { setClientAccessToken } from '../services/apiClient';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  isLoading: boolean;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTokenFromResponse = (response: any) =>
    response?.data?.data?.token ||
    response?.data?.token ||
    response?.data?.data?.accessToken ||
    response?.data?.accessToken ||
    null;

  const getUserFromResponse = (response: any) =>
    response?.data?.data?.user || response?.data?.user || null;

  // Initialize and check current auth session
  const checkAuth = async () => {
    try {
      // Hit refresh token endpoint on app load to auto login if valid cookie exists
      const response = await apiClient.post('/auth/refresh-token');
      const token = getTokenFromResponse(response);
      const userData = getUserFromResponse(response);
      
      if (token && userData) {
        setAccessToken(token);
        setClientAccessToken(token);
        setUser(userData);
      }
    } catch (error) {
      // If refresh token fails on load, user is unauthenticated
      setAccessToken(null);
      setClientAccessToken('');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Listen to token updates from silent refreshes inside apiClient
    const handleTokenRefreshed = (e: Event) => {
      const customEvent = e as CustomEvent<{ token: string; user?: User }>;
      const { token, user: refreshedUser } = customEvent.detail;
      setAccessToken(token);
      if (refreshedUser) {
        setUser(refreshedUser);
      }
    };

    const handleSessionExpired = () => {
      setAccessToken(null);
      setUser(null);
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);
    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    await apiClient.post('/auth/register', { name, email, password, confirmPassword });
  };

  const verifyOTP = async (email: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    const token = getTokenFromResponse(response);
    const userData = getUserFromResponse(response);
    
    if (token && userData) {
      setAccessToken(token);
      setClientAccessToken(token);
      setUser(userData);
    }
  };

  const resendOTP = async (email: string) => {
    await apiClient.post('/auth/resend-otp', { email });
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const token = getTokenFromResponse(response);
    const userData = getUserFromResponse(response);
    
    if (token && userData) {
      setAccessToken(token);
      setClientAccessToken(token);
      setUser(userData);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setClientAccessToken('');
      setUser(null);
    }
  };

  const forgotPassword = async (email: string) => {
    await apiClient.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    await apiClient.post('/auth/reset-password', { email, otp, newPassword });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        accessToken,
        isLoading,
        register,
        verifyOTP,
        resendOTP,
        login,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
