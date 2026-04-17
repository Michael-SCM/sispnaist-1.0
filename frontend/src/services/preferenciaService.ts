import api from './api.js';
import { IPreferenciaUsuario } from '../types/index.js';

export const preferenciaService = {
  // Preferências do usuário logado
  obterMinhas: async (): Promise<IPreferenciaUsuario> => {
    const response = await api.get<{ data: IPreferenciaUsuario }>('/preferencias/minhas');
    return response.data.data;
  },

  atualizarMinhas: async (data: Partial<IPreferenciaUsuario>): Promise<IPreferenciaUsuario> => {
    const response = await api.put<{ data: IPreferenciaUsuario }>('/preferencias/minhas', data);
    return response.data.data;
  },

  // Preferências de outro usuário (admin)
  obter: async (usuarioId: string): Promise<IPreferenciaUsuario> => {
    const response = await api.get<{ data: IPreferenciaUsuario }>(`/preferencias/usuario/${usuarioId}`);
    return response.data.data;
  },

  atualizar: async (usuarioId: string, data: Partial<IPreferenciaUsuario>): Promise<IPreferenciaUsuario> => {
    const response = await api.put<{ data: IPreferenciaUsuario }>(`/preferencias/usuario/${usuarioId}`, data);
    return response.data.data;
  },
};
