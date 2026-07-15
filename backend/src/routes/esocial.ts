import { Router } from 'express';
import { buscarNoEsocial } from '../controllers/esocialController.js';

const router = Router();

router.get('/:cpf', buscarNoEsocial);

export default router;
