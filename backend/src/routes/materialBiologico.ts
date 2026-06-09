import { Router } from 'express';
import * as materialBiologicoController from '../controllers/materialBiologicoController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { validateRequest, validateObjectId } from '../middleware/validation.js';
import { materialBiologicoSchema, materialBiologicoUpdateSchema } from '../utils/validations.js';

const router = Router();

// Todas as rotas de material biológico requerem autenticação
router.use(authMiddleware);

router.get('/', materialBiologicoController.listar);
router.post('/', validateRequest(materialBiologicoSchema), materialBiologicoController.criar);
router.get('/:id', validateObjectId('id'), materialBiologicoController.obter);
router.get('/acidente/:acidenteId', validateObjectId('acidenteId'), materialBiologicoController.obterPorAcidente);
router.put('/:id', validateObjectId('id'), validateRequest(materialBiologicoUpdateSchema), materialBiologicoController.atualizar);

// Apenas admins podem deletar fichas técnicas
router.delete('/:id', validateObjectId('id'), adminMiddleware, materialBiologicoController.deletar);

export default router;
