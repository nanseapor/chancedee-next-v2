/**
 * Cache Provider for Repository Layer
 *
 * Simple in-memory cache with TTL support.
 * For production, consider Redis or similar.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CacheOptions {
  /** Time to live in milliseconds (default: 5 minutes) */
  ttl?: number;
  /** Maximum cache entries (default: 1000) */
  maxEntries?: number;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_ENTRIES = 1000;

/**
 * In-memory cache implementation
 */
export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly ttl: number;
  private readonly maxEntries: number;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl ?? DEFAULT_TTL;
    this.maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl ?? this.ttl),
    });
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace('*', '.*'));
    // Convert iterator to array to avoid ES target compatibility issues
    // Also safer: collect keys first, then delete (avoids mutation during iteration)
    const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key));

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    const count = keysToDelete.length;

    return count;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; maxEntries: number } {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
    };
  }
}

// Singleton cache instance
let globalCache: MemoryCache | null = null;

/**
 * Get the global cache instance
 */
export function getCache(options?: CacheOptions): MemoryCache {
  if (!globalCache) {
    globalCache = new MemoryCache(options);
  }
  return globalCache;
}

/**
 * Generate a cache key for repository operations
 */
export function cacheKey(collection: string, operation: string, ...args: string[]): string {
  return `${collection}:${operation}:${args.join(':')}`;
}

/**
 * Higher-order function to add caching to a function
 */
export function withCache<TArgs extends any[], TResult>(
  keyGenerator: (...args: TArgs) => string,
  fn: (...args: TArgs) => Promise<TResult>,
  options?: { ttl?: number; cache?: MemoryCache }
): (...args: TArgs) => Promise<TResult> {
  const cache = options?.cache ?? getCache();

  return async (...args: TArgs): Promise<TResult> => {
    const key = keyGenerator(...args);

    // Check cache
    const cached = cache.get<TResult>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute and cache
    const result = await fn(...args);
    cache.set(key, result, options?.ttl);

    return result;
  };
}

/**
 * Decorator-style cache invalidation
 */
export function invalidateOnWrite(collection: string, cache?: MemoryCache) {
  const cacheInstance = cache ?? getCache();

  return {
    afterCreate: (id: string) => {
      cacheInstance.invalidatePattern(`${collection}:*`);
    },
    afterUpdate: (id: string) => {
      cacheInstance.delete(cacheKey(collection, 'getById', id));
      cacheInstance.invalidatePattern(`${collection}:getByFilter:*`);
    },
    afterDelete: (id: string) => {
      cacheInstance.invalidatePattern(`${collection}:*`);
    },
  };
}
