import { Router } from 'express';
import parametroUfController from '../controllers/parametroUfController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validateRequest, validateObjectId } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

const parametroUfSchema = Joi.object({
  chave: Joi.string().trim().min(1).max(100).required(),
  valor: Joi.string().required(),
  descricao: Joi.string().trim().max(500).optional().allow(''),
  uf: Joi.string().valid(...UFS).required(),
  categoria: Joi.string().trim().optional().allow(''),
  tipo: Joi.string().valid('texto', 'numero', 'data', 'hora', 'boolean', 'json').optional(),
  ativo: Joi.boolean().optional(),
  dataInicioVigencia: Joi.date().optional(),
  dataFimVigencia: Joi.date().optional()
});

const parametroUfUpdateSchema = Joi.object({
  chave: Joi.string().trim().min(1).max(100).optional(),
  valor: Joi.string().optional(),
  descricao: Joi.string().trim().max(500).optional().allow(''),
  uf: Joi.string().valid(...UFS).optional(),
  categoria: Joi.string().trim().optional().allow(''),
  tipo: Joi.string().valid('texto', 'numero', 'data', 'hora', 'boolean', 'json').optional(),
  ativo: Joi.boolean().optional(),
  dataInicioVigencia: Joi.date().optional(),
  dataFimVigencia: Joi.date().optional().allow(null)
}).min(1);

router.use(authMiddleware);

router.get('/', parametroUfController.listar);
router.get('/chave/:chave', parametroUfController.obterPorChave);
router.get('/uf/:uf', parametroUfController.listarPorUF);
router.get('/:id', validateObjectId('id'), parametroUfController.obter);

router.post('/', adminMiddleware, validateRequest(parametroUfSchema), parametroUfController.criar);
router.put('/:id', adminMiddleware, validateObjectId('id'), validateRequest(parametroUfUpdateSchema), parametroUfController.atualizar);
router.delete('/:id', adminMiddleware, validateObjectId('id'), parametroUfController.deletar);

export default router;
