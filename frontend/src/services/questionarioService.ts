import api from './api.js';
import { IQuestionario } from '../types/index.js';

interface ListarQuestionariosResponse {
  data: IQuestionario[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const questionarioService = {
  listar: async (
    page: number = 1,
    limit: number = 20,
    filtros?: { ativo?: boolean; tipo?: string }
  ): Promise<ListarQuestionariosResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filtros?.ativo !== undefined) params.append('ativo', filtros.ativo.toString());
    if (filtros?.tipo) params.append('tipo', filtros.tipo);

    const response = await api.get<{ data: ListarQuestionariosResponse }>(
      `/questionarios?${params.toString()}`
    );
    return response.data.data;
  },

  obter: async (id: string): Promise<IQuestionario & { itens: any[] }> => {
    const response = await api.get<{ data: IQuestionario & { itens: any[] } }>(`/questionarios/${id}`);
    return response.data.data;
  },

  criar: async (data: Partial<IQuestionario>): Promise<IQuestionario> => {
    const response = await api.post<{ data: IQuestionario }>('/questionarios', data);
    return response.data.data;
  },

  atualizar: async (id: string, data: Partial<IQuestionario>): Promise<IQuestionario> => {
    const response = await api.put<{ data: IQuestionario }>(`/questionarios/${id}`, data);
    return response.data.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/questionarios/${id}`);
  },

  // Itens do questionário
  criarItem: async (questionarioId: string, data: any): Promise<any> => {
    const response = await api.post<{ data: any }>(`/questionarios/${questionarioId}/itens`, data);
    return response.data.data;
  },

  atualizarItem: async (questionarioId: string, itemId: string, data: any): Promise<any> => {
    const response = await api.put<{ data: any }>(`/questionarios/${questionarioId}/itens/${itemId}`, data);
    return response.data.data;
  },

  deletarItem: async (questionarioId: string, itemId: string): Promise<void> => {
    await api.delete(`/questionarios/${questionarioId}/itens/${itemId}`);
  },
};
