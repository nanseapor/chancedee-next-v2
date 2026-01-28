"use server";

import { verifySessionCookie } from "@/utils/auth";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { AdminUser } from "./admin-auth.types";

// Re-export type for consumers (type-only exports are allowed in "use server" files)
export type { AdminUser } from "./admin-auth.types";

/**
 * Admin authentication helper for server actions
 * Per ADM-R00 Cross-Cutting RIS §7.1 Access Control
 *
 * Verifies that the current user:
 * 1. Has a valid session
 * 2. Has the 'chancedee' role in user_accounts.roles
 *
 * Throws an error if not authorized, allowing server actions to fail fast.
 */

/**
 * Require admin authorization for a server action
 *
 * @throws Error if user is not authenticated or not an admin
 * @returns AdminUser with user details
 *
 * @example
 * export async function adminOnlyAction() {
 *   const admin = await requireAdminAuth();
 *   // ... perform admin action
 * }
 */
export async function requireAdminAuth(): Promise<AdminUser> {
  // Step 1: Verify session cookie
  const decodedClaims = await verifySessionCookie();

  if (!decodedClaims) {
    throw new Error("Unauthorized: No valid session");
  }

  const userId = decodedClaims.uid;

  // Step 2: Get user roles from Firestore
  const db = getFirebaseAdminFirestore();
  const userDoc = await db.collection("user_accounts").doc(userId).get();

  if (!userDoc.exists) {
    throw new Error("Unauthorized: User account not found");
  }

  const userData = userDoc.data();
  const roles: string[] = userData?.roles || [];

  // Step 3: Check for chancedee (platform admin) role
  if (!roles.includes("chancedee")) {
    throw new Error("Forbidden: Admin access required");
  }

  // Return admin user info
  return {
    userId,
    email: decodedClaims.email || userData?.email || "",
    name:
      userData?.first_name_en && userData?.last_name_en
        ? `${userData.first_name_en} ${userData.last_name_en}`
        : userData?.first_name_th && userData?.last_name_th
          ? `${userData.first_name_th} ${userData.last_name_th}`
          : undefined,
    roles,
  };
}

/**
 * Check if a user has admin privileges without throwing
 *
 * @returns AdminUser if authenticated and authorized, null otherwise
 */
export async function checkAdminAuth(): Promise<AdminUser | null> {
  try {
    return await requireAdminAuth();
  } catch {
    return null;
  }
}
