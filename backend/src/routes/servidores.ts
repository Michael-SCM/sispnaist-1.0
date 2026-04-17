import { Router } from 'express';
import servidorFuncionarioController from '../controllers/servidorFuncionarioController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
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

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', servidorFuncionarioController.listar);
router.get('/:id', servidorFuncionarioController.obter);
router.post('/', validateRequest(servidorSchema), servidorFuncionarioController.criar);
router.put('/:id', servidorFuncionarioController.atualizar);
router.delete('/:id', servidorFuncionarioController.deletar);

export default router;
