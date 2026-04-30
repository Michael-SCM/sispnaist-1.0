import { Request, Response, NextFunction } from 'express';
import AtoMunicipalInovacao from '../models/AtoMunicipalInovacao.js';
import AppError from '../middleware/errorHandler.js';
import { logAction } from '../utils/auditLogger.js';

class AtoMunicipalInovacaoController {
  
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, cidade, ano } = req.query;
      const filter: any = { ativo: true };

      if (cidade) filter.nm_cidade = new RegExp(String(cidade), 'i');
      if (ano) filter.ano_ato = Number(ano);

      const items = await AtoMunicipalInovacao.find(filter)
        .sort({ ano_ato: -1, nr_ato: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await AtoMunicipalInovacao.countDocuments(filter);

      return res.status(200).json({
        items,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
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
      
      await logAction(req, 'CREATE', 'AtoMunicipalInovacao', novoItem._id.toString(), {
        nr_ato: novoItem.nr_ato,
        ano_ato: novoItem.ano_ato
      });

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
      const item = await AtoMunicipalInovacao.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!item) {
        throw new AppError('Ato Municipal não encontrado', 404);
      }

      await logAction(req, 'UPDATE', 'AtoMunicipalInovacao', item._id.toString(), {
        nr_ato: item.nr_ato,
        ano_ato: item.ano_ato
      });

      return res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await AtoMunicipalInovacao.findByIdAndUpdate(
        req.params.id,
        { ativo: false },
        { new: true }
      );

      if (!item) {
        throw new AppError('Ato Municipal não encontrado', 404);
      }

      await logAction(req, 'DELETE', 'AtoMunicipalInovacao', item._id.toString(), {
        nr_ato: item.nr_ato,
        ano_ato: item.ano_ato
      });

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new AtoMunicipalInovacaoController();
