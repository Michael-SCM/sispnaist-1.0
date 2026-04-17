import express from 'express';
import * as unidadeController from '../controllers/unidadeController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Rota pública para listar unidades ativas (para formulário de trabalhadores)
router.get('/ativas', async (req, res) => {
  try {
    const unidadeService = (await import('../services/UnidadeService.js')).default;
    const result = await unidadeService.listar(1, 1000, {});
    // Filtrar apenas unidades ativas
    const unidadesAtivas = result.unidades.filter((u: any) => u.ativa !== false);
    res.json({
      status: 'success',
      data: { unidades: unidadesAtivas, total: unidadesAtivas.length },
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
router.post('/', adminMiddleware, unidadeController.createUnidade);
router.get('/:id', adminMiddleware, unidadeController.getUnidade);
router.put('/:id', adminMiddleware, unidadeController.updateUnidade);
router.delete('/:id', adminMiddleware, unidadeController.deleteUnidade);

export default router;
