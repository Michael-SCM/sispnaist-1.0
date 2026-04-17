import api from './api.js';
import { IUnidade } from '../types/index.js';

const unidadeService = {
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const params = { page, limit, ...filtros };
    const response = await api.get('/unidades', { params });
    return response.data;
  },

  listarAtivas: async () => {
    const response = await api.get('/unidades/ativas');
    return response.data;
  },

  obter: async (id: string) => {
    const response = await api.get(`/unidades/${id}`);
    return response.data;
  },

  criar: async (data: Partial<IUnidade>) => {
    const response = await api.post('/unidades', data);
    return response.data;
  },

  atualizar: async (id: string, data: Partial<IUnidade>) => {
    const response = await api.put(`/unidades/${id}`, data);
    return response.data;
  },

  deletar: async (id: string) => {
    const response = await api.delete(`/unidades/${id}`);
    return response.data;
  },

  listarPorEmpresa: async (empresaId: string) => {
    const response = await api.get(`/unidades/empresa/${empresaId}`);
    return response.data;
  },
};

export default unidadeService;
