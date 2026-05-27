import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import empresaService from '../services/EmpresaService.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction } from '../utils/auditLogger.js';
import Empresa from '../models/Empresa.js';


/**
 * @desc    Listar empresas com paginação e filtros
 * @route   GET /api/empresas
 * @access  Private/Admin
 */
export const getEmpresas = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const filtros = {
    razaoSocial: req.query.razaoSocial as string,
    cnpj: req.query.cnpj as string,
  };

  const result = await empresaService.listar(page, limit, filtros);

  res.status(200).json({
    status: 'success',
    ...result,
  });
});

/**
 * @desc    Obter uma única empresa
 * @route   GET /api/empresas/:id
 * @access  Private/Admin
 */
export const getEmpresa = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
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
  const empresa = await empresaService.criar(req.body);

  await logAction(req, 'CREATE', 'Empresa', empresa._id!.toString(), {
    nomeEmpresaDetalhe: (empresa as any).razaoSocial || (empresa as any).nomeFantasia,
    cnpjEmpresaDetalhe: (empresa as any).cnpj,
  });

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
  const empresa = await empresaService.atualizar(id, req.body);

  await logAction(req, 'UPDATE', 'Empresa', id, {
    nomeEmpresaDetalhe: (empresa as any).razaoSocial || (empresa as any).nomeFantasia,
    cnpjEmpresaDetalhe: (empresa as any).cnpj,
  });

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

  const empresaParaLog = await Empresa.findById(id).lean();
  if (!empresaParaLog) {
    throw new AppError('Empresa não encontrada', 404);
  }

  await logAction(req, 'DELETE', 'Empresa', id, {
    nomeEmpresaDetalhe: (empresaParaLog as any).razaoSocial || (empresaParaLog as any).nomeFantasia,
    cnpjEmpresaDetalhe: (empresaParaLog as any).cnpj,
  });

  await empresaService.deletar(id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

