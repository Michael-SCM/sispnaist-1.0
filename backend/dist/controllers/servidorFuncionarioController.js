"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ServidorFuncionario_1 = __importDefault(require("../models/ServidorFuncionario"));
const errorHandler_1 = require("../middleware/errorHandler");
const auditLogger_js_1 = require("../utils/auditLogger.js");
class ServidorFuncionarioController {
    // GET /api/servidores - Listar servidores
    async listar(req, res, next) {
        try {
            const { page = 1, limit = 20, ativo, situacaoFuncional, lotacao } = req.query;
            const filtro = {};
            if (ativo === 'true')
                filtro.ativo = true;
            else if (ativo === 'false')
                filtro.ativo = false;
            if (situacaoFuncional)
                filtro.situacaoFuncional = situacaoFuncional;
            if (lotacao)
                filtro.lotacao = { $regex: new RegExp(String(lotacao), 'i') };
            const [servidores, total] = await Promise.all([
                ServidorFuncionario_1.default.find(filtro)
                    .populate('trabalhadorId', 'nome cpf matricula')
                    .sort({ matriculaFuncional: 1 })
                    .skip((Number(page) - 1) * Number(limit))
                    .limit(Number(limit))
                    .lean(),
                ServidorFuncionario_1.default.countDocuments(filtro)
            ]);
            return res.status(200).json({
                data: servidores,
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
    // GET /api/servidores/:id - Obter servidor
    async obter(req, res, next) {
        try {
            const { id } = req.params;
            const servidor = await ServidorFuncionario_1.default.findById(id).populate('trabalhadorId');
            if (!servidor) {
                throw new errorHandler_1.AppError('Servidor não encontrado', 404);
            }
            return res.status(200).json(servidor);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/servidores - Criar servidor
    async criar(req, res, next) {
        try {
            const servidor = await ServidorFuncionario_1.default.create(req.body);
            await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'ServidorFuncionario', servidor._id.toString(), servidor);
            return res.status(201).json(servidor);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/servidores/:id - Atualizar servidor
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;
            const servidorAntigo = await ServidorFuncionario_1.default.findById(id);
            if (!servidorAntigo) {
                throw new errorHandler_1.AppError('Servidor não encontrado', 404);
            }
            const servidor = await ServidorFuncionario_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
            if (!servidor) {
                throw new errorHandler_1.AppError('Servidor não encontrado', 404);
            }
            const mudancas = (0, auditLogger_js_1.compararDados)(servidorAntigo, servidor);
            await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'ServidorFuncionario', id, mudancas);
            return res.status(200).json(servidor);
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/servidores/:id - Deletar servidor
    async deletar(req, res, next) {
        try {
            const { id } = req.params;
            const servidor = await ServidorFuncionario_1.default.findById(id);
            if (!servidor) {
                throw new errorHandler_1.AppError('Servidor não encontrado', 404);
            }
            await (0, auditLogger_js_1.logAction)(req, 'DELETE', 'ServidorFuncionario', id, servidor);
            const resultado = await ServidorFuncionario_1.default.updateOne({ _id: id }, { ativo: false });
            if (resultado.matchedCount === 0) {
                throw new errorHandler_1.AppError('Servidor não encontrado', 404);
            }
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ServidorFuncionarioController();
