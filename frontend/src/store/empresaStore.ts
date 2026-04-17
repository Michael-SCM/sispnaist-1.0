import { create } from 'zustand';
import empresaService from '../services/empresaService.js';
import { IEmpresa } from '../types/index.js';

interface EmpresaState {
  empresas: IEmpresa[];
  empresaAtual: IEmpresa | null;
  loading: boolean;
  error: string | null;
  total: number;
  pages: number;
  
  fetchEmpresas: (page?: number, limit?: number, filtros?: any) => Promise<void>;
  fetchEmpresa: (id: string) => Promise<void>;
  createEmpresa: (data: Partial<IEmpresa>) => Promise<void>;
  updateEmpresa: (id: string, data: Partial<IEmpresa>) => Promise<void>;
  deleteEmpresa: (id: string) => Promise<void>;
  limparErro: () => void;
}

export const useEmpresaStore = create<EmpresaState>((set) => ({
  empresas: [],
  empresaAtual: null,
  loading: false,
  error: null,
  total: 0,
  pages: 0,

  fetchEmpresas: async (page = 1, limit = 10, filtros = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await empresaService.listar(page, limit, filtros);
      set({ 
        empresas: data.empresas, 
        total: data.total, 
        pages: data.pages, 
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao carregar empresas', 
        loading: false 
      });
    }
  },

  fetchEmpresa: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await empresaService.obter(id);
      set({ empresaAtual: data.data.empresa, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao carregar empresa', 
        loading: false 
      });
    }
  },

  createEmpresa: async (data) => {
    set({ loading: true, error: null });
    try {
      await empresaService.criar(data);
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao criar empresa', 
        loading: false 
      });
      throw error;
    }
  },

  updateEmpresa: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await empresaService.atualizar(id, data);
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao atualizar empresa', 
        loading: false 
      });
      throw error;
    }
  },

  deleteEmpresa: async (id) => {
    set({ loading: true, error: null });
    try {
      await empresaService.deletar(id);
      set((state) => ({ 
        empresas: state.empresas.filter((e) => e._id !== id),
        loading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao deletar empresa', 
        loading: false 
      });
    }
  },

  limparErro: () => set({ error: null }),
}));
