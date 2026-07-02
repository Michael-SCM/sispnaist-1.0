import api from './api';
import type { ApiResponse } from './api';

export interface IParametroPorUF {
  _id: string;
  chave: string;
  valor: string;
  descricao?: string;
  uf: string;
  categoria?: string;
  tipo: string;
  ativo: boolean;
  dataInicioVigencia: string;
  dataFimVigencia?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface IParametroUfListResponse {
  data: IParametroPorUF[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const parametroUfService = {
  listar: async (params?: {
    page?: number;
    limit?: number;
    uf?: string;
    categoria?: string;
    ativo?: string;
    chave?: string;
  }): Promise<IParametroUfListResponse> => {
    const response = await api.get('/parametros-uf', { params });
    return response.data;
  },

  obter: async (id: string): Promise<IParametroPorUF> => {
    const response = await api.get(`/parametros-uf/${id}`);
    return response.data;
  },

  obterPorChave: async (chave: string, uf?: string): Promise<IParametroPorUF> => {
    const response = await api.get(`/parametros-uf/chave/${chave}`, { params: { uf } });
    return response.data;
  },

  listarPorUF: async (uf: string, params?: { categoria?: string; ativo?: string }): Promise<{ data: IParametroPorUF[] }> => {
    const response = await api.get(`/parametros-uf/uf/${uf}`, { params });
    return response.data;
  },

  criar: async (data: Partial<IParametroPorUF>): Promise<IParametroPorUF> => {
    const response = await api.post('/parametros-uf', data);
    return response.data;
  },

  atualizar: async (id: string, data: Partial<IParametroPorUF>): Promise<IParametroPorUF> => {
    const response = await api.put(`/parametros-uf/${id}`, data);
    return response.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/parametros-uf/${id}`);
  }
};
