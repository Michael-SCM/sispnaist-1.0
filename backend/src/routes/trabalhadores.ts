import express from 'express';
import * as trabalhadorController from '../controllers/trabalhadorController.js';
import * as informacaoController from '../controllers/TrabalhadorInformacaoController.js';
import { validateRequest } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { criarTrabalhadorSchema, atualizarTrabalhadorSchema } from '../utils/validations.js';

const router = express.Router();

// Todas as rotas de trabalhadores requerem autenticação
router.use(authMiddleware);

// Middleware para validar MongoDB ObjectId
const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

// CRUD de Trabalhadores
router.get('/', trabalhadorController.getTrabalhadores);

router.post('/', validateRequest(criarTrabalhadorSchema), trabalhadorController.createTrabalhador);

router.get('/:id', (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID de trabalhador inválido' });
  }
  next();
}, trabalhadorController.getTrabalhador);

router.put('/:id', (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID de trabalhador inválido' });
  }
  next();
}, validateRequest(atualizarTrabalhadorSchema), trabalhadorController.updateTrabalhador);

router.delete('/:id', (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID de trabalhador inválido' });
  }
  next();
}, trabalhadorController.deleteTrabalhador);

// Rotas de Informações Históricas do Trabalhador
router.get('/:id/informacoes', informacaoController.listar);
router.get('/:id/informacoes/:infoId', informacaoController.obter);
router.post('/:id/informacoes', informacaoController.criar);
router.put('/:id/informacoes/:infoId', informacaoController.atualizar);
router.delete('/:id/informacoes/:infoId', informacaoController.deletar);

export default router;
