import { Router } from 'express';
import ExportController from '../controllers/ExportController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';

const router = Router();

// Todas as rotas exigem autenticação e privilégios elevados
router.use(authMiddleware);
router.use(authorize('admin', 'gestor'));

router.get('/acidentes', ExportController.exportarAcidentesCSV);
router.get('/trabalhadores', ExportController.exportarTrabalhadoresCSV);

export default router;
