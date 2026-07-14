import api from './api.js';

export interface DadosCnes {
  codigoCnes: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  tipoUnidade: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  telefone: string;
  email: string;
  naturezaJuridica: string;
  gestao: string;
  esferaAdministrativa: string;
  latitude: number;
  longitude: number;
  leitos: {
    total: number;
    sus: number;
    privado: number;
  };
  servicos: string[];
}

export const cnesService = {
  buscarPorCodigo: async (codigo: string): Promise<DadosCnes> => {
    const response = await api.get(`/integracao/cnes/${encodeURIComponent(codigo)}`);
    return response.data.data;
  },
};
