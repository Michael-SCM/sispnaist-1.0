import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import userService from '../services/UserService.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams } from '../utils/pagination.js';

/**
 * @desc    Listar usuários com paginação e filtros
 * @route   GET /api/usuarios
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });
  
  const filtros = {
    nome: req.query.nome as string,
    email: req.query.email as string,
    cpf: req.query.cpf as string,
    perfil: req.query.perfil as string,
  };

  const result = await userService.listar(page, limit, filtros);

  res.status(200).json({
    status: 'success',
    ...result,
  });
});

/**
 * @desc    Obter um único usuário
 * @route   GET /api/usuarios/:id
 * @access  Private/Admin
 */
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
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
