import axios from 'axios';
import config from '../config/config.js';

interface SihInternacaoRaw {
  numero_aih: string;
  cnes_hospital: string;
  nome_hospital: string;
  data_internacao: string;
  data_alta: string;
  cid_principal: string;
  descricao_cid: string;
  carater_atendimento: string;
  valor_total_aih: number;
}

interface SihResponseDataRaw {
  cns_paciente: string;
  nome_paciente: string;
  internacoes: SihInternacaoRaw[];
}

interface SihApiResponse {
  status: string;
  data: SihResponseDataRaw;
}

export interface InternacaoAdaptada {
  numeroAih: string;
  cnesHospital: string;
  nomeHospital: string;
  dataInternacao: string;
  dataAlta: string;
  cidPrincipal: string;
  descricaoCid: string;
  caraterAtendimento: string;
  valorTotalAih: number;
}

export interface DadosSihAdaptado {
  cartaoSus: string;
  nome: string;
  internacoes: InternacaoAdaptada[];
}

function adapter(raw: SihResponseDataRaw): DadosSihAdaptado {
  return {
    cartaoSus: raw.cns_paciente,
    nome: raw.nome_paciente,
    internacoes: raw.internacoes.map((i) => ({
      numeroAih: i.numero_aih,
      cnesHospital: i.cnes_hospital,
      nomeHospital: i.nome_hospital,
      dataInternacao: i.data_internacao,
      dataAlta: i.data_alta,
      cidPrincipal: i.cid_principal,
      descricaoCid: i.descricao_cid,
      caraterAtendimento: i.carater_atendimento,
      valorTotalAih: i.valor_total_aih,
    })),
  };
}

export class SihService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.msSihApiUrl;
  }

  async buscarPorCns(cns: string): Promise<DadosSihAdaptado> {
    if (!this.baseUrl) {
      throw new Error('MS_SIH_API_URL não configurada');
    }

    const cnsLimpo = cns.replace(/\D/g, '');
    if (cnsLimpo.length < 15) {
      throw new Error('CNS inválido');
    }

    try {
      const response = await axios.get<SihApiResponse>(
        `${this.baseUrl}/internacoes/${cnsLimpo}`,
        { timeout: 60000 }
      );

      const raw = response.data?.data;
      if (!raw) {
        throw new Error('Resposta inválida da API do SIH');
      }

      return adapter(raw);
    } catch (error: any) {
      if (error.response?.status === 404) {
        const err = new Error('Nenhuma internação encontrada para este CNS');
        (err as any).statusCode = 404;
        throw err;
      }

      if (error.code === 'ECONNABORTED') {
        const err = new Error('O Ministério da Saúde está demorando para responder. Tente novamente.');
        (err as any).statusCode = 504;
        throw err;
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ERR_NETWORK') {
        const err = new Error('Sistema do Ministério da Saúde indisponível no momento');
        (err as any).statusCode = 503;
        throw err;
      }

      // Qualquer outro erro HTTP da mock (502, 500, etc.) — trata como indisponível
      if (error.response?.status && error.response.status !== 200) {
        const err = new Error('Sistema do Ministério da Saúde indisponível no momento');
        (err as any).statusCode = 503;
        throw err;
      }

      throw error;
    }
  }
}

export const sihService = new SihService();
