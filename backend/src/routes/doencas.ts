import express from 'express';
import * as doencaController from '../controllers/doencaController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest, validateObjectId } from '../middleware/validation.js';
import { criarDoencaSchema, atualizarDoencaSchema } from '../utils/validations.js';

const router = express.Router();

// Rotas protegidas - todas requerem autenticação
router.use(authMiddleware);

// Rotas específicas (devem vir antes das rotas paramétrizadas)
router.get('/stats/estatisticas', doencaController.obterEstatisticas);
router.get('/trabalhador/:trabalhadorId', doencaController.obterPorTrabalhador);

// CRUD padrão (rotas genéricas por último)
router.post('/', validateRequest(criarDoencaSchema), doencaController.criar);
router.get('/', doencaController.listar);
router.get('/:id', validateObjectId('id'), doencaController.obter);
router.put('/:id', validateObjectId('id'), validateRequest(atualizarDoencaSchema), doencaController.atualizar);
router.delete('/:id', validateObjectId('id'), doencaController.deletar);

export default router;
