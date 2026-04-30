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

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// KPIs gerais (todos os perfis podem acessar)
router.get('/kpis', obterKPIs);

// Dados para gráficos de acidentes (todos os perfis)
router.get('/acidentes', obterDadosAcidentes);

// Próximas vacinações (todos os perfis)
router.get('/vacinacoes/proximas', obterProximasVacinacoes);

// Últimos acidentes (todos os perfis)
router.get('/acidentes/ultimos', obterUltimosAcidentes);

// Dashboard completo admin (apenas admin e gestor)
router.get('/dashboard', authorize('admin', 'gestor'), obterDashboardAdmin);

// Dashboard trabalhador (apenas trabalhador)
router.get('/dashboard/trabalhador', obterDashboardTrabalhador);

// Monitoramento clínico (admin e gestor)
router.get('/monitoramento', authorize('admin', 'gestor'), obterMonitoramento);

export default router;
