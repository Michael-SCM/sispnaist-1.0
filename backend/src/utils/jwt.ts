import jwt from 'jsonwebtoken';
import config from '../config/config.js';

interface TokenPayload {
  id: string;
  cpf: string;
  email: string;
  perfil: string;
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

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret) as TokenPayload & { type?: string };
    if (decoded.type !== 'refresh') return null;
    return decoded;
  } catch {
    return null;
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
};
