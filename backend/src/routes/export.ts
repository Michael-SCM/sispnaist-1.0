import { Router } from 'express';
import ExportController from '../controllers/ExportController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';

const router = Router();

// Todas as rotas exigem autenticação e privilégios elevados
router.use(authMiddleware);
router.use(authorize('admin', 'gestor'));

// Rotas CSV (mantidas para compatibilidade)
router.get('/acidentes', ExportController.exportarAcidentesCSV);
router.get('/trabalhadores', ExportController.exportarTrabalhadoresCSV);
router.get('/material-biologico', ExportController.exportarMaterialBiologicoCSV);

// Rotas PDF (novos endpoints)
router.get('/acidentes/pdf', ExportController.exportarAcidentesPDF);
router.get('/trabalhadores/pdf', ExportController.exportarTrabalhadoresPDF);
router.get('/material-biologico/pdf', ExportController.exportarMaterialBiologicoPDF);

export default router;
