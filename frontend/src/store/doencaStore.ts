import { create } from 'zustand';
import { IDoenca } from '../types';

interface DoencaFilters {
  nomeDoenca?: string;
  ativo?: boolean;
  dataInicio?: string;
  dataFim?: string;
  trabalhadorId?: string;
}

interface DoencaStore {
  doencas: IDoenca[];
  currentDoenca: IDoenca | null;
  total: number;
  page: number;
  limit: number;
  pages: number;
  isLoading: boolean;
  error: string | null;
  filtros: DoencaFilters;

  // Setters
  setDoencas: (doencas: IDoenca[]) => void;
  setCurrentDoenca: (doenca: IDoenca | null) => void;
  setPage: (page: number) => void;
  setFiltros: (filtros: DoencaFilters) => void;
  clearFiltros: () => void;
  setPaginacao: (page: number, limit: number, total: number, pages: number) => void;

  // Actions
  adicionarDoenca: (doenca: IDoenca) => void;
  atualizarDoenca: (id: string, doenca: Partial<IDoenca>) => void;
  removerDoenca: (id: string) => void;
  limparTudo: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDoencaStore = create<DoencaStore>((set) => ({
  doencas: [],
  currentDoenca: null,
  total: 0,
  page: 1,
  limit: 10,
  pages: 0,
  isLoading: false,
  error: null,
  filtros: {},

  setDoencas: (doencas) => set({ doencas }),
  setCurrentDoenca: (doenca) => set({ currentDoenca: doenca }),
  setPage: (page) => set({ page }),
  setFiltros: (filtros) => set({ filtros }),
  clearFiltros: () => set({ filtros: {}, page: 1 }),
  setPaginacao: (page, limit, total, pages) => set({ page, limit, total, pages }),

  adicionarDoenca: (doenca) =>
    set((state) => ({
      doencas: [doenca, ...state.doencas],
      total: state.total + 1,
    })),

  atualizarDoenca: (id, doenca) =>
    set((state) => ({
      doencas: state.doencas.map((d) => (d._id === id ? { ...d, ...doenca } : d)),
      currentDoenca: state.currentDoenca?._id === id ? { ...state.currentDoenca, ...doenca } : state.currentDoenca,
    })),

  removerDoenca: (id) =>
    set((state) => ({
      doencas: state.doencas.filter((d) => d._id !== id),
      total: state.total - 1,
    })),

  limparTudo: () =>
    set({
      doencas: [],
      currentDoenca: null,
      total: 0,
      page: 1,
      filtros: {},
      error: null,
    }),

  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
