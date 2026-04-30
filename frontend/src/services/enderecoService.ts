import api from './api';

export interface Bairro {
  id_pk_bairro: string;
  nm_bairro: string;
}

export interface Logradouro {
  id_pk_logradouro: string;
  nm_logradouro: string;
  nm_tipo_logradouro: string;
  nm_bairro: string;
}

export interface CEPData {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

const enderecoService = {
  buscarBairros: async (pesquisa: string): Promise<Bairro[]> => {
    const response = await api.get('/enderecos/bairros', { params: { pesquisa } });
    return response.data;
  },

  buscarLogradouros: async (params: { bairroId?: string; nomeBairro?: string; pesquisa?: string }): Promise<Logradouro[]> => {
    const response = await api.get('/enderecos/logradouros', { params });
    return response.data;
  },

  buscarCEP: async (cep: string): Promise<CEPData> => {
    const response = await api.get(`/enderecos/cep/${cep}`);
    return response.data;
  }
};

export default enderecoService;
