import { Request, Response, NextFunction } from 'express';
import ArquivoUpload from '../models/ArquivoUpload';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';
import config from '../config/config.js';

class UploadController {
  // GET /api/uploads - Listar uploads
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { entidade, entidadeId, page = 1, limit = 20 } = req.query;

      const filtro: any = {};
      if (entidade) filtro.entidade = entidade;
      if (entidadeId) filtro.entidadeId = entidadeId;

      const [uploads, total] = await Promise.all([
        ArquivoUpload.find(filtro).sort({ dataCriacao: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).lean(),
        ArquivoUpload.countDocuments(filtro)
      ]);

      return res.status(200).json({
        data: uploads,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/uploads/:id - Obter upload específico
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const upload = await ArquivoUpload.findById(id);

      if (!upload) {
        throw new AppError('Upload não encontrado', 404);
      }

      return res.status(200).json(upload);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/uploads - Registrar upload (o arquivo em si é enviado via multer)
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const { entidade, entidadeId, descricao } = req.body;
      const file = req.file;

      if (!file) {
        throw new AppError('Nenhum arquivo enviado', 400);
      }

      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const upload = await ArquivoUpload.create({
        entidade,
        entidadeId,
        nomeOriginal: file.originalname,
        nomeArmazenado: file.filename,
        caminho: file.path,
        mimeType: file.mimetype,
        tamanho: file.size,
        descricao,
        enviadoPor: (req.user as any).id
      });

      return res.status(201).json(upload);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/uploads/:id - Deletar upload
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const upload = await ArquivoUpload.findById(id);

      if (!upload) {
        throw new AppError('Upload não encontrado', 404);
      }

      // Remove arquivo físico
      if (fs.existsSync(upload.caminho)) {
        fs.unlinkSync(upload.caminho);
      }

      // Remove registro do banco
      await upload.deleteOne();

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // GET /api/uploads/:id/download - Download do arquivo
  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const upload = await ArquivoUpload.findById(id);

      if (!upload) {
        throw new AppError('Upload não encontrado', 404);
      }

      if (!fs.existsSync(upload.caminho)) {
        throw new AppError('Arquivo não encontrado no servidor', 404);
      }

      res.download(upload.caminho, upload.nomeOriginal);
    } catch (error) {
      next(error);
    }
  }
}

export default new UploadController();
