import { create } from 'zustand';
import { analyticsService } from '../services/analyticsService.js';
import {
  IKPIData,
  IAnalyticsDadosAcidentes,
  IVacinacaoProxima,
  IAnalyticsDashboardAdmin,
  IAnalyticsDashboardTrabalhador,
} from '../types/analytics.js';

interface IAnalyticsStore {
  // State
  kpis: IKPIData | null;
  dadosAcidentes: IAnalyticsDadosAcidentes | null;
  proximasVacinacoes: IVacinacaoProxima[];
  dashboardAdmin: IAnalyticsDashboardAdmin | null;
  dashboardTrabalhador: IAnalyticsDashboardTrabalhador | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  carregarKPIs: () => Promise<void>;
  carregarDadosAcidentes: () => Promise<void>;
  carregarProximasVacinacoes: (dias?: number) => Promise<void>;
  carregarDashboardAdmin: () => Promise<void>;
  carregarDashboardTrabalhador: () => Promise<void>;
  limparErro: () => void;
}

export const useAnalyticsStore = create<IAnalyticsStore>((set, get) => ({
  // Initial state
  kpis: null,
  dadosAcidentes: null,
  proximasVacinacoes: [],
  dashboardAdmin: null,
  dashboardTrabalhador: null,
  isLoading: false,
  error: null,

  // Carregar KPIs
  carregarKPIs: async () => {
    set({ isLoading: true, error: null });
    try {
      const kpis = await analyticsService.obterKPIs();
      set({ kpis, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar KPIs',
        isLoading: false,
      });
    }
  },

  // Carregar dados para gráficos de acidentes
  carregarDadosAcidentes: async () => {
    set({ isLoading: true, error: null });
    try {
      const dadosAcidentes = await analyticsService.obterDadosAcidentes();
      set({ dadosAcidentes, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar dados de acidentes',
        isLoading: false,
      });
    }
  },

  // Carregar próximas vacinações
  carregarProximasVacinacoes: async (dias: number = 30) => {
    set({ isLoading: true, error: null });
    try {
      const proximasVacinacoes = await analyticsService.obterProximasVacinacoes(dias);
      set({ proximasVacinacoes, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao car próximas vacinações',
        isLoading: false,
      });
    }
  },

  // Carregar dashboard admin completo
  carregarDashboardAdmin: async () => {
    set({ isLoading: true, error: null });
    try {
      const dashboardAdmin = await analyticsService.obterDashboardAdmin();
      set({ dashboardAdmin, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar dashboard admin',
        isLoading: false,
      });
    }
  },

  // Carregar dashboard trabalhador
  carregarDashboardTrabalhador: async () => {
    set({ isLoading: true, error: null });
    try {
      const dashboardTrabalhador = await analyticsService.obterDashboardTrabalhador();
      set({ dashboardTrabalhador, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar dashboard trabalhador',
        isLoading: false,
      });
    }
  },

  // Limpar erro
  limparErro: () => set({ error: null }),
}));
