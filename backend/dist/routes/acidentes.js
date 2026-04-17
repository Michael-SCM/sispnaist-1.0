import express from 'express';
import * as acidenteController from '../controllers/acidenteController.js';
import { validateRequest } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { criarAcidenteSchema, atualizarAcidenteSchema } from '../utils/validations.js';
const router = express.Router();
// Todas as rotas requerem autenticação
router.use(authMiddleware);
// Middleware para validar MongoDB ObjectId
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
// CRUD básico
router.post('/', validateRequest(criarAcidenteSchema), acidenteController.criar);
router.get('/', acidenteController.listar);
// Rotas estáticas/específicas SEMPRE antes das dinâmicas
router.get('/stats/estatisticas', acidenteController.obterEstatisticas);
router.get('/trabalhador/:trabalhadorId', acidenteController.obterPorTrabalhador);
// Rotas dinâmicas com validação - DEVEM VIR ANTES das rotas dinâmicas genéricas
router.get('/:id', (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }
    next();
}, acidenteController.obter);
router.put('/:id', (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }
    next();
}, validateRequest(atualizarAcidenteSchema), acidenteController.atualizar);
router.delete('/:id', (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }
    next();
}, acidenteController.deletar);
export default router;
//# sourceMappingURL=acidentes.js.map