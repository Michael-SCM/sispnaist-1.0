import api from './api';

export type TipoAlerta = 'PICO_ACIDENTES' | 'VACINA_VENCENDO' | 'NAO_CONFORMIDADE' | 'MONITORAMENTO_CRITICO';
export type NivelAlerta = 'baixo' | 'medio' | 'alto';
export type StatusAlerta = 'ativa' | 'reagindo' | 'lida' | 'arquivada';

export interface IAlerta {
  _id: string;
  tipo: TipoAlerta;
  nivel: NivelAlerta;
  titulo: string;
  descricao: string;
  referencia?: {
    entidade: string;
    entidadeId: string;
  };
  empresaId?: string;
  unidadeId?: string;
  uf?: string;
  municipio?: string;
  status: StatusAlerta;
  dataAlerta: string;
  dataCriacao: string;
  dataAtualizacao: string;
  ultimoEmailEnviadoEm?: string;
}

export interface IAlertaListResponse {
  data: IAlerta[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAlertaResumo {
  totalAtivos: number;
  novos: number;
  alto: number;
}

export interface IAlertaRegra {
  _id: string;
  nome: string;
  tipo: TipoAlerta;
  nivel: NivelAlerta;
  condicao: {
    parametro: string;
    operador: string;
    valor: number;
  };
  janelaDias: number;
  periodoAnteriorDias: number;
  empresaId?: string;
  unidadeId?: string;
  ufs?: string[];
  municipios?: string[];
  notificarEmail: boolean;
  descricao?: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export const alertaService = {
  listar: async (params?: {
    page?: number;
    limit?: number;
    tipo?: TipoAlerta;
    status?: StatusAlerta;
    nivel?: NivelAlerta;
  }): Promise<IAlertaListResponse> => {
    const response = await api.get('/alertas', { params });
    return response.data;
  },

  obterResumo: async (): Promise<IAlertaResumo> => {
    const response = await api.get('/alertas/resumo');
    return response.data;
  },

  marcarLido: async (id: string): Promise<IAlerta> => {
    const response = await api.post(`/alertas/${id}/lido`);
    return response.data;
  },

  arquivar: async (id: string): Promise<IAlerta> => {
    const response = await api.post(`/alertas/${id}/arquivar`);
    return response.data;
  },

  executarAgora: async (): Promise<{ message: string }> => {
    const response = await api.post('/alertas/executar');
    return response.data;
  },

  listarRegras: async (): Promise<IAlertaRegra[]> => {
    const response = await api.get<{ data: IAlertaRegra[] }>('/alertas/regras');
    return response.data.data;
  },

  criarRegra: async (data: Partial<IAlertaRegra>): Promise<IAlertaRegra> => {
    const response = await api.post('/alertas/regras', data);
    return response.data;
  },

  atualizarRegra: async (id: string, data: Partial<IAlertaRegra>): Promise<IAlertaRegra> => {
    const response = await api.put(`/alertas/regras/${id}`, data);
    return response.data;
  },

  deletarRegra: async (id: string): Promise<IAlertaRegra> => {
    const response = await api.delete(`/alertas/regras/${id}`);
    return response.data;
  },
};

export default alertaService;
