import api from './api.js';
import { ITrabalhador } from '../types/index.js';

export const trabalhadorService = {
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filtros,
    });
    const response = await api.get(`/trabalhadores?${params.toString()}`);
    return response.data;
  },

  obterPorId: async (id: string) => {
    const response = await api.get(`/trabalhadores/${id}`);
    return response.data.data.trabalhador;
  },

  buscarPorCpf: async (cpf: string) => {
    const response = await api.get(`/trabalhadores?cpf=${cpf}`);
    if (response.data.trabalhadores && response.data.trabalhadores.length > 0) {
      return response.data.trabalhadores[0];
    }
    return null;
  },

  criar: async (trabalhador: Partial<ITrabalhador>) => {
    const response = await api.post('/trabalhadores', trabalhador);
    return response.data.data.trabalhador;
  },

  atualizar: async (id: string, trabalhador: Partial<ITrabalhador>) => {
    const response = await api.put(`/trabalhadores/${id}`, trabalhador);
    return response.data.data.trabalhador;
  },

  deletar: async (id: string) => {
    const response = await api.delete(`/trabalhadores/${id}`);
    return response.data;
  },
};
