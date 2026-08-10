import { Router } from 'express';
import {
  obterKPIs,
  obterDadosAcidentes,
  obterProximasVacinacoes,
  obterUltimosAcidentes,
  obterDashboardAdmin,
  obterDashboardTrabalhador,
  obterMonitoramento,
} from '../controllers/analyticsController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// KPIs gerais (todos os perfis podem acessar)
router.get('/kpis', cacheMiddleware(300, 'analytics'), obterKPIs);

// Dados para gráficos de acidentes (todos os perfis)
router.get('/acidentes', cacheMiddleware(300, 'analytics'), obterDadosAcidentes);

// Próximas vacinações (todos os perfis)
router.get('/vacinacoes/proximas', cacheMiddleware(180, 'analytics'), obterProximasVacinacoes);

// Últimos acidentes (todos os perfis)
router.get('/acidentes/ultimos', cacheMiddleware(180, 'analytics'), obterUltimosAcidentes);

// Dashboard completo admin (apenas admin e gestor)
router.get('/dashboard', authorize('admin', 'gestor'), cacheMiddleware(300, 'analytics'), obterDashboardAdmin);

// Dashboard trabalhador (apenas trabalhador) — sem cache (dados pessoais)
router.get('/dashboard/trabalhador', obterDashboardTrabalhador);

// Monitoramento clínico (admin e gestor)
router.get('/monitoramento', authorize('admin', 'gestor'), cacheMiddleware(300, 'analytics'), obterMonitoramento);

export default router;
