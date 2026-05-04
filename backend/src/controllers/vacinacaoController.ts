import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import vacinacaoService from '../services/VacinacaoService.js';
import { IAuthRequest } from '../middleware/auth.js';
import { logAction } from '../utils/auditLogger.js';

export const criarVacinacao = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const vacinacao = await vacinacaoService.criar(req.body);

  await logAction(req, 'CREATE', 'Vacinacao', vacinacao._id!.toString(), {
    vacina: vacinacao.vacina,
    lote: vacinacao.lote
  });

  res.status(201).json({
    status: 'success',
    data: { vacinacao },
  });
});

export const obterVacinacao = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const vacinacao = await vacinacaoService.obter(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { vacinacao },
  });
});

export const listarVacinacoes = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { page, limit, vacina, trabalhadorId } = req.query;

  const result = await vacinacaoService.listar({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    vacina: vacina as string,
    trabalhadorId: trabalhadorId as string,
  });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const atualizarVacinacao = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const vacinacao = await vacinacaoService.atualizar(req.params.id, req.body);

  await logAction(req, 'UPDATE', 'Vacinacao', req.params.id, {
    vacina: vacinacao.vacina
  });

  res.status(200).json({
    status: 'success',
    data: { vacinacao },
  });
});

export const deletarVacinacao = asyncHandler(async (req: IAuthRequest, res: Response) => {
  await vacinacaoService.deletar(req.params.id);

  await logAction(req, 'DELETE', 'Vacinacao', req.params.id);

  res.status(204).send();
});

export const obterVacinacoesPorTrabalhador = asyncHandler(
  async (req: IAuthRequest, res: Response) => {
    const vacinacoes = await vacinacaoService.obterPorTrabalhador(req.params.trabalhadorId);

    res.status(200).json({
      status: 'success',
      data: { vacinacoes },
    });
  }
);

export const obterEstatisticas = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const estatisticas = await vacinacaoService.obterEstatisticas();

  res.status(200).json({
    status: 'success',
    data: estatisticas,
  });
});
