import { Router } from 'express';
import videoAulaController from '../controllers/videoAulaController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

const videoAulaSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(200).required(),
  descricao: Joi.string().trim().max(1000).optional(),
  url: Joi.string().uri().required(),
  thumbnail: Joi.string().optional(),
  duracao: Joi.string().optional(),
  categoria: Joi.string().trim().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  ordem: Joi.number().integer().min(0).optional()
});

// Listar e obter são públicos para usuários autenticados
router.get('/', authMiddleware, videoAulaController.listar);
router.get('/:id', authMiddleware, videoAulaController.obter);

// Criar, atualizar e deletar requerem admin
router.post('/', adminMiddleware, validateRequest(videoAulaSchema), videoAulaController.criar);
router.put('/:id', adminMiddleware, videoAulaController.atualizar);
router.delete('/:id', adminMiddleware, videoAulaController.deletar);

export default router;
