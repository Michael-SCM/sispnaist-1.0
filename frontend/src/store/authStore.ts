import { create } from 'zustand';
import { IUser } from '../types';
import axiosInstance from '../services/api';

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
      const response = await axiosInstance.get('/auth/me');
      set({ user: response.data.data.user, isAuthenticated: true, loading: false });
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
}));
