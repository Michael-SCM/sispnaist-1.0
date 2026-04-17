import api from './api.js';
import { IVacinacao } from '../types/index.js';

export interface ListarVacinacoesResponse {
  vacinacoes: IVacinacao[];
  total: number;
  pages: number;
}

export interface EstatisticasResponse {
  total: number;
  porVacina: Record<string, number>;
  proximasDoses: number;
}

export const vacinacaoService = {
  criar: async (data: Partial<IVacinacao>): Promise<{ vacinacao: IVacinacao }> => {
    const response = await api.post<{ data: { vacinacao: IVacinacao } }>('/vacinacoes', data);
    return response.data.data;
  },

  obter: async (id: string): Promise<{ vacinacao: IVacinacao }> => {
    const response = await api.get<{ data: { vacinacao: IVacinacao } }>(`/vacinacoes/${id}`);
    return response.data.data;
  },

  listar: async (filtros?: {
    page?: number;
    limit?: number;
    vacina?: string;
    trabalhadorId?: string;
  }): Promise<ListarVacinacoesResponse> => {
    const params = new URLSearchParams();
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.limit) params.append('limit', filtros.limit.toString());
    if (filtros?.vacina) params.append('vacina', filtros.vacina);
    if (filtros?.trabalhadorId) params.append('trabalhadorId', filtros.trabalhadorId);

    const response = await api.get<{ data: ListarVacinacoesResponse }>(
      `/vacinacoes?${params.toString()}`
    );
    return response.data.data;
  },

  atualizar: async (id: string, data: Partial<IVacinacao>): Promise<{ vacinacao: IVacinacao }> => {
    const response = await api.put<{ data: { vacinacao: IVacinacao } }>(`/vacinacoes/${id}`, data);
    return response.data.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/vacinacoes/${id}`);
  },

  obterPorTrabalhador: async (trabalhadorId: string): Promise<{ vacinacoes: IVacinacao[] }> => {
    const response = await api.get<{ data: { vacinacoes: IVacinacao[] } }>(
      `/vacinacoes/trabalhador/${trabalhadorId}`
    );
    return response.data.data;
  },

  obterEstatisticas: async (): Promise<EstatisticasResponse> => {
    const response = await api.get<{ data: EstatisticasResponse }>('/vacinacoes/stats/estatisticas');
    return response.data.data;
  },
};
