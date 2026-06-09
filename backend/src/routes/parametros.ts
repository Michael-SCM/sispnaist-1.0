import { Router } from 'express';
import parametroController from '../controllers/parametroController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validateRequest, validateObjectId } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

const parametroSchema = Joi.object({
  chave: Joi.string().trim().min(1).max(100).required(),
  valor: Joi.string().required(),
  descricao: Joi.string().trim().max(500).optional(),
  categoria: Joi.string().trim().optional(),
  tipo: Joi.string().valid('texto', 'numero', 'data', 'hora', 'boolean', 'json').optional()
});

const parametroUpdateSchema = Joi.object({
  chave: Joi.string().trim().min(1).max(100).optional(),
  valor: Joi.string().optional(),
  descricao: Joi.string().trim().max(500).optional(),
  categoria: Joi.string().trim().optional(),
  tipo: Joi.string().valid('texto', 'numero', 'data', 'hora', 'boolean', 'json').optional()
}).min(1);

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', parametroController.listar);
router.get('/chave/:chave', parametroController.obterPorChave);
router.get('/:id', validateObjectId('id'), parametroController.obter);

// Criação e atualização requerem admin
router.post('/', adminMiddleware, validateRequest(parametroSchema), parametroController.criar);
router.put('/:id', adminMiddleware, validateObjectId('id'), validateRequest(parametroUpdateSchema), parametroController.atualizar);
router.delete('/:id', adminMiddleware, validateObjectId('id'), parametroController.deletar);

export default router;
