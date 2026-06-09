import express from 'express';
import * as unidadeController from '../controllers/unidadeController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { unidadeSchema, unidadeUpdateSchema } from '../utils/validations.js';

const router = express.Router();

// Rota pública para listar unidades ativas (para formulário de trabalhadores)
router.get('/ativas', async (req, res) => {
  try {
    const { getPaginationParams } = await import('../utils/pagination.js');
    const unidadeService = (await import('../services/UnidadeService.js')).default;
    const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 100 });
    const result = await unidadeService.listar(page, limit, {});
    const unidadesAtivas = result.unidades.filter((u: any) => u.ativa !== false);
    res.json({
      status: 'success',
      data: {
        unidades: unidadesAtivas,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erro ao carregar unidades' });
  }
});

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rota pública para usuários autenticados (usada em dropdowns de cadastro)
router.get('/empresa/:empresaId', unidadeController.getUnidadesPorEmpresa);

// Rotas restritas a Admin
router.get('/', adminMiddleware, unidadeController.getUnidades);
router.post('/', adminMiddleware, validateRequest(unidadeSchema), unidadeController.createUnidade);
router.get('/:id', adminMiddleware, unidadeController.getUnidade);
router.put('/:id', adminMiddleware, validateRequest(unidadeUpdateSchema), unidadeController.updateUnidade);
router.delete('/:id', adminMiddleware, unidadeController.deleteUnidade);

export default router;
