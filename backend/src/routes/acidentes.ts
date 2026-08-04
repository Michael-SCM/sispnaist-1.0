import express from 'express';
import * as acidenteController from '../controllers/acidenteController.js';
import { validateRequest, validateObjectId, validateQuery } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { auditRead, auditReadList } from '../middleware/auditRead.js';
import { criarAcidenteSchema, atualizarAcidenteSchema, listarAcidentesQuerySchema } from '../utils/validations.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// CRUD básico
router.post('/', validateRequest(criarAcidenteSchema), acidenteController.criar);
router.get('/', validateQuery(listarAcidentesQuerySchema), auditReadList('Acidente'), acidenteController.listar);

// Rotas estáticas/específicas SEMPRE antes das dinâmicas
router.get('/stats/estatisticas', acidenteController.obterEstatisticas);
router.get('/trabalhador/:trabalhadorId', auditRead('Acidente'), acidenteController.obterPorTrabalhador);

// Rotas dinâmicas com validação
router.get('/:id', validateObjectId('id'), auditRead('Acidente'), acidenteController.obter);
router.put('/:id', validateObjectId('id'), validateRequest(atualizarAcidenteSchema), acidenteController.atualizar);
router.delete('/:id', validateObjectId('id'), acidenteController.deletar);

export default router;
