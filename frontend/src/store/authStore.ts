import { create } from 'zustand';
import { IUser } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sispnaist-1-0.onrender.com/api';

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

export const useAuthStore = create<AuthStore>((set) => ({
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
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        set({ user: data.data.user, isAuthenticated: true, token: null, refreshToken: null, loading: false });
      } else {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, loading: false });
      }
    } catch {
      set({ user: null, token: null, refreshToken: null, isAuthenticated: false, loading: false });
    }
  },
}));
