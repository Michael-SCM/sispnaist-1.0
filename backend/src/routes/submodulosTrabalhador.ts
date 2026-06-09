import { Router } from 'express';
import submoduloTrabalhadorController from '../controllers/submoduloTrabalhadorController';
import { authMiddleware } from '../middleware/auth';
import { validateObjectId } from '../middleware/validation';

const router = Router();

/**
 * Rotas para submódulos do trabalhador.
 * Equivalente a: trabalhador_dependentes, trabalhador_afastamento,
 * trabalhador_ocorrencia_violencia, trabalhador_readaptacao, trabalhador_processo_trabalho
 */

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// CRUD unificado para todos os submódulos
router.get('/:id/:submodulo', validateObjectId('id'), submoduloTrabalhadorController.listar);
router.get('/:id/:submodulo/:itemId', validateObjectId('id', 'itemId'), submoduloTrabalhadorController.obter);
router.post('/:id/:submodulo', validateObjectId('id'), submoduloTrabalhadorController.criar);
router.put('/:id/:submodulo/:itemId', validateObjectId('id', 'itemId'), submoduloTrabalhadorController.atualizar);
router.delete('/:id/:submodulo/:itemId', validateObjectId('id', 'itemId'), submoduloTrabalhadorController.deletar);

export default router;
