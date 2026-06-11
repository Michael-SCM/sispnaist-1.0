import { Router } from 'express';
import municipioController from '../controllers/municipioController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', municipioController.buscar);
router.get('/todos', municipioController.listarTodos);

export default router;
