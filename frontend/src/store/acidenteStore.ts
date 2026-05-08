import { create } from 'zustand';
import { IAcidente } from '../types/index.js';

interface AcidenteFilters {
  tipoAcidente?: string;
  status?: string;
  trabalhadorId?: string;
  dataInicio?: string;
  dataFim?: string;
  descricao?: string;
}

interface AcidenteStore {
  // Estado
  acidentes: IAcidente[];
  currentAcidente: IAcidente | null;
  total: number;
  page: number;
  limit: number;
  pages: number;
  isLoading: boolean;
  error: string | null;
  filtros: AcidenteFilters;

  // Actions
  setAcidentes: (acidentes: IAcidente[]) => void;
  setCurrentAcidente: (acidente: IAcidente | null) => void;
  setPage: (page: number) => void;
  setFiltros: (filtros: AcidenteFilters) => void;
  clearFiltros: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // CRUD actions
  adicionarAcidente: (acidente: IAcidente) => void;
  atualizarAcidente: (id: string, acidente: Partial<IAcidente>) => void;
  removerAcidente: (id: string) => void;
  
  // Paginação
  setPaginacao: (data: { total: number; pages: number; page: number; limit: number }) => void;
  
  // Limpar estado
  limparTudo: () => void;
}

const initialState = {
  acidentes: [],
  currentAcidente: null,
  total: 0,
  page: 1,
  limit: 10,
  pages: 1,
  isLoading: false,
  error: null,
  filtros: {},
};

export const useAcidenteStore = create<AcidenteStore>((set) => ({
  ...initialState,

  setAcidentes: (acidentes) => set({ acidentes }),

  setCurrentAcidente: (acidente) => set({ currentAcidente: acidente }),

  setPage: (page) => set({ page }),

  setFiltros: (filtros) => set({ filtros, page: 1 }),

  clearFiltros: () => set({ filtros: {}, page: 1 }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  adicionarAcidente: (acidente) =>
    set((state) => ({
      acidentes: [acidente, ...state.acidentes],
      total: state.total + 1,
    })),

  atualizarAcidente: (id, acidenteAtualizado) =>
    set((state) => ({
      acidentes: state.acidentes.map((a) =>
        a._id === id ? { ...a, ...acidenteAtualizado } : a
      ),
      currentAcidente:
        state.currentAcidente?._id === id
          ? { ...state.currentAcidente, ...acidenteAtualizado }
          : state.currentAcidente,
    })),

  removerAcidente: (id) =>
    set((state) => ({
      acidentes: state.acidentes.filter((a) => a._id !== id),
      total: state.total - 1,
      currentAcidente: state.currentAcidente?._id === id ? null : state.currentAcidente,
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
