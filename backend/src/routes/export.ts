import { Router } from 'express';
import ExportController from '../controllers/ExportController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';

const router = Router();

// Todas as rotas exigem autenticação e privilégios elevados
router.use(authMiddleware);

// CSV exports: admin e gestor
router.get('/acidentes', authorize('admin', 'gestor'), ExportController.exportarAcidentesCSV);
router.get('/trabalhadores', authorize('admin', 'gestor'), ExportController.exportarTrabalhadoresCSV);
router.get('/material-biologico', authorize('admin', 'gestor'), ExportController.exportarMaterialBiologicoCSV);

// PDF exports: admin e gestor
router.get('/acidentes/pdf', authorize('admin', 'gestor'), ExportController.exportarAcidentesPDF);
router.get('/doencas/pdf', authorize('admin', 'gestor'), ExportController.exportarDoencasPDF);
router.get('/vacinacoes/pdf', authorize('admin', 'gestor'), ExportController.exportarVacinacoesPDF);
router.get('/monitoramento/pdf', authorize('admin', 'gestor'), ExportController.exportarMonitoramentoPDF);
router.get('/trabalhadores/pdf', authorize('admin', 'gestor'), ExportController.exportarTrabalhadoresPDF);

export default router;
