import express from 'express';
import { criarVacinacao, obterVacinacao, listarVacinacoes, atualizarVacinacao, deletarVacinacao, obterVacinacoesPorTrabalhador, obterEstatisticas, } from '../controllers/vacinacaoController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { criarVacinacaoSchema, atualizarVacinacaoSchema } from '../utils/validations.js';
const router = express.Router();
// Proteger todas as rotas com autenticação
router.use(authMiddleware);
// Middleware para validar MongoDB ObjectId
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
// Estatísticas (antes de rotas com :id)
router.get('/stats/estatisticas', obterEstatisticas);
// Vacinações por Trabalhador
router.get('/trabalhador/:trabalhadorId', obterVacinacoesPorTrabalhador);
// CRUD padrão
router.post('/', validateRequest(criarVacinacaoSchema), criarVacinacao);
router.get('/', listarVacinacoes);
router.get('/:id', (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }
    next();
}, obterVacinacao);
router.put('/:id', (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }
    next();
}, validateRequest(atualizarVacinacaoSchema), atualizarVacinacao);
router.delete('/:id', (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }
    next();
}, deletarVacinacao);
export default router;
//# sourceMappingURL=vacinacoes.js.map