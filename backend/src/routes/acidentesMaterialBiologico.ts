import { Router } from 'express';
import {\n  criar,\n  obter,\n  obterPorAcidente,\n  listar,\n  atualizar,\n  deletar,\n  seedData,\n} from '../controllers/acidenteMaterialBiologicoController.js';
import { authMiddleware } from '../middleware/auth.js';


const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);


router.post('/seed', seedData);

export default router;
