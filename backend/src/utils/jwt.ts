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

export const generate2FAToken = (payload: { id: string; email: string; perfil?: string; confiarDispositivo?: boolean }): string => {
  return jwt.sign({ ...payload, type: '2fa' }, config.jwtSecret, {
    expiresIn: '10m',
  });
};

export const verify2FAToken = (
  token: string
): { id: string; email: string; perfil?: string; confiarDispositivo?: boolean; type?: string } | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; perfil?: string; confiarDispositivo?: boolean; type?: string };
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

const TRUSTED_DEVICE_EXPIRE = '24h';

export const generateTrustedDeviceToken = (userId: string): string => {
  return jwt.sign({ id: userId, type: 'trusted-device' }, config.jwtSecret, {
    expiresIn: TRUSTED_DEVICE_EXPIRE as any,
  });
};

export const verifyTrustedDeviceToken = (token: string): { id: string } | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; type?: string };
    if (decoded.type !== 'trusted-device') return null;
    return { id: decoded.id };
  } catch {
    return null;
  }
};


