import { Router } from 'express';
import emailController from '../controllers/emailController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas de templates/padrões de email
router.get('/padroes', emailController.listarPadroes);
router.get('/padroes/:id', emailController.obterPadrao);
router.post('/padroes', adminMiddleware, emailController.criarPadrao);
router.put('/padroes/:id', adminMiddleware, emailController.atualizarPadrao);
router.delete('/padroes/:id', adminMiddleware, emailController.deletarPadrao);

// Envio de email (placeholder)
router.post('/enviar', emailController.enviar);

export default router;
