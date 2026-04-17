import { Request, Response } from 'express';
import doencaService from '../services/DoencaService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { IAuthRequest } from '../types/index.js';

export const criar = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const doencaData = {
    ...req.body,
    trabalhadorId: req.body.trabalhadorId || req.user?._id,
  };

  const doenca = await doencaService.criar(doencaData);
  res.status(201).json({ sucesso: true, dados: doenca });
});

export const obter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const doenca = await doencaService.obter(id);
  res.status(200).json({ sucesso: true, dados: doenca });
});

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const filtros = {
    nomeDoenca: req.query.nomeDoenca as string,
    ativo: req.query.ativo ? req.query.ativo === 'true' : undefined,
    trabalhadorId: req.query.trabalhadorId as string,
    dataInicio: req.query.dataInicio as string,
    dataFim: req.query.dataFim as string,
  };

  // Remover filtros undefined
  Object.keys(filtros).forEach((key) => {
    if (filtros[key as keyof typeof filtros] === undefined) {
      delete filtros[key as keyof typeof filtros];
    }
  });

  const { doencas, total, pages } = await doencaService.listar(page, limit, filtros);
  res.status(200).json({
    sucesso: true,
    dados: doencas,
    paginacao: { page, limit, total, pages },
  });
});

export const atualizar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const doenca = await doencaService.atualizar(id, req.body);
  res.status(200).json({ sucesso: true, dados: doenca });
});

export const deletar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await doencaService.deletar(id);
  res.status(200).json({ sucesso: true, mensagem: 'Doença deletada com sucesso' });
});

export const obterPorTrabalhador = asyncHandler(async (req: Request, res: Response) => {
  const { trabalhadorId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const { doencas, total, pages } = await doencaService.obterPorTrabalhador(trabalhadorId, page, limit);
  res.status(200).json({
    sucesso: true,
    dados: doencas,
    paginacao: { page, limit, total, pages },
  });
});

export const obterEstatisticas = asyncHandler(async (req: Request, res: Response) => {
  const stats = await doencaService.obterEstatisticas();
  res.status(200).json({ sucesso: true, dados: stats });
});
