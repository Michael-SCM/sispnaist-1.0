import api from './api.js';
import { IUnidade } from '../types/index.js';

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

const unidadeService = {
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const params = { page, limit, ...filtros };
    const response = await api.get('/unidades', { params });
    return response.data;
  },

  listarAtivas: async () => {
    const cached = getCached<any>('unidades-ativas');
    if (cached) return cached;
    const response = await api.get('/unidades/ativas');
    setCache('unidades-ativas', response.data);
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
    const key = `unidades-empresa-${empresaId}`;
    const cached = getCached<any>(key);
    if (cached) return cached;
    const response = await api.get(`/unidades/empresa/${empresaId}`);
    setCache(key, response.data);
    return response.data;
  },
};

export default unidadeService;
