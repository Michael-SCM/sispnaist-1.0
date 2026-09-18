import express from 'express';
import * as unidadeController from '../controllers/unidadeController.js';
import { authMiddleware, adminMiddleware, adminOuGestorMiddleware } from '../middleware/auth.js';
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
    const unidadesAtivas = result.unidades.filter((u: any) => u.ativo !== false);
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

// Rota para usuários autenticados (usada em dropdowns de cadastro)
router.get('/empresa/:empresaId', unidadeController.getUnidadesPorEmpresa);

// Leitura: admin e gestor (gestor vê apenas unidades da sua empresa via controller)
router.get('/', adminOuGestorMiddleware, unidadeController.getUnidades);
router.get('/:id', adminOuGestorMiddleware, unidadeController.getUnidade);

// Escrita: apenas admin
router.post('/', adminMiddleware, validateRequest(unidadeSchema), unidadeController.createUnidade);
router.put('/:id', adminMiddleware, validateRequest(unidadeUpdateSchema), unidadeController.updateUnidade);
router.delete('/:id', adminMiddleware, unidadeController.deleteUnidade);

export default router;
