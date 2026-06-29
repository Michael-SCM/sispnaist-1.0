import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken && config.headers) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  const csrfToken = getCookie('csrf-token');
  if (csrfToken && config.headers) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason?: any) => void;
}> = [];

function processQueue(error: any, token?: string) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const responseData = error.response?.data as any;

    const authEndpoints = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email', '/auth/me'];
    if (authEndpoints.some(url => originalRequest.url?.includes(url))) {
      const errorMessage = responseData?.message || error.message || 'Erro na requisição';
      const customError = new Error(errorMessage) as any;
      if (responseData?.errors) customError.details = responseData.errors;
      return Promise.reject(customError);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      const errorMessage = responseData?.message || error.message || 'Erro na requisição';
      const customError = new Error(errorMessage) as any;
      if (responseData?.errors) customError.details = responseData.errors;
      return Promise.reject(customError);
    }

    if (originalRequest.url?.includes('/auth/refresh-token') || originalRequest.url?.includes('/auth/logout')) {
      useAuthStore.getState().clearAuth();
      toast.error('Sessão expirada. Faça login novamente.');
      setTimeout(() => { window.location.href = '/login'; }, 2500);
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
        }
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
        withCredentials: true,
      });

      const newToken = data.data.accessToken;

      useAuthStore.getState().setAccessToken(newToken);

      processQueue(null, newToken);

      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      }
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      useAuthStore.getState().clearAuth();
      toast.error('Sessão expirada. Faça login novamente.');
      setTimeout(() => { window.location.href = '/login'; }, 2500);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
