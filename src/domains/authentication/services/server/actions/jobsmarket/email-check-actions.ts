/**
 * Email Existence Check Server Actions
 * Per AUTH-R02 Implementation Plan Section 2.3
 * Per BLS-01 §3.2 - Email validation before registration
 *
 * Checks if email already exists in user_accounts collection
 */

"use server";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import rateLimiter, { RATE_LIMIT_CONFIGS, getClientIP } from "@/lib/utils/server/rate-limiter";
import { headers } from "next/headers";

/**
 * Check if email already exists
 * Per BLS-01 §3.2 - Returns existing roles and auth method
 *
 * Rate limited: 10 requests / 5 minutes per IP
 */
export async function checkEmailExists(data: {
  email: string;
}): Promise<{
  success: boolean;
  exists: boolean;
  roles?: string[];
  method?: "email" | "google";
  error?: string;
}> {
  // Rate limiting
  const headersList = await headers();
  const clientIP = getClientIP(headersList);
  const rateLimitKey = `EMAIL_CHECK_${data.email.toLowerCase()}_${clientIP}`;
  const { success: rateLimitSuccess } = await rateLimiter.limit(
    rateLimitKey,
    RATE_LIMIT_CONFIGS.EMAIL_CHECK
  );

  if (!rateLimitSuccess) {
    return {
      success: false,
      exists: false,
      error: "คำขอมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง",
    };
  }

  try {
    // Validate email format
    if (!isValidEmail(data.email)) {
      return {
        success: false,
        exists: false,
        error: "รูปแบบอีเมลไม่ถูกต้อง",
      };
    }

    // Query Firestore for existing user_accounts
    const db = getFirebaseAdminFirestore();
    const userAccountsRef = db.collection("user_accounts");
    const snapshot = await userAccountsRef
      .where("email", "==", data.email.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return {
        success: true,
        exists: false,
      };
    }

    // Email exists - return roles and method
    const userData = snapshot.docs[0]?.data();
    if (!userData) {
      return {
        success: true,
        exists: false,
      };
    }

    const roles = userData.roles || [];

    // Determine auth method by checking Firebase Auth providers
    const method = await getAuthMethod(userData.uid);

    return {
      success: true,
      exists: true,
      roles,
      method,
    };
  } catch (error) {
    console.error("Error checking email existence:", error);
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
    };
  }
}

/**
 * Get authentication method for existing user
 */
async function getAuthMethod(uid: string): Promise<"email" | "google"> {
  try {
    const { getAuth } = await import("firebase-admin/auth");
    const auth = getAuth();
    const userRecord = await auth.getUser(uid);

    // Check provider data for Google
    const hasGoogle = userRecord.providerData.some(
      (provider) => provider.providerId === "google.com"
    );

    return hasGoogle ? "google" : "email";
  } catch (error) {
    console.error("Error getting auth method:", error);
    return "email"; // Default fallback
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
