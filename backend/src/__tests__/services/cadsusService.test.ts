const mockGet = jest.fn();
const mockCreateApiClient = jest.fn(() => ({ get: mockGet }));
jest.mock('../../utils/apiClient', () => ({
  createApiClient: mockCreateApiClient,
}));

import { cadsusService, CadsusResponseData } from '../../services/CadsusService';

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
    mockGet.mockClear();
  });

  it('deve retornar dados adaptados quando a API responde com sucesso', async () => {
    expect(mockCreateApiClient).toHaveBeenCalledWith({
      baseURL: 'http://mock-cadsus:3000/api/v1',
      authToken: '',
      apiKey: '',
    });

    mockGet.mockResolvedValue({ data: { status: 'sucesso', data: mockData } });

    const result = await cadsusService.buscarPorCpfOuCns('12345678900');

    expect(result).toEqual({
      cartaoSus: '701234567890123',
      cpf: '12345678900',
      nome: 'João Trabalhador da Silva',
      dataNascimento: '1985-04-12',
      nomeMae: 'Maria da Silva',
      sexo: 'M',
      nacionalidade: 'Brasileira',
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
    expect(mockGet).toHaveBeenCalledWith('/cadsus/usuarios/12345678900');
  });

  it('deve lançar erro 404 quando cidadão não é encontrado', async () => {
    mockGet.mockRejectedValue({ response: { status: 404 } });

    await expect(cadsusService.buscarPorCpfOuCns('00000000000')).rejects.toThrow(
      'Cidadão não encontrado na base do Ministério da Saúde'
    );
    await expect(cadsusService.buscarPorCpfOuCns('00000000000')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('deve lançar erro 504 quando ocorre timeout', async () => {
    mockGet.mockRejectedValue({ code: 'ECONNABORTED' });

    await expect(cadsusService.buscarPorCpfOuCns('12345678900')).rejects.toThrow(
      'O Ministério da Saúde está demorando para responder. Tente novamente.'
    );
    await expect(cadsusService.buscarPorCpfOuCns('12345678900')).rejects.toMatchObject({
      statusCode: 504,
    });
  });

  it('deve lançar erro 503 para erros de conexão', async () => {
    mockGet.mockRejectedValue({ code: 'ECONNREFUSED' });
    await expect(cadsusService.buscarPorCpfOuCns('12345678900')).rejects.toThrow(
      'Sistema do Ministério da Saúde indisponível no momento'
    );

    mockGet.mockRejectedValue({ code: 'ENOTFOUND' });
    await expect(cadsusService.buscarPorCpfOuCns('12345678900')).rejects.toMatchObject({
      statusCode: 503,
    });

    mockGet.mockRejectedValue({ code: 'ERR_NETWORK' });
    await expect(cadsusService.buscarPorCpfOuCns('12345678900')).rejects.toMatchObject({
      statusCode: 503,
    });
  });

  it('deve lançar erro 503 para qualquer erro HTTP não-200', async () => {
    mockGet.mockRejectedValue({ response: { status: 502 } });
    await expect(cadsusService.buscarPorCpfOuCns('12345678900')).rejects.toThrow(
      'Sistema do Ministério da Saúde indisponível no momento'
    );
  });

  it('deve rejeitar CPF/CNS com menos de 11 dígitos', async () => {
    await expect(cadsusService.buscarPorCpfOuCns('123')).rejects.toThrow('CPF ou CNS inválido');
  });

  it('deve limpar caracteres não numéricos do CPF/CNS', async () => {
    mockGet.mockResolvedValue({ data: { status: 'sucesso', data: mockData } });

    await cadsusService.buscarPorCpfOuCns('123.456.789-00');
    expect(mockGet).toHaveBeenCalledWith('/cadsus/usuarios/12345678900');
  });

});
