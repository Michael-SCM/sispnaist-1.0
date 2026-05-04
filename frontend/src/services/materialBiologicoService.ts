import api from './api.js';
import { IMaterialBiologico } from '../types/index.js';

interface ListarFichasResponse {
  fichas: IMaterialBiologico[];
  paginacao: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const materialBiologicoService = {
  criar: async (fichaData: Partial<IMaterialBiologico>): Promise<IMaterialBiologico> => {
    const response = await api.post<{ data: { ficha: IMaterialBiologico } }>('/material-biologico', fichaData);
    return response.data.data.ficha;
  },

  obter: async (id: string): Promise<IMaterialBiologico> => {
    const response = await api.get<{ data: { ficha: IMaterialBiologico } }>(`/material-biologico/${id}`);
    return response.data.data.ficha;
  },

  obterPorAcidente: async (acidenteId: string): Promise<IMaterialBiologico | null> => {
    const response = await api.get<{ data: { ficha: IMaterialBiologico | null } }>(`/material-biologico/acidente/${acidenteId}`);
    return response.data.data.ficha;
  },

  listar: async (
    page: number = 1,
    limit: number = 10,
    filtros?: {
      tipoExposicao?: string;
      agente?: string;
    }
  ): Promise<ListarFichasResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filtros?.tipoExposicao) params.append('tipoExposicao', filtros.tipoExposicao);
    if (filtros?.agente) params.append('agente', filtros.agente);

    const response = await api.get<{ data: ListarFichasResponse }>(
      `/material-biologico?${params.toString()}`
    );
    return response.data.data;
  },

  atualizar: async (id: string, fichaData: Partial<IMaterialBiologico>): Promise<IMaterialBiologico> => {
    const response = await api.put<{ data: { ficha: IMaterialBiologico } }>(
      `/material-biologico/${id}`,
      fichaData
    );
    return response.data.data.ficha;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/material-biologico/${id}`);
  },
};
