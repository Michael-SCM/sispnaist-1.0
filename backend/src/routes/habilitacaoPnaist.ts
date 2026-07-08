import express from 'express';
import * as habilitacaoPnaistController from '../controllers/habilitacaoPnaistController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', adminMiddleware, habilitacaoPnaistController.listar);
router.get('/habilitados', habilitacaoPnaistController.listarHabilitados);
router.post('/habilitar', adminMiddleware, habilitacaoPnaistController.habilitar);
router.post('/desabilitar', adminMiddleware, habilitacaoPnaistController.desabilitar);

export default router;
