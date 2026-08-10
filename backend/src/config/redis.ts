import Redis from 'ioredis';
import config from './config.js';

let redisClient: Redis | null = null;
let redisAvailable = false;

function sanitizeRedisUrl(url: string): string {
  let cleaned = url.trim();
  const marker = 'redis://';
  const idx = cleaned.lastIndexOf(marker);
  if (idx > 0) {
    cleaned = cleaned.substring(idx);
  }
  if (cleaned.startsWith('redis://') && !cleaned.startsWith('rediss://')) {
    cleaned = 'rediss://' + cleaned.substring('redis://'.length);
  }
  return cleaned;
}

export function getRedisClient(): Redis | null {
  if (!redisAvailable) return null;
  if (!redisClient) {
    const url = sanitizeRedisUrl(config.redisUrl);
    try {
      redisClient = new Redis(url, {
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
          if (times > 10) {
            console.error('[Redis] Número máximo de tentativas de reconexão atingido.');
            redisAvailable = false;
            return null;
          }
          const delay = Math.min(times * 200, 30000);
          console.log(`[Redis] Reconectando em ${delay}ms (tentativa ${times})...`);
          return delay;
        },
        enableReadyCheck: true,
        connectTimeout: 10000,
      });

      redisClient.on('connect', () => {
        console.log('[Redis] Conectado com sucesso.');
      });

      redisClient.on('ready', () => {
        console.log('[Redis] Pronto para uso.');
      });

      redisClient.on('error', (err: Error) => {
        console.error('[Redis] Erro na conexão:', err.message);
      });

      redisClient.on('close', () => {
        console.warn('[Redis] Conexão fechada.');
      });

      redisClient.on('reconnecting', (delay: number) => {
        console.log(`[Redis] Reconectando em ${delay}ms...`);
      });
    } catch (err: any) {
      console.error('[Redis] Falha ao criar cliente:', err.message);
      redisAvailable = false;
      return null;
    }
  }
  return redisClient;
}

export async function connectRedis(): Promise<boolean> {
  if (!config.redisUrl) {
    console.log('[Redis] REDIS_URL não configurada. Cache Redis desabilitado.');
    return false;
  }

  redisAvailable = true;
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.connect();
    return true;
  } catch (err: any) {
    console.error('[Redis] Falha ao conectar:', err.message);
    redisAvailable = false;
    redisClient = null;
    return false;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {}
    redisClient = null;
    redisAvailable = false;
  }
}

export async function invalidateCacheByPattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
      console.log(`[Redis] ${keys.length} chaves invalidadas com padrão "${pattern}".`);
    }
  } catch (err: any) {
    console.error('[Redis] Erro ao invalidar cache:', err.message);
  }
}
