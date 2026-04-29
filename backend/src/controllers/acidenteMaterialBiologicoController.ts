import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import acidenteMaterialBiologicoService from '../services/AcidenteMaterialBiologicoService.js';
import { IAcidenteMaterialBiologico } from '../types/index.js';

export const criar = asyncHandler(async (req: Request, res: Response) => {
  const registro = await acidenteMaterialBiologicoService.criar(req.body);

  res.status(201).json({
    status: 'success',
    data: { registro },
  });
});

export const obter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const registro = await acidenteMaterialBiologicoService.obter(id);

  res.status(200).json({
    status: 'success',
    data: { registro },
  });
});

export const obterPorAcidente = asyncHandler(async (req: Request, res: Response) => {
  const { acidenteId } = req.params;
  const registro = await acidenteMaterialBiologicoService.obterPorAcidente(acidenteId);

  res.status(200).json({
    status: 'success',
    data: { registro },
  });
});

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const filtros = {
    acidenteId: req.query.acidenteId as string | undefined,
    tipoExposicao: req.query.tipoExposicao as string | undefined,
    agente: req.query.agente as string | undefined,
  };

  const { registros, total, pages } = await acidenteMaterialBiologicoService.listar(
    page,
    limit,
    filtros
  );

  res.status(200).json({
    status: 'success',
    data: {
      registros,
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
  const registro = await acidenteMaterialBiologicoService.atualizar(id, req.body);

  res.status(200).json({
    status: 'success',
    data: { registro },
  });
});

export const deletar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await acidenteMaterialBiologicoService.deletar(id);

  res.status(204).send();
});
