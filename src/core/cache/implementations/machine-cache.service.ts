import { Injectable, Logger } from '@nestjs/common';
import {
  ICacheService,
  CacheOptions,
  CacheEntry,
} from '../interfaces/cache.interface';
import { cacheDefaultTTL } from '../cache.service';

@Injectable()
export class MachineCacheService implements ICacheService {
  private readonly logger = new Logger(MachineCacheService.name);
  private readonly machineCache: Map<string, CacheEntry> = new Map();

  constructor() {
    setInterval(() => this.cleanupExpiredEntries(), 60000);
  }

  /**
   * Retrieves a value from the cache by key
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const entry = this.machineCache.get(key);

      if (!entry) {
        return null;
      }

      if (entry.ttl && Date.now() > entry.createdAt + entry.ttl * 1000) {
        await this.delete(key);
        return null;
      }

      entry.hits++;
      entry.updatedAt = Date.now();
      this.machineCache.set(key, entry);

      return entry.value as T;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Stores a value in the cache
   */
  async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        key,
        value,
        ttl: options.ttl || cacheDefaultTTL,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        hits: 0,
        tags: options.tags,
        version: options.version,
        compressed: false,
      };

      this.machineCache.set(key, entry);
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a value from the cache by key
   */
  async delete(key: string): Promise<boolean> {
    try {
      return this.machineCache.delete(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clears all entries from the cache
   */
  async clear(): Promise<void> {
    try {
      this.machineCache.clear();
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * Cleans up expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.machineCache.entries()) {
      if (entry.ttl && now > entry.createdAt + entry.ttl * 1000) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.machineCache.delete(key));

    if (keysToDelete.length > 0) {
      this.logger.debug(
        `Cleaned up ${keysToDelete.length} expired cache entries`,
      );
    }
  }
}
