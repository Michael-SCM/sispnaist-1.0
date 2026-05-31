import auditService from '../services/AuditService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
/**
 * GET /api/audit/logs
 * Listagem de logs com filtros
 */
export const obterLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, usuarioId, entidade, acao, dataInicio, dataFim } = req.query;
    const result = await auditService.obterLogs(Number(page), Number(limit), {
        usuarioId: usuarioId,
        entidade: entidade,
        acao: acao,
        dataInicio: dataInicio,
        dataFim: dataFim
    });
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
export const obterEstatisticas = asyncHandler(async (req, res) => {
    const result = await auditService.obterEstatisticas();
    res.status(200).json({
        status: 'success',
        data: result
    });
});
