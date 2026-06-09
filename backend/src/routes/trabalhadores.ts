import express from 'express';
import * as trabalhadorController from '../controllers/trabalhadorController.js';
import informacaoController from '../controllers/TrabalhadorInformacaoController.js';
import { validateRequest, validateObjectId } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { criarTrabalhadorSchema, atualizarTrabalhadorSchema } from '../utils/validations.js';

const router = express.Router();

// Todas as rotas de trabalhadores requerem autenticação
router.use(authMiddleware);

// CRUD de Trabalhadores
router.get('/', trabalhadorController.getTrabalhadores);

router.post('/', validateRequest(criarTrabalhadorSchema), trabalhadorController.createTrabalhador);

// Rota para obter trabalhador com todos os submódulos (deve vir ANTES de /:id)
router.get('/:id/completo', validateObjectId('id'), trabalhadorController.getTrabalhadorCompleto);

router.get('/:id', validateObjectId('id'), trabalhadorController.getTrabalhador);

router.put('/:id', validateObjectId('id'), validateRequest(atualizarTrabalhadorSchema), trabalhadorController.updateTrabalhador);

router.delete('/:id', validateObjectId('id'), trabalhadorController.deleteTrabalhador);

// Rotas de Informações Históricas do Trabalhador
router.get('/:id/informacoes', validateObjectId('id'), (req, res, next) => informacaoController.listar(req, res, next));
router.get('/:id/informacoes/:infoId', validateObjectId('id', 'infoId'), (req, res, next) => informacaoController.obter(req, res, next));
router.post('/:id/informacoes', validateObjectId('id'), (req, res, next) => informacaoController.criar(req, res, next));
router.put('/:id/informacoes/:infoId', validateObjectId('id', 'infoId'), (req, res, next) => informacaoController.atualizar(req, res, next));
router.delete('/:id/informacoes/:infoId', validateObjectId('id', 'infoId'), (req, res, next) => informacaoController.deletar(req, res, next));

export default router;