"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterEstatisticas = exports.obterVacinacoesPorTrabalhador = exports.deletarVacinacao = exports.atualizarVacinacao = exports.listarVacinacoes = exports.obterVacinacao = exports.criarVacinacao = void 0;
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const VacinacaoService_js_1 = __importDefault(require("../services/VacinacaoService.js"));
const Trabalhador_js_1 = __importDefault(require("../models/Trabalhador.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const auditLogger_js_1 = require("../utils/auditLogger.js");
exports.criarVacinacao = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new errorHandler_js_1.AppError('Sem permissão para criar registros de vacinação', 403);
    }
    const vacinacao = await VacinacaoService_js_1.default.criar(req.body);
    await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'Vacinacao', vacinacao._id.toString(), vacinacao);
    res.status(201).json({
        status: 'success',
        data: { vacinacao },
    });
});
exports.obterVacinacao = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const vacinacao = await VacinacaoService_js_1.default.obter(req.params.id);
    if (!vacinacao) {
        throw new errorHandler_js_1.AppError('Vacinação não encontrada', 404);
    }
    // Se o usuário logado for trabalhador, só pode visualizar se for dele
    if (req.user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador_js_1.default.findOne({ cpf: req.user.cpf });
        const recordTrabalhadorId = (vacinacao.trabalhadorId && vacinacao.trabalhadorId._id)
            ? vacinacao.trabalhadorId._id.toString()
            : vacinacao.trabalhadorId.toString();
        if (!trabalhador || recordTrabalhadorId !== trabalhador._id.toString()) {
            throw new errorHandler_js_1.AppError('Sem permissão para acessar os dados desta vacinação', 403);
        }
    }
    res.status(200).json({
        status: 'success',
        data: { vacinacao },
    });
});
exports.listarVacinacoes = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { page, limit, vacina, trabalhadorId } = req.query;
    let targetTrabalhadorId = trabalhadorId;
    // Se o usuário logado for trabalhador, força o filtro por seu próprio ID de trabalhador
    if (req.user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador_js_1.default.findOne({ cpf: req.user.cpf });
        targetTrabalhadorId = trabalhador ? trabalhador._id.toString() : '000000000000000000000000';
    }
    // Normaliza CPF recebido no filtro: remove máscara (.,-) se vier mascarado
    // (o service tenta resolver CPF -> ObjectId)
    if (typeof targetTrabalhadorId === 'string' && targetTrabalhadorId.trim()) {
        // Se o filtro parece CPF mascarado, remove caracteres não numéricos
        if (targetTrabalhadorId.includes('.') || targetTrabalhadorId.includes('-')) {
            targetTrabalhadorId = targetTrabalhadorId.replace(/\D/g, '');
            // Reaplica máscara esperada no banco: XXX.XXX.XXX-XX
            if (targetTrabalhadorId.length === 11) {
                targetTrabalhadorId = `${targetTrabalhadorId.slice(0, 3)}.${targetTrabalhadorId.slice(3, 6)}.${targetTrabalhadorId.slice(6, 9)}-${targetTrabalhadorId.slice(9, 11)}`;
            }
        }
    }
    const result = await VacinacaoService_js_1.default.listar({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        vacina: vacina,
        trabalhadorId: targetTrabalhadorId,
    });
    res.status(200).json({
        status: 'success',
        data: result,
    });
});
exports.atualizarVacinacao = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new errorHandler_js_1.AppError('Sem permissão para atualizar registros de vacinação', 403);
    }
    const vacinacaoAntiga = await VacinacaoService_js_1.default.obter(req.params.id);
    const vacinacao = await VacinacaoService_js_1.default.atualizar(req.params.id, req.body);
    const mudancas = (0, auditLogger_js_1.compararDados)(vacinacaoAntiga, vacinacao);
    await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'Vacinacao', req.params.id, mudancas);
    res.status(200).json({
        status: 'success',
        data: { vacinacao },
    });
});
exports.deletarVacinacao = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new errorHandler_js_1.AppError('Sem permissão para deletar registros de vacinação', 403);
    }
    const vacinacaoAntiga = await VacinacaoService_js_1.default.obter(req.params.id);
    await VacinacaoService_js_1.default.deletar(req.params.id);
    await (0, auditLogger_js_1.logAction)(req, 'DELETE', 'Vacinacao', req.params.id, vacinacaoAntiga);
    res.status(204).send();
});
exports.obterVacinacoesPorTrabalhador = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { trabalhadorId } = req.params;
    // Se o usuário logado for trabalhador, ele só pode acessar seus próprios dados
    if (req.user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador_js_1.default.findOne({ cpf: req.user.cpf });
        if (!trabalhador || trabalhador._id.toString() !== trabalhadorId) {
            throw new errorHandler_js_1.AppError('Sem permissão para acessar estes dados', 403);
        }
    }
    const vacinacoes = await VacinacaoService_js_1.default.obterPorTrabalhador(trabalhadorId);
    res.status(200).json({
        status: 'success',
        data: { vacinacoes },
    });
});
exports.obterEstatisticas = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new errorHandler_js_1.AppError('Sem permissão para acessar estatísticas gerais', 403);
    }
    const estatisticas = await VacinacaoService_js_1.default.obterEstatisticas();
    res.status(200).json({
        status: 'success',
        data: estatisticas,
    });
});
