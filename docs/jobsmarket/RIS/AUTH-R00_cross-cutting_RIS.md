# AUTH-R00: Cross-Cutting Specifications

**Document ID:** AUTH-R00  
**Version:** 1.0  
**Status:** Draft  
**Created:** 2025-12-09  
**Last Updated:** 2025-12-09  
**Applies To:** AUTH-R01 through AUTH-R08

---

## Purpose

This document defines shared specifications, patterns, and standards that apply across all authentication routes. Individual RIS documents (AUTH-R01 through AUTH-R08) should reference this document rather than duplicating these specifications.

**Usage Pattern:**
```markdown
> **Cross-Reference:** See AUTH-R00 Section X for [topic].
```

---

## Table of Contents

1. [Server Actions Architecture](#1-server-actions-architecture)
2. [Global Error UX Standard](#2-global-error-ux-standard)
3. [Session Management](#3-session-management)
4. [Global State (Atoms)](#4-global-state-atoms)
5. [Rate Limiting](#5-rate-limiting)
6. [i18n & Copy Guidelines](#6-i18n--copy-guidelines)
7. [Analytics Events](#7-analytics-events)
8. [Shared OTP System](#8-shared-otp-system)
9. [Roles & Status Semantics](#9-roles--status-semantics)
10. [Wallet Integration](#10-wallet-integration)
11. [File Upload Standards](#11-file-upload-standards)
12. [Query Parameter Conventions](#12-query-parameter-conventions)

**Appendices:**
- [A: Error Code Reference](#appendix-a-error-code-reference)
- [B: Thai Copy Reference](#appendix-b-thai-copy-reference)
- [C: Server Action Signatures](#appendix-c-server-action-signatures)

---

## 1. Server Actions Architecture

### 1.1 Location Pattern

All authentication server actions live in Next.js Server Actions, NOT Cloud Functions.

| Category | Location |
|----------|----------|
| Session Management | `src/domains/authentication/services/server/actions/auth-session.ts` |
| User Management | `src/domains/authentication/services/server/actions/user-management.ts` |
| Company Staff | `src/domains/companies/services/server/actions/staff-management.ts` |
| Company Creation | `src/domains/companies/services/server/actions/company-management.ts` |
| OTP Database | `src/lib/database/actions/otp-codes.ts` |
| Consent Logging | `src/lib/database/actions/consent-records.ts` |
| Rate Limiting | `src/lib/utils/server/rate-limiter.ts` |

### 1.2 Authorization HOF Pattern

All protected server actions use Higher-Order Functions (HOFs) for consistent authentication:

| HOF | Use Case | What It Provides |
|-----|----------|------------------|
| `withServerActionAuth` | Protected server actions | Extracts UID from session cookie, passes `{ auth: { uid, user } }` |
| `withTokenApiAuth` | API routes with bearer token | Validates Firebase ID token |
| `withSessionAuth` | API routes with session cookie | Validates session cookie |

**Authorization Flow:**
```
Server Action Called
    │
    └─► withServerActionAuth HOF
        │
        ├─► Extract session cookie
        ├─► Validate with Firebase Admin SDK
        ├─► Get user UID from decoded token
        │
        └─► Pass { auth: { uid, user } } to action
```

**IDOR Prevention:**
- Server actions receive `auth.user.uid` from HOF, NOT from client
- Actions like `StaffRequestApply()` use `auth.user.uid` to identify requester
- Cannot spoof UID because it comes from validated session

**Source:** `features_authentication.md` (Security Features - Authentication Patterns)

### 1.3 Standard Response Shapes

**Success Response:**
```typescript
{ success: true, data?: T }
```

**Error Response:**
```typescript
{ success: false, error: string, code?: string }
```

**OTP-Specific Response:**
```typescript
{ code: number, message: string }
// code: 200 = success, 403 = forbidden, 429 = rate limited
```

---

## 2. Global Error UX Standard

### 2.1 Error Display Methods

| Error Type | Display Method | When to Use |
|------------|----------------|-------------|
| Field validation | Inline (red text below field) | Form field errors |
| Action feedback | Toast notification | Success/failure of actions |
| Blocking errors | Full-page error | Network error, 500, auth required |
| Confirmation needed | Modal dialog | Destructive actions |

### 2.2 Toast Configuration

**Position:**
- Desktop: Bottom-right corner
- Mobile: Bottom-center, full-width

**Duration by Variant:**

| Variant | Duration | Auto-Dismiss |
|---------|----------|--------------|
| `success` | 3 seconds | Yes |
| `error` | 5 seconds | Yes |
| `warning` | 5 seconds | Yes |
| `info` | 4 seconds | Yes |

**Max Visible:** 3 toasts stacked

**Animation:**
- Enter: Slide up + fade in (300ms)
- Exit: Slide right + fade out (200ms)

### 2.3 Inline Error Styling

```css
.inline-error {
  @apply flex items-start gap-1.5;
  @apply text-sm text-red-600;
  @apply mt-1.5;
}
```

### 2.4 Error Recovery Actions

| Error Type | Recovery Action | Button Label (Thai) |
|------------|-----------------|---------------------|
| Network error | Retry | "ลองใหม่" |
| Session expired | Re-login | "เข้าสู่ระบบอีกครั้ง" |
| Validation error | Fix input | (none - fix inline) |
| Rate limited | Wait | (disabled, show countdown) |
| Auth required | Login | "เข้าสู่ระบบ" |

---

## 3. Session Management

### 3.1 Session Cookie Specification

| Property | Value |
|----------|-------|
| Cookie Name | `session` |
| httpOnly | `true` |
| Secure | `true` (production only) |
| SameSite | `lax` |
| Path | `/` |
| Max-Age | `3600` (1 hour) |
| Domain | Auto (current domain) |

**Created by:** `login(idToken)` server action  
**Location:** `src/domains/authentication/services/server/actions/auth-session.ts`

### 3.2 Session Expiry Detection

**Dual Implementation:**

| Mechanism | Location | Purpose |
|-----------|----------|---------|
| Middleware | `middleware.ts` | Intercept requests with expired/invalid cookie |
| `useSessionRenewal` Hook | Client-side | Proactive renewal, idle detection |

**Hook Logic:**
```typescript
// Every 5 minutes:
1. Check if user is active (within last 5 minutes)
2. Check Firebase JWT expiry time (client-side, no server call)
3. If JWT expires in <10 minutes → renew session
4. Skip if JWT has >10 minutes remaining
```

**Activity Tracking Events:**
- `click`
- `keypress`
- `mousemove`
- `scroll`
- `touchstart`

### 3.3 Session Expiry Modal vs Route

| Mechanism | When Used | Behavior |
|-----------|-----------|----------|
| **Session Expiry Modal** | API returns 401 during active use | In-page modal, re-auth without leaving, preserves page state |
| **`/auth/session-expired` Route** | Middleware detects expired cookie OR idle timeout | Full page redirect, clean slate |

### 3.4 localStorage Keys

| Key | Purpose | Set By |
|-----|---------|--------|
| `sessionCreated` | Session creation timestamp | `login()` |
| `lastActivity` | Last user activity timestamp | `useSessionRenewal` |
| `lastActiveRole` | Remember role choice | `/auth/select-role` |

---

## 4. Global State (Atoms)

### 4.1 Canonical Atom Definitions

| Atom | Type | Initial | Purpose |
|------|------|---------|---------|
| `firebaseUserAtom` | `User \| null` | `null` | Firebase Auth user object |
| `userAtom` | `userDataProps \| null` | `null` | Full user data from Firestore |
| `activeRoleAtom` | `RoleType` | `'anonymous'` | Current active role context |
| `sessionStateAtom` | `SessionState` | `'none'` | Session validity status |
| `authInitializedAtom` | `boolean` | `false` | Auth initialization complete flag |

**Type Definitions:**
```typescript
type RoleType = 'candidate' | 'company' | 'chancedee' | 'pending' | 'anonymous';

type SessionState = 'valid' | 'expired' | 'none' | 'validating';
```

### 4.2 Initialization Timing

| Atom | Initializer | When |
|------|-------------|------|
| `firebaseUserAtom` | Firebase Auth state listener | App mount |
| `authInitializedAtom` | Firebase Auth `onAuthStateChanged` | After first auth check |
| `sessionStateAtom` | `login()` server action | After successful login |
| `activeRoleAtom` | `navigateUserByRole()` | Before post-login redirect |
| `userAtom` | `UserAccountGet()` response | After login, via SWR |

### 4.3 Who Writes What

| Atom | Writers |
|------|---------|
| `firebaseUserAtom` | `useFirebaseAuth` hook only |
| `userAtom` | SWR cache via `user-data-${uid}` key |
| `activeRoleAtom` | `navigateUserByRole()`, Role Switcher component |
| `sessionStateAtom` | `login()`, `useSessionRenewal`, `logout()` |
| `authInitializedAtom` | `useFirebaseAuth` hook only |

### 4.4 Migration Note

| Old Name | New Name | Reason |
|----------|----------|--------|
| `navBarAtom` | `activeRoleAtom` | Semantic - role drives UI, not vice versa |

---

## 5. Rate Limiting

### 5.1 Firebase Auth (Built-in)

| Property | Value |
|----------|-------|
| Trigger | ~5 failed login attempts |
| Duration | Unknown (Firebase doesn't expose) |
| Error Code | `auth/too-many-requests` |
| Countdown Available | **NO** - Firebase doesn't provide unlock time |

**User Message:** Use fixed message "ลองใหม่ใน 15 นาที" (no countdown timer)

### 5.2 Custom OTP Rate Limiting (Redis-backed)

| Operation | Limit | Window | Key Format |
|-----------|-------|--------|------------|
| OTP Request | 10 requests | 15 minutes | `otp_request_{email}_{IP}` |
| OTP Verify | 5 attempts | 5 minutes | `otp_verify_{refCode}_{IP}` |

**Configuration:** `src/lib/utils/server/rate-limiter.ts` (`RATE_LIMIT_CONFIGS`)

### 5.3 Rate Limit Error Handling

```typescript
// Firebase rate limit
if (error.code === 'auth/too-many-requests') {
  showError({
    code: 'TOO_MANY_REQUESTS',
    message: 'ตรวจพบการเข้าระบบมากผิดปกติ โปรดลองใหม่อีกครั้งหลังจากนี้ 15 นาที',
    recovery: 'wait'
  });
}

// OTP rate limit
if (response.code === 429) {
  showError({
    code: 'OTP_RATE_LIMITED',
    message: response.message, // Server provides specific message
    recovery: 'wait',
    countdown: response.retryAfter // If available
  });
}
```

---

## 6. i18n & Copy Guidelines

### 6.1 Tone Guidelines

| Context | Tone | Example |
|---------|------|---------|
| Auth pages | Semi-formal (พิมพ์เล็ก) | "กรุณากรอกอีเมล" |
| Error messages | Direct but friendly | "อีเมลหรือรหัสผ่านไม่ถูกต้อง" |
| Success messages | Brief and positive | "บันทึกสำเร็จ" |
| Instructions | Clear, action-oriented | "คลิกเพื่อยืนยันอีเมล" |

### 6.2 Standard Polite Particles

| Thai | Usage |
|------|-------|
| "กรุณา" | Requests (Please) |
| "โปรด" | Formal requests |
| "ขอบคุณ" | After completion |

### 6.3 Button Label Patterns

| Action | Thai | English |
|--------|------|---------|
| Submit | "ยืนยัน" or "ดำเนินการต่อ" | Confirm / Continue |
| Cancel | "ยกเลิก" | Cancel |
| Back | "ย้อนกลับ" | Back |
| Login | "เข้าสู่ระบบ" | Log In |
| Register | "ลงทะเบียน" | Register |
| Logout | "ออกจากระบบ" | Log Out |
| Retry | "ลองใหม่" | Try Again |
| Save | "บันทึก" | Save |

### 6.4 Current Implementation

**Status:** No centralized i18n system. Strings are hardcoded in components.

**Future:** Consider `next-intl` or similar for Thai/English switching.

---

## 7. Analytics Events

### 7.1 Standard Event Schema

```typescript
interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}
```

### 7.2 Auth Domain Events

| Event Name | Trigger | Required Properties |
|------------|---------|---------------------|
| `page_view` | Route load | `page`, `source` |
| `login_attempt` | Login button clicked | `method` |
| `login_success` | Login completed | `method`, `role` |
| `login_failed` | Login error | `method`, `error_code` |
| `register_start` | Registration begins | `role`, `method` |
| `register_step_complete` | Wizard step done | `step`, `role` |
| `register_complete` | Registration success | `role`, `method` |
| `register_abandoned` | Left registration | `step`, `role` |
| `otp_sent` | OTP dispatched | `purpose` |
| `otp_verified` | OTP success | `purpose` |
| `otp_failed` | OTP error | `purpose`, `error_code` |
| `password_reset_request` | Reset email sent | - |
| `password_reset_complete` | Password changed | - |
| `role_selected` | Role chosen | `role`, `remembered` |
| `logout` | User logged out | `source` |

### 7.3 Audit Trail Events (Future)

| Event | When Logged | Stored In |
|-------|-------------|-----------|
| Email changed | Account email updated | `activity_logs` (TBD) |
| Password changed | Password updated | `activity_logs` (TBD) |
| Account deleted | Deletion requested | `delete_requests` |

**Status:** Audit logging deferred to future version (not in old system).

---

## 8. Shared OTP System

### 8.1 OTP Code Policy

| Property | Value |
|----------|-------|
| Length | 6 digits (numeric) |
| TTL | 15 minutes (900,000 ms) |
| Max Verify Attempts | 5 per 5 minutes |
| Resend Cooldown | 60 seconds |
| Invalidation | On successful verify OR expiry |

### 8.2 OTP Collection Schema

**Collection:** `otp_codes`

```typescript
interface OTPCode {
  uid: string;           // Document ID = refCode
  email: string;
  otp_code: string;      // 6 digits
  ref_code: string;      // 10 chars
  create_date: Timestamp;
  status: null | 'verified' | 'expired' | 'invalidated';
}
```

### 8.3 OTP State Transitions

```
[status=null] 
  ──verify_success──► [status="verified"]
  ──verify_expired──► [status="expired"]
  ──new_otp_sent────► [status="invalidated"]
```

### 8.4 Shared Endpoints

**Same functions for all purposes:**

| Function | Used By |
|----------|---------|
| `sendVerificationOTPEmail(email)` | Registration, Email change |
| `verifyOTPCode(refCode, otpCode)` | Registration, Email change |

**Purpose Determination:** Implicit based on calling context (which page/flow invoked it).

### 8.5 OTP Error Messages

| Condition | Thai Message |
|-----------|--------------|
| Rate limited (send) | "คุณขอรหัส OTP มากเกินไป โปรดลองใหม่ในอีก X นาที" |
| Rate limited (verify) | "คุณลองผิดหลายครั้ง โปรดลองใหม่ในอีก 5 นาที" |
| Expired | "รหัส OTP หมดอายุแล้ว" |
| Invalid | "รหัส OTP ไม่ถูกต้อง" |
| Already used | "รหัส OTP ถูกใช้แล้ว" |
| Not found | "ไม่พบรหัส OTP" |

---

## 9. Roles & Status Semantics

### 9.1 Role Values

**Collection:** `user_accounts.roles` (array)

| Role | Meaning | Can Combine With |
|------|---------|------------------|
| `candidate` | Has candidate profile | `company`, `admin` |
| `company` | Has company role (HR) | `candidate`, `admin`, `pending` |
| `admin` | Company admin (can manage team) | `company` |
| `pending` | Awaiting approval | `company` |
| `deleted` | Account marked for deletion | (exclusive) |
| `chancedee` | Platform staff/superadmin | (exclusive) |

### 9.2 Single Source of Truth

**Authoritative:** `user_accounts.roles` array

**NOT used for auth logic:**
- `is_active` field (exists but not checked)
- `account_status` field (doesn't exist)

### 9.3 Role-Based Navigation

**Full Decision Table:** See AUTH-R01 Section 9.3

**Summary:**

| Priority | Condition | Destination |
|----------|-----------|-------------|
| 1 | `roles.includes('chancedee')` | `/platform/dashboard` |
| 2 | `roles.includes('deleted')` | `/auth/status?type=deleted` |
| 3 | `roles.includes('pending')` + company admin | `/companies/{id}/pending` |
| 4 | `roles.includes('pending')` + staff | `/auth/status?type=staff-pending` |
| 5 | Multi-role (candidate + company) | `/auth/select-role` |
| 6 | Company only | `/companies/{id}/dashboard` |
| 7 | Candidate only | `/candidates/{uid}` |
| 8 | Fallback | `/` |

### 9.4 Pending State Sub-Types

| Sub-Type | Roles Array | Target |
|----------|-------------|--------|
| Company Admin Pending | `['company', 'admin', 'pending']` | Platform approval |
| Staff Pending | `['candidate', 'pending']` or `['company', 'pending']` | Company admin approval |

**Transfer Fields (for pending):**
- `target_company` - Company ID user is waiting to join
- `transfer_approved` - Boolean, set when approved
- `request_timestamp` - When request was made

---

## 10. Wallet Integration

### 10.1 Signup Bonus

| Property | Value |
|----------|-------|
| Amount | 100 coins |
| Trigger | Account creation (inside `createCandidateAccount()`) |
| Transaction Type | `initialize` |
| Idempotency | Check wallet exists before creating |

### 10.2 Referral Bonus

| Property | Value |
|----------|-------|
| New User Bonus | 100 coins |
| Referrer Bonus | 100 coins |
| Trigger | `processCandidateReferral(refCode)` |
| Transaction Type | `referral bonus received` / `referral bonus given` |

### 10.3 Processing Flow

```
Registration with ?refCode
    │
    ├─► Create user account
    ├─► Initialize wallet (100 coins)
    ├─► Process referral (NON-BLOCKING)
    │   ├─► Award 100 coins to new user
    │   └─► Award 100 coins to referrer
    └─► Continue to post-registration
```

**Non-Blocking:** Referral failure logs error but doesn't stop registration.

### 10.4 Referral Error Cases

| Error | Response |
|-------|----------|
| Invalid code | `{ message: "Invalid referral code", status: 400 }` |
| Already processed | `{ message: "Referral already processed", status: 400 }` |
| Self-referral | `{ message: "Invalid referral code", status: 400 }` |
| Referrer not found | `{ message: "Referrer not found", status: 400 }` |

---

## 11. File Upload Standards

### 11.1 Constraints

| Property | Value |
|----------|-------|
| Max Size | 5MB |
| Allowed Types | `.jpg`, `.jpeg`, `.png`, `.pdf` |
| Virus Scan | NOT implemented |

### 11.2 Storage Paths

| Purpose | Path Pattern |
|---------|--------------|
| Company registration docs | `companyProfile/{uid}/attachments/` |
| Name card (staff join) | `nameCards/{uid}/` |
| Delete request docs | `deleteRequests/{uid}/` |
| Avatar | `avatars/{uid}/` |

### 11.3 Upload Error Messages

| Condition | Thai Message |
|-----------|--------------|
| File too large | "ไฟล์ใหญ่เกินไป (สูงสุด 5MB)" |
| Invalid type | "ประเภทไฟล์ไม่รองรับ" |
| Upload failed | "อัปโหลดไม่สำเร็จ กรุณาลองใหม่" |

---

## 12. Query Parameter Conventions

### 12.1 Standard Parameters

| Parameter | Type | Used By | Purpose |
|-----------|------|---------|---------|
| `?redirect` | URL-encoded string | R01, R07, R08 | Post-action destination |
| `?email` | string | R01, R04 | Prefill email field |
| `?method` | `social` \| `email` | R01 | Default auth method |
| `?context` | `candidate` \| `company` \| `admin` | R01 | Role context expectation |
| `?invite` | string | R01 | Invite token to process |
| `?refCode` | string | R02 | Referral code |
| `?type` | string | R05 | Status type to display |
| `?purpose` | string | R03 | Verification purpose |
| `?tab` | string | R06 | Active settings tab |

### 12.2 Redirect URL Validation

```typescript
function isValidRedirect(url: string): boolean {
  // Must be relative path
  if (!url.startsWith('/')) return false;
  
  // Whitelist allowed path patterns
  const allowedPatterns = [
    /^\/candidates\//,
    /^\/companies\//,
    /^\/jobs\//,
    /^\/chat/,
    /^\/notifications/,
    /^\/platform\//,
    /^\/auth\//,
  ];
  
  return allowedPatterns.some(p => p.test(url));
}
```

### 12.3 Parameter Priority

When multiple parameters present:

1. `?invite` - Process first (invite flow)
2. `?redirect` - Use as final destination
3. `?context` - Set role expectation
4. `?method` - UI default only

---

## Appendix A: Error Code Reference

### A.1 Firebase Auth Errors

| Error Code | Thai Message | Recovery |
|------------|--------------|----------|
| `auth/invalid-email` | "รูปแบบอีเมลไม่ถูกต้อง" | Fix input |
| `auth/user-disabled` | "บัญชีนี้ถูกระงับ" | Contact support |
| `auth/user-not-found` | "ไม่พบบัญชีผู้ใช้" | Register |
| `auth/wrong-password` | "อีเมลหรือรหัสผ่านไม่ถูกต้อง" | Retry |
| `auth/email-already-in-use` | "อีเมลนี้ถูกใช้งานแล้ว" | Login |
| `auth/weak-password` | "รหัสผ่านไม่ปลอดภัยเพียงพอ" | Fix input |
| `auth/too-many-requests` | "ลองใหม่ใน 15 นาที" | Wait |
| `auth/popup-blocked` | "กรุณาอนุญาต Popup ในเบราว์เซอร์" | Allow popup |
| `auth/popup-closed-by-user` | "การเข้าสู่ระบบถูกยกเลิก" | Retry |
| `auth/network-request-failed` | "ไม่สามารถเชื่อมต่อได้" | Retry |
| `auth/requires-recent-login` | "กรุณาเข้าสู่ระบบอีกครั้ง" | Re-login |

### A.2 Application Errors

| Error Code | Thai Message | Recovery |
|------------|--------------|----------|
| `INVALID_CREDENTIALS` | "อีเมลหรือรหัสผ่านไม่ถูกต้อง" | Retry |
| `ACCOUNT_NOT_FOUND` | "ไม่พบบัญชีผู้ใช้" | Register |
| `ACCOUNT_DELETED` | "บัญชีนี้ถูกลบแล้ว" | Contact support |
| `TOO_MANY_REQUESTS` | "ลองใหม่ใน 15 นาที" | Wait |
| `POPUP_BLOCKED` | "กรุณาอนุญาต Popup" | Allow popup |
| `OAUTH_FAILED` | "ลงทะเบียนด้วย Google ไม่สำเร็จ" | Retry |
| `EMAIL_EXISTS_PASSWORD` | "อีเมลนี้ใช้รหัสผ่านเข้าสู่ระบบ" | Login with password |
| `EMAIL_EXISTS_GOOGLE` | "บัญชีนี้ใช้ Google เข้าสู่ระบบ" | Login with Google |
| `NETWORK_ERROR` | "ไม่สามารถเชื่อมต่อได้" | Retry |
| `TERMS_NOT_ACCEPTED` | "กรุณายอมรับข้อกำหนด" | Accept terms |
| `INVALID_INVITE` | "ลิงก์เชิญไม่ถูกต้องหรือหมดอายุ" | Request new invite |
| `CONTEXT_MISMATCH` | "บัญชีนี้ไม่มีสิทธิ์เข้าถึง" | Explain & redirect |
| `SESSION_CREATION_FAILED` | "ไม่สามารถสร้างเซสชันได้" | Retry |
| `SESSION_EXPIRED` | "เซสชันหมดอายุ" | Re-login |
| `OTP_EXPIRED` | "รหัส OTP หมดอายุแล้ว" | Resend |
| `OTP_INVALID` | "รหัส OTP ไม่ถูกต้อง" | Re-enter |
| `OTP_ALREADY_USED` | "รหัส OTP ถูกใช้แล้ว" | Resend |
| `OTP_RATE_LIMITED` | "กรุณารอสักครู่ก่อนลองใหม่" | Wait |
| `SOLE_ADMIN` | "ต้องมี Admin อย่างน้อย 1 คน" | Add another admin first |

---

## Appendix B: Thai Copy Reference

### B.1 Page Titles

| Route | Thai Title | English |
|-------|------------|---------|
| `/auth/login` | เข้าสู่ระบบ | Log In |
| `/auth/register` | ลงทะเบียน | Register |
| `/auth/verify` | ยืนยันอีเมล | Verify Email |
| `/auth/reset` | รีเซ็ตรหัสผ่าน | Reset Password |
| `/auth/status` | สถานะบัญชี | Account Status |
| `/auth/settings` | การตั้งค่า | Settings |
| `/auth/select-role` | เลือกบทบาท | Select Role |
| `/auth/session-expired` | เซสชันหมดอายุ | Session Expired |

### B.2 Common UI Labels

| Element | Thai | English |
|---------|------|---------|
| Email field | อีเมล | Email |
| Password field | รหัสผ่าน | Password |
| Confirm password | ยืนยันรหัสผ่าน | Confirm Password |
| Remember me | จดจำฉัน | Remember me |
| Forgot password | ลืมรหัสผ่าน? | Forgot password? |
| Terms checkbox | ยอมรับข้อกำหนดการใช้งาน | Accept Terms of Use |
| Google button | ดำเนินการต่อด้วย Google | Continue with Google |
| Loading | กำลังโหลด... | Loading... |
| Success | สำเร็จ | Success |
| Error | เกิดข้อผิดพลาด | Error |

### B.3 Status Messages

| Status | Thai | English |
|--------|------|---------|
| Company pending | รอการอนุมัติจาก Chancedee | Pending Chancedee approval |
| Staff pending | รอการอนุมัติจากผู้ดูแลบริษัท | Pending company admin approval |
| Deleted | บัญชีของคุณถูกลบแล้ว | Your account has been deleted |
| Rejected | คำขอถูกปฏิเสธ | Request rejected |

---

## Appendix C: Server Action Signatures

### C.1 Session Management

```typescript
// Location: src/domains/authentication/services/server/actions/auth-session.ts

async function login(idToken: string): Promise<{ success: boolean; error?: string }>;

async function logout(): Promise<void>;

async function hasSessionCookie(): Promise<boolean>;

async function authenticateSession(options?: { 
  requireRoles?: string[] 
}): Promise<AuthResult>;

async function refreshSession(token: string): Promise<{ success: boolean }>;
```

### C.2 User Management

```typescript
// Location: src/domains/authentication/services/server/actions/user-management.ts

async function UserAccountGet(idToken: string): Promise<userDataProps>;

async function UserAccountSet(
  idToken: string, 
  userData: Partial<userDataProps>
): Promise<void>;

async function checkIfEmailExisted(email: string): Promise<{ 
  code: number;  // 200=own, 204=not found, 403=used by other
  message: string;
  data?: { roles?: string[] }
}>;

async function sendVerificationOTPEmail(email: string): Promise<{
  success: boolean;
  refCode?: string;
  error?: string;
}>;

async function verifyOTPCode(refCode: string, otpCode: string): Promise<{
  code: number;  // 200=success, 403=invalid/expired, 429=rate limited
  message: string;
}>;
```

### C.3 Company Staff Management

```typescript
// Location: src/domains/companies/services/server/actions/staff-management.ts

async function StaffRequestApply(companyId: string, data: StaffRequestData): Promise<{
  success: boolean;
  error?: string;
}>;
// Uses auth.user.uid from withServerActionAuth HOF

async function requestTransferCompanyAccount(targetCompanyId: string): Promise<{
  success: boolean;
  error?: string;
}>;
```

### C.4 Consent Logging

```typescript
// Location: src/lib/database/actions/consent-records.ts

async function logConsentTimestamp(
  uid: string, 
  consentData?: Partial<ConsentLog>
): Promise<void>;
// NON-BLOCKING - failure should not prevent login
```

---

## Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| Server actions in Next.js | Yes | Simpler deployment, same codebase | 2025-12-08 |
| Both toasts + inline errors | Yes | Context-appropriate feedback | 2025-12-09 |
| Session: middleware + client timer | Both | Defense in depth | 2025-12-08 |
| localStorage only for role pref | Yes | Simple v1, enhance later | 2025-12-08 |
| Firebase rate limit: fixed message | "15 นาที" | Firebase doesn't provide countdown | 2025-12-08 |
| OTP shared endpoints | Yes | Reuse existing implementation | 2025-12-09 |
| Consent logging non-blocking | Yes | Don't break login flow | 2025-12-08 |
| Audit logging | Deferred | Not in old system | 2025-12-09 |
| i18n system | Hardcoded (for now) | Simplify v1 | 2025-12-09 |
| Rename navBarAtom → activeRoleAtom | Yes | Semantic clarity | 2025-12-08 |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| AUTH-R01 through AUTH-R08 | Route-specific implementations |
| `features_authentication.md` | Business logic source |
| `state-inventory_atoms.md` | Atom definitions |
| `state-inventory_hooks-global.md` | Hook implementations |
| `data-entities_user-info.md` | User data schema |
| `data-entities_otp-codes.md` | OTP schema |
| `feedback.md` | Toast/error component specs |

---

*End of AUTH-R00: Cross-Cutting Specifications v1.0*
