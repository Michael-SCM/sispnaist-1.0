import { Request, Response, NextFunction } from 'express';

const SENSITIVE_FIELDS = ['senha', 'password', 'novaSenha', 'confirmarSenha', 'senhaAtual', 'currentPassword', 'newPassword'];

export const sanitizeRequestBody = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object' && !isAuthRoute(req.path)) {
    sanitizeObject(req.body);
  }
  next();
};

function isAuthRoute(path: string): boolean {
  return path.includes('/auth/') || path.includes('/login') || path.includes('/register') || path.includes('/password') || path.includes('/refresh-token');
}

function sanitizeObject(obj: any): void {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    if (SENSITIVE_FIELDS.includes(key)) {
      obj[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}
