import { create } from 'zustand';
import { IUser } from '../types/index.js';

interface AuthStore {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: IUser | null) => void;
  setToken: (token: string | null) => void;
  setAuth: (user: IUser, token: string) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },

  setToken: (token) => {
    set({ token, isAuthenticated: !!token });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },

  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true });
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  },

  clearAuth: () => {
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  initializeAuth: () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      set({
        user: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true,
      });
    }
  },
}));
