import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import unidadeService from '../services/UnidadeService.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction } from '../utils/auditLogger.js';
import Unidade from '../models/Unidade.js';
import Empresa from '../models/Empresa.js';


/**
 * @desc    Listar unidades com paginação e filtros
 * @route   GET /api/unidades
 * @access  Private/Admin
 */
export const getUnidades = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const filtros = {
    nome: req.query.nome as string,
    empresaId: req.query.empresaId as string,
  };

  const result = await unidadeService.listar(page, limit, filtros);

  res.status(200).json({
    status: 'success',
    ...result,
  });
});

/**
 * @desc    Obter uma única unidade
 * @route   GET /api/unidades/:id
 * @access  Private/Admin
 */
export const getUnidade = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const unidade = await unidadeService.obter(id);

  res.status(200).json({
    status: 'success',
    data: { unidade },
  });
});

/**
 * @desc    Criar nova unidade
 * @route   POST /api/unidades
 * @access  Private/Admin
 */
export const createUnidade = asyncHandler(async (req: Request, res: Response) => {
  const unidade = await unidadeService.criar(req.body);

  await logAction(req, 'CREATE', 'Unidade', unidade._id!.toString(), {
    nomeUnidadeDetalhe: (unidade as any).nome,
    nomeEmpresaDetalhe: (unidade as any).empresaId?.nomeFantasia || (unidade as any).empresaId?.razaoSocial,
  });

  res.status(201).json({
    status: 'success',
    data: { unidade },
  });
});


/**
 * @desc    Atualizar unidade
 * @route   PUT /api/unidades/:id
 * @access  Private/Admin
 */
export const updateUnidade = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const unidade = await unidadeService.atualizar(id, req.body);

  await logAction(req, 'UPDATE', 'Unidade', id, {
    nomeUnidadeDetalhe: (unidade as any).nome,
    nomeEmpresaDetalhe: (unidade as any).empresaId?.nomeFantasia || (unidade as any).empresaId?.razaoSocial,
  });

  res.status(200).json({
    status: 'success',
    data: { unidade },
  });
});


/**
 * @desc    Deletar unidade
 * @route   DELETE /api/unidades/:id
 * @access  Private/Admin
 */
export const deleteUnidade = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const unidadeParaLog = await Unidade.findById(id).populate('empresaId', 'razaoSocial nomeFantasia').lean();
  if (!unidadeParaLog) {
    throw new AppError('Unidade não encontrada', 404);
  }

  await logAction(req, 'DELETE', 'Unidade', id, {
    nomeUnidadeDetalhe: (unidadeParaLog as any).nome,
    nomeEmpresaDetalhe: (unidadeParaLog as any).empresaId?.nomeFantasia || (unidadeParaLog as any).empresaId?.razaoSocial,
  });

  await unidadeService.deletar(id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});


/**
 * @desc    Listar unidades por empresa
 * @route   GET /api/unidades/empresa/:empresaId
 * @access  Private
 */
export const getUnidadesPorEmpresa = asyncHandler(async (req: Request, res: Response) => {
  const { empresaId } = req.params;
  const unidades = await unidadeService.listarPorEmpresa(empresaId);

  res.status(200).json({
    status: 'success',
    data: { unidades },
  });
});
