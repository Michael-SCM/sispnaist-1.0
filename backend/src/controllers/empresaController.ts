import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import empresaService from '../services/EmpresaService.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams } from '../utils/pagination.js';
import { IAuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { buildUserScope } from '../utils/scope.js';
import { assertCanReadCompany, assertCanManageCompany, assertCanReadUnit } from '../services/AuthorizationService.js';

/**
 * @desc    Listar empresas com paginação e filtros
 * @route   GET /api/empresas
 * @access  Private/Admin/Gestor
 */
export const getEmpresas = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });
  const scope = await buildUserScope((req as IAuthRequest).user!);
  
  const filtros: any = {
    razaoSocial: req.query.razaoSocial as string,
    cnpj: req.query.cnpj as string,
  };

  // Gestor: filtrar apenas a própria empresa
  if (scope.perfil === 'gestor' && scope.empresaScope) {
    filtros._id = scope.empresaScope;
  }

  const result = await empresaService.listar(page, limit, filtros);

  res.status(200).json({
    status: 'success',
    ...result,
  });
});

/**
 * @desc    Obter uma única empresa
 * @route   GET /api/empresas/:id
 * @access  Private/Admin/Gestor
 */
export const getEmpresa = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);

  // Verificação centralizada de escopo anti-IDOR (retorna 404, não 403)
  await assertCanReadCompany(scope, id);

  const empresa = await empresaService.obter(id);

  res.status(200).json({
    status: 'success',
    data: { empresa },
  });
});

/**
 * @desc    Criar nova empresa
 * @route   POST /api/empresas
 * @access  Private/Admin
 */
export const createEmpresa = asyncHandler(async (req: Request, res: Response) => {
  const scope = await buildUserScope((req as IAuthRequest).user!);
  // Somente admin pode criar empresas
  await assertCanManageCompany(scope);

  const empresa = await empresaService.criar(req.body);
  
  await logAction(req, 'CREATE', 'Empresa', empresa._id!.toString(), empresa);

  res.status(201).json({
    status: 'success',
    data: { empresa },
  });
});

/**
 * @desc    Atualizar empresa
 * @route   PUT /api/empresas/:id
 * @access  Private/Admin
 */
export const updateEmpresa = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  await assertCanManageCompany(scope, id);

  const empresaAntiga = await empresaService.obter(id);
  const empresa = await empresaService.atualizar(id, req.body);
  
  const mudancas = compararDados(empresaAntiga, empresa);
  await logAction(req, 'UPDATE', 'Empresa', id, mudancas);

  res.status(200).json({
    status: 'success',
    data: { empresa },
  });
});

/**
 * @desc    Deletar empresa
 * @route   DELETE /api/empresas/:id
 * @access  Private/Admin
 */
export const deleteEmpresa = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  await assertCanManageCompany(scope, id);
  
  const empresaAntiga = await empresaService.obter(id);
  await empresaService.deletar(id);

  await logAction(req, 'DELETE', 'Empresa', id, empresaAntiga);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Buscar empresa vinculada a uma unidade
 * @route   GET /api/empresas/unidade/:unidadeId
 * @access  Private
 */
export const getEmpresaPorUnidade = asyncHandler(async (req: Request, res: Response) => {
  const { unidadeId } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  await assertCanReadUnit(scope, unidadeId);

  const empresa = await empresaService.listarPorUnidade(unidadeId);

  res.status(200).json({
    status: 'success',
    data: { empresa },
  });
});
