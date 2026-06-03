"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnidadesPorEmpresa = exports.deleteUnidade = exports.updateUnidade = exports.createUnidade = exports.getUnidade = exports.getUnidades = void 0;
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const UnidadeService_js_1 = __importDefault(require("../services/UnidadeService.js"));
const auditLogger_js_1 = require("../utils/auditLogger.js");
/**
 * @desc    Listar unidades com paginação e filtros
 * @route   GET /api/unidades
 * @access  Private/Admin
 */
exports.getUnidades = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filtros = {
        nome: req.query.nome,
        empresaId: req.query.empresaId,
    };
    const result = await UnidadeService_js_1.default.listar(page, limit, filtros);
    res.status(200).json({
        status: 'success',
        ...result,
    });
});
/**
 * @desc    Obter uma única unidade
 * @route   GET /api/unidades/:id
 * @access  Private/Admin
 */
exports.getUnidade = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const unidade = await UnidadeService_js_1.default.obter(id);
    res.status(200).json({
        status: 'success',
        data: { unidade },
    });
});
/**
 * @desc    Criar nova unidade
 * @route   POST /api/unidades
 * @access  Private/Admin
 */
exports.createUnidade = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const unidade = await UnidadeService_js_1.default.criar(req.body);
    await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'Unidade', unidade._id.toString(), unidade);
    res.status(201).json({
        status: 'success',
        data: { unidade },
    });
});
/**
 * @desc    Atualizar unidade
 * @route   PUT /api/unidades/:id
 * @access  Private/Admin
 */
exports.updateUnidade = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const unidadeAntiga = await UnidadeService_js_1.default.obter(id);
    const unidadeNova = await UnidadeService_js_1.default.atualizar(id, req.body);
    const mudancas = (0, auditLogger_js_1.compararDados)(unidadeAntiga, unidadeNova);
    await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'Unidade', id, mudancas);
    res.status(200).json({
        status: 'success',
        data: { unidade: unidadeNova },
    });
});
/**
 * @desc    Deletar unidade
 * @route   DELETE /api/unidades/:id
 * @access  Private/Admin
 */
exports.deleteUnidade = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const unidade = await UnidadeService_js_1.default.obter(id);
    await (0, auditLogger_js_1.logAction)(req, 'DELETE', 'Unidade', id, unidade);
    await UnidadeService_js_1.default.deletar(id);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
/**
 * @desc    Listar unidades por empresa
 * @route   GET /api/unidades/empresa/:empresaId
 * @access  Private
 */
exports.getUnidadesPorEmpresa = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { empresaId } = req.params;
    const unidades = await UnidadeService_js_1.default.listarPorEmpresa(empresaId);
    res.status(200).json({
        status: 'success',
        data: { unidades },
    });
});
