import { create } from 'zustand';
import { IMaterialBiologico } from '../types/index.js';

interface MaterialBiologicoFilters {
  tipoExposicao?: string;
  agente?: string;
}

interface MaterialBiologicoStore {
  fichas: IMaterialBiologico[];
  currentFicha: IMaterialBiologico | null;
  total: number;
  page: number;
  limit: number;
  pages: number;
  isLoading: boolean;
  error: string | null;
  filtros: MaterialBiologicoFilters;

  setFichas: (fichas: IMaterialBiologico[]) => void;
  setCurrentFicha: (ficha: IMaterialBiologico | null) => void;
  setPage: (page: number) => void;
  setFiltros: (filtros: MaterialBiologicoFilters) => void;
  clearFiltros: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  setPaginacao: (data: { total: number; pages: number; page: number; limit: number }) => void;
  limparTudo: () => void;
}

const initialState = {
  fichas: [],
  currentFicha: null,
  total: 0,
  page: 1,
  limit: 10,
  pages: 1,
  isLoading: false,
  error: null,
  filtros: {},
};

export const useMaterialBiologicoStore = create<MaterialBiologicoStore>((set) => ({
  ...initialState,

  setFichas: (fichas) => set({ fichas }),
  setCurrentFicha: (ficha) => set({ currentFicha: ficha }),
  setPage: (page) => set({ page }),
  setFiltros: (filtros) => set({ filtros, page: 1 }),
  clearFiltros: () => set({ filtros: {}, page: 1 }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  setPaginacao: (data) =>
    set({
      total: data.total,
      pages: data.pages,
      page: data.page,
      limit: data.limit,
    }),

  limparTudo: () => set(initialState),
}));
