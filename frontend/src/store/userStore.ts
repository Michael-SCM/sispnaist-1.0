import { create } from 'zustand';
import userService from '../services/userService';
import { IUser } from '../types';

interface UserState {
  usuarios: IUser[];
  usuarioAtual: IUser | null;
  loading: boolean;
  error: string | null;
  total: number;
  pages: number;
  
  fetchUsers: (page?: number, limit?: number, filtros?: any) => Promise<void>;
  fetchUser: (id: string) => Promise<void>;
  updateUser: (id: string, data: Partial<IUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  limparErro: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  usuarios: [],
  usuarioAtual: null,
  loading: false,
  error: null,
  total: 0,
  pages: 0,

  fetchUsers: async (page = 1, limit = 10, filtros = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await userService.listar(page, limit, filtros);
      set({ 
        usuarios: data.usuarios, 
        total: data.total, 
        pages: data.pages, 
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao carregar usuários', 
        loading: false 
      });
    }
  },

  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await userService.obter(id);
      set({ usuarioAtual: data.data.usuario, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao carregar usuário', 
        loading: false 
      });
    }
  },

  updateUser: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await userService.atualizar(id, data);
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao atualizar usuário', 
        loading: false 
      });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await userService.deletar(id);
      set((state) => ({ 
        usuarios: state.usuarios.filter((u) => u._id !== id),
        loading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao deletar usuário', 
        loading: false 
      });
    }
  },

  limparErro: () => set({ error: null }),
}));
