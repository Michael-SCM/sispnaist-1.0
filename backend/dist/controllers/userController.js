"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = void 0;
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const UserService_js_1 = __importDefault(require("../services/UserService.js"));
const auditLogger_js_1 = require("../utils/auditLogger.js");
/**
 * @desc    Listar usuários com paginação e filtros
 * @route   GET /api/usuarios
 * @access  Private/Admin
 */
exports.getUsers = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filtros = {
        nome: req.query.nome,
        email: req.query.email,
        cpf: req.query.cpf,
        perfil: req.query.perfil,
    };
    const result = await UserService_js_1.default.listar(page, limit, filtros);
    res.status(200).json({
        status: 'success',
        ...result,
    });
});
/**
 * @desc    Obter um único usuário
 * @route   GET /api/usuarios/:id
 * @access  Private/Admin
 */
exports.getUser = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const usuario = await UserService_js_1.default.obter(id);
    res.status(200).json({
        status: 'success',
        data: { usuario },
    });
});
/**
 * @desc    Atualizar usuário (perfil/status)
 * @route   PUT /api/usuarios/:id
 * @access  Private/Admin
 */
exports.updateUser = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const usuarioAntigo = await UserService_js_1.default.obter(id);
    const usuario = await UserService_js_1.default.atualizar(id, req.body);
    const mudancas = (0, auditLogger_js_1.compararDados)(usuarioAntigo, usuario);
    await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'User', id, mudancas);
    res.status(200).json({
        status: 'success',
        data: { usuario },
    });
});
/**
 * @desc    Deletar usuário
 * @route   DELETE /api/usuarios/:id
 * @access  Private/Admin
 */
exports.deleteUser = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const usuarioAntigo = await UserService_js_1.default.obter(id);
    await UserService_js_1.default.deletar(id);
    await (0, auditLogger_js_1.logAction)(req, 'DELETE', 'User', id, usuarioAntigo);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
