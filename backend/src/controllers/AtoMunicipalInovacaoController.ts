import { Request, Response, NextFunction } from 'express';
import AtoMunicipalInovacao from '../models/AtoMunicipalInovacao.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';

class AtoMunicipalInovacaoController {
  
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 10 });
      const { cidade, ano } = req.query;
      const filter: any = { ativo: true };

      if (cidade) filter.nm_cidade = new RegExp(String(cidade), 'i');
      if (ano) filter.ano_ato = Number(ano);

      const [items, total] = await Promise.all([
        AtoMunicipalInovacao.find(filter)
          .sort({ ano_ato: -1, nr_ato: -1 })
          .skip(skip)
          .limit(limit),
        AtoMunicipalInovacao.countDocuments(filter)
      ]);

      return res.status(200).json({
        items,
        total,
        page,
        pages: getPaginationResult(total, page, limit).pages
      });
    } catch (error) {
      next(error);
    }
  }

  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await AtoMunicipalInovacao.findById(req.params.id)
        .populate('papeisModoGovernanca');
      
      if (!item) {
        throw new AppError('Ato Municipal não encontrado', 404);
      }

      return res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const novoItem = await AtoMunicipalInovacao.create(req.body);
      
      await logAction(req, 'CREATE', 'AtoMunicipalInovacao', novoItem._id.toString(), novoItem);

      return res.status(201).json(novoItem);
    } catch (error: any) {
      if (error.code === 11000) {
        return next(new AppError('Já existe um ato cadastrado com este número e ano.', 400));
      }
      next(error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const oldItem = await AtoMunicipalInovacao.findById(req.params.id);
      if (!oldItem) {
        throw new AppError('Ato Municipal não encontrado', 404);
      }

      const item = await AtoMunicipalInovacao.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      const mudancas = compararDados(oldItem, item);
      await logAction(req, 'UPDATE', 'AtoMunicipalInovacao', item!._id.toString(), mudancas);

      return res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const oldItem = await AtoMunicipalInovacao.findById(req.params.id);
      if (!oldItem) {
        throw new AppError('Ato Municipal não encontrado', 404);
      }

      const item = await AtoMunicipalInovacao.findByIdAndUpdate(
        req.params.id,
        { ativo: false },
        { new: true }
      );

      await logAction(req, 'DELETE', 'AtoMunicipalInovacao', item!._id.toString(), oldItem);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new AtoMunicipalInovacaoController();
