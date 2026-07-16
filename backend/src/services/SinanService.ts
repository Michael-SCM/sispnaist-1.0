import config from '../config/config.js';
import { createApiClient } from '../utils/apiClient.js';

export interface SinanNotificacaoRaw {
  numero_notificacao: string;
  data_notificacao: string;
  data_ocorrencia: string;
  codigo_agravo: string;
  nome_agravo: string;
  tipo_notificacao: string;
  cbo_ocupacao: string;
  cnae_empresa: string;
  uf_notificacao: string;
  municipio_notificacao: string;
  unidade_saude: string;
  evolucao: string;
  situacao_mercado_trabalho: string;
  cat_relacionada?: string;
  cns_paciente: string;
  data_nascimento: string;
  sexo: string;
  raca_cor: string;
  escolaridade: string;
  gestante: boolean;
  codigo_municipio_ibge: string;
}

export interface SinanResponseDataRaw {
  cpf: string;
  cns: string;
  nome: string;
  notificacoes: SinanNotificacaoRaw[];
}

interface SinanApiResponse {
  status: string;
  data: SinanResponseDataRaw;
}

interface SinanNotificarResponse {
  status: string;
  data: {
    numero_notificacao: string;
    data_notificacao: string;
    mensagem: string;
  };
}

export interface NotificacaoAdaptada {
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

export interface DadosSinanAdaptado {
  cpf: string;
  cns: string;
  nome: string;
  notificacoes: NotificacaoAdaptada[];
}

export interface NotificarInput {
  tipoNotificacao: string;
  cpf?: string;
  cns?: string;
  nome: string;
  dataOcorrencia: string;
  codigoAgravo: string;
  nomeAgravo: string;
  cboOcupacao?: string;
  cnaeEmpresa?: string;
  ufNotificacao?: string;
  municipioNotificacao?: string;
  unidadeSaude?: string;
  situacaoMercadoTrabalho?: string;
}

function adapter(raw: SinanResponseDataRaw): DadosSinanAdaptado {
  return {
    cpf: raw.cpf,
    cns: raw.cns,
    nome: raw.nome,
    notificacoes: raw.notificacoes.map((n) => ({
      numeroNotificacao: n.numero_notificacao,
      dataNotificacao: n.data_notificacao,
      dataOcorrencia: n.data_ocorrencia,
      codigoAgravo: n.codigo_agravo,
      nomeAgravo: n.nome_agravo,
      tipoNotificacao: n.tipo_notificacao,
      cboOcupacao: n.cbo_ocupacao,
      cnaeEmpresa: n.cnae_empresa,
      ufNotificacao: n.uf_notificacao,
      municipioNotificacao: n.municipio_notificacao,
      unidadeSaude: n.unidade_saude,
      evolucao: n.evolucao,
      situacaoMercadoTrabalho: n.situacao_mercado_trabalho,
      catRelacionada: n.cat_relacionada,
      cnsPaciente: n.cns_paciente,
      dataNascimento: n.data_nascimento,
      sexo: n.sexo,
      racaCor: n.raca_cor,
      escolaridade: n.escolaridade,
      gestante: n.gestante,
      codigoMunicipioIbge: n.codigo_municipio_ibge,
    })),
  };
}

export class SinanService {
  private client: ReturnType<typeof createApiClient>;

  constructor() {
    this.client = createApiClient({
      baseURL: config.msSinanApiUrl,
      authToken: config.msSinanToken,
      apiKey: config.msSinanApiKey,
    });
  }

  async buscarPorCpfOuCns(cpfOuCns: string): Promise<DadosSinanAdaptado> {
    if (!config.msSinanApiUrl) {
      throw new Error('MS_SINAN_API_URL não configurada');
    }

    const buscaLimpa = cpfOuCns.replace(/\D/g, '');
    if (buscaLimpa.length < 11) {
      throw new Error('CPF ou CNS inválido');
    }

    try {
      const response = await this.client.get<SinanApiResponse>(
        `/sinan/notificacoes/${buscaLimpa}`
      );

      const raw = response.data?.data;
      if (!raw) {
        throw new Error('Resposta inválida da API do SINAN');
      }

      return adapter(raw);
    } catch (error: any) {
      if (error.response?.status === 404) {
        const err = new Error('Nenhuma notificação encontrada para este CPF/CNS no SINAN');
        (err as any).statusCode = 404;
        throw err;
      }

      if (error.code === 'ECONNABORTED') {
        const err = new Error('O SINAN está demorando para responder. Tente novamente.');
        (err as any).statusCode = 504;
        throw err;
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ERR_NETWORK') {
        const err = new Error('Sistema SINAN indisponível no momento');
        (err as any).statusCode = 503;
        throw err;
      }

      if (error.response?.status && error.response.status !== 200) {
        const err = new Error('Sistema SINAN indisponível no momento');
        (err as any).statusCode = 503;
        throw err;
      }

      throw error;
    }
  }

  async notificar(dados: NotificarInput): Promise<{ numeroNotificacao: string; dataNotificacao: string }> {
    if (!config.msSinanApiUrl) {
      throw new Error('MS_SINAN_API_URL não configurada');
    }

    try {
      const response = await this.client.post<SinanNotificarResponse>(
        '/sinan/notificar',
        {
          tipoNotificacao: dados.tipoNotificacao,
          cpf: dados.cpf ? dados.cpf.replace(/\D/g, '') : undefined,
          cns: dados.cns ? dados.cns.replace(/\D/g, '') : undefined,
          nome: dados.nome,
          dataOcorrencia: dados.dataOcorrencia,
          codigoAgravo: dados.codigoAgravo,
          nomeAgravo: dados.nomeAgravo,
          cboOcupacao: dados.cboOcupacao,
          cnaeEmpresa: dados.cnaeEmpresa,
          ufNotificacao: dados.ufNotificacao,
          municipioNotificacao: dados.municipioNotificacao,
          unidadeSaude: dados.unidadeSaude,
          situacaoMercadoTrabalho: dados.situacaoMercadoTrabalho,
        }
      );

      const result = response.data?.data;
      if (!result) {
        throw new Error('Resposta inválida da API do SINAN');
      }

      return {
        numeroNotificacao: result.numero_notificacao,
        dataNotificacao: result.data_notificacao,
      };
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        const err = new Error('O SINAN está demorando para responder. Tente novamente.');
        (err as any).statusCode = 504;
        throw err;
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ERR_NETWORK') {
        const err = new Error('Sistema SINAN indisponível no momento');
        (err as any).statusCode = 503;
        throw err;
      }

      if (error.response?.data?.mensagem) {
        const err = new Error(error.response.data.mensagem);
        (err as any).statusCode = error.response.status || 400;
        throw err;
      }

      throw error;
    }
  }
}

export const sinanService = new SinanService();
