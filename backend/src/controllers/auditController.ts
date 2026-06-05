import { Request, Response } from 'express';
import AuditLog from '../models/AuditLog.js';
import auditService from '../services/AuditService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';

/**
 * GET /api/audit/logs
 * Listagem de logs com filtros
 */
export const obterLogs = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 20 });
  const { usuarioId, entidade, acao, dataInicio, dataFim } = req.query;

  const result = await auditService.obterLogs(
    page,
    limit,
    {
      usuarioId: usuarioId as string,
      entidade: entidade as string,
      acao: acao as string,
      dataInicio: dataInicio as string,
      dataFim: dataFim as string
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
