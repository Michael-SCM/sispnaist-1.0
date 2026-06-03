"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTrabalhador = exports.updateTrabalhador = exports.createTrabalhador = exports.getTrabalhadorCompleto = exports.getTrabalhador = exports.getTrabalhadores = void 0;
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const TrabalhadorService_js_1 = __importDefault(require("../services/TrabalhadorService.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const auditLogger_js_1 = require("../utils/auditLogger.js");
/**
 * @desc    Listar trabalhadores com paginação e filtros
 * @route   GET /api/trabalhadores
 * @access  Private
 */
exports.getTrabalhadores = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filtros = {
        nome: req.query.nome,
        cpf: req.query.cpf,
        matricula: req.query.matricula,
        setor: req.query.setor,
    };
    // Se o usuário logado for trabalhador, força o filtro por seu próprio CPF
    if (req.user?.perfil === 'trabalhador') {
        filtros.cpf = req.user.cpf;
    }
    const result = await TrabalhadorService_js_1.default.listar(page, limit, filtros);
    res.status(200).json({
        status: 'success',
        ...result,
    });
});
/**
 * @desc    Obter um único trabalhador
 * @route   GET /api/trabalhadores/:id
 * @access  Private
 */
exports.getTrabalhador = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const trabalhador = await TrabalhadorService_js_1.default.obter(id);
    if (!trabalhador) {
        throw new errorHandler_js_1.AppError('Trabalhador não encontrado', 404);
    }
    // Se o usuário logado for trabalhador, ele só pode acessar seu próprio perfil (CPF correspondente)
    if (req.user?.perfil === 'trabalhador' && trabalhador.cpf !== req.user.cpf) {
        throw new errorHandler_js_1.AppError('Sem permissão para acessar os dados deste trabalhador', 403);
    }
    res.status(200).json({
        status: 'success',
        data: { trabalhador },
    });
});
/**
 * @desc    Obter um único trabalhador com todos os submódulos
 * @route   GET /api/trabalhadores/:id/completo
 * @access  Private
 */
exports.getTrabalhadorCompleto = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const trabalhador = await TrabalhadorService_js_1.default.obterComSubmodulos(id);
    if (!trabalhador) {
        throw new errorHandler_js_1.AppError('Trabalhador não encontrado', 404);
    }
    // Se o usuário logado for trabalhador, ele só pode acessar seu próprio perfil (CPF correspondente)
    if (req.user?.perfil === 'trabalhador' && trabalhador.cpf !== req.user.cpf) {
        throw new errorHandler_js_1.AppError('Sem permissão para acessar os dados deste trabalhador', 403);
    }
    res.status(200).json({
        status: 'success',
        data: { trabalhador },
    });
});
/**
 * @desc    Criar novo trabalhador
 * @route   POST /api/trabalhadores
 * @access  Private/Admin/Saude
 */
exports.createTrabalhador = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    // Trabalhadores não podem cadastrar nenhum perfil
    if (req.user?.perfil === 'trabalhador') {
        throw new errorHandler_js_1.AppError('Sem permissão para cadastrar trabalhadores', 403);
    }
    try {
        const trabalhador = await TrabalhadorService_js_1.default.criar(req.body);
        await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'Trabalhador', trabalhador._id.toString(), trabalhador);
        res.status(201).json({
            status: 'success',
            data: { trabalhador },
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            error.receivedBody = req.body;
        }
        throw error;
    }
});
/**
 * @desc    Atualizar trabalhador
 * @route   PUT /api/trabalhadores/:id
 * @access  Private/Admin/Saude
 */
exports.updateTrabalhador = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    // Trabalhadores não podem atualizar nenhum perfil (apenas leitura de seus próprios dados)
    if (req.user?.perfil === 'trabalhador') {
        throw new errorHandler_js_1.AppError('Sem permissão para atualizar dados de trabalhadores', 403);
    }
    const { id } = req.params;
    const trabalhadorAntigo = await TrabalhadorService_js_1.default.obter(id);
    const trabalhadorNovo = await TrabalhadorService_js_1.default.atualizar(id, req.body);
    const mudancas = (0, auditLogger_js_1.compararDados)(trabalhadorAntigo, trabalhadorNovo);
    await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'Trabalhador', id, mudancas);
    res.status(200).json({
        status: 'success',
        data: { trabalhador: trabalhadorNovo },
    });
});
/**
 * @desc    Deletar trabalhador
 * @route   DELETE /api/trabalhadores/:id
 * @access  Private/Admin
 */
exports.deleteTrabalhador = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new errorHandler_js_1.AppError('Sem permissão para deletar trabalhadores', 403);
    }
    const { id } = req.params;
    const trabalhador = await TrabalhadorService_js_1.default.obter(id);
    await (0, auditLogger_js_1.logAction)(req, 'DELETE', 'Trabalhador', id, trabalhador);
    await TrabalhadorService_js_1.default.deletar(id);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
