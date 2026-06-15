import api from './api.js';

export interface IAnexo {
  id: string;
  nome: string;
}

export interface IExame {
  realizados: string;
  resultados: string;
  periodicidade: string;
  anexos: IAnexo[];
}

export interface ITrabalhadorInformacao {
  _id?: string;
  trabalhadorId: string;
  doencaBase: string;
  estadoVacinal: string;
  tipoDroga: string;
  tipoSanguineo: string;
  medicamentos: string;
  doadorSangue: boolean;
  doadorOrgaos: boolean;
  doencaPreexistente: boolean;
  descricaoDoencaPreexistente: string;
  historicoFamiliar: boolean;
  descricaoHistoricoFamiliar: string;
  teveCovid: boolean;
  ultimoContagio: string;
  teveSequela: boolean;
  descricaoSequela: string;
  foiInternado: boolean;
  diasInternacao: number;
  foiIntubado: boolean;
  allergy: boolean;
  descricaoAlergia: string;
  acompanhamentoMedico: boolean;
  acompanhamentoMedicoMotivo: string;
  acompanhamentoReabilitacao: boolean;
  usoAlcool: boolean;
  dosesAlcool: number;
  usoCigarro: boolean;
  macosCigarro: number;
  usoOutraDroga: boolean;
  outraDrogaDescricao: string;
  frequenciaUso: string;
  gestante: boolean;
  dataUltimaMenstruacao: string;
  semanasGestacao: number;
  dataPartoPrevista: string;
  preNatal: boolean;
  lactante: boolean;
  complicacoesGestacao: string;
  limitacao: boolean;
  tipoLimitacao: string;
  descricaoLimitacao: string;
  causaLimitacao: string;
  parteCorpoAtingida: string;
  necessitaAdaptacao: boolean;
  descricaoAdaptacao: string;
  readaptacaoProfissional: boolean;
  descricaoReadaptacao: string;
  exames: IExame[];
  observacoes: string;
  ativo: boolean;
}

export const informacaoService = {
  listarPorTrabalhador: async (trabalhadorId: string): Promise<ITrabalhadorInformacao[]> => {
    const response = await api.get<ITrabalhadorInformacao[]>(
      `/trabalhadores/${trabalhadorId}/informacoes`
    );
    return response.data;
  },

  obterPorId: async (trabalhadorId: string, infoId: string): Promise<ITrabalhadorInformacao> => {
    const response = await api.get<ITrabalhadorInformacao>(
      `/trabalhadores/${trabalhadorId}/informacoes/${infoId}`
    );
    return response.data;
  },

  criar: async (trabalhadorId: string, data: Partial<ITrabalhadorInformacao>): Promise<ITrabalhadorInformacao> => {
    const response = await api.post<ITrabalhadorInformacao>(
      `/trabalhadores/${trabalhadorId}/informacoes`,
      data
    );
    return response.data;
  },

  atualizar: async (
    trabalhadorId: string,
    infoId: string,
    data: Partial<ITrabalhadorInformacao>
  ): Promise<ITrabalhadorInformacao> => {
    const response = await api.put<ITrabalhadorInformacao>(
      `/trabalhadores/${trabalhadorId}/informacoes/${infoId}`,
      data
    );
    return response.data;
  },

  deletar: async (trabalhadorId: string, infoId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/informacoes/${infoId}`);
  },
};
