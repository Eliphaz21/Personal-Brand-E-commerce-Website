import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient, { setClientAccessToken } from '../services/apiClient';
import type { User } from '../types';
import {
  getTokenFromResponse,
  getUserFromResponse,
  normalizeUser,
} from '../utils/authSession';

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
  requestChangePasswordOTP: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string, otp: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((token: string, userData: User) => {
    setAccessToken(token);
    setClientAccessToken(token);
    setUser(userData);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setClientAccessToken('');
    setUser(null);
  }, []);

  const fetchUserProfile = useCallback(async (): Promise<User | null> => {
    try {
      const profileRes = await apiClient.get('/users/profile');
      return normalizeUser(getUserFromResponse(profileRes) || profileRes.data?.user);
    } catch {
      return null;
    }
  }, []);

  const restoreSessionFromRefresh = useCallback(async (): Promise<boolean> => {
    const response = await apiClient.post('/auth/refresh-token');
    const token = getTokenFromResponse(response);

    if (!token) return false;

    setClientAccessToken(token);
    setAccessToken(token);

    let userData = normalizeUser(getUserFromResponse(response));
    if (!userData) {
      userData = await fetchUserProfile();
    }

    if (!userData) return false;

    setUser(userData);
    return true;
  }, [fetchUserProfile]);

  const checkAuth = useCallback(async () => {
    try {
      await restoreSessionFromRefresh();
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [restoreSessionFromRefresh, clearSession]);

  useEffect(() => {
    checkAuth();

    const handleTokenRefreshed = (e: Event) => {
      const customEvent = e as CustomEvent<{ token: string; user?: User }>;
      const { token, user: refreshedUser } = customEvent.detail;
      setAccessToken(token);
      setClientAccessToken(token);
      if (refreshedUser) {
        setUser(refreshedUser);
      }
    };

    const handleSessionExpired = () => {
      clearSession();
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);
    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [checkAuth, clearSession]);

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    await apiClient.post('/auth/register', { name, email, password, confirmPassword });
  };

  const verifyOTP = async (email: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    const token = getTokenFromResponse(response);
    const userData = normalizeUser(getUserFromResponse(response));

    if (token && userData) {
      applySession(token, userData);
    }
  };

  const resendOTP = async (email: string) => {
    await apiClient.post('/auth/resend-otp', { email });
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const token = getTokenFromResponse(response);
    const userData = normalizeUser(getUserFromResponse(response));

    if (token && userData) {
      applySession(token, userData);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearSession();
    }
  };

  const forgotPassword = async (email: string) => {
    await apiClient.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    await apiClient.post('/auth/reset-password', { email, otp, newPassword });
  };

  const requestChangePasswordOTP = async () => {
    await apiClient.post('/auth/change-password/request-otp');
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
    otp: string
  ) => {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
      otp,
    });
    clearSession();
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
        requestChangePasswordOTP,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
