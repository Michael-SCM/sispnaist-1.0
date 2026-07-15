import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { buscarNoCnes } from '../controllers/cnesController.js';

const router = Router();

router.use(authMiddleware);

router.get('/:codigo', buscarNoCnes);

export default router;
