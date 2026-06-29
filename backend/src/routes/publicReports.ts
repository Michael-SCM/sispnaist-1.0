import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { obterRelatorioConformidade } from '../controllers/publicReportController.js';

const router = Router();

const publicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { status: 'error', message: 'Muitas requisições. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(publicLimiter);

router.get('/conformidade', obterRelatorioConformidade);

export default router;
