import { Router } from 'express';
import catalogoController from '../controllers/catalogoController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { catalogoSchema, catalogoUpdateSchema } from '../utils/validations';

const router = Router();

/**
 * Rotas para tabelas auxiliares/catalogos do sistema.
 * Equivalente ao getdados.php do PHP original, mas com CRUD completo.
 * 
 * Todas as rotas requerem autenticação.
 */

// Rota especial: listar todas as entidades disponíveis
router.get('/listar-todos', authMiddleware, catalogoController.listarEntidades);

// Rota para executar seed de catálogos (apenas admin)
router.post('/seed', authMiddleware, catalogoController.seed);

// Listar apenas itens ativos de uma entidade (equivalente ao getdados.php)
router.get('/:entidade/ativos', authMiddleware, catalogoController.listarAtivos);

// CRUD completo para qualquer catálogo
router.get('/:entidade', authMiddleware, catalogoController.listar);
router.get('/:entidade/:id', authMiddleware, catalogoController.obter);
router.post('/:entidade', authMiddleware, validateRequest(catalogoSchema), catalogoController.criar);
router.put('/:entidade/:id', authMiddleware, validateRequest(catalogoUpdateSchema), catalogoController.atualizar);
router.delete('/:entidade/:id', authMiddleware, catalogoController.deletar);

export default router;
