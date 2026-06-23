import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/User.js';

export interface IAuthRequest extends Request {
  user?: {
    id: string;
    cpf: string;
    email: string;
    perfil: string;
  };
}

export const authMiddleware = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token || (req.query.token as string);

    if (!token) {
      res.status(401).json({ message: 'Token não fornecido' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    
    if (!decoded || typeof decoded !== 'object') {
      res.status(401).json({ message: 'Token inválido ou expirado' });
      return;
    }

    // Verificar se o usuário ainda existe, está ativo e tokenVersion é compatível
    const user = await User.findById(decoded.id).select('ativo tokenVersion').lean();
    if (!user) {
      res.status(401).json({ message: 'Usuário não encontrado' });
      return;
    }

    if (!user.ativo) {
      res.status(401).json({ message: 'Conta desativada. Entre em contato com o administrador.' });
      return;
    }

    // Token sem tokenVersion (emitido antes da migração) é aceito
    if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined && decoded.tokenVersion < user.tokenVersion) {
      res.status(401).json({ message: 'Sessão expirada. Faça login novamente.' });
      return;
    }

    req.user = {
      id: decoded.id || '',
      cpf: decoded.cpf || '',
      email: decoded.email || '',
      perfil: decoded.perfil || '',
    };

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
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Auth] adminOuGestorMiddleware perfil recebido:', req.user?.perfil, 'user:', req.user?.id);
  }
  if (!req.user || !['admin', 'gestor'].includes(req.user.perfil)) {
    res.status(403).json({ message: 'Sem permissão de administrador/gestor' });
    return;
  }
  next();
};
