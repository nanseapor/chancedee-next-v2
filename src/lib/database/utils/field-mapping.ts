import "server-only";

/**
 * Field Mapping Utilities
 *
 * Declarative field mappings to reduce transform function boilerplate.
 */

import { Timestamp, DocumentReference } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

/**
 * Field transformation function type
 */
export type FieldTransformer<TInput = any, TOutput = any> = (value: TInput) => TOutput;

/**
 * Field mapping configuration
 */
export interface FieldMapping {
  /** Firebase field name (snake_case) */
  firebase: string;
  /** App field name (camelCase) */
  app: string;
  /** Optional transformer for Firebase → App */
  toApp?: FieldTransformer;
  /** Optional transformer for App → Firebase */
  toFirebase?: FieldTransformer;
  /** Whether this field is required */
  required?: boolean;
}

/**
 * Entity field mapping configuration
 */
export interface EntityFieldMap {
  collectionName: string;
  fields: FieldMapping[];
  /** Fields to exclude from automatic mapping */
  excludeFields?: string[];
}

// ============================================================================
// Common Field Transformers
// ============================================================================

export const transformers = {
  /** Extract ID from DocumentReference or return string as-is */
  docRefToId: (ref: DocumentReference | string | undefined | null): string => {
    if (typeof ref === 'string') return ref;
    if (ref && typeof ref === 'object' && 'id' in ref) return ref.id;
    return "";
  },

  /** Extract ID, returning undefined if not present */
  docRefToIdOptional: (ref: DocumentReference | string | undefined | null): string | undefined => {
    if (typeof ref === 'string') return ref;
    if (ref && typeof ref === 'object' && 'id' in ref) return ref.id;
    return undefined;
  },

  /** Convert Timestamp to milliseconds */
  timestampToMillis: (timestamp: Timestamp | number | undefined): number => {
    if (typeof timestamp === 'number') return timestamp;
    if (timestamp && typeof timestamp === 'object' && 'toMillis' in timestamp) {
      return timestamp.toMillis();
    }
    return Date.now();
  },

  /** Convert milliseconds to Timestamp */
  millisToTimestamp: (millis: number | undefined): Timestamp | undefined => {
    return millis !== undefined ? Timestamp.fromMillis(millis) : undefined;
  },

  /** Create a DocumentReference from a user ID */
  createUserRef: (userId: string): DocumentReference => {
    return getFirebaseAdminFirestore().collection('user_accounts').doc(userId);
  },

  /** Create a DocumentReference for any collection */
  createDocRef: (collection: string) => (id: string): DocumentReference => {
    return getFirebaseAdminFirestore().collection(collection).doc(id);
  },

  /** Pass through unchanged */
  identity: <T>(value: T): T => value,

  /** Default to empty string */
  defaultEmpty: (value: string | undefined | null): string => value || "",

  /** Default to empty array */
  defaultEmptyArray: <T>(value: T[] | undefined | null): T[] => value || [],

  /** Default to false */
  defaultFalse: (value: boolean | undefined | null): boolean => value ?? false,

  /** Default to true */
  defaultTrue: (value: boolean | undefined | null): boolean => value ?? true,
};

// ============================================================================
// Generic Transform Functions
// ============================================================================

/**
 * Transform Firebase model to App model using field mapping
 */
export function transformFirebaseToApp<TFirebase, TApp>(
  firebaseModel: TFirebase,
  fieldMap: EntityFieldMap,
  createTime?: number,
  updateTime?: number
): TApp {
  const result: Record<string, any> = {};

  for (const mapping of fieldMap.fields) {
    const firebaseValue = (firebaseModel as Record<string, any>)[mapping.firebase];

    if (firebaseValue !== undefined) {
      const transformedValue = mapping.toApp
        ? mapping.toApp(firebaseValue)
        : firebaseValue;
      result[mapping.app] = transformedValue;
    } else if (mapping.required) {
      throw new Error(`Required field ${mapping.firebase} is missing`);
    }
  }

  // Add standard audit fields
  result.createdAt = createTime || 0;
  result.updatedAt = updateTime || 0;

  // Handle created_by and updated_by if present
  const createdBy = (firebaseModel as Record<string, any>).created_by;
  const updatedBy = (firebaseModel as Record<string, any>).updated_by;

  if (createdBy !== undefined) {
    result.createdBy = transformers.docRefToId(createdBy);
  }
  if (updatedBy !== undefined) {
    result.updatedBy = transformers.docRefToId(updatedBy);
  }

  return result as TApp;
}

/**
 * Transform App model to Firebase model using field mapping
 */
export function transformAppToFirebase<TApp, TFirebase>(
  appModel: TApp,
  fieldMap: EntityFieldMap,
  actorId: string,
  isUpdate = false
): TFirebase {
  const result: Record<string, any> = {};

  for (const mapping of fieldMap.fields) {
    const appValue = (appModel as Record<string, any>)[mapping.app];

    if (appValue !== undefined) {
      const transformedValue = mapping.toFirebase
        ? mapping.toFirebase(appValue)
        : appValue;
      result[mapping.firebase] = transformedValue;
    }
  }

  // Add audit fields
  const actorRef = fieldMap.collectionName === 'user_accounts'
    ? actorId
    : transformers.createUserRef(actorId);

  if (!isUpdate) {
    result.created_by = actorRef;
    result.created_at = Timestamp.now();
  }

  result.updated_by = actorRef;
  result.updated_at = Timestamp.now();

  return result as TFirebase;
}

/**
 * Create transform functions from field mapping
 */
export function createTransformFunctions<TApp, TFirebase>(
  fieldMap: EntityFieldMap
) {
  return {
    toApp: (
      firebaseModel: TFirebase,
      createTime?: number,
      updateTime?: number
    ): TApp => transformFirebaseToApp<TFirebase, TApp>(
      firebaseModel,
      fieldMap,
      createTime,
      updateTime
    ),

    toFirebase: (
      appModel: TApp,
      actorId: string,
      isUpdate?: boolean
    ): TFirebase => transformAppToFirebase<TApp, TFirebase>(
      appModel,
      fieldMap,
      actorId,
      isUpdate
    ),
  };
}
