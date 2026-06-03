"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterMonitoramento = exports.obterDashboardTrabalhador = exports.obterDashboardAdmin = exports.obterUltimosAcidentes = exports.obterProximasVacinacoes = exports.obterDadosAcidentes = exports.obterKPIs = void 0;
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const AnalyticsService_js_1 = __importDefault(require("../services/AnalyticsService.js"));
/**
 * GET /api/analytics/kpis
 * Obtém KPIs gerais do sistema
 */
exports.obterKPIs = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const kpis = await AnalyticsService_js_1.default.obterKPIs();
    res.status(200).json({
        status: 'success',
        data: { kpis },
    });
});
/**
 * GET /api/analytics/acidentes
 * Obtém dados para gráficos de acidentes
 */
exports.obterDadosAcidentes = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const dados = await AnalyticsService_js_1.default.obterDadosAcidentes();
    res.status(200).json({
        status: 'success',
        data: { dados },
    });
});
/**
 * GET /api/analytics/vacinacoes/proximas
 * Obtém próximas vacinações (vencidas ou próximas de vencer)
 */
exports.obterProximasVacinacoes = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const dias = parseInt(req.query.dias) || 30;
    const vacinacoes = await AnalyticsService_js_1.default.obterProximasVacinacoes(dias);
    res.status(200).json({
        status: 'success',
        data: { vacinacoes },
    });
});
/**
 * GET /api/analytics/acidentes/ultimos
 * Obtém últimos acidentes registrados
 */
exports.obterUltimosAcidentes = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const acidentes = await AnalyticsService_js_1.default.obterUltimosAcidentes(limit);
    res.status(200).json({
        status: 'success',
        data: { acidentes },
    });
});
/**
 * GET /api/analytics/dashboard
 * Obtém dados completos para dashboard admin
 */
exports.obterDashboardAdmin = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const dados = await AnalyticsService_js_1.default.obterDadosDashboardAdmin();
    res.status(200).json({
        status: 'success',
        data: { dados },
    });
});
/**
 * GET /api/analytics/dashboard/trabalhador
 * Obtém dados resumidos para dashboard do trabalhador
 */
exports.obterDashboardTrabalhador = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const authReq = req;
    const trabalhadorId = authReq.user?.id;
    if (!trabalhadorId) {
        return res.status(401).json({
            status: 'error',
            message: 'Usuário não autenticado',
        });
    }
    const dados = await AnalyticsService_js_1.default.obterDadosDashboardTrabalhador(trabalhadorId);
    res.status(200).json({
        status: 'success',
        data: { dados },
    });
});
/**
 * GET /api/analytics/monitoramento
 * Obtém dados de inteligência em saúde e monitoramento clínico
 */
exports.obterMonitoramento = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const monitoramento = await AnalyticsService_js_1.default.obterMonitoramentoClinico();
    res.status(200).json({
        status: 'success',
        data: { monitoramento },
    });
});
