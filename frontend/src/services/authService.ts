import api from './api.js';
import { IUser, IAuthResponse } from '../types/index.js';

export const authService = {
  register: async (userData: Partial<IUser> & { senha: string }): Promise<{ status: string; message: string; data?: { user: IUser; verificationLink?: string } }> => {
    const response = await api.post<{ status: string; message: string; data?: { user: IUser; verificationLink?: string } }>('/auth/register', userData);
    return response.data;
  },

  login: async (email: string, senha: string): Promise<IAuthResponse> => {
    const response = await api.post<{
      data: IAuthResponse & { accessToken: string; refreshToken: string; csrfToken: string }
    }>('/auth/login', { email, senha });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // falha no logout remoto não impede o logout local
    }
  },

  me: async (): Promise<IUser> => {
    const response = await api.get<{ data: { user: IUser } }>('/auth/me');
    return response.data.data.user;
  },

  updateProfile: async (userData: Partial<IUser>): Promise<IUser> => {
    const response = await api.put<{ data: { user: IUser } }>('/auth/profile', userData);
    return response.data.data.user;
  },

  forgotPassword: async (email: string, dataNascimento: string): Promise<{ status: string; message: string; token?: string }> => {
    const response = await api.post<{ status: string; message: string; token?: string }>('/auth/forgot-password', { email, dataNascimento });
    return response.data;
  },

  resetPassword: async (token: string, novaSenha: string, confirmarSenha: string): Promise<string> => {
    const response = await api.post<{ status: string; message: string }>('/auth/reset-password', { token, novaSenha, confirmarSenha });
    return response.data.message;
  },

  verifyEmail: async (token: string): Promise<string> => {
    const response = await api.post<{ status: string; message: string }>('/auth/verify-email', { token });
    return response.data.message;
  },

  // LGPD
  registerConsent: async (consentimentoLGPD: boolean, versaoTermo?: string): Promise<string> => {
    const response = await api.post<{ status: string; message: string }>('/auth/consent', { consentimentoLGPD, versaoTermo });
    return response.data.message;
  },

  exportData: async (): Promise<any> => {
    const response = await api.get<{ status: string; data: any }>('/auth/export-data');
    return response.data.data;
  },

  deleteAccount: async (): Promise<string> => {
    const response = await api.post<{ status: string; message: string }>('/auth/delete-account');
    return response.data.message;
  },
};
