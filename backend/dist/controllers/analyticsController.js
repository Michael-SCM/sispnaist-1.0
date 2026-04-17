import { asyncHandler } from '../middleware/asyncHandler.js';
import analyticsService from '../services/AnalyticsService.js';
/**
 * GET /api/analytics/kpis
 * Obtém KPIs gerais do sistema
 */
export const obterKPIs = asyncHandler(async (req, res) => {
    const kpis = await analyticsService.obterKPIs();
    res.status(200).json({
        status: 'success',
        data: { kpis },
    });
});
/**
 * GET /api/analytics/acidentes
 * Obtém dados para gráficos de acidentes
 */
export const obterDadosAcidentes = asyncHandler(async (req, res) => {
    const dados = await analyticsService.obterDadosAcidentes();
    res.status(200).json({
        status: 'success',
        data: { dados },
    });
});
/**
 * GET /api/analytics/vacinacoes/proximas
 * Obtém próximas vacinações (vencidas ou próximas de vencer)
 */
export const obterProximasVacinacoes = asyncHandler(async (req, res) => {
    const dias = parseInt(req.query.dias) || 30;
    const vacinacoes = await analyticsService.obterProximasVacinacoes(dias);
    res.status(200).json({
        status: 'success',
        data: { vacinacoes },
    });
});
/**
 * GET /api/analytics/acidentes/ultimos
 * Obtém últimos acidentes registrados
 */
export const obterUltimosAcidentes = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const acidentes = await analyticsService.obterUltimosAcidentes(limit);
    res.status(200).json({
        status: 'success',
        data: { acidentes },
    });
});
/**
 * GET /api/analytics/dashboard
 * Obtém dados completos para dashboard admin
 */
export const obterDashboardAdmin = asyncHandler(async (req, res) => {
    const dados = await analyticsService.obterDadosDashboardAdmin();
    res.status(200).json({
        status: 'success',
        data: { dados },
    });
});
/**
 * GET /api/analytics/dashboard/trabalhador
 * Obtém dados resumidos para dashboard do trabalhador
 */
export const obterDashboardTrabalhador = asyncHandler(async (req, res) => {
    const authReq = req;
    const trabalhadorId = authReq.user?.id;
    if (!trabalhadorId) {
        return res.status(401).json({
            status: 'error',
            message: 'Usuário não autenticado',
        });
    }
    const dados = await analyticsService.obterDadosDashboardTrabalhador(trabalhadorId);
    res.status(200).json({
        status: 'success',
        data: { dados },
    });
});
//# sourceMappingURL=analyticsController.js.map