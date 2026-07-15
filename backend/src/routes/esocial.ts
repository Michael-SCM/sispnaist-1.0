import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { buscarNoEsocial } from '../controllers/esocialController.js';

const router = Router();

router.use(authMiddleware);

router.get('/:cpf', buscarNoEsocial);

export default router;
