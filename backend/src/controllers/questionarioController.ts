import { Request, Response, NextFunction } from 'express';
import Questionario from '../models/Questionario';
import QuestionarioItem from '../models/QuestionarioItem';
import { AppError } from '../middleware/errorHandler';

class QuestionarioController {
  // GET /api/questionarios - Listar todos os questionários
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, ativo, tipo } = req.query;

      const filtro: any = {};
      if (ativo === 'true') filtro.ativo = true;
      else if (ativo === 'false') filtro.ativo = false;
      if (tipo) filtro.tipo = tipo;

      const [questionarios, total] = await Promise.all([
        Questionario.find(filtro).sort({ nome: 1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).lean(),
        Questionario.countDocuments(filtro)
      ]);

      return res.status(200).json({
        data: questionarios,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/questionarios/:id - Obter questionário com itens
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const [questionario, itens] = await Promise.all([
        Questionario.findById(id).lean(),
        QuestionarioItem.find({ questionarioId: id, ativo: true }).sort({ ordem: 1 }).lean()
      ]);

      if (!questionario) {
        throw new AppError('Questionário não encontrado', 404);
      }

      return res.status(200).json({ ...questionario, itens });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/questionarios - Criar questionário
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const questionario = await Questionario.create(req.body);

      return res.status(201).json(questionario);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/questionarios/:id - Atualizar questionário
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const questionario = await Questionario.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!questionario) {
        throw new AppError('Questionário não encontrado', 404);
      }

      return res.status(200).json(questionario);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/questionarios/:id - Deletar questionário
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const resultado = await Promise.all([
        Questionario.updateOne({ _id: id }, { ativo: false }),
        QuestionarioItem.updateMany({ questionarioId: id }, { ativo: false })
      ]);

      if (resultado[0].matchedCount === 0) {
        throw new AppError('Questionário não encontrado', 404);
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // POST /api/questionarios/:id/itens - Adicionar item ao questionário
  async criarItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const questionario = await Questionario.findById(id);
      if (!questionario) {
        throw new AppError('Questionário não encontrado', 404);
      }

      const item = await QuestionarioItem.create({ ...req.body, questionarioId: id });

      return res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/questionarios/:id/itens/:itemId - Atualizar item
  async atualizarItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, itemId } = req.params;

      const item = await QuestionarioItem.findOneAndUpdate(
        { _id: itemId, questionarioId: id },
        req.body,
        { new: true, runValidators: true }
      );

      if (!item) {
        throw new AppError('Item não encontrado', 404);
      }

      return res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/questionarios/:id/itens/:itemId - Deletar item
  async deletarItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, itemId } = req.params;

      const resultado = await QuestionarioItem.updateOne(
        { _id: itemId, questionarioId: id },
        { ativo: false }
      );

      if (resultado.matchedCount === 0) {
        throw new AppError('Item não encontrado', 404);
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new QuestionarioController();
