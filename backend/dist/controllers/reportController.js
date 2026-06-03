"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarRelatorioDoencas = exports.gerarRelatorioVacinacoes = exports.gerarRelatorioAcidentes = void 0;
const asyncHandler_js_1 = require("../middleware/asyncHandler.js");
const Acidente_js_1 = __importDefault(require("../models/Acidente.js"));
const Doenca_js_1 = __importDefault(require("../models/Doenca.js"));
const Vacinacao_js_1 = __importDefault(require("../models/Vacinacao.js"));
/**
 * Gera relatório em formato JSON (base para PDF/XLS)
 * GET /api/reports/acidentes?format=json
 */
exports.gerarRelatorioAcidentes = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { dataInicio, dataFim, tipoAcidente, status } = req.query;
    const query = {};
    if (dataInicio || dataFim) {
        query.dataAcidente = {};
        if (dataInicio)
            query.dataAcidente.$gte = new Date(dataInicio);
        if (dataFim)
            query.dataAcidente.$lte = new Date(dataFim);
    }
    if (tipoAcidente) {
        query.tipoAcidente = tipoAcidente;
    }
    if (status) {
        query.status = status;
    }
    const acidentes = await Acidente_js_1.default.find(query)
        .populate('trabalhadorId', 'nome cpf email')
        .sort({ dataAcidente: -1 })
        .lean();
    // Formato para exportação
    const dadosExportacao = acidentes.map((ac) => ({
        Data: new Date(ac.dataAcidente).toLocaleDateString('pt-BR'),
        Trabalhador: ac.trabalhadorId?.nome || 'N/A',
        CPF: ac.trabalhadorId?.cpf || 'N/A',
        Tipo: ac.tipoAcidente,
        Descrição: ac.descricao,
        Local: ac.local || 'N/A',
        Status: ac.status || 'N/A',
        Lesões: Array.isArray(ac.lesoes) ? ac.lesoes.join(', ') : 'Nenhuma',
        'Data Registro': new Date(ac.createdAt).toLocaleDateString('pt-BR'),
    }));
    res.json({
        status: 'success',
        data: {
            total: dadosExportacao.length,
            dados: dadosExportacao,
            periodo: {
                inicio: dataInicio || 'Início',
                fim: dataFim || 'Atual',
            },
        },
    });
});
/**
 * Gera relatório de vacinações
 * GET /api/reports/vacinacoes?format=json
 */
exports.gerarRelatorioVacinacoes = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const vacinacoes = await Vacinacao_js_1.default.find()
        .populate('trabalhadorId', 'nome cpf email')
        .sort({ dataVacinacao: -1 })
        .lean();
    const dadosExportacao = vacinacoes.map((vac) => ({
        Trabalhador: vac.trabalhadorId?.nome || 'N/A',
        CPF: vac.trabalhadorId?.cpf || 'N/A',
        Vacina: vac.vacina,
        'Data Vacinação': new Date(vac.dataVacinacao).toLocaleDateString('pt-BR'),
        'Próxima Dose': vac.proximoDose ? new Date(vac.proximoDose).toLocaleDateString('pt-BR') : 'N/A',
        'Unidade Saúde': vac.unidadeSaude || 'N/A',
        Profissional: vac.profissional || 'N/A',
    }));
    res.json({
        status: 'success',
        data: {
            total: dadosExportacao.length,
            dados: dadosExportacao,
        },
    });
});
/**
 * Gera relatório de doenças
 * GET /api/reports/doencas?format=json
 */
exports.gerarRelatorioDoencas = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const doencas = await Doenca_js_1.default.find()
        .populate('trabalhadorId', 'nome cpf email')
        .sort({ dataInicio: -1 })
        .lean();
    const dadosExportacao = doencas.map((doc) => ({
        Trabalhador: doc.trabalhadorId?.nome || 'N/A',
        CPF: doc.trabalhadorId?.cpf || 'N/A',
        Código: doc.codigoDoenca,
        'Nome Doença': doc.nomeDoenca,
        'Data Início': new Date(doc.dataInicio).toLocaleDateString('pt-BR'),
        'Data Fim': doc.dataFim ? new Date(doc.dataFim).toLocaleDateString('pt-BR') : 'Ativa',
        'Relato Clínico': doc.relatoClinico || 'N/A',
        Status: doc.ativo ? 'Ativa' : 'Fechada',
    }));
    res.json({
        status: 'success',
        data: {
            total: dadosExportacao.length,
            dados: dadosExportacao,
        },
    });
});
