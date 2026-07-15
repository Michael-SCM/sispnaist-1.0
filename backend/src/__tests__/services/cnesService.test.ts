jest.mock('axios');

import axios from 'axios';
import { cnesService, CnesResponseData } from '../../services/CnesService';

const mockAxiosGet = axios.get as jest.Mock;

const mockData: CnesResponseData = {
  codigo_cnes: '2001586',
  nome_fantasia: 'Hospital de Clínicas',
  razao_social: 'Associação Hospitalar de Clínicas Ltda',
  cnpj: '60.123.456/0001-00',
  tipo_unidade: 'Hospital Geral',
  endereco: {
    logradouro: 'Av. Paulista',
    numero: '1000',
    complemento: '',
    bairro: 'Bela Vista',
    municipio: 'São Paulo',
    uf: 'SP',
    cep: '01310-100',
  },
  telefone: '(11) 3333-1000',
  email: 'contato@hospitaldeclinicas.com.br',
  natureza_juridica: 'Privada',
  gestao: 'Municipal',
  esfera_administrativa: 'Privada',
  latitude: -23.5610,
  longitude: -46.6545,
  leitos: { total: 280, sus: 200, privado: 80 },
  servicos: ['Clínica Geral', 'Cirurgia Geral', 'Cardiologia', 'Pediatria', 'Ortopedia', 'Neurologia'],
};

describe('CnesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar dados adaptados quando a API responde com sucesso', async () => {
    mockAxiosGet.mockResolvedValue({ data: { status: 'sucesso', data: mockData } });

    const result = await cnesService.buscarPorCodigo('2001586');

    expect(result).toEqual({
      codigoCnes: '2001586',
      nomeFantasia: 'Hospital de Clínicas',
      razaoSocial: 'Associação Hospitalar de Clínicas Ltda',
      cnpj: '60.123.456/0001-00',
      tipoUnidade: 'Hospital Geral',
      endereco: {
        logradouro: 'Av. Paulista',
        numero: '1000',
        complemento: '',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100',
      },
      telefone: '(11) 3333-1000',
      email: 'contato@hospitaldeclinicas.com.br',
      naturezaJuridica: 'Privada',
      gestao: 'Municipal',
      esferaAdministrativa: 'Privada',
      latitude: -23.5610,
      longitude: -46.6545,
      leitos: { total: 280, sus: 200, privado: 80 },
      servicos: ['Clínica Geral', 'Cirurgia Geral', 'Cardiologia', 'Pediatria', 'Ortopedia', 'Neurologia'],
    });
    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://mock-cnes:3000/api/v1/cnes/estabelecimentos/2001586',
      { timeout: 60000 }
    );
  });

  it('deve lançar erro 404 quando estabelecimento não é encontrado', async () => {
    mockAxiosGet.mockRejectedValue({ response: { status: 404 } });

    await expect(cnesService.buscarPorCodigo('0000000')).rejects.toThrow(
      'Estabelecimento não encontrado na base do Ministério da Saúde'
    );
    await expect(cnesService.buscarPorCodigo('0000000')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('deve lançar erro 504 quando ocorre timeout', async () => {
    mockAxiosGet.mockRejectedValue({ code: 'ECONNABORTED' });

    await expect(cnesService.buscarPorCodigo('2001586')).rejects.toThrow(
      'O Ministério da Saúde está demorando para responder. Tente novamente.'
    );
    await expect(cnesService.buscarPorCodigo('2001586')).rejects.toMatchObject({ statusCode: 504 });
  });

  it('deve lançar erro 503 para erros de conexão', async () => {
    mockAxiosGet.mockRejectedValue({ code: 'ECONNREFUSED' });
    await expect(cnesService.buscarPorCodigo('2001586')).rejects.toThrow(
      'Sistema do Ministério da Saúde indisponível no momento'
    );

    mockAxiosGet.mockRejectedValue({ code: 'ENOTFOUND' });
    await expect(cnesService.buscarPorCodigo('2001586')).rejects.toMatchObject({ statusCode: 503 });

    mockAxiosGet.mockRejectedValue({ code: 'ERR_NETWORK' });
    await expect(cnesService.buscarPorCodigo('2001586')).rejects.toMatchObject({ statusCode: 503 });
  });

  it('deve lançar erro 503 para qualquer erro HTTP não-404', async () => {
    mockAxiosGet.mockRejectedValue({ response: { status: 500 } });

    await expect(cnesService.buscarPorCodigo('2001586')).rejects.toThrow(
      'Sistema do Ministério da Saúde indisponível no momento'
    );
  });

  it('deve rejeitar código vazio após limpeza', async () => {
    await expect(cnesService.buscarPorCodigo('')).rejects.toThrow('Código CNES inválido');
    await expect(cnesService.buscarPorCodigo('abc')).rejects.toThrow('Código CNES inválido');
  });

  it('deve limpar caracteres não numéricos do código', async () => {
    mockAxiosGet.mockResolvedValue({ data: { status: 'sucesso', data: mockData } });

    await cnesService.buscarPorCodigo('2001.586');
    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://mock-cnes:3000/api/v1/cnes/estabelecimentos/2001586',
      expect.any(Object)
    );
  });
});
