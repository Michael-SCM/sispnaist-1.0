import { Request, Response, NextFunction } from 'express';
import ParametroPorUF from '../models/ParametroPorUF';
import { AppError } from '../middleware/errorHandler';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';

class ParametroUfController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 100 });
      const { uf, categoria, ativo, chave } = req.query;

      const filtro: any = {};
      if (uf) filtro.uf = (uf as string).toUpperCase();
      if (categoria) filtro.categoria = categoria;
      if (ativo === 'true') filtro.ativo = true;
      else if (ativo === 'false') filtro.ativo = false;
      if (chave) filtro.chave = { $regex: chave, $options: 'i' };

      const [parametros, total] = await Promise.all([
        ParametroPorUF.find(filtro).sort({ uf: 1, categoria: 1, chave: 1 }).skip(skip).limit(limit).lean(),
        ParametroPorUF.countDocuments(filtro)
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

  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parametro = await ParametroPorUF.findById(id);
      if (!parametro) throw new AppError('Parâmetro por UF não encontrado', 404);
      return res.status(200).json(parametro);
    } catch (error) {
      next(error);
    }
  }

  async obterPorChave(req: Request, res: Response, next: NextFunction) {
    try {
      const { chave } = req.params;
      const { uf } = req.query;

      const filtro: any = { chave };
      if (uf) filtro.uf = (uf as string).toUpperCase();

      const parametro = await ParametroPorUF.findOne(filtro);
      if (!parametro) throw new AppError('Parâmetro por UF não encontrado', 404);
      return res.status(200).json(parametro);
    } catch (error) {
      next(error);
    }
  }

  async listarPorUF(req: Request, res: Response, next: NextFunction) {
    try {
      const { uf } = req.params;
      const { categoria, ativo } = req.query;

      const filtro: any = { uf: uf.toUpperCase() };
      if (categoria) filtro.categoria = categoria;
      if (ativo === 'true') filtro.ativo = true;
      else if (ativo === 'false') filtro.ativo = false;

      const parametros = await ParametroPorUF.find(filtro).sort({ categoria: 1, chave: 1 }).lean();
      return res.status(200).json({ data: parametros });
    } catch (error) {
      next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        uf: req.body.uf?.toUpperCase()
      };

      const existente = await ParametroPorUF.findOne({ chave: data.chave, uf: data.uf });
      if (existente) {
        throw new AppError(`Já existe um parâmetro com a chave "${data.chave}" para UF "${data.uf}"`, 409);
      }

      const parametro = await ParametroPorUF.create(data);
      await logAction(req, 'CREATE', 'ParametroPorUF', parametro._id.toString(), parametro);
      return res.status(201).json(parametro);
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      if (updateData.uf) updateData.uf = updateData.uf.toUpperCase();

      const parametroAntigo = await ParametroPorUF.findById(id);
      if (!parametroAntigo) throw new AppError('Parâmetro por UF não encontrado', 404);

      const parametro = await ParametroPorUF.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!parametro) throw new AppError('Parâmetro por UF não encontrado', 404);

      const mudancas = compararDados(parametroAntigo, parametro);
      await logAction(req, 'UPDATE', 'ParametroPorUF', id, mudancas);
      return res.status(200).json(parametro);
    } catch (error) {
      next(error);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parametroAntigo = await ParametroPorUF.findById(id);
      if (!parametroAntigo) throw new AppError('Parâmetro por UF não encontrado', 404);

      await ParametroPorUF.updateOne({ _id: id }, { ativo: false });
      await logAction(req, 'DELETE', 'ParametroPorUF', id, parametroAntigo);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ParametroUfController();
