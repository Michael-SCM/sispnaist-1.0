import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { IAcidenteMaterialBiologico } from '../types/index.js';
import acidenteMaterialBiologicoService from '../services/acidenteMaterialBiologicoService.js';

interface AcidenteMaterialBiologicoState {
  registros: IAcidenteMaterialBiologico[];
  carregando: boolean;
  total: number;
  page: number;
  limit: number;
  erro: string | null;
  atual: IAcidenteMaterialBiologico | null;

  // Actions
  listar: (page?: number, limit?: number, filtros?: any) => Promise<void>;
  obter: (id: string) => Promise<void>;
  obterPorAcidente: (acidenteId: string) => Promise<void>;
  criar: (data: Partial<IAcidenteMaterialBiologico>) => Promise<IAcidenteMaterialBiologico | null>;
  atualizar: (id: string, data: Partial<IAcidenteMaterialBiologico>) => Promise<IAcidenteMaterialBiologico | null>;
  deletar: (id: string) => Promise<void>;
  limparErro: () => void;
  reset: () => void;
}

export const useAcidenteMaterialBiologicoStore = create<AcidenteMaterialBiologicoState>()(
  devtools(
    (set, get) => ({
      registros: [],
      carregando: false,
      total: 0,
      page: 1,
      limit: 10,
      erro: null,
      atual: null,

      listar: async (page = 1, limit = 10, filtros = {}) => {
        set({ carregando: true, erro: null });
        try {
          const response = await acidenteMaterialBiologicoService.listar(page, limit, filtros);
          set({
            registros: response.data.registros || response.data.data || [],
            total: response.data.total || 0,
            page,
            limit,
          });
        } catch (error: any) {
          set({ erro: error.message || 'Erro ao listar registros' });
        } finally {
          set({ carregando: false });
        }
      },

      obter: async (id: string) => {
        set({ carregando: true, erro: null });
        try {
          const response = await acidenteMaterialBiologicoService.obter(id);
          set({ atual: response.data });
        } catch (error: any) {
          set({ erro: error.message || 'Erro ao obter registro' });
        } finally {
          set({ carregando: false });
        }
      },

      obterPorAcidente: async (acidenteId: string) => {
        set({ carregando: true, erro: null });
        try {
          const response = await acidenteMaterialBiologicoService.obterPorAcidente(acidenteId);
          set({ atual: response.data });
        } catch (error: any) {
          set({ erro: error.message || 'Erro ao obter por acidente' });
          set({ atual: null });
        } finally {
          set({ carregando: false });
        }
      },

      criar: async (data) => {
        set({ carregando: true, erro: null });
        try {
          const response = await acidenteMaterialBiologicoService.criar(data);
          await get().listar(get().page, get().limit);
          return response.data;
        } catch (error: any) {
          set({ erro: error.message || 'Erro ao criar registro' });
          return null;
        } finally {
          set({ carregando: false });
        }
      },

      atualizar: async (id, data) => {
        set({ carregando: true, erro: null });
        try {
          const response = await acidenteMaterialBiologicoService.atualizar(id, data);
          set({ atual: response.data });
          await get().listar(get().page, get().limit);
          return response.data;
        } catch (error: any) {
          set({ erro: error.message || 'Erro ao atualizar registro' });
          return null;
        } finally {
          set({ carregando: false });
        }
      },

      deletar: async (id: string) => {
        if (!confirm('Confirmar exclusão do registro?')) return;
        set({ carregando: true, erro: null });
        try {
          await acidenteMaterialBiologicoService.deletar(id);
          await get().listar(get().page, get().limit);
        } catch (error: any) {
          set({ erro: error.message || 'Erro ao deletar registro' });
        } finally {
          set({ carregando: false });
        }
      },

      limparErro: () => set({ erro: null }),
      reset: () => set({ 
        registros: [], 
        carregando: false, 
        total: 0, 
        page: 1, 
        limit: 10, 
        erro: null, 
        atual: null 
      }),
    }),
    { name: 'AcidenteMaterialBiologicoStore' }
  )
);

export default useAcidenteMaterialBiologicoStore;

