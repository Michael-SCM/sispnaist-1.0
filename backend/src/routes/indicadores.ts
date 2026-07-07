import { Router } from 'express';
import indicadorController from '../controllers/indicadorController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { validateRequest, validateObjectId } from '../middleware/validation.js';
import Joi from 'joi';

const router = Router();

const formulaSchema = Joi.object({
  type: Joi.string().valid('simple', 'percentage', 'ratio', 'difference').required(),
  metric: Joi.when('type', {
    is: 'simple',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  numerator: Joi.when('type', {
    is: Joi.valid('percentage', 'ratio'),
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  denominator: Joi.when('type', {
    is: Joi.valid('percentage', 'ratio'),
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  metric1: Joi.when('type', {
    is: 'difference',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  metric2: Joi.when('type', {
    is: 'difference',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  })
});

const indicadorSchema = Joi.object({
  nome: Joi.string().trim().min(1).max(200).required(),
  descricao: Joi.string().trim().max(1000).optional().allow(''),
  categoria: Joi.string().valid('acidente', 'doenca', 'vacinacao', 'absenteismo', 'geral').required(),
  tipo: Joi.string().valid('quantitativo', 'percentual').required(),
  formula: formulaSchema.required(),
  meta: Joi.number().optional().allow(null),
  unidade: Joi.string().trim().max(50).optional().allow(''),
  periodicidade: Joi.string().valid('mensal', 'trimestral', 'semestral', 'anual').optional(),
  uf: Joi.string().length(2).uppercase().optional().allow(''),
  icone: Joi.string().optional().allow(''),
  cor: Joi.string().valid('blue', 'green', 'red', 'yellow', 'purple', 'orange').optional(),
  ordem: Joi.number().optional(),
  ativo: Joi.boolean().optional()
});

const indicadorUpdateSchema = Joi.object({
  nome: Joi.string().trim().min(1).max(200).optional(),
  descricao: Joi.string().trim().max(1000).optional().allow(''),
  categoria: Joi.string().valid('acidente', 'doenca', 'vacinacao', 'absenteismo', 'geral').optional(),
  tipo: Joi.string().valid('quantitativo', 'percentual').optional(),
  formula: formulaSchema.optional(),
  meta: Joi.number().optional().allow(null),
  unidade: Joi.string().trim().max(50).optional().allow(''),
  periodicidade: Joi.string().valid('mensal', 'trimestral', 'semestral', 'anual').optional(),
  uf: Joi.string().length(2).uppercase().optional().allow(''),
  icone: Joi.string().optional().allow(''),
  cor: Joi.string().valid('blue', 'green', 'red', 'yellow', 'purple', 'orange').optional(),
  ordem: Joi.number().optional(),
  ativo: Joi.boolean().optional()
}).min(1);

router.use(authMiddleware);

router.get('/', indicadorController.listar);
router.get('/metricas', indicadorController.obterMetricas);
router.get('/calcular/todos', indicadorController.calcularTodos);
router.get('/:id', validateObjectId('id'), indicadorController.obter);
router.get('/:id/calcular', validateObjectId('id'), indicadorController.calcularIndicador);

router.post('/', adminMiddleware, validateRequest(indicadorSchema), indicadorController.criar);
router.put('/:id', adminMiddleware, validateObjectId('id'), validateRequest(indicadorUpdateSchema), indicadorController.atualizar);
router.delete('/:id', adminMiddleware, validateObjectId('id'), indicadorController.deletar);

export default router;
