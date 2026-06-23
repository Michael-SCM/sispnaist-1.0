import { Request, Response, NextFunction } from 'express';
import ArquivoUpload from '../models/ArquivoUpload';
import { AppError } from '../middleware/errorHandler';
import { IAuthRequest } from '../types/index.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';

class UploadController {
  // GET /api/uploads - Listar uploads
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 20 });
      const { entidade, entidadeId } = req.query;

      const filtro: any = {};
      if (entidade) filtro.entidade = entidade;
      if (entidadeId) filtro.entidadeId = entidadeId;

      const [uploads, total] = await Promise.all([
        ArquivoUpload.find(filtro).sort({ dataCriacao: -1 }).skip(skip).limit(limit).lean(),
        ArquivoUpload.countDocuments(filtro)
      ]);

      return res.status(200).json({
        data: uploads,
        total,
        page,
        limit,
        totalPages: getPaginationResult(total, page, limit).pages
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
  async criar(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const { entidade, entidadeId, descricao } = req.body;
      const file = req.file;

      if (!file) {
        throw new AppError('Nenhum arquivo enviado', 400);
      }

      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = file.originalname.split('.').pop();
      const nomeArmazenado = `${uniqueSuffix}.${ext}`;

      const upload = await ArquivoUpload.create({
        entidade,
        entidadeId,
        nomeOriginal: file.originalname,
        nomeArmazenado,
        mimeType: file.mimetype,
        tamanho: file.size,
        data: file.buffer,
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

      if (!upload.data) {
        throw new AppError('Arquivo não encontrado no servidor', 404);
      }

      res.setHeader('Content-Disposition', `attachment; filename="${upload.nomeOriginal}"`);
      res.setHeader('Content-Type', upload.mimeType);
      res.send(upload.data);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/uploads/:id/view - Visualizar arquivo inline (abre no navegador)
  async visualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const upload = await ArquivoUpload.findById(id);

      if (!upload) {
        throw new AppError('Upload não encontrado', 404);
      }

      if (!upload.data) {
        throw new AppError('Arquivo não encontrado no servidor', 404);
      }

      res.setHeader('Content-Disposition', `inline; filename="${upload.nomeOriginal}"`);
      res.setHeader('Content-Type', upload.mimeType);
      res.send(upload.data);
    } catch (error) {
      next(error);
    }
  }
}

export default new UploadController();
