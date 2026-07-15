import axios from 'axios';
import config from '../config/config.js';

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

export interface EsocialEventos {
  s2210: EsocialS2210[];
  s2220: EsocialS2220[];
  s2240: EsocialS2240[];
}

export interface EsocialResponseData {
  cpf: string;
  cns?: string;
  nome: string;
  eventos: EsocialEventos;
}

interface EsocialApiResponse {
  status: string;
  data: EsocialResponseData;
}

export interface DadosEsocialAdaptado {
  cpf: string;
  cns?: string;
  nome: string;
  eventos: EsocialEventos;
}

function adapter(raw: EsocialResponseData): DadosEsocialAdaptado {
  return {
    cpf: raw.cpf,
    cns: raw.cns,
    nome: raw.nome,
    eventos: raw.eventos,
  };
}

export class EsocialService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.msEsocialApiUrl;
  }

  async buscarPorCpf(cpf: string): Promise<DadosEsocialAdaptado> {
    if (!this.baseUrl) {
      throw new Error('MS_ESOCIAL_API_URL não configurada');
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    if (!cpfLimpo || cpfLimpo.length !== 11) {
      throw new Error('CPF inválido');
    }

    try {
      const response = await axios.get<EsocialApiResponse>(
        `${this.baseUrl}/api/v1/esocial/eventos/${cpfLimpo}`,
        { timeout: 60000 }
      );

      const raw = response.data?.data;
      if (!raw) {
        throw new Error('Resposta inválida da API do e-Social');
      }

      return adapter(raw);
    } catch (error: any) {
      if (error.response?.status === 404) {
        const err = new Error('Trabalhador não encontrado na base do e-Social');
        (err as any).statusCode = 404;
        throw err;
      }

      if (error.code === 'ECONNABORTED') {
        const err = new Error('O e-Social está demorando para responder. Tente novamente.');
        (err as any).statusCode = 504;
        throw err;
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ERR_NETWORK') {
        const err = new Error('Sistema e-Social indisponível no momento');
        (err as any).statusCode = 503;
        throw err;
      }

      if (error.response) {
        const err = new Error('Sistema e-Social indisponível no momento');
        (err as any).statusCode = 503;
        throw err;
      }

      throw error;
    }
  }
}

export const esocialService = new EsocialService();
