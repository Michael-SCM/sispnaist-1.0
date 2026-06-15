"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const ArquivoUpload_1 = __importDefault(require("../models/ArquivoUpload"));
const errorHandler_1 = require("../middleware/errorHandler");
const fs_1 = __importDefault(require("fs"));
class UploadController {
    // GET /api/uploads - Listar uploads
    async listar(req, res, next) {
        try {
            const { entidade, entidadeId, page = 1, limit = 20 } = req.query;
            const filtro = {};
            if (entidade)
                filtro.entidade = entidade;
            if (entidadeId)
                filtro.entidadeId = entidadeId;
            const [uploads, total] = await Promise.all([
                ArquivoUpload_1.default.find(filtro).sort({ dataCriacao: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).lean(),
                ArquivoUpload_1.default.countDocuments(filtro)
            ]);
            return res.status(200).json({
                data: uploads,
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
    // GET /api/uploads/:id - Obter upload específico
    async obter(req, res, next) {
        try {
            const { id } = req.params;
            const upload = await ArquivoUpload_1.default.findById(id);
            if (!upload) {
                throw new errorHandler_1.AppError('Upload não encontrado', 404);
            }
            return res.status(200).json(upload);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/uploads - Registrar upload (o arquivo em si é enviado via multer)
    async criar(req, res, next) {
        try {
            const { entidade, entidadeId, descricao } = req.body;
            const file = req.file;
            if (!file) {
                throw new errorHandler_1.AppError('Nenhum arquivo enviado', 400);
            }
            if (!req.user) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            const upload = await ArquivoUpload_1.default.create({
                entidade,
                entidadeId,
                nomeOriginal: file.originalname,
                nomeArmazenado: file.filename,
                caminho: file.path,
                mimeType: file.mimetype,
                tamanho: file.size,
                descricao,
                enviadoPor: req.user.id
            });
            return res.status(201).json(upload);
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/uploads/:id - Deletar upload
    async deletar(req, res, next) {
        try {
            const { id } = req.params;
            const upload = await ArquivoUpload_1.default.findById(id);
            if (!upload) {
                throw new errorHandler_1.AppError('Upload não encontrado', 404);
            }
            // Remove arquivo físico
            if (fs_1.default.existsSync(upload.caminho)) {
                fs_1.default.unlinkSync(upload.caminho);
            }
            // Remove registro do banco
            await upload.deleteOne();
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/uploads/:id/download - Download do arquivo
    async download(req, res, next) {
        try {
            const { id } = req.params;
            const upload = await ArquivoUpload_1.default.findById(id);
            if (!upload) {
                throw new errorHandler_1.AppError('Upload não encontrado', 404);
            }
            if (!fs_1.default.existsSync(upload.caminho)) {
                throw new errorHandler_1.AppError('Arquivo não encontrado no servidor', 404);
            }
            res.download(upload.caminho, upload.nomeOriginal);
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/uploads/:id/view - Visualizar arquivo inline (abre no navegador)
    async visualizar(req, res, next) {
        try {
            const { id } = req.params;
            const upload = await ArquivoUpload_1.default.findById(id);
            if (!upload) {
                throw new errorHandler_1.AppError('Upload não encontrado', 404);
            }
            if (!fs_1.default.existsSync(upload.caminho)) {
                throw new errorHandler_1.AppError('Arquivo não encontrado no servidor', 404);
            }
            res.setHeader('Content-Disposition', `inline; filename="${upload.nomeOriginal}"`);
            res.setHeader('Content-Type', upload.mimeType);
            res.sendFile(path_1.default.resolve(upload.caminho));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new UploadController();
