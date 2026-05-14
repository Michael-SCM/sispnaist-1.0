import api from './api';
import { IUser } from '../types';

const userService = {
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const params = { page, limit, ...filtros };
    const response = await api.get('/usuarios', { params });
    return response.data;
  },

  obter: async (id: string) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  atualizar: async (id: string, data: Partial<IUser>) => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  deletar: async (id: string) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },
};

export default userService;
