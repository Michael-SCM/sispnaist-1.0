import { Request, Response } from 'express';
import doencaService from '../services/DoencaService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import Trabalhador from '../models/Trabalhador.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';
import { notificarSinanParaTrabalhador } from '../utils/notificarSinan.js';
import { IAuthRequest } from '../middleware/auth.js';
import { buildUserScope } from '../utils/scope.js';
import { obterIdsTrabalhadorPorCpf } from '../utils/obterIdsTrabalhadorPorCpf.js';
import { assertCanReadHealthRecord, assertCanManageHealthRecord, assertCanReadWorker } from '../services/AuthorizationService.js';

export const criar = asyncHandler(async (req: Request, res: Response) => {
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para criar registros de doenças', 403);
  }

  const doencaData = {
    ...req.body,
    trabalhadorId: req.body.trabalhadorId,
  };

  const doenca = await doencaService.criar(doencaData);

  await logAction(req, 'CREATE', 'Doenca', doenca._id!.toString(), doenca);

  notificarSinanParaTrabalhador(req, doenca.trabalhadorId, {
    tipoNotificacao: 'Doença Relacionada ao Trabalho',
    dataOcorrencia: (doenca.dataInicio as Date)?.toISOString?.() || String(doenca.dataInicio),
    codigoAgravo: doenca.codigoDoenca || '',
    nomeAgravo: doenca.nomeDoenca || '',
  });

  res.status(201).json({ sucesso: true, dados: doenca });
});

export const obter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const doenca = await doencaService.obter(id);

  if (!doenca) {
    throw new AppError('Doença não encontrada', 404);
  }

  // Verificação centralizada de escopo anti-IDOR
  await assertCanReadHealthRecord(scope, doenca, 'Doença');

  res.status(200).json({ sucesso: true, dados: doenca });
});

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });
  const scope = await buildUserScope((req as IAuthRequest).user!);

  const filtros: any = {
    nomeDoenca: req.query.nomeDoenca as string,
    ativo: req.query.ativo ? req.query.ativo === 'true' : undefined,
    trabalhadorId: req.query.trabalhadorId as string,
    dataInicio: req.query.dataInicio as string,
    dataFim: req.query.dataFim as string,
    cartaoSus: req.query.cartaoSus as string,
  };

  // Normaliza CPF de filtro (remove máscara) para evitar erros de validação
  if (typeof filtros.trabalhadorId === 'string' && filtros.trabalhadorId.trim()) {
    filtros.trabalhadorId = filtros.trabalhadorId.replace(/\D/g, '');
  }

  // Gestor: forçar filtro por trabalhadores da empresa
  if (scope.perfil === 'gestor' && scope.empresaScope) {
    const trabalhadores = await Trabalhador.find({ empresa: scope.empresaScope }).select('_id').lean();
    const ids = trabalhadores.map((t: any) => t._id.toString());
    if (ids.length === 0) {
      filtros.trabalhadorId = '000000000000000000000000';
    } else if (ids.length === 1) {
      filtros.trabalhadorId = ids[0];
    } else {
      filtros.trabalhadorIds = ids;
      delete filtros.trabalhadorId;
    }
  }

  // Se o usuário logado for trabalhador, força o filtro por seu próprio ID de trabalhador
  if (scope.perfil === 'trabalhador' || scope.perfil === 'saude') {
    const ids = await obterIdsTrabalhadorPorCpf((req as any).user.cpf);
    const idsValidos = [ids.trabalhadorId, ids.userId].filter(Boolean) as string[];
    if (idsValidos.length > 1) {
      filtros.trabalhadorIds = idsValidos;
      delete filtros.trabalhadorId;
    } else {
      filtros.trabalhadorId = idsValidos[0] || '000000000000000000000000';
    }
  }

  // Remover filtros undefined
  Object.keys(filtros).forEach((key) => {
    if (filtros[key as keyof typeof filtros] === undefined) {
      delete filtros[key as keyof typeof filtros];
    }
  });

  const { doencas, total } = await doencaService.listar(page, limit, filtros);
  res.status(200).json({
    sucesso: true,
    dados: doencas,
    paginacao: getPaginationResult(total, page, limit),
  });
});

export const atualizar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const doencaAntiga = await doencaService.obter(id);
  
  if (!doencaAntiga) {
    throw new AppError('Doença não encontrada', 404);
  }

  // Verificação centralizada de escopo anti-IDOR para gerenciamento
  await assertCanManageHealthRecord(scope, doencaAntiga, 'Doença');

  const doenca = await doencaService.atualizar(id, req.body);

  const mudancas = compararDados(doencaAntiga, doenca);
  await logAction(req, 'UPDATE', 'Doenca', id, mudancas);

  res.status(200).json({ sucesso: true, dados: doenca });
});

export const deletar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const doencaAntiga = await doencaService.obter(id);
  
  if (!doencaAntiga) {
    throw new AppError('Doença não encontrada', 404);
  }

  // Verificação centralizada de escopo anti-IDOR para gerenciamento
  await assertCanManageHealthRecord(scope, doencaAntiga, 'Doença');

  await doencaService.deletar(id);

  await logAction(req, 'DELETE', 'Doenca', id, doencaAntiga);

  res.status(200).json({ sucesso: true, mensagem: 'Doença deletada com sucesso' });
});

export const obterPorTrabalhador = asyncHandler(async (req: Request, res: Response) => {
  const { trabalhadorId } = req.params;
  const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });
  const scope = await buildUserScope((req as IAuthRequest).user!);

  // Verificação centralizada de escopo anti-IDOR
  await assertCanReadWorker(scope, trabalhadorId);

  const { doencas, total } = await doencaService.obterPorTrabalhador(trabalhadorId, page, limit);
  res.status(200).json({
    sucesso: true,
    dados: doencas,
    paginacao: getPaginationResult(total, page, limit),
  });
});

export const obterEstatisticas = asyncHandler(async (req: Request, res: Response) => {
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para acessar estatísticas gerais', 403);
  }

  const stats = await doencaService.obterEstatisticas();
  res.status(200).json({ sucesso: true, dados: stats });
});
