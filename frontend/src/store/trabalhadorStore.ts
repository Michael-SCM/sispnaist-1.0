import { create } from 'zustand';
import { ITrabalhador } from '../types';

interface TrabalhadorFilters {
  nome?: string;
  cpf?: string;
  matricula?: string;
  setor?: string;
}

interface TrabalhadorStore {
  // Estado
  trabalhadores: ITrabalhador[];
  currentTrabalhador: ITrabalhador | null;
  total: number;
  page: number;
  limit: number;
  pages: number;
  isLoading: boolean;
  error: string | null;
  filtros: TrabalhadorFilters;

  // Actions
  setTrabalhadores: (trabalhadores: ITrabalhador[]) => void;
  setCurrentTrabalhador: (trabalhador: ITrabalhador | null) => void;
  setPage: (page: number) => void;
  setFiltros: (filtros: TrabalhadorFilters) => void;
  clearFiltros: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // CRUD actions
  adicionarTrabalhador: (trabalhador: ITrabalhador) => void;
  atualizarTrabalhador: (id: string, trabalhador: Partial<ITrabalhador>) => void;
  removerTrabalhador: (id: string) => void;
  
  // Paginação
  setPaginacao: (data: { total: number; pages: number; page: number; limit: number }) => void;
  
  // Limpar estado
  limparTudo: () => void;
}

const initialState = {
  trabalhadores: [],
  currentTrabalhador: null,
  total: 0,
  page: 1,
  limit: 10,
  pages: 1,
  isLoading: false,
  error: null,
  filtros: {},
};

export const useTrabalhadorStore = create<TrabalhadorStore>((set) => ({
  ...initialState,

  setTrabalhadores: (trabalhadores) => set({ trabalhadores }),

  setCurrentTrabalhador: (trabalhador) => set({ currentTrabalhador: trabalhador }),

  setPage: (page) => set({ page }),

  setFiltros: (filtros) => set({ filtros, page: 1 }),

  clearFiltros: () => set({ filtros: {}, page: 1 }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  adicionarTrabalhador: (trabalhador) =>
    set((state) => ({
      trabalhadores: [trabalhador, ...state.trabalhadores],
      total: state.total + 1,
    })),

  atualizarTrabalhador: (id, trabalhadorAtualizado) =>
    set((state) => ({
      trabalhadores: state.trabalhadores.map((t) =>
        t._id === id ? { ...t, ...trabalhadorAtualizado } : t
      ),
      currentTrabalhador:
        state.currentTrabalhador?._id === id
          ? { ...state.currentTrabalhador, ...trabalhadorAtualizado }
          : state.currentTrabalhador,
    })),

  removerTrabalhador: (id) =>
    set((state) => ({
      trabalhadores: state.trabalhadores.filter((t) => t._id !== id),
      total: state.total - 1,
      currentTrabalhador: state.currentTrabalhador?._id === id ? null : state.currentTrabalhador,
    })),

  setPaginacao: (data) =>
    set({
      total: data.total,
      pages: data.pages,
      page: data.page,
      limit: data.limit,
    }),

  limparTudo: () => set(initialState),
}));
