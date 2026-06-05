import { create } from 'zustand';
import { IUser } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sispnaist-1-0.onrender.com/api';

interface AuthStore {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: IUser | null) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  clearAuth: () => {
    set({ user: null, isAuthenticated: false });
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
        set({ user: data.data.user, isAuthenticated: true, loading: false });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
}));
