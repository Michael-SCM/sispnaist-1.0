import express from 'express';
import {
  criarVacinacao,
  obterVacinacao,
  listarVacinacoes,
  atualizarVacinacao,
  deletarVacinacao,
  obterVacinacoesPorTrabalhador,
  obterEstatisticas,
} from '../controllers/vacinacaoController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest, validateObjectId, validateQuery } from '../middleware/validation.js';
import { auditRead, auditReadList } from '../middleware/auditRead.js';
import { criarVacinacaoSchema, atualizarVacinacaoSchema, listarVacinacoesQuerySchema } from '../utils/validations.js';

const router = express.Router();

// Proteger todas as rotas com autenticação
router.use(authMiddleware);

// Estatísticas (antes de rotas com :id)
router.get('/stats/estatisticas', obterEstatisticas);

// Vacinações por Trabalhador
router.get('/trabalhador/:trabalhadorId', auditRead('Vacinacao'), obterVacinacoesPorTrabalhador);

// CRUD padrão
router.post('/', validateRequest(criarVacinacaoSchema), criarVacinacao);
router.get('/', validateQuery(listarVacinacoesQuerySchema), auditReadList('Vacinacao'), listarVacinacoes);
router.get('/:id', validateObjectId('id'), auditRead('Vacinacao'), obterVacinacao);
router.put('/:id', validateObjectId('id'), validateRequest(atualizarVacinacaoSchema), atualizarVacinacao);
router.delete('/:id', validateObjectId('id'), deletarVacinacao);

export default router;
