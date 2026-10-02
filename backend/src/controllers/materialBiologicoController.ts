import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import materialBiologicoService from '../services/MaterialBiologicoService.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';
import { IAuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { buildUserScope } from '../utils/scope.js';
import Acidente from '../models/Acidente.js';
import { assertCanReadWorker, assertCanManageHealthRecord, assertCanWriteHealthRecord } from '../services/AuthorizationService.js';

export const criar = asyncHandler(async (req: Request, res: Response) => {
  const scope = await buildUserScope((req as IAuthRequest).user!);

  if (scope.perfil === 'trabalhador') {
    throw new AppError('A pessoa trabalhadora não pode editar o próprio histórico sem permissão explícita', 403);
  }

  const { acidenteId } = req.body;
  if (!acidenteId) {
    throw new AppError('Acidente é obrigatório', 400);
  }

  // Validação centralizada do trabalhador-alvo do acidente integrando escopo (anti-IDOR)
  if (scope.perfil !== 'admin') {
    const acidente = await Acidente.findById(acidenteId).select('trabalhadorId').lean();
    if (!acidente) {
      throw new AppError('Acidente não encontrado', 404);
    }
    const trabalhadorId = (acidente as any).trabalhadorId?.toString();
    if (!trabalhadorId) {
      throw new AppError('Trabalhador não vinculado ao acidente', 400);
    }
    await assertCanWriteHealthRecord(scope, trabalhadorId, 'Material Biológico');
  }

  const ficha = await materialBiologicoService.criar(req.body);

  await logAction(req, 'CREATE', 'MaterialBiologico', ficha._id!.toString(), ficha);

  res.status(201).json({
    status: 'success',
    data: { ficha },
  });
});

export const obter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const ficha = await materialBiologicoService.obter(id);

  if (!ficha) {
    throw new AppError('Ficha não encontrada', 404);
  }

  // Verificação centralizada de escopo anti-IDOR via acidente vinculado
  if (scope.perfil !== 'admin' && (ficha as any).acidenteId) {
    const acidente = await Acidente.findById((ficha as any).acidenteId).select('trabalhadorId').lean();
    const trabalhadorId = (acidente as any)?.trabalhadorId?.toString() ?? null;
    if (trabalhadorId) {
      await assertCanReadWorker(scope, trabalhadorId);
    }
  }

  res.status(200).json({
    status: 'success',
    data: { ficha },
  });
});

export const obterPorAcidente = asyncHandler(async (req: Request, res: Response) => {
  const { acidenteId } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);

  // Verificação centralizada de escopo anti-IDOR do acidente
  if (scope.perfil !== 'admin') {
    const acidente = await Acidente.findById(acidenteId).select('trabalhadorId').lean();
    if (!acidente) {
      throw new AppError('Acidente não encontrado', 404);
    }
    const trabalhadorId = (acidente as any).trabalhadorId?.toString();
    if (trabalhadorId) {
      await assertCanReadWorker(scope, trabalhadorId);
    }
  }

  const ficha = await materialBiologicoService.obterPorAcidente(acidenteId);

  res.status(200).json({
    status: 'success',
    data: { ficha },
  });
});

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });
  const scope = await buildUserScope((req as IAuthRequest).user!);

  // Somente admin pode listar todas as fichas sem filtro por trabalhador
  // Outros perfis não possuem acesso irrestrito a esta listagem
  if (scope.perfil !== 'admin') {
    throw new AppError('Sem permissão para listar todas as fichas de material biológico', 403);
  }

  const filtros = {
    tipoExposicao: req.query.tipoExposicao as string,
    agente: req.query.agente as string,
  };

  const { fichas, total } = await materialBiologicoService.listar(page, limit, filtros);

  res.status(200).json({
    status: 'success',
    data: {
      fichas,
      paginacao: getPaginationResult(total, page, limit),
    },
  });
});

export const atualizar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);

  if (scope.perfil === 'trabalhador') {
    throw new AppError('A pessoa trabalhadora não pode editar o próprio histórico sem permissão explícita', 403);
  }

  const fichaAntiga = await materialBiologicoService.obter(id);

  if (!fichaAntiga) {
    throw new AppError('Ficha não encontrada', 404);
  }

  // Verificação centralizada de escopo anti-IDOR via acidente vinculado
  if (scope.perfil !== 'admin' && (fichaAntiga as any).acidenteId) {
    const acidente = await Acidente.findById((fichaAntiga as any).acidenteId).select('trabalhadorId').lean();
    const trabalhadorId = (acidente as any)?.trabalhadorId?.toString() ?? null;
    if (trabalhadorId) {
      await assertCanManageHealthRecord(scope, { trabalhadorId }, 'Ficha de Material Biológico');
    }
  }

  // Prevenir transferir ficha para outro acidente
  const dadosAtualizacao = { ...req.body };
  delete dadosAtualizacao.acidenteId;
  delete dadosAtualizacao._id;

  const ficha = await materialBiologicoService.atualizar(id, dadosAtualizacao);

  const mudancas = compararDados(fichaAntiga, ficha);
  await logAction(req, 'UPDATE', 'MaterialBiologico', id, mudancas);

  res.status(200).json({
    status: 'success',
    data: { ficha },
  });
});

export const deletar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);

  if (scope.perfil === 'trabalhador') {
    throw new AppError('A pessoa trabalhadora não pode editar o próprio histórico sem permissão explícita', 403);
  }

  const fichaAntiga = await materialBiologicoService.obter(id);
  if (!fichaAntiga) {
    throw new AppError('Ficha não encontrada', 404);
  }

  // Verificação centralizada de escopo anti-IDOR via acidente vinculado
  if (scope.perfil !== 'admin' && (fichaAntiga as any).acidenteId) {
    const acidente = await Acidente.findById((fichaAntiga as any).acidenteId).select('trabalhadorId').lean();
    const trabalhadorId = (acidente as any)?.trabalhadorId?.toString() ?? null;
    if (trabalhadorId) {
      await assertCanManageHealthRecord(scope, { trabalhadorId }, 'Ficha de Material Biológico');
    }
  }

  await materialBiologicoService.deletar(id);

  await logAction(req, 'DELETE', 'MaterialBiologico', id, fichaAntiga);

  res.status(204).send();
});
