import { Filter } from "firebase-admin/firestore";

/**
 * Pagination options for queries
 */
export interface PaginationOptions {
  /** Maximum number of documents to return */
  limit?: number;
  /** Cursor for pagination (document ID or encoded cursor) */
  cursor?: string;
  /** Field to order by */
  orderBy?: string;
  /** Order direction */
  orderDirection?: 'asc' | 'desc';
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  /** Retrieved documents */
  data: T[];
  /** Cursor for next page (null if no more pages) */
  nextCursor: string | null;
  /** Whether there are more pages */
  hasMore: boolean;
  /** Total count (optional, expensive to compute) */
  totalCount?: number;
}

/**
 * Query options combining filter and pagination
 */
export interface QueryOptions {
  filter?: Filter;
  pagination?: PaginationOptions;
}

/**
 * Generic repository interface for database operations
 * @template T The app model type
 */
export interface IRepository<T> {
  /**
   * Get a document by ID
   */
  getById(id: string): Promise<T | null>;

  /**
   * Get documents by filter (legacy, returns all matches)
   */
  getByFilter(filter?: Filter): Promise<T[] | null>;

  /**
   * Get documents with pagination support
   */
  getByFilterPaginated?(options?: QueryOptions): Promise<PaginatedResult<T>>;

  /**
   * Create a new document
   */
  create(model: T, actorId: string, id?: string): Promise<string>;

  /**
   * Update an existing document
   */
  update(id: string, model: T, actorId: string): Promise<string>;

  /**
   * Delete a document by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Delete documents by filter
   */
  deleteByFilter(field: string, value: string): Promise<boolean>;

  /**
   * Generate a new document ID
   */
  generateId(): string;

  /**
   * Count documents matching filter (optional)
   */
  count?(filter?: Filter): Promise<number>;
}