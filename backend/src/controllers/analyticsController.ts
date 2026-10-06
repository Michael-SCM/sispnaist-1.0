import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import analyticsService from '../services/AnalyticsService.js';
import { IAuthRequest } from '../middleware/auth.js';
import { obterIdsTrabalhadorPorCpf } from '../utils/obterIdsTrabalhadorPorCpf.js';
import { buildUserScope } from '../utils/scope.js';

/**
 * GET /api/analytics/kpis
 * Obtém KPIs gerais do sistema (escopo: admin=vê tudo, gestor=vê empresa)
 */
export const obterKPIs = asyncHandler(async (req: Request, res: Response) => {
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const dados = await analyticsService.obterKPIs(scope.empresaScope || undefined);

  res.status(200).json({
    status: 'success',
    data: { kpis: dados },
  });
});

/**
 * GET /api/analytics/acidentes
 * Obtém dados para gráficos de acidentes (escopo por empresa)
 */
export const obterDadosAcidentes = asyncHandler(async (req: Request, res: Response) => {
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const dados = await analyticsService.obterDadosAcidentes(scope.empresaScope || undefined);

  res.status(200).json({
    status: 'success',
    data: { dados },
  });
});

/**
 * GET /api/analytics/vacinacoes/proximas
 * Obtém próximas vacinações (escopo por empresa)
 */
export const obterProximasVacinacoes = asyncHandler(async (req: Request, res: Response) => {
  const dias = parseInt(req.query.dias as string) || 30;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const vacinacoes = await analyticsService.obterProximasVacinacoes(dias, scope.empresaScope || undefined);

  res.status(200).json({
    status: 'success',
    data: { vacinacoes },
  });
});

/**
 * GET /api/analytics/acidentes/ultimos
 * Obtém últimos acidentes registrados (escopo por empresa)
 */
export const obterUltimosAcidentes = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5;
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const acidentes = await analyticsService.obterUltimosAcidentes(limit, scope.empresaScope || undefined);

  res.status(200).json({
    status: 'success',
    data: { acidentes },
  });
});

/**
 * GET /api/analytics/dashboard
 * Obtém dados completos para dashboard admin (escopo por empresa)
 */
export const obterDashboardAdmin = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const scope = await buildUserScope(req.user!);
  const dados = await analyticsService.obterDadosDashboardAdmin(scope.empresaScope || undefined);

  res.status(200).json({
    status: 'success',
    data: { dados },
  });
});

/**
 * GET /api/analytics/dashboard/trabalhador
 * Obtém dados resumidos para dashboard do trabalhador
 */
export const obterDashboardTrabalhador = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const authReq = req as IAuthRequest;
  const userCpf = authReq.user?.cpf;

  if (!userCpf) {
    return res.status(401).json({
      status: 'error',
      message: 'Usuário não autenticado',
    });
  }

  const ids = await obterIdsTrabalhadorPorCpf(userCpf);
  const idsValidos = [ids.trabalhadorId, ids.userId].filter(Boolean) as string[];

  if (idsValidos.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'Registro de trabalhador não encontrado para este usuário',
    });
  }

  const dados = await analyticsService.obterDadosDashboardTrabalhador(idsValidos);

  res.status(200).json({
    status: 'success',
    data: { dados },
  });
});

/**
 * GET /api/analytics/monitoramento
 * Obtém dados de inteligência em saúde e monitoramento clínico (escopo por empresa)
 */
export const obterMonitoramento = asyncHandler(async (req: Request, res: Response) => {
  const scope = await buildUserScope((req as IAuthRequest).user!);
  const monitoramento = await analyticsService.obterMonitoramentoClinico(scope.empresaScope || undefined);

  res.status(200).json({
    status: 'success',
    data: { monitoramento },
  });
});
