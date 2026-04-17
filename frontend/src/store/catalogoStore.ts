import { create } from 'zustand';
import { ICatalogoItem } from '../types/index.js';

interface CatalogoFilters {
  ativo?: boolean;
}

interface CatalogoStore {
  // Estado
  itens: ICatalogoItem[];
  currentItem: ICatalogoItem | null;
  total: number;
  page: number;
  limit: number;
  pages: number;
  isLoading: boolean;
  error: string | null;
  filtros: CatalogoFilters;
  entidadeAtual: string | null;

  // Actions
  setItens: (itens: ICatalogoItem[]) => void;
  setCurrentItem: (item: ICatalogoItem | null) => void;
  setPage: (page: number) => void;
  setFiltros: (filtros: CatalogoFilters) => void;
  clearFiltros: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setEntidadeAtual: (entidade: string | null) => void;

  // CRUD actions
  adicionarItem: (item: ICatalogoItem) => void;
  atualizarItem: (id: string, item: Partial<ICatalogoItem>) => void;
  removerItem: (id: string) => void;

  // Paginação
  setPaginacao: (data: { total: number; pages: number; page: number; limit: number }) => void;

  // Limpar
  limparTudo: () => void;
}

const initialState = {
  itens: [],
  currentItem: null,
  total: 0,
  page: 1,
  limit: 100,
  pages: 1,
  isLoading: false,
  error: null,
  filtros: {},
  entidadeAtual: null,
};

export const useCatalogoStore = create<CatalogoStore>((set) => ({
  ...initialState,

  setItens: (itens) => set({ itens }),
  setCurrentItem: (item) => set({ currentItem: item }),
  setPage: (page) => set({ page }),
  setFiltros: (filtros) => set({ filtros, page: 1 }),
  clearFiltros: () => set({ filtros: {}, page: 1 }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setEntidadeAtual: (entidade) => set({ entidadeAtual: entidade }),

  adicionarItem: (item) =>
    set((state) => ({
      itens: [item, ...state.itens],
      total: state.total + 1,
    })),

  atualizarItem: (id, itemAtualizado) =>
    set((state) => ({
      itens: state.itens.map((i) =>
        i._id === id ? { ...i, ...itemAtualizado } : i
      ),
      currentItem:
        state.currentItem?._id === id
          ? { ...state.currentItem, ...itemAtualizado }
          : state.currentItem,
    })),

  removerItem: (id) =>
    set((state) => ({
      itens: state.itens.filter((i) => i._id !== id),
      total: state.total - 1,
      currentItem: state.currentItem?._id === id ? null : state.currentItem,
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
