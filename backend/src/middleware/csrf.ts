import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf-token';

/**
 * CSRF protection middleware.
 *
 * Strategy: Custom Request Header + Double Submit Cookie
 *
 * - Requests with an Authorization header are already protected by CORS preflight
 *   (custom header triggers OPTIONS preflight; the origin is validated by the CORS middleware).
 * - Requests without Authorization require X-CSRF-Token header matching the csrf-token cookie.
 * - The csrf-token cookie is non-httpOnly so the frontend can read it (same-origin)
 *   or the frontend can obtain the token via GET /api/csrf-token.
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  // Skip for auth endpoints that don't require a prior session
  if (
    req.path === '/api/auth/login' ||
    req.path === '/api/auth/register' ||
    req.path === '/api/auth/forgot-password' ||
    req.path === '/api/auth/reset-password'
  ) return next();

  // Request with Authorization is CORS-preflighted → safe
  if (req.headers.authorization) return next();

  // Cookie-based auth: validate CSRF token
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;
  const cookieToken = req.cookies?.[CSRF_COOKIE];

  if (cookieToken && headerToken === cookieToken) return next();

  if (!headerToken) {
    res.status(403).json({ message: 'Requisição rejeitada por segurança (CSRF). Envie o header X-CSRF-Token.' });
    return;
  }

  res.status(403).json({ message: 'CSRF token inválido' });
};

/**
 * Generates a CSRF token, sets it as a cookie, and returns it in the response body.
 * The frontend must include this token in the X-CSRF-Token header on write requests
 * that rely on cookie-based authentication.
 */
export const generateCsrfToken = (_req: Request, res: Response): void => {
  const token = crypto.randomBytes(32).toString('hex');
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ status: 'success', data: { csrfToken: token } });
};
