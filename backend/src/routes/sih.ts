import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { buscarInternacoes } from '../controllers/sihController.js';

const router = Router();

router.use(authMiddleware);

router.get('/:cns', buscarInternacoes);

export default router;
