import mongoose from 'mongoose';
import AuditLog, { IAuditLog } from '../models/AuditLog.js';
import { criarComCadeia } from '../utils/auditChain.js';
import { calcularHashRegistro, GENESIS } from '../utils/auditHash.js';
import {
  AUDIT_RETENTION_DAYS,
  AUDIT_RETENTION_DRY_RUN,
} from '../config/auditPolicy.js';

export interface RelatorioCadeia {
  geradoEm: string;
  totalRegistros: number;
  conferidos: number;
  integros: number;
  quebras: number;
  primeiroProblema: {
    id: string;
    tipo: 'hash_invalido' | 'vinculo_quebrado' | 'sem_hash';
    esperado?: string;
    encontrado?: string;
  } | null;
  reiniciosAceitos: number;
}

export interface ResultadoRetencao {
  geradoEm: string;
  retencaoDias: number;
  dryRun: boolean;
  candidatos: number;
  removidos: number;
  corte: string | null;
}

export class AuditService {
  /**
   * Registra uma ação no audit log (com cadeia de integridade).
   */
  async registrar(data: Omit<IAuditLog, '_id' | 'dataCriacao'>): Promise<void> {
    try {
      await criarComCadeia(data);
    } catch (error) {
      console.error('[AUDIT] Erro ao registrar audit log:', error);
      if (process.env.AUDIT_STRICT === 'true') throw error;
    }
  }

  /**
   * Confere a cadeia de hash do início ao fim.
   *
   * O que é verificado por registro:
   *   1. `hash` existe e bate com o recálculo a partir de `hashAnterior`;
   *   2. `hashAnterior` aponta de fato para o registro imediatamente anterior.
   *
   * O primeiro registro da consulta tem `hashAnterior` aceito como está — ele
   * pode apontar para algo já removido por retenção (reinício legítimo de
   * cadeia). Qualquer outro `hashAnterior` divergente é quebra.
   *
   * IMPORTANTE: a cadeia é guardada no mesmo banco dos logs, portanto detecta
   * alteração retroativa por erro/acesso não autorizado de aplicação, mas NÃO
   * prova nada contra um administrador com escrita direta no banco. Por isso a
   * exportação periódica (`npm run audit:export`) é parte da política.
   */
  async verificarIntegridadeCadeia(): Promise<RelatorioCadeia> {
    const relatorio: RelatorioCadeia = {
      geradoEm: new Date().toISOString(),
      totalRegistros: 0,
      conferidos: 0,
      integros: 0,
      quebras: 0,
      primeiroProblema: null,
      reiniciosAceitos: 0,
    };

    const cursor = AuditLog.find({})
      .sort({ dataCriacao: 1, _id: 1 })
      .select(
        'acao entidade entidadeId resultado camposAlterados detalhes usuarioId ip userAgent dataCriacao hash hashAnterior'
      )
      .lean()
      .cursor();

    let hashAnteriorEsperado: string | null = null;
    let primeiro = true;

    for await (const doc of cursor as any) {
      relatorio.totalRegistros++;

      if (!doc.hash) {
        relatorio.quebras++;
        if (!relatorio.primeiroProblema) {
          relatorio.primeiroProblema = { id: String(doc._id), tipo: 'sem_hash' };
        }
        // não dá para avançar a partir de um registro sem hash
        continue;
      }

      const hashAnteriorDoDoc = doc.hashAnterior ?? GENESIS;

      if (primeiro) {
        // Reinício legítimo de cadeia (primeiro registro da consulta; pode
        // apontar para algo já removido por retenção).
        relatorio.reiniciosAceitos++;
        primeiro = false;
        hashAnteriorEsperado = hashAnteriorDoDoc;
      } else if (hashAnteriorEsperado !== null && hashAnteriorDoDoc !== hashAnteriorEsperado) {
        relatorio.quebras++;
        if (!relatorio.primeiroProblema) {
          relatorio.primeiroProblema = {
            id: String(doc._id),
            tipo: 'vinculo_quebrado',
            esperado: hashAnteriorEsperado,
            encontrado: String(hashAnteriorDoDoc),
          };
        }
      }

      // Integridade do próprio conteúdo
      const esperado = calcularHashRegistro(doc, hashAnteriorDoDoc);
      relatorio.conferidos++;

      if (esperado === doc.hash) {
        relatorio.integros++;
      } else {
        relatorio.quebras++;
        if (!relatorio.primeiroProblema) {
          relatorio.primeiroProblema = {
            id: String(doc._id),
            tipo: 'hash_invalido',
            esperado,
            encontrado: String(doc.hash),
          };
        }
      }

      // Sempre avança sobre o hash REALMENTE armazenado, para que uma quebra
      // não faça todos os registros seguintes caírem em cascata.
      hashAnteriorEsperado = doc.hash;
    }

    return relatorio;
  }

  /**
   * Exclui logs anteriores a `AUDIT_RETENTION_DAYS`.
   *
   * Usa o driver nativo de propósito: os hooks de imutabilidade do Mongoose
   * bloqueiam `deleteMany` para impedir exclusão acidental — a retenção é a
   * única via legítima e é deliberada (e por isso auditada logo em seguida).
   */
  async aplicarRetencao(): Promise<ResultadoRetencao> {
    const resultado: ResultadoRetencao = {
      geradoEm: new Date().toISOString(),
      retencaoDias: AUDIT_RETENTION_DAYS,
      dryRun: AUDIT_RETENTION_DRY_RUN,
      candidatos: 0,
      removidos: 0,
      corte: null,
    };

    if (AUDIT_RETENTION_DAYS <= 0) return resultado;

    const corte = new Date(Date.now() - AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    resultado.corte = corte.toISOString();

    const filtro = { dataCriacao: { $lt: corte } };
    resultado.candidatos = await AuditLog.countDocuments(filtro);

    if (resultado.candidatos === 0 || AUDIT_RETENTION_DRY_RUN) return resultado;

    // Driver nativo (mongodb.Db), fora dos hooks de imutabilidade do Mongoose.
    const db = mongoose.connection.db;
    if (!db) throw new Error('Conexão MongoDB indisponível para a retenção do audit log.');
    const deletado = await db.collection('audit_logs').deleteMany(filtro as any);
    resultado.removidos = deletado?.deletedCount ?? 0;

    // Audita o próprio ato de exclusão (a cadeia recomeça a partir do que resta)
    await this.registrar({
      acao: 'DELETE',
      entidade: 'AuditLog',
      entidadeId: 'retencao',
      resultado: 'sucesso',
      detalhes: {
        evento: 'retencao-audit-log',
        quantidade: resultado.removidos,
        dias: AUDIT_RETENTION_DAYS,
        ate: resultado.corte,
      },
      sensivel: false,
    } as any);

    return resultado;
  }

  /**
   * Obtém logs de auditoria com filtros e paginação.
   */
  async obterLogs(
    page: number = 1,
    limit: number = 20,
    filtros?: {
      entidade?: string;
      usuarioId?: string;
      acao?: string;
      dataInicio?: string;
      dataFim?: string;
      sensivel?: boolean;
    }
  ): Promise<{ logs: any[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filtros?.entidade) query.entidade = filtros.entidade;
    if (filtros?.usuarioId) query.usuarioId = filtros.usuarioId;
    if (filtros?.acao) query.acao = filtros.acao;
    if (filtros?.sensivel !== undefined) query.sensivel = filtros.sensivel;

    if (filtros?.dataInicio || filtros?.dataFim) {
      query.dataCriacao = {};
      if (filtros?.dataInicio) query.dataCriacao.$gte = new Date(filtros.dataInicio);
      if (filtros?.dataFim) query.dataCriacao.$lte = new Date(filtros.dataFim);
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('usuarioId', 'nome email perfil')
      .sort({ dataCriacao: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return { logs, total, pages: Math.ceil(total / limit) };
  }

  /**
   * Estatísticas de auditoria.
   */
  async obterEstatisticas(): Promise<{
    totalLogs: number;
    porAcao: Record<string, number>;
    porEntidade: Record<string, number>;
    ultimasAtividades: any[];
    acessosSensiveis: number;
    comFalha: number;
  }> {
    const totalLogs = await AuditLog.countDocuments();

    const porAcaoAgg = await AuditLog.aggregate([
      { $group: { _id: '$acao', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const porEntidadeAgg = await AuditLog.aggregate([
      { $group: { _id: '$entidade', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const ultimasAtividades = await AuditLog.find()
      .sort({ dataCriacao: -1 })
      .limit(10)
      .select('acao entidade entidadeId resultado dataCriacao usuarioId')
      .lean();

    const acessosSensiveis = await AuditLog.countDocuments({ sensivel: true });
    const comFalha = await AuditLog.countDocuments({ resultado: { $in: ['falha', 'negado'] } });

    const reduzir = (agg: any[]) =>
      agg.reduce((acc: Record<string, number>, item: any) => {
        acc[item._id] = item.total;
        return acc;
      }, {});

    return {
      totalLogs,
      porAcao: reduzir(porAcaoAgg),
      porEntidade: reduzir(porEntidadeAgg),
      ultimasAtividades,
      acessosSensiveis,
      comFalha,
    };
  }
}

export default new AuditService();
