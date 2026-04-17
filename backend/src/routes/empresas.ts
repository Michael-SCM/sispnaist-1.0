import express from 'express';
import * as empresaController from '../controllers/empresaController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Rota pública para listar empresas ativas (para formulário de trabalhadores)
router.get('/ativas', async (req, res) => {
  try {
    const empresaService = (await import('../services/EmpresaService.js')).default;
    const result = await empresaService.listar(1, 1000, {});
    // Filtrar apenas empresas ativas
    const empresasAtivas = result.empresas.filter((e: any) => e.ativa !== false);
    res.json({
      status: 'success',
      data: { empresas: empresasAtivas, total: empresasAtivas.length },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erro ao carregar empresas' });
  }
});

// Todas as rotas de empresas requerem autenticação de Admin
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', empresaController.getEmpresas);
router.post('/', empresaController.createEmpresa);
router.get('/:id', empresaController.getEmpresa);
router.put('/:id', empresaController.updateEmpresa);
router.delete('/:id', empresaController.deleteEmpresa);

export default router;
