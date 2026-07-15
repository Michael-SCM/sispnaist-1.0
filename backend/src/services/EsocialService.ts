import config from '../config/config.js';
import { createApiClient } from '../utils/apiClient.js';

export interface EsocialS2210Raw {
  id: string;
  data_acidente: string;
  hora_acidente?: string;
  tipo_acidente: string;
  descricao: string;
  parte_atingida?: string;
  agente_causador?: string;
  cid?: string;
  afastamento: boolean;
  dias_afastamento?: number;
  cat_emitida: boolean;
  cat_numero?: string;
  cat_data_emissao?: string;
  cat_tipo?: string;
  emitente_cat?: string;
  houve_obito: boolean;
  local_acidente?: string;
}

export interface EsocialS2220Raw {
  id: string;
  tipo_exame: string;
  data_exame: string;
  data_validade?: string;
  medico_nome: string;
  medico_crm: string;
  medico_uf_crm?: string;
  resultado: string;
  observacao_medica?: string;
  exames_realizados?: string[];
  riscos_ocupacionais?: string[];
  medico_pcmsmo_nome?: string;
  medico_pcmsmo_crm?: string;
}

export interface EsocialS2240Raw {
  id: string;
  data_inicio_exposicao?: string;
  data_fim_exposicao?: string | null;
  fator_risco: string;
  agente: string;
  intensidade?: string;
  limite_tolerancia?: string;
  tecnica_medicao?: string;
  resultado_medicao?: string;
  frequencia_exposicao?: string;
  duracao_exposicao?: string;
  epc_utilizado: boolean;
  epc_descricao?: string;
  epc_eficaz?: boolean | string;
  epi_utilizado: boolean;
  epi_descricao?: string;
  ca_epi?: string | null;
  epi_eficaz?: boolean;
  medidas_administrativas?: string;
}

export interface EsocialEventosRaw {
  s2210: EsocialS2210Raw[];
  s2220: EsocialS2220Raw[];
  s2240: EsocialS2240Raw[];
}

export interface EsocialResponseDataRaw {
  cpf: string;
  cns?: string;
  nome: string;
  eventos: EsocialEventosRaw;
}

interface EsocialApiResponse {
  status: string;
  data: EsocialResponseDataRaw;
}

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
  limitTolerancia?: string;
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

export interface DadosEsocialAdaptado {
  cpf: string;
  cns?: string;
  nome: string;
  eventos: EsocialEventos;
}

function adapterS2210(raw: EsocialS2210Raw): EsocialS2210 {
  return {
    id: raw.id,
    dataAcidente: raw.data_acidente,
    horaAcidente: raw.hora_acidente,
    tipoAcidente: raw.tipo_acidente,
    descricao: raw.descricao,
    parteAtingida: raw.parte_atingida,
    agenteCausador: raw.agente_causador,
    cid: raw.cid,
    afastamento: raw.afastamento,
    diasAfastamento: raw.dias_afastamento,
    catEmitida: raw.cat_emitida,
    catNumero: raw.cat_numero,
    catDataEmissao: raw.cat_data_emissao,
    catTipo: raw.cat_tipo,
    emitenteCat: raw.emitente_cat,
    houveObito: raw.houve_obito,
    localAcidente: raw.local_acidente,
  };
}

function adapterS2220(raw: EsocialS2220Raw): EsocialS2220 {
  return {
    id: raw.id,
    tipoExame: raw.tipo_exame,
    dataExame: raw.data_exame,
    dataValidade: raw.data_validade,
    medicoNome: raw.medico_nome,
    medicoCRM: raw.medico_crm,
    medicoUFCrm: raw.medico_uf_crm,
    resultado: raw.resultado,
    observacaoMedica: raw.observacao_medica,
    examesRealizados: raw.exames_realizados,
    riscosOcupacionais: raw.riscos_ocupacionais,
    medicoPcmsmoNome: raw.medico_pcmsmo_nome,
    medicoPcmsmoCrm: raw.medico_pcmsmo_crm,
  };
}

function adapterS2240(raw: EsocialS2240Raw): EsocialS2240 {
  return {
    id: raw.id,
    dataInicioExposicao: raw.data_inicio_exposicao,
    dataFimExposicao: raw.data_fim_exposicao,
    fatorRisco: raw.fator_risco,
    agente: raw.agente,
    intensidade: raw.intensidade,
    limitTolerancia: raw.limite_tolerancia,
    tecnicaMedicao: raw.tecnica_medicao,
    resultadoMedicao: raw.resultado_medicao,
    frequenciaExposicao: raw.frequencia_exposicao,
    duracaoExposicao: raw.duracao_exposicao,
    epcUtilizado: raw.epc_utilizado,
    epcDescricao: raw.epc_descricao,
    epcEficaz: raw.epc_eficaz,
    epiUtilizado: raw.epi_utilizado,
    epiDescricao: raw.epi_descricao,
    caEpi: raw.ca_epi,
    epiEficaz: raw.epi_eficaz,
    medidasAdministrativas: raw.medidas_administrativas,
  };
}

function adapter(raw: EsocialResponseDataRaw): DadosEsocialAdaptado {
  return {
    cpf: raw.cpf,
    cns: raw.cns,
    nome: raw.nome,
    eventos: {
      s2210: raw.eventos.s2210.map(adapterS2210),
      s2220: raw.eventos.s2220.map(adapterS2220),
      s2240: raw.eventos.s2240.map(adapterS2240),
    },
  };
}

export class EsocialService {
  private client: ReturnType<typeof createApiClient>;

  constructor() {
    this.client = createApiClient({
      baseURL: config.msEsocialApiUrl,
      authToken: config.msEsocialToken,
      apiKey: config.msEsocialApiKey,
    });
  }

  async buscarPorCpf(cpf: string): Promise<DadosEsocialAdaptado> {
    if (!config.msEsocialApiUrl) {
      throw new Error('MS_ESOCIAL_API_URL não configurada');
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    if (!cpfLimpo || cpfLimpo.length !== 11) {
      throw new Error('CPF inválido');
    }

    try {
      const response = await this.client.get<EsocialApiResponse>(
        `/api/v1/esocial/eventos/${cpfLimpo}`
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

      if (error.response?.status && error.response.status !== 200) {
        const err = new Error('Sistema e-Social indisponível no momento');
        (err as any).statusCode = 503;
        throw err;
      }

      throw error;
    }
  }
}

export const esocialService = new EsocialService();
