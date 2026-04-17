import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import auditService from '../services/AuditService.js';
import { IAuthRequest } from '../middleware/auth.js';

/**
 * GET /api/audit/logs
 * Obtém logs de auditoria com filtros e paginação
 */
export const obterLogs = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const filtros = {
    entidade: req.query.entidade as string | undefined,
    usuarioId: req.query.usuarioId as string | undefined,
    acao: req.query.acao as string | undefined,
    dataInicio: req.query.dataInicio as string | undefined,
    dataFim: req.query.dataFim as string | undefined,
  };

  const { logs, total, pages } = await auditService.obterLogs(page, limit, filtros);

  res.status(200).json({
    status: 'success',
    data: {
      logs,
      paginacao: {
        page,
        limit,
        total,
        pages,
      },
    },
  });
});

/**
 * GET /api/audit/stats
 * Obtém estatísticas de auditoria
 */
export const obterEstatisticas = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const stats = await auditService.obterEstatisticas();

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});
