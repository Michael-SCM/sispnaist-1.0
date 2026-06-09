import { Router } from 'express';
import preferenciaController from '../controllers/preferenciaController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { preferenciaSchema } from '../utils/validations';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Preferências do usuário logado
router.get('/minhas', preferenciaController.obterMinhas);
router.put('/minhas', validateRequest(preferenciaSchema), preferenciaController.atualizarMinhas);

// Preferências de outros usuário (requer admin no controller)
router.get('/usuario/:usuarioId', preferenciaController.obter);
router.put('/usuario/:usuarioId', validateRequest(preferenciaSchema), preferenciaController.atualizar);

export default router;
