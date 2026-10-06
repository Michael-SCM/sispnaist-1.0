import { Request, Response, NextFunction } from 'express';
import TrabalhadorDependente from '../models/TrabalhadorDependente';
import TrabalhadorAfastamento from '../models/TrabalhadorAfastamento';
import TrabalhadorOcorrenciaViolencia from '../models/TrabalhadorOcorrenciaViolencia';
import TrabalhadorReadaptacao from '../models/TrabalhadorReadaptacao';
import TrabalhadorProcessoTrabalho from '../models/TrabalhadorProcessoTrabalho';
import TrabalhadorVinculo from '../models/TrabalhadorVinculo';
import TrabalhadorHistoricoPPP from '../models/TrabalhadorHistoricoPPP';
import TrabalhadorRiscoOcupacional from '../models/TrabalhadorRiscoOcupacional';
import TrabalhadorExameSaude from '../models/TrabalhadorExameSaude';
import TrabalhadorInternacao from '../models/TrabalhadorInternacao';
import { AppError } from '../middleware/errorHandler';
import { getPaginationParams } from '../utils/pagination.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { IAuthRequest } from '../middleware/auth.js';
import { buildUserScope } from '../utils/scope.js';
import { assertCanReadWorker, assertCanWriteHealthRecord } from '../services/AuthorizationService.js';

/**
 * Controller unificado para todos os submódulos do trabalhador.
 */

// Mapeamento de submódulos para models
const SUBMODULO_MODELS: any = {
  dependentes: TrabalhadorDependente,
  afastamentos: TrabalhadorAfastamento,
  ocorrenciasViolencia: TrabalhadorOcorrenciaViolencia,
  readaptacoes: TrabalhadorReadaptacao,
  processosTrabalho: TrabalhadorProcessoTrabalho,
  vinculos: TrabalhadorVinculo,
  historicoPPP: TrabalhadorHistoricoPPP,
  riscosOcupacionais: TrabalhadorRiscoOcupacional,
  examesSaude: TrabalhadorExameSaude,
  internacoes: TrabalhadorInternacao
};

class SubmoduloTrabalhadorController {
  // GET /api/trabalhadores/:id/:submodulo - Lista submódulos de um trabalhador
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, submodulo } = req.params;
      const { ativo } = req.query;
      const scope = await buildUserScope((req as IAuthRequest).user!);

      // Validação de escopo centralizada anti-IDOR
      await assertCanReadWorker(scope, id);

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
      const scope = await buildUserScope((req as IAuthRequest).user!);

      // Validação de escopo centralizada anti-IDOR
      await assertCanReadWorker(scope, id);

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
      const scope = await buildUserScope((req as IAuthRequest).user!);

      if (scope.perfil === 'trabalhador') {
        throw new AppError('A pessoa trabalhadora não pode editar o próprio histórico sem permissão explícita', 403);
      }

      // Validação de escopo multiempresa e trabalhador-alvo
      await assertCanWriteHealthRecord(scope, id, submodulo);

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
        if (allowedPaths.includes(key) || allowedPaths.some((p: string) => p.startsWith(key + '.'))) {
          dados[key] = req.body[key];
        }
      }

      delete dados.trabalhadorId;
      delete dados._id;

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
      const scope = await buildUserScope((req as IAuthRequest).user!);

      if (scope.perfil === 'trabalhador') {
        throw new AppError('A pessoa trabalhadora não pode editar o próprio histórico sem permissão explícita', 403);
      }

      // Validação de escopo multiempresa e trabalhador-alvo
      await assertCanWriteHealthRecord(scope, id, submodulo);

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
        if (allowedPaths.includes(key) || allowedPaths.some((p: string) => p.startsWith(key + '.'))) {
          dados[key] = req.body[key];
        }
      }

      delete dados.trabalhadorId;
      delete dados._id;

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
      const scope = await buildUserScope((req as IAuthRequest).user!);

      if (scope.perfil === 'trabalhador') {
        throw new AppError('A pessoa trabalhadora não pode editar o próprio histórico sem permissão explícita', 403);
      }

      // Validação de escopo multiempresa e trabalhador-alvo
      await assertCanWriteHealthRecord(scope, id, submodulo);

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
