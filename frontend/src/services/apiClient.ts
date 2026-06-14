import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken = '';

export const setClientAccessToken = (token: string) => {
  accessToken = token;
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
    
    // Check if error is 401, not already retried, and not a login/logout/refresh endpoint
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      try {
        // Request token refresh
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        // Extract token. In our backend sendSuccess structure, it is in response.data.data
        const newToken = response.data?.data?.token || response.data?.token;
        const user = response.data?.data?.user || response.data?.user;
        
        if (newToken) {
          setClientAccessToken(newToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          // Notify AuthContext that the token was refreshed
          window.dispatchEvent(
            new CustomEvent('auth:token-refreshed', { 
              detail: { token: newToken, user } 
            })
          );
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed or cookie expired
        setClientAccessToken('');
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
