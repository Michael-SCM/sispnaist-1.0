const mockGet = jest.fn();
jest.mock('../../utils/apiClient', () => ({
  createApiClient: jest.fn(() => ({ get: mockGet })),
}));

import { sihService, SihResponseDataRaw } from '../../services/SihService';

const mockData: SihResponseDataRaw = {
  cns_paciente: '701234567890123',
  nome_paciente: 'João Trabalhador da Silva',
  internacoes: [
    {
      numero_aih: '1234567890123',
      cnes_hospital: '2001586',
      nome_hospital: 'Hospital de Clínicas',
      data_internacao: '2026-06-15T08:30:00Z',
      data_alta: '2026-06-20T14:00:00Z',
      cid_principal: 'S62.8',
      descricao_cid: 'Fratura de outras partes e de partes não especificadas do punho e da mão',
      carater_atendimento: 'Urgência',
      valor_total_aih: 1540.75,
    },
  ],
};

describe('SihService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar dados adaptados quando a API responde com sucesso', async () => {
    mockGet.mockResolvedValue({ data: { status: 'sucesso', data: mockData } });

    const result = await sihService.buscarPorCns('701234567890123');

    expect(result).toEqual({
      cartaoSus: '701234567890123',
      nome: 'João Trabalhador da Silva',
      internacoes: [
        {
          numeroAih: '1234567890123',
          cnesHospital: '2001586',
          nomeHospital: 'Hospital de Clínicas',
          dataInternacao: '2026-06-15T08:30:00Z',
          dataAlta: '2026-06-20T14:00:00Z',
          cidPrincipal: 'S62.8',
          descricaoCid: 'Fratura de outras partes e de partes não especificadas do punho e da mão',
          caraterAtendimento: 'Urgência',
          valorTotalAih: 1540.75,
        },
      ],
    });
    expect(mockGet).toHaveBeenCalledWith('/internacoes/701234567890123');
  });

  it('deve retornar lista vazia de internações quando não há registros', async () => {
    const vazio: SihResponseDataRaw = {
      cns_paciente: '701234567890012',
      nome_paciente: 'Ana Beatriz Costa',
      internacoes: [],
    };

    mockGet.mockResolvedValue({ data: { status: 'sucesso', data: vazio } });

    const result = await sihService.buscarPorCns('701234567890012');
    expect(result.internacoes).toEqual([]);
  });

  it('deve lançar erro 404 quando nenhuma internação é encontrada', async () => {
    mockGet.mockRejectedValue({ response: { status: 404 } });

    await expect(sihService.buscarPorCns('000000000000000')).rejects.toThrow(
      'Nenhuma internação encontrada para este CNS'
    );
    await expect(sihService.buscarPorCns('000000000000000')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('deve lançar erro 504 quando ocorre timeout', async () => {
    mockGet.mockRejectedValue({ code: 'ECONNABORTED' });

    await expect(sihService.buscarPorCns('701234567890123')).rejects.toThrow(
      'O Ministério da Saúde está demorando para responder. Tente novamente.'
    );
    await expect(sihService.buscarPorCns('701234567890123')).rejects.toMatchObject({ statusCode: 504 });
  });

  it('deve lançar erro 503 para erros de conexão', async () => {
    mockGet.mockRejectedValue({ code: 'ECONNREFUSED' });
    await expect(sihService.buscarPorCns('701234567890123')).rejects.toThrow(
      'Sistema do Ministério da Saúde indisponível no momento'
    );

    mockGet.mockRejectedValue({ code: 'ENOTFOUND' });
    await expect(sihService.buscarPorCns('701234567890123')).rejects.toMatchObject({ statusCode: 503 });

    mockGet.mockRejectedValue({ code: 'ERR_NETWORK' });
    await expect(sihService.buscarPorCns('701234567890123')).rejects.toMatchObject({ statusCode: 503 });
  });

  it('deve lançar erro 503 para qualquer erro HTTP não-200', async () => {
    mockGet.mockRejectedValue({ response: { status: 502 } });

    await expect(sihService.buscarPorCns('701234567890123')).rejects.toThrow(
      'Sistema do Ministério da Saúde indisponível no momento'
    );
  });

  it('deve rejeitar CNS com menos de 15 dígitos', async () => {
    await expect(sihService.buscarPorCns('123')).rejects.toThrow('CNS inválido');
  });

  it('deve limpar caracteres não numéricos do CNS', async () => {
    mockGet.mockResolvedValue({ data: { status: 'sucesso', data: mockData } });

    await sihService.buscarPorCns('701.2345.6789.0123');
    expect(mockGet).toHaveBeenCalledWith('/internacoes/701234567890123');
  });
});
