import api from './api.js';

export interface DadosCadsus {
  cartaoSus: string;
  cpf: string;
  nome: string;
  dataNascimento: string;
  nomeMae: string;
  sexo: string;
  raca: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  celular: string;
  email: string;
}

export const cadsusService = {
  buscarPorCpfOuCns: async (cpfOuCns: string): Promise<DadosCadsus> => {
    const response = await api.get(`/integracao/cadsus/${encodeURIComponent(cpfOuCns)}`);
    return response.data.data;
  },
};
