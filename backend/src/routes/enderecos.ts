import { Router } from 'express';
import EnderecoController from '../controllers/EnderecoController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

router.get('/bairros', EnderecoController.buscarBairros);
router.get('/logradouros', EnderecoController.buscarLogradouros);
router.get('/cep/:cep', EnderecoController.buscarCEP);

export default router;
