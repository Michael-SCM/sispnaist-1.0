"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const VideoAula_1 = __importDefault(require("../models/VideoAula"));
const errorHandler_1 = require("../middleware/errorHandler");
const auditLogger_js_1 = require("../utils/auditLogger.js");
class VideoAulaController {
    // GET /api/video-aulas - Listar video-aulas
    async listar(req, res, next) {
        try {
            const { page = 1, limit = 20, ativo, categoria } = req.query;
            const filtro = {};
            if (ativo === 'true')
                filtro.ativo = true;
            else if (ativo === 'false')
                filtro.ativo = false;
            if (categoria)
                filtro.categoria = categoria;
            const [videoAulas, total] = await Promise.all([
                VideoAula_1.default.find(filtro).sort({ ordem: 1, titulo: 1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).lean(),
                VideoAula_1.default.countDocuments(filtro)
            ]);
            console.log('[VideoAulaController.listar] query:', { page, limit, ativo, categoria, filtro, total });
            console.log('[VideoAulaController.listar] ids retornados:', (videoAulas || []).map((v) => v._id));
            return res.status(200).json({
                data: videoAulas,
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
    // GET /api/video-aulas/:id - Obter video-aula
    async obter(req, res, next) {
        try {
            const { id } = req.params;
            const videoAula = await VideoAula_1.default.findById(id);
            if (!videoAula) {
                throw new errorHandler_1.AppError('Video-aula não encontrada', 404);
            }
            // Incrementa contador de visualizações
            await VideoAula_1.default.updateOne({ _id: id }, { $inc: { visualizacoes: 1 } });
            return res.status(200).json(videoAula);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/video-aulas - Criar video-aula
    async criar(req, res, next) {
        try {
            const videoAula = await VideoAula_1.default.create(req.body);
            await (0, auditLogger_js_1.logAction)(req, 'CREATE', 'VideoAula', videoAula._id.toString(), videoAula);
            return res.status(201).json(videoAula);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/video-aulas/:id - Atualizar video-aula
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;
            const videoAulaAntiga = await VideoAula_1.default.findById(id);
            if (!videoAulaAntiga) {
                throw new errorHandler_1.AppError('Video-aula não encontrada', 404);
            }
            const videoAulaAtualizada = await VideoAula_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
            if (!videoAulaAtualizada) {
                throw new errorHandler_1.AppError('Video-aula não encontrada', 404);
            }
            const mudancas = (0, auditLogger_js_1.compararDados)(videoAulaAntiga, videoAulaAtualizada);
            await (0, auditLogger_js_1.logAction)(req, 'UPDATE', 'VideoAula', id, mudancas);
            return res.status(200).json(videoAulaAtualizada);
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/video-aulas/:id - Deletar video-aula
    async deletar(req, res, next) {
        try {
            const { id } = req.params;
            const videoAulaAntiga = await VideoAula_1.default.findById(id);
            if (!videoAulaAntiga) {
                throw new errorHandler_1.AppError('Video-aula não encontrada', 404);
            }
            await VideoAula_1.default.updateOne({ _id: id }, { ativo: false });
            await (0, auditLogger_js_1.logAction)(req, 'DELETE', 'VideoAula', id, videoAulaAntiga);
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new VideoAulaController();
