import { Router } from 'express';
import { buscarInternacoes } from '../controllers/sihController.js';

const router = Router();

router.get('/:cns', buscarInternacoes);

export default router;
