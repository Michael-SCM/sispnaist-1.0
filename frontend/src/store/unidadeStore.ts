import { create } from 'zustand';
import unidadeService from '../services/unidadeService';
import { IUnidade } from '../types';

interface UnidadeState {
  unidades: IUnidade[];
  unidadeAtual: IUnidade | null;
  loading: boolean;
  error: string | null;
  total: number;
  pages: number;
  
  fetchUnidades: (page?: number, limit?: number, filtros?: any) => Promise<void>;
  fetchUnidade: (id: string) => Promise<void>;
  fetchUnidadesPorEmpresa: (empresaId: string) => Promise<void>;
  createUnidade: (data: Partial<IUnidade>) => Promise<void>;
  updateUnidade: (id: string, data: Partial<IUnidade>) => Promise<void>;
  deleteUnidade: (id: string) => Promise<void>;
  limparErro: () => void;
}

export const useUnidadeStore = create<UnidadeState>((set) => ({
  unidades: [],
  unidadeAtual: null,
  loading: false,
  error: null,
  total: 0,
  pages: 0,

  fetchUnidades: async (page = 1, limit = 10, filtros = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await unidadeService.listar(page, limit, filtros);
      set({ 
        unidades: data.unidades, 
        total: data.total, 
        pages: data.pages, 
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao carregar unidades', 
        loading: false 
      });
    }
  },

  fetchUnidade: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await unidadeService.obter(id);
      set({ unidadeAtual: data.data.unidade, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao carregar unidade', 
        loading: false 
      });
    }
  },

  fetchUnidadesPorEmpresa: async (empresaId) => {
    set({ loading: true, error: null });
    try {
      const data = await unidadeService.listarPorEmpresa(empresaId);
      set({ unidades: data.data.unidades, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao carregar unidades da empresa', 
        loading: false 
      });
    }
  },

  createUnidade: async (data) => {
    set({ loading: true, error: null });
    try {
      await unidadeService.criar(data);
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao criar unidade', 
        loading: false 
      });
      throw error;
    }
  },

  updateUnidade: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await unidadeService.atualizar(id, data);
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao atualizar unidade', 
        loading: false 
      });
      throw error;
    }
  },

  deleteUnidade: async (id) => {
    set({ loading: true, error: null });
    try {
      await unidadeService.deletar(id);
      set((state) => ({ 
        unidades: state.unidades.filter((u) => u._id !== id),
        loading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao deletar unidade', 
        loading: false 
      });
    }
  },

  limparErro: () => set({ error: null }),
}));
