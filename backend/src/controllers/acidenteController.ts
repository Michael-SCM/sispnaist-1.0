import { Request, Response } from "express";
import { asyncHandler } from '../middleware/asyncHandler.js';
import acidenteService from '../services/AcidenteService.js';
import Trabalhador from '../models/Trabalhador.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';
import { notificarSinanParaTrabalhador } from '../utils/notificarSinan.js';
import { IAuthRequest } from '../middleware/auth.js';
import { buildUserScope } from '../utils/scope.js';
import { obterIdsTrabalhadorPorCpf } from '../utils/obterIdsTrabalhadorPorCpf.js';
import { assertCanReadHealthRecord, assertCanManageHealthRecord, assertCanReadWorker } from '../services/AuthorizationService.js';

export const criar = asyncHandler(async (req: Request, res: Response) => {
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para criar acidentes', 403);
  }

  const acidente = await acidenteService.criar(req.body);

  await logAction(req, 'CREATE', 'Acidente', acidente._id!.toString(), acidente);

  notificarSinanParaTrabalhador(req, acidente.trabalhadorId, {
    tipoNotificacao: 'Acidente de Trabalho',
    dataOcorrencia: (acidente.dataAcidente as Date)?.toISOString?.() || String(acidente.dataAcidente),
    codigoAgravo: acidente.lesoes?.[0] || '',
    nomeAgravo: acidente.descricao || '',
  });

  res.status(201).json({
    status: 'success',
    data: { acidente },
  });
});

export const obter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const acidente = await acidenteService.obter(id);

  if (!acidente) {
    throw new AppError('Acidente não encontrado', 404);
  }

  // Verificação centralizada de escopo anti-IDOR (retorna 404 para não revelar existência)
  await assertCanReadHealthRecord(scope, acidente, 'Acidente');

  res.status(200).json({
    status: 'success',
    data: { acidente },
  });
});

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });
  const scope = await buildUserScope((req as IAuthRequest).user!);

  const filtros: any = {
    tipoAcidente: req.query.tipoAcidente as string | undefined,
    status: req.query.status as string | undefined,
    trabalhadorId: req.query.trabalhadorId as string | undefined,
    dataInicio: req.query.dataInicio as string | undefined,
    dataFim: req.query.dataFim as string | undefined,
    descricao: req.query.descricao as string | undefined,
    cpfTrabalhador: req.query.cpfTrabalhador as string | undefined,
    cartaoSus: req.query.cartaoSus as string | undefined,
  };

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

  // Normaliza CPF do filtro (remover máscara) para evitar validações/rejeições
  if (typeof filtros.cpfTrabalhador === 'string' && filtros.cpfTrabalhador.trim()) {
    filtros.cpfTrabalhador = filtros.cpfTrabalhador.replace(/\D/g, '');
  }


  const { acidentes, total } = await acidenteService.listar(page, limit, filtros);

  res.status(200).json({
    status: 'success',
    data: {
      acidentes,
      paginacao: getPaginationResult(total, page, limit),
    },
  });
});

export const atualizar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const acidenteAntigo = await acidenteService.obter(id);
  
  if (!acidenteAntigo) {
    throw new AppError('Acidente não encontrado', 404);
  }

  // Verificação centralizada de escopo anti-IDOR para gerenciamento
  await assertCanManageHealthRecord(scope, acidenteAntigo, 'Acidente');
  
  const acidente = await acidenteService.atualizar(id, req.body);

  const mudancas = compararDados(acidenteAntigo, acidente);
  await logAction(req, 'UPDATE', 'Acidente', id, mudancas);

  res.status(200).json({
    status: 'success',
    data: { acidente },
  });
});

export const deletar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const acidenteAntigo = await acidenteService.obter(id);
  
  if (!acidenteAntigo) {
    throw new AppError('Acidente não encontrado', 404);
  }

  // Verificação centralizada de escopo anti-IDOR para gerenciamento
  await assertCanManageHealthRecord(scope, acidenteAntigo, 'Acidente');
  
  await acidenteService.deletar(id);

  await logAction(req, 'DELETE', 'Acidente', id, acidenteAntigo);

  res.status(204).send();
});

export const obterPorTrabalhador = asyncHandler(async (req: Request, res: Response) => {
  const { trabalhadorId } = req.params;
  const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });
  const scope = await buildUserScope((req as IAuthRequest).user!);

  // Verificação centralizada de escopo anti-IDOR
  await assertCanReadWorker(scope, trabalhadorId);

  const { acidentes, total } = await acidenteService.obterPorTrabalhador(
    trabalhadorId,
    page,
    limit
  );

  res.status(200).json({
    status: 'success',
    data: {
      acidentes,
      paginacao: getPaginationResult(total, page, limit),
    },
  });
});

export const obterEstatisticas = asyncHandler(async (req: Request, res: Response) => {
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para acessar estatísticas gerais', 403);
  }

  const stats = await acidenteService.obterEstatisticas();

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});
