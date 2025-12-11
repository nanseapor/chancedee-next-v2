/**
 * Repository Error Classes
 *
 * Typed errors for database operations with full context.
 */

/**
 * Base repository error with operation context
 */
export class RepositoryError extends Error {
  public readonly timestamp: number;

  constructor(
    message: string,
    public readonly collection: string,
    public readonly operation: 'create' | 'read' | 'update' | 'delete' | 'query',
    public readonly documentId?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'RepositoryError';
    this.timestamp = Date.now();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RepositoryError);
    }
  }

  /**
   * Convert to a serializable object for server actions
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      collection: this.collection,
      operation: this.operation,
      documentId: this.documentId,
      timestamp: this.timestamp,
      cause: this.cause?.message,
    };
  }

  /**
   * Create a user-friendly error message
   */
  toUserMessage(): string {
    return `Failed to ${this.operation} ${this.collection}${this.documentId ? ` (${this.documentId})` : ''}: ${this.message}`;
  }
}

/**
 * Document not found error
 */
export class DocumentNotFoundError extends RepositoryError {
  constructor(collection: string, documentId: string) {
    super(
      `Document not found: ${collection}/${documentId}`,
      collection,
      'read',
      documentId
    );
    this.name = 'DocumentNotFoundError';
  }
}

/**
 * Validation error for schema validation failures
 */
export class ValidationError extends RepositoryError {
  constructor(
    collection: string,
    operation: 'create' | 'update',
    public readonly validationErrors: string[],
    documentId?: string
  ) {
    super(
      `Validation failed: ${validationErrors.join(', ')}`,
      collection,
      operation,
      documentId
    );
    this.name = 'ValidationError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      validationErrors: this.validationErrors,
    };
  }
}

/**
 * Duplicate document error
 */
export class DuplicateDocumentError extends RepositoryError {
  constructor(collection: string, documentId: string) {
    super(
      `Document already exists: ${collection}/${documentId}`,
      collection,
      'create',
      documentId
    );
    this.name = 'DuplicateDocumentError';
  }
}

/**
 * Permission denied error
 */
export class PermissionDeniedError extends RepositoryError {
  constructor(
    collection: string,
    operation: 'create' | 'read' | 'update' | 'delete',
    documentId?: string,
    public readonly actorId?: string
  ) {
    super(
      `Permission denied for ${operation} on ${collection}`,
      collection,
      operation,
      documentId
    );
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Transaction error for atomic operation failures
 */
export class TransactionError extends RepositoryError {
  constructor(
    message: string,
    public readonly operations: Array<{ collection: string; id: string; type: string }>,
    cause?: Error
  ) {
    super(message, 'multiple', 'update', undefined, cause);
    this.name = 'TransactionError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operations: this.operations,
    };
  }
}

/**
 * Query error for filter/search failures
 */
export class QueryError extends RepositoryError {
  constructor(
    collection: string,
    public readonly filter?: unknown,
    cause?: Error
  ) {
    super(
      `Query failed on ${collection}`,
      collection,
      'query',
      undefined,
      cause
    );
    this.name = 'QueryError';
  }
}

/**
 * Connection/network error
 */
export class ConnectionError extends RepositoryError {
  constructor(collection: string, operation: string, cause?: Error) {
    super(
      `Connection failed during ${operation} on ${collection}`,
      collection,
      operation as any,
      undefined,
      cause
    );
    this.name = 'ConnectionError';
  }
}

/**
 * Type guard to check if an error is a RepositoryError
 */
export function isRepositoryError(error: unknown): error is RepositoryError {
  return error instanceof RepositoryError;
}

/**
 * Type guard for specific error types
 */
export function isDocumentNotFoundError(error: unknown): error is DocumentNotFoundError {
  return error instanceof DocumentNotFoundError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Wrap unknown errors in a RepositoryError
 */
export function wrapError(
  error: unknown,
  collection: string,
  operation: 'create' | 'read' | 'update' | 'delete' | 'query',
  documentId?: string
): RepositoryError {
  if (isRepositoryError(error)) {
    return error;
  }

  const cause = error instanceof Error ? error : new Error(String(error));
  return new RepositoryError(cause.message, collection, operation, documentId, cause);
}
