import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import userService from '../services/UserService.js';

/**
 * @desc    Listar usuários com paginação e filtros
 * @route   GET /api/usuarios
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const filtros = {
    nome: req.query.nome as string,
    email: req.query.email as string,
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
  const usuario = await userService.atualizar(id, req.body);

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
  await userService.deletar(id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
