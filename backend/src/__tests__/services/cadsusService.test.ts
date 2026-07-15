jest.mock('axios');

import axios from 'axios';
import { cadsusService, CadsusResponseData } from '../../services/CadsusService';

const mockAxiosGet = axios.get as jest.Mock;

const mockData: CadsusResponseData = {
  cns_definitivo: '701234567890123',
  cpf: '12345678900',
  nome_completo: 'João Trabalhador da Silva',
  data_nascimento: '1985-04-12',
  nome_mae: 'Maria da Silva',
  sexo: 'M',
  nacionalidade: 'Brasileira',
  raca_cor: 'Parda',
  endereco: {
    logradouro: 'Rua das Indústrias',
    numero: '100',
    complemento: 'Apt 202',
    bairro: 'Polo Industrial',
    municipio: 'Camaçari',
    uf: 'BA',
    cep: '42800-000',
  },
  contato: {
    telefone_principal: '71999999999',
    email: 'joao.trabalhador@email.com',
  },
};

describe('CadsusService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar dados adaptados quando a API responde com sucesso', async () => {
    mockAxiosGet.mockResolvedValue({
      data: { status: 'sucesso', data: mockData },
    });

    const result = await cadsusService.buscarPorCpfOuCns('12345678900');

    expect(result).toEqual({
      cartaoSus: '701234567890123',
      cpf: '12345678900',
      nome: 'João Trabalhador da Silva',
      dataNascimento: '1985-04-12',
      nomeMae: 'Maria da Silva',
      sexo: 'M',
      raca: 'Parda',
      endereco: {
        logradouro: 'Rua das Indústrias',
        numero: '100',
        complemento: 'Apt 202',
        bairro: 'Polo Industrial',
        cidade: 'Camaçari',
        estado: 'BA',
        cep: '42800-000',
      },
      celular: '71999999999',
      email: 'joao.trabalhador@email.com',
    });
    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://mock-cadsus:3000/api/v1/cadsus/usuarios/12345678900',
      { timeout: 60000 }
    );
  });

  it('deve lançar erro 404 quando cidadão não é encontrado', async () => {
    mockAxiosGet.mockRejectedValue({ response: { status: 404 } });

    await expect(cadsusService.buscarPorCpfOuCns('00000000000')).rejects.toThrow(
      'Cidadão não encontrado na base do Ministério da Saúde'
    );
    await expect(cadsusService.buscarPorCpfOuCns('00000000000')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('deve lançar erro 504 quando ocorre timeout', async () => {
    mockAxiosGet.mockRejectedValue({ code: 'ECONNABORTED' });

    await expect(cadsusService.buscarPorCpfOuCns('12345678900')).rejects.toThrow(
      'O Ministério da Saúde está demorando para responder. Tente novamente.'
    );
    await expect(cadsusService.buscarPorCpfOuCns('12345678900')).rejects.toMatchObject({
      statusCode: 504,
    });
  });

  it('deve lançar erro 503 quando conexão é recusada', async () => {
    mockAxiosGet.mockRejectedValue({ code: 'ECONNREFUSED' });

    await expect(cadsusService.buscarPorCpfOuCns('12345678900')).rejects.toThrow(
      'Sistema do Ministério da Saúde indisponível no momento'
    );
    await expect(cadsusService.buscarPorCpfOuCns('12345678900')).rejects.toMatchObject({
      statusCode: 503,
    });
  });

  it('deve lançar erro 503 para ENOTFOUND e ERR_NETWORK', async () => {
    mockAxiosGet.mockRejectedValue({ code: 'ENOTFOUND' });
    await expect(cadsusService.buscarPorCpfOuCns('12345678900')).rejects.toMatchObject({
      statusCode: 503,
    });

    mockAxiosGet.mockRejectedValue({ code: 'ERR_NETWORK' });
    await expect(cadsusService.buscarPorCpfOuCns('12345678900')).rejects.toMatchObject({
      statusCode: 503,
    });
  });

  it('deve lançar erro 503 para qualquer erro HTTP não-404', async () => {
    mockAxiosGet.mockRejectedValue({ response: { status: 502 } });
    await expect(cadsusService.buscarPorCpfOuCns('12345678900')).rejects.toThrow(
      'Sistema do Ministério da Saúde indisponível no momento'
    );
  });

  it('deve rejeitar CPF/CNS com menos de 11 dígitos', async () => {
    await expect(cadsusService.buscarPorCpfOuCns('123')).rejects.toThrow('CPF ou CNS inválido');
  });

  it('deve limpar caracteres não numéricos do CPF/CNS', async () => {
    mockAxiosGet.mockResolvedValue({ data: { status: 'sucesso', data: mockData } });

    await cadsusService.buscarPorCpfOuCns('123.456.789-00');
    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://mock-cadsus:3000/api/v1/cadsus/usuarios/12345678900',
      expect.any(Object)
    );
  });
});
