import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import vacinacaoService from '../services/VacinacaoService.js';
import { IAuthRequest } from '../middleware/auth.js';
import Trabalhador from '../models/Trabalhador.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';
import { buildUserScope } from '../utils/scope.js';
import { obterIdsTrabalhadorPorCpf } from '../utils/obterIdsTrabalhadorPorCpf.js';
import { assertCanReadHealthRecord, assertCanManageHealthRecord, assertCanReadWorker, assertCanWriteHealthRecord } from '../services/AuthorizationService.js';

export const criarVacinacao = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const scope = await buildUserScope(req.user!);

  if (scope.perfil === 'trabalhador') {
    throw new AppError('A pessoa trabalhadora não pode editar o próprio histórico sem permissão explícita', 403);
  }

  const { trabalhadorId } = req.body;
  if (!trabalhadorId) {
    throw new AppError('Trabalhador é obrigatório', 400);
  }

  // Validação centralizada do trabalhador-alvo integrando escopo (anti-IDOR)
  await assertCanWriteHealthRecord(scope, trabalhadorId, 'Vacinação');

  const vacinacao = await vacinacaoService.criar({ ...req.body, trabalhadorId });

  await logAction(req, 'CREATE', 'Vacinacao', vacinacao._id!.toString(), vacinacao);

  res.status(201).json({
    status: 'success',
    data: { vacinacao },
  });
});

export const obterVacinacao = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const scope = await buildUserScope(req.user!);
  const vacinacao = await vacinacaoService.obter(req.params.id);

  if (!vacinacao) {
    throw new AppError('Vacinação não encontrada', 404);
  }

  // Verificação centralizada de escopo anti-IDOR
  await assertCanReadHealthRecord(scope, vacinacao, 'Vacinação');

  res.status(200).json({
    status: 'success',
    data: { vacinacao },
  });
});

export const listarVacinacoes = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });
  const { vacina, trabalhadorId, cartaoSus } = req.query;
  let targetTrabalhadorId = trabalhadorId as string;
  const scope = await buildUserScope(req.user!);

  // Gestor ou Saúde com escopo: forçar filtro por trabalhadores da empresa/unidade
  if (scope.perfil === 'gestor' || (scope.perfil === 'saude' && scope.empresaScope)) {
    if (!scope.empresaScope) {
      targetTrabalhadorId = '000000000000000000000000';
    } else {
      const queryTrab: any = { empresa: scope.empresaScope };
      if (scope.unidadeScope) queryTrab.unidade = scope.unidadeScope;
      const trabalhadores = await Trabalhador.find(queryTrab).select('_id').lean();
      const ids = trabalhadores.map((t: any) => t._id.toString());
      if (ids.length === 0) {
        targetTrabalhadorId = '000000000000000000000000';
      } else if (ids.length === 1) {
        targetTrabalhadorId = ids[0];
      } else {
        const result = await vacinacaoService.listar({
          page,
          limit,
          vacina: vacina as string,
          trabalhadorIds: ids,
          cartaoSus: cartaoSus as string,
        });
        return res.status(200).json({
          status: 'success',
          data: result,
        });
      }
    }
  }

  // Trabalhador (ou saúde sem empresa): apenas próprios registros
  if (scope.perfil === 'trabalhador' || (scope.perfil === 'saude' && !scope.empresaScope)) {
    const ids = await obterIdsTrabalhadorPorCpf(req.user!.cpf);
    const idsValidos = [ids.trabalhadorId, ids.userId].filter(Boolean) as string[];
    if (idsValidos.length > 1) {
      const result = await vacinacaoService.listar({
        page,
        limit,
        vacina: vacina as string,
        trabalhadorIds: idsValidos,
        cartaoSus: cartaoSus as string,
      });
      return res.status(200).json({
        status: 'success',
        data: result,
      });
    }
    targetTrabalhadorId = idsValidos[0] || '000000000000000000000000';
  }

  // Normaliza CPF recebido no filtro: remove máscara (.,-) se vier mascarado
  if (typeof targetTrabalhadorId === 'string' && targetTrabalhadorId.trim()) {
    if (targetTrabalhadorId.includes('.') || targetTrabalhadorId.includes('-')) {
      targetTrabalhadorId = targetTrabalhadorId.replace(/\D/g, '');
      if (targetTrabalhadorId.length === 11) {
        targetTrabalhadorId = `${targetTrabalhadorId.slice(0, 3)}.${targetTrabalhadorId.slice(3, 6)}.${targetTrabalhadorId.slice(6, 9)}-${targetTrabalhadorId.slice(9, 11)}`;
      }
    }
  }

  const result = await vacinacaoService.listar({
    page,
    limit,
    vacina: vacina as string,
    trabalhadorId: targetTrabalhadorId,
    cartaoSus: cartaoSus as string,
  });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const atualizarVacinacao = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const scope = await buildUserScope(req.user!);

  if (scope.perfil === 'trabalhador') {
    throw new AppError('A pessoa trabalhadora não pode editar o próprio histórico sem permissão explícita', 403);
  }

  const vacinacaoAntiga = await vacinacaoService.obter(req.params.id);

  if (!vacinacaoAntiga) {
    throw new AppError('Vacinação não encontrada', 404);
  }

  // Verificação centralizada de escopo anti-IDOR para gerenciamento
  await assertCanManageHealthRecord(scope, vacinacaoAntiga, 'Vacinação');

  // Não permitir transferir vacinação para outro trabalhador
  const dadosAtualizacao = { ...req.body };
  delete dadosAtualizacao.trabalhadorId;
  delete dadosAtualizacao._id;

  const vacinacao = await vacinacaoService.atualizar(req.params.id, dadosAtualizacao);

  const mudancas = compararDados(vacinacaoAntiga, vacinacao);
  await logAction(req, 'UPDATE', 'Vacinacao', req.params.id, mudancas);

  res.status(200).json({
    status: 'success',
    data: { vacinacao },
  });
});

export const deletarVacinacao = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const scope = await buildUserScope(req.user!);

  if (scope.perfil === 'trabalhador') {
    throw new AppError('A pessoa trabalhadora não pode editar o próprio histórico sem permissão explícita', 403);
  }

  const vacinacaoAntiga = await vacinacaoService.obter(req.params.id);

  if (!vacinacaoAntiga) {
    throw new AppError('Vacinação não encontrada', 404);
  }

  // Verificação centralizada de escopo anti-IDOR para gerenciamento
  await assertCanManageHealthRecord(scope, vacinacaoAntiga, 'Vacinação');

  await vacinacaoService.deletar(req.params.id);

  await logAction(req, 'DELETE', 'Vacinacao', req.params.id, vacinacaoAntiga);

  res.status(204).send();
});

export const obterVacinacoesPorTrabalhador = asyncHandler(
  async (req: IAuthRequest, res: Response) => {
    const { trabalhadorId } = req.params;
    const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 10 });
    const scope = await buildUserScope(req.user!);

    // Verificação centralizada de escopo anti-IDOR
    await assertCanReadWorker(scope, trabalhadorId);

    const result = await vacinacaoService.obterPorTrabalhador(trabalhadorId, page, limit);

    res.status(200).json({
      status: 'success',
      data: {
        vacinacoes: result.vacinacoes,
        paginacao: getPaginationResult(result.total, page, limit),
      },
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
