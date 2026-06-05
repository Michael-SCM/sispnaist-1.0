"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AtoMunicipalInovacao_js_1 = __importDefault(require("../models/AtoMunicipalInovacao.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const auditLogger_js_1 = require("../utils/auditLogger.js");
class AtoMunicipalInovacaoController {
    async listar(req, res, next) {
        try {
            const { page = 1, limit = 10, cidade, ano } = req.query;
            const filter = { ativo: true };
            if (cidade)
                filter.nm_cidade = new RegExp(String(cidade), 'i');
            if (ano)
                filter.ano_ato = Number(ano);
            const items = await AtoMunicipalInovacao_js_1.default.find(filter)
                .sort({ ano_ato: -1, nr_ato: -1 })
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit));
            const total = await AtoMunicipalInovacao_js_1.default.countDocuments(filter);
            return res.status(200).json({
                items,
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            });
        }
        catch (error) {
            next(error);
        }
    }
    async obter(req, res, next) {
        try {
            const item = await AtoMunicipalInovacao_js_1.default.findById(req.params.id)
                .populate('papeisModoGovernanca');
            if (!item) {
                throw new errorHandler_js_1.AppError('Ato Municipal não encontrado', 404);
            }
            return res.status(200).json(item);
        }
        catch (error) {
            next(error);
        }
    }
    async criar(req, res, next) {
        try {
            const novoItem = await AtoMunicipalInovacao_js_1.default.create(req.body);
            await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'AtoMunicipalInovacao', novoItem._id.toString(), novoItem);
            return res.status(201).json(novoItem);
        }
        catch (error) {
            if (error.code === 11000) {
                return next(new errorHandler_js_1.AppError('Já existe um ato cadastrado com este número e ano.', 400));
            }
            next(error);
        }
    }
    async atualizar(req, res, next) {
        try {
            const oldItem = await AtoMunicipalInovacao_js_1.default.findById(req.params.id);
            if (!oldItem) {
                throw new errorHandler_js_1.AppError('Ato Municipal não encontrado', 404);
            }
            const item = await AtoMunicipalInovacao_js_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            const mudancas = (0, auditLogger_js_1.compararDados)(oldItem, item);
            await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'AtoMunicipalInovacao', item._id.toString(), mudancas);
            return res.status(200).json(item);
        }
        catch (error) {
            next(error);
        }
    }
    async deletar(req, res, next) {
        try {
            const oldItem = await AtoMunicipalInovacao_js_1.default.findById(req.params.id);
            if (!oldItem) {
                throw new errorHandler_js_1.AppError('Ato Municipal não encontrado', 404);
            }
            const item = await AtoMunicipalInovacao_js_1.default.findByIdAndUpdate(req.params.id, { ativo: false }, { new: true });
            await (0, auditLogger_js_1.logAction)(req, 'DELETE', 'AtoMunicipalInovacao', item._id.toString(), oldItem);
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new AtoMunicipalInovacaoController();
