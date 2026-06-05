"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Questionario_1 = __importDefault(require("../models/Questionario"));
const QuestionarioItem_1 = __importDefault(require("../models/QuestionarioItem"));
const errorHandler_1 = require("../middleware/errorHandler");
const auditLogger_js_1 = require("../utils/auditLogger.js");
class QuestionarioController {
    // GET /api/questionarios - Listar todos os questionários
    async listar(req, res, next) {
        try {
            const { page = 1, limit = 20, ativo, tipo } = req.query;
            const filtro = {};
            if (ativo === 'true')
                filtro.ativo = true;
            else if (ativo === 'false')
                filtro.ativo = false;
            if (tipo)
                filtro.tipo = tipo;
            const [questionarios, total] = await Promise.all([
                Questionario_1.default.find(filtro).sort({ nome: 1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).lean(),
                Questionario_1.default.countDocuments(filtro)
            ]);
            return res.status(200).json({
                data: questionarios,
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
    // GET /api/questionarios/:id - Obter questionário com itens
    async obter(req, res, next) {
        try {
            const { id } = req.params;
            const [questionario, itens] = await Promise.all([
                Questionario_1.default.findById(id).lean(),
                QuestionarioItem_1.default.find({ questionarioId: id, ativo: true }).sort({ ordem: 1 }).lean()
            ]);
            if (!questionario) {
                throw new errorHandler_1.AppError('Questionário não encontrado', 404);
            }
            return res.status(200).json({ ...questionario, itens });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/questionarios - Criar questionário
    async criar(req, res, next) {
        try {
            const questionario = await Questionario_1.default.create(req.body);
            await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'Questionario', questionario._id.toString(), questionario);
            return res.status(201).json(questionario);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/questionarios/:id - Atualizar questionário
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;
            const questionarioAntigo = await Questionario_1.default.findById(id);
            if (!questionarioAntigo) {
                throw new errorHandler_1.AppError('Questionário não encontrado', 404);
            }
            const questionario = await Questionario_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
            if (!questionario) {
                throw new errorHandler_1.AppError('Questionário não encontrado', 404);
            }
            const mudancas = (0, auditLogger_js_1.compararDados)(questionarioAntigo, questionario);
            await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'Questionario', id, mudancas);
            return res.status(200).json(questionario);
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/questionarios/:id - Deletar questionário
    async deletar(req, res, next) {
        try {
            const { id } = req.params;
            const questionarioAntigo = await Questionario_1.default.findById(id);
            if (!questionarioAntigo) {
                throw new errorHandler_1.AppError('Questionário não encontrado', 404);
            }
            const resultado = await Promise.all([
                Questionario_1.default.updateOne({ _id: id }, { ativo: false }),
                QuestionarioItem_1.default.updateMany({ questionarioId: id }, { ativo: false })
            ]);
            await (0, auditLogger_js_1.logAction)(req, 'DELETE', 'Questionario', id, questionarioAntigo);
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/questionarios/:id/itens - Adicionar item ao questionário
    async criarItem(req, res, next) {
        try {
            const { id } = req.params;
            const questionario = await Questionario_1.default.findById(id);
            if (!questionario) {
                throw new errorHandler_1.AppError('Questionário não encontrado', 404);
            }
            const item = await QuestionarioItem_1.default.create({ ...req.body, questionarioId: id });
            await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'QuestionarioItem', item._id.toString(), item);
            return res.status(201).json(item);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/questionarios/:id/itens/:itemId - Atualizar item
    async atualizarItem(req, res, next) {
        try {
            const { id, itemId } = req.params;
            const oldItem = await QuestionarioItem_1.default.findOne({ _id: itemId, questionarioId: id });
            if (!oldItem) {
                throw new errorHandler_1.AppError('Item não encontrado', 404);
            }
            const item = await QuestionarioItem_1.default.findOneAndUpdate({ _id: itemId, questionarioId: id }, req.body, { new: true, runValidators: true });
            const mudancas = (0, auditLogger_js_1.compararDados)(oldItem, item);
            await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'QuestionarioItem', itemId, mudancas);
            return res.status(200).json(item);
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/questionarios/:id/itens/:itemId - Deletar item
    async deletarItem(req, res, next) {
        try {
            const { id, itemId } = req.params;
            const oldItem = await QuestionarioItem_1.default.findOne({ _id: itemId, questionarioId: id });
            if (!oldItem) {
                throw new errorHandler_1.AppError('Item não encontrado', 404);
            }
            await QuestionarioItem_1.default.updateOne({ _id: itemId, questionarioId: id }, { ativo: false });
            await (0, auditLogger_js_1.logAction)(req, 'DELETE', 'QuestionarioItem', itemId, oldItem);
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new QuestionarioController();
