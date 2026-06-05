"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterEstatisticas = exports.obterPorTrabalhador = exports.deletar = exports.atualizar = exports.listar = exports.obter = exports.criar = void 0;
const DoencaService_js_1 = __importDefault(require("../services/DoencaService.js"));
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const Trabalhador_js_1 = __importDefault(require("../models/Trabalhador.js"));
const auditLogger_js_1 = require("../utils/auditLogger.js");
exports.criar = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new errorHandler_js_1.AppError('Sem permissão para criar registros de doenças', 403);
    }
    const doencaData = {
        ...req.body,
        trabalhadorId: req.body.trabalhadorId,
    };
    const doenca = await DoencaService_js_1.default.criar(doencaData);
    await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'Doenca', doenca._id.toString(), doenca);
    res.status(201).json({ sucesso: true, dados: doenca });
});
exports.obter = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const doenca = await DoencaService_js_1.default.obter(id);
    if (!doenca) {
        throw new errorHandler_js_1.AppError('Doença não encontrada', 404);
    }
    // Se o usuário logado for trabalhador, só pode visualizar se for dele
    if (req.user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador_js_1.default.findOne({ cpf: req.user.cpf });
        const recordTrabalhadorId = (doenca.trabalhadorId && doenca.trabalhadorId._id)
            ? doenca.trabalhadorId._id.toString()
            : doenca.trabalhadorId.toString();
        if (!trabalhador || recordTrabalhadorId !== trabalhador._id.toString()) {
            throw new errorHandler_js_1.AppError('Sem permissão para acessar os dados desta doença', 403);
        }
    }
    res.status(200).json({ sucesso: true, dados: doenca });
});
exports.listar = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filtros = {
        nomeDoenca: req.query.nomeDoenca,
        ativo: req.query.ativo ? req.query.ativo === 'true' : undefined,
        // Tratar trabalhadorId de filtro: pode vir CPF (mascarado ou apenas dígitos)
        // Não deixar passar por validação de ObjectId.
        trabalhadorId: req.query.trabalhadorId,
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim,
    };
    // Normaliza CPF de filtro (remove máscara) para evitar erros de validação
    if (typeof filtros.trabalhadorId === 'string' && filtros.trabalhadorId.trim()) {
        filtros.trabalhadorId = filtros.trabalhadorId.replace(/\D/g, '');
    }
    // Se o usuário logado for trabalhador, força o filtro por seu próprio ID de trabalhador
    if (req.user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador_js_1.default.findOne({ cpf: req.user.cpf });
        filtros.trabalhadorId = trabalhador ? trabalhador._id.toString() : '000000000000000000000000';
    }
    // Remover filtros undefined
    Object.keys(filtros).forEach((key) => {
        if (filtros[key] === undefined) {
            delete filtros[key];
        }
    });
    const { doencas, total, pages } = await DoencaService_js_1.default.listar(page, limit, filtros);
    res.status(200).json({
        sucesso: true,
        dados: doencas,
        paginacao: { page, limit, total, pages },
    });
});
exports.atualizar = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new errorHandler_js_1.AppError('Sem permissão para atualizar registros de doenças', 403);
    }
    const { id } = req.params;
    const doencaAntiga = await DoencaService_js_1.default.obter(id);
    if (!doencaAntiga) {
        throw new errorHandler_js_1.AppError('Doença não encontrada', 404);
    }
    const doenca = await DoencaService_js_1.default.atualizar(id, req.body);
    const mudancas = (0, auditLogger_js_1.compararDados)(doencaAntiga, doenca);
    await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'Doenca', id, mudancas);
    res.status(200).json({ sucesso: true, dados: doenca });
});
exports.deletar = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new errorHandler_js_1.AppError('Sem permissão para deletar registros de doenças', 403);
    }
    const { id } = req.params;
    const doencaAntiga = await DoencaService_js_1.default.obter(id);
    if (!doencaAntiga) {
        throw new errorHandler_js_1.AppError('Doença não encontrada', 404);
    }
    await DoencaService_js_1.default.deletar(id);
    await (0, auditLogger_js_1.logAction)(req, 'DELETE', 'Doenca', id, doencaAntiga);
    res.status(200).json({ sucesso: true, mensagem: 'Doença deletada com sucesso' });
});
exports.obterPorTrabalhador = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { trabalhadorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // Se o usuário logado for trabalhador, ele só pode acessar seus próprios dados
    if (req.user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador_js_1.default.findOne({ cpf: req.user.cpf });
        if (!trabalhador || trabalhador._id.toString() !== trabalhadorId) {
            throw new errorHandler_js_1.AppError('Sem permissão para acessar estes dados', 403);
        }
    }
    const { doencas, total, pages } = await DoencaService_js_1.default.obterPorTrabalhador(trabalhadorId, page, limit);
    res.status(200).json({
        sucesso: true,
        dados: doencas,
        paginacao: { page, limit, total, pages },
    });
});
exports.obterEstatisticas = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new errorHandler_js_1.AppError('Sem permissão para acessar estatísticas gerais', 403);
    }
    const stats = await DoencaService_js_1.default.obterEstatisticas();
    res.status(200).json({ sucesso: true, dados: stats });
});
