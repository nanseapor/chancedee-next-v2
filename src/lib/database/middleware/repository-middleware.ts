/**
 * Repository Middleware System
 *
 * Provides hooks for pre/post operations on repositories.
 */

import { Filter } from "firebase-admin/firestore";
import { IRepository, QueryOptions, PaginatedResult } from "../repositories/interfaces/repository.interface";

/**
 * Context for operation hooks
 */
export interface OperationContext<T> {
  collection: string;
  operation: 'create' | 'read' | 'update' | 'delete';
  actorId?: string;
  documentId?: string;
  data?: T;
  filter?: Filter;
  timestamp: number;
}

/**
 * Hook handlers
 */
export interface RepositoryHooks<T> {
  /** Called before create operation */
  beforeCreate?: (context: OperationContext<T>) => Promise<void> | void;
  /** Called after successful create */
  afterCreate?: (context: OperationContext<T>, result: string) => Promise<void> | void;

  /** Called before read operation */
  beforeRead?: (context: OperationContext<T>) => Promise<void> | void;
  /** Called after successful read */
  afterRead?: (context: OperationContext<T>, result: T | T[] | null) => Promise<void> | void;

  /** Called before update operation */
  beforeUpdate?: (context: OperationContext<T>) => Promise<void> | void;
  /** Called after successful update */
  afterUpdate?: (context: OperationContext<T>, result: string) => Promise<void> | void;

  /** Called before delete operation */
  beforeDelete?: (context: OperationContext<T>) => Promise<void> | void;
  /** Called after successful delete */
  afterDelete?: (context: OperationContext<T>) => Promise<void> | void;

  /** Called when any operation fails */
  onError?: (context: OperationContext<T>, error: Error) => Promise<void> | void;
}

/**
 * Create a middleware-enabled repository wrapper
 */
export function withMiddleware<T>(
  repository: IRepository<T>,
  collectionName: string,
  hooks: RepositoryHooks<T>
): IRepository<T> {
  const createContext = (
    operation: OperationContext<T>['operation'],
    overrides: Partial<OperationContext<T>> = {}
  ): OperationContext<T> => ({
    collection: collectionName,
    operation,
    timestamp: Date.now(),
    ...overrides,
  });

  return {
    async getById(id: string): Promise<T | null> {
      const context = createContext('read', { documentId: id });

      try {
        if (hooks.beforeRead) {
          await hooks.beforeRead(context);
        }

        const result = await repository.getById(id);

        if (hooks.afterRead) {
          await hooks.afterRead(context, result);
        }

        return result;
      } catch (error) {
        if (hooks.onError) {
          await hooks.onError(context, error as Error);
        }
        throw error;
      }
    },

    async getByFilter(filter?: Filter): Promise<T[] | null> {
      const context = createContext('read', { filter });

      try {
        if (hooks.beforeRead) {
          await hooks.beforeRead(context);
        }

        const result = await repository.getByFilter(filter);

        if (hooks.afterRead) {
          await hooks.afterRead(context, result);
        }

        return result;
      } catch (error) {
        if (hooks.onError) {
          await hooks.onError(context, error as Error);
        }
        throw error;
      }
    },

    async getByFilterPaginated(options?: QueryOptions): Promise<PaginatedResult<T>> {
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
      const context = createContext('create', { data: model, actorId, documentId: id });

      try {
        if (hooks.beforeCreate) {
          await hooks.beforeCreate(context);
        }

        const result = await repository.create(model, actorId, id);

        if (hooks.afterCreate) {
          await hooks.afterCreate(context, result);
        }

        return result;
      } catch (error) {
        if (hooks.onError) {
          await hooks.onError(context, error as Error);
        }
        throw error;
      }
    },

    async update(id: string, model: T, actorId: string): Promise<string> {
      const context = createContext('update', { data: model, actorId, documentId: id });

      try {
        if (hooks.beforeUpdate) {
          await hooks.beforeUpdate(context);
        }

        const result = await repository.update(id, model, actorId);

        if (hooks.afterUpdate) {
          await hooks.afterUpdate(context, result);
        }

        return result;
      } catch (error) {
        if (hooks.onError) {
          await hooks.onError(context, error as Error);
        }
        throw error;
      }
    },

    async delete(id: string): Promise<void> {
      const context = createContext('delete', { documentId: id });

      try {
        if (hooks.beforeDelete) {
          await hooks.beforeDelete(context);
        }

        await repository.delete(id);

        if (hooks.afterDelete) {
          await hooks.afterDelete(context);
        }
      } catch (error) {
        if (hooks.onError) {
          await hooks.onError(context, error as Error);
        }
        throw error;
      }
    },

    async deleteByFilter(field: string, value: string): Promise<boolean> {
      return repository.deleteByFilter(field, value);
    },

    generateId(): string {
      return repository.generateId();
    },
  };
}

/**
 * Common hooks for logging
 */
export function createLoggingHooks<T>(prefix = 'Repository'): RepositoryHooks<T> {
  return {
    beforeCreate: (ctx) => {
      console.log(`[${prefix}] Creating document in ${ctx.collection}`, {
        actorId: ctx.actorId,
        documentId: ctx.documentId,
      });
    },
    afterCreate: (ctx, result) => {
      console.log(`[${prefix}] Created document ${result} in ${ctx.collection}`);
    },
    beforeUpdate: (ctx) => {
      console.log(`[${prefix}] Updating document ${ctx.documentId} in ${ctx.collection}`, {
        actorId: ctx.actorId,
      });
    },
    afterUpdate: (ctx, result) => {
      console.log(`[${prefix}] Updated document ${result} in ${ctx.collection}`);
    },
    beforeDelete: (ctx) => {
      console.log(`[${prefix}] Deleting document ${ctx.documentId} from ${ctx.collection}`);
    },
    afterDelete: (ctx) => {
      console.log(`[${prefix}] Deleted document ${ctx.documentId} from ${ctx.collection}`);
    },
    onError: (ctx, error) => {
      console.error(`[${prefix}] Error during ${ctx.operation} in ${ctx.collection}:`, error);
    },
  };
}

/**
 * Common hooks for validation
 */
export function createValidationHooks<T>(
  validator: (data: T) => { valid: boolean; errors?: string[] }
): RepositoryHooks<T> {
  return {
    beforeCreate: (ctx) => {
      if (ctx.data) {
        const result = validator(ctx.data);
        if (!result.valid) {
          throw new Error(`Validation failed: ${result.errors?.join(', ')}`);
        }
      }
    },
    beforeUpdate: (ctx) => {
      if (ctx.data) {
        const result = validator(ctx.data);
        if (!result.valid) {
          throw new Error(`Validation failed: ${result.errors?.join(', ')}`);
        }
      }
    },
  };
}

/**
 * Combine multiple hooks
 */
export function combineHooks<T>(...hookSets: RepositoryHooks<T>[]): RepositoryHooks<T> {
  return {
    beforeCreate: async (ctx) => {
      for (const hooks of hookSets) {
        if (hooks.beforeCreate) await hooks.beforeCreate(ctx);
      }
    },
    afterCreate: async (ctx, result) => {
      for (const hooks of hookSets) {
        if (hooks.afterCreate) await hooks.afterCreate(ctx, result);
      }
    },
    beforeRead: async (ctx) => {
      for (const hooks of hookSets) {
        if (hooks.beforeRead) await hooks.beforeRead(ctx);
      }
    },
    afterRead: async (ctx, result) => {
      for (const hooks of hookSets) {
        if (hooks.afterRead) await hooks.afterRead(ctx, result);
      }
    },
    beforeUpdate: async (ctx) => {
      for (const hooks of hookSets) {
        if (hooks.beforeUpdate) await hooks.beforeUpdate(ctx);
      }
    },
    afterUpdate: async (ctx, result) => {
      for (const hooks of hookSets) {
        if (hooks.afterUpdate) await hooks.afterUpdate(ctx, result);
      }
    },
    beforeDelete: async (ctx) => {
      for (const hooks of hookSets) {
        if (hooks.beforeDelete) await hooks.beforeDelete(ctx);
      }
    },
    afterDelete: async (ctx) => {
      for (const hooks of hookSets) {
        if (hooks.afterDelete) await hooks.afterDelete(ctx);
      }
    },
    onError: async (ctx, error) => {
      for (const hooks of hookSets) {
        if (hooks.onError) await hooks.onError(ctx, error);
      }
    },
  };
}
