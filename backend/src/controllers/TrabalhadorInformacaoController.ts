import { Request, Response, NextFunction } from 'express';
import TrabalhadorInformacaoService from '../services/TrabalhadorInformacaoService';
import { AppError } from '../middleware/errorHandler';
import { getPaginationParams } from '../utils/pagination.js';
import { IAuthRequest } from '../middleware/auth.js';
import { buildUserScope } from '../utils/scope.js';
import { assertCanReadWorker, assertCanWriteHealthRecord } from '../services/AuthorizationService.js';

class TrabalhadorInformacaoController {
  // GET /api/trabalhadores/:id/informacoes - Listar informações de um trabalhador
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const scope = await buildUserScope((req as IAuthRequest).user!);

      // Validação centralizada de escopo anti-IDOR
      await assertCanReadWorker(scope, id);

      const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 100 });
      const result = await TrabalhadorInformacaoService.listarPorTrabalhador(id, page, limit);

      res.setHeader('X-Total-Count', result.total.toString());
      res.setHeader('X-Page', page.toString());
      res.setHeader('X-Limit', limit.toString());

      return res.status(200).json(result.informacoes);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/trabalhadores/:id/informacoes/:infoId - Obter informação específica
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, infoId } = req.params;
      const scope = await buildUserScope((req as IAuthRequest).user!);

      // Validação centralizada de escopo anti-IDOR
      await assertCanReadWorker(scope, id);

      const informacao = await TrabalhadorInformacaoService.obterPorId(infoId);

      if (!informacao || informacao.trabalhadorId.toString() !== id) {
        throw new AppError('Informação não encontrada', 404);
      }

      return res.status(200).json(informacao);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/trabalhadores/:id/informacoes - Criar nova informação
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const scope = await buildUserScope((req as IAuthRequest).user!);

      if (scope.perfil === 'trabalhador') {
        throw new AppError('A pessoa trabalhadora não pode editar o próprio histórico sem permissão explícita', 403);
      }

      // Validação de escopo multiempresa e trabalhador-alvo
      await assertCanWriteHealthRecord(scope, id, 'InformacaoTrabalhador');

      const dados = { ...req.body };
      delete dados.trabalhadorId;
      delete dados._id;

      const informacao = await TrabalhadorInformacaoService.criar({
        ...dados,
        trabalhadorId: id,
      });

      return res.status(201).json(informacao);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/trabalhadores/:id/informacoes/:infoId - Atualizar informação
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, infoId } = req.params;
      const scope = await buildUserScope((req as IAuthRequest).user!);

      if (scope.perfil === 'trabalhador') {
        throw new AppError('A pessoa trabalhadora não pode editar o próprio histórico sem permissão explícita', 403);
      }

      // Validação de escopo multiempresa e trabalhador-alvo
      await assertCanWriteHealthRecord(scope, id, 'InformacaoTrabalhador');

      const dados = { ...req.body };
      delete dados.trabalhadorId;
      delete dados._id;

      const informacao = await TrabalhadorInformacaoService.atualizar(infoId, dados);

      if (!informacao || informacao.trabalhadorId.toString() !== id) {
        throw new AppError('Informação não encontrada', 404);
      }

      return res.status(200).json(informacao);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/trabalhadores/:id/informacoes/:infoId - Deletar informação
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, infoId } = req.params;
      const scope = await buildUserScope((req as IAuthRequest).user!);

      if (scope.perfil === 'trabalhador') {
        throw new AppError('A pessoa trabalhadora não pode editar o próprio histórico sem permissão explícita', 403);
      }

      // Validação de escopo multiempresa e trabalhador-alvo
      await assertCanWriteHealthRecord(scope, id, 'InformacaoTrabalhador');

      const existe = await TrabalhadorInformacaoService.obterPorId(infoId);
      if (!existe || existe.trabalhadorId.toString() !== id) {
        throw new AppError('Informação não encontrada', 404);
      }

      await TrabalhadorInformacaoService.deletar(infoId);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new TrabalhadorInformacaoController();
