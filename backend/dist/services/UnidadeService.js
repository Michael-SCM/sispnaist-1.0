"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnidadeService = void 0;
const Unidade_js_1 = __importDefault(require("../models/Unidade.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class UnidadeService {
    async listar(page = 1, limit = 10, filtros) {
        const skip = (page - 1) * limit;
        const query = {};
        if (filtros?.nome) {
            query.nome = { $regex: filtros.nome, $options: 'i' };
        }
        if (filtros?.empresaId) {
            query.empresaId = filtros.empresaId;
        }
        const total = await Unidade_js_1.default.countDocuments(query);
        const unidades = await Unidade_js_1.default.find(query)
            .populate('empresaId', 'razaoSocial nomeFantasia')
            .sort({ nome: 1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const pages = Math.ceil(total / limit);
        return {
            unidades: unidades,
            total,
            pages,
        };
    }
    async obter(id) {
        const unidade = await Unidade_js_1.default.findById(id)
            .populate('empresaId', 'razaoSocial nomeFantasia')
            .lean();
        if (!unidade) {
            throw new errorHandler_js_1.AppError('Unidade não encontrada', 404);
        }
        return unidade;
    }
    async criar(unidadeData) {
        const unidade = new Unidade_js_1.default(unidadeData);
        await unidade.save();
        // Popular para retornar completo
        const populada = await Unidade_js_1.default.findById(unidade._id)
            .populate('empresaId', 'razaoSocial nomeFantasia')
            .lean();
        return populada;
    }
    async atualizar(id, unidadeData) {
        const unidade = await Unidade_js_1.default.findByIdAndUpdate(id, { $set: unidadeData }, { new: true, runValidators: true }).populate('empresaId', 'razaoSocial nomeFantasia').lean();
        if (!unidade) {
            throw new errorHandler_js_1.AppError('Unidade não encontrada', 404);
        }
        return unidade;
    }
    async deletar(id) {
        const result = await Unidade_js_1.default.findByIdAndDelete(id);
        if (!result) {
            throw new errorHandler_js_1.AppError('Unidade não encontrada', 404);
        }
    }
    async listarPorEmpresa(empresaId) {
        const unidades = await Unidade_js_1.default.find({ empresaId, ativa: true })
            .sort({ nome: 1 })
            .lean();
        return unidades;
    }
}
exports.UnidadeService = UnidadeService;
exports.default = new UnidadeService();
