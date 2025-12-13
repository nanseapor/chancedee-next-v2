# AUTH-R00: Existing Infrastructure Audit Report

**Document ID:** AUTH-R00-AUDIT
**Date:** 2025-12-13
**Auditor:** Claude
**Purpose:** Identify existing shared authentication infrastructure before implementing AUTH-R00

---

## Executive Summary

**Critical Finding:** Comprehensive authentication infrastructure already exists and is shared between content and jobsmarket subdomains. **We must NOT duplicate this infrastructure.**

**Recommendation:** AUTH-R00 should focus on:
1. **REUSE** existing shared session management, HOFs, and atoms
2. **EXTEND** with jobsmarket-specific OTP business logic
3. **ADD** Thai error message mapping for jobsmarket flows
4. **Document** what exists for future route implementations

---

## 1. Existing Middleware

### File: `src/middleware.ts`

**Exists:** ✅ Yes

**What it does:**
- **Subdomain routing:** Routes requests to `/content` or `/jobsmarket` based on hostname
  - `www.chancedee.com` or `localhost` → `/content`
  - `jobs.chancedee.com` → `/jobsmarket`
- **Session clearing (content only):** Clears session cookie when visiting `/auth/sign-in` or `/auth/sign-up` on content subdomain
- **Shared cookie domain:** Uses `.chancedee.com` in production (works across subdomains)

**Session validation:** ❌ None in middleware
- No session expiry detection
- No protected route guards
- Session validation happens in server actions, not middleware

**Verdict:**
- ✅ **KEEP AS-IS** - routing works, no changes needed
- ❌ **DO NOT ADD** session validation to middleware (handled by HOFs)

---

## 2. Auth Server Actions

### Location: `src/domains/authentication/services/server/actions/`

#### File: `session.ts` (Shared - Content Subdomain)

**Functions:**
1. `authenticateSession()` - Verify session cookie, return custom token
2. `login(idToken)` - Create session cookie from Firebase ID token (5 day expiry)
3. `logout()` - Clear session cookie and revoke refresh tokens

**Signature:**
```typescript
export async function login(idToken?: string): Promise<{
  success: boolean;
  user?: DecodedIdToken;
  error?: string;
}>;

export async function logout(): Promise<{ success: boolean }>;
```

**Cookie Config:**
- Name: `session`
- Duration: 5 days
- httpOnly: true
- secure: production only
- sameSite: strict
- domain: `.chancedee.com` (production)

**Status:** ✅ **REUSE** - Works for both subdomains, DO NOT duplicate

---

#### File: `auth-engine-actions.ts` (Shared - Core Auth)

**Functions:**
1. `authenticateSession(options)` - Verify session, optionally fetch profile
2. `authenticateToken(token, options)` - Verify bearer token, optionally fetch profile
3. `authenticate(tokenOrOptions)` - Auto-detect auth method

**Signature:**
```typescript
export async function authenticateSession(
  options: AuthOptions = {}
): Promise<AuthResult | null>;

interface AuthOptions {
  includeProfile?: boolean;
  requireVerification?: boolean;
  requireRoles?: string[];
  allowInactive?: boolean;
}

interface AuthResult {
  user: DecodedIdToken;
  profile?: userDataProps;
  method: "session" | "token";
}
```

**Features:**
- Profile fetching with `includeProfile` option
- Role validation with `requireRoles`
- Email verification check
- Account active status check
- Auto-clears invalid session cookies

**Status:** ✅ **REUSE** - Perfect for jobsmarket server actions

---

### File: `jobsmarket/login-action.ts` (Jobsmarket-specific)

**Function:** `loginWithPostRouting(input)`

**What it does:**
- Validates ID token
- Fetches user data
- Determines post-login destination (routing logic)
- Creates session cookie (duplicates `login()` from session.ts)
- Logs consent record

**Status:** ⚠️ **PARTIAL DUPLICATION**
- Should use `login()` from `session.ts` instead of inline cookie creation
- Routing logic is jobsmarket-specific (keep)

---

## 3. HOF Patterns

### File: `src/domains/authentication/services/server/middleware/auth-middleware.ts`

**Exists:** ✅ Yes - **COMPREHENSIVE HOF SYSTEM**

#### HOF 1: `withSessionAuth`

**Purpose:** Session-based authentication middleware for server actions

**Signature:**
```typescript
export function withSessionAuth<T extends any[], R>(
  fn: AuthenticatedFunction<T, R>,
  options: EnhancedAuthOptions = {}
): (...args: T) => Promise<R>;

type AuthenticatedFunction<T, R> = (
  auth: AuthResult,
  ...args: T
) => Promise<R>;

interface EnhancedAuthOptions extends AuthOptions {
  redirectTo?: string;
  errorHandler?: (error: Error) => void;
}
```

**What it does:**
1. Calls `authenticateSession()` from auth-engine
2. Passes `AuthResult` (user + profile) to wrapped function
3. Optionally redirects on auth failure
4. Custom error handling

**Usage Example:**
```typescript
export const myProtectedAction = withSessionAuth(
  async (auth, input: MyInput) => {
    // auth.user.uid is server-verified
    // auth.profile contains user data
    return { success: true };
  },
  { includeProfile: true, requireRoles: ["company"] }
);
```

**Status:** ✅ **PERFECT - USE THIS**
- Already does everything `withServerActionAuth` was supposed to do
- Role checking built-in
- Profile fetching built-in
- IDOR prevention built-in

---

#### HOF 2: `withTokenAuth`

**Purpose:** Bearer token authentication for API routes

**Signature:**
```typescript
export function withTokenAuth<T extends any[], R>(
  fn: AuthenticatedFunction<T, R>,
  options: AuthOptions = {}
): (token: string, ...args: T) => Promise<R>;
```

**Status:** ✅ **REUSE** - For API routes

---

### File: `src/lib/utils/server/rate-limiter.ts`

**Rate Limiter HOF:** ❌ **DOES NOT EXIST**

**What exists:**
- `RateLimiter` class with sliding window algorithm
- `RATE_LIMIT_CONFIGS` for OTP, login, etc.
- Helper functions (`getClientIP`, `formatTimeRemaining`)

**What's missing:**
- ❌ `withRateLimit()` HOF wrapper
- Actions must call `rateLimiter.limit()` manually

**Status:** 🟡 **CREATE HOF WRAPPER** - This is still needed

---

## 4. Existing Atoms

### File: `src/store/atom-store.ts` (Shared - Content)

**Atoms:**
```typescript
export const userAtom = atom<User | null>(null);      // Firebase User object
export const searchAtom = atom("");
export const popupBannerAtom = atom(false);
export const bookmarkedBlogsAtom = atom<Post[]>();
export const fabChatOpenAtom = atom(false);
export const fabChatPanelOpenAtom = atom(false);
```

**Session-related:**
- ✅ `userAtom` - Firebase User object (from client-side auth)

**What's missing:**
- ❌ No session state atom (valid/expired/loading)
- ❌ No active role atom (for multi-role users)
- ❌ No auth error atom (for global errors)

**Status:** 🟡 **Content subdomain only** - Jobsmarket needs its own atoms

---

### File: `src/store/jobsmarket/global-atoms.ts` (Jobsmarket-specific)

**Atoms:**
```typescript
export const activeRoleAtom = atom<JobsmarketRole | null>(null);
export const sessionStateAtom = atom<SessionState>("loading");
export const authenticatedUserIdAtom = atom<string | null>(null);
```

**Status:** ✅ **PARTIALLY COMPLETE**
- Has active role tracking
- Has session state tracking
- Missing: `authErrorAtom` for global errors

---

### File: `src/store/jobsmarket/auth-atoms.ts` (Login-specific)

**Atoms:**
```typescript
export const loginPageStateAtom = atom<LoginPageState>("check_auth");
export const loginErrorAtom = atom<LoginError | null>(null);
export const termsAcceptedAtom = atom<boolean>(false);
export const contextMessageAtom = atom<ContextFromType | null>(null);
export const redirectUrlAtom = atom<string | null>(null);
export const preferredMethodAtom = atom<"social" | "email" | null>(null);
```

**Status:** ✅ **LOGIN-SPECIFIC ONLY** - Keep for login page

---

## 5. Existing Auth Hooks

### File: `src/hooks/use-auth.tsx` (Shared - Content)

**Hook:** `useFirebaseAuth()`

**What it does:**
1. Calls `authenticateSession()` server action on mount
2. Signs in with custom token if session valid
3. Listens to `onAuthStateChanged`
4. Updates `userAtom` with Firebase User
5. Calls `login()` when user signs in

**Atoms used:**
- `userAtom` from `atom-store.ts`

**Status:** ✅ **CONTENT SUBDOMAIN ONLY**
- Jobsmarket has `useLogin()` hook instead

---

### File: `src/hooks/jobsmarket/use-login.ts` (Jobsmarket-specific)

**Hook:** `useLogin()`

**What it does:**
1. Login page state machine
2. Email/Google login flows
3. Calls `loginWithPostRouting()` server action
4. Updates jobsmarket atoms

**Atoms used:**
- All atoms from `auth-atoms.ts`
- Global atoms from `global-atoms.ts`

**Status:** ✅ **JOBSMARKET LOGIN PAGE ONLY** - Keep as-is

---

### Missing: `useSessionRenewal()` ❌

**Does NOT exist in either subdomain**

**Status:** 🟡 **CREATE NEW** - Per AUTH-R00 spec

---

## 6. Error Handling

### File: `src/domains/authentication/utils/auth-errors.ts`

**Classes:**
```typescript
export class AuthenticationError extends Error {
  constructor(message, code, statusCode = 401, details)
}

export class AuthorizationError extends Error {
  constructor(message, requiredRoles, userRoles, statusCode = 403, action)
}
```

**Error Codes:**
```typescript
export const AUTH_ERROR_CODES = {
  SESSION_REQUIRED: "session-required",
  TOKEN_INVALID: "token-invalid",
  TOKEN_EXPIRED: "token-expired",
  TOKEN_REVOKED: "token-revoked",
  EMAIL_NOT_VERIFIED: "email-not-verified",
  ACCOUNT_INACTIVE: "account-inactive",
  INSUFFICIENT_ROLES: "insufficient-roles",
  ACCESS_DENIED: "access-denied",
  COMPANY_MISMATCH: "company-mismatch",
  RESOURCE_FORBIDDEN: "resource-forbidden",
};
```

**Status:** ✅ **REUSE** - Good foundation

**What's missing:**
- ❌ Thai error message mapping
- ❌ Firebase error code → app error code mapping
- ❌ Recovery action hints ("retry", "wait", "login")

**Status:** 🟡 **EXTEND** - Add Thai messages + Firebase mapping

---

## 7. Summary Table

| Component | Location | Exists | Shared? | Verdict |
|-----------|----------|--------|---------|---------|
| **Middleware** | `src/middleware.ts` | ✅ | Yes | ✅ KEEP - No changes |
| **Session Actions** | `src/domains/authentication/services/server/actions/session.ts` | ✅ | Yes | ✅ REUSE - Perfect |
| **Auth Engine** | `src/domains/authentication/services/server/actions/auth-engine-actions.ts` | ✅ | Yes | ✅ REUSE - Perfect |
| **withSessionAuth HOF** | `src/domains/authentication/services/server/middleware/auth-middleware.ts` | ✅ | Yes | ✅ REUSE - Better than planned |
| **withTokenAuth HOF** | Same as above | ✅ | Yes | ✅ REUSE |
| **withRateLimit HOF** | N/A | ❌ | - | 🟡 CREATE |
| **Rate Limiter Class** | `src/lib/utils/server/rate-limiter.ts` | ✅ | Yes | ✅ REUSE |
| **Shared Atoms** | `src/store/atom-store.ts` | ✅ | Content only | ⚠️ Separate for jobsmarket |
| **Jobsmarket Atoms** | `src/store/jobsmarket/global-atoms.ts` | ✅ | No | ✅ KEEP + ADD authErrorAtom |
| **Login Atoms** | `src/store/jobsmarket/auth-atoms.ts` | ✅ | No | ✅ KEEP |
| **Content Auth Hook** | `src/hooks/use-auth.tsx` | ✅ | Content only | ✅ KEEP (separate) |
| **Jobsmarket Login Hook** | `src/hooks/jobsmarket/use-login.ts` | ✅ | No | ✅ KEEP |
| **Session Renewal Hook** | N/A | ❌ | - | 🟡 CREATE |
| **Auth Error Classes** | `src/domains/authentication/utils/auth-errors.ts` | ✅ | Yes | ✅ REUSE |
| **Error Messages** | N/A | ❌ | - | 🟡 CREATE (Thai mapping) |
| **OTP Business Logic** | N/A | ❌ | - | 🟡 CREATE (jobsmarket-specific) |

---

## 8. Answers to Open Questions

### Q1: Does middleware validate sessions?
**A:** ❌ No. Middleware only does subdomain routing and session clearing (content subdomain only). Session validation happens in server actions via `authenticateSession()`.

### Q2: Should we add session validation to middleware?
**A:** ❌ No. Keep middleware lightweight. Use `withSessionAuth` HOF for protected actions.

### Q3: Does `withServerActionAuth` HOF exist?
**A:** ✅ YES! It's called `withSessionAuth` and it's **BETTER** than what we planned:
- Already does IDOR prevention
- Already validates roles
- Already fetches profile
- Already handles errors
- Location: `src/domains/authentication/services/server/middleware/auth-middleware.ts`

### Q4: Does rate limiting HOF exist?
**A:** ❌ No HOF wrapper, but `RateLimiter` class exists. We need to create `withRateLimit()` HOF.

### Q5: Are atoms shared between subdomains?
**A:** ⚠️ PARTIALLY
- Content: Uses `src/store/atom-store.ts`
- Jobsmarket: Uses `src/store/jobsmarket/global-atoms.ts` + `auth-atoms.ts`
- **Separation is correct** - different UI concerns, different state

### Q6: Does session renewal hook exist?
**A:** ❌ No. Neither subdomain has proactive session renewal.

---

## 9. Recommended Changes to AUTH-R00 Plan

### ✅ REMOVE from Plan (Already Exists)

1. **Task 2A: Create withServerActionAuth** → ❌ DELETE
   - Already exists as `withSessionAuth`
   - Location: `src/domains/authentication/services/server/middleware/auth-middleware.ts`
   - Better than planned (has role validation, profile fetching, error handling)

2. **Task 6: Session Actions** → ❌ DELETE (Partial)
   - `logout()` already exists in `session.ts`
   - `hasSessionCookie()` → not needed (use `authenticateSession()`)
   - `refreshSession()` → KEEP (still needed for renewal hook)

3. **Middleware Integration** → ❌ NOT NEEDED
   - Middleware does subdomain routing only
   - Session validation handled by HOFs

---

### ✅ KEEP in Plan (Still Needed)

1. **Task 1: Extend Global Atoms** → ✅ KEEP
   - Add `authErrorAtom` to `src/store/jobsmarket/global-atoms.ts`

2. **Task 2B: Create withRateLimit HOF** → ✅ KEEP
   - New file: `src/lib/utils/server/with-rate-limit.ts`
   - Wraps existing `RateLimiter` class

3. **Task 3: Shared OTP System** → ✅ KEEP
   - New file: `src/domains/authentication/services/server/actions/jobsmarket/otp-actions.ts`
   - Business logic for OTP send/verify
   - Uses `withRateLimit` HOF

4. **Task 4: Error Message Utilities** → ✅ KEEP (Modified)
   - New file: `src/lib/utils/error-messages.ts`
   - Thai message mapping
   - Firebase error code → app error code mapping
   - Extends existing `auth-errors.ts`

5. **Task 5: Session Renewal Hook** → ✅ KEEP
   - New file: `src/hooks/jobsmarket/use-session-renewal.ts`
   - Needs new `refreshSession()` action

6. **Partial Task 6: refreshSession Action** → ✅ KEEP ONLY THIS
   - Add to `src/domains/authentication/services/server/actions/session.ts` (shared file)
   - OR create jobsmarket-specific file if different behavior needed

---

### 🟡 MODIFY in Plan

1. **Server Action Examples** → Update to use `withSessionAuth`
   ```typescript
   // OLD PLAN (incorrect)
   export const updateProfile = withServerActionAuth(...)

   // NEW (correct - use existing HOF)
   export const updateProfile = withSessionAuth(
     async (auth, input) => {
       // auth.user.uid is server-verified
       // auth.profile contains user data
     },
     { includeProfile: true }
   );
   ```

2. **File Locations** → Use existing structure
   - Session actions: Add to `src/domains/authentication/services/server/actions/session.ts`
   - OTP actions: `src/domains/authentication/services/server/actions/jobsmarket/otp-actions.ts`
   - Error messages: `src/lib/utils/error-messages.ts` (new, shared)

---

## 10. Revised Scope for AUTH-R00

### What AUTH-R00 Should Actually Do

| Task | Type | File Location | Rationale |
|------|------|---------------|-----------|
| **1. Add authErrorAtom** | Extend | `src/store/jobsmarket/global-atoms.ts` | Missing from global atoms |
| **2. Create withRateLimit HOF** | New | `src/lib/utils/server/with-rate-limit.ts` | Wraps existing RateLimiter |
| **3. Create OTP Actions** | New | `src/domains/authentication/services/server/actions/jobsmarket/otp-actions.ts` | Jobsmarket-specific |
| **4. Add Thai Error Messages** | New | `src/lib/utils/error-messages.ts` | Extends auth-errors.ts |
| **5. Create refreshSession** | Extend | `src/domains/authentication/services/server/actions/session.ts` | Add to existing file |
| **6. Create useSessionRenewal** | New | `src/hooks/jobsmarket/use-session-renewal.ts` | Jobsmarket-specific |
| **7. Document Existing HOFs** | Docs | Update AUTH-R00 RIS | Guide future devs |

---

### What AUTH-R00 Should NOT Do

| Don't Do | Reason |
|----------|--------|
| ❌ Create withServerActionAuth | Already exists as `withSessionAuth` |
| ❌ Create logout() | Already exists in `session.ts` |
| ❌ Create hasSessionCookie() | Use `authenticateSession()` instead |
| ❌ Modify middleware | Works fine, no session validation needed there |
| ❌ Duplicate session management | Shared infrastructure works for both subdomains |
| ❌ Create separate auth atoms for content | Content has its own (`atom-store.ts`) |

---

## 11. Critical Integration Points

### Using Existing Infrastructure in AUTH-R02+

**For Protected Server Actions:**
```typescript
import { withSessionAuth } from "@/domains/authentication/services/server/middleware/auth-middleware";
import { withRateLimit } from "@/lib/utils/server/with-rate-limit"; // NEW from R00

// Example: Protected + rate-limited action
export const sendOTP = withRateLimit(
  withSessionAuth(
    async (auth, input: { email: string }) => {
      // auth.user.uid is server-verified
      // auth.profile has user data (if includeProfile: true)
      return { success: true };
    },
    { includeProfile: false } // No profile needed for OTP
  ),
  "OTP_REQUEST",
  (input) => input.email
);
```

**For Client Components:**
```typescript
import { useAtom } from "jotai";
import { authErrorAtom, sessionStateAtom } from "@/store/jobsmarket/global-atoms";

// Use global atoms for session state
const [sessionState] = useAtom(sessionStateAtom);
const [authError, setAuthError] = useAtom(authErrorAtom);
```

---

## 12. Next Steps

1. **Update AUTH-R00 Plan** with findings from this audit
2. **Remove duplicate infrastructure** from plan
3. **Focus on 6 core tasks** (see §10)
4. **Get human approval** on revised plan
5. **Implement in phases:**
   - Phase 1: withRateLimit HOF + error messages (no dependencies)
   - Phase 2: OTP actions (depends on Phase 1)
   - Phase 3: Session renewal (refreshSession + hook)
   - Phase 4: Testing + documentation

---

*End of AUTH-R00 Infrastructure Audit v1.0*
