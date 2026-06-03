"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const User_js_1 = __importDefault(require("../models/User.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class UserService {
    async listar(page = 1, limit = 10, filtros) {
        const skip = (page - 1) * limit;
        const query = {};
        if (filtros?.nome) {
            query.nome = { $regex: filtros.nome, $options: 'i' };
        }
        if (filtros?.email) {
            query.email = { $regex: filtros.email, $options: 'i' };
        }
        if (filtros?.cpf) {
            query.cpf = filtros.cpf;
        }
        if (filtros?.perfil) {
            query.perfil = filtros.perfil;
        }
        const total = await User_js_1.default.countDocuments(query);
        const usuarios = await User_js_1.default.find(query)
            .select('-senha') // Nunca retornar a senha
            .populate('empresa', 'razaoSocial')
            .populate('unidade', 'nome')
            .sort({ nome: 1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const pages = Math.ceil(total / limit);
        return {
            usuarios: usuarios,
            total,
            pages,
        };
    }
    async obter(id) {
        const usuario = await User_js_1.default.findById(id).select('-senha').lean();
        if (!usuario) {
            throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
        }
        return usuario;
    }
    async atualizar(id, userData) {
        // Campos que um Admin pode atualizar
        const updateFields = {};
        if (userData.perfil)
            updateFields.perfil = userData.perfil;
        if (userData.ativo !== undefined)
            updateFields.ativo = userData.ativo;
        if (userData.nome)
            updateFields.nome = userData.nome;
        if (userData.email)
            updateFields.email = userData.email;
        if (userData.telefone)
            updateFields.telefone = userData.telefone;
        if (userData.empresa)
            updateFields.empresa = userData.empresa;
        if (userData.unidade)
            updateFields.unidade = userData.unidade;
        const usuario = await User_js_1.default.findByIdAndUpdate(id, { $set: updateFields }, { new: true, runValidators: true }).select('-senha').lean();
        if (!usuario) {
            throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
        }
        return usuario;
    }
    async deletar(id) {
        const usuario = await User_js_1.default.findById(id);
        if (!usuario) {
            throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
        }
        // Não permitir deletar o próprio usuário ou o último admin (opcional, mas seguro)
        await User_js_1.default.findByIdAndDelete(id);
    }
}
exports.UserService = UserService;
exports.default = new UserService();
