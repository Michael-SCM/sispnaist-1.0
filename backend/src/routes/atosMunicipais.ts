import { Router } from 'express';
import AtoMunicipalInovacaoController from '../controllers/AtoMunicipalInovacaoController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { atoMunicipalSchema, atoMunicipalUpdateSchema } from '../utils/validations.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

router.get('/', AtoMunicipalInovacaoController.listar);
router.get('/:id', AtoMunicipalInovacaoController.obter);
router.post('/', validateRequest(atoMunicipalSchema), AtoMunicipalInovacaoController.criar);
router.put('/:id', validateRequest(atoMunicipalUpdateSchema), AtoMunicipalInovacaoController.atualizar);
router.delete('/:id', AtoMunicipalInovacaoController.deletar);

export default router;
