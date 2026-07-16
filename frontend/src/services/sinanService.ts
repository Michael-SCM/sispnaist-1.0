import api from './api.js';

export interface NotificacaoSinan {
  numeroNotificacao: string;
  dataNotificacao: string;
  dataOcorrencia: string;
  codigoAgravo: string;
  nomeAgravo: string;
  tipoNotificacao: string;
  cboOcupacao: string;
  cnaeEmpresa: string;
  ufNotificacao: string;
  municipioNotificacao: string;
  unidadeSaude: string;
  evolucao: string;
  situacaoMercadoTrabalho: string;
  catRelacionada?: string;
  cnsPaciente: string;
  dataNascimento: string;
  sexo: string;
  racaCor: string;
  escolaridade: string;
  gestante: boolean;
  codigoMunicipioIbge: string;
}

export interface DadosSinan {
  cpf: string;
  cns: string;
  nome: string;
  notificacoes: NotificacaoSinan[];
}

export const sinanService = {
  buscarPorCpfOuCns: async (cpfOuCns: string): Promise<DadosSinan> => {
    const response = await api.get(`/integracao/sinan/${encodeURIComponent(cpfOuCns)}`);
    return response.data.data;
  },
};
