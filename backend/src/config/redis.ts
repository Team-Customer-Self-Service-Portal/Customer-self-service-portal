import dotenv from 'dotenv';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

dotenv.config();

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = Number(process.env.REDIS_PORT || 6379);
const redisPassword = process.env.REDIS_PASSWORD || undefined;
const redisUsername = process.env.REDIS_USERNAME || 'default';

const useTls =
  process.env.REDIS_TLS === 'true' ||
  process.env.REDIS_URL?.startsWith('rediss://') ||
  redisHost.includes('upstash.io');

const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
  username: redisUsername,
  password: redisPassword,
  tls: useTls ? {} : undefined,
  lazyConnect: true,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times: number): number | null => {
    if (times > 5) {
      return null;
    }
    return Math.min(times * 1000, 15000);
  },
});

redisClient.on('connect', () => logger.info('Redis connected', { host: redisHost, port: redisPort, tls: useTls }));
redisClient.on('error', (error: Error) => logger.warn('Redis error', { host: redisHost, port: redisPort, tls: useTls, error: error.message }));
redisClient.on('close', () => logger.warn('Redis connection closed', { host: redisHost, port: redisPort }));

export const connectRedis = async (): Promise<void> => {
  try {
    if (redisClient.status === 'ready' || redisClient.status === 'connecting') {
      return;
    }
    await redisClient.connect();
  } catch (error) {
    logger.warn('Redis unavailable, continuing without cache', {
      host: redisHost,
      port: redisPort,
      tls: useTls,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export default redisClient;
