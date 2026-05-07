import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import trabalhadorService from '../services/TrabalhadorService.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction } from '../utils/auditLogger.js';

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
  try {
    const trabalhador = await trabalhadorService.criar(req.body);

    await logAction(req, 'CREATE', 'Trabalhador', trabalhador._id!.toString(), {
      nome: trabalhador.nome,
      cpf: trabalhador.cpf
    });

    res.status(201).json({
      status: 'success',
      data: { trabalhador },
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      // Adicionar o body recebido para debug
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
  const trabalhador = await trabalhadorService.atualizar(id, req.body);

  await logAction(req, 'UPDATE', 'Trabalhador', id, {
    nome: trabalhador.nome
  });

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

  await logAction(req, 'DELETE', 'Trabalhador', id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
