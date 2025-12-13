# AUTH-R00: Cross-Cutting Infrastructure Implementation Plan

**Document ID:** AUTH-R00-PLAN
**Version:** 1.0
**Created:** 2025-12-13
**Status:** Draft - Awaiting Approval

---

## 1. Executive Summary

### 1.1 Purpose
Extract and formalize cross-cutting authentication patterns from AUTH-R01 implementation into reusable infrastructure for AUTH-R02 through AUTH-R08.

### 1.2 Scope
- **In Scope:**
  - Shared atoms (session state, role management, auth errors)
  - Server action HOFs (withServerActionAuth, withRateLimit)
  - Shared OTP system (request/verify actions)
  - Error handling utilities (code mapping, Thai messages)
  - Session management hook (useSessionRenewal)

- **Out of Scope:**
  - Middleware implementation (exists, review only)
  - Route-specific logic (stays in individual RIS)
  - UI components (handled per-route)
  - Analytics tracking (future enhancement)

### 1.3 Deliverables
1. Updated global atoms file with AUTH-R00 §4 atoms
2. Server action HOF utilities (withServerActionAuth, withRateLimit)
3. Shared OTP request/verify actions
4. Error code mapping utilities
5. Session renewal hook (useSessionRenewal)
6. Unit tests for all shared utilities (>80% coverage)

---

## 2. Audit of Existing R01 Implementation

### 2.1 What Already Exists ✅

#### Atoms (`src/store/jobsmarket/`)
**File: `auth-atoms.ts`** (Login-specific)
- ✅ `loginPageStateAtom` - Login page state machine
- ✅ `loginErrorAtom` - Login error info
- ✅ `termsAcceptedAtom` - Terms checkbox
- ✅ `contextMessageAtom` - Context from ?from param
- ✅ `redirectUrlAtom` - Redirect after login
- ✅ `preferredMethodAtom` - Default login method

**File: `global-atoms.ts`** (Cross-cutting)
- ✅ `activeRoleAtom` - Current role for multi-role users
- ✅ `sessionStateAtom` - Session validity state
- ✅ `authenticatedUserIdAtom` - UID from session

**Status:** Partial - missing `authErrorAtom` for global errors

#### Server Actions
**File: `src/domains/authentication/services/server/actions/jobsmarket/login-action.ts`**
- ✅ `loginWithPostRouting()` - Main login flow
- ✅ Session cookie creation (inline, not extracted)
- ✅ Post-login routing logic (inline)
- ✅ Error code/message constants (file-scoped, not shared)

**Status:** Ad-hoc - no HOF pattern yet

#### OTP System
**File: `src/lib/database/actions/otp-codes.ts`**
- ✅ Repository CRUD operations (webOTPCodesCreate, webOTPCodesGetById, etc.)
- ❌ No high-level sendVerificationOTPEmail()
- ❌ No verifyOTPCode() business logic

**Status:** Low-level only - need business logic layer

#### Rate Limiting
**File: `src/lib/utils/server/rate-limiter.ts`**
- ✅ RateLimiter class with sliding window
- ✅ RATE_LIMIT_CONFIGS (LOGIN, OTP_REQUEST, OTP_VERIFY, etc.)
- ✅ Helper functions (getClientIP, formatTimeRemaining)
- ❌ No HOF wrapper (withRateLimit)

**Status:** Utility exists, needs HOF wrapper

#### Authorization
**File: `src/lib/utils/server/authorization.ts`**
- ✅ Authorization helpers (canAccessUserData, canAccessCandidateData, etc.)
- ❌ No withServerActionAuth HOF

**Status:** Partial - need auth extraction HOF

#### Hooks
**File: `src/hooks/jobsmarket/use-login.ts`**
- ✅ useLogin hook for login page
- ❌ No useSessionRenewal hook

**Status:** Login-specific only

#### Middleware
**File: `src/middleware.ts`**
- Status: **Unknown** - need to check if exists and what it does

### 2.2 Gaps to Fill 🔴

| Component | What's Missing | Where to Create |
|-----------|----------------|-----------------|
| **Atoms** | `authErrorAtom` for global error state | `src/store/jobsmarket/global-atoms.ts` |
| **Server HOFs** | `withServerActionAuth()` - extract session + validate | `src/lib/utils/server/auth-hof.ts` (new) |
| **Server HOFs** | `withRateLimit()` - wrap actions with rate limiting | `src/lib/utils/server/auth-hof.ts` (new) |
| **OTP Actions** | `sendVerificationOTPEmail()` business logic | `src/domains/authentication/services/server/actions/jobsmarket/otp-actions.ts` (new) |
| **OTP Actions** | `verifyOTPCode()` business logic | Same file as above |
| **Session Hook** | `useSessionRenewal()` - client-side timer | `src/hooks/jobsmarket/use-session-renewal.ts` (new) |
| **Error Utils** | `mapErrorCode()` - centralized error mapping | `src/lib/utils/error-messages.ts` (new) |
| **Error Utils** | `ERROR_MESSAGES` - Thai message lookup | Same file as above |

---

## 3. Implementation Tasks

### 3.1 Task 1: Extend Global Atoms
**File:** `src/store/jobsmarket/global-atoms.ts`

**Changes:**
```typescript
// ADD: Global auth error atom (AUTH-R00 §4)
export interface AuthError {
  code: string;
  message: string;
  recoveryAction?: 'retry' | 'wait' | 'login' | 'contact';
}

export const authErrorAtom = atom<AuthError | null>(null);
```

**Rationale:**
- Login page already has `loginErrorAtom` (page-specific)
- Need global error for:
  - Session expiry modal (can happen on any page)
  - OTP errors during registration
  - API call failures across routes

**Tests:**
- Unit test: atom initializes to null
- Unit test: can set/reset error object

---

### 3.2 Task 2: Create Server Action HOFs
**New File:** `src/lib/utils/server/auth-hof.ts`

**Component 2A: withServerActionAuth**

Per AUTH-R00 §1.2, this HOF:
1. Extracts session cookie from request headers
2. Validates with Firebase Admin SDK
3. Gets user UID from decoded token
4. Passes `{ auth: { uid, user } }` to wrapped action
5. Prevents IDOR by providing server-verified UID

**Signature:**
```typescript
import { cookies } from "next/headers";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

interface AuthContext {
  uid: string;
  email?: string;
  roles?: string[];
}

/**
 * Higher-Order Function for Server Actions requiring authentication
 * Per AUTH-R00 §1.2
 *
 * @param action - Server action to wrap
 * @returns Wrapped action that receives auth context
 */
export function withServerActionAuth<TInput, TOutput>(
  action: (input: TInput, auth: AuthContext) => Promise<TOutput>
) {
  return async (input: TInput): Promise<TOutput> => {
    // Step 1: Extract session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      throw new Error("UNAUTHENTICATED");
    }

    try {
      // Step 2: Validate with Firebase Admin
      const auth = getFirebaseAdminAuth();
      const decodedToken = await auth.verifySessionCookie(sessionCookie, true);

      // Step 3: Extract auth context
      const authContext: AuthContext = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        // Note: roles come from Firestore user_accounts, not token
        // Caller can fetch if needed
      };

      // Step 4: Call wrapped action with verified auth
      return await action(input, authContext);
    } catch (error) {
      console.error("Auth verification failed:", error);
      throw new Error("INVALID_SESSION");
    }
  };
}
```

**Component 2B: withRateLimit**

Wraps server actions with rate limiting. Uses existing `rateLimiter` from `rate-limiter.ts`.

**Signature:**
```typescript
import rateLimiter, { RATE_LIMIT_CONFIGS, getClientIP } from "./rate-limiter";
import { headers } from "next/headers";

/**
 * Higher-Order Function for rate-limited server actions
 * Per AUTH-R00 §5
 *
 * @param action - Server action to wrap
 * @param configKey - Key from RATE_LIMIT_CONFIGS
 * @param keyExtractor - Function to extract rate limit key from input
 * @returns Wrapped action with rate limiting
 */
export function withRateLimit<TInput, TOutput>(
  action: (input: TInput) => Promise<TOutput>,
  configKey: keyof typeof RATE_LIMIT_CONFIGS,
  keyExtractor: (input: TInput) => string
) {
  return async (input: TInput): Promise<TOutput> => {
    // Get rate limit config
    const config = RATE_LIMIT_CONFIGS[configKey];

    // Extract key (e.g., email, IP, refCode)
    const key = keyExtractor(input);

    // Get client IP for compound key
    const headersList = await headers();
    const clientIP = getClientIP(headersList);
    const rateLimitKey = `${configKey}_${key}_${clientIP}`;

    // Check rate limit
    const { success, remaining, resetTime } = await rateLimiter.limit(
      rateLimitKey,
      config
    );

    if (!success) {
      const error: any = new Error("RATE_LIMITED");
      error.resetTime = resetTime;
      throw error;
    }

    // Proceed with action
    try {
      const result = await action(input);
      // On success, optionally reset rate limit
      // rateLimiter.reset(rateLimitKey);
      return result;
    } catch (error) {
      // On failure, keep rate limit active
      throw error;
    }
  };
}
```

**Usage Example:**
```typescript
// Protected action with auth
export const updateProfile = withServerActionAuth(
  async (input: UpdateProfileInput, auth: AuthContext) => {
    // auth.uid is server-verified, cannot be spoofed
    await updateUserProfile(auth.uid, input.data);
    return { success: true };
  }
);

// Rate-limited action
export const sendOTP = withRateLimit(
  async (input: { email: string }) => {
    // Send OTP logic
    return { success: true };
  },
  "OTP_REQUEST",
  (input) => input.email // Rate limit by email
);

// Combined: auth + rate limit
export const changeEmail = withServerActionAuth(
  withRateLimit(
    async (input: { newEmail: string }, auth: AuthContext) => {
      // Logic here
      return { success: true };
    },
    "EMAIL_VERIFICATION",
    (input) => input.newEmail
  )
);
```

**Tests:**
- Unit: withServerActionAuth rejects missing cookie
- Unit: withServerActionAuth rejects invalid token
- Unit: withServerActionAuth passes valid auth context
- Unit: withRateLimit blocks after max attempts
- Unit: withRateLimit resets after window expires
- Integration: Combined HOF works correctly

**Acceptance Criteria:**
- HOFs are generic and type-safe
- Error handling matches AUTH-R00 error codes
- Rate limiter integrates with existing config

---

### 3.3 Task 3: Shared OTP System
**New File:** `src/domains/authentication/services/server/actions/jobsmarket/otp-actions.ts`

Per AUTH-R00 §8, implement business logic layer on top of existing repository.

**Component 3A: sendVerificationOTPEmail**

```typescript
"use server";

import { webOTPCodesCreate, webOTPCodesUpdate, webOTPCodesGetByFilter } from "@/lib/database/actions/otp-codes";
import { Filter } from "firebase-admin/firestore";
import { withRateLimit } from "@/lib/utils/server/auth-hof";

interface SendOTPInput {
  email: string;
}

interface SendOTPResult {
  success: boolean;
  refCode?: string;
  error?: string;
}

/**
 * Send OTP verification email
 * Per AUTH-R00 §8.4
 *
 * Flow:
 * 1. Rate limit by email + IP (10/15min)
 * 2. Invalidate previous OTP for same email (if exists)
 * 3. Generate 6-digit OTP and 10-char refCode
 * 4. Store in otp_codes collection (TTL 15min)
 * 5. Send email via SendGrid
 * 6. Return refCode to client (NOT the OTP itself)
 */
async function sendVerificationOTPEmailImpl(
  input: SendOTPInput
): Promise<SendOTPResult> {
  try {
    const { email } = input;

    // Step 1: Invalidate previous OTP for this email
    const filter = Filter.where("email", "==", email).where("status", "==", null);
    const existingOTPs = await webOTPCodesGetByFilter(filter);

    if (existingOTPs && existingOTPs.length > 0) {
      // Mark old OTPs as invalidated
      for (const otp of existingOTPs) {
        await webOTPCodesUpdate(
          { ...otp, status: "invalidated" },
          otp.uid,
          "system"
        );
      }
    }

    // Step 2: Generate OTP and refCode
    const otpCode = generateOTPCode(); // 6 digits
    const refCode = generateRefCode(); // 10 chars

    // Step 3: Store in Firestore
    const otpData = {
      uid: refCode, // Document ID = refCode
      email,
      otp_code: otpCode,
      ref_code: refCode,
      create_date: new Date(),
      status: null, // Active
    };

    await webOTPCodesCreate(otpData, refCode, "system");

    // Step 4: Send email (placeholder - integrate SendGrid)
    // await sendOTPEmail(email, otpCode, refCode);
    console.log(`[DEV] OTP for ${email}: ${otpCode} (ref: ${refCode})`);

    // Step 5: Return refCode only
    return {
      success: true,
      refCode,
    };
  } catch (error) {
    console.error("Send OTP failed:", error);
    return {
      success: false,
      error: "ไม่สามารถส่งรหัส OTP ได้ กรุณาลองใหม่",
    };
  }
}

// Export with rate limiting
export const sendVerificationOTPEmail = withRateLimit(
  sendVerificationOTPEmailImpl,
  "OTP_REQUEST",
  (input) => input.email
);

/**
 * Generate 6-digit OTP code
 */
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate 10-character reference code
 */
function generateRefCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude ambiguous chars
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

**Component 3B: verifyOTPCode**

```typescript
interface VerifyOTPInput {
  refCode: string;
  otpCode: string;
}

interface VerifyOTPResult {
  code: number; // 200=success, 403=invalid, 429=rate limited
  message: string;
}

/**
 * Verify OTP code
 * Per AUTH-R00 §8.4
 *
 * Flow:
 * 1. Rate limit by refCode + IP (5/5min)
 * 2. Fetch OTP record by refCode
 * 3. Check expiry (15min TTL)
 * 4. Check status (must be null, not verified/invalidated)
 * 5. Compare OTP code (constant-time comparison)
 * 6. Mark as verified on success
 * 7. Return result code
 */
async function verifyOTPCodeImpl(
  input: VerifyOTPInput
): Promise<VerifyOTPResult> {
  try {
    const { refCode, otpCode } = input;

    // Step 1: Fetch OTP record
    const otpRecord = await webOTPCodesGetById(refCode);

    if (!otpRecord) {
      return {
        code: 403,
        message: "ไม่พบรหัส OTP",
      };
    }

    // Step 2: Check status
    if (otpRecord.status === "verified") {
      return {
        code: 403,
        message: "รหัส OTP ถูกใช้แล้ว",
      };
    }

    if (otpRecord.status === "invalidated" || otpRecord.status === "expired") {
      return {
        code: 403,
        message: "รหัส OTP หมดอายุแล้ว",
      };
    }

    // Step 3: Check expiry (15 minutes)
    const TTL_MS = 15 * 60 * 1000;
    const createdAt = otpRecord.create_date.toMillis();
    const now = Date.now();

    if (now - createdAt > TTL_MS) {
      // Mark as expired
      await webOTPCodesUpdate(
        { ...otpRecord, status: "expired" },
        refCode,
        "system"
      );
      return {
        code: 403,
        message: "รหัส OTP หมดอายุแล้ว",
      };
    }

    // Step 4: Compare OTP (constant-time to prevent timing attacks)
    const isValid = constantTimeCompare(otpCode, otpRecord.otp_code);

    if (!isValid) {
      return {
        code: 403,
        message: "รหัส OTP ไม่ถูกต้อง",
      };
    }

    // Step 5: Mark as verified
    await webOTPCodesUpdate(
      { ...otpRecord, status: "verified" },
      refCode,
      "system"
    );

    return {
      code: 200,
      message: "ยืนยันสำเร็จ",
    };
  } catch (error) {
    console.error("Verify OTP failed:", error);
    return {
      code: 500,
      message: "เกิดข้อผิดพลาด กรุณาลองใหม่",
    };
  }
}

// Export with rate limiting
export const verifyOTPCode = withRateLimit(
  verifyOTPCodeImpl,
  "OTP_VERIFY",
  (input) => input.refCode
);

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
```

**Tests:**
- Unit: Generate OTP creates 6 digits
- Unit: Generate refCode creates 10 chars
- Unit: Send OTP invalidates previous codes
- Unit: Verify OTP rejects expired codes
- Unit: Verify OTP rejects already-used codes
- Unit: Verify OTP validates correct code
- Unit: Constant-time compare works correctly
- Integration: Full OTP flow (send → verify)

**Acceptance Criteria:**
- Rate limiting enforced per AUTH-R00 §5.2
- OTP TTL is 15 minutes
- Previous OTPs invalidated on new request
- Error messages match AUTH-R00 §8.5

---

### 3.4 Task 4: Error Message Utilities
**New File:** `src/lib/utils/error-messages.ts`

Centralize error code mapping per AUTH-R00 Appendix A.

```typescript
/**
 * Error message utilities
 * Per AUTH-R00 Appendix A
 */

export interface ErrorInfo {
  code: string;
  message: string;
  recovery?: 'retry' | 'wait' | 'login' | 'contact' | 'fix';
}

/**
 * Thai error messages for application error codes
 */
export const APP_ERROR_MESSAGES: Record<string, ErrorInfo> = {
  // Authentication errors
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    recovery: "retry",
  },
  ACCOUNT_NOT_FOUND: {
    code: "ACCOUNT_NOT_FOUND",
    message: "ไม่พบบัญชีผู้ใช้",
    recovery: "retry",
  },
  ACCOUNT_DELETED: {
    code: "ACCOUNT_DELETED",
    message: "บัญชีนี้ถูกลบแล้ว",
    recovery: "contact",
  },
  TOO_MANY_REQUESTS: {
    code: "TOO_MANY_REQUESTS",
    message: "ลองใหม่ใน 15 นาที",
    recovery: "wait",
  },

  // Session errors
  SESSION_EXPIRED: {
    code: "SESSION_EXPIRED",
    message: "เซสชันหมดอายุ",
    recovery: "login",
  },
  UNAUTHENTICATED: {
    code: "UNAUTHENTICATED",
    message: "กรุณาเข้าสู่ระบบ",
    recovery: "login",
  },
  INVALID_SESSION: {
    code: "INVALID_SESSION",
    message: "เซสชันไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่",
    recovery: "login",
  },

  // OTP errors
  OTP_EXPIRED: {
    code: "OTP_EXPIRED",
    message: "รหัส OTP หมดอายุแล้ว",
    recovery: "retry",
  },
  OTP_INVALID: {
    code: "OTP_INVALID",
    message: "รหัส OTP ไม่ถูกต้อง",
    recovery: "retry",
  },
  OTP_ALREADY_USED: {
    code: "OTP_ALREADY_USED",
    message: "รหัส OTP ถูกใช้แล้ว",
    recovery: "retry",
  },
  RATE_LIMITED: {
    code: "RATE_LIMITED",
    message: "กรุณารอสักครู่ก่อนลองใหม่",
    recovery: "wait",
  },

  // Generic
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "ไม่สามารถเชื่อมต่อได้",
    recovery: "retry",
  },
  UNKNOWN: {
    code: "UNKNOWN",
    message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
    recovery: "retry",
  },
};

/**
 * Firebase Auth error code mapping
 * Per AUTH-R00 Appendix A.1
 */
export const FIREBASE_ERROR_MAP: Record<string, string> = {
  "auth/invalid-email": "INVALID_EMAIL",
  "auth/user-disabled": "ACCOUNT_SUSPENDED",
  "auth/user-not-found": "ACCOUNT_NOT_FOUND",
  "auth/wrong-password": "INVALID_CREDENTIALS",
  "auth/email-already-in-use": "EMAIL_EXISTS",
  "auth/weak-password": "WEAK_PASSWORD",
  "auth/too-many-requests": "TOO_MANY_REQUESTS",
  "auth/popup-blocked": "POPUP_BLOCKED",
  "auth/popup-closed-by-user": "POPUP_CLOSED",
  "auth/network-request-failed": "NETWORK_ERROR",
  "auth/requires-recent-login": "SESSION_EXPIRED",
  "auth/invalid-credential": "INVALID_CREDENTIALS",
};

/**
 * Map error code to Thai message
 */
export function mapErrorCode(code: string): ErrorInfo {
  // Check if it's a Firebase error
  const appCode = FIREBASE_ERROR_MAP[code] || code;

  // Return mapped error or default
  return APP_ERROR_MESSAGES[appCode] || APP_ERROR_MESSAGES.UNKNOWN;
}

/**
 * Map Firebase error to application error
 */
export function mapFirebaseError(firebaseCode: string): ErrorInfo {
  const appCode = FIREBASE_ERROR_MAP[firebaseCode];
  return APP_ERROR_MESSAGES[appCode] || APP_ERROR_MESSAGES.UNKNOWN;
}
```

**Usage:**
```typescript
// In server action
import { mapErrorCode } from "@/lib/utils/error-messages";

try {
  // ... some operation
} catch (error) {
  const errorInfo = mapErrorCode(error.message);
  return {
    success: false,
    error: errorInfo.message,
    code: errorInfo.code,
  };
}

// In client component
import { mapFirebaseError } from "@/lib/utils/error-messages";

try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (err) {
  const errorInfo = mapFirebaseError(err.code);
  setError(errorInfo);
}
```

**Tests:**
- Unit: Firebase errors map correctly
- Unit: App errors map correctly
- Unit: Unknown codes return default

---

### 3.5 Task 5: Session Renewal Hook
**New File:** `src/hooks/jobsmarket/use-session-renewal.ts`

Per AUTH-R00 §3.2, implement client-side session renewal logic.

```typescript
"use client";

import { useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import { getFirebaseAuth } from "@/lib/firebase";
import { sessionStateAtom } from "@/store/jobsmarket/global-atoms";

/**
 * Session renewal hook
 * Per AUTH-R00 §3.2
 *
 * Logic:
 * - Check every 5 minutes if user is active
 * - Track activity via mouse/keyboard/touch events
 * - If JWT expires in <10 minutes → renew session
 * - Update sessionStateAtom on expiry
 */
export function useSessionRenewal() {
  const setSessionState = useSetAtom(sessionStateAtom);
  const auth = getFirebaseAuth();

  const lastActivityRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update last activity timestamp
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    localStorage.setItem("lastActivity", Date.now().toString());
  };

  // Check if user is active (within last 5 minutes)
  const isUserActive = (): boolean => {
    const ACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    const lastActivity = lastActivityRef.current;
    return now - lastActivity < ACTIVITY_THRESHOLD;
  };

  // Check session and renew if needed
  const checkAndRenewSession = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSessionState("unauthenticated");
      return;
    }

    // Check if user is active
    if (!isUserActive()) {
      // User idle, skip renewal
      return;
    }

    try {
      // Get token result to check expiry
      const tokenResult = await currentUser.getIdTokenResult();
      const expiryTime = new Date(tokenResult.expirationTime).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;

      // If token expires in <10 minutes, renew it
      const RENEWAL_THRESHOLD = 10 * 60 * 1000; // 10 minutes

      if (timeUntilExpiry < RENEWAL_THRESHOLD) {
        console.log("[Session] Renewing token proactively");

        // Force token refresh
        const newToken = await currentUser.getIdToken(true);

        // Call server action to renew session cookie
        const { refreshSession } = await import(
          "@/domains/authentication/services/server/actions/jobsmarket/session-actions"
        );

        const result = await refreshSession(newToken);

        if (result.success) {
          setSessionState("authenticated");
          localStorage.setItem("sessionCreated", Date.now().toString());
        } else {
          console.error("[Session] Renewal failed");
          setSessionState("expired");
        }
      }
    } catch (error) {
      console.error("[Session] Check failed:", error);
      setSessionState("expired");
    }
  };

  useEffect(() => {
    // Activity tracking events
    const events = ["click", "keypress", "mousemove", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Start periodic check (every 5 minutes)
    checkIntervalRef.current = setInterval(
      checkAndRenewSession,
      5 * 60 * 1000
    );

    // Initial check
    checkAndRenewSession();

    return () => {
      // Cleanup
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });

      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [auth, setSessionState]);
}
```

**Note:** This hook requires a new server action `refreshSession()` which we'll create in Task 6.

**Tests:**
- Unit: Activity tracking updates timestamp
- Unit: Idle check returns false after 5min
- Integration: Hook triggers renewal before expiry
- Integration: Hook sets expired state on failure

---

### 3.6 Task 6: Session Actions
**New File:** `src/domains/authentication/services/server/actions/jobsmarket/session-actions.ts`

Create session management actions referenced by AUTH-R00 §3 and Appendix C.

```typescript
"use server";

import { cookies } from "next/headers";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

/**
 * Refresh session cookie
 * Per AUTH-R00 Appendix C.1
 *
 * Called by useSessionRenewal hook when token is about to expire
 */
export async function refreshSession(
  idToken: string
): Promise<{ success: boolean }> {
  try {
    const auth = getFirebaseAdminAuth();

    // Verify the new ID token
    const decodedToken = await auth.verifyIdToken(idToken);

    if (!decodedToken) {
      return { success: false };
    }

    // Create new session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    // Set cookie
    const cookieStore = await cookies();
    const domain =
      process.env.NODE_ENV === "production" ? ".chancedee.com" : undefined;

    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      domain,
      sameSite: "strict",
    });

    return { success: true };
  } catch (error) {
    console.error("Session refresh failed:", error);
    return { success: false };
  }
}

/**
 * Check if session cookie exists and is valid
 * Per AUTH-R00 Appendix C.1
 */
export async function hasSessionCookie(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return false;
    }

    const auth = getFirebaseAdminAuth();
    await auth.verifySessionCookie(sessionCookie, true);
    return true;
  } catch {
    return false;
  }
}

/**
 * Logout - clear session cookie
 * Per AUTH-R00 Appendix C.1
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
```

**Tests:**
- Unit: refreshSession creates new cookie
- Unit: hasSessionCookie detects valid session
- Unit: logout clears cookie

---

## 4. Testing Strategy

### 4.1 Unit Tests
**Location:** `tests/unit/jobsmarket/auth/`

| File | Tests | Coverage Target |
|------|-------|-----------------|
| `auth-hof.test.ts` | withServerActionAuth, withRateLimit | >90% |
| `otp-actions.test.ts` | sendOTPEmail, verifyOTP | >85% |
| `error-messages.test.ts` | Error mapping functions | 100% |
| `session-actions.test.ts` | refreshSession, logout | >80% |
| `auth-atoms.test.ts` | Atom initialization | 100% |

### 4.2 Integration Tests
**Location:** `tests/integration/jobsmarket/auth/`

| Test Suite | Scenarios |
|------------|-----------|
| `otp-flow.test.ts` | Full OTP send → verify flow |
| `session-renewal.test.ts` | Session renewal before expiry |
| `rate-limiting.test.ts` | Rate limit enforcement across actions |

### 4.3 E2E Tests
Not required for R00 (infrastructure only). E2E tests will be added for specific routes (R02-R08) that use this infrastructure.

---

## 5. File Structure Summary

```
src/
├── store/jobsmarket/
│   ├── global-atoms.ts          # UPDATED: Add authErrorAtom
│   └── auth-atoms.ts             # EXISTING: Login-specific atoms
│
├── lib/
│   ├── utils/
│   │   ├── server/
│   │   │   ├── auth-hof.ts      # NEW: withServerActionAuth, withRateLimit
│   │   │   └── rate-limiter.ts  # EXISTING: Rate limiter class
│   │   └── error-messages.ts    # NEW: Error code mapping
│   └── database/actions/
│       └── otp-codes.ts          # EXISTING: Repository layer
│
├── domains/authentication/services/server/actions/jobsmarket/
│   ├── login-action.ts           # EXISTING: Login flow
│   ├── session-actions.ts        # NEW: refreshSession, logout, hasSessionCookie
│   └── otp-actions.ts            # NEW: sendVerificationOTPEmail, verifyOTPCode
│
└── hooks/jobsmarket/
    ├── use-login.ts              # EXISTING: Login hook
    └── use-session-renewal.ts    # NEW: Session renewal hook

tests/
├── unit/jobsmarket/auth/
│   ├── auth-hof.test.ts          # NEW
│   ├── otp-actions.test.ts       # NEW
│   ├── error-messages.test.ts    # NEW
│   ├── session-actions.test.ts   # NEW
│   └── auth-atoms.test.ts        # NEW
│
└── integration/jobsmarket/auth/
    ├── otp-flow.test.ts          # NEW
    ├── session-renewal.test.ts   # NEW
    └── rate-limiting.test.ts     # NEW
```

---

## 6. Dependencies & Compatibility

### 6.1 Existing Dependencies ✅
- `firebase-admin` - Already in use for auth
- `jotai` - Already in use for state
- `next` (15+) - Server actions, cookies
- `vitest` - Unit testing framework

### 6.2 New Dependencies ❌
None required! All functionality built with existing libs.

### 6.3 Breaking Changes
**None.** This is purely additive infrastructure.

**Migration Path for Future Routes:**
1. AUTH-R01 (login) - already complete, no changes
2. AUTH-R02+ (registration, etc.) - use new HOFs and OTP system from day 1

---

## 7. Security Considerations

### 7.1 IDOR Prevention
- `withServerActionAuth` provides server-verified UID
- Actions cannot be called with spoofed user IDs
- See AUTH-R00 §1.2 for authorization flow

### 7.2 Rate Limiting
- All OTP actions protected by `withRateLimit`
- Sliding window prevents burst attacks
- Per AUTH-R00 §5 configuration

### 7.3 Constant-Time Comparison
- OTP verification uses constant-time compare
- Prevents timing attacks on OTP codes
- Per security best practices

### 7.4 Session Security
- httpOnly cookies prevent XSS theft
- Secure flag in production (HTTPS only)
- SameSite=strict prevents CSRF
- Per AUTH-R00 §3.1

---

## 8. Open Questions for Human Review

1. **Middleware Check:** Does `src/middleware.ts` exist? If so, what does it currently do for session validation? Should we integrate with it?

2. **SendGrid Integration:** OTP email sending is stubbed (`console.log` for dev). Should we integrate SendGrid now or later? If now, what template ID should we use?

3. **Error Logging:** Should server action errors be logged to a service (Sentry, LogRocket) or just `console.error` for now?

4. **Session Cookie Duration:** Current implementation uses 5 days (matching existing code). AUTH-R00 §3.1 spec says 1 hour. Which should we use?
   - **Current:** 5 days (simpler UX, less frequent logins)
   - **Spec:** 1 hour (more secure, requires renewal hook)

5. **Firebase vs Custom Rate Limiting:** Firebase Auth has built-in rate limiting for login (~5 attempts). Should we add our own layer on top, or trust Firebase's implementation?

6. **OTP Collection Cleanup:** Should we add a Cloud Function to auto-delete expired OTP docs (>24 hours old) to save storage costs?

---

## 9. Success Criteria

This implementation is complete when:

- [ ] All atoms defined in AUTH-R00 §4 exist and are tested
- [ ] `withServerActionAuth` HOF works and prevents IDOR
- [ ] `withRateLimit` HOF integrates with existing rate limiter
- [ ] OTP send/verify actions work end-to-end with tests
- [ ] Error mapping utilities cover all codes in AUTH-R00 Appendix A
- [ ] `useSessionRenewal` hook renews sessions proactively
- [ ] All unit tests pass with >80% coverage
- [ ] Integration tests pass for OTP flow and session renewal
- [ ] No breaking changes to existing AUTH-R01 implementation
- [ ] Documentation updated (this plan → implementation notes)

---

## 10. Implementation Order

**Phase 1: Foundation (Day 1)**
1. Task 4: Error message utilities (no dependencies)
2. Task 1: Extend global atoms (simple addition)
3. Task 2A: withServerActionAuth HOF (core dependency)

**Phase 2: OTP System (Day 2)**
4. Task 2B: withRateLimit HOF (needed for OTP)
5. Task 3: Shared OTP actions (depends on 2A, 2B)

**Phase 3: Session Management (Day 3)**
6. Task 6: Session actions (refreshSession, etc.)
7. Task 5: useSessionRenewal hook (depends on 6)

**Phase 4: Testing & Validation (Day 4)**
8. Write all unit tests
9. Write integration tests
10. Run quality gates (build, lint, tests)

---

## 11. Quality Gates Checklist

Before marking AUTH-R00 complete:

### Gate 1: BUILD ✅
```bash
npm run build
```
- [ ] Exits with code 0
- [ ] No TypeScript errors
- [ ] All "use server" exports are async

### Gate 2: LINT ✅
```bash
npm run lint
```
- [ ] No errors (warnings OK)

### Gate 3: UNIT TESTS ✅
```bash
npm run test:unit
```
- [ ] All tests pass
- [ ] Coverage >80% for new files

### Gate 4: INTEGRATION TESTS ✅
```bash
npm run test:integration
```
- [ ] OTP flow test passes
- [ ] Session renewal test passes
- [ ] Rate limiting test passes

### Gate 5: AUTH-R01 REGRESSION ✅
```bash
npm run test:unit tests/unit/jobsmarket/auth/login
```
- [ ] All 41 AUTH-R01 tests still pass
- [ ] No breaking changes to login flow

---

## 12. Next Steps After Approval

1. **Create GitHub issue** for AUTH-R00 implementation
2. **Implement in order** per §10 (Phase 1 → 4)
3. **Test continuously** - don't batch testing to the end
4. **Document decisions** - update plan with any deviations
5. **Get human approval** on open questions (§8) before finalizing
6. **Create baseline** for AUTH-R02 to build upon

---

*End of AUTH-R00 Implementation Plan v1.0*
