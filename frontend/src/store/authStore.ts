import axios from 'axios';
import { create } from 'zustand';
import { IUser } from '../types';
import axiosInstance from '../services/api';

const REFRESH_TOKEN_KEY = 'sispnaist_refreshToken';
const API_URL = import.meta.env.VITE_API_URL || '/api';

interface AuthStore {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setAuth: (user: IUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  setAccessToken: (token) => {
    set({ accessToken: token });
  },

  clearAuth: () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  initializeAuth: async () => {
    try {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) {
        set({ user: null, accessToken: null, isAuthenticated: false, loading: false });
        return;
      }

      // Use direct axios call to avoid triggering the response interceptor (no "Session expired" toast)
      const refreshRes = await axios.post(`${API_URL}/auth/refresh-token`, {
        refreshToken: storedRefreshToken,
      });

      const { accessToken, refreshToken } = refreshRes.data.data;
      set({ accessToken });

      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      const meRes = await axiosInstance.get('/auth/me');
      set({ user: meRes.data.data.user, isAuthenticated: true, loading: false });
    } catch {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      set({ user: null, accessToken: null, isAuthenticated: false, loading: false });
    }
  },
}));
