import { Router } from 'express';
import { generateCsrfToken } from '../middleware/csrf.js';

const router = Router();

// GET /api/csrf-token — returns a CSRF token and sets it as a cookie
router.get('/', generateCsrfToken);

export default router;
