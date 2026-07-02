import { Router } from 'express';
import {
  listarQuizzes,
  obterQuiz,
  obterQuizPorVideo,
  criarQuiz,
  atualizarQuiz,
  deletarQuiz
} from '../controllers/quizController.js';
import { authMiddleware, adminOuGestorMiddleware } from '../middleware/auth.js';
import { validateRequest, validateObjectId } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

const questaoSchema = Joi.object({
  pergunta: Joi.string().trim().min(1).max(500).required(),
  opcoes: Joi.array().items(Joi.string().trim().min(1)).min(2).max(10).required(),
  opcaoCorreta: Joi.number().integer().min(0).required(),
  ordem: Joi.number().integer().min(0).optional()
});

const quizSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(200).required(),
  descricao: Joi.string().trim().max(1000).optional(),
  videoAulaId: Joi.string().optional(),
  questoes: Joi.array().items(questaoSchema).min(1).required(),
  pontuacaoMinima: Joi.number().integer().min(0).max(100).optional(),
  tempoLimite: Joi.number().integer().min(0).optional(),
  tentativasPermitidas: Joi.number().integer().min(1).max(10).optional(),
  ativo: Joi.boolean().optional(),
  ordem: Joi.number().integer().min(0).optional()
});

const quizUpdateSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(200).optional(),
  descricao: Joi.string().trim().max(1000).optional(),
  videoAulaId: Joi.string().optional(),
  questoes: Joi.array().items(questaoSchema).min(1).optional(),
  pontuacaoMinima: Joi.number().integer().min(0).max(100).optional(),
  tempoLimite: Joi.number().integer().min(0).optional(),
  tentativasPermitidas: Joi.number().integer().min(1).max(10).optional(),
  ativo: Joi.boolean().optional(),
  ordem: Joi.number().integer().min(0).optional()
}).min(1);

router.get('/', authMiddleware, listarQuizzes);
router.get('/video/:videoAulaId', authMiddleware, obterQuizPorVideo);
router.get('/:id', authMiddleware, validateObjectId('id'), obterQuiz);

router.post('/', authMiddleware, adminOuGestorMiddleware, validateRequest(quizSchema), criarQuiz);
router.put('/:id', authMiddleware, adminOuGestorMiddleware, validateObjectId('id'), validateRequest(quizUpdateSchema), atualizarQuiz);
router.delete('/:id', authMiddleware, adminOuGestorMiddleware, validateObjectId('id'), deletarQuiz);

export default router;
