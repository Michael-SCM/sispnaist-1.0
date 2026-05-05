import { Request, Response, NextFunction } from 'express';
import TrabalhadorDependente from '../models/TrabalhadorDependente';
import TrabalhadorAfastamento from '../models/TrabalhadorAfastamento';
import TrabalhadorOcorrenciaViolencia from '../models/TrabalhadorOcorrenciaViolencia';
import TrabalhadorReadaptacao from '../models/TrabalhadorReadaptacao';
import TrabalhadorProcessoTrabalho from '../models/TrabalhadorProcessoTrabalho';
import TrabalhadorVinculo from '../models/TrabalhadorVinculo';
import { AppError } from '../middleware/errorHandler';

/**
 * Controller unificado para todos os submódulos do trabalhador.
 * Equivalente aos módulos: trabalhador_dependentes, trabalhador_afastamento,
 * trabalhador_ocorrencia_violencia, trabalhador_readaptacao, trabalhador_processo_trabalho
 */

// Mapeamento de submódulos para models
const SUBMODULO_MODELS: any = {
  dependentes: TrabalhadorDependente,
  afastamentos: TrabalhadorAfastamento,
  ocorrenciasViolencia: TrabalhadorOcorrenciaViolencia,
  readaptacoes: TrabalhadorReadaptacao,
  processosTrabalho: TrabalhadorProcessoTrabalho,
  vinculos: TrabalhadorVinculo
};

class SubmoduloTrabalhadorController {
  // GET /api/trabalhadores/:id/:submodulo - Lista submódulos de um trabalhador
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, submodulo } = req.params;
      const { ativo } = req.query;

      const Model = SUBMODULO_MODELS[submodulo];
      if (!Model) {
        throw new AppError(`Submódulo "${submodulo}" não é válido`, 400);
      }

      const filtro: any = { trabalhadorId: id };
      if (ativo === 'true') filtro.ativo = true;
      else if (ativo === 'false') filtro.ativo = false;

      const itens = await Model.find(filtro).sort({ createdAt: -1 }).lean();

      return res.status(200).json(itens);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/trabalhadores/:id/:submodulo/:itemId - Obter item específico
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, submodulo, itemId } = req.params;

      const Model = SUBMODULO_MODELS[submodulo];
      if (!Model) {
        throw new AppError(`Submódulo "${submodulo}" não é válido`, 400);
      }

      const item = await Model.findOne({ _id: itemId, trabalhadorId: id });

      if (!item) {
        throw new AppError('Item não encontrado', 404);
      }

      return res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/trabalhadores/:id/:submodulo - Criar novo item
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, submodulo } = req.params;
      const dados = req.body;

      const Model = SUBMODULO_MODELS[submodulo];
      if (!Model) {
        throw new AppError(`Submódulo "${submodulo}" não é válido`, 400);
      }

      // Adiciona o trabalhadorId
      const item = await Model.create({ ...dados, trabalhadorId: id });

      return res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/trabalhadores/:id/:submodulo/:itemId - Atualizar item
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, submodulo, itemId } = req.params;
      const dados = req.body;

      const Model = SUBMODULO_MODELS[submodulo];
      if (!Model) {
        throw new AppError(`Submódulo "${submodulo}" não é válido`, 400);
      }

      const item = await Model.findOneAndUpdate(
        { _id: itemId, trabalhadorId: id },
        dados,
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

  // DELETE /api/trabalhadores/:id/:submodulo/:itemId - Deletar item
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, submodulo, itemId } = req.params;

      const Model = SUBMODULO_MODELS[submodulo];
      if (!Model) {
        throw new AppError(`Submódulo "${submodulo}" não é válido`, 400);
      }

      // Hard delete - remoção permanente do banco
      const resultado = await Model.deleteOne({ _id: itemId, trabalhadorId: id });

      if (resultado.deletedCount === 0) {
        throw new AppError('Item não encontrado', 404);
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new SubmoduloTrabalhadorController();
