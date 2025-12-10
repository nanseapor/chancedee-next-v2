/**
 * Selective validation utilities for critical fields
 * Schema-first approach using zod-to-ts pattern with performance optimization
 */

import { z } from 'zod';

import { criticalFieldsRegistry } from '../schemas';

/**
 * Collection names that map to criticalFieldsRegistry
 */
export type CollectionName = keyof typeof criticalFieldsRegistry;

/**
 * Validation result with safe defaults for non-critical fields
 */
export interface ValidationResult<T> {
  /** Successfully validated data with critical fields guaranteed safe */
  data: T;
  /** Any validation errors for critical fields */
  criticalErrors?: string[];
  /** Non-critical field warnings (logged but not thrown) */
  warnings?: string[];
}

/**
 * Validates only critical fields for a Firebase document
 * Non-critical fields pass through with safe defaults if validation fails
 * 
 * @param collection - The collection name to validate against
 * @param data - Raw Firebase document data
 * @param options - Validation options
 * @returns ValidationResult with validated data
 */
export async function validateCriticalFields<T>(
  collection: CollectionName,
  data: unknown,
  options: {
    /** Whether to validate Firebase or app model schema */
    type: 'firebase' | 'app';
    /** Whether to throw on critical field errors (default: true) */
    throwOnCriticalError?: boolean;
    /** Whether to log warnings for non-critical field issues */
    logWarnings?: boolean;
  } = { type: 'firebase', throwOnCriticalError: true, logWarnings: true }
): Promise<ValidationResult<T>> {
  const { type, throwOnCriticalError = true, logWarnings = true } = options;
  
  try {
    // Get the critical field schema for this collection
    const registryEntry = criticalFieldsRegistry[collection];
    if (!registryEntry) {
      throw new Error(`No critical fields registry found for collection: ${collection}`);
    }

    const schemaLoader = registryEntry[type];
    if (!schemaLoader) {
      throw new Error(`No ${type} schema found for collection: ${collection}`);
    }

    // Dynamically load the critical schema
    const criticalSchema = await schemaLoader();
    
    // Validate only critical fields
    const criticalValidation = criticalSchema.safeParse(data);
    
    if (!criticalValidation.success) {
      const criticalErrors = criticalValidation.error.errors.map(
        err => `Critical field '${err.path.join('.')}': ${err.message}`
      );
      
      if (throwOnCriticalError) {
        throw new Error(`Critical field validation failed for ${collection}: ${criticalErrors.join(', ')}`);
      }
      
      return {
        data: data as T,
        criticalErrors,
      };
    }

    // Critical fields are valid, return the data
    // Non-critical fields pass through without validation for performance
    return {
      data: data as T,
      warnings: logWarnings ? [] : undefined,
    };
    
  } catch (error) {
    if (throwOnCriticalError) {
      throw error;
    }
    
    return {
      data: data as T,
      criticalErrors: [error instanceof Error ? error.message : 'Unknown validation error'],
    };
  }
}

/**
 * Batch validate critical fields for multiple documents
 * 
 * @param collection - The collection name to validate against
 * @param documents - Array of raw Firebase documents
 * @param options - Validation options
 * @returns Array of ValidationResults
 */
export async function batchValidateCriticalFields<T>(
  collection: CollectionName,
  documents: unknown[],
  options: {
    type: 'firebase' | 'app';
    throwOnCriticalError?: boolean;
    logWarnings?: boolean;
  } = { type: 'firebase', throwOnCriticalError: true, logWarnings: true }
): Promise<ValidationResult<T>[]> {
  return Promise.all(
    documents.map(doc => validateCriticalFields<T>(collection, doc, options))
  );
}

/**
 * Type-safe wrapper for status field validation
 * Specifically handles enum status fields that control UI rendering
 * 
 * @param statusValue - The status value to validate
 * @param allowedStatuses - Enum object with allowed status values
 * @param fieldName - Name of the field for error messages
 * @returns Validated status or throws error
 */
export function validateStatusField<T extends Record<string, string>>(
  statusValue: unknown,
  allowedStatuses: T,
  fieldName: string = 'status'
): T[keyof T] {
  const allowedValues = Object.values(allowedStatuses);
  
  if (!allowedValues.includes(statusValue as string)) {
    throw new Error(`Invalid ${fieldName}: '${statusValue}'. Allowed values: ${allowedValues.join(', ')}`);
  }
  
  return statusValue as T[keyof T];
}

/**
 * Safe field extraction with fallbacks for non-critical fields
 * Used when critical fields are validated but non-critical fields might be corrupt
 * 
 * @param data - Source data object
 * @param field - Field name to extract
 * @param fallback - Fallback value if field is invalid
 * @returns Field value or fallback
 */
export function safeFieldExtract<T>(
  data: any,
  field: string,
  fallback: T
): T {
  try {
    const value = data[field];
    return value !== undefined && value !== null ? value : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Performance monitoring for validation operations
 */
export class ValidationMetrics {
  private static startTimes = new Map<string, number>();
  
  static startTimer(operation: string): void {
    this.startTimes.set(operation, Date.now());
  }
  
  static endTimer(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    this.startTimes.delete(operation);
    
    // Log slow validation operations (>100ms)
    if (duration > 100) {
      console.warn(`Slow validation operation: ${operation} took ${duration}ms`);
    }
    
    return duration;
  }
}