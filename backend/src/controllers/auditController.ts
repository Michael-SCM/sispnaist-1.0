import { Request, Response } from 'express';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

/**
 * GET /api/audit/logs
 * Listagem de logs com filtros
 */
export const obterLogs = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, usuarioId, entidade, acao } = req.query;
  const filter: any = {};

  if (usuarioId) filter.usuarioId = usuarioId;
  if (entidade) filter.entidade = entidade;
  if (acao) filter.acao = acao;

  const items = await AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await AuditLog.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
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
