import { Request, Response } from 'express';
import auditService from '../services/AuditService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';
import { obterPoliticaRetencao } from '../config/auditPolicy.js';
import { obterEstatisticasAudit } from '../utils/auditLogger.js';
import { obterEstatisticasAuditRead } from '../middleware/auditRead.js';

/**
 * GET /api/audit/logs
 * Listagem de logs com filtros
 */
export const obterLogs = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 20 });
  const { usuarioId, entidade, acao, dataInicio, dataFim, sensivel } = req.query;

  const result = await auditService.obterLogs(
    page,
    limit,
    {
      usuarioId: usuarioId as string,
      entidade: entidade as string,
      acao: acao as string,
      dataInicio: dataInicio as string,
      dataFim: dataFim as string,
      sensivel: sensivel === 'true' ? true : sensivel === 'false' ? false : undefined,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      items: result.logs,
      total: result.total,
      page,
      pages: getPaginationResult(result.total, page, limit).pages
    }
  });
});

/**
 * GET /api/audit/stats
 * Estatísticas de auditoria
 */
export const obterEstatisticas = asyncHandler(async (req: Request, res: Response) => {
  const result = await auditService.obterEstatisticas();

  res.status(200).json({
    status: 'success',
    data: result
  });
});

/**
 * GET /api/audit/integrity
 * Confere a cadeia de hash dos logs (rastreabilidade).
 */
export const verificarIntegridade = asyncHandler(async (req: Request, res: Response) => {
  const relatorio = await auditService.verificarIntegridadeCadeia();

  res.status(relatorio.quebras > 0 ? 206 : 200).json({
    status: relatorio.quebras > 0 ? 'partial-content' : 'success',
    data: relatorio,
  });
});

/**
 * GET /api/audit/policy
 * Política de retenção REALMENTE implementada + estatísticas da trilha.
 * Serve para confrontar documentação x comportamento do sistema.
 */
export const obterPolitica = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      politica: obterPoliticaRetencao(),
      gravacao: obterEstatisticasAudit(),
      leitura: obterEstatisticasAuditRead(),
      aviso: 'Não constitui parecer jurídico. Prazos exigem validação de privacidade/jurídico.',
    },
  });
});
