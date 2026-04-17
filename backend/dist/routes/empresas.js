import express from 'express';
import * as empresaController from '../controllers/empresaController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
const router = express.Router();
// Todas as rotas de empresas requerem autenticação de Admin
router.use(authMiddleware);
router.use(adminMiddleware);
router.get('/', empresaController.getEmpresas);
router.post('/', empresaController.createEmpresa);
router.get('/:id', empresaController.getEmpresa);
router.put('/:id', empresaController.updateEmpresa);
router.delete('/:id', empresaController.deleteEmpresa);
export default router;
//# sourceMappingURL=empresas.js.map