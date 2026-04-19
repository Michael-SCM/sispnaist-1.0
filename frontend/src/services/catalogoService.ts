import api from './api.js';
import { ICatalogoItem } from '../types';

interface ListarCatalogosResponse {
  data: ICatalogoItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const catalogoService = {
  // Lista todas as entidades com contagem
  listarEntidades: async (): Promise<{ entidade: string; total: number; ativos: number }[]> => {
    const response = await api.get<{ data: { entidade: string; total: number; ativos: number }[] }>('/catalogos/listar-todos');
    return response.data.data;
  },

  // Lista itens de uma entidade com paginação
  listar: async (
    entidade: string,
    page: number = 1,
    limit: number = 100,
    ativo?: boolean
  ): Promise<ListarCatalogosResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (ativo !== undefined) params.append('ativo', ativo.toString());

    const response = await api.get<{ data: ListarCatalogosResponse }>(
      `/catalogos/${entidade}?${params.toString()}`
    );
    return response.data.data;
  },

  // Lista apenas itens ativos (equivale ao getdados.php)
  listarAtivos: async (entidade: string): Promise<ICatalogoItem[]> => {
    const response = await api.get<{ data: ICatalogoItem[] }>(`/catalogos/${entidade}/ativos`);
    return response.data.data;
  },

  // Obter item específico
  obter: async (entidade: string, id: string): Promise<ICatalogoItem> => {
    const response = await api.get<{ data: ICatalogoItem }>(`/catalogos/${entidade}/${id}`);
    return response.data.data;
  },

  // Criar novo item
  criar: async (entidade: string, data: Partial<ICatalogoItem>): Promise<ICatalogoItem> => {
    const response = await api.post<{ data: ICatalogoItem }>(`/catalogos/${entidade}`, data);
    return response.data.data;
  },

  // Atualizar item
  atualizar: async (entidade: string, id: string, data: Partial<ICatalogoItem>): Promise<ICatalogoItem> => {
    const response = await api.put<{ data: ICatalogoItem }>(`/catalogos/${entidade}/${id}`, data);
    return response.data.data;
  },

  // Deletar item (soft delete)
  deletar: async (entidade: string, id: string): Promise<void> => {
    await api.delete(`/catalogos/${entidade}/${id}`);
  },
};
