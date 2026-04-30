import api from './api';

export interface AtoMunicipalInovacao {
  _id?: string;
  nr_ato: string;
  ano_ato: number;
  link_ato_legal?: string;
  nm_cidade: string;
  nm_estado: string;
  nm_tipo?: string;
  nm_subtipo?: string;
  nm_categoria?: string;
  nm_classe_categoria?: string;
  texto_legal?: string;
  texto_ementa?: string;
  papeisModoGovernanca?: string[];
  ativo: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ListarAtosParams {
  page?: number;
  limit?: number;
  cidade?: string;
  ano?: number;
}

export interface ListarAtosResponse {
  items: AtoMunicipalInovacao[];
  total: number;
  page: number;
  pages: number;
}

const atosService = {
  listar: async (params: ListarAtosParams): Promise<ListarAtosResponse> => {
    const response = await api.get('/atos-municipais', { params });
    return response.data;
  },

  obter: async (id: string): Promise<AtoMunicipalInovacao> => {
    const response = await api.get(`/atos-municipais/${id}`);
    return response.data;
  },

  criar: async (dados: Partial<AtoMunicipalInovacao>): Promise<AtoMunicipalInovacao> => {
    const response = await api.post('/atos-municipais', dados);
    return response.data;
  },

  atualizar: async (id: string, dados: Partial<AtoMunicipalInovacao>): Promise<AtoMunicipalInovacao> => {
    const response = await api.put(`/atos-municipais/${id}`, dados);
    return response.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/atos-municipais/${id}`);
  }
};

export default atosService;
