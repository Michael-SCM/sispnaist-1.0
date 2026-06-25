import api from './api.js';
import { IEmpresa } from '../types/index.js';

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data as T;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

const empresaService = {
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const params = { page, limit, ...filtros };
    const response = await api.get('/empresas', { params });
    return response.data;
  },

  listarAtivas: async () => {
    const cached = getCached<any>('empresas-ativas');
    if (cached) return cached;
    const response = await api.get('/empresas/ativas');
    setCache('empresas-ativas', response.data);
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

  obterPorUnidade: async (unidadeId: string) => {
    const response = await api.get(`/empresas/unidade/${unidadeId}`);
    return response.data;
  },
};

export default empresaService;
