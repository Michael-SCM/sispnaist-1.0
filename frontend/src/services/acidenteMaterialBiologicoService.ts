import api from './api.js';
import { IAcidenteMaterialBiologico, ISorologiaPaciente, ISorologiaAcidentado } from '../types/index.js';

const BASE_URL = '/acidente-material-biologico';

export const acidenteMaterialBiologicoService = {
  // Acidente Material Biológico CRUD
  listar: (filtros?: { trabalhadorId?: string; acidenteId?: string }) => 
    api.get(BASE_URL, { params: filtros }),

  obter: (id: string) => 
    api.get(`${BASE_URL}/${id}`),

  criar: (data: Partial<IAcidenteMaterialBiologico>) => 
    api.post(BASE_URL, data),

  atualizar: (id: string, data: Partial<IAcidenteMaterialBiologico>) => 
    api.put(`${BASE_URL}/${id}`, data),

  deletar: (id: string) => 
    api.delete(`${BASE_URL}/${id}`),

  // Por trabalhador (conveniência)
  listarPorTrabalhador: (trabalhadorId: string) => 
    api.get(BASE_URL, { params: { trabalhadorId } }),

  // Sorologia Paciente
  criarSorologiaPaciente: (data: Partial<ISorologiaPaciente>) => 
    api.post(`${BASE_URL}/sorologia-paciente`, data),

  obterSorologiaPaciente: (id: string) => 
    api.get(`${BASE_URL}/sorologia-paciente/${id}`),

  // Sorologia Acidentado
  criarSorologiaAcidentado: (data: Partial<ISorologiaAcidentado>) => 
    api.post(`${BASE_URL}/sorologia-acidentado`, data),

  obterSorologiaAcidentado: (id: string) => 
    api.get(`${BASE_URL}/sorologia-acidentado/${id}`),
};

export default acidenteMaterialBiologicoService;

