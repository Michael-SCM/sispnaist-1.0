import { Router } from 'express';
import submoduloTrabalhadorController from '../controllers/submoduloTrabalhadorController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Rotas para submódulos do trabalhador.
 * Equivalente a: trabalhador_dependentes, trabalhador_afastamento,
 * trabalhador_ocorrencia_violencia, trabalhador_readaptacao, trabalhador_processo_trabalho
 */

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// CRUD unificado para todos os submódulos
router.get('/:id/:submodulo', submoduloTrabalhadorController.listar);
router.get('/:id/:submodulo/:itemId', submoduloTrabalhadorController.obter);
router.post('/:id/:submodulo', submoduloTrabalhadorController.criar);
router.put('/:id/:submodulo/:itemId', submoduloTrabalhadorController.atualizar);
router.delete('/:id/:submodulo/:itemId', submoduloTrabalhadorController.deletar);

export default router;
