import { Request, Response } from 'express';
import doencaService from '../services/DoencaService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import Trabalhador from '../models/Trabalhador.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';

export const criar = asyncHandler(async (req: Request, res: Response) => {
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para criar registros de doenças', 403);
  }

  const doencaData = {
    ...req.body,
    trabalhadorId: req.body.trabalhadorId,
  };

  const doenca = await doencaService.criar(doencaData);

  await logAction(req, 'CREATE', 'Doenca', doenca._id!.toString(), doenca);

  res.status(201).json({ sucesso: true, dados: doenca });
});

export const obter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const doenca = await doencaService.obter(id);

  if (!doenca) {
    throw new AppError('Doença não encontrada', 404);
  }

  // Se o usuário logado for trabalhador, só pode visualizar se for dele
  if ((req as any).user?.perfil === 'trabalhador') {
    const trabalhador = await Trabalhador.findOne({ cpf: (req as any).user.cpf });
    const recordTrabalhadorId = (doenca.trabalhadorId && (doenca.trabalhadorId as any)._id)
      ? (doenca.trabalhadorId as any)._id.toString()
      : doenca.trabalhadorId.toString();

    if (!trabalhador || recordTrabalhadorId !== trabalhador._id.toString()) {
      throw new AppError('Sem permissão para acessar os dados desta doença', 403);
    }
  }

  res.status(200).json({ sucesso: true, dados: doenca });
});

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });

  const filtros: any = {
    nomeDoenca: req.query.nomeDoenca as string,
    ativo: req.query.ativo ? req.query.ativo === 'true' : undefined,
    // Tratar trabalhadorId de filtro: pode vir CPF (mascarado ou apenas dígitos)
    // Não deixar passar por validação de ObjectId.
    trabalhadorId: req.query.trabalhadorId as string,
    dataInicio: req.query.dataInicio as string,
    dataFim: req.query.dataFim as string,
    cartaoSus: req.query.cartaoSus as string,
  };

  // Normaliza CPF de filtro (remove máscara) para evitar erros de validação
  if (typeof filtros.trabalhadorId === 'string' && filtros.trabalhadorId.trim()) {
    filtros.trabalhadorId = filtros.trabalhadorId.replace(/\D/g, '');
  }

  // Se o usuário logado for trabalhador, força o filtro por seu próprio ID de trabalhador
  if ((req as any).user?.perfil === 'trabalhador') {
    const trabalhador = await Trabalhador.findOne({ cpf: (req as any).user.cpf });
    filtros.trabalhadorId = trabalhador ? trabalhador._id.toString() : '000000000000000000000000';
  }

  // Remover filtros undefined
  Object.keys(filtros).forEach((key) => {
    if (filtros[key as keyof typeof filtros] === undefined) {
      delete filtros[key as keyof typeof filtros];
    }
  });

  const { doencas, total } = await doencaService.listar(page, limit, filtros);
  res.status(200).json({
    sucesso: true,
    dados: doencas,
    paginacao: getPaginationResult(total, page, limit),
  });
});

export const atualizar = asyncHandler(async (req: Request, res: Response) => {
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para atualizar registros de doenças', 403);
  }

  const { id } = req.params;
  const doencaAntiga = await doencaService.obter(id);
  
  if (!doencaAntiga) {
    throw new AppError('Doença não encontrada', 404);
  }

  const doenca = await doencaService.atualizar(id, req.body);

  const mudancas = compararDados(doencaAntiga, doenca);
  await logAction(req, 'UPDATE', 'Doenca', id, mudancas);

  res.status(200).json({ sucesso: true, dados: doenca });
});

export const deletar = asyncHandler(async (req: Request, res: Response) => {
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para deletar registros de doenças', 403);
  }

  const { id } = req.params;
  const doencaAntiga = await doencaService.obter(id);
  
  if (!doencaAntiga) {
    throw new AppError('Doença não encontrada', 404);
  }

  await doencaService.deletar(id);

  await logAction(req, 'DELETE', 'Doenca', id, doencaAntiga);

  res.status(200).json({ sucesso: true, mensagem: 'Doença deletada com sucesso' });
});

export const obterPorTrabalhador = asyncHandler(async (req: Request, res: Response) => {
  const { trabalhadorId } = req.params;
  const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });

  // Se o usuário logado for trabalhador, ele só pode acessar seus próprios dados
  if ((req as any).user?.perfil === 'trabalhador') {
    const trabalhador = await Trabalhador.findOne({ cpf: (req as any).user.cpf });
    if (!trabalhador || trabalhador._id.toString() !== trabalhadorId) {
      throw new AppError('Sem permissão para acessar estes dados', 403);
    }
  }

  const { doencas, total } = await doencaService.obterPorTrabalhador(trabalhadorId, page, limit);
  res.status(200).json({
    sucesso: true,
    dados: doencas,
    paginacao: getPaginationResult(total, page, limit),
  });
});

export const obterEstatisticas = asyncHandler(async (req: Request, res: Response) => {
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para acessar estatísticas gerais', 403);
  }

  const stats = await doencaService.obterEstatisticas();
  res.status(200).json({ sucesso: true, dados: stats });
});
