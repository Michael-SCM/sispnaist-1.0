import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import trabalhadorService from '../services/TrabalhadorService.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Listar trabalhadores com paginação e filtros
 * @route   GET /api/trabalhadores
 * @access  Private
 */
export const getTrabalhadores = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const filtros = {
    nome: req.query.nome as string,
    cpf: req.query.cpf as string,
    matricula: req.query.matricula as string,
    setor: req.query.setor as string,
  };

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
  const trabalhador = await trabalhadorService.obter(id);

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
  const trabalhador = await trabalhadorService.criar(req.body);

  res.status(201).json({
    status: 'success',
    data: { trabalhador },
  });
});

/**
 * @desc    Atualizar trabalhador
 * @route   PUT /api/trabalhadores/:id
 * @access  Private/Admin/Saude
 */
export const updateTrabalhador = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const trabalhador = await trabalhadorService.atualizar(id, req.body);

  res.status(200).json({
    status: 'success',
    data: { trabalhador },
  });
});

/**
 * @desc    Deletar trabalhador
 * @route   DELETE /api/trabalhadores/:id
 * @access  Private/Admin
 */
export const deleteTrabalhador = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await trabalhadorService.deletar(id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
