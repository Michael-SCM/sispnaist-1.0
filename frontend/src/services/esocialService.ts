import api from './api.js';

export interface EsocialS2210 {
  id: string;
  dataAcidente: string;
  horaAcidente?: string;
  tipoAcidente: string;
  descricao: string;
  parteAtingida?: string;
  agenteCausador?: string;
  cid?: string;
  afastamento: boolean;
  diasAfastamento?: number;
  catEmitida: boolean;
  catNumero?: string;
  catDataEmissao?: string;
  catTipo?: string;
  emitenteCat?: string;
  houveObito: boolean;
  localAcidente?: string;
}

export interface EsocialS2220 {
  id: string;
  tipoExame: string;
  dataExame: string;
  dataValidade?: string;
  medicoNome: string;
  medicoCRM: string;
  medicoUFCrm?: string;
  resultado: string;
  observacaoMedica?: string;
  examesRealizados?: string[];
  riscosOcupacionais?: string[];
  medicoPcmsmoNome?: string;
  medicoPcmsmoCrm?: string;
}

export interface EsocialS2240 {
  id: string;
  dataInicioExposicao?: string;
  dataFimExposicao?: string | null;
  fatorRisco: string;
  agente: string;
  intensidade?: string;
  limiteTolerancia?: string;
  tecnicaMedicao?: string;
  resultadoMedicao?: string;
  frequenciaExposicao?: string;
  duracaoExposicao?: string;
  epcUtilizado: boolean;
  epcDescricao?: string;
  epcEficaz?: boolean | string;
  epiUtilizado: boolean;
  epiDescricao?: string;
  caEpi?: string | null;
  epiEficaz?: boolean;
  medidasAdministrativas?: string;
}

export interface DadosEsocial {
  cpf: string;
  cns?: string;
  nome: string;
  eventos: {
    s2210: EsocialS2210[];
    s2220: EsocialS2220[];
    s2240: EsocialS2240[];
  };
}

export const esocialService = {
  buscarPorCpf: async (cpf: string): Promise<DadosEsocial> => {
    const response = await api.get(`/integracao/esocial/${encodeURIComponent(cpf)}`);
    return response.data.data;
  },
};
