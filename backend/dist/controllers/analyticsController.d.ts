import { Request, Response } from 'express';
/**
 * GET /api/analytics/kpis
 * Obtém KPIs gerais do sistema
 */
export declare const obterKPIs: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * GET /api/analytics/acidentes
 * Obtém dados para gráficos de acidentes
 */
export declare const obterDadosAcidentes: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * GET /api/analytics/vacinacoes/proximas
 * Obtém próximas vacinações (vencidas ou próximas de vencer)
 */
export declare const obterProximasVacinacoes: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * GET /api/analytics/acidentes/ultimos
 * Obtém últimos acidentes registrados
 */
export declare const obterUltimosAcidentes: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * GET /api/analytics/dashboard
 * Obtém dados completos para dashboard admin
 */
export declare const obterDashboardAdmin: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * GET /api/analytics/dashboard/trabalhador
 * Obtém dados resumidos para dashboard do trabalhador
 */
export declare const obterDashboardTrabalhador: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=analyticsController.d.ts.map