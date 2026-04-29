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


router.post('/seed', seedData);

export default router;
