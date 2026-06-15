import { Request, Response, NextFunction } from 'express';
import TrabalhadorDependente from '../models/TrabalhadorDependente';
import TrabalhadorAfastamento from '../models/TrabalhadorAfastamento';
import TrabalhadorOcorrenciaViolencia from '../models/TrabalhadorOcorrenciaViolencia';
import TrabalhadorReadaptacao from '../models/TrabalhadorReadaptacao';
import TrabalhadorProcessoTrabalho from '../models/TrabalhadorProcessoTrabalho';
import TrabalhadorVinculo from '../models/TrabalhadorVinculo';
import Trabalhador from '../models/Trabalhador';
import { AppError } from '../middleware/errorHandler';
import { getPaginationParams } from '../utils/pagination.js';
import { logAction, compararDados } from '../utils/auditLogger.js';

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

      // Se o usuário logado for trabalhador, ele só pode acessar os seus próprios dados
      if ((req as any).user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador.findOne({ cpf: (req as any).user.cpf });
        if (!trabalhador || id !== trabalhador._id.toString()) {
          throw new AppError('Sem permissão para acessar os dados deste trabalhador', 403);
        }
      }

      const Model = SUBMODULO_MODELS[submodulo];
      if (!Model) {
        throw new AppError(`Submódulo "${submodulo}" não é válido`, 400);
      }

      const filtro: any = { trabalhadorId: id };
      if (ativo === 'true') filtro.ativo = true;
      else if (ativo === 'false') filtro.ativo = false;

      const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 100 });

      const [itens, total] = await Promise.all([
        Model.find(filtro).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Model.countDocuments(filtro),
      ]);

      res.setHeader('X-Total-Count', total.toString());
      res.setHeader('X-Page', page.toString());
      res.setHeader('X-Limit', limit.toString());

      return res.status(200).json(itens);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/trabalhadores/:id/:submodulo/:itemId - Obter item específico
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, submodulo, itemId } = req.params;

      // Se o usuário logado for trabalhador, ele só pode acessar os seus próprios dados
      if ((req as any).user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador.findOne({ cpf: (req as any).user.cpf });
        if (!trabalhador || id !== trabalhador._id.toString()) {
          throw new AppError('Sem permissão para acessar os dados deste trabalhador', 403);
        }
      }

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

      if ((req as any).user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para cadastrar registros em submódulos de trabalhadores', 403);
      }

      const Model = SUBMODULO_MODELS[submodulo];
      if (!Model) {
        throw new AppError(`Submódulo "${submodulo}" não é válido`, 400);
      }

      // Sanitização: mantém apenas campos definidos no schema do Mongoose
      const allowedPaths = Object.keys(Model.schema.paths).filter(
        (p: string) => !p.startsWith('_') && p !== '__v'
      );
      const dados: Record<string, unknown> = {};
      for (const key of Object.keys(req.body)) {
        if (allowedPaths.includes(key)) {
          dados[key] = req.body[key];
        }
      }

      const item = await Model.create({ ...dados, trabalhadorId: id });

      const entidade = submodulo === 'vinculos' ? 'Vinculo' : submodulo.slice(0, -1);
      await logAction(req, 'CREATE', entidade, item._id.toString(), item);

      return res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/trabalhadores/:id/:submodulo/:itemId - Atualizar item
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, submodulo, itemId } = req.params;

      if ((req as any).user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para atualizar registros em submódulos de trabalhadores', 403);
      }

      const Model = SUBMODULO_MODELS[submodulo];
      if (!Model) {
        throw new AppError(`Submódulo "${submodulo}" não é válido`, 400);
      }

      // Sanitização: mantém apenas campos definidos no schema do Mongoose
      const allowedPaths = Object.keys(Model.schema.paths).filter(
        (p: string) => !p.startsWith('_') && p !== '__v'
      );
      const dados: Record<string, unknown> = {};
      for (const key of Object.keys(req.body)) {
        if (allowedPaths.includes(key)) {
          dados[key] = req.body[key];
        }
      }

      const itemAntigo = await Model.findOne({ _id: itemId, trabalhadorId: id });
      if (!itemAntigo) {
        throw new AppError('Item não encontrado', 404);
      }

      const item = await Model.findOneAndUpdate(
        { _id: itemId, trabalhadorId: id },
        dados,
        { new: true, runValidators: true }
      );

      const entidade = submodulo === 'vinculos' ? 'Vinculo' : submodulo.slice(0, -1);
      const mudancas = compararDados(itemAntigo, item);
      await logAction(req, 'UPDATE', entidade, itemId, mudancas);

      return res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/trabalhadores/:id/:submodulo/:itemId - Deletar item
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, submodulo, itemId } = req.params;

      if ((req as any).user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para deletar registros em submódulos de trabalhadores', 403);
      }

      const Model = SUBMODULO_MODELS[submodulo];
      if (!Model) {
        throw new AppError(`Submódulo "${submodulo}" não é válido`, 400);
      }

      const item = await Model.findOne({ _id: itemId, trabalhadorId: id });
      if (!item) {
        throw new AppError('Item não encontrado', 404);
      }

      const entidade = submodulo === 'vinculos' ? 'Vinculo' : submodulo.slice(0, -1);
      await logAction(req, 'DELETE', entidade, itemId, item);

      await Model.deleteOne({ _id: itemId, trabalhadorId: id });

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new SubmoduloTrabalhadorController();
