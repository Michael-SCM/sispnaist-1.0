import { Router } from 'express';
import { obterLogs, obterEstatisticas } from '../controllers/auditController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';

const router = Router();

// Todas as rotas exigem autenticação e perfil admin
router.use(authMiddleware);
router.use(authorize('admin'));

// Rotas de auditoria (apenas admin)
router.get('/logs', obterLogs);
router.get('/stats', obterEstatisticas);

export default router;
