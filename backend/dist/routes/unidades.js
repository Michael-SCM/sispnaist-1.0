import express from 'express';
import * as unidadeController from '../controllers/unidadeController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
const router = express.Router();
// Todas as rotas requerem autenticação
router.use(authMiddleware);
// Rota pública para usuários autenticados (usada em dropdowns de cadastro)
router.get('/empresa/:empresaId', unidadeController.getUnidadesPorEmpresa);
// Rotas restritas a Admin
router.get('/', adminMiddleware, unidadeController.getUnidades);
router.post('/', adminMiddleware, unidadeController.createUnidade);
router.get('/:id', adminMiddleware, unidadeController.getUnidade);
router.put('/:id', adminMiddleware, unidadeController.updateUnidade);
router.delete('/:id', adminMiddleware, unidadeController.deleteUnidade);
export default router;
//# sourceMappingURL=unidades.js.map