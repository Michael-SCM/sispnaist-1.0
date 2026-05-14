import { create } from 'zustand';
import { IVacinacao } from '../types';

interface VacinacaoFilters {
  vacina?: string;
  ativo?: boolean;
  dataInicio?: string;
  dataFim?: string;
  trabalhadorId?: string;
}

interface VacinacaoStore {
  vacinacoes: IVacinacao[];
  currentVacinacao: IVacinacao | null;
  total: number;
  page: number;
  limit: number;
  pages: number;
  isLoading: boolean;
  error: string | null;
  filtros: VacinacaoFilters;

  // Setters
  setVacinacoes: (vacinacoes: IVacinacao[]) => void;
  setCurrentVacinacao: (vacinacao: IVacinacao | null) => void;
  setPage: (page: number) => void;
  setFiltros: (filtros: VacinacaoFilters) => void;
  clearFiltros: () => void;
  setPaginacao: (page: number, limit: number, total: number, pages: number) => void;

  // Actions
  adicionarVacinacao: (vacinacao: IVacinacao) => void;
  atualizarVacinacao: (id: string, vacinacao: Partial<IVacinacao>) => void;
  removerVacinacao: (id: string) => void;
  limparTudo: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useVacinacaoStore = create<VacinacaoStore>((set) => ({
  vacinacoes: [],
  currentVacinacao: null,
  total: 0,
  page: 1,
  limit: 10,
  pages: 0,
  isLoading: false,
  error: null,
  filtros: {},

  setVacinacoes: (vacinacoes) => set({ vacinacoes }),
  setCurrentVacinacao: (vacinacao) => set({ currentVacinacao: vacinacao }),
  setPage: (page) => set({ page }),
  setFiltros: (filtros) => set({ filtros }),
  clearFiltros: () => set({ filtros: {}, page: 1 }),
  setPaginacao: (page, limit, total, pages) => set({ page, limit, total, pages }),

  adicionarVacinacao: (vacinacao) =>
    set((state) => ({
      vacinacoes: [vacinacao, ...state.vacinacoes],
      total: state.total + 1,
    })),

  atualizarVacinacao: (id, vacinacao) =>
    set((state) => ({
      vacinacoes: state.vacinacoes.map((v) => (v._id === id ? { ...v, ...vacinacao } : v)),
      currentVacinacao: state.currentVacinacao?._id === id ? { ...state.currentVacinacao, ...vacinacao } : state.currentVacinacao,
    })),

  removerVacinacao: (id) =>
    set((state) => ({
      vacinacoes: state.vacinacoes.filter((v) => v._id !== id),
      total: state.total - 1,
    })),

  limparTudo: () =>
    set({
      vacinacoes: [],
      currentVacinacao: null,
      total: 0,
      page: 1,
      filtros: {},
      error: null,
    }),

  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
