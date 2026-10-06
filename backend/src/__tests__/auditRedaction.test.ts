import {
  redigirDetalhes,
  chaveBloqueada,
  chavePermitida,
  mascararValor,
  REDACTED,
  HIDDEN,
} from '../utils/auditRedaction.js';
import { calcularHashRegistro, stringifyEstavel, GENESIS } from '../utils/auditHash.js';
import { compararDados, logAction, obterEstatisticasAudit, resetarEstatisticasAudit } from '../utils/auditLogger.js';

jest.mock('../models/AuditLog.js', () => {
  const criar = jest.fn().mockResolvedValue({ _id: 'log-1' });
  const modelo: any = Object.assign(jest.fn(), { create: criar });
  modelo.__criar = criar;
  modelo.__reset = () => criar.mockClear();
  return { __esModule: true, default: modelo };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AuditLogMock = require('../models/AuditLog.js').default;

function reqFake(extra: any = {}): any {
  return {
    ip: '127.0.0.1',
    get: () => 'jest',
    user: { id: '64b000000000000000000001' },
    body: {},
    method: 'POST',
    originalUrl: '/api/trabalhadores',
    ...extra,
  };
}

function eventoSerializado(registro: any): string {
  return JSON.stringify(registro);
}

// ---------------------------------------------------------------------------
// PII, credenciais e dado clínico: nunca em NENHUM evento
// ---------------------------------------------------------------------------
const CPF = '529.982.247-25';
const CPF_SEM_MASCARA = '52998224725';
const RELATO =
  'Paciente relata dor irradiada no braço esquerdo após esforço repetitivo; suspeita de tendinite.';
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkF1dG9yaXphZG8ifQ.aXNvTGVnYWxEZW1vU2lnbmF0dXJl';

describe('Auditoria — redação de PII, credenciais e dado clínico', () => {
  beforeEach(() => {
    AuditLogMock.__criar.mockReset();
    AuditLogMock.__criar.mockResolvedValue({ _id: 'log-1' });
    resetarEstatisticasAudit();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('chaves de PII/credencial/dado clínico são bloqueadas', () => {
    for (const chave of [
      'cpf', 'cpfResponsavel', 'dataNascimento', 'nome', 'nomeMae', 'email',
      'telefone', 'endereco', 'enderecoCep', 'logradouro', 'bairro',
      'senha', 'password', 'hash', 'token', 'apiKey', 'authorization',
      'relato', 'relatorio', 'diagnostico', 'laudo', 'aso', 'exame',
      'cid10', 'sintoma', 'descricao', 'observacao', 'historico', 'prontuario',
    ]) {
      expect(chaveBloqueada(chave)).toBe(true);
    }
  });

  it('campos operacionais continuam legíveis (não bloqueados por engano)', () => {
    for (const chave of [
      'entidade', 'resultado', 'metodo', 'rota', 'status', 'page', 'limit',
      'total', 'situacao', 'categoria', 'perfil', 'empresaId', 'uploadId',
      'resumo', 'evento', 'motivo', 'quantidade', 'dias',
    ]) {
      expect(chaveBloqueada(chave)).toBe(false);
    }
  });

  it('valor isolado com CPF, e-mail, telefone ou JWT é mascarado', () => {
    expect(mascararValor(`trabalhador ${CPF}`)).not.toContain(CPF_SEM_MASCARA);
    expect(mascararValor('contato: joao.silva@empresa.com.br')).not.toContain('joao.silva@');
    expect(mascararValor('fone (31) 99999-1234')).not.toContain('99999-1234');
    expect(mascararValor(TOKEN)).toBe(REDACTED);
    expect(mascararValor('Bearer abcdef1234567890')).toContain(REDACTED);
  });

  it('um documento completo de trabalhador não vaza PII nem relato clínico', () => {
    const detalhes = redigirDetalhes({
      nome: 'Maria da Silva',
      cpf: CPF,
      dataNascimento: '1985-04-12',
      nomeMae: 'Josefa da Silva',
      email: 'maria.silva@saude.gov.br',
      telefone: '31 98888-7777',
      endereco: { logradouro: 'Rua A', numero: 10, bairro: 'Centro', municipio: 'BH' },
      empresa: '64b000000000000000000099',
      situacao: 'ativo',
      perfil: 'tecnico',
      relato: RELATO,
      diagnostico: 'M75.0 capsulite adesiva',
      observacao: 'Acompanhamento semestral',
      tipoSanguineo: 'O+',
      matricula: '12345',
    });

    const serializado = eventoSerializado(detalhes);

    expect(serializado).not.toContain('Maria da Silva');
    expect(serializado).not.toContain('maria.silva@saude.gov.br');
    expect(serializado).not.toContain(CPF_SEM_MASCARA);
    expect(serializado).not.toContain('98888-7777');
    expect(serializado).not.toContain('1985-04-12');
    expect(serializado).not.toContain('Josefa da Silva');
    expect(serializado).not.toContain('Rua A');
    expect(serializado).not.toContain('Belo Horizonte');
    expect(serializado).not.toContain(RELATO);
    expect(serializado).not.toContain('capsulite');
    expect(serializado).not.toContain('M75.0');
    expect(serializado).not.toContain('Acompanhamento semestral');
    expect(serializado).not.toContain('"O+"');
    expect(serializado).not.toContain('12345');

    // o rastreio continua útil
    expect(detalhes.situacao).toBe('ativo');
    expect(detalhes.perfil).toBe('tecnico');
    expect(detalhes.empresa).toBe('64b000000000000000000099');
    expect(detalhes.cpf).toBe(REDACTED);
    expect(detalhes.endereco).toBe(REDACTED);
    expect(detalhes.relato).toBe(REDACTED);
    expect(detalhes.tipoSanguineo).toBe(HIDDEN);
  });

  it('nenhum campo não permitido sobrevive a uma submissão arbitrária', () => {
    const chavesPerigosas = [
      'relatoClinico', 'queixaPrincipal', 'anamnese', 'alergias',
      'resultadoExame', 'observacoesMedicas', 'naturalidade', 'pis',
      'carteiraTrabalho', 'rg', 'cns', 'nomeSocial', 'avatarUrl',
    ];
    for (const chave of chavesPerigosas) {
      const saida = redigirDetalhes({ [chave]: 'conteúdo livre com dado sensível' });
      expect([REDACTED, HIDDEN]).toContain(saida[chave]);
    }
  });

  it('query string em URL é removida (pode filtrar por CPF)', () => {
    const saida = redigirDetalhes({
      url: '/api/trabalhadores?cpf=529.982.247-25&nome=Maria',
    });
    expect(saida.url).toBe('/api/trabalhadores');
  });

  it('estrutura arbitrária nunca lança e respeita o limite de tamanho', () => {
    const gigante = { nota: 'x'.repeat(50_000), nivel: { a: { b: { c: { d: { e: 1 } } } } } };
    const saida = redigirDetalhes(gigante);
    expect(JSON.stringify(saida).length).toBeLessThanOrEqual(4096);
    expect(redigirDetalhes(undefined)).toEqual({});
    expect(redigirDetalhes('texto solto')).toEqual({ valor: expect.anything() });
  });

  it('logAction grava evento redigido sem PII e com resultado', async () => {
    await logAction(reqFake(), 'CREATE', 'Trabalhador', '64b000000000000000000002', {
      nome: 'João Pereira',
      cpf: CPF,
      relato: RELATO,
      situacao: 'ativo',
    });

    expect(AuditLogMock.__criar).toHaveBeenCalledTimes(1);
    const registro = AuditLogMock.__criar.mock.calls[0][0];

    expect(registro.acao).toBe('CREATE');
    expect(registro.entidade).toBe('Trabalhador');
    expect(registro.entidadeId).toBe('64b000000000000000000002');
    expect(registro.resultado).toBe('sucesso');
    expect(registro.sensivel).toBe(false);

    const texto = eventoSerializado(registro);
    expect(texto).not.toContain('João Pereira');
    expect(texto).not.toContain(CPF_SEM_MASCARA);
    expect(texto).not.toContain(RELATO);

    expect(obterEstatisticasAudit().sucessos).toBe(1);
    expect(obterEstatisticasAudit().falhas).toBe(0);
  });

  it('logAction com resultado de falha registra o motivo sem credencial', async () => {
    await logAction(reqFake({ body: { senha: 'Segredo123!' } }), 'LOGIN', 'User', 'tentativa-falha', {
      motivo: 'Email ou senha inválidos',
      status: 401,
    }, { resultado: 'falha' });

    const registro = AuditLogMock.__criar.mock.calls[0][0];
    expect(registro.resultado).toBe('falha');
    expect(registro.detalhes.motivo).toBe('Email ou senha inválidos');
    expect(eventoSerializado(registro)).not.toContain('Segredo123!');
  });

  it('falha de gravação é contada e não derruba a operação', async () => {
    AuditLogMock.__criar.mockRejectedValueOnce(new Error('mongo indisponível'));

    await expect(
      logAction(reqFake(), 'READ', 'Trabalhador', '1', {}, { sensivel: true })
    ).resolves.toBeUndefined();

    const stats = obterEstatisticasAudit();
    expect(stats.falhas).toBe(1);
    expect(stats.sucessos).toBe(0);
  });

  it('compararDados devolve SOMENTE os nomes dos campos alterados', () => {
    const antes = {
      nome: 'Maria da Silva',
      cpf: CPF,
      email: 'maria@x.com.br',
      situacao: 'ativo',
      observacao: 'algo clínico',
      endereco: { logradouro: 'Rua A' },
      dataCriacao: '2026-01-01',
    };
    const depois = {
      nome: 'Maria Souza',
      cpf: '111.444.777-35',
      email: 'nova@x.com.br',
      situacao: 'inativo',
      observacao: 'outro texto clínico',
      endereco: { logradouro: 'Rua B' },
    };

    const mudancas = compararDados(antes, depois);

    expect(mudancas.camposMudados.sort()).toEqual(
      ['cpf', 'email', 'endereco', 'nome', 'observacao', 'situacao'].sort()
    );

    const texto = eventoSerializado(mudancas);
    expect(texto).not.toContain('Maria');
    expect(texto).not.toContain(CPF_SEM_MASCARA);
    expect(texto).not.toContain('maria@x.com.br');
    expect(texto).not.toContain('clínico');
    expect(texto).not.toContain('Rua A');
  });

  it('a comparação vira camposAlterados no evento, sem valores', async () => {
    await logAction(reqFake(), 'UPDATE', 'Trabalhador', '64b000000000000000000003', {
      nome: 'Nome Antigo',
      cpf: CPF,
      ...compararDados({ nome: 'A', cpf: CPF }, { nome: 'B', cpf: '111.444.777-35' }),
    });

    const registro = AuditLogMock.__criar.mock.calls[0][0];
    expect(registro.camposAlterados).toEqual(['nome', 'cpf']);
    expect(registro.detalhes.resumo).toContain('campo(s) alterado(s)');

    const texto = eventoSerializado(registro);
    expect(texto).not.toContain(CPF_SEM_MASCARA);
    expect(texto).not.toContain('Nome Antigo');
  });
});

// ---------------------------------------------------------------------------
// Cadeia de integridade
// ---------------------------------------------------------------------------
describe('Auditoria — cadeia de integridade', () => {
  const base = {
    acao: 'CREATE',
    entidade: 'Empresa',
    entidadeId: '64b000000000000000000004',
    resultado: 'sucesso',
    camposAlterados: ['nomeFantasia'],
    detalhes: { resumo: '1 campo(s) alterado(s)' },
    usuarioId: '64b000000000000000000001',
    ip: '127.0.0.1',
    userAgent: 'jest',
    dataCriacao: new Date('2026-10-01T12:00:00.000Z'),
  };

  it('mesmo registro => mesmo hash (ordem das chaves irrelevante)', () => {
    const reordenado = {
      userAgent: base.userAgent,
      dataCriacao: base.dataCriacao,
      ip: base.ip,
      usuarioId: base.usuarioId,
      detalhes: base.detalhes,
      camposAlterados: base.camposAlterados,
      resultado: base.resultado,
      entidadeId: base.entidadeId,
      entidade: base.entidade,
      acao: base.acao,
    };

    expect(stringifyEstavel(base)).toBe(stringifyEstavel(reordenado));
    expect(calcularHashRegistro(base, GENESIS)).toBe(
      calcularHashRegistro(reordenado, GENESIS)
    );
  });

  it('qualquer alteração de conteúdo muda o hash', () => {
    const original = calcularHashRegistro(base, GENESIS);

    expect(calcularHashRegistro({ ...base, entidadeId: 'outro' }, GENESIS)).not.toBe(original);
    expect(calcularHashRegistro({ ...base, resultado: 'falha' }, GENESIS)).not.toBe(original);
    expect(calcularHashRegistro({ ...base, ip: '10.0.0.9' }, GENESIS)).not.toBe(original);
    expect(
      calcularHashRegistro(
        { ...base, detalhes: { resumo: '2 campo(s) alterado(s)' } },
        GENESIS
      )
    ).not.toBe(original);
    expect(calcularHashRegistro(base, 'OUTRO_HASH')).not.toBe(original);
  });

  it('registros encadeados: alterar um registro quebra a verificação do seguinte', () => {
    const r1 = base;
    const r2 = { ...base, entidadeId: '64b000000000000000000005', dataCriacao: new Date('2026-10-01T12:00:01.000Z') };

    const hash1 = calcularHashRegistro(r1, GENESIS);
    const hash2 = calcularHashRegistro(r2, hash1);

    // verificação íntegra
    expect(calcularHashRegistro(r1, GENESIS)).toBe(hash1);
    expect(calcularHashRegistro(r2, hash1)).toBe(hash2);

    // adulteração retroativa no registro 1 não é detectada pelo próprio r1...
    const r1Adulterado = { ...r1, resultado: 'falha' };
    expect(calcularHashRegistro(r1Adulterado, GENESIS)).not.toBe(hash1);

    // ...mas o registro 2 deixa de fechar: o vínculo aponta para o hash antigo
    expect(calcularHashRegistro(r2, hash1)).not.toBe(
      calcularHashRegistro(r2, calcularHashRegistro(r1Adulterado, GENESIS))
    );

    // remoção do registro 1 faz o 2 apontar para um ancestral inexistente
    expect(calcularHashRegistro(r2, GENESIS)).not.toBe(hash2);
  });

  it('camposAlterados ordenados não alteram o hash (determinismo)', () => {
    const a = { ...base, camposAlterados: ['cpf', 'nome'] };
    const b = { ...base, camposAlterados: ['nome', 'cpf'] };
    expect(calcularHashRegistro(a, GENESIS)).toBe(calcularHashRegistro(b, GENESIS));
  });
});

// ---------------------------------------------------------------------------
// Decisões de folha
// ---------------------------------------------------------------------------
describe('Auditoria — lista permitida', () => {
  it('preserva apenas campos da lista permitida', () => {
    expect(chavePermitida('resultado')).toBe(true);
    expect(chavePermitida('entidadeId')).toBe(true);
    expect(chavePermitida('tipoSanguineo')).toBe(false);
    expect(chavePermitida('carteiraTrabalho')).toBe(false);
    expect(chavePermitida('naturalidade')).toBe(false);
  });
});
