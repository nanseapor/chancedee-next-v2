/**
 * Cached Repository Wrapper
 *
 * Wraps any repository with caching capabilities.
 */

import { Filter } from "firebase-admin/firestore";
import { IRepository, PaginatedResult, QueryOptions } from "../repositories/interfaces/repository.interface";
import { MemoryCache, getCache, cacheKey } from "./cache-provider";

export interface CachedRepositoryOptions {
  /** Cache instance (uses global if not provided) */
  cache?: MemoryCache;
  /** TTL for getById results (default: 5 minutes) */
  getByIdTtl?: number;
  /** TTL for getByFilter results (default: 1 minute) */
  getByFilterTtl?: number;
  /** Whether to cache null results (default: false) */
  cacheNulls?: boolean;
}

/**
 * Create a cached wrapper around a repository
 */
export function createCachedRepository<T>(
  repository: IRepository<T>,
  collectionName: string,
  options: CachedRepositoryOptions = {}
): IRepository<T> {
  const cache = options.cache ?? getCache();
  const getByIdTtl = options.getByIdTtl ?? 5 * 60 * 1000;
  const getByFilterTtl = options.getByFilterTtl ?? 60 * 1000;
  const cacheNulls = options.cacheNulls ?? false;

  return {
    async getById(id: string): Promise<T | null> {
      const key = cacheKey(collectionName, 'getById', id);

      const cached = cache.get<T | null>(key);
      if (cached !== null || (cacheNulls && cache.get<boolean>(`${key}:null`))) {
        return cached;
      }

      const result = await repository.getById(id);

      if (result !== null) {
        cache.set(key, result, getByIdTtl);
      } else if (cacheNulls) {
        cache.set(`${key}:null`, true, getByIdTtl);
      }

      return result;
    },

    async getByFilter(filter?: Filter): Promise<T[] | null> {
      // Create a stable key from the filter
      const filterKey = filter ? JSON.stringify(filter) : 'all';
      const key = cacheKey(collectionName, 'getByFilter', filterKey);

      const cached = cache.get<T[] | null>(key);
      if (cached !== null) {
        return cached;
      }

      const result = await repository.getByFilter(filter);

      if (result !== null) {
        cache.set(key, result, getByFilterTtl);
      }

      return result;
    },

    async getByFilterPaginated(options?: QueryOptions): Promise<PaginatedResult<T>> {
      // Pagination results are not cached by default due to cursor complexity
      // Implement caching if needed for specific use cases
      if (repository.getByFilterPaginated) {
        return repository.getByFilterPaginated(options);
      }
      throw new Error('getByFilterPaginated not implemented');
    },

    async count(filter?: Filter): Promise<number> {
      if (repository.count) {
        return repository.count(filter);
      }
      throw new Error('count not implemented');
    },

    async create(model: T, actorId: string, id?: string): Promise<string> {
      const result = await repository.create(model, actorId, id);

      // Invalidate related caches
      cache.invalidatePattern(`${collectionName}:getByFilter:*`);

      return result;
    },

    async update(id: string, model: T, actorId: string): Promise<string> {
      const result = await repository.update(id, model, actorId);

      // Invalidate specific and list caches
      cache.delete(cacheKey(collectionName, 'getById', id));
      cache.invalidatePattern(`${collectionName}:getByFilter:*`);

      return result;
    },

    async delete(id: string): Promise<void> {
      await repository.delete(id);

      // Invalidate all caches for this collection
      cache.invalidatePattern(`${collectionName}:*`);
    },

    async deleteByFilter(field: string, value: string): Promise<boolean> {
      const result = await repository.deleteByFilter(field, value);

      // Invalidate all caches for this collection
      cache.invalidatePattern(`${collectionName}:*`);

      return result;
    },

    generateId(): string {
      return repository.generateId();
    }
  };
}
