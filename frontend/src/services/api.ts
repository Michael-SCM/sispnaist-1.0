import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sispnaist-1-0.onrender.com/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      const responseData = error.response?.data as any;
      const errorMessage = responseData?.message || error.message || 'Erro na requisição';
      const customError = new Error(errorMessage) as any;
      if (responseData?.errors) customError.details = responseData.errors;
      return Promise.reject(customError);
    }

    if (originalRequest.url?.includes('/auth/refresh-token')) {
      useAuthStore.getState().clearAuth();
      toast.error('Sessão expirada. Faça login novamente.');
      setTimeout(() => { window.location.href = '/login'; }, 2500);
      return Promise.reject(error);
    }

    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) {
      useAuthStore.getState().clearAuth();
      toast.error('Sessão expirada. Faça login novamente.');
      setTimeout(() => { window.location.href = '/login'; }, 2500);
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
      const newToken = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;

      useAuthStore.getState().setToken(newToken);
      useAuthStore.getState().setRefreshToken(newRefreshToken);

      processQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
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
