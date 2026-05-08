import api from './api.js';
import { IUser, IAuthResponse } from '../types/index.js';

export const authService = {
  register: async (userData: Partial<IUser> & { senha: string }): Promise<IAuthResponse> => {
    const response = await api.post<{ data: IAuthResponse }>('/auth/register', userData);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data.data;
  },

  login: async (email: string, senha: string): Promise<IAuthResponse> => {
    const response = await api.post<{ data: IAuthResponse }>('/auth/login', { email, senha });
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  me: async (): Promise<IUser> => {
    const response = await api.get<{ data: { user: IUser } }>('/auth/me');
    return response.data.data.user;
  },

  updateProfile: async (userData: Partial<IUser>): Promise<IUser> => {
    const response = await api.put<{ data: { user: IUser } }>('/auth/profile', userData);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    return response.data.data.user;
  },

  getStoredUser: (): IUser | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  forgotPassword: async (email: string, dataNascimento: string): Promise<{ status: string; message: string; token?: string }> => {
    const response = await api.post<{ status: string; message: string; token?: string }>('/auth/forgot-password', { email, dataNascimento });
    return response.data;
  },

  resetPassword: async (token: string, novaSenha: string, confirmarSenha: string): Promise<string> => {
    const response = await api.post<{ status: string; message: string }>('/auth/reset-password', { token, novaSenha, confirmarSenha });
    return response.data.message;
  },
};
