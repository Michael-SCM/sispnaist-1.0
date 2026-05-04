import { Router } from 'express';
import * as materialBiologicoController from '../controllers/materialBiologicoController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

// Todas as rotas de material biológico requerem autenticação
router.use(authMiddleware);

router.get('/', materialBiologicoController.listar);
router.post('/', materialBiologicoController.criar);
router.get('/:id', materialBiologicoController.obter);
router.get('/acidente/:acidenteId', materialBiologicoController.obterPorAcidente);
router.put('/:id', materialBiologicoController.atualizar);

// Apenas admins podem deletar fichas técnicas
router.delete('/:id', adminMiddleware, materialBiologicoController.deletar);

export default router;
