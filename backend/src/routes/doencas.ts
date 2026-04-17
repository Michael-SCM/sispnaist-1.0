import express from 'express';
import * as doencaController from '../controllers/doencaController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { criarDoencaSchema, atualizarDoencaSchema } from '../utils/validations.js';

const router = express.Router();

// Rotas protegidas - todas requerem autenticação
router.use(authMiddleware);

// Middleware para validar MongoDB ObjectId
const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

// Rotas específicas (devem vir antes das rotas paramétrizadas)
router.get('/stats/estatisticas', doencaController.obterEstatisticas);
router.get('/trabalhador/:trabalhadorId', doencaController.obterPorTrabalhador);

// CRUD padrão (rotas genéricas por último)
router.post('/', validateRequest(criarDoencaSchema), doencaController.criar);
router.get('/', doencaController.listar);
router.get('/:id', (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  next();
}, doencaController.obter);
router.put('/:id', (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  next();
}, validateRequest(atualizarDoencaSchema), doencaController.atualizar);
router.delete('/:id', (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  next();
}, doencaController.deletar);

export default router;
