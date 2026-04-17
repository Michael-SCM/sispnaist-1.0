import { Request, Response, NextFunction } from 'express';
import Parametro from '../models/Parametro';
import { AppError } from '../middleware/errorHandler';

class ParametroController {
  // GET /api/parametros - Listar todos os parâmetros
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 100, categoria, ativo } = req.query;

      const filtro: any = {};
      if (categoria) filtro.categoria = categoria;
      if (ativo === 'true') filtro.ativo = true;
      else if (ativo === 'false') filtro.ativo = false;

      const [parametros, total] = await Promise.all([
        Parametro.find(filtro).sort({ categoria: 1, chave: 1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).lean(),
        Parametro.countDocuments(filtro)
      ]);

      return res.status(200).json({
        data: parametros,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
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

      return res.status(201).json(parametro);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/parametros/:id - Atualizar parâmetro
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const parametro = await Parametro.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!parametro) {
        throw new AppError('Parâmetro não encontrado', 404);
      }

      return res.status(200).json(parametro);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/parametros/:id - Deletar parâmetro
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const resultado = await Parametro.updateOne({ _id: id }, { ativo: false });

      if (resultado.matchedCount === 0) {
        throw new AppError('Parâmetro não encontrado', 404);
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ParametroController();
