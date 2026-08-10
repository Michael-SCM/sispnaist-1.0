import { Router } from 'express';
import {
  gerarRelatorioAcidentes,
  gerarRelatorioVacinacoes,
  gerarRelatorioDoencas,
} from '../controllers/reportController.js';
import { authMiddleware, adminOuGestorMiddleware } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = Router();

// Todas as rotas exigem autenticação e perfil admin/gestor
router.use(authMiddleware, adminOuGestorMiddleware);

// Relatórios em JSON (base para PDF/XLS no frontend)
router.get('/acidentes', cacheMiddleware(300, 'reports'), gerarRelatorioAcidentes);
router.get('/vacinacoes', cacheMiddleware(300, 'reports'), gerarRelatorioVacinacoes);
router.get('/doencas', cacheMiddleware(300, 'reports'), gerarRelatorioDoencas);

export default router;
