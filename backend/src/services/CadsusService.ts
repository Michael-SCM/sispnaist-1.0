import config from '../config/config.js';
import { createApiClient } from '../utils/apiClient.js';

export interface CadsusEndereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
}

export interface CadsusContato {
  telefone_principal: string;
  email: string;
}

export interface CadsusResponseData {
  cns_definitivo: string;
  cpf: string;
  nome_completo: string;
  data_nascimento: string;
  nome_mae: string;
  sexo: string;
  nacionalidade: string;
  raca_cor: string;
  endereco: CadsusEndereco;
  contato: CadsusContato;
}

interface CadsusApiResponse {
  status: string;
  data: CadsusResponseData;
}

export interface DadosCadsusAdaptado {
  cartaoSus: string;
  cpf: string;
  nome: string;
  dataNascimento: string;
  nomeMae: string;
  sexo: string;
  nacionalidade: string;
  raca: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  celular: string;
  email: string;
}

function adapter(raw: CadsusResponseData): DadosCadsusAdaptado {
  return {
    cartaoSus: raw.cns_definitivo,
    cpf: raw.cpf,
    nome: raw.nome_completo,
    dataNascimento: raw.data_nascimento,
    nomeMae: raw.nome_mae,
    sexo: raw.sexo,
    nacionalidade: raw.nacionalidade,
    raca: raw.raca_cor,
    endereco: {
      logradouro: raw.endereco.logradouro,
      numero: raw.endereco.numero,
      complemento: raw.endereco.complemento,
      bairro: raw.endereco.bairro,
      cidade: raw.endereco.municipio,
      estado: raw.endereco.uf,
      cep: raw.endereco.cep,
    },
    celular: raw.contato.telefone_principal,
    email: raw.contato.email,
  };
}

export class CadsusService {
  private client: ReturnType<typeof createApiClient>;

  constructor() {
    this.client = createApiClient({
      baseURL: config.msCadsusApiUrl,
      authToken: config.msCadsusToken,
      apiKey: config.msCadsusApiKey,
    });
  }

  async buscarPorCpfOuCns(cpfOuCns: string): Promise<DadosCadsusAdaptado> {
    if (!config.msCadsusApiUrl) {
      throw new Error('MS_CADSUS_API_URL não configurada');
    }

    const cpfOuCnsLimpo = cpfOuCns.replace(/\D/g, '');
    if (cpfOuCnsLimpo.length < 11) {
      throw new Error('CPF ou CNS inválido');
    }

    try {
      const response = await this.client.get<CadsusApiResponse>(
        `/cadsus/usuarios/${cpfOuCnsLimpo}`
      );

      const raw = response.data?.data;
      if (!raw) {
        throw new Error('Resposta inválida da API do CADSUS');
      }

      return adapter(raw);
    } catch (error: any) {
      if (error.response?.status === 404) {
        const err = new Error('Cidadão não encontrado na base do Ministério da Saúde');
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

      if (error.response?.status && error.response.status !== 200) {
        const err = new Error('Sistema do Ministério da Saúde indisponível no momento');
        (err as any).statusCode = 503;
        throw err;
      }

      throw error;
    }
  }
}

export const cadsusService = new CadsusService();
