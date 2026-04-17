import express from 'express';
import * as authController from '../controllers/authController.js';
import { validateRequest } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../utils/validations.js';
const router = express.Router();
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.me);
router.put('/profile', authMiddleware, validateRequest(updateProfileSchema), authController.updateProfile);
export default router;
//# sourceMappingURL=auth.js.map