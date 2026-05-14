import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export interface IAuthRequest extends Request {
  user?: {
    id: string;
    cpf: string;
    email: string;
    perfil: string;
  };
}

export const authMiddleware = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Token não fornecido' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    
    if (typeof decoded === 'object' && decoded !== null) {
      req.user = {
        id: decoded.id || '',
        cpf: decoded.cpf || '',
        email: decoded.email || '',
        perfil: decoded.perfil || '',
      };
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Não autenticado' });
      return;
    }

    if (!roles.includes(req.user.perfil)) {
      res.status(403).json({ message: 'Sem permissão para acessar este recurso' });
      return;
    }

    next();
  };
};
export const adminMiddleware = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.perfil !== 'admin') {
    res.status(403).json({ message: 'Sem permissão de administrador' });
    return;
  }
  next();
};

export const adminOuGestorMiddleware = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  console.log('[Auth] adminOuGestorMiddleware perfil recebido:', req.user?.perfil, 'user:', req.user?.id);
  if (!req.user || !['admin', 'gestor'].includes(req.user.perfil)) {
    res.status(403).json({ message: 'Sem permissão de administrador/gestor' });
    return;
  }
  next();
};
