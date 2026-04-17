import { Router } from 'express';
import {
  gerarRelatorioAcidentes,
  gerarRelatorioVacinacoes,
  gerarRelatorioDoencas,
} from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// Relatórios em JSON (base para PDF/XLS no frontend)
router.get('/acidentes', gerarRelatorioAcidentes);
router.get('/vacinacoes', gerarRelatorioVacinacoes);
router.get('/doencas', gerarRelatorioDoencas);

export default router;
