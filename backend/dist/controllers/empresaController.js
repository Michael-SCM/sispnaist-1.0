"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmpresaPorUnidade = exports.deleteEmpresa = exports.updateEmpresa = exports.createEmpresa = exports.getEmpresa = exports.getEmpresas = void 0;
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const EmpresaService_js_1 = __importDefault(require("../services/EmpresaService.js"));
const auditLogger_js_1 = require("../utils/auditLogger.js");
/**
 * @desc    Listar empresas com paginação e filtros
 * @route   GET /api/empresas
 * @access  Private/Admin
 */
exports.getEmpresas = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filtros = {
        razaoSocial: req.query.razaoSocial,
        cnpj: req.query.cnpj,
    };
    const result = await EmpresaService_js_1.default.listar(page, limit, filtros);
    res.status(200).json({
        status: 'success',
        ...result,
    });
});
/**
 * @desc    Obter uma única empresa
 * @route   GET /api/empresas/:id
 * @access  Private/Admin
 */
exports.getEmpresa = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const empresa = await EmpresaService_js_1.default.obter(id);
    res.status(200).json({
        status: 'success',
        data: { empresa },
    });
});
/**
 * @desc    Criar nova empresa
 * @route   POST /api/empresas
 * @access  Private/Admin
 */
exports.createEmpresa = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const empresa = await EmpresaService_js_1.default.criar(req.body);
    await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'Empresa', empresa._id.toString(), empresa);
    res.status(201).json({
        status: 'success',
        data: { empresa },
    });
});
/**
 * @desc    Atualizar empresa
 * @route   PUT /api/empresas/:id
 * @access  Private/Admin
 */
exports.updateEmpresa = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const empresaAntiga = await EmpresaService_js_1.default.obter(id);
    const empresa = await EmpresaService_js_1.default.atualizar(id, req.body);
    const mudancas = (0, auditLogger_js_1.compararDados)(empresaAntiga, empresa);
    await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'Empresa', id, mudancas);
    res.status(200).json({
        status: 'success',
        data: { empresa },
    });
});
/**
 * @desc    Deletar empresa
 * @route   DELETE /api/empresas/:id
 * @access  Private/Admin
 */
exports.deleteEmpresa = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const empresaAntiga = await EmpresaService_js_1.default.obter(id);
    await EmpresaService_js_1.default.deletar(id);
    await (0, auditLogger_js_1.logAction)(req, 'DELETE', 'Empresa', id, empresaAntiga);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
/**
 * @desc    Buscar empresa vinculada a uma unidade
 * @route   GET /api/empresas/unidade/:unidadeId
 * @access  Private
 */
exports.getEmpresaPorUnidade = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { unidadeId } = req.params;
    const empresa = await EmpresaService_js_1.default.listarPorUnidade(unidadeId);
    res.status(200).json({
        status: 'success',
        data: { empresa },
    });
});
