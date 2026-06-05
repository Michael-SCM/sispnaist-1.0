import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import materialBiologicoService from '../services/MaterialBiologicoService.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';

export const criar = asyncHandler(async (req: Request, res: Response) => {
  const ficha = await materialBiologicoService.criar(req.body);

  await logAction(req, 'CREATE', 'MaterialBiologico', ficha._id!.toString(), ficha);

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
  const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });

  const filtros = {
    tipoExposicao: req.query.tipoExposicao as string,
    agente: req.query.agente as string,
  };

  const { fichas, total } = await materialBiologicoService.listar(page, limit, filtros);

  res.status(200).json({
    status: 'success',
    data: {
      fichas,
      paginacao: getPaginationResult(total, page, limit),
    },
  });
});

export const atualizar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const fichaAntiga = await materialBiologicoService.obter(id);
  const ficha = await materialBiologicoService.atualizar(id, req.body);

  const mudancas = compararDados(fichaAntiga, ficha);
  await logAction(req, 'UPDATE', 'MaterialBiologico', id, mudancas);

  res.status(200).json({
    status: 'success',
    data: { ficha },
  });
});

export const deletar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const fichaAntiga = await materialBiologicoService.obter(id);
  await materialBiologicoService.deletar(id);

  await logAction(req, 'DELETE', 'MaterialBiologico', id, fichaAntiga);

  res.status(204).send();
});
