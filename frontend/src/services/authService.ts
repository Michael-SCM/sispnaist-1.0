import api from './api.js';
import { IUser, IAuthResponse } from '../types/index.js';

export const authService = {
  register: async (userData: Partial<IUser> & { senha: string }): Promise<{ status: string; message: string; data?: { user: IUser; verificationLink?: string } }> => {
    const response = await api.post<{ status: string; message: string; data?: { user: IUser; verificationLink?: string } }>('/auth/register', userData);
    return response.data;
  },

  login: async (email: string, senha: string, confiarDispositivo?: boolean): Promise<IAuthResponse> => {
    const response = await api.post<{ data: IAuthResponse }>('/auth/login', { email, senha, confiarDispositivo });
    return response.data.data;
  },

  // 2FA (Autenticação de Dois Fatores por e-mail)
  enviarCodigo2FA: async (email: string, senha: string): Promise<{ needs2FA: boolean; preAuthToken: string; doisFatoresHabilitado: boolean }> => {
    const response = await api.post<{ data: { needs2FA: boolean; preAuthToken: string; doisFatoresHabilitado: boolean } }>(
      '/auth/2fa/enviar-codigo',
      { email, senha }
    );
    return response.data.data;
  },

  verificar2FA: async (preAuthToken: string, codigo: string, confiarDispositivo?: boolean): Promise<IAuthResponse> => {
    const response = await api.post<{ data: IAuthResponse }>('/auth/2fa/verificar', { preAuthToken, codigo, confiarDispositivo });
    return response.data.data;
  },

  habilitar2FA: async (): Promise<string> => {
    const response = await api.post<{ status: string; message: string }>('/auth/2fa/habilitar');
    return response.data.message;
  },

  confirmar2FA: async (codigo: string): Promise<string> => {
    const response = await api.post<{ status: string; message: string }>('/auth/2fa/confirmar', { codigo });
    return response.data.message;
  },

  desabilitar2FA: async (senhaAtual: string, codigo: string): Promise<string> => {
    const response = await api.post<{ status: string; message: string }>('/auth/2fa/desabilitar', { senhaAtual, codigo });
    return response.data.message;
  },

  changePassword: async (senhaAtual: string, novaSenha: string, confirmarSenha: string, codigo: string): Promise<string> => {
    const response = await api.post<{ status: string; message: string }>('/auth/change-password', { senhaAtual, novaSenha, confirmarSenha, codigo });
    return response.data.message;
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

  exportDataPDF: async (): Promise<void> => {
    const response = await api.get('/auth/export-data/pdf', {
      responseType: 'blob',
    });

    const contentDisposition = response.headers['content-disposition'];
    const match = contentDisposition?.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i);
    const fallbackMatch = contentDisposition?.match(/filename=["']?([^"';\n]+)["']?/i);
    const filename = decodeURIComponent(match?.[1] ?? fallbackMatch?.[1] ?? `meus-dados-lgpd_${new Date().toISOString().split('T')[0]}.pdf`);

    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  deleteAccount: async (): Promise<string> => {
    const response = await api.post<{ status: string; message: string }>('/auth/delete-account');
    return response.data.message;
  },
};
