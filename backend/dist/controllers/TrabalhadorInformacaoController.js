"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TrabalhadorInformacaoService_1 = __importDefault(require("../services/TrabalhadorInformacaoService"));
const Trabalhador_1 = __importDefault(require("../models/Trabalhador"));
const errorHandler_1 = require("../middleware/errorHandler");
class TrabalhadorInformacaoController {
    // GET /api/trabalhadores/:id/informacoes - Listar informações de um trabalhador
    async listar(req, res, next) {
        try {
            const { id } = req.params;
            // Se o usuário logado for trabalhador, ele só pode acessar os seus próprios dados
            if (req.user?.perfil === 'trabalhador') {
                const trabalhador = await Trabalhador_1.default.findOne({ cpf: req.user.cpf });
                if (!trabalhador || id !== trabalhador._id.toString()) {
                    throw new errorHandler_1.AppError('Sem permissão para acessar as informações deste trabalhador', 403);
                }
            }
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 100));
            const result = await TrabalhadorInformacaoService_1.default.listarPorTrabalhador(id, page, limit);
            res.setHeader('X-Total-Count', result.total.toString());
            res.setHeader('X-Page', page.toString());
            res.setHeader('X-Limit', limit.toString());
            return res.status(200).json(result.informacoes);
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/trabalhadores/:id/informacoes/:infoId - Obter informação específica
    async obter(req, res, next) {
        try {
            const { id, infoId } = req.params;
            // Se o usuário logado for trabalhador, ele só pode acessar os seus próprios dados
            if (req.user?.perfil === 'trabalhador') {
                const trabalhador = await Trabalhador_1.default.findOne({ cpf: req.user.cpf });
                if (!trabalhador || id !== trabalhador._id.toString()) {
                    throw new errorHandler_1.AppError('Sem permissão para acessar as informações deste trabalhador', 403);
                }
            }
            const informacao = await TrabalhadorInformacaoService_1.default.obterPorId(infoId);
            if (!informacao || informacao.trabalhadorId !== id) {
                throw new errorHandler_1.AppError('Informação não encontrada', 404);
            }
            return res.status(200).json(informacao);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/trabalhadores/:id/informacoes - Criar nova informação
    async criar(req, res, next) {
        try {
            const { id } = req.params;
            if (req.user?.perfil === 'trabalhador') {
                throw new errorHandler_1.AppError('Sem permissão para criar informações de trabalhadores', 403);
            }
            const dados = req.body;
            const informacao = await TrabalhadorInformacaoService_1.default.criar({
                ...dados,
                trabalhadorId: id,
            });
            return res.status(201).json(informacao);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/trabalhadores/:id/informacoes/:infoId - Atualizar informação
    async atualizar(req, res, next) {
        try {
            const { id, infoId } = req.params;
            if (req.user?.perfil === 'trabalhador') {
                throw new errorHandler_1.AppError('Sem permissão para atualizar informações de trabalhadores', 403);
            }
            const dados = req.body;
            const informacao = await TrabalhadorInformacaoService_1.default.atualizar(infoId, dados);
            if (!informacao || informacao.trabalhadorId !== id) {
                throw new errorHandler_1.AppError('Informação não encontrada', 404);
            }
            return res.status(200).json(informacao);
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/trabalhadores/:id/informacoes/:infoId - Deletar informação
    async deletar(req, res, next) {
        try {
            const { id, infoId } = req.params;
            if (req.user?.perfil === 'trabalhador') {
                throw new errorHandler_1.AppError('Sem permissão para deletar informações de trabalhadores', 403);
            }
            const existe = await TrabalhadorInformacaoService_1.default.obterPorId(infoId);
            if (!existe || existe.trabalhadorId !== id) {
                throw new errorHandler_1.AppError('Informação não encontrada', 404);
            }
            await TrabalhadorInformacaoService_1.default.deletar(infoId);
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new TrabalhadorInformacaoController();
