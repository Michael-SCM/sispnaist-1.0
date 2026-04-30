import { Router } from 'express';
import AtoMunicipalInovacaoController from '../controllers/AtoMunicipalInovacaoController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

router.get('/', AtoMunicipalInovacaoController.listar);
router.get('/:id', AtoMunicipalInovacaoController.obter);
router.post('/', AtoMunicipalInovacaoController.criar);
router.put('/:id', AtoMunicipalInovacaoController.atualizar);
router.delete('/:id', AtoMunicipalInovacaoController.deletar);

export default router;
