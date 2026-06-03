"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Acidente_js_1 = __importDefault(require("../models/Acidente.js"));
const Trabalhador_js_1 = __importDefault(require("../models/Trabalhador.js"));
const MaterialBiologico_js_1 = __importDefault(require("../models/MaterialBiologico.js"));
const json2csv_1 = require("json2csv");
const PdfService_js_1 = __importDefault(require("../services/PdfService.js"));
const AnalyticsService_js_1 = __importDefault(require("../services/AnalyticsService.js"));
class ExportController {
    async exportarAcidentesCSV(req, res, next) {
        try {
            const acidentes = await Acidente_js_1.default.find()
                .populate('trabalhadorId', 'nome cpf')
                .lean();
            const fields = [
                { label: 'ID', value: '_id' },
                { label: 'Trabalhador', value: 'trabalhadorId.nome' },
                { label: 'CPF', value: 'trabalhadorId.cpf' },
                { label: 'Data', value: 'dataAcidente' },
                { label: 'Tipo', value: 'tipoAcidente' },
                { label: 'Status', value: 'status' }
            ];
            const json2csv = new json2csv_1.Parser({ fields });
            const csv = json2csv.parse(acidentes);
            res.header('Content-Type', 'text/csv');
            res.attachment('acidentes_sispnaist.csv');
            return res.send(csv);
        }
        catch (error) {
            next(error);
        }
    }
    async exportarTrabalhadoresCSV(req, res, next) {
        try {
            const trabalhadores = await Trabalhador_js_1.default.find().lean();
            const fields = ['nome', 'cpf', 'email', 'dataNascimento', 'sexo', 'empresa', 'unidade'];
            const json2csv = new json2csv_1.Parser({ fields });
            const csv = json2csv.parse(trabalhadores);
            res.header('Content-Type', 'text/csv');
            res.attachment('trabalhadores_sispnaist.csv');
            return res.send(csv);
        }
        catch (error) {
            next(error);
        }
    }
    async exportarMaterialBiologicoCSV(req, res, next) {
        try {
            const fichas = await MaterialBiologico_js_1.default.find()
                .populate({
                path: 'acidenteId',
                populate: { path: 'trabalhadorId', select: 'nome cpf' }
            })
                .lean();
            const fields = [
                { label: 'Trabalhador', value: 'acidenteId.trabalhadorId.nome' },
                { label: 'CPF', value: 'acidenteId.trabalhadorId.cpf' },
                { label: 'Data Acidente', value: 'acidenteId.dataAcidente' },
                { label: 'Tipo Exposição', value: 'tipoExposicao' },
                { label: 'Material Orgânico', value: 'materialOrganico' },
                { label: 'Agente', value: 'agente' },
                { label: 'Sorologia Paciente', value: 'sorologiaPaciente' },
                { label: 'Sorologia Acidentado', value: 'sorologiaAcidentado' },
                { label: 'Data Reavaliação', value: 'dataReavaliacao' }
            ];
            const json2csv = new json2csv_1.Parser({ fields });
            const csv = json2csv.parse(fichas);
            res.header('Content-Type', 'text/csv');
            res.attachment('material_biologico_sispnaist.csv');
            return res.send(csv);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Exporta trabalhadores em formato PDF corporativo
     * Usa streaming direto para res para não estourar memória
     */
    async exportarTrabalhadoresPDF(req, res, next) {
        try {
            // Extrair filtros da query string
            const filtros = {};
            if (req.query.nome)
                filtros.nome = { $regex: req.query.nome, $options: 'i' };
            if (req.query.cpf)
                filtros.cpf = req.query.cpf;
            if (req.query.matricula)
                filtros.matricula = req.query.matricula;
            if (req.query.setor)
                filtros['trabalho.setor'] = { $regex: req.query.setor, $options: 'i' };
            await PdfService_js_1.default.gerarPdfTrabalhadores(res, filtros);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Exporta acidentes em formato PDF corporativo
     */
    async exportarAcidentesPDF(req, res, next) {
        try {
            const filtros = {};
            if (req.query.status)
                filtros.status = req.query.status;
            if (req.query.tipo)
                filtros.tipoAcidente = { $regex: req.query.tipo, $options: 'i' };
            await PdfService_js_1.default.gerarPdfAcidentes(res, filtros);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Exporta doenças em formato PDF corporativo
     */
    async exportarDoencasPDF(req, res, next) {
        try {
            const filtros = {};
            if (req.query.ativo !== undefined)
                filtros.ativo = req.query.ativo === 'true';
            await PdfService_js_1.default.gerarPdfDoencas(res, filtros);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Exporta vacinações em formato PDF corporativo
     */
    async exportarVacinacoesPDF(req, res, next) {
        try {
            await PdfService_js_1.default.gerarPdfVacinacoes(res, {});
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Exporta monitoramento clínico em formato PDF corporativo
     */
    async exportarMonitoramentoPDF(req, res, next) {
        try {
            const monitoramento = await AnalyticsService_js_1.default.obterMonitoramentoClinico();
            await PdfService_js_1.default.gerarPdfMonitoramento(res, monitoramento);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ExportController();
