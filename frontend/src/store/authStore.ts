import { create } from 'zustand';
import { IUser } from '../types';

interface AuthStore {
  user: IUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: IUser | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setAuth: (user: IUser, token: string, refreshToken?: string) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  },

  setToken: (token) => {
    set({ token, isAuthenticated: !!token });
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  },

  setRefreshToken: (refreshToken) => {
    set({ refreshToken });
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    else localStorage.removeItem('refreshToken');
  },

  setAuth: (user, token, refreshToken) => {
    set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true });
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  },

  clearAuth: () => {
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  initializeAuth: () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedUser && storedToken) {
      set({
        user: JSON.parse(storedUser),
        token: storedToken,
        refreshToken: storedRefreshToken,
        isAuthenticated: true,
      });
    }
  },
}));
