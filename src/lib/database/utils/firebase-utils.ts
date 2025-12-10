import { DocumentReference, Filter, Query, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";

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
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
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
      query = query.where(filter);
    }

    const snapshot = await query.get();

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
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
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
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
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
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
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
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

// Generic delete by filter function
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

    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(value);
    const query = getFirebaseAdminFirestore().collection(collectionName).where(field, "==", actorRef);
    const snapshot = await query.get();

    const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    return true;
  } catch (error) {
    console.error(`Error deleting documents from ${collectionName}:`, error);
    throw error;
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