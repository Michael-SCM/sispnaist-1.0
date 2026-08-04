import axios from 'axios';
import { create } from 'zustand';
import { IUser } from '../types';
import axiosInstance from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const STORAGE_KEY = 'sispnaist_accessToken';

interface AuthStore {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  preAuthToken: string | null;
  needs2FA: boolean;
  setAuth: (user: IUser, accessToken: string, refreshToken: string) => void;
  setUser: (user: IUser) => void;
  setAccessToken: (token: string | null) => void;
  setPreAuth: (preAuthToken: string | null) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true,
  preAuthToken: null,
  needs2FA: false,

  setAuth: (user, accessToken, _refreshToken) => {
    sessionStorage.setItem(STORAGE_KEY, accessToken);
    set({ user, accessToken, isAuthenticated: true, preAuthToken: null, needs2FA: false });
  },

  setUser: (user) => {
    set({ user });
  },

  setAccessToken: (token) => {
    if (token) {
      sessionStorage.setItem(STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    set({ accessToken: token });
  },

  setPreAuth: (preAuthToken) => {
    set({ preAuthToken, needs2FA: !!preAuthToken });
  },

  clearAuth: () => {
    sessionStorage.removeItem(STORAGE_KEY);
    set({ user: null, accessToken: null, isAuthenticated: false, preAuthToken: null, needs2FA: false });
  },

  initializeAuth: async () => {
    try {
      const storedToken = sessionStorage.getItem(STORAGE_KEY);

      if (storedToken) {
        set({ accessToken: storedToken });
        try {
          const meRes = await axiosInstance.get('/auth/me');
          set({ user: meRes.data.data.user, isAuthenticated: true, loading: false });
          return;
        } catch {
          sessionStorage.removeItem(STORAGE_KEY);
          set({ accessToken: null });
        }
      }

      const refreshRes = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
        withCredentials: true,
      });

      const { accessToken } = refreshRes.data.data;
      sessionStorage.setItem(STORAGE_KEY, accessToken);
      set({ accessToken });

      const meRes = await axiosInstance.get('/auth/me');
      set({ user: meRes.data.data.user, isAuthenticated: true, loading: false });
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      set({ user: null, accessToken: null, isAuthenticated: false, loading: false });
    }
  },
}));
