import { Router } from 'express';
import parametroController from '../controllers/parametroController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

const parametroSchema = Joi.object({
  chave: Joi.string().trim().min(1).max(100).required(),
  valor: Joi.string().required(),
  descricao: Joi.string().trim().max(500).optional(),
  categoria: Joi.string().trim().optional(),
  tipo: Joi.string().valid('texto', 'numero', 'data', 'hora', 'boolean', 'json').optional()
});

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', parametroController.listar);
router.get('/chave/:chave', parametroController.obterPorChave);
router.get('/:id', parametroController.obter);

// Criação e atualização requerem admin
router.post('/', adminMiddleware, validateRequest(parametroSchema), parametroController.criar);
router.put('/:id', adminMiddleware, parametroController.atualizar);
router.delete('/:id', adminMiddleware, parametroController.deletar);

export default router;
