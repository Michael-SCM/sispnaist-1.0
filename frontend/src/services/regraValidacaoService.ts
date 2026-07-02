import api from './api';

export interface IRegraValidacao {
  _id: string;
  nome: string;
  descricao?: string;
  entidade: 'trabalhador' | 'acidente' | 'doenca' | 'vacinacao' | 'empresa' | 'unidade';
  campo: string;
  tipoLocalidade: 'nacional' | 'uf' | 'municipio';
  ufs: string[];
  municipios: string[];
  tipoValidacao: 'obrigatorio' | 'regex' | 'min' | 'max' | 'enum' | 'lengthMin' | 'lengthMax' | 'personalizado';
  valorValidacao: string;
  mensagemErro: string;
  prioridade: number;
  ativo: boolean;
  dataInicioVigencia: string;
  dataFimVigencia?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface IRegraValidacaoListResponse {
  data: IRegraValidacao[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IValidacaoResultado {
  valido: boolean;
  erros: { campo: string; mensagem: string; regra: string }[];
}

export interface IEntidadeOpcao {
  valor: string;
  rotulo: string;
}

export interface ICampoOpcao {
  valor: string;
  rotulo: string;
}

export const regraValidacaoService = {
  listar: async (params?: {
    page?: number;
    limit?: number;
    entidade?: string;
    campo?: string;
    uf?: string;
    ativo?: string;
  }): Promise<IRegraValidacaoListResponse> => {
    const response = await api.get('/regras-validacao', { params });
    return response.data;
  },

  obter: async (id: string): Promise<IRegraValidacao> => {
    const response = await api.get(`/regras-validacao/${id}`);
    return response.data;
  },

  criar: async (data: Partial<IRegraValidacao>): Promise<IRegraValidacao> => {
    const response = await api.post('/regras-validacao', data);
    return response.data;
  },

  atualizar: async (id: string, data: Partial<IRegraValidacao>): Promise<IRegraValidacao> => {
    const response = await api.put(`/regras-validacao/${id}`, data);
    return response.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/regras-validacao/${id}`);
  },

  listarEntidades: async (): Promise<IEntidadeOpcao[]> => {
    const response = await api.get('/regras-validacao/entidades');
    return response.data.data;
  },

  listarCampos: async (entidade: string): Promise<ICampoOpcao[]> => {
    const response = await api.get(`/regras-validacao/campos/${entidade}`);
    return response.data.data;
  },

  validar: async (entidade: string, dados: Record<string, any>, uf?: string, municipio?: string): Promise<IValidacaoResultado> => {
    const response = await api.post('/regras-validacao/validar', { entidade, dados, uf, municipio });
    return response.data;
  }
};
