import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import analyticsService from '../services/AnalyticsService.js';
import { IAuthRequest } from '../middleware/auth.js';
import Trabalhador from '../models/Trabalhador.js';

/**
 * GET /api/analytics/kpis
 * Obtém KPIs gerais do sistema
 */
export const obterKPIs = asyncHandler(async (req: Request, res: Response) => {
  const kpis = await analyticsService.obterKPIs();

  res.status(200).json({
    status: 'success',
    data: { kpis },
  });
});

/**
 * GET /api/analytics/acidentes
 * Obtém dados para gráficos de acidentes
 */
export const obterDadosAcidentes = asyncHandler(async (req: Request, res: Response) => {
  const dados = await analyticsService.obterDadosAcidentes();

  res.status(200).json({
    status: 'success',
    data: { dados },
  });
});

/**
 * GET /api/analytics/vacinacoes/proximas
 * Obtém próximas vacinações (vencidas ou próximas de vencer)
 */
export const obterProximasVacinacoes = asyncHandler(async (req: Request, res: Response) => {
  const dias = parseInt(req.query.dias as string) || 30;
  const vacinacoes = await analyticsService.obterProximasVacinacoes(dias);

  res.status(200).json({
    status: 'success',
    data: { vacinacoes },
  });
});

/**
 * GET /api/analytics/acidentes/ultimos
 * Obtém últimos acidentes registrados
 */
export const obterUltimosAcidentes = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5;
  const acidentes = await analyticsService.obterUltimosAcidentes(limit);

  res.status(200).json({
    status: 'success',
    data: { acidentes },
  });
});

/**
 * GET /api/analytics/dashboard
 * Obtém dados completos para dashboard admin
 */
export const obterDashboardAdmin = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const dados = await analyticsService.obterDadosDashboardAdmin();

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

  // Buscar o registro do trabalhador pelo CPF (coleção trabalhadores ≠ coleção usuarios)
  const trabalhador = await Trabalhador.findOne({ cpf: userCpf }).select('_id');
  if (!trabalhador) {
    return res.status(404).json({
      status: 'error',
      message: 'Registro de trabalhador não encontrado para este usuário',
    });
  }

  const dados = await analyticsService.obterDadosDashboardTrabalhador(trabalhador._id.toString());

  res.status(200).json({
    status: 'success',
    data: { dados },
  });
});

/**
 * GET /api/analytics/monitoramento
 * Obtém dados de inteligência em saúde e monitoramento clínico
 */
export const obterMonitoramento = asyncHandler(async (req: Request, res: Response) => {
  const monitoramento = await analyticsService.obterMonitoramentoClinico();

  res.status(200).json({
    status: 'success',
    data: { monitoramento },
  });
});
