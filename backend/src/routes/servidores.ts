import { Router } from 'express';
import servidorFuncionarioController from '../controllers/servidorFuncionarioController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest, validateObjectId } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

const servidorSchema = Joi.object({
  trabalhadorId: Joi.string().required(),
  matriculaFuncional: Joi.string().trim().min(1).max(50).required(),
  dataPosse: Joi.date().required(),
  dataExercicio: Joi.date().required(),
  regimeJuridico: Joi.string().trim().optional(),
  cargoEfetivo: Joi.string().trim().optional(),
  cargoComissionado: Joi.string().trim().optional(),
  lotacao: Joi.string().trim().optional(),
  situacaoFuncional: Joi.string().trim().optional(),
  atoNomeacao: Joi.string().trim().optional(),
  dataNomeacao: Joi.date().optional(),
  dataAposentadoria: Joi.date().optional(),
  observacoes: Joi.string().trim().optional()
});

const servidorUpdateSchema = Joi.object({
  trabalhadorId: Joi.string().optional(),
  matriculaFuncional: Joi.string().trim().min(1).max(50).optional(),
  dataPosse: Joi.date().optional(),
  dataExercicio: Joi.date().optional(),
  regimeJuridico: Joi.string().trim().optional(),
  cargoEfetivo: Joi.string().trim().optional(),
  cargoComissionado: Joi.string().trim().optional(),
  lotacao: Joi.string().trim().optional(),
  situacaoFuncional: Joi.string().trim().optional(),
  atoNomeacao: Joi.string().trim().optional(),
  dataNomeacao: Joi.date().optional(),
  dataAposentadoria: Joi.date().optional(),
  observacoes: Joi.string().trim().optional()
}).min(1);

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', servidorFuncionarioController.listar);
router.get('/:id', validateObjectId('id'), servidorFuncionarioController.obter);
router.post('/', validateRequest(servidorSchema), servidorFuncionarioController.criar);
router.put('/:id', validateObjectId('id'), validateRequest(servidorUpdateSchema), servidorFuncionarioController.atualizar);
router.delete('/:id', validateObjectId('id'), servidorFuncionarioController.deletar);

export default router;
