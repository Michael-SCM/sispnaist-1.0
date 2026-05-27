import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import vacinacaoService from '../services/VacinacaoService.js';
import { IAuthRequest } from '../middleware/auth.js';
import Trabalhador from '../models/Trabalhador.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction } from '../utils/auditLogger.js';

export const criarVacinacao = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (req.user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para criar registros de vacinação', 403);
  }

  const vacinacao = await vacinacaoService.criar(req.body);

  await logAction(req, 'CREATE', 'Vacinacao', vacinacao._id!.toString(), {
    vacina: vacinacao.vacina,
    lote: vacinacao.lote,
    cpfTrabalhadorVacinacao: (vacinacao.trabalhadorId as any)?.cpf,
    nomeVacinaDetalhe: vacinacao.vacina,
  });

  res.status(201).json({
    status: 'success',
    data: { vacinacao },
  });
});

export const obterVacinacao = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const vacinacao = await vacinacaoService.obter(req.params.id);

  if (!vacinacao) {
    throw new AppError('Vacinação não encontrada', 404);
  }

  // Se o usuário logado for trabalhador, só pode visualizar se for dele
  if (req.user?.perfil === 'trabalhador') {
    const trabalhador = await Trabalhador.findOne({ cpf: req.user.cpf });
    const recordTrabalhadorId = (vacinacao.trabalhadorId && (vacinacao.trabalhadorId as any)._id)
      ? (vacinacao.trabalhadorId as any)._id.toString()
      : vacinacao.trabalhadorId.toString();

    if (!trabalhador || recordTrabalhadorId !== trabalhador._id.toString()) {
      throw new AppError('Sem permissão para acessar os dados desta vacinação', 403);
    }
  }

  res.status(200).json({
    status: 'success',
    data: { vacinacao },
  });
});

export const listarVacinacoes = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { page, limit, vacina, trabalhadorId } = req.query;
  let targetTrabalhadorId = trabalhadorId as string;

  // Se o usuário logado for trabalhador, força o filtro por seu próprio ID de trabalhador
  if (req.user?.perfil === 'trabalhador') {
    const trabalhador = await Trabalhador.findOne({ cpf: req.user.cpf });
    targetTrabalhadorId = trabalhador ? trabalhador._id.toString() : '000000000000000000000000';
  }

  // Normaliza CPF recebido no filtro: remove máscara (.,-) se vier mascarado
  // (o service tenta resolver CPF -> ObjectId)
  if (typeof targetTrabalhadorId === 'string' && targetTrabalhadorId.trim()) {
    // Se o filtro parece CPF mascarado, remove caracteres não numéricos
    if (targetTrabalhadorId.includes('.') || targetTrabalhadorId.includes('-')) {
      targetTrabalhadorId = targetTrabalhadorId.replace(/\D/g, '');
      // Reaplica máscara esperada no banco: XXX.XXX.XXX-XX
      if (targetTrabalhadorId.length === 11) {
        targetTrabalhadorId = `${targetTrabalhadorId.slice(0, 3)}.${targetTrabalhadorId.slice(3, 6)}.${targetTrabalhadorId.slice(6, 9)}-${targetTrabalhadorId.slice(9, 11)}`;
      }
    }
  }

  const result = await vacinacaoService.listar({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    vacina: vacina as string,
    trabalhadorId: targetTrabalhadorId,
  });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const atualizarVacinacao = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (req.user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para atualizar registros de vacinação', 403);
  }

  const vacinacao = await vacinacaoService.atualizar(req.params.id, req.body);

  await logAction(req, 'UPDATE', 'Vacinacao', req.params.id, {
    vacina: vacinacao.vacina,
    cpfTrabalhadorVacinacao: (vacinacao.trabalhadorId as any)?.cpf,
    nomeVacinaDetalhe: vacinacao.vacina,
  });

  res.status(200).json({
    status: 'success',
    data: { vacinacao },
  });
});

export const deletarVacinacao = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (req.user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para deletar registros de vacinação', 403);
  }

  // Para registrar CPF/nome da vacina no log de exclusão, buscamos antes de deletar
  const vacinacaoParaLog = await vacinacaoService.obter(req.params.id);

  await logAction(req, 'DELETE', 'Vacinacao', req.params.id, {
    cpfTrabalhadorVacinacao: (vacinacaoParaLog as any)?.trabalhadorId?.cpf,
    nomeVacinaDetalhe: (vacinacaoParaLog as any)?.vacina,
  });

  await vacinacaoService.deletar(req.params.id);

  res.status(204).send();
});

export const obterVacinacoesPorTrabalhador = asyncHandler(
  async (req: IAuthRequest, res: Response) => {
    const { trabalhadorId } = req.params;

    // Se o usuário logado for trabalhador, ele só pode acessar seus próprios dados
    if (req.user?.perfil === 'trabalhador') {
      const trabalhador = await Trabalhador.findOne({ cpf: req.user.cpf });
      if (!trabalhador || trabalhador._id.toString() !== trabalhadorId) {
        throw new AppError('Sem permissão para acessar estes dados', 403);
      }
    }

    const vacinacoes = await vacinacaoService.obterPorTrabalhador(trabalhadorId);

    res.status(200).json({
      status: 'success',
      data: { vacinacoes },
    });
  }
);

export const obterEstatisticas = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (req.user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para acessar estatísticas gerais', 403);
  }

  const estatisticas = await vacinacaoService.obterEstatisticas();

  res.status(200).json({
    status: 'success',
    data: estatisticas,
  });
});
