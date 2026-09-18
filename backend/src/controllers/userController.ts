import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import userService from '../services/UserService.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams } from '../utils/pagination.js';
import { IAuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { buildUserScope } from '../utils/scope.js';
import User from '../models/User.js';

/**
 * @desc    Listar usuários com paginação e filtros
 * @route   GET /api/usuarios
 * @access  Private/Admin/Gestor
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });
  const scope = await buildUserScope((req as IAuthRequest).user!);
  
  const filtros: any = {
    nome: req.query.nome as string,
    email: req.query.email as string,
    cpf: req.query.cpf as string,
    perfil: req.query.perfil as string,
  };

  // Gestor: filtrar apenas usuários da mesma empresa
  if (scope.perfil === 'gestor' && scope.empresaScope) {
    filtros.empresa = scope.empresaScope;
  }

  const result = await userService.listar(page, limit, filtros);

  res.status(200).json({
    status: 'success',
    ...result,
  });
});

/**
 * @desc    Obter um único usuário
 * @route   GET /api/usuarios/:id
 * @access  Private/Admin/Gestor
 */
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildUserScope((req as IAuthRequest).user!);

  // Gestor: verificar se o usuário pertence à mesma empresa
  if (scope.perfil === 'gestor') {
    const usuario = await User.findById(id).select('empresa').lean();
    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }
    if ((usuario as any).empresa?.toString() !== scope.empresaScope) {
      throw new AppError('Sem permissão para acessar este usuário', 403);
    }
  }

  const usuario = await userService.obter(id);

  res.status(200).json({
    status: 'success',
    data: { usuario },
  });
});

/**
 * @desc    Atualizar usuário (perfil/status)
 * @route   PUT /api/usuarios/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const usuarioAntigo = await userService.obter(id);
  const usuario = await userService.atualizar(id, req.body);

  const mudancas = compararDados(usuarioAntigo, usuario);
  await logAction(req, 'UPDATE', 'User', id, mudancas);

  res.status(200).json({
    status: 'success',
    data: { usuario },
  });
});

/**
 * @desc    Deletar usuário
 * @route   DELETE /api/usuarios/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const usuarioAntigo = await userService.obter(id);
  await userService.deletar(id);

  await logAction(req, 'DELETE', 'User', id, usuarioAntigo);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
