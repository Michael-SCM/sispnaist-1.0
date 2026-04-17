import { Router } from 'express';
import questionarioController from '../controllers/questionarioController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// Validação básica para questionário
const questionarioSchema = Joi.object({
  nome: Joi.string().trim().min(1).max(200).required(),
  descricao: Joi.string().trim().max(500).optional(),
  tipo: Joi.string().required(),
  ativo: Joi.boolean().optional(),
  dataInicio: Joi.date().optional(),
  dataFim: Joi.date().optional()
});

const questionarioItemSchema = Joi.object({
  pergunta: Joi.string().trim().min(1).max(500).required(),
  tipoResposta: Joi.string().valid('texto', 'unica', 'multipla', 'escala', 'data').required(),
  obrigatorio: Joi.boolean().optional(),
  ordem: Joi.number().integer().min(0).optional(),
  alternativas: Joi.array().items(
    Joi.object({
      valor: Joi.string().required(),
      texto: Joi.string().required(),
      pontuacao: Joi.number().optional()
    })
  ).optional()
});

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', questionarioController.listar);
router.get('/:id', questionarioController.obter);
router.post('/', validateRequest(questionarioSchema), questionarioController.criar);
router.put('/:id', questionarioController.atualizar);
router.delete('/:id', questionarioController.deletar);

// Rotas de itens do questionário
router.post('/:id/itens', validateRequest(questionarioItemSchema), questionarioController.criarItem);
router.put('/:id/itens/:itemId', questionarioController.atualizarItem);
router.delete('/:id/itens/:itemId', questionarioController.deletarItem);

export default router;
