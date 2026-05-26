import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import materialBiologicoService from '../services/MaterialBiologicoService.js';
import { logAction } from '../utils/auditLogger.js';

export const criar = asyncHandler(async (req: Request, res: Response) => {
  const ficha = await materialBiologicoService.criar(req.body);

  await logAction(req, 'CREATE', 'MaterialBiologico', ficha._id!.toString(), {
    acidenteId: ficha.acidenteId.toString(),
    agente: ficha.agente
  });

  res.status(201).json({
    status: 'success',
    data: { ficha },
  });
});

export const obter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const ficha = await materialBiologicoService.obter(id);

  res.status(200).json({
    status: 'success',
    data: { ficha },
  });
});

export const obterPorAcidente = asyncHandler(async (req: Request, res: Response) => {
  const { acidenteId } = req.params;
  const ficha = await materialBiologicoService.obterPorAcidente(acidenteId);

  res.status(200).json({
    status: 'success',
    data: { ficha },
  });
});

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const filtros = {
    tipoExposicao: req.query.tipoExposicao as string,
    agente: req.query.agente as string,
  };

  const { fichas, total, pages } = await materialBiologicoService.listar(page, limit, filtros);

  res.status(200).json({
    status: 'success',
    data: {
      fichas,
      paginacao: { page, limit, total, pages },
    },
  });
});

export const atualizar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const ficha = await materialBiologicoService.atualizar(id, req.body);

  await logAction(req, 'UPDATE', 'MaterialBiologico', id, {
    agente: ficha.agente
  });

  res.status(200).json({
    status: 'success',
    data: { ficha },
  });
});

export const deletar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await materialBiologicoService.deletar(id);

  await logAction(req, 'DELETE', 'MaterialBiologico', id);

  res.status(204).send();
});
