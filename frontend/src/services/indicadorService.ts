import api from './api';
import type { IIndicador, IMetricaDisponivel, IFormulaIndicador } from '../types/indicadores.js';

export interface IIndicadorListResponse {
  data: IIndicador[];
}

export interface ICalculoResponse {
  data: Array<IIndicador & { valorCalculado: number; alcancouMeta: boolean | null }>;
}

export interface IIndicadorCalcularResponse {
  indicador: IIndicador;
  valor: number;
  alcancouMeta: boolean | null;
}

export const indicadorService = {
  listar: async (params?: {
    categoria?: string;
    uf?: string;
    ativo?: string;
    nome?: string;
  }): Promise<IIndicadorListResponse> => {
    const response = await api.get('/indicadores', { params });
    return response.data;
  },

  obter: async (id: string): Promise<IIndicador> => {
    const response = await api.get(`/indicadores/${id}`);
    return response.data;
  },

  criar: async (data: Partial<IIndicador>): Promise<IIndicador> => {
    const response = await api.post('/indicadores', data);
    return response.data;
  },

  atualizar: async (id: string, data: Partial<IIndicador>): Promise<IIndicador> => {
    const response = await api.put(`/indicadores/${id}`, data);
    return response.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/indicadores/${id}`);
  },

  calcular: async (id: string, uf?: string): Promise<IIndicadorCalcularResponse> => {
    const params: any = {};
    if (uf) params.uf = uf;
    const response = await api.get(`/indicadores/${id}/calcular`, { params });
    return response.data;
  },

  calcularTodos: async (uf?: string): Promise<ICalculoResponse> => {
    const params: any = {};
    if (uf) params.uf = uf;
    const response = await api.get('/indicadores/calcular/todos', { params });
    return response.data;
  },

  obterMetricas: async (): Promise<{ data: IMetricaDisponivel[] }> => {
    const response = await api.get('/indicadores/metricas');
    return response.data;
  }
};
