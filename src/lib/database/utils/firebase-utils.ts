import "server-only";

import { DocumentReference, Filter, Query, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { wrapError } from "../errors";

// Helper function to extract DocumentReference ID safely
export function extractDocumentId(docRef: DocumentReference | string | undefined | null): string {
  if (typeof docRef === 'string') {
    return docRef;
  }
  if (docRef && typeof docRef === 'object' && 'id' in docRef) {
    return docRef.id;
  }
  return "";
}

// Helper function to extract DocumentReference ID safely (optional return)
export function extractDocumentIdOptional(docRef: DocumentReference | string | undefined | null): string | undefined {
  if (typeof docRef === 'string') {
    return docRef;
  }
  if (docRef && typeof docRef === 'object' && 'id' in docRef) {
    return docRef.id;
  }
  return undefined;
}

// Helper function to extract timestamp milliseconds safely
export function extractTimestamp(timestamp: Timestamp | number | undefined): number {
  if (typeof timestamp === 'number') {
    return timestamp;
  }
  if (timestamp && typeof timestamp === 'object' && 'toMillis' in timestamp) {
    return timestamp.toMillis();
  }
  return Date.now();
}

// Generic get by ID function
export async function getDocumentById<T>(collectionName: string, id: string): Promise<T | null> {
  try {
    // Validate required parameters
    if (!collectionName || typeof collectionName !== 'string' || collectionName.trim() === '') {
      throw new Error(`Invalid collectionName: ${collectionName}. Collection name must be a non-empty string.`);
    }

    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error(`Invalid document id: ${id}. Document ID must be a non-empty string.`);
    }

    const docRef = getFirebaseAdminFirestore().collection(collectionName).doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return null;
    }

    return {
      ...snapshot.data(),
      uid: snapshot.id,
      _createTime: snapshot.createTime?.toMillis() || 0,
      _updateTime: snapshot.updateTime?.toMillis() || 0,
    } as unknown as T;
  } catch (error) {
    throw wrapError(error, collectionName, 'read', id);
  }
}

// Generic get by filter function
export async function getDocumentsByFilter<T>(
  collectionName: string,
  filter?: Filter
): Promise<T[] | null> {
  try {
    // Validate required parameters
    if (!collectionName || typeof collectionName !== 'string' || collectionName.trim() === '') {
      throw new Error(`Invalid collectionName: ${collectionName}. Collection name must be a non-empty string.`);
    }

    let query: Query = getFirebaseAdminFirestore().collection(collectionName);

    if (filter) {

      // EXPERIMENT: Try extracting field/operator/value and using old-style where();
      query = query.where(filter);
    }

    let snapshot;
    try {
      snapshot = await query.get();
    } catch (queryError: any) {
      // Log the raw Firestore error without modification
      console.error('\n=== FIRESTORE QUERY ERROR ===');
      console.error('Collection:', collectionName);
      console.error('Error message:', queryError.message);
      console.error('Error code:', queryError.code);
      console.error('Error details:', queryError.details);
      console.error('Has metadata?', !!queryError.metadata);
      if (queryError.metadata) {
        console.error('Metadata internalRepr:', queryError.metadata.internalRepr);
      }
      throw queryError;
    }

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      uid: doc.id,
      _createTime: doc.createTime?.toMillis() || 0,
      _updateTime: doc.updateTime?.toMillis() || 0,
    })) as unknown as T[];
  } catch (error) {
    throw wrapError(error, collectionName, 'query');
  }
}

// Generic create function
export async function createDocument<T extends { uid?: string }>(
  collectionName: string,
  data: T,
  actorId: string,
  id?: string
): Promise<string> {
  try {
    // Validate required parameters
    if (!collectionName || typeof collectionName !== 'string' || collectionName.trim() === '') {
      throw new Error(`Invalid collectionName: ${collectionName}. Collection name must be a non-empty string.`);
    }

    if (!actorId || typeof actorId !== 'string' || actorId.trim() === '') {
      throw new Error(`Invalid actorId: ${actorId}. ActorId must be a non-empty string.`);
    }

    const docRef = id
      ? getFirebaseAdminFirestore().collection(collectionName).doc(id)
      : getFirebaseAdminFirestore().collection(collectionName).doc();

    // Special handling for user_accounts: use string IDs instead of DocumentReferences
    // to avoid self-referencing issues
    const createdBy = collectionName === "user_accounts"
      ? actorId
      : getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const updatedBy = collectionName === "user_accounts"
      ? actorId
      : getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);

    const dataToWrite = {
      ...data,
      uid: docRef.id,
      created_by: createdBy,
      created_at: Timestamp.now(),
      updated_by: updatedBy,
      updated_at: Timestamp.now(),
    };

    await docRef.set(dataToWrite, { merge: true });
    return docRef.id;
  } catch (error) {
    throw wrapError(error, collectionName, 'create', id);
  }
}

// Generic update function
// PERFORMANCE OPTIMIZED: Uses field-level updates instead of set-with-merge
// This eliminates the need for a preliminary read to preserve audit fields
export async function updateDocument<T>(
  collectionName: string,
  id: string,
  data: T,
  actorId: string
): Promise<string> {
  try {
    // Validate required parameters
    if (!collectionName || typeof collectionName !== 'string' || collectionName.trim() === '') {
      throw new Error(`Invalid collectionName: ${collectionName}. Collection name must be a non-empty string.`);
    }

    if (!actorId || typeof actorId !== 'string' || actorId.trim() === '') {
      throw new Error(`Invalid actorId: ${actorId}. ActorId must be a non-empty string.`);
    }

    // Validate document ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error(`Invalid document id: ${id}. Document ID must be a non-empty string.`);
    }

    const docRef = getFirebaseAdminFirestore().collection(collectionName).doc(id);

    // PERFORMANCE OPTIMIZATION: Removed docRef.get() call
    // Previous implementation: Read document first to preserve created_by/created_at
    // New implementation: Use update() which preserves existing fields automatically
    // Savings: ~200-300ms per update + 1 Firestore read operation

    // Special handling for user_accounts: use string IDs instead of DocumentReferences
    // to avoid self-referencing issues
    const updatedBy = collectionName === "user_accounts"
      ? actorId
      : getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);

    const dataToWrite = {
      ...data,
      uid: docRef.id,
      // Note: created_by and created_at are NOT included - they will be preserved
      updated_by: updatedBy,
      updated_at: Timestamp.now(),
    };

    // Use update() instead of set(merge: true)
    // update() only modifies specified fields, preserving created_by/created_at
    // Note: This will throw an error if document doesn't exist (expected behavior for updates)
    await docRef.update(dataToWrite);
    return docRef.id;
  } catch (error) {
    throw wrapError(error, collectionName, 'update', id);
  }
}

// Generic delete function
export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  try {
    // Validate required parameters
    if (!collectionName || typeof collectionName !== 'string' || collectionName.trim() === '') {
      throw new Error(`Invalid collectionName: ${collectionName}. Collection name must be a non-empty string.`);
    }

    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error(`Invalid document id: ${id}. Document ID must be a non-empty string.`);
    }

    const docRef = getFirebaseAdminFirestore().collection(collectionName).doc(id);
    await docRef.delete();
  } catch (error) {
    throw wrapError(error, collectionName, 'delete', id);
  }
}

// Generic delete by filter function
// IMPORTANT: This function handles two types of fields:
// 1. DocumentReference fields (e.g., created_by, updated_by) - value is converted to user_accounts DocumentReference
// 2. String fields (e.g., fcm_token, email) - value is used directly as a string
//
// By convention, fields ending with '_by' are assumed to be DocumentReference fields.
// All other fields are treated as string fields.
export async function deleteDocumentsByFilter(
  collectionName: string,
  field: string,
  value: string
): Promise<boolean> {
  try {
    // Validate required parameters
    if (!collectionName || typeof collectionName !== 'string' || collectionName.trim() === '') {
      throw new Error(`Invalid collectionName: ${collectionName}. Collection name must be a non-empty string.`);
    }

    if (!field || typeof field !== 'string' || field.trim() === '') {
      throw new Error(`Invalid field: ${field}. Field must be a non-empty string.`);
    }

    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Invalid value: ${value}. Value must be a non-empty string.`);
    }

    // Determine if this is a DocumentReference field or a string field
    // Convention: fields ending with '_by' are DocumentReference fields pointing to user_accounts
    const isDocumentRefField = field.endsWith('_by');

    let query;
    if (isDocumentRefField) {
      // For DocumentReference fields (created_by, updated_by), convert value to DocumentReference
      const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(value);
      query = getFirebaseAdminFirestore().collection(collectionName).where(field, "==", actorRef);
    } else {
      // For string fields (fcm_token, email, etc.), use value directly
      query = getFirebaseAdminFirestore().collection(collectionName).where(field, "==", value);
    }

    const snapshot = await query.get();

    const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    return true;
  } catch (error) {
    throw wrapError(error, collectionName, 'delete');
  }
}

// Generate a new document ID
export function generateDocumentId(collectionName: string): string {
  // Validate required parameters
  if (!collectionName || typeof collectionName !== 'string' || collectionName.trim() === '') {
    throw new Error(`Invalid collectionName: ${collectionName}. Collection name must be a non-empty string.`);
  }
  
  return getFirebaseAdminFirestore().collection(collectionName).doc().id;
}