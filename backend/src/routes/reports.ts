import { Router } from 'express';
import {
  gerarRelatorioAcidentes,
  gerarRelatorioVacinacoes,
  gerarRelatorioDoencas,
} from '../controllers/reportController.js';
import { authMiddleware, adminOuGestorMiddleware } from '../middleware/auth.js';

const router = Router();

// Todas as rotas exigem autenticação e perfil admin/gestor
router.use(authMiddleware, adminOuGestorMiddleware);

// Relatórios em JSON (base para PDF/XLS no frontend)
router.get('/acidentes', gerarRelatorioAcidentes);
router.get('/vacinacoes', gerarRelatorioVacinacoes);
router.get('/doencas', gerarRelatorioDoencas);

export default router;
