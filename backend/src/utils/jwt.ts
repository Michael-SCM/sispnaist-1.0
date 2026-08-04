import jwt from 'jsonwebtoken';
import config from '../config/config.js';

interface TokenPayload {
  id: string;
  cpf: string;
  email: string;
  perfil: string;
  tokenVersion?: number;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign({ ...payload, type: 'access' }, config.jwtSecret, {
    expiresIn: config.jwtExpire as any,
  });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload & { type?: string };
    if (decoded.type && decoded.type !== 'access') return null;
    return decoded;
  } catch {
    return null;
  }
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign({ ...payload, type: 'refresh' }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpire as any,
  });
};

export const generate2FAToken = (payload: { id: string; email: string; perfil?: string }): string => {
  return jwt.sign({ ...payload, type: '2fa' }, config.jwtSecret, {
    expiresIn: '10m',
  });
};

export const verify2FAToken = (
  token: string
): { id: string; email: string; perfil?: string; type?: string } | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; perfil?: string; type?: string };
    if (decoded.type !== '2fa') return null;
    return decoded;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret) as TokenPayload & { type?: string };
    if (decoded.type !== 'refresh') return null;
    return decoded;
  } catch {
    return null;
  }
};


