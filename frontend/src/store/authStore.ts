import axios from 'axios';
import { create } from 'zustand';
import { IUser } from '../types';
import axiosInstance from '../services/api';

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

  setAuth: (user, accessToken, _refreshToken) => {
    set({ user, accessToken, isAuthenticated: true });
  },

  setAccessToken: (token) => {
    set({ accessToken: token });
  },

  clearAuth: () => {
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  initializeAuth: async () => {
    try {
      // Tenta renovar o token usando o cookie httpOnly (enviado automaticamente com withCredentials)
      const refreshRes = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
        withCredentials: true,
      });

      const { accessToken } = refreshRes.data.data;
      set({ accessToken });

      const meRes = await axiosInstance.get('/auth/me');
      set({ user: meRes.data.data.user, isAuthenticated: true, loading: false });
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false, loading: false });
    }
  },
}));
