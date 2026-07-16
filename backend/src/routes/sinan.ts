import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { buscarNotificacoes, notificar } from '../controllers/sinanController.js';

const router = Router();

router.use(authMiddleware);

router.get('/:cpfOuCns', buscarNotificacoes);
router.post('/notificar', notificar);

export default router;
