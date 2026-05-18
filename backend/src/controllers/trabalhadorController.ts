import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import trabalhadorService from '../services/TrabalhadorService.js';
import Trabalhador from '../models/Trabalhador.js';
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
  
  const filtros: any = {
    nome: req.query.nome as string,
    cpf: req.query.cpf as string,
    matricula: req.query.matricula as string,
    setor: req.query.setor as string,
  };

  // Se o usuário logado for trabalhador, força o filtro por seu próprio CPF
  if ((req as any).user?.perfil === 'trabalhador') {
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
  const trabalhador = await trabalhadorService.obter(id);

  if (!trabalhador) {
    throw new AppError('Trabalhador não encontrado', 404);
  }

  // Se o usuário logado for trabalhador, ele só pode acessar seu próprio perfil (CPF correspondente)
  if ((req as any).user?.perfil === 'trabalhador' && trabalhador.cpf !== (req as any).user.cpf) {
    throw new AppError('Sem permissão para acessar os dados deste trabalhador', 403);
  }

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
  const authReq = req as any;

  // Se for perfil trabalhador, impõe regras de autocadastro estritas
  if (authReq.user?.perfil === 'trabalhador') {
    // 1. O CPF enviado no cadastro deve ser obrigatoriamente o dele
    if (req.body.cpf !== authReq.user.cpf) {
      throw new AppError('Você só pode cadastrar um perfil com o seu próprio CPF', 403);
    }

    // 2. Não pode cadastrar mais de uma vez (apenas 1 perfil)
    const existing = await Trabalhador.findOne({ cpf: authReq.user.cpf });
    if (existing) {
      throw new AppError('Você já possui um perfil de trabalhador cadastrado', 400);
    }
  }

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
  const authReq = req as any;
  const { id } = req.params;

  // Se for perfil trabalhador, impõe regras de autoedição estritas
  if (authReq.user?.perfil === 'trabalhador') {
    const trabalhadorExistente = await trabalhadorService.obter(id);
    if (!trabalhadorExistente || trabalhadorExistente.cpf !== authReq.user.cpf) {
      throw new AppError('Sem permissão para atualizar os dados deste trabalhador', 403);
    }

    // Impedir que o trabalhador altere o CPF do seu próprio cadastro para burlar filtros de segurança
    if (req.body.cpf && req.body.cpf !== authReq.user.cpf) {
      throw new AppError('Você não pode alterar o CPF do seu perfil', 400);
    }
  }

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
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para deletar cadastros de trabalhadores', 403);
  }

  const { id } = req.params;
  await trabalhadorService.deletar(id);

  await logAction(req, 'DELETE', 'Trabalhador', id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
