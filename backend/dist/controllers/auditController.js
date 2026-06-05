"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterEstatisticas = exports.obterLogs = void 0;
const AuditService_js_1 = __importDefault(require("../services/AuditService.js"));
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
/**
 * GET /api/audit/logs
 * Listagem de logs com filtros
 */
exports.obterLogs = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, usuarioId, entidade, acao, dataInicio, dataFim } = req.query;
    const result = await AuditService_js_1.default.obterLogs(Number(page), Number(limit), {
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
exports.obterEstatisticas = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const result = await AuditService_js_1.default.obterEstatisticas();
    res.status(200).json({
        status: 'success',
        data: result
    });
});
