import api from './api.js';
import { IDoenca } from '../types/index.js';

export interface ListarDoencasResponse {
  sucesso: boolean;
  dados: IDoenca[];
  paginacao: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface EstatisticasResponse {
  sucesso: boolean;
  dados: {
    total: number;
    porNome: { [key: string]: number };
    ativas: number;
    encerradas: number;
    ultimosMeses: { mes: string; quantidade: number }[];
  };
}

export const doencaService = {
  async criar(doencaData: Partial<IDoenca>): Promise<IDoenca> {
    const response = await api.post('/doencas', doencaData);
    return response.data.dados;
  },

  async obter(id: string): Promise<IDoenca> {
    const response = await api.get(`/doencas/${id}`);
    return response.data.dados;
  },

  async listar(
    page: number = 1,
    limit: number = 10,
    filtros?: {
      nomeDoenca?: string;
      ativo?: boolean;
      trabalhadorId?: string;
      dataInicio?: string;
      dataFim?: string;
    }
  ): Promise<ListarDoencasResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    if (filtros?.nomeDoenca) queryParams.append('nomeDoenca', filtros.nomeDoenca);
    if (filtros?.ativo !== undefined) queryParams.append('ativo', filtros.ativo.toString());
    if (filtros?.trabalhadorId) queryParams.append('trabalhadorId', filtros.trabalhadorId);
    if (filtros?.dataInicio) queryParams.append('dataInicio', filtros.dataInicio);
    if (filtros?.dataFim) queryParams.append('dataFim', filtros.dataFim);

    const response = await api.get(`/doencas?${queryParams.toString()}`);
    return response.data;
  },

  async atualizar(id: string, doencaData: Partial<IDoenca>): Promise<IDoenca> {
    const response = await api.put(`/doencas/${id}`, doencaData);
    return response.data.dados;
  },

  async deletar(id: string): Promise<void> {
    await api.delete(`/doencas/${id}`);
  },

  async obterPorTrabalhador(trabalhadorId: string, page: number = 1, limit: number = 10): Promise<ListarDoencasResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const response = await api.get(`/doencas/trabalhador/${trabalhadorId}?${queryParams.toString()}`);
    return response.data;
  },

  async obterEstatisticas(): Promise<EstatisticasResponse> {
    const response = await api.get('/doencas/stats/estatisticas');
    return response.data;
  },
};
