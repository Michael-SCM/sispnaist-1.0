import { Router } from 'express';
import AtoMunicipalInovacaoController from '../controllers/AtoMunicipalInovacaoController.js';
import { authMiddleware, adminOuGestorMiddleware } from '../middleware/auth.js';
import { validateRequest, validateObjectId } from '../middleware/validation.js';
import { atoMunicipalSchema, atoMunicipalUpdateSchema } from '../utils/validations.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// Leitura: qualquer autenticado
router.get('/', AtoMunicipalInovacaoController.listar);
router.get('/:id', validateObjectId('id'), AtoMunicipalInovacaoController.obter);

// Escrita: apenas admin/gestor
router.post('/', adminOuGestorMiddleware, validateRequest(atoMunicipalSchema), AtoMunicipalInovacaoController.criar);
router.put('/:id', adminOuGestorMiddleware, validateObjectId('id'), validateRequest(atoMunicipalUpdateSchema), AtoMunicipalInovacaoController.atualizar);
router.delete('/:id', adminOuGestorMiddleware, validateObjectId('id'), AtoMunicipalInovacaoController.deletar);

export default router;
