import { Router } from 'express';
import { buscarNoCnes } from '../controllers/cnesController.js';

const router = Router();

router.get('/:codigo', buscarNoCnes);

export default router;
