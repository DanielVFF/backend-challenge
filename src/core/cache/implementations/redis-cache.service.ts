import { Injectable, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { promisify } from 'util';
import { gzip, gunzip } from 'zlib';
import {
  ICacheService,
  CacheOptions,
  CacheEntry,
} from '../interfaces/cache.interface';
import { cacheDefaultTTL } from '../cache.service';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

@Injectable()
export class RedisCacheService implements ICacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  private redis: Redis | null = null;
  private isConnected = false;
  private connectionAttempted = false;

  constructor(@Inject('REDIS_CONFIG') private readonly redisConfig: any) {}

  /**
   * Initializes the Redis connection
   */
  private async initializeRedis(): Promise<boolean> {
    if (this.connectionAttempted) {
      return this.isConnected;
    }

    this.connectionAttempted = true;

    try {
      this.redis = new Redis({
        ...this.redisConfig.options,
        lazyConnect: true,
        retryDelayOnFailover: 0,
        maxRetriesPerRequest: 2,
        retryDelayOnClusterDown: 0,
        enableReadyCheck: false,
        maxLoadingTimeout: 0,
      });

      this.redis.on('error', (_) => {
        if (this.isConnected) this.logger.error('Redis connection error');
        this.isConnected = false;
        this.cleanupRedis();
      });

      this.redis.on('connect', () => {
        this.logger.log('Connected to Redis');
        this.isConnected = true;
      });

      this.redis.on('close', () => {
        if (this.isConnected) this.logger.warn('Redis connection closed');
        this.isConnected = false;
        this.cleanupRedis();
      });

      this.redis.on('end', () => {
        if (this.isConnected) this.logger.warn('Redis connection ended');
        this.isConnected = false;
        this.cleanupRedis();
      });

      const connectPromise = this.redis.connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Redis connection timeout exceeded')),
          3000,
        ),
      );

      await Promise.race([connectPromise, timeoutPromise]);

      await this.redis.ping();
      this.isConnected = true;
      this.logger.log('Redis initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to connect to Redis server');
      this.isConnected = false;
      this.cleanupRedis();
      return false;
    }
  }

  /**
   * Cleans up the Redis connection
   */
  private cleanupRedis(): void {
    if (this.redis) {
      try {
        this.redis.disconnect();
        this.redis.quit();
      } catch (error) {
        this.logger.error('Error cleaning up Redis connection:', error);
      }
      this.redis = null;
    }
  }

  /**
   * Ensures Redis connection is established
   */
  private async ensureConnection(): Promise<boolean> {
    if (this.isConnected && this.redis) {
      return true;
    }

    if (!this.connectionAttempted) {
      return await this.initializeRedis();
    }

    return false;
  }

  /**
   * Retrieves a value from the cache by key
   */
  async get<T = any>(key: string): Promise<T | null> {
    const startTime = Date.now();

    if (!(await this.ensureConnection())) {
      throw new Error('Redis unavailable');
    }

    try {
      const value = await this.redis!.get(key);
      const responseTime = Date.now() - startTime;

      if (!value) return null;

      const entry = JSON.parse(value) as CacheEntry<T>;

      if (entry.ttl && Date.now() > entry.createdAt + entry.ttl * 1000) {
        await this.delete(key);
        return null;
      }

      if (entry.compressed) {
        const decompressed = await gunzipAsync(
          Buffer.from(entry.value as any, 'base64'),
        );
        entry.value = JSON.parse(decompressed.toString());
      }

      entry.hits++;
      entry.updatedAt = Date.now();
      await this.redis!.set(
        key,
        JSON.stringify(entry),
        'EX',
        entry.ttl || cacheDefaultTTL,
      );

      return entry.value;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      throw new Error(`Error getting key ${key}: ${error?.message || error}`);
    }
  }

  /**
   * Stores a value in the cache with optional compression and tags
   */
  async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    if (!(await this.ensureConnection())) {
      throw new Error('Redis unavailable');
    }

    try {
      let processedValue = value;
      let compressed = false;

      if (options.compress && JSON.stringify(value).length > 1024) {
        const compressedBuffer = await gzipAsync(JSON.stringify(value));
        processedValue = compressedBuffer.toString('base64') as T;
        compressed = true;
      }

      const entry: CacheEntry<T> = {
        key,
        value: processedValue,
        ttl: options.ttl || cacheDefaultTTL,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        hits: 0,
        tags: options.tags,
        version: options.version,
        compressed,
      };

      const serialized = JSON.stringify(entry);
      await this.redis!.set(
        key,
        serialized,
        'EX',
        entry.ttl || cacheDefaultTTL,
      );

      if (options.tags?.length) {
        for (const tag of options.tags) {
          await this.redis!.sadd(`tag:${tag}`, key);
        }
      }
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      throw new Error(`Error setting key ${key}: ${error?.message || error}`);
    }
  }

  /**
   * Deletes a value from the cache by key
   */
  async delete(key: string): Promise<boolean> {
    if (!(await this.ensureConnection())) {
      throw new Error('Redis unavailable');
    }

    try {
      const result = await this.redis!.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      throw new Error(`Error deleting key ${key}: ${error?.message || error}`);
    }
  }

  /**
   * Clears all entries from the cache
   */
  async clear(): Promise<void> {
    if (!(await this.ensureConnection())) {
      throw new Error('Redis unavailable');
    }

    try {
      await this.redis!.flushall();
    } catch (error) {
      this.logger.error('Error clearing Redis cache:', error);
      throw new Error(`Error clearing Redis cache: ${error?.message || error}`);
    }
  }
}
