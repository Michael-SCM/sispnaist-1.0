import { Request, Response, NextFunction } from 'express';
import VideoAula from '../models/VideoAula';
import { AppError } from '../middleware/errorHandler';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';

class VideoAulaController {
  // GET /api/video-aulas - Listar video-aulas
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 20 });
      const { ativo, categoria } = req.query;

      const filtro: any = {};
      if (ativo === 'true') filtro.ativo = true;
      else if (ativo === 'false') filtro.ativo = false;
      if (categoria) filtro.categoria = categoria;

      const [videoAulas, total] = await Promise.all([
        VideoAula.find(filtro).sort({ ordem: 1, titulo: 1 }).skip(skip).limit(limit).lean(),
        VideoAula.countDocuments(filtro)
      ]);

      if (process.env.NODE_ENV !== 'production') {
        console.log('[VideoAulaController.listar] query:', { page, limit, ativo, categoria, filtro, total });
        console.log('[VideoAulaController.listar] ids retornados:', (videoAulas || []).map((v: any) => v._id));
      }

      return res.status(200).json({
        data: videoAulas,
        total,
        page,
        limit,
        totalPages: getPaginationResult(total, page, limit).pages
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/video-aulas/:id - Obter video-aula
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const videoAula = await VideoAula.findById(id);

      if (!videoAula) {
        throw new AppError('Video-aula não encontrada', 404);
      }

      // Incrementa contador de visualizações
      await VideoAula.updateOne({ _id: id }, { $inc: { visualizacoes: 1 } });

      return res.status(200).json(videoAula);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/video-aulas - Criar video-aula
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const videoAula = await VideoAula.create(req.body);

      await logAction(req, 'CREATE', 'VideoAula', videoAula._id.toString(), videoAula);

      return res.status(201).json(videoAula);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/video-aulas/:id - Atualizar video-aula
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const videoAulaAntiga = await VideoAula.findById(id);
      if (!videoAulaAntiga) {
        throw new AppError('Video-aula não encontrada', 404);
      }

      const videoAulaAtualizada = await VideoAula.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!videoAulaAtualizada) {
        throw new AppError('Video-aula não encontrada', 404);
      }

      const mudancas = compararDados(videoAulaAntiga, videoAulaAtualizada);

      await logAction(req, 'UPDATE', 'VideoAula', id, mudancas);

      return res.status(200).json(videoAulaAtualizada);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/video-aulas/:id - Deletar video-aula
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const videoAulaAntiga = await VideoAula.findById(id);
      if (!videoAulaAntiga) {
        throw new AppError('Video-aula não encontrada', 404);
      }

      await VideoAula.updateOne({ _id: id }, { ativo: false });

      await logAction(req, 'DELETE', 'VideoAula', id, videoAulaAntiga);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new VideoAulaController();
