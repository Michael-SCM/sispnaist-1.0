import api from './api.js';
import { IServidorFuncionario } from '../types';

interface ListarServidoresResponse {
  data: IServidorFuncionario[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const servidorService = {
  listar: async (
    page: number = 1,
    limit: number = 20,
    filtros?: { ativo?: boolean; situacaoFuncional?: string; lotacao?: string }
  ): Promise<ListarServidoresResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filtros?.ativo !== undefined) params.append('ativo', filtros.ativo.toString());
    if (filtros?.situacaoFuncional) params.append('situacaoFuncional', filtros.situacaoFuncional);
    if (filtros?.lotacao) params.append('lotacao', filtros.lotacao);

    const response = await api.get<{ data: ListarServidoresResponse }>(
      `/servidores?${params.toString()}`
    );
    return response.data.data;
  },

  obter: async (id: string): Promise<IServidorFuncionario> => {
    const response = await api.get<{ data: IServidorFuncionario }>(`/servidores/${id}`);
    return response.data.data;
  },

  criar: async (data: Partial<IServidorFuncionario>): Promise<IServidorFuncionario> => {
    const response = await api.post<{ data: IServidorFuncionario }>('/servidores', data);
    return response.data.data;
  },

  atualizar: async (id: string, data: Partial<IServidorFuncionario>): Promise<IServidorFuncionario> => {
    const response = await api.put<{ data: IServidorFuncionario }>(`/servidores/${id}`, data);
    return response.data.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/servidores/${id}`);
  },
};
