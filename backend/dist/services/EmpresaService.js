"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaService = void 0;
const Empresa_js_1 = __importDefault(require("../models/Empresa.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const Unidade_js_1 = __importDefault(require("../models/Unidade.js"));
class EmpresaService {
    async listar(page = 1, limit = 10, filtros) {
        const skip = (page - 1) * limit;
        const query = {};
        if (filtros?.razaoSocial) {
            query.razaoSocial = { $regex: filtros.razaoSocial, $options: 'i' };
        }
        if (filtros?.cnpj) {
            query.cnpj = filtros.cnpj;
        }
        const total = await Empresa_js_1.default.countDocuments(query);
        const empresas = await Empresa_js_1.default.find(query)
            .sort({ razaoSocial: 1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const pages = Math.ceil(total / limit);
        return {
            empresas: empresas,
            total,
            pages,
        };
    }
    async obter(id) {
        const empresa = await Empresa_js_1.default.findById(id).lean();
        if (!empresa) {
            throw new errorHandler_js_1.AppError('Empresa não encontrada', 404);
        }
        return empresa;
    }
    async criar(empresaData) {
        const existeCnpj = await Empresa_js_1.default.findOne({ cnpj: empresaData.cnpj });
        if (existeCnpj) {
            throw new errorHandler_js_1.AppError('Já existe uma empresa cadastrada com este CNPJ', 400);
        }
        const empresa = new Empresa_js_1.default(empresaData);
        await empresa.save();
        return { ...empresa.toObject(), _id: empresa._id?.toString() };
    }
    async atualizar(id, empresaData) {
        if (empresaData.cnpj) {
            const existeCnpj = await Empresa_js_1.default.findOne({
                cnpj: empresaData.cnpj,
                _id: { $ne: id }
            });
            if (existeCnpj) {
                throw new errorHandler_js_1.AppError('CNPJ já está em uso por outra empresa', 400);
            }
        }
        const empresa = await Empresa_js_1.default.findByIdAndUpdate(id, { $set: empresaData }, { new: true, runValidators: true }).lean();
        if (!empresa) {
            throw new errorHandler_js_1.AppError('Empresa não encontrada', 404);
        }
        return empresa;
    }
    async deletar(id) {
        const result = await Empresa_js_1.default.findByIdAndDelete(id);
        if (!result) {
            throw new errorHandler_js_1.AppError('Empresa não encontrada', 404);
        }
        // Remover em cascata todas as unidades vinculadas a esta empresa
        await Unidade_js_1.default.deleteMany({ empresaId: id });
    }
    async listarPorUnidade(unidadeId) {
        // Busca a unidade para encontrar qual empresa ela pertence
        const unidade = await Unidade_js_1.default.findById(unidadeId).lean();
        if (!unidade) {
            throw new errorHandler_js_1.AppError('Unidade não encontrada', 404);
        }
        // Busca a empresa vinculada à unidade
        const empresa = await Empresa_js_1.default.findById(unidade.empresaId).lean();
        if (!empresa) {
            throw new errorHandler_js_1.AppError('Empresa não encontrada', 404);
        }
        return empresa;
    }
}
exports.EmpresaService = EmpresaService;
exports.default = new EmpresaService();
