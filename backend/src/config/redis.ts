import Redis from 'ioredis';
import { logger } from '../utils/logger';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
}

class RedisManager {
  private static instance: RedisManager;
  public client: Redis;
  public subscriber: Redis;
  public publisher: Redis;

  private constructor() {
    const config: RedisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    this.client = new Redis(config);
    this.subscriber = new Redis(config);
    this.publisher = new Redis(config);

    this.setupEventHandlers();
  }

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    this.client.on('close', () => {
      logger.warn('Redis client connection closed');
    });

    // Fix: Add type for ms parameter
    this.client.on('reconnecting', (ms: number) => {
      logger.info(`Redis client reconnecting in ${ms}ms`);
    });

    this.subscriber.on('connect', () => {
      logger.info('Redis subscriber connected');
    });

    this.subscriber.on('error', (err) => {
      logger.error('Redis subscriber error:', err);
    });

    this.publisher.on('connect', () => {
      logger.info('Redis publisher connected');
    });

    this.publisher.on('error', (err) => {
      logger.error('Redis publisher error:', err);
    });
  }

  public async connect(): Promise<void> {
    try {
      await Promise.all([
        this.client.connect(),
        this.subscriber.connect(),
        this.publisher.connect(),
      ]);
      
      logger.info('All Redis connections established');
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await Promise.all([
        this.client.disconnect(),
        this.subscriber.disconnect(),
        this.publisher.disconnect(),
      ]);
      
      logger.info('All Redis connections closed');
    } catch (error) {
      logger.error('Failed to disconnect from Redis:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }
}

export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = RedisManager.getInstance().client;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
    } catch (error) {
      logger.error('Cache set error:', error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (!cached) return null;
      
      return JSON.parse(cached) as T;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
      throw error;
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache pattern delete error:', error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists check error:', error);
      return false;
    }
  }

  async increment(key: string, ttl?: number): Promise<number> {
    try {
      const multi = this.redis.multi();
      multi.incr(key);
      
      if (ttl) {
        multi.expire(key, ttl);
      }
      
      const results = await multi.exec();
      return results?.[0]?.[1] as number || 0;
    } catch (error) {
      logger.error('Cache increment error:', error);
      throw error;
    }
  }
}

export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userSessions: (userId: string) => `user:sessions:${userId}`,
  case: (caseId: string) => `case:${caseId}`,
  userCases: (userId: string) => `user:cases:${userId}`,
  knowledgeArticle: (articleId: string) => `knowledge:${articleId}`,
  knowledgeList: (category?: string, page?: number) => 
    `knowledge:list:${category || 'all'}:${page || 1}`,
  communityPost: (postId: string) => `community:${postId}`,
  communityList: (category?: string, page?: number) => 
    `community:list:${category || 'all'}:${page || 1}`,
  salesforceSync: (type: string, id: string) => `sf:sync:${type}:${id}`,
  rateLimit: (ip: string, endpoint: string) => `rl:${ip}:${endpoint}`,
} as const;

export const connectRedis = async (): Promise<void> => {
  const redisManager = RedisManager.getInstance();
  await redisManager.connect();
};

export const redis = RedisManager.getInstance().client;
export const redisSubscriber = RedisManager.getInstance().subscriber;
export const redisPublisher = RedisManager.getInstance().publisher;
export const cacheService = new CacheService();
