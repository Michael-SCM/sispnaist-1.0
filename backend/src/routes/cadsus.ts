import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { buscarNoCadsus } from '../controllers/cadsusController.js';

const router = Router();

router.use(authMiddleware);

router.get('/:cpfOuCns', buscarNoCadsus);

export default router;
