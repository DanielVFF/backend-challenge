import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { ICacheService, CacheOptions } from './interfaces/cache.interface';
import { RedisCacheService } from './implementations/redis-cache.service';
import { MachineCacheService } from './implementations/machine-cache.service';

export const cacheDefaultTTL = 3600;

/**
 * Cache service that provides a unified interface for caching operations.
 * Automatically switches between Redis and in-memory cache based on availability.
 */
@Injectable()
export class CacheService implements ICacheService, OnModuleInit {
  /**
   * Logger instance for this service.
   */
  private readonly logger = new Logger(CacheService.name);

  /**
   * The currently active cache service implementation (Redis or in-memory).
   */
  private activeCacheService: ICacheService;

  /**
   * Indicates whether Redis is currently available and being used.
   */
  private isRedisAvailable = false;

  /**
   * Creates an instance of CacheService.
   */
  constructor(
    private readonly machineCacheService: MachineCacheService,
    private readonly redisCacheService: RedisCacheService,
  ) {
    this.activeCacheService = this.machineCacheService;
  }

  /**
   * Initializes the cache service on module initialization.
   * Attempts to use Redis if available, otherwise falls back to in-memory cache.
   */
  async onModuleInit(): Promise<void> {
    await this.initializeCacheService();
  }

  /**
   * Initializes the appropriate cache service based on Redis availability.
   * Tests Redis connection with a health check and falls back to in-memory cache if unavailable.
   */
  private async initializeCacheService(): Promise<void> {
    if (!this.redisCacheService) {
      this.logger.warn(
        'Redis cache service not available, using in-memory cache',
      );
      return;
    }

    const isRedisHealthy = await this.checkRedisHealth();

    if (isRedisHealthy) {
      this.activeCacheService = this.redisCacheService;
      this.isRedisAvailable = true;
      this.logger.log('Redis cache service initialized successfully');
    } else {
      this.activeCacheService = this.machineCacheService;
      this.isRedisAvailable = false;
      this.logger.warn('Redis unavailable, falling back to in-memory cache');
    }
  }

  /**
   * Checks if Redis is healthy and available.
   */
  private async checkRedisHealth(): Promise<boolean> {
    try {
      const healthCheckPromise = this.redisCacheService.get('health-check');
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000),
      );

      await Promise.race([healthCheckPromise, timeoutPromise]);
      return true;
    } catch (error) {
      this.logger.debug(`Redis health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Retrieves a value from the cache by key.
   */
  async get<T = any>(key: string): Promise<T | null> {
    return this.activeCacheService.get<T>(key);
  }

  /**
   * Stores a value in the cache with the specified key.
   */
  async set<T = any>(
    key: string,
    value: T,
    options?: CacheOptions,
  ): Promise<void> {
    return this.activeCacheService.set<T>(key, value, options);
  }

  /**
   * Deletes a value from the cache by key.
   */
  async delete(key: string): Promise<boolean> {
    return this.activeCacheService.delete(key);
  }

  /**
   * Clears all entries from the active cache.
   */
  async clear(): Promise<void> {
    return this.activeCacheService.clear();
  }

  /**
   * Gets the type of the currently active cache service.
   */
  getActiveCacheType(): 'redis' | 'machine' {
    return this.isRedisAvailable ? 'redis' : 'machine';
  }

  /**
   * Attempts to switch the active cache service to Redis.
   * Performs a health check to ensure Redis is available before switching.
   */
  async switchToRedis(): Promise<boolean> {
    if (!this.redisCacheService) {
      this.logger.warn('Redis cache service not available');
      return false;
    }

    const isHealthy = await this.checkRedisHealth();

    if (isHealthy) {
      this.activeCacheService = this.redisCacheService;
      this.isRedisAvailable = true;
      this.logger.log('Switched to Redis cache');
      return true;
    }

    this.logger.error('Failed to switch to Redis cache: health check failed');
    return false;
  }

  /**
   * Switches the active cache service to in-memory cache.
   */
  async switchToMachine(): Promise<void> {
    this.activeCacheService = this.machineCacheService;
    this.isRedisAvailable = false;
    this.logger.log('Switched to in-memory cache');
  }

  /**
   * Gets information about the current cache configuration and status.
   * Returns an object with activeType, redisAvailable, and redisServiceAvailable properties.
   */
  getCacheInfo(): object {
    return {
      activeType: this.getActiveCacheType(),
      redisAvailable: this.isRedisAvailable,
      redisServiceAvailable: !!this.redisCacheService,
    };
  }
}
