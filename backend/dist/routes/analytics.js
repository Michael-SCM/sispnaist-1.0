"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_js_1 = require("../controllers/analyticsController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação
router.use(auth_js_1.authMiddleware);
// KPIs gerais (todos os perfis podem acessar)
router.get('/kpis', analyticsController_js_1.obterKPIs);
// Dados para gráficos de acidentes (todos os perfis)
router.get('/acidentes', analyticsController_js_1.obterDadosAcidentes);
// Próximas vacinações (todos os perfis)
router.get('/vacinacoes/proximas', analyticsController_js_1.obterProximasVacinacoes);
// Últimos acidentes (todos os perfis)
router.get('/acidentes/ultimos', analyticsController_js_1.obterUltimosAcidentes);
// Dashboard completo admin (apenas admin e gestor)
router.get('/dashboard', (0, auth_js_1.authorize)('admin', 'gestor'), analyticsController_js_1.obterDashboardAdmin);
// Dashboard trabalhador (apenas trabalhador)
router.get('/dashboard/trabalhador', analyticsController_js_1.obterDashboardTrabalhador);
// Monitoramento clínico (admin e gestor)
router.get('/monitoramento', (0, auth_js_1.authorize)('admin', 'gestor'), analyticsController_js_1.obterMonitoramento);
exports.default = router;
