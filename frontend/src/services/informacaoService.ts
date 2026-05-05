import api from './api.js';

export interface ITrabalhadorInformacao {
  _id?: string;
  trabalhadorId: string;
  doencaBase: string;
  estadoVacinal: string;
  tipoDroga: string;
  tipoSanguineo: string;
  medicamentos: string;
  allergy: boolean;
  descricaoAlergia: string;
  acompanhamentoMedico: boolean;
  acompanhamentoReabilitacao: boolean;
  usoAlcool: boolean;
  dosesAlcool: number;
  usoCigarro: boolean;
  macosCigarro: number;
  usoOutraDroga: boolean;
  frequenciaUso: string;
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
