import { Router } from 'express';
import emailController from '../controllers/emailController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { padraoEmailSchema, padraoEmailUpdateSchema } from '../utils/validations';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas de templates/padrões de email
router.get('/padroes', emailController.listarPadroes);
router.get('/padroes/:id', emailController.obterPadrao);
router.post('/padroes', adminMiddleware, validateRequest(padraoEmailSchema), emailController.criarPadrao);
router.put('/padroes/:id', adminMiddleware, validateRequest(padraoEmailUpdateSchema), emailController.atualizarPadrao);
router.delete('/padroes/:id', adminMiddleware, emailController.deletarPadrao);

// Envio de email (placeholder)
router.post('/enviar', emailController.enviar);

export default router;
