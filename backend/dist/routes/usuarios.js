import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
const router = express.Router();
// Todas as rotas de gerenciamento de usuários requerem privilégios de Admin
router.use(authMiddleware);
router.use(adminMiddleware);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
export default router;
//# sourceMappingURL=usuarios.js.map