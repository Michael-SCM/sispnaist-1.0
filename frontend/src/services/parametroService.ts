import api from './api.js';
import { IParametro } from '../types/index.js';

interface ListarParametrosResponse {
  data: IParametro[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const parametroService = {
  listar: async (
    page: number = 1,
    limit: number = 100,
    filtros?: { categoria?: string; ativo?: boolean }
  ): Promise<ListarParametrosResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.ativo !== undefined) params.append('ativo', filtros.ativo.toString());

    const response = await api.get<{ data: ListarParametrosResponse }>(
      `/parametros?${params.toString()}`
    );
    return response.data.data;
  },

  obterPorChave: async (chave: string): Promise<IParametro> => {
    const response = await api.get<{ data: IParametro }>(`/parametros/chave/${chave}`);
    return response.data.data;
  },

  obter: async (id: string): Promise<IParametro> => {
    const response = await api.get<{ data: IParametro }>(`/parametros/${id}`);
    return response.data.data;
  },

  criar: async (data: Partial<IParametro>): Promise<IParametro> => {
    const response = await api.post<{ data: IParametro }>('/parametros', data);
    return response.data.data;
  },

  atualizar: async (id: string, data: Partial<IParametro>): Promise<IParametro> => {
    const response = await api.put<{ data: IParametro }>(`/parametros/${id}`, data);
    return response.data.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/parametros/${id}`);
  },
};
