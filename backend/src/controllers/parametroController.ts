import { Request, Response, NextFunction } from 'express';
import Parametro from '../models/Parametro';
import { AppError } from '../middleware/errorHandler';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';

class ParametroController {
  // GET /api/parametros - Listar todos os parâmetros
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 100 });
      const { categoria, ativo } = req.query;

      const filtro: any = {};
      if (categoria) filtro.categoria = categoria;
      if (ativo === 'true') filtro.ativo = true;
      else if (ativo === 'false') filtro.ativo = false;

      const [parametros, total] = await Promise.all([
        Parametro.find(filtro).sort({ categoria: 1, chave: 1 }).skip(skip).limit(limit).lean(),
        Parametro.countDocuments(filtro)
      ]);

      return res.status(200).json({
        data: parametros,
        total,
        page,
        limit,
        totalPages: getPaginationResult(total, page, limit).pages
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/parametros/chave/:chave - Obter parâmetro por chave
  async obterPorChave(req: Request, res: Response, next: NextFunction) {
    try {
      const { chave } = req.params;

      const parametro = await Parametro.findOne({ chave });

      if (!parametro) {
        throw new AppError('Parâmetro não encontrado', 404);
      }

      return res.status(200).json(parametro);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/parametros/:id - Obter parâmetro por ID
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const parametro = await Parametro.findById(id);

      if (!parametro) {
        throw new AppError('Parâmetro não encontrado', 404);
      }

      return res.status(200).json(parametro);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/parametros - Criar parâmetro
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const parametro = await Parametro.create(req.body);

      await logAction(req, 'CREATE', 'Parametro', parametro._id.toString(), parametro);

      return res.status(201).json(parametro);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/parametros/:id - Atualizar parâmetro
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const parametroAntigo = await Parametro.findById(id);
      if (!parametroAntigo) {
        throw new AppError('Parâmetro não encontrado', 404);
      }

      const parametro = await Parametro.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!parametro) {
        throw new AppError('Parâmetro não encontrado', 404);
      }

      const mudancas = compararDados(parametroAntigo, parametro);

      await logAction(req, 'UPDATE', 'Parametro', id, mudancas);

      return res.status(200).json(parametro);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/parametros/:id - Deletar parâmetro
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const parametroAntigo = await Parametro.findById(id);
      if (!parametroAntigo) {
        throw new AppError('Parâmetro não encontrado', 404);
      }

      await Parametro.updateOne({ _id: id }, { ativo: false });

      await logAction(req, 'DELETE', 'Parametro', id, parametroAntigo);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ParametroController();
