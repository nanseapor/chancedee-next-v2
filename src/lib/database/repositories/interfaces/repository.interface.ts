import { Filter } from "firebase-admin/firestore";

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
   * Get documents by filter
   */
  getByFilter(filter?: Filter): Promise<T[] | null>;

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
}