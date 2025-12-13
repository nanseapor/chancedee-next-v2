/**
 * Integration Test Utilities for Database Actions
 *
 * Provides helper functions for setting up and tearing down test data
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { Filter } from "firebase-admin/firestore";

/**
 * Generate a unique test ID to avoid collisions
 */
export function generateTestId(prefix: string): string {
  return `${prefix}_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Clean up test data from Firestore
 */
export async function cleanupTestData(collection: string, docId: string): Promise<void> {
  try {
    const db = getFirebaseAdminFirestore();
    await db.collection(collection).doc(docId).delete();
  } catch (error) {
    console.warn(`Failed to cleanup ${collection}/${docId}:`, error);
  }
}

/**
 * Clean up multiple test documents
 */
export async function cleanupMultipleTestData(
  items: Array<{ collection: string; docId: string }>
): Promise<void> {
  await Promise.all(
    items.map(({ collection, docId }) => cleanupTestData(collection, docId))
  );
}

/**
 * Wait for a condition to be true (for eventual consistency)
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeoutMs: number = 5000,
  intervalMs: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Condition not met within ${timeoutMs}ms`);
}

/**
 * Create a test actor ID
 */
export function getTestActorId(): string {
  return generateTestId("actor");
}

/**
 * Create a Firestore where filter
 * Uses the Filter.where() static method from firebase-admin/firestore
 */
export function createWhereFilter(
  fieldPath: string,
  opStr: string,
  value: any
): Filter {
  // Import the Filter class from firebase-admin
  const { Filter: FirestoreFilter } = require("firebase-admin/firestore");

  // Use the static where() method on the Filter class
  // This creates a proper UnaryFilter or FieldFilter
  return FirestoreFilter.where(fieldPath, opStr as any, value);
}

/**
 * Create a Firestore where filter for DocumentReference fields
 * Converts a string ID to a DocumentReference for proper querying
 */
export function createDocRefFilter(
  fieldPath: string,
  collection: string,
  docId: string
): Filter {
  const db = getFirebaseAdminFirestore();
  const docRef = db.collection(collection).doc(docId);
  const { Filter: FirestoreFilter } = require("firebase-admin/firestore");
  return FirestoreFilter.where(fieldPath, "==", docRef);
}
