"use server";

import { cookies } from "next/headers";

import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { webUserAccountGetCompleteById } from "@/lib/database/actions/user-accounts";
import { webConsentRecordCreateVersion } from "@/lib/database/actions/consent-records";
import type { CookiePreferences } from "@/types/consent.types";
import type { JobsmarketRole } from "@/store/jobsmarket/global-atoms";

/**
 * Login action input
 */
interface LoginInput {
  idToken: string;
  termsAccepted: boolean;
  context?: "candidate" | "company" | "admin";
  refCode?: string | null;
  jobId?: string | null;
}

/**
 * Login action result
 */
interface LoginResult {
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  redirectUrl?: string;
  role?: JobsmarketRole;
  userId?: string;
}

/**
 * Error codes for login failures
 * Per BLS-01 §3.1 Security Matrix
 */
const LOGIN_ERROR_CODES = {
  TERMS_NOT_ACCEPTED: "terms_not_accepted",
  INVALID_TOKEN: "invalid_token",
  TOKEN_EXPIRED: "token_expired",
  ACCOUNT_NOT_FOUND: "account_not_found",
  ACCOUNT_DELETED: "account_deleted",
  ACCOUNT_SUSPENDED: "account_suspended",
  SESSION_FAILED: "session_failed",
  UNKNOWN: "unknown",
} as const;

/**
 * Error messages in Thai
 * Per BLS-01 §3.1 Security Matrix
 */
const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  [LOGIN_ERROR_CODES.TERMS_NOT_ACCEPTED]: "กรุณายอมรับข้อกำหนดและนโยบาย",
  [LOGIN_ERROR_CODES.INVALID_TOKEN]: "ข้อมูลการยืนยันตัวตนไม่ถูกต้อง",
  [LOGIN_ERROR_CODES.TOKEN_EXPIRED]: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
  [LOGIN_ERROR_CODES.ACCOUNT_NOT_FOUND]: "ไม่พบบัญชีผู้ใช้",
  [LOGIN_ERROR_CODES.ACCOUNT_DELETED]: "บัญชีนี้ถูกลบแล้ว",
  [LOGIN_ERROR_CODES.ACCOUNT_SUSPENDED]: "บัญชีนี้ถูกระงับชั่วคราว",
  [LOGIN_ERROR_CODES.SESSION_FAILED]: "ไม่สามารถสร้างเซสชันได้ กรุณาลองใหม่",
  [LOGIN_ERROR_CODES.UNKNOWN]: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
};

/**
 * loginWithPostRouting - Main login server action
 * Per AUTH-R01 Implementation Plan §2
 *
 * Flow:
 * 1. Validate terms acceptance
 * 2. Verify ID token with Firebase Admin
 * 3. Fetch user data from Firestore
 * 4. Apply post-login routing logic (BLS-01 §3.1)
 * 5. Create session cookie
 * 6. Log consent record
 * 7. Return redirect URL based on user state
 */
export async function loginWithPostRouting(
  input: LoginInput
): Promise<LoginResult> {
  try {
    // Step 1: Validate terms acceptance
    if (!input.termsAccepted) {
      return createError(LOGIN_ERROR_CODES.TERMS_NOT_ACCEPTED);
    }

    // Step 2: Verify ID token
    const auth = getFirebaseAdminAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(input.idToken);
    } catch (tokenError: unknown) {
      console.error("Token verification failed:", tokenError);
      const errorCode = (tokenError as { code?: string })?.code;
      if (errorCode === "auth/id-token-expired") {
        return createError(LOGIN_ERROR_CODES.TOKEN_EXPIRED);
      }
      return createError(LOGIN_ERROR_CODES.INVALID_TOKEN);
    }

    const uid = decodedToken.uid;

    // Step 3: Fetch user data from Firestore
    const userData = await webUserAccountGetCompleteById(uid);

    // Handle new Google user - they might not have a user account yet
    if (!userData) {
      // For new users, we'll create a candidate account on first login
      // This is handled separately - for now redirect to register
      // In production, this would create the account automatically per BLS-01
      return {
        success: true,
        redirectUrl: "/auth/register?from=google",
        userId: uid,
      };
    }

    const { userInfo } = userData;
    const roles = userInfo?.roles || [];

    // Step 4: Apply post-login routing logic (BLS-01 §3.1)
    const routingResult = determinePostLoginDestination(
      uid,
      roles,
      userInfo?.companyId,
      input.context,
      input.refCode,
      input.jobId
    );

    // Check for blocked states
    if (routingResult.blocked) {
      return createError(routingResult.errorCode ?? LOGIN_ERROR_CODES.UNKNOWN);
    }

    // Step 5: Create session cookie
    try {
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days (existing behavior)
      const sessionCookie = await auth.createSessionCookie(input.idToken, {
        expiresIn,
      });

      const domain =
        process.env.NODE_ENV === "production" ? ".chancedee.com" : undefined;

      (await cookies()).set("session", sessionCookie, {
        maxAge: expiresIn / 1000, // Convert to seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        domain,
        sameSite: "strict",
      });
    } catch (sessionError) {
      console.error("Session creation failed:", sessionError);
      return createError(LOGIN_ERROR_CODES.SESSION_FAILED);
    }

    // Step 6: Log consent record for terms acceptance
    try {
      const defaultPreferences: CookiePreferences = {
        essential: true,
        analytics: false,
        marketing: false,
        functional: false,
      };

      await webConsentRecordCreateVersion(
        defaultPreferences,
        uid,
        undefined, // sessionId
        "", // userAgent - will be populated from request in production
        "", // ipHash - will be hashed from request in production
        "initial",
        uid
      );
    } catch (consentError) {
      // Log but don't fail login for consent errors
      console.error("Consent record creation failed:", consentError);
    }

    // Step 7: Return success with redirect URL
    return {
      success: true,
      redirectUrl: routingResult.destination,
      role: routingResult.role,
      userId: uid,
    };
  } catch (error) {
    console.error("Login action failed:", error);
    return createError(LOGIN_ERROR_CODES.UNKNOWN);
  }
}

/**
 * Create error response helper
 */
function createError(code: string): LoginResult {
  return {
    success: false,
    errorCode: code,
    errorMessage: LOGIN_ERROR_MESSAGES[code] || LOGIN_ERROR_MESSAGES[LOGIN_ERROR_CODES.UNKNOWN],
  };
}

/**
 * Post-login routing logic
 * Per BLS-01 §3.1 Post-Login Routing Logic
 */
interface RoutingResult {
  destination: string;
  role?: JobsmarketRole;
  blocked?: boolean;
  errorCode?: string;
}

function determinePostLoginDestination(
  uid: string,
  roles: string[],
  companyId?: string,
  context?: "candidate" | "company" | "admin",
  refCode?: string | null,
  jobId?: string | null
): RoutingResult {
  // Check for deleted account (highest priority - blocks all other routing)
  if (roles.includes("deleted")) {
    return {
      destination: "/jobsmarket/auth/status?type=deleted",
      blocked: true,
      errorCode: LOGIN_ERROR_CODES.ACCOUNT_DELETED,
    };
  }

  // Check for suspended account
  if (roles.includes("suspended")) {
    return {
      destination: "/jobsmarket/auth/status?type=suspended",
      blocked: true,
      errorCode: LOGIN_ERROR_CODES.ACCOUNT_SUSPENDED,
    };
  }

  // Check for pending admin (company creator)
  if (roles.includes("pending") && roles.includes("admin")) {
    return {
      destination: companyId
        ? `/jobsmarket/companies/${companyId}/pending`
        : "/jobsmarket/auth/status?type=pending",
    };
  }

  // Check for pending staff (invited to company)
  if (roles.includes("pending")) {
    return {
      destination: "/jobsmarket/auth/status?type=staff-pending",
    };
  }

  // Check for ChanceDee platform admin
  if (roles.includes("chancedee")) {
    // Handle admin context request
    if (context === "admin") {
      return {
        destination: "/platform/dashboard",
      };
    }
    // Default to platform dashboard
    return {
      destination: "/platform/dashboard",
    };
  }

  // Priority routing based on parameters (RIS §7.2)

  // Priority 1: Referral code - redirect to registration
  if (refCode) {
    return {
      destination: `/jobsmarket/auth/register?refCode=${refCode}`,
    };
  }

  // Priority 2: Job application flow
  if (jobId && roles.includes("candidate")) {
    return {
      destination: `/jobsmarket/jobs/${jobId}`,
      role: "candidate",
    };
  }

  // Check for multi-role users
  const hasCandidate = roles.includes("candidate");
  const hasCompany = roles.includes("company");

  // Priority 3: Context parameter handling (RIS §7)
  if (context) {
    // Admin context
    if (context === "admin") {
      if (!roles.includes("chancedee")) {
        // User doesn't have admin role - return to login with error
        return {
          destination: "/jobsmarket/auth/login?error=insufficient-permissions",
          blocked: true,
          errorCode: LOGIN_ERROR_CODES.ACCOUNT_NOT_FOUND,
        };
      }
      return {
        destination: "/platform/dashboard",
      };
    }

    // Company context
    if (context === "company") {
      if (hasCompany && companyId) {
        return {
          destination: `/jobsmarket/companies/${companyId}/dashboard`,
          role: "company",
        };
      }
      // User doesn't have company role - show context mismatch
      return {
        destination: "/jobsmarket/auth/register?role=company&from=login",
      };
    }

    // Candidate context
    if (context === "candidate") {
      if (hasCandidate) {
        return {
          destination: `/jobsmarket/candidates/${uid}`,
          role: "candidate",
        };
      }
      // User doesn't have candidate role - show context mismatch
      return {
        destination: "/jobsmarket/auth/register?role=candidate&from=login",
      };
    }
  }

  // Priority 4: Multi-role handling
  if (hasCandidate && hasCompany) {
    // Multi-role user - redirect to role selection
    return {
      destination: "/jobsmarket/auth/select-role",
    };
  }

  // Priority 5: Single role routing
  // Single role: candidate
  if (hasCandidate) {
    return {
      destination: `/jobsmarket/candidates/${uid}`,
      role: "candidate",
    };
  }

  // Single role: company
  if (hasCompany && companyId) {
    return {
      destination: `/jobsmarket/companies/${companyId}/dashboard`,
      role: "company",
    };
  }

  // Fallback - should not reach here for valid users
  return {
    destination: "/jobsmarket",
  };
}

// Note: LOGIN_ERROR_CODES and LOGIN_ERROR_MESSAGES are internal to this file
// They cannot be exported from a "use server" file per Next.js requirements
