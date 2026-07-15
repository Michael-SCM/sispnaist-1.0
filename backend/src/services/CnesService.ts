import config from '../config/config.js';
import { createApiClient } from '../utils/apiClient.js';

export interface CnesEndereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
}

export interface CnesLeitos {
  total: number;
  sus: number;
  privado: number;
}

export interface CnesResponseData {
  codigo_cnes: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  tipo_unidade: string;
  endereco: CnesEndereco;
  telefone: string;
  email: string;
  natureza_juridica: string;
  gestao: string;
  esfera_administrativa: string;
  latitude: number;
  longitude: number;
  leitos: CnesLeitos;
  servicos: string[];
}

interface CnesApiResponse {
  status: string;
  data: CnesResponseData;
}

export interface DadosCnesAdaptado {
  codigoCnes: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  tipoUnidade: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  telefone: string;
  email: string;
  naturezaJuridica: string;
  gestao: string;
  esferaAdministrativa: string;
  latitude: number;
  longitude: number;
  leitos: {
    total: number;
    sus: number;
    privado: number;
  };
  servicos: string[];
}

function adapter(raw: CnesResponseData): DadosCnesAdaptado {
  return {
    codigoCnes: raw.codigo_cnes,
    nomeFantasia: raw.nome_fantasia,
    razaoSocial: raw.razao_social,
    cnpj: raw.cnpj,
    tipoUnidade: raw.tipo_unidade,
    endereco: {
      logradouro: raw.endereco.logradouro,
      numero: raw.endereco.numero,
      complemento: raw.endereco.complemento,
      bairro: raw.endereco.bairro,
      cidade: raw.endereco.municipio,
      estado: raw.endereco.uf,
      cep: raw.endereco.cep,
    },
    telefone: raw.telefone,
    email: raw.email,
    naturezaJuridica: raw.natureza_juridica,
    gestao: raw.gestao,
    esferaAdministrativa: raw.esfera_administrativa,
    latitude: raw.latitude,
    longitude: raw.longitude,
    leitos: raw.leitos,
    servicos: raw.servicos,
  };
}

export class CnesService {
  private client: ReturnType<typeof createApiClient>;

  constructor() {
    this.client = createApiClient({
      baseURL: config.msCnesApiUrl,
      authToken: config.msCnesToken,
      apiKey: config.msCnesApiKey,
    });
  }

  async buscarPorCodigo(codigo: string): Promise<DadosCnesAdaptado> {
    if (!config.msCnesApiUrl) {
      throw new Error('MS_CNES_API_URL não configurada');
    }

    const codigoLimpo = codigo.replace(/\D/g, '');
    if (!codigoLimpo) {
      throw new Error('Código CNES inválido');
    }

    try {
      const response = await this.client.get<CnesApiResponse>(
        `/cnes/estabelecimentos/${codigoLimpo}`
      );

      const raw = response.data?.data;
      if (!raw) {
        throw new Error('Resposta inválida da API do CNES');
      }

      return adapter(raw);
    } catch (error: any) {
      if (error.response?.status === 404) {
        const err = new Error('Estabelecimento não encontrado na base do Ministério da Saúde');
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

export const cnesService = new CnesService();
