import api from './api.js';
import { IAcidente } from '../types/index.js';

interface ListarAcidentesResponse {
  acidentes: IAcidente[];
  paginacao: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface EstatisticasResponse {
  stats: {
    total: number;
    porTipo: { [key: string]: number };
    porStatus: { [key: string]: number };
    ultimosMeses: { mes: string; quantidade: number }[];
  };
}

export const acidenteService = {
  criar: async (acidenteData: Partial<IAcidente>): Promise<IAcidente> => {
    const response = await api.post<{ data: { acidente: IAcidente } }>('/acidentes', acidenteData);
    return response.data.data.acidente;
  },

  obter: async (id: string): Promise<IAcidente> => {
    const response = await api.get<{ data: { acidente: IAcidente } }>(`/acidentes/${id}`);
    return response.data.data.acidente;
  },

  listar: async (
    page: number = 1,
    limit: number = 10,
    filtros?: {
      tipoAcidente?: string;
      status?: string;
      trabalhadorId?: string;
      dataInicio?: string;
      dataFim?: string;
    }
  ): Promise<ListarAcidentesResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filtros?.tipoAcidente) params.append('tipoAcidente', filtros.tipoAcidente);
    if (filtros?.status) params.append('status', filtros.status);
    if (filtros?.trabalhadorId) params.append('trabalhadorId', filtros.trabalhadorId);
    if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros?.dataFim) params.append('dataFim', filtros.dataFim);

    const response = await api.get<{ data: ListarAcidentesResponse }>(
      `/acidentes?${params.toString()}`
    );
    return response.data.data;
  },

  atualizar: async (id: string, acidenteData: Partial<IAcidente>): Promise<IAcidente> => {
    const response = await api.put<{ data: { acidente: IAcidente } }>(
      `/acidentes/${id}`,
      acidenteData
    );
    return response.data.data.acidente;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/acidentes/${id}`);
  },

  obterPorTrabalhador: async (
    trabalhadorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ListarAcidentesResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<{ data: ListarAcidentesResponse }>(
      `/acidentes/trabalhador/${trabalhadorId}?${params.toString()}`
    );
    return response.data.data;
  },

  obterEstatisticas: async (): Promise<EstatisticasResponse['stats']> => {
    const response = await api.get<EstatisticasResponse>('/acidentes/stats/estatisticas');
    return response.data.stats;
  },
};
