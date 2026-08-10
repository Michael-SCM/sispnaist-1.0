import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis.js';
import { IAuthRequest } from './auth.js';

export function cacheMiddleware(ttlSeconds: number = 300, keyPrefix: string = 'cache') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') {
      return next();
    }

    const redis = getRedisClient();
    if (!redis) {
      return next();
    }

    const authReq = req as IAuthRequest;
    const userId = authReq.user?.id || 'anonymous';
    const cacheKey = `${keyPrefix}:${userId}:${req.originalUrl}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-TTL', String(ttlSeconds));
        res.json(JSON.parse(cached));
        return;
      }
    } catch (err: any) {
      console.error('[CacheMiddleware] Erro ao ler cache:', err.message);
    }

    res.setHeader('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = ((body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && body !== undefined) {
        const serialized = JSON.stringify(body);
        redis.setex(cacheKey, ttlSeconds, serialized).catch((err: any) => {
          console.error('[CacheMiddleware] Erro ao gravar cache:', err.message);
        });
      }
      return originalJson(body);
    }) as any;

    next();
  };
}

export async function invalidateCache(pattern: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[CacheMiddleware] ${keys.length} chaves invalidadas com padrão "${pattern}".`);
    }
  } catch (err: any) {
    console.error('[CacheMiddleware] Erro ao invalidar cache:', err.message);
  }
}
