import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://prepbuddy-backend-8fxn.onrender.com' : 'http://localhost:8000');

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration and blocked users
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      // Handle 401 (Unauthorized - expired token)
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('prepcat_user');
        window.location.href = '/login';
      }
      
      // Handle 403 only if it's about being blocked or deleted (not AI limits)
      if (status === 403 && detail && (detail.includes('blocked') || detail.includes('deleted') || detail === 'Admin access required')) {
        localStorage.removeItem('token');
        localStorage.removeItem('prepcat_user');
        if (detail.includes('blocked') || detail.includes('deleted')) {
          alert('Your account has been blocked or deleted. Please contact admin.');
        }
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
