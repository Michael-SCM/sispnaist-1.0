import { Router } from 'express';
import regraValidacaoController from '../controllers/regraValidacaoController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validateRequest, validateObjectId } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

const ENTIDADES = ['trabalhador', 'acidente', 'doenca', 'vacinacao', 'empresa', 'unidade'];
const TIPOS_LOCALIDADE = ['nacional', 'uf', 'municipio'];
const TIPOS_VALIDACAO = ['obrigatorio', 'regex', 'min', 'max', 'enum', 'lengthMin', 'lengthMax', 'personalizado'];

const regraSchema = Joi.object({
  nome: Joi.string().trim().min(1).max(200).required(),
  descricao: Joi.string().trim().max(1000).optional().allow(''),
  entidade: Joi.string().valid(...ENTIDADES).required(),
  campo: Joi.string().trim().min(1).max(100).required(),
  tipoLocalidade: Joi.string().valid(...TIPOS_LOCALIDADE).required(),
  ufs: Joi.array().items(Joi.string().valid(...UFS)).optional().default([]),
  municipios: Joi.array().items(Joi.string().trim()).optional().default([]),
  tipoValidacao: Joi.string().valid(...TIPOS_VALIDACAO).required(),
  valorValidacao: Joi.string().required(),
  mensagemErro: Joi.string().trim().min(1).max(500).required(),
  prioridade: Joi.number().integer().min(0).optional().default(0),
  ativo: Joi.boolean().optional().default(true),
  dataInicioVigencia: Joi.date().optional(),
  dataFimVigencia: Joi.date().optional().allow(null)
});

const regraUpdateSchema = Joi.object({
  nome: Joi.string().trim().min(1).max(200).optional(),
  descricao: Joi.string().trim().max(1000).optional().allow(''),
  entidade: Joi.string().valid(...ENTIDADES).optional(),
  campo: Joi.string().trim().min(1).max(100).optional(),
  tipoLocalidade: Joi.string().valid(...TIPOS_LOCALIDADE).optional(),
  ufs: Joi.array().items(Joi.string().valid(...UFS)).optional(),
  municipios: Joi.array().items(Joi.string().trim()).optional(),
  tipoValidacao: Joi.string().valid(...TIPOS_VALIDACAO).optional(),
  valorValidacao: Joi.string().optional(),
  mensagemErro: Joi.string().trim().min(1).max(500).optional(),
  prioridade: Joi.number().integer().min(0).optional(),
  ativo: Joi.boolean().optional(),
  dataInicioVigencia: Joi.date().optional(),
  dataFimVigencia: Joi.date().optional().allow(null)
}).min(1);

const validarSchema = Joi.object({
  entidade: Joi.string().valid(...ENTIDADES).required(),
  dados: Joi.object().required(),
  uf: Joi.string().valid(...UFS).optional(),
  municipio: Joi.string().trim().optional()
});

router.use(authMiddleware);

router.get('/', regraValidacaoController.listar);
router.get('/entidades', regraValidacaoController.listarEntidades);
router.get('/campos/:entidade', regraValidacaoController.listarCampos);
router.get('/:id', validateObjectId('id'), regraValidacaoController.obter);

router.post('/validar', validateRequest(validarSchema), regraValidacaoController.validar);
router.post('/', adminMiddleware, validateRequest(regraSchema), regraValidacaoController.criar);
router.put('/:id', adminMiddleware, validateObjectId('id'), validateRequest(regraUpdateSchema), regraValidacaoController.atualizar);
router.delete('/:id', adminMiddleware, validateObjectId('id'), regraValidacaoController.deletar);

export default router;
