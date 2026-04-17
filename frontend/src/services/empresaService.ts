import api from './api.js';
import { IEmpresa } from '../types/index.js';

const empresaService = {
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const params = { page, limit, ...filtros };
    const response = await api.get('/empresas', { params });
    return response.data;
  },

  listarAtivas: async () => {
    const response = await api.get('/empresas/ativas');
    return response.data;
  },

  obter: async (id: string) => {
    const response = await api.get(`/empresas/${id}`);
    return response.data;
  },

  criar: async (data: Partial<IEmpresa>) => {
    const response = await api.post('/empresas', data);
    return response.data;
  },

  atualizar: async (id: string, data: Partial<IEmpresa>) => {
    const response = await api.put(`/empresas/${id}`, data);
    return response.data;
  },

  deletar: async (id: string) => {
    const response = await api.delete(`/empresas/${id}`);
    return response.data;
  },
};

export default empresaService;
