import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IAcidenteMaterialBiologico } from '../types/index.js';
import acidenteMaterialBiologicoService from '../services/acidenteMaterialBiologicoService.js';
import toast from 'react-hot-toast';

interface AcidenteMaterialBiologicoState {
  acidentes: IAcidenteMaterialBiologico[];
  carregando: boolean;
  erro: string | null;
  
  // Actions
  buscarTodos: (filtros?: any) => Promise<void>;
  buscarPorId: (id: string) => Promise<IAcidenteMaterialBiologico | null>;
  criar: (data: Partial<IAcidenteMaterialBiologico>) => Promise<IAcidenteMaterialBiologico | null>;
  atualizar: (id: string, data: Partial<IAcidenteMaterialBiologico>) => Promise<IAcidenteMaterialBiologico | null>;
  deletar: (id: string) => Promise<void>;
  limparErro: () => void;
  setCarregando: (carregando: boolean) => void;
}

export const useAcidenteMaterialBiologicoStore = create<AcidenteMaterialBiologicoState>()(
  persist(
    (set, get) => ({
      acidentes: [],
      carregando: false,
      erro: null,

      buscarTodos: async (filtros) => {
        const { setCarregando } = get();
        setCarregando(true);
        try {
          const response = await acidenteMaterialBiologicoService.listar(filtros);
          set({ acidentes: response.data || [], erro: null });
        } catch (error: any) {
          set({ erro: error.message });
          toast.error('Erro ao buscar acidentes biológicos');
        } finally {
          setCarregando(false);
        }
      },

      buscarPorId: async (id) => {
        try {
          const response = await acidenteMaterialBiologicoService.obter(id);
          return response.data;
        } catch (error: any) {
          toast.error('Erro ao buscar acidente biológico');
          return null;
        }
      },

      criar: async (data) => {
        const { setCarregando } = get();
        setCarregando(true);
        try {
          const response = await acidenteMaterialBiologicoService.criar(data);
          set((state) => ({
            acidentes: [...state.acidentes, response.data],
            erro: null
          }));
          toast.success('Acidente biológico criado com sucesso!');
          return response.data;
        } catch (error: any) {
          set({ erro: error.message });
          toast.error('Erro ao criar acidente biológico');
          return null;
        } finally {
          setCarregando(false);
        }
      },

      atualizar: async (id, data) => {
        const { setCarregando } = get();
        setCarregando(true);
        try {
          const response = await acidenteMaterialBiologicoService.atualizar(id, data);
          set((state) => ({
            acidentes: state.acidentes.map(acc => 
              acc._id === id ? response.data : acc
            ),
            erro: null
          }));
          toast.success('Acidente biológico atualizado!');
          return response.data;
        } catch (error: any) {
          set({ erro: error.message });
          toast.error('Erro ao atualizar');
          return null;
        } finally {
          setCarregando(false);
        }
      },

      deletar: async (id) => {
        const { setCarregando } = get();
        setCarregando(true);
        try {
          await acidenteMaterialBiologicoService.deletar(id);
          set((state) => ({
            acidentes: state.acidentes.filter(acc => acc._id !== id),
            erro: null
          }));
          toast.success('Acidente biológico removido!');
        } catch (error: any) {
          set({ erro: error.message });
          toast.error('Erro ao remover');
        } finally {
          setCarregando(false);
        }
      },

      limparErro: () => set({ erro: null }),
      setCarregando: (carregando) => set({ carregando }),
    }),
    {
      name: 'acidente-material-biologico-storage',
    }
  )
);

