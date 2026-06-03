"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const AuditLog_js_1 = __importDefault(require("../models/AuditLog.js"));
class AuditService {
    /**
     * Registra uma ação no audit log
     */
    async registrar(data) {
        try {
            await AuditLog_js_1.default.create(data);
        }
        catch (error) {
            console.error('Erro ao registrar audit log:', error);
            // Não lançar erro para não interromper operação principal
        }
    }
    /**
     * Obtém logs de auditoria com filtros e paginação
     */
    async obterLogs(page = 1, limit = 20, filtros) {
        const skip = (page - 1) * limit;
        const query = {};
        if (filtros?.entidade) {
            query.entidade = filtros.entidade;
        }
        if (filtros?.usuarioId) {
            query.usuarioId = filtros.usuarioId;
        }
        if (filtros?.acao) {
            query.acao = filtros.acao;
        }
        if (filtros?.dataInicio || filtros?.dataFim) {
            query.createdAt = {};
            if (filtros?.dataInicio) {
                query.createdAt.$gte = new Date(filtros.dataInicio);
            }
            if (filtros?.dataFim) {
                query.createdAt.$lte = new Date(filtros.dataFim);
            }
        }
        const total = await AuditLog_js_1.default.countDocuments(query);
        const logs = await AuditLog_js_1.default.find(query)
            .populate('usuarioId', 'nome email perfil')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const pages = Math.ceil(total / limit);
        return {
            logs,
            total,
            pages,
        };
    }
    /**
     * Obtém estatísticas de auditoria
     */
    async obterEstatisticas() {
        const totalLogs = await AuditLog_js_1.default.countDocuments();
        const porAcaoAgg = await AuditLog_js_1.default.aggregate([
            {
                $group: {
                    _id: '$acao',
                    total: { $sum: 1 },
                },
            },
            { $sort: { total: -1 } },
        ]);
        const porEntidadeAgg = await AuditLog_js_1.default.aggregate([
            {
                $group: {
                    _id: '$entidade',
                    total: { $sum: 1 },
                },
            },
            { $sort: { total: -1 } },
        ]);
        const ultimasAtividades = await AuditLog_js_1.default.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        const porAcao = porAcaoAgg.reduce((acc, item) => {
            acc[item._id] = item.total;
            return acc;
        }, {});
        const porEntidade = porEntidadeAgg.reduce((acc, item) => {
            acc[item._id] = item.total;
            return acc;
        }, {});
        return {
            totalLogs,
            porAcao,
            porEntidade,
            ultimasAtividades,
        };
    }
}
exports.AuditService = AuditService;
exports.default = new AuditService();
