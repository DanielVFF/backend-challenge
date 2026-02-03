export interface CacheOptions {
  ttl?: number;
  compress?: boolean;
  tags?: string[];
  version?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl?: number;
  createdAt: number;
  updatedAt: number;
  hits: number;
  tags?: string[];
  version?: string;
  compressed?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage?: number;
  averageResponseTime: number;
}

export interface CachePattern {
  pattern: string;
  keys: string[];
  count: number;
}

export interface BatchOperation {
  operation: 'get' | 'set' | 'delete' | 'exists';
  key: string;
  value?: any;
  options?: CacheOptions;
}

export interface BatchResult<T = any> {
  success: boolean;
  key: string;
  value?: T;
  error?: string;
}

export interface CacheWarmingConfig {
  keys: string[];
  generator: (key: string) => Promise<any>;
  concurrency?: number;
  retryAttempts?: number;
}

export interface DistributedLockOptions {
  ttl: number;
  retryDelay?: number;
  maxRetries?: number;
}

export interface ICacheService {
  // Basic operations
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<boolean>;
  // exists(key: string): Promise<boolean>;

  // // Advanced operations
  // getOrSet<T = any>(
  //   key: string,
  //   generator: () => Promise<T>,
  //   options?: CacheOptions,
  // ): Promise<T>;

  // // Batch operations
  // getMany<T = any>(keys: string[]): Promise<Map<string, T | null>>;
  // setMany<T = any>(
  //   entries: Map<string, T>,
  //   options?: CacheOptions,
  // ): Promise<void>;
  // deleteMany(keys: string[]): Promise<number>;

  // // Pattern operations
  // findKeys(pattern: string): Promise<string[]>;
  // deletePattern(pattern: string): Promise<number>;

  // // Tag-based operations
  // invalidateByTags(tags: string[]): Promise<number>;
  // getByTags<T = any>(tags: string[]): Promise<Map<string, T>>;

  // // Cache warming
  // warmCache(config: CacheWarmingConfig): Promise<void>;
  // preload<T = any>(
  //   key: string,
  //   generator: () => Promise<T>,
  //   options?: CacheOptions,
  // ): Promise<void>;

  // // Statistics and monitoring
  // getStats(): Promise<CacheStats>;
  // getEntryInfo(key: string): Promise<CacheEntry | null>;
  // clearStats(): Promise<void>;

  // // Distributed locking
  // acquireLock(key: string, options?: DistributedLockOptions): Promise<boolean>;
  // releaseLock(key: string): Promise<boolean>;
  // extendLock(key: string, ttl: number): Promise<boolean>;

  // // Cache management
  clear(): Promise<void>;
  // getSize(): Promise<number>;
  // getKeys(): Promise<string[]>;

  // // Health check
  // healthCheck(): Promise<boolean>;

  // // Cache patterns
  // cacheAside<T = any>(
  //   key: string,
  //   generator: () => Promise<T>,
  //   options?: CacheOptions,
  // ): Promise<T>;

  // writeThrough<T = any>(
  //   key: string,
  //   value: T,
  //   writer: (value: T) => Promise<void>,
  //   options?: CacheOptions,
  // ): Promise<void>;

  // writeBehind<T = any>(
  //   key: string,
  //   value: T,
  //   writer: (value: T) => Promise<void>,
  //   options?: CacheOptions,
  // ): Promise<void>;
}
