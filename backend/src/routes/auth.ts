import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController.js';
import { validateRequest } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { registerSchema, loginSchema, updateProfileSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../utils/validations.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 'error', message: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  authController.login
);

router.get('/me', authMiddleware, authController.me);

router.put(
  '/profile',
  authMiddleware,
  validateRequest(updateProfileSchema),
  authController.updateProfile
);

router.post(
  '/forgot-password',
  authLimiter,
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

router.post(
  '/verify-email',
  authLimiter,
  validateRequest(verifyEmailSchema),
  authController.verifyEmail
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);

export default router;
