const mockGet = jest.fn();
jest.mock('../../utils/apiClient', () => ({
  createApiClient: jest.fn(() => ({ get: mockGet })),
}));

import { esocialService, EsocialResponseDataRaw } from '../../services/EsocialService';

const mockData: EsocialResponseDataRaw = {
  cpf: '12345678900',
  cns: '701234567890123',
  nome: 'João Trabalhador da Silva',
  eventos: {
    s2210: [
      {
        id: 'CAT-2025-001',
        data_acidente: '2025-03-15',
        hora_acidente: '14:30',
        tipo_acidente: 'Típico',
        descricao: 'Corte na mão durante manuseio de ferramenta manual',
        parte_atingida: 'Mão esquerda',
        agente_causador: 'Faca de corte',
        cid: 'S61.0',
        afastamento: true,
        dias_afastamento: 15,
        cat_emitida: true,
        cat_numero: 'CAT-2025-001',
        cat_data_emissao: '2025-03-16',
        cat_tipo: 'inicial',
        emitente_cat: 'empregador',
        houve_obito: false,
        local_acidente: 'Setor de produção',
      },
    ],
    s2220: [],
    s2240: [],
  },
};

describe('EsocialService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar dados adaptados convertendo snake_case para camelCase', async () => {
    mockGet.mockResolvedValue({ data: { status: 'sucesso', data: mockData } });

    const result = await esocialService.buscarPorCpf('12345678900');

    expect(result).toEqual({
      cpf: '12345678900',
      cns: '701234567890123',
      nome: 'João Trabalhador da Silva',
      eventos: {
        s2210: [
          {
            id: 'CAT-2025-001',
            dataAcidente: '2025-03-15',
            horaAcidente: '14:30',
            tipoAcidente: 'Típico',
            descricao: 'Corte na mão durante manuseio de ferramenta manual',
            parteAtingida: 'Mão esquerda',
            agenteCausador: 'Faca de corte',
            cid: 'S61.0',
            afastamento: true,
            diasAfastamento: 15,
            catEmitida: true,
            catNumero: 'CAT-2025-001',
            catDataEmissao: '2025-03-16',
            catTipo: 'inicial',
            emitenteCat: 'empregador',
            houveObito: false,
            localAcidente: 'Setor de produção',
          },
        ],
        s2220: [],
        s2240: [],
      },
    });
    expect(mockGet).toHaveBeenCalledWith('/api/v1/esocial/eventos/12345678900');
  });

  it('deve lançar erro 404 quando trabalhador não é encontrado', async () => {
    mockGet.mockRejectedValue({ response: { status: 404 } });

    await expect(esocialService.buscarPorCpf('00000000000')).rejects.toThrow(
      'Trabalhador não encontrado na base do e-Social'
    );
    await expect(esocialService.buscarPorCpf('00000000000')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('deve lançar erro 504 quando ocorre timeout', async () => {
    mockGet.mockRejectedValue({ code: 'ECONNABORTED' });

    await expect(esocialService.buscarPorCpf('12345678900')).rejects.toThrow(
      'O e-Social está demorando para responder. Tente novamente.'
    );
    await expect(esocialService.buscarPorCpf('12345678900')).rejects.toMatchObject({ statusCode: 504 });
  });

  it('deve lançar erro 503 para erros de conexão', async () => {
    mockGet.mockRejectedValue({ code: 'ECONNREFUSED' });
    await expect(esocialService.buscarPorCpf('12345678900')).rejects.toThrow(
      'Sistema e-Social indisponível no momento'
    );

    mockGet.mockRejectedValue({ code: 'ENOTFOUND' });
    await expect(esocialService.buscarPorCpf('12345678900')).rejects.toMatchObject({ statusCode: 503 });

    mockGet.mockRejectedValue({ code: 'ERR_NETWORK' });
    await expect(esocialService.buscarPorCpf('12345678900')).rejects.toMatchObject({ statusCode: 503 });
  });

  it('deve lançar erro 503 para qualquer erro HTTP não-200', async () => {
    mockGet.mockRejectedValue({ response: { status: 502 } });

    await expect(esocialService.buscarPorCpf('12345678900')).rejects.toThrow(
      'Sistema e-Social indisponível no momento'
    );
  });

  it('deve rejeitar CPF com menos de 11 dígitos', async () => {
    await expect(esocialService.buscarPorCpf('123')).rejects.toThrow('CPF inválido');
    await expect(esocialService.buscarPorCpf('')).rejects.toThrow('CPF inválido');
  });

  it('deve limpar caracteres não numéricos do CPF', async () => {
    mockGet.mockResolvedValue({ data: { status: 'sucesso', data: mockData } });

    await esocialService.buscarPorCpf('123.456.789-00');
    expect(mockGet).toHaveBeenCalledWith('/api/v1/esocial/eventos/12345678900');
  });
});
