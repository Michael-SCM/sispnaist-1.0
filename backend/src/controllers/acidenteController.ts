import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import acidenteService from '../services/AcidenteService.js';
import { IAuthRequest } from '../middleware/auth.js';
import { IAcidente } from '../types/index.js';

export const criar = asyncHandler(async (req: Request, res: Response) => {
  const acidente = await acidenteService.criar(req.body);

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
  const { id } = req.params;
  const acidente = await acidenteService.atualizar(id, req.body);

  res.status(200).json({
    status: 'success',
    data: { acidente },
  });
});

export const deletar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await acidenteService.deletar(id);

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
