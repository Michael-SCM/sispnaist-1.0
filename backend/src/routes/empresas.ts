import express from 'express';
import * as empresaController from '../controllers/empresaController.js';
import { authMiddleware, adminMiddleware, adminOuGestorMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { empresaSchema, empresaUpdateSchema } from '../utils/validations.js';

const router = express.Router();

// Rota pública para listar empresas ativas (para formulário de trabalhadores)
router.get('/ativas', async (req, res) => {
  try {
    const { getPaginationParams } = await import('../utils/pagination.js');
    const empresaService = (await import('../services/EmpresaService.js')).default;
    const { page, limit } = getPaginationParams(req.query as any, { page: 1, limit: 100 });
    const result = await empresaService.listar(page, limit, {});
    const empresasAtivas = result.empresas.filter((e: any) => e.ativo !== false);
    res.json({
      status: 'success',
      data: {
        empresas: empresasAtivas,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erro ao carregar empresas' });
  }
});

// Todas as rotas de empresas requerem autenticação
router.use(authMiddleware);

// Rota para usuários autenticados (usada em dropdowns de cadastro)
router.get('/unidade/:unidadeId', empresaController.getEmpresaPorUnidade);

// Leitura: admin e gestor (gestor vê apenas sua empresa via controller)
router.get('/', adminOuGestorMiddleware, empresaController.getEmpresas);
router.get('/:id', adminOuGestorMiddleware, empresaController.getEmpresa);

// Escrita: apenas admin
router.post('/', adminMiddleware, validateRequest(empresaSchema), empresaController.createEmpresa);
router.put('/:id', adminMiddleware, validateRequest(empresaUpdateSchema), empresaController.updateEmpresa);
router.delete('/:id', adminMiddleware, empresaController.deleteEmpresa);

export default router;
