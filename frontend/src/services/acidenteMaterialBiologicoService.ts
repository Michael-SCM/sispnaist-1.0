import api from './api.js';
import type { IAcidenteMaterialBiologico } from '../types/index.js';

const BASE_URL = '/acidentes-material-biologico';

export const acidenteMaterialBiologicoService = {
  // Listar com paginação e filtros
  listar: (page = 1, limit = 10, filtros?: Partial<IAcidenteMaterialBiologico>) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filtros?.tipoExposicao) params.append('tipoExposicao', filtros.tipoExposicao);
    if (filtros?.agente) params.append('agente', filtros.agente);

    return api.get(`${BASE_URL}?${params}`);
  },

  // Obter por ID
  obter: (id: string) => api.get(`${BASE_URL}/${id}`),

  // Obter por acidente ID
  obterPorAcidente: (acidenteId: string) => api.get(`${BASE_URL}/acidente/${acidenteId}`),

  // Criar novo
  criar: (data: Partial<IAcidenteMaterialBiologico>) => api.post(BASE_URL, data),

  // Atualizar
  atualizar: (id: string, data: Partial<IAcidenteMaterialBiologico>) => 
    api.put(`${BASE_URL}/${id}`, data),

  // Deletar (soft delete)
  deletar: (id: string) => api.delete(`${BASE_URL}/${id}`),
};

export default acidenteMaterialBiologicoService;

