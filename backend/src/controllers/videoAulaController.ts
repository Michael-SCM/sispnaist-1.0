import { Request, Response, NextFunction } from 'express';
import VideoAula from '../models/VideoAula';
import { AppError } from '../middleware/errorHandler';

class VideoAulaController {
  // GET /api/video-aulas - Listar video-aulas
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, ativo, categoria } = req.query;

      const filtro: any = {};
      if (ativo === 'true') filtro.ativo = true;
      else if (ativo === 'false') filtro.ativo = false;
      if (categoria) filtro.categoria = categoria;

      const [videoAulas, total] = await Promise.all([
        VideoAula.find(filtro).sort({ ordem: 1, titulo: 1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).lean(),
        VideoAula.countDocuments(filtro)
      ]);

      return res.status(200).json({
        data: videoAulas,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
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

      return res.status(201).json(videoAula);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/video-aulas/:id - Atualizar video-aula
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const videoAula = await VideoAula.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!videoAula) {
        throw new AppError('Video-aula não encontrada', 404);
      }

      return res.status(200).json(videoAula);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/video-aulas/:id - Deletar video-aula
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const resultado = await VideoAula.updateOne({ _id: id }, { ativo: false });

      if (resultado.matchedCount === 0) {
        throw new AppError('Video-aula não encontrada', 404);
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new VideoAulaController();
