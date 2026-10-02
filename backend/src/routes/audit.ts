import { Router } from 'express';
import {
  obterLogs,
  obterEstatisticas,
  verificarIntegridade,
  obterPolitica,
} from '../controllers/auditController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validation.js';
import { listarAuditLogsQuerySchema } from '../utils/validations.js';

const router = Router();

// Todas as rotas exigem autenticação e perfil admin (acesso restrito)
router.use(authMiddleware);
router.use(authorize('admin'));

// Rotas de auditoria (apenas admin)
router.get('/logs', validateQuery(listarAuditLogsQuerySchema), obterLogs);
router.get('/stats', obterEstatisticas);
router.get('/integrity', verificarIntegridade);
router.get('/policy', obterPolitica);

export default router;
