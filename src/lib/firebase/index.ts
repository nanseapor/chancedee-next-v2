/**
 * Firebase Module - Centralized Firebase exports
 *
 * This module provides a unified interface for Firebase services.
 *
 * Usage:
 * - Client-side: import { auth, getFirebaseAuth } from "@/lib/firebase"
 * - Server-side: import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from "@/lib/firebase/admin"
 * - Storage service: import { firebaseStorageService } from "@/lib/firebase/storage"
 */

// Re-export client SDK for backward compatibility with @/lib/firebase imports
export * from "./client";
