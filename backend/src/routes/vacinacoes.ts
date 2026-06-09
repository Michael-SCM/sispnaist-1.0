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
import { validateRequest, validateObjectId } from '../middleware/validation.js';
import { criarVacinacaoSchema, atualizarVacinacaoSchema } from '../utils/validations.js';

const router = express.Router();

// Proteger todas as rotas com autenticação
router.use(authMiddleware);

// Estatísticas (antes de rotas com :id)
router.get('/stats/estatisticas', obterEstatisticas);

// Vacinações por Trabalhador
router.get('/trabalhador/:trabalhadorId', obterVacinacoesPorTrabalhador);

// CRUD padrão
router.post('/', validateRequest(criarVacinacaoSchema), criarVacinacao);
router.get('/', listarVacinacoes);
router.get('/:id', validateObjectId('id'), obterVacinacao);
router.put('/:id', validateObjectId('id'), validateRequest(atualizarVacinacaoSchema), atualizarVacinacao);
router.delete('/:id', validateObjectId('id'), deletarVacinacao);

export default router;
