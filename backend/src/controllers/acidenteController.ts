import { Request, Response } from "express";
import { asyncHandler } from '../middleware/asyncHandler.js';
import acidenteService from '../services/AcidenteService.js';
import Trabalhador from '../models/Trabalhador.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction } from '../utils/auditLogger.js';

export const criar = asyncHandler(async (req: Request, res: Response) => {
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para criar acidentes', 403);
  }

  const acidenteCriado = await acidenteService.criar(req.body);

  // Rebuscar com populate confiável para garantir CPF e consistência do tipo
  const acidente = await acidenteService.obter(acidenteCriado._id!.toString());

  const trabalhadorIdObj = (acidente.trabalhadorId as any);
  const cpfTrabalhador =
    trabalhadorIdObj?.cpf ??
    // se veio populado, mas sem cpf, tenta por _id
    (trabalhadorIdObj?._id ? (trabalhadorIdObj as any)._id : undefined) ??
    // se veio como id direto
    (typeof acidente.trabalhadorId === 'string' ? acidente.trabalhadorId : undefined) ??
    undefined;

  const cpfFinal =
    typeof cpfTrabalhador === 'string' && cpfTrabalhador.length > 0
      ? (await Trabalhador.findById(cpfTrabalhador).select('cpf').lean())?.cpf ?? 'N/A'
      : 'N/A';

  await logAction(req, 'CREATE', 'Acidente', acidente._id!.toString(), {
    tipoAcidente: acidente.tipoAcidente,
    cpfTrabalhador: cpfFinal,
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

  if (!acidente) {
    throw new AppError('Acidente não encontrado', 404);
  }

  // Se o usuário logado for trabalhador, só pode visualizar se o acidente for dele
  if ((req as any).user?.perfil === 'trabalhador') {
    const trabalhador = await Trabalhador.findOne({ cpf: (req as any).user.cpf });
    const recordTrabalhadorId = (acidente.trabalhadorId && (acidente.trabalhadorId as any)._id)
      ? (acidente.trabalhadorId as any)._id.toString()
      : acidente.trabalhadorId.toString();

    if (!trabalhador || recordTrabalhadorId !== trabalhador._id.toString()) {
      throw new AppError('Sem permissão para acessar os dados deste acidente', 403);
    }
  }

  res.status(200).json({
    status: 'success',
    data: { acidente },
  });
});

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const filtros: any = {
    tipoAcidente: req.query.tipoAcidente as string | undefined,
    status: req.query.status as string | undefined,
    trabalhadorId: req.query.trabalhadorId as string | undefined,
    dataInicio: req.query.dataInicio as string | undefined,
    dataFim: req.query.dataFim as string | undefined,
    descricao: req.query.descricao as string | undefined,
    cpfTrabalhador: req.query.cpfTrabalhador as string | undefined,
  };

    // Se o usuário logado for trabalhador, força o filtro por seu próprio ID de trabalhador
  if ((req as any).user?.perfil === 'trabalhador') {
    const trabalhador = await Trabalhador.findOne({ cpf: (req as any).user.cpf });
    filtros.trabalhadorId = trabalhador ? trabalhador._id.toString() : '000000000000000000000000';
  }

  // Normaliza CPF do filtro (remover máscara) para evitar validações/rejeições
  if (typeof filtros.cpfTrabalhador === 'string' && filtros.cpfTrabalhador.trim()) {
    filtros.cpfTrabalhador = filtros.cpfTrabalhador.replace(/\D/g, '');
  }


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
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para atualizar acidentes', 403);
  }

  const { id } = req.params;
  const acidenteAtualizado = await acidenteService.atualizar(id, req.body);

  // Rebuscar com populate confiável para garantir CPF e consistência do tipo
  const acidente = await acidenteService.obter(acidenteAtualizado._id!.toString());

  const trabalhadorIdObjU = (acidente.trabalhadorId as any);
  const cpfTrabalhadorU =
    trabalhadorIdObjU?.cpf ??
    (trabalhadorIdObjU?._id ? (trabalhadorIdObjU as any)._id : undefined) ??
    (typeof acidente.trabalhadorId === 'string' ? acidente.trabalhadorId : undefined) ??
    undefined;

  const cpfFinalU =
    typeof cpfTrabalhadorU === 'string' && cpfTrabalhadorU.length > 0
      ? (await Trabalhador.findById(cpfTrabalhadorU).select('cpf').lean())?.cpf ?? 'N/A'
      : 'N/A';

  console.log('[AUDIT DEBUG] UPDATE Acidente', {
    acidenteId: id,
    tipoAcidente: acidente.tipoAcidente,
    cpfTrabalhador: cpfFinalU,
    status: acidente.status,
    trabalhadorId: (acidente.trabalhadorId as any)?._id ?? acidente.trabalhadorId,
  });

  await logAction(req, 'UPDATE', 'Acidente', id, {
    tipoAcidente: acidente.tipoAcidente,
    cpfTrabalhador: cpfFinalU,
    status: acidente.status
  });

  res.status(200).json({
    status: 'success',
    data: { acidente },
  });
});

export const deletar = asyncHandler(async (req: Request, res: Response) => {
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para deletar acidentes', 403);
  }

  const { id } = req.params;
  // Busca o acidente para registrar detalhes antes da remoção
  const acidente = await acidenteService.obter(id);
  if (!acidente) {
    throw new AppError('Acidente não encontrado', 404);
  }

  await acidenteService.deletar(id);

  // Garantir CPF do trabalhador e tipo no audit log
  const trabalhadorId = (acidente as any)?.trabalhadorId;
  const trabalhador = typeof trabalhadorId === 'object'
    ? trabalhadorId
    : await Trabalhador.findById(trabalhadorId);

  const cpfTrabalhador =
    (trabalhador as any)?.cpf ??
    (acidente as any)?.cpf ??
    (typeof (acidente as any)?.trabalhadorId === 'object'
      ? (acidente as any)?.trabalhadorId?.cpf
      : undefined) ??
    // fallback final: se tiver _id do objeto populado, busca no Trabalhador
    ((typeof (acidente as any)?.trabalhadorId === 'object' && (acidente as any)?.trabalhadorId?._id)
      ? (await Trabalhador.findById((acidente as any)?.trabalhadorId._id).select('cpf').lean())?.cpf
      : undefined) ??
    'N/A';

  await logAction(req, 'DELETE', 'Acidente', id, {
    tipoAcidente: acidente.tipoAcidente,
    cpfTrabalhador,
  });

  res.status(204).send();
});

export const obterPorTrabalhador = asyncHandler(async (req: Request, res: Response) => {
  const { trabalhadorId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Se o usuário logado for trabalhador, ele só pode acessar seus próprios dados
  if ((req as any).user?.perfil === 'trabalhador') {
    const trabalhador = await Trabalhador.findOne({ cpf: (req as any).user.cpf });
    if (!trabalhador || trabalhador._id.toString() !== trabalhadorId) {
      throw new AppError('Sem permissão para acessar estes dados', 403);
    }
  }

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
  if ((req as any).user?.perfil === 'trabalhador') {
    throw new AppError('Sem permissão para acessar estatísticas gerais', 403);
  }

  const stats = await acidenteService.obterEstatisticas();

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});
