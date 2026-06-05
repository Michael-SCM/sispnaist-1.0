"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletar = exports.atualizar = exports.listar = exports.obterPorAcidente = exports.obter = exports.criar = void 0;
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const MaterialBiologicoService_js_1 = __importDefault(require("../services/MaterialBiologicoService.js"));
const auditLogger_js_1 = require("../utils/auditLogger.js");
exports.criar = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const ficha = await MaterialBiologicoService_js_1.default.criar(req.body);
    await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'MaterialBiologico', ficha._id.toString(), ficha);
    res.status(201).json({
        status: 'success',
        data: { ficha },
    });
});
exports.obter = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const ficha = await MaterialBiologicoService_js_1.default.obter(id);
    res.status(200).json({
        status: 'success',
        data: { ficha },
    });
});
exports.obterPorAcidente = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { acidenteId } = req.params;
    const ficha = await MaterialBiologicoService_js_1.default.obterPorAcidente(acidenteId);
    res.status(200).json({
        status: 'success',
        data: { ficha },
    });
});
exports.listar = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filtros = {
        tipoExposicao: req.query.tipoExposicao,
        agente: req.query.agente,
    };
    const { fichas, total, pages } = await MaterialBiologicoService_js_1.default.listar(page, limit, filtros);
    res.status(200).json({
        status: 'success',
        data: {
            fichas,
            paginacao: { page, limit, total, pages },
        },
    });
});
exports.atualizar = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const fichaAntiga = await MaterialBiologicoService_js_1.default.obter(id);
    const ficha = await MaterialBiologicoService_js_1.default.atualizar(id, req.body);
    const mudancas = (0, auditLogger_js_1.compararDados)(fichaAntiga, ficha);
    await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'MaterialBiologico', id, mudancas);
    res.status(200).json({
        status: 'success',
        data: { ficha },
    });
});
exports.deletar = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const fichaAntiga = await MaterialBiologicoService_js_1.default.obter(id);
    await MaterialBiologicoService_js_1.default.deletar(id);
    await (0, auditLogger_js_1.logAction)(req, 'DELETE', 'MaterialBiologico', id, fichaAntiga);
    res.status(204).send();
});
