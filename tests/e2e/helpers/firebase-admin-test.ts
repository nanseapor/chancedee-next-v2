/**
 * Firebase Admin SDK configured for E2E test environment
 * Uses service account credentials to create/manage test users
 *
 * IMPORTANT: All test accounts are marked with isTestAccount custom claim
 * for easy identification and cleanup.
 */

import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore, Timestamp } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";
import path from "path";
import { loadEnvConfig } from "@next/env";

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

let auth: Auth;
let db: Firestore;
let storage: Storage;

function initializeTestAdmin() {
  let app: App;

  if (getApps().length === 0) {
    // Use environment variables for credentials (same as main app)
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    );
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

    if (!privateKey || !projectId || !clientEmail) {
      throw new Error(
        "Firebase Admin SDK credentials not configured. " +
        "Set FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_PROJECT_ID, and FIREBASE_ADMIN_CLIENT_EMAIL."
      );
    }

    app = initializeApp(
      {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      },
      "e2e-test"
    );

    // Configure Firestore settings
    getFirestore(app).settings({
      ignoreUndefinedProperties: true,
    });
  } else {
    // Find the e2e-test app or use default
    const existingApp = getApps().find((a) => a.name === "e2e-test");
    if (existingApp) {
      app = existingApp;
    } else {
      const defaultApp = getApps()[0];
      if (!defaultApp) {
        throw new Error("No Firebase Admin app initialized");
      }
      app = defaultApp;
    }
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  return { app, auth, db, storage };
}

// Initialize on import
const admin = initializeTestAdmin();

export const testAuth = admin.auth;
export const testDb = admin.db;
export const testStorage = admin.storage;
export { Timestamp };

/**
 * Custom claims for test accounts
 */
export interface TestAccountClaims {
  isTestAccount: true;
  testSuite: "e2e" | "integration" | "load";
  createdAt: number;
  testName?: string;
  variant?: string;
}

/**
 * Generate unique test email
 * Format: {prefix}-{timestamp}-{random1}{random2}@test.chancedee.com
 * Uses double random to minimize collision risk in parallel test runs
 */
export function generateTestEmail(prefix: string = "test"): string {
  const timestamp = Date.now();
  const random1 = Math.random().toString(36).substring(2, 8);
  const random2 = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}-${random1}${random2}@test.chancedee.com`;
}

/**
 * Generate unique test ID with prefix
 * Format: {prefix}-{timestamp}-{random}
 */
export function generateTestId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Get current timestamp in Firestore format
 */
export function now(): FirebaseFirestore.Timestamp {
  return Timestamp.now();
}

/**
 * Convert Date to Firestore Timestamp
 */
export function toTimestamp(date: Date): FirebaseFirestore.Timestamp {
  return Timestamp.fromDate(date);
}

/**
 * Create a document reference
 */
export function docRef(collection: string, id: string): FirebaseFirestore.DocumentReference {
  return testDb.collection(collection).doc(id);
}
