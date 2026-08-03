import express from 'express';
import alertaController from '../controllers/alertaController.js';
import { authMiddleware, adminMiddleware, adminOuGestorMiddleware } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Consultas do painel (admin e gestor)
router.get('/resumo', alertaController.obterResumo);
router.get('/', alertaController.listar);

// Regras de alerta (somente admin)
router.get('/regras', adminMiddleware, alertaController.listarRegras);
router.post('/regras', adminMiddleware, alertaController.criarRegra);
router.put('/regras/:id', adminMiddleware, validateObjectId('id'), alertaController.atualizarRegra);
router.delete('/regras/:id', adminMiddleware, validateObjectId('id'), alertaController.deletarRegra);

// Execução manual da avaliação (somente admin/gestor)
router.post('/executar', adminOuGestorMiddleware, alertaController.executarAgora);

// Ações sobre alertas
router.post('/ler-todos', alertaController.marcarTodosLidosSinSino);
router.post('/:id/lido', validateObjectId('id'), alertaController.marcarLido);
router.post('/:id/lido-sino', validateObjectId('id'), alertaController.marcarLidoSino);
router.post('/:id/arquivar', validateObjectId('id'), alertaController.arquivar);

export default router;