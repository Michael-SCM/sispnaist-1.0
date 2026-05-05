import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import acidenteService from '../services/AcidenteService.js';
import { IAuthRequest } from '../middleware/auth.js';
import { IAcidente } from '../types/index.js';
import { logAction } from '../utils/auditLogger.js';

export const criar = asyncHandler(async (req: Request, res: Response) => {
  console.log('[acidenteController.criar] req.body received:', JSON.stringify(req.body, null, 2));
  const acidente = await acidenteService.criar(req.body);
  console.log('[acidenteController.criar] acidente created:', JSON.stringify(acidente, null, 2));

  await logAction(req, 'CREATE', 'Acidente', acidente._id!.toString(), {
    tipoAcidente: acidente.tipoAcidente,
    dataAcidente: acidente.dataAcidente
  });

  res.status(201).json({
    status: 'success',
    data: { acidente },
  });
});

export const obter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const acidente = await acidenteService.obter(id);

  res.status(200).json({
    status: 'success',
    data: { acidente },
  });
});

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const filtros = {
    tipoAcidente: req.query.tipoAcidente as string | undefined,
    status: req.query.status as string | undefined,
    trabalhadorId: req.query.trabalhadorId as string | undefined,
    dataInicio: req.query.dataInicio as string | undefined,
    dataFim: req.query.dataFim as string | undefined,
  };

  const { acidentes, total, pages } = await acidenteService.listar(page, limit, filtros);

  res.status(200).json({
    status: 'success',
    data: {
      acidentes,
      paginacao: {
        page,
        limit,
        total,
        pages,
      },
    },
  });
});

export const atualizar = asyncHandler(async (req: Request, res: Response) => {
  console.log('[acidenteController.atualizar] req.body received:', JSON.stringify(req.body, null, 2));
  const { id } = req.params;
  const acidente = await acidenteService.atualizar(id, req.body);
  console.log('[acidenteController.atualizar] acidente updated:', JSON.stringify(acidente, null, 2));

  await logAction(req, 'UPDATE', 'Acidente', id, {
    status: acidente.status
  });

  res.status(200).json({
    status: 'success',
    data: { acidente },
  });
});

export const deletar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await acidenteService.deletar(id);

  await logAction(req, 'DELETE', 'Acidente', id);

  res.status(204).send();
});

export const obterPorTrabalhador = asyncHandler(async (req: Request, res: Response) => {
  const { trabalhadorId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const { acidentes, total, pages } = await acidenteService.obterPorTrabalhador(
    trabalhadorId,
    page,
    limit
  );

  res.status(200).json({
    status: 'success',
    data: {
      acidentes,
      paginacao: {
        page,
        limit,
        total,
        pages,
      },
    },
  });
});

export const obterEstatisticas = asyncHandler(async (req: Request, res: Response) => {
  const stats = await acidenteService.obterEstatisticas();

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});
