import { Router } from 'express';
import {
  criar,
  obter,
  obterPorAcidente,
  listar,
  atualizar,
  deletar,
} from '../controllers/acidenteMaterialBiologicoController.js';
import { authMiddleware } from '../middleware/auth.js';


const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);


// CRUD
router.post('/', criar);
router.get('/', listar);
router.get('/acidente/:acidenteId', obterPorAcidente);
router.get('/:id', obter);
router.put('/:id', atualizar);
router.delete('/:id', deletar);

export default router;
