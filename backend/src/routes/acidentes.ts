import express from 'express';
import * as acidenteController from '../controllers/acidenteController.js';
import { validateRequest, validateObjectId } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { criarAcidenteSchema, atualizarAcidenteSchema } from '../utils/validations.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// CRUD básico
router.post('/', validateRequest(criarAcidenteSchema), acidenteController.criar);
router.get('/', acidenteController.listar);

// Rotas estáticas/específicas SEMPRE antes das dinâmicas
router.get('/stats/estatisticas', acidenteController.obterEstatisticas);
router.get('/trabalhador/:trabalhadorId', acidenteController.obterPorTrabalhador);

// Rotas dinâmicas com validação
router.get('/:id', validateObjectId('id'), acidenteController.obter);
router.put('/:id', validateObjectId('id'), validateRequest(atualizarAcidenteSchema), acidenteController.atualizar);
router.delete('/:id', validateObjectId('id'), acidenteController.deletar);

export default router;
