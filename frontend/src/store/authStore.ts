import { create } from 'zustand';
import { IUser } from '../types';
import api from '../services/api';

interface AuthStore {
  user: IUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: IUser | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setAuth: (user: IUser, token: string, refreshToken?: string) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setToken: (token) => {
    set({ token, isAuthenticated: !!token });
  },

  setRefreshToken: (refreshToken) => {
    set({ refreshToken });
  },

  setAuth: (user, token, refreshToken) => {
    set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true });
  },

  clearAuth: () => {
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  initializeAuth: async () => {
    try {
      set({ loading: true });
      const response = await api.get('/auth/me');
      const user = response.data.data.user;
      set({ user, isAuthenticated: true, token: null, refreshToken: null, loading: false });
    } catch {
      set({ user: null, token: null, refreshToken: null, isAuthenticated: false, loading: false });
    }
  },
}));
