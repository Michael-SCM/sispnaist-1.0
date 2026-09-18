import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import trabalhadorService from '../services/TrabalhadorService.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams } from '../utils/pagination.js';
import { IAuthRequest } from '../middleware/auth.js';
import { buildUserScope } from '../utils/scope.js';
import Trabalhador from '../models/Trabalhador.js';
import { assertCanReadWorker, assertCanManageWorker } from '../services/AuthorizationService.js';

/**
 * @desc    Listar trabalhadores com paginação e filtros
 * @route   GET /api/trabalhadores
 * @access  Private
 */
export const getTrabalhadores = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });
  const scope = await buildUserScope((req as IAuthRequest).user!);
  
  const filtros: any = {
    nome: req.query.nome as string,
    cpf: req.query.cpf as string,
    cartaoSus: req.query.cartaoSus as string,
    matricula: req.query.matricula as string,
    setor: req.query.setor as string,
  };

  // Aplicar escopo: gestor vê apenas trabalhadores da sua empresa
  if (scope.perfil === 'gestor' && scope.empresaScope) {
    filtros.empresa = scope.empresaScope;
  }

  // Se o usuário logado for trabalhador, força o filtro por seu próprio CPF
  if (scope.perfil === 'trabalhador' || scope.perfil === 'saude') {
    filtros.cpf = (req as any).user.cpf;
  }

  const result = await trabalhadorService.listar(page, limit, filtros);

  res.status(200).json({
    status: 'success',
    ...result,
  });
});

/**
 * @desc    Obter um único trabalhador
 * @route   GET /api/trabalhadores/:id
 * @access  Private
 */
export const getTrabalhador = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const trabalhador = await trabalhadorService.obter(id);

  if (!trabalhador) {
    throw new AppError('Trabalhador não encontrado', 404);
  }

  // Verificação centralizada de escopo anti-IDOR (retorna 404, não 403)
  await assertCanReadWorker(scope, id);

  res.status(200).json({
    status: 'success',
    data: { trabalhador },
  });
});

/**
 * @desc    Obter um único trabalhador com todos os submódulos
 * @route   GET /api/trabalhadores/:id/completo
 * @access  Private
 */
export const getTrabalhadorCompleto = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const trabalhador = await trabalhadorService.obterComSubmodulos(id);

  if (!trabalhador) {
    throw new AppError('Trabalhador não encontrado', 404);
  }

  // Verificação centralizada de escopo anti-IDOR (retorna 404, não 403)
  await assertCanReadWorker(scope, id);

  res.status(200).json({
    status: 'success',
    data: { trabalhador },
  });
});

/**
 * @desc    Criar novo trabalhador
 * @route   POST /api/trabalhadores
 * @access  Private/Admin/Saude
 */
export const createTrabalhador = asyncHandler(async (req: Request, res: Response) => {
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para cadastrar trabalhadores', 403);
  }

  try {
    const trabalhador = await trabalhadorService.criar(req.body);

    await logAction(req, 'CREATE', 'Trabalhador', trabalhador._id!.toString(), trabalhador);

    res.status(201).json({
      status: 'success',
      data: { trabalhador },
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      (error as any).receivedBody = req.body;
    }
    throw error;
  }
});

/**
 * @desc    Atualizar trabalhador
 * @route   PUT /api/trabalhadores/:id
 * @access  Private/Admin/Saude
 */
export const updateTrabalhador = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);

  // Verificação centralizada de escopo anti-IDOR para gerenciamento
  await assertCanManageWorker(scope, id);

  const trabalhadorAntigo = await trabalhadorService.obter(id);
  const trabalhadorNovo = await trabalhadorService.atualizar(id, req.body);

  const mudancas = compararDados(trabalhadorAntigo, trabalhadorNovo);

  await logAction(req, 'UPDATE', 'Trabalhador', id, mudancas);

  res.status(200).json({
    status: 'success',
    data: { trabalhador: trabalhadorNovo },
  });
});

/**
 * @desc    Deletar trabalhador
 * @route   DELETE /api/trabalhadores/:id
 * @access  Private/Admin
 */
export const deleteTrabalhador = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);

  // Verificação centralizada de escopo anti-IDOR para gerenciamento
  await assertCanManageWorker(scope, id);

  const trabalhador = await trabalhadorService.obter(id);

  await logAction(req, 'DELETE', 'Trabalhador', id, trabalhador);

  await trabalhadorService.deletar(id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
