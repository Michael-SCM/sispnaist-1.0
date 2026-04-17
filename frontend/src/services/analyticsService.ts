import api from './api.js';
import {
  IKPIData,
  IAnalyticsDadosAcidentes,
  IVacinacaoProxima,
  IAnalyticsDashboardAdmin,
  IAnalyticsDashboardTrabalhador,
} from '../types/analytics.js';

export const analyticsService = {
  /**
   * Obtém KPIs gerais do sistema
   */
  obterKPIs: async (): Promise<IKPIData> => {
    const response = await api.get<{ data: { kpis: IKPIData } }>('/analytics/kpis');
    return response.data.data.kpis;
  },

  /**
   * Obtém dados para gráficos de acidentes
   */
  obterDadosAcidentes: async (): Promise<IAnalyticsDadosAcidentes> => {
    const response = await api.get<{ data: { dados: IAnalyticsDadosAcidentes } }>('/analytics/acidentes');
    return response.data.data.dados;
  },

  /**
   * Obtém próximas vacinações (vencidas ou próximas de vencer)
   */
  obterProximasVacinacoes: async (dias: number = 30): Promise<IVacinacaoProxima[]> => {
    const response = await api.get<{ data: { vacinacoes: IVacinacaoProxima[] } }>(
      `/analytics/vacinacoes/proximas?dias=${dias}`
    );
    return response.data.data.vacinacoes;
  },

  /**
   * Obtém últimos acidentes registrados
   */
  obterUltimosAcidentes: async (limit: number = 5): Promise<any[]> => {
    const response = await api.get<{ data: { acidentes: any[] } }>(
      `/analytics/acidentes/ultimos?limit=${limit}`
    );
    return response.data.data.acidentes;
  },

  /**
   * Obtém dados completos para dashboard admin
   */
  obterDashboardAdmin: async (): Promise<IAnalyticsDashboardAdmin> => {
    const response = await api.get<{ data: { dados: IAnalyticsDashboardAdmin } }>(
      '/analytics/dashboard'
    );
    return response.data.data.dados;
  },

  /**
   * Obtém dados resumidos para dashboard do trabalhador
   */
  obterDashboardTrabalhador: async (): Promise<IAnalyticsDashboardTrabalhador> => {
    const response = await api.get<{ data: { dados: IAnalyticsDashboardTrabalhador } }>(
      '/analytics/dashboard/trabalhador'
    );
    return response.data.data.dados;
  },
};
