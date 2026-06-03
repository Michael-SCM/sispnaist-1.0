"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Parametro_1 = __importDefault(require("../models/Parametro"));
const errorHandler_1 = require("../middleware/errorHandler");
const auditLogger_js_1 = require("../utils/auditLogger.js");
class ParametroController {
    // GET /api/parametros - Listar todos os parâmetros
    async listar(req, res, next) {
        try {
            const { page = 1, limit = 100, categoria, ativo } = req.query;
            const filtro = {};
            if (categoria)
                filtro.categoria = categoria;
            if (ativo === 'true')
                filtro.ativo = true;
            else if (ativo === 'false')
                filtro.ativo = false;
            const [parametros, total] = await Promise.all([
                Parametro_1.default.find(filtro).sort({ categoria: 1, chave: 1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).lean(),
                Parametro_1.default.countDocuments(filtro)
            ]);
            return res.status(200).json({
                data: parametros,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/parametros/chave/:chave - Obter parâmetro por chave
    async obterPorChave(req, res, next) {
        try {
            const { chave } = req.params;
            const parametro = await Parametro_1.default.findOne({ chave });
            if (!parametro) {
                throw new errorHandler_1.AppError('Parâmetro não encontrado', 404);
            }
            return res.status(200).json(parametro);
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/parametros/:id - Obter parâmetro por ID
    async obter(req, res, next) {
        try {
            const { id } = req.params;
            const parametro = await Parametro_1.default.findById(id);
            if (!parametro) {
                throw new errorHandler_1.AppError('Parâmetro não encontrado', 404);
            }
            return res.status(200).json(parametro);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/parametros - Criar parâmetro
    async criar(req, res, next) {
        try {
            const parametro = await Parametro_1.default.create(req.body);
            await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'Parametro', parametro._id.toString(), parametro);
            return res.status(201).json(parametro);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/parametros/:id - Atualizar parâmetro
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;
            const parametroAntigo = await Parametro_1.default.findById(id);
            if (!parametroAntigo) {
                throw new errorHandler_1.AppError('Parâmetro não encontrado', 404);
            }
            const parametro = await Parametro_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
            if (!parametro) {
                throw new errorHandler_1.AppError('Parâmetro não encontrado', 404);
            }
            const mudancas = (0, auditLogger_js_1.compararDados)(parametroAntigo, parametro);
            await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'Parametro', id, mudancas);
            return res.status(200).json(parametro);
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/parametros/:id - Deletar parâmetro
    async deletar(req, res, next) {
        try {
            const { id } = req.params;
            const parametroAntigo = await Parametro_1.default.findById(id);
            if (!parametroAntigo) {
                throw new errorHandler_1.AppError('Parâmetro não encontrado', 404);
            }
            await Parametro_1.default.updateOne({ _id: id }, { ativo: false });
            await (0, auditLogger_js_1.logAction)(req, 'DELETE', 'Parametro', id, parametroAntigo);
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ParametroController();
