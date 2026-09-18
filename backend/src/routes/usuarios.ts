import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware, adminMiddleware, adminOuGestorMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { updateUserSchema } from '../utils/validations.js';

const router = express.Router();

// Todas as rotas de gerenciamento de usuários requerem autenticação
router.use(authMiddleware);

// Leitura: admin e gestor (gestor vê apenas usuários da sua empresa via controller)
router.get('/', adminOuGestorMiddleware, userController.getUsers);
router.get('/:id', adminOuGestorMiddleware, userController.getUser);

// Escrita: apenas admin
router.put('/:id', adminMiddleware, validateRequest(updateUserSchema), userController.updateUser);
router.delete('/:id', adminMiddleware, userController.deleteUser);

export default router;
