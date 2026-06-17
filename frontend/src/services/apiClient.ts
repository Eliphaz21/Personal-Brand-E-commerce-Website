import axios from 'axios';
import {
  getTokenFromResponse,
  getUserFromResponse,
  normalizeUser,
} from '../utils/authSession';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken = '';
let refreshPromise: Promise<string | null> | null = null;

export const setClientAccessToken = (token: string) => {
  accessToken = token;
};

export const getClientAccessToken = () => accessToken;

/** Single in-flight refresh so parallel 401s don't rotate the cookie multiple times */
const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      const newToken = getTokenFromResponse(response);
      const user = normalizeUser(getUserFromResponse(response));

      if (!newToken) return null;

      setClientAccessToken(newToken);

      window.dispatchEvent(
        new CustomEvent('auth:token-refreshed', {
          detail: { token: newToken, user: user || undefined },
        })
      );

      return newToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Request interceptor to attach JWT
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for silent token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/logout') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        setClientAccessToken('');
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
