"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PadraoEmail_1 = __importDefault(require("../models/PadraoEmail"));
const errorHandler_1 = require("../middleware/errorHandler");
class EmailController {
    // GET /api/emails/padroes - Listar templates de email
    async listarPadroes(req, res, next) {
        try {
            const { page = 1, limit = 20, ativo, categoria } = req.query;
            const filtro = {};
            if (ativo === 'true')
                filtro.ativo = true;
            else if (ativo === 'false')
                filtro.ativo = false;
            if (categoria)
                filtro.categoria = categoria;
            const [padroes, total] = await Promise.all([
                PadraoEmail_1.default.find(filtro).sort({ nome: 1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).lean(),
                PadraoEmail_1.default.countDocuments(filtro)
            ]);
            return res.status(200).json({
                data: padroes,
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
    // GET /api/emails/padroes/:id - Obter template
    async obterPadrao(req, res, next) {
        try {
            const { id } = req.params;
            const padrao = await PadraoEmail_1.default.findById(id);
            if (!padrao) {
                throw new errorHandler_1.AppError('Template não encontrado', 404);
            }
            return res.status(200).json(padrao);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/emails/padroes - Criar template
    async criarPadrao(req, res, next) {
        try {
            const padrao = await PadraoEmail_1.default.create(req.body);
            return res.status(201).json(padrao);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/emails/padroes/:id - Atualizar template
    async atualizarPadrao(req, res, next) {
        try {
            const { id } = req.params;
            const padrao = await PadraoEmail_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
            if (!padrao) {
                throw new errorHandler_1.AppError('Template não encontrado', 404);
            }
            return res.status(200).json(padrao);
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/emails/padroes/:id - Deletar template
    async deletarPadrao(req, res, next) {
        try {
            const { id } = req.params;
            const resultado = await PadraoEmail_1.default.updateOne({ _id: id }, { ativo: false });
            if (resultado.matchedCount === 0) {
                throw new errorHandler_1.AppError('Template não encontrado', 404);
            }
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/emails/enviar - Enviar email (placeholder - requer Nodemailer/SendGrid)
    async enviar(req, res, next) {
        // TODO: Implementar envio real de email com Nodemailer ou SendGrid
        return res.status(501).json({
            mensagem: 'Funcionalidade de envio de email ainda não implementada. Requer configuração de Nodemailer/SendGrid.'
        });
    }
}
exports.default = new EmailController();
