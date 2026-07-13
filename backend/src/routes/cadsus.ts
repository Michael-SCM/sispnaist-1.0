import { Router } from 'express';
import { buscarNoCadsus } from '../controllers/cadsusController.js';

const router = Router();

router.get('/:cpfOuCns', buscarNoCadsus);

export default router;
