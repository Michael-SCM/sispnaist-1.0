import api from './api';
import { IQuiz } from '../types';

interface ListarQuizzesResponse {
  data: IQuiz[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const quizService = {
  listar: async (page: number = 1, limit: number = 20, filtros?: { videoAulaId?: string; ativo?: boolean }): Promise<ListarQuizzesResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filtros?.videoAulaId) params.append('videoAulaId', filtros.videoAulaId);
    if (filtros?.ativo !== undefined) params.append('ativo', filtros.ativo.toString());

    const response = await api.get<{ data: ListarQuizzesResponse }>(`/quizzes?${params.toString()}`);
    return response.data.data;
  },

  obter: async (id: string): Promise<IQuiz> => {
    const response = await api.get<IQuiz>(`/quizzes/${id}`);
    return response.data;
  },

  obterPorVideo: async (videoAulaId: string): Promise<IQuiz> => {
    const response = await api.get<IQuiz>(`/quizzes/video/${videoAulaId}`);
    return response.data;
  },

  criar: async (data: Partial<IQuiz>): Promise<IQuiz> => {
    const response = await api.post<{ data: IQuiz }>('/quizzes', data);
    return response.data.data;
  },

  atualizar: async (id: string, data: Partial<IQuiz>): Promise<IQuiz> => {
    const response = await api.put<{ data: IQuiz }>(`/quizzes/${id}`, data);
    return response.data.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/quizzes/${id}`);
  },

  salvar: async (videoAulaId: string | undefined, data: Partial<IQuiz>): Promise<IQuiz> => {
    if (videoAulaId) {
      const existente = await api.get<IQuiz>(`/quizzes/video/${videoAulaId}`).catch(() => null);
      if (existente && existente.data) {
        const response = await api.put<{ data: IQuiz }>(`/quizzes/${existente.data._id}`, data);
        return response.data.data;
      }
    }
    const response = await api.post<{ data: IQuiz }>('/quizzes', data);
    return response.data.data;
  }
};
