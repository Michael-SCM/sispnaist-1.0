import { Request, Response } from 'express';
import auditService from '../services/AuditService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

/**
 * GET /api/audit/logs
 * Listagem de logs com filtros
 */
export const obterLogs = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, usuarioId, entidade, acao, dataInicio, dataFim } = req.query;

  const result = await auditService.obterLogs(
    Number(page),
    Number(limit),
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
      page: Number(page),
      pages: result.pages
    }
  });
});

/**
 * GET /api/audit/stats
 * Estatísticas de auditoria
 */
export const obterEstatisticas = asyncHandler(async (req: Request, res: Response) => {
  const totalLogs = await AuditLog.countDocuments();
  const logsPorAcao = await AuditLog.aggregate([
    { $group: { _id: '$acao', count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalLogs,
      logsPorAcao
    }
  });
});
