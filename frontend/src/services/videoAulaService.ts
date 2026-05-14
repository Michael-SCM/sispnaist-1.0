import api from './api';
import { IVideoAula } from '../types';

interface ListarVideoAulasResponse {
  data: IVideoAula[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const videoAulaService = {
  listar: async (
    page: number = 1,
    limit: number = 20,
    filtros?: { ativo?: boolean; categoria?: string }
  ): Promise<ListarVideoAulasResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filtros?.ativo !== undefined) params.append('ativo', filtros.ativo.toString());
    if (filtros?.categoria) params.append('categoria', filtros.categoria);

    const response = await api.get<{ data: ListarVideoAulasResponse }>(
      `/video-aulas?${params.toString()}`
    );
    return response.data.data;
  },

  obter: async (id: string): Promise<IVideoAula> => {
    // backend: GET /video-aulas/:id retorna o documento direto (não { data: ... })
    const response = await api.get<IVideoAula>(`/video-aulas/${id}`);
    return response.data;
  },

  criar: async (data: Partial<IVideoAula>): Promise<IVideoAula> => {
    const response = await api.post<{ data: IVideoAula }>('/video-aulas', data);
    return response.data.data;
  },

  atualizar: async (id: string, data: Partial<IVideoAula>): Promise<IVideoAula> => {
    const response = await api.put<{ data: IVideoAula }>(`/video-aulas/${id}`, data);
    return response.data.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/video-aulas/${id}`);
  },
};
