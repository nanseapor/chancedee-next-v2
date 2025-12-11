# RIS: /auth/verify

**Route ID:** AUTH-R03  
**Version:** 1.5  
**Status:** Draft  
**Created:** 2025-12-07  
**Last Updated:** 2025-12-09

**Changes in v1.5:**
- Added Cross-References section linking to AUTH-R00 shared patterns
- OTP system details now reference AUTH-R00 Section 8

**Changes in v1.4:**
- Added Section 7.1.1 Page State Transition Table (5-column format per RIS_ORCHESTRATOR_GUIDE.md)
- Replaced Section 7.2 Component States with Component State Automaton (5-column format)
- Added Section 7.3 Entity State Automaton

**Changes in v1.3:**
- Resolved all Open Questions with product decisions - confirmed resend cooldown (60 seconds), confirmed audit logging deferred to future version, confirmed page-level rate limiting not needed

---

## Cross-References

This document references shared specifications from **AUTH-R00_cross-cutting_RIS.md**.

| Topic | AUTH-R00 Section |
|-------|------------------|
| Server actions architecture | Section 1 |
| Error UX standards | Section 2 |
| Session management | Section 3 |
| **Rate limiting (OTP)** | **Section 5** |
| i18n & Thai copy guidelines | Section 6 |
| **OTP system (policy, collection, endpoints)** | **Section 8** |
| Error code → message mapping | Appendix A |
| Thai copy reference | Appendix B |
| Server action signatures | Appendix C |


## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/auth/verify` |
| Shell | Minimal Shell |
| Purpose | OTP-based email verification for account email changes and contact email verification |
| Complexity | Low |
| Phase | 1 (Foundation) |
| UI Spec | `03-auth-routes.md` Section 4.3 (redesigned from email link to OTP) |

---

## 2. Domain Classification

### Primary Domain: Authentication

- **Owns:** Email verification flow, OTP verification
- **Mutations:**
  - Send OTP email (`sendVerificationOTPEmail()`)
  - Verify OTP (`verifyOTPCode()`)
  - Update account email (`updateAccountEmail()`)
  - Update candidate contact email (`updateCandidateContactEmail()`)
  - Update company contact email (`updateCompanyContactEmail()`)

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Candidate | Contact email storage | Write `contacts.email` where uid = user UID |
| Company | Contact email storage | Write `contacts.email` where uid = company UID |

### Global Domains

| Domain | Requirement |
|--------|-------------|
| Auth | User must be authenticated to change emails |
| Chat | Not available on this page |
| Notifications | Not available on this page |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Old Route | Coverage | Notes |
|------------|--------------|-----------|----------|-------|
| AUTH-005 | Email Verification | `/auth/email/verification` | Redesigned | Was Firebase email link, now OTP |
| AUTH-017 | OTP Verification | Backend API | Reuse | `sendVerificationOTPEmail()`, `verifyOTPCode()` |

### Deprecated Features

| Feature | Old Mechanism | Reason | Replacement |
|---------|---------------|--------|-------------|
| Firebase Email Link Verification | Firebase `sendEmailVerification()` | Cost savings (SendGrid OTP cheaper) | Custom OTP via SendGrid |

### New Features (Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| OTP-based Verification | Replace email link with 6-digit OTP input | P0 |
| Multi-purpose Verification | Support account + candidate contact + company contact | P0 |
| Account Email Change | Update Firebase Auth email via Admin SDK | P0 |
| Company Contact Email | Update company public contact email | P0 |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | Source |
|------|------------|--------|-----------|--------|
| Current User | `user_accounts` | `uid`, `email`, `roles`, `companyId` | Session required | - |
| Firebase User | Firebase Auth | `providerData` | Check OAuth provider | - |
| OTP Code | `otp_codes` | `email`, `otp_code`, `ref_code`, `status`, `create_date` | On verification | AUTH-017 |
| Contacts | `contacts` | `email` | Purpose-specific | data-entities_contacts.md |

### 4.2 Write Operations

| Action | Collection | Server Action | Trigger | Source |
|--------|------------|---------------|---------|--------|
| Send OTP | `otp_codes` | `sendVerificationOTPEmail(email)` | Page load / Resend click | AUTH-004 |
| Invalidate Old OTPs | `otp_codes` | (via sendVerificationOTPEmail) | Sets old OTPs status="invalidated" | AUTH-004 |
| Verify OTP | `otp_codes` | `verifyOTPCode(refCode, otpCode)` | OTP submit | AUTH-017 |
| Update Account Email | Firebase Auth + `user_accounts` | `updateAccountEmail(newEmail)` | After OTP verified, purpose=account | NEW |
| Update Candidate Contact | `contacts` + `candidate_screening` | `updateCandidateContactEmail(newEmail)` | After OTP verified, purpose=candidate-contact | NEW |
| Update Company Contact | `contacts` | `updateCompanyContactEmail(entityId, newEmail)` | After OTP verified, purpose=company-contact | NEW |

### 4.3 Firebase Admin Operations

| Operation | Method | Trigger |
|-----------|--------|---------|
| Get User Provider | `getFirebaseAdminAuth().getUser(uid)` | Page load, check OAuth |
| Update User Email | `getFirebaseAdminAuth().updateUser(uid, { email })` | Account email change after OTP verified |

### 4.4 Email Operations

| Email | Template | Trigger | Source |
|-------|----------|---------|--------|
| OTP Verification | SendGrid `d-49496573d0954f62a25110c564ad89d3` | Page load, Resend click | AUTH-004 |

### 4.5 Data Architecture: Email Fields

**Source:** Verified against data-entities_contacts.md, data-entities_candidate-screening.md, features_companies.md (COMP-003)

The system has multiple email fields serving different purposes:

```
┌─────────────────────────────────────────────────────────────────┐
│                        EMAIL FIELDS MAP                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Firebase Auth                                                   │
│  └── email ←── Login credential (purpose=account changes this)  │
│                                                                  │
│  user_accounts                                                   │
│  └── email ←── Synced with Firebase Auth                        │
│                                                                  │
│  contacts (collection, uid = user UID or company UID)           │
│  └── email ←── Public contact email                             │
│      └── For candidates: shown on resume (uid = user UID)       │
│      └── For companies: shown on job postings (uid = company UID)│
│                                                                  │
│  candidate_screening                                             │
│  └── emailVerification ←── Boolean flag (is contact verified?)  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Collection Details (Verified)

| Purpose | Collection | Document ID | Field | Source |
|---------|------------|-------------|-------|--------|
| `account` | Firebase Auth | user UID | `email` | - |
| `account` | `user_accounts` | user UID | `email` | - |
| `candidate-contact` | `contacts` | user UID | `email` | data-entities_contacts.md |
| `company-contact` | `contacts` | company UID | `email` | features_companies.md COMP-003 |

### Important: contacts Collection (Verified)

**Source:** data-entities_contacts.md, features_companies.md

The `contacts` collection stores contact information for BOTH candidates and companies:

- **Candidate contact:** Document ID = candidate's user UID
- **Company contact:** Document ID = company's UID (from `company_information`)

```typescript
// Candidate contact (uid = user UID)
contacts/{userUid} = { 
  email: "candidate@resume.com", 
  phone: "...",
  // + other fields: mobile, facebook, linkedin, twitter, instagram, line, website
}

// Company contact (uid = company UID)
contacts/{companyUid} = { 
  email: "hr@company.com", 
  phone: "...",
  // + other fields
}
```

### Verification Flag Update (Verified)

**Source:** data-entities_candidate-screening.md (line 22)

| Purpose | Additional Update | Field Type |
|---------|-------------------|------------|
| `candidate-contact` | Set `candidate_screening.emailVerification = true` | boolean |
| `company-contact` | No additional flag (company emails don't have verification tracking) | - |

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose | Set When |
|------|------|-----|---------|----------|
| `userAtom` | `userDataProps \| null` | R | Current user data | Already set (authenticated) |
| `sessionStateAtom` | `'valid' \| 'expired' \| 'none' \| 'checking'` | R | Session status | Already set |
| `firebaseUserAtom` | `User \| null` | R | Firebase user (for provider check) | Already set |

### 5.2 Hooks

| Hook | Returns | Purpose | Source |
|------|---------|---------|--------|
| `useFirebaseAuth` | `{ user, ... }` | Get current user | AUTH-001 |

### 5.3 SWR Keys

| Key Pattern | Data | Invalidate On | Source |
|-------------|------|---------------|--------|
| `user-data-${uid}` | User account data | After account email change | AUTH-010 |
| `candidate-${uid}` | Candidate data | After candidate contact email change | - |
| `company-${companyId}` | Company data | After company contact email change | - |

### 5.4 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `otpCode` | `string` | `''` | 6-digit OTP input |
| `refCode` | `string` | from server | OTP reference code |
| `isLoading` | `boolean` | `false` | Submit/send loading state |
| `error` | `VerifyError \| null` | `null` | Error display |
| `resendCooldown` | `number` | `0` | Countdown seconds for resend |
| `pageState` | `PageState` | `'CHECKING_AUTH'` | Current page state |

---

## 6. Query Parameters

| Param | Type | Required | Purpose | Example |
|-------|------|----------|---------|---------|
| `purpose` | `'account' \| 'candidate-contact' \| 'company-contact'` | Yes | Verification purpose | `?purpose=account` |
| `email` | `string` | Yes | New email to verify | `&email=new@example.com` |
| `entityId` | `string` | Conditional | Target entity ID | `&entityId=abc123` |
| `redirect` | `string` | No | Return URL after success | `&redirect=/settings` |

### Purpose Details

| Purpose | Description | entityId | Post-Success Action |
|---------|-------------|----------|---------------------|
| `account` | Change Firebase Auth login email | Not used (uses session.uid) | Update Firebase + user_accounts.email |
| `candidate-contact` | Update candidate resume/contact email | Not used (uses session.uid) | Update contacts.email where uid=session.uid |
| `company-contact` | Update company public contact email | Required (companyId) | Update contacts.email where uid=entityId |

### Parameter Validation

| Check | Rule | Error |
|-------|------|-------|
| `purpose` | Must be one of allowed values | `INVALID_PURPOSE` |
| `email` | Valid email format | `INVALID_EMAIL` |
| `entityId` | Required if `purpose=company-contact` | `MISSING_ENTITY_ID` |
| `entityId` | Must match `session.companyId` | `UNAUTHORIZED_ENTITY` |
| `redirect` | Must start with `/` (relative path only) | Ignore param, use default |

### Redirect Whitelist

For security, only relative paths are allowed. Absolute URLs or external domains are ignored.

```typescript
const sanitizeRedirect = (redirect: string | null): string => {
  if (!redirect) return getDefaultRedirect(purpose);
  if (!redirect.startsWith('/')) return getDefaultRedirect(purpose);
  return redirect;
};

const getDefaultRedirect = (purpose: string): string => {
  switch (purpose) {
    case 'account': return '/auth/settings';  // Account settings page
    case 'candidate-contact': return `/candidates/${uid}/profile`;
    case 'company-contact': return `/companies/${entityId}/settings`;
    default: return '/';
  }
};
```

---

## 6.5 Entry Points

This page is not directly navigated to. Users arrive via redirect from other pages that initiate email change flows.

### Entry Point Flows

#### Account Email Change (purpose=account)

**Source page:** `/auth/settings` or similar account settings page

```
┌─────────────────────────────────────────────────────────────────┐
│ Account Settings Page                                           │
├─────────────────────────────────────────────────────────────────┤
│ [Current Email: user@old.com]                                   │
│                                                                 │
│ [Change Email] button                                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                     User clicks
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Modal: "Enter New Email"                                        │
├─────────────────────────────────────────────────────────────────┤
│ [New Email Input: ________________]                             │
│                                                                 │
│ [Cancel]                              [Continue]                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                  Validate email format
                  Check email not in use ← API call here
                           │
                           ▼
           router.push('/auth/verify?purpose=account&email={newEmail}')
```

#### Candidate Contact Email (purpose=candidate-contact)

**Source page:** `/candidates/[id]/profile` (Verified route pattern from 04-candidate-routes.md)

```
┌─────────────────────────────────────────────────────────────────┐
│ /candidates/[id]/profile (Contact section)                      │
├─────────────────────────────────────────────────────────────────┤
│ Contact Email: [user@old.com] [Verify/Change]                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                     User clicks
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Modal: "Enter Contact Email"                                    │
├─────────────────────────────────────────────────────────────────┤
│ This email will be visible to employers on your resume.         │
│                                                                 │
│ [Email Input: ________________]                                 │
│                                                                 │
│ [Cancel]                              [Verify]                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           router.push('/auth/verify?purpose=candidate-contact&email={email}')
```

#### Company Contact Email (purpose=company-contact)

**Source page:** `/companies/[id]/dashboard/settings` (Verified route pattern from 05-company-routes.md Section 6.9)

```
┌─────────────────────────────────────────────────────────────────┐
│ /companies/[id]/dashboard/settings (Contact section)            │
├─────────────────────────────────────────────────────────────────┤
│ Public Contact Email: [hr@company.com] [Change]                 │
│ (This email is shown on job postings)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                     Admin clicks
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Modal: "Update Company Contact Email"                           │
├─────────────────────────────────────────────────────────────────┤
│ [Email Input: ________________]                                 │
│                                                                 │
│ [Cancel]                              [Verify]                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           router.push('/auth/verify?purpose=company-contact&email={email}&entityId={companyId}')
```

### URL Generation Responsibility

| Purpose | Source Page | Responsible Component |
|---------|-------------|----------------------|
| `account` | `/auth/settings` | `AccountEmailChangeModal` |
| `candidate-contact` | `/candidates/[id]/profile` | `ContactEmailSection` |
| `company-contact` | `/companies/[id]/dashboard/settings` | `CompanyContactSettings` |

> **Note:** These source pages are NOT part of AUTH-R03. They are documented here for context only.

---

## 7. UI State Machine

### 7.1 Page States

```
                    ┌─────────────────────┐
                    │   CHECKING_AUTH     │
                    │  (initial load)     │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
               auth failed           auth passed
                    │                     │
                    ▼                     ▼
           ┌─────────────┐    ┌─────────────────────┐
           │ AUTH_ERROR  │    │    SENDING_OTP      │
           │ (show error)│    └──────────┬──────────┘
           └─────────────┘               │
                               OTP sent successfully
                                         │
                                         ▼
                              ┌─────────────────────┐
                   ┌─────────│    ENTER_OTP        │◄────────┐
                   │         │  (show OTP input)   │         │
                   │         └──────────┬──────────┘         │
                   │                    │                    │
              resend click       6 digits entered      clear error
              (if cooldown=0)           │                    │
                   │                    ▼                    │
                   │         ┌─────────────────────┐         │
                   │         │    VERIFYING        │         │
                   │         │  (loading)          │         │
                   │         └──────────┬──────────┘         │
                   │                    │                    │
                   │         ┌──────────┴──────────┐         │
                   │         │                     │         │
                   │      success               error        │
                   │         │                     │         │
                   │         ▼                     ▼         │
                   │  ┌─────────────┐    ┌─────────────────┐ │
                   │  │  UPDATING   │    │     ERROR       │─┘
                   │  │  (saving    │    │  (show message) │
                   │  │   email)    │    └─────────────────┘
                   │  └──────┬──────┘
                   │         │
                   │    update success
                   │         │
                   │         ▼
                   │  ┌─────────────────────┐
                   └──│     SUCCESS         │
                      │  (redirect)         │
                      └─────────────────────┘
```

#### 7.1.1 Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `CHECKING_AUTH` | `SESSION_VALID` | `SENDING_OTP` | all required params present | sendVerificationOTPEmail() |
| `CHECKING_AUTH` | `SESSION_INVALID` | `AUTH_ERROR` | - | setError('session_expired') |
| `CHECKING_AUTH` | `MISSING_PARAMS` | `AUTH_ERROR` | !purpose OR !email | setError('missing_params') |
| `CHECKING_AUTH` | `INVALID_EMAIL` | `AUTH_ERROR` | email format invalid | setError('invalid_email') |
| `SENDING_OTP` | `OTP_SENT` | `ENTER_OTP` | - | setRefCode(), startCooldown() |
| `SENDING_OTP` | `SEND_ERROR` | `AUTH_ERROR` | - | setError() |
| `ENTER_OTP` | `OTP_INPUT` | `ENTER_OTP` | length < 6 | updateOtpValue() |
| `ENTER_OTP` | `OTP_COMPLETE` | `VERIFYING` | length === 6 | verifyOTPCode() |
| `ENTER_OTP` | `RESEND_CLICK` | `SENDING_OTP` | cooldown === 0 | sendVerificationOTPEmail() |
| `VERIFYING` | `OTP_VALID` | `UPDATING` | - | purpose-specific update |
| `VERIFYING` | `OTP_INVALID` | `ERROR` | - | setError(), incrementAttempts() |
| `VERIFYING` | `OTP_EXPIRED` | `ERROR` | - | setError('otp_expired') |
| `UPDATING` | `UPDATE_SUCCESS` | `SUCCESS` | - | - |
| `UPDATING` | `UPDATE_ERROR` | `ERROR` | - | setError() |
| `ERROR` | `CLEAR_ERROR` | `ENTER_OTP` | attempts < maxAttempts | clearError() |
| `ERROR` | `MAX_ATTEMPTS` | `AUTH_ERROR` | attempts >= maxAttempts | - |
| `SUCCESS` | `REDIRECT` | - | - | router.replace(returnUrl) |

### 7.2 Component State Automaton

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| `OTPInput` | `idle` | `FOCUS` | `focused` | - |
| `OTPInput` | `focused` | `INPUT` | `focused` | length < 6 |
| `OTPInput` | `focused` | `COMPLETE` | `complete` | length === 6 |
| `OTPInput` | `complete` | `AUTO_SUBMIT` | `validating` | - |
| `OTPInput` | `validating` | `VALID` | `success` | OTP matches |
| `OTPInput` | `validating` | `INVALID` | `error` | OTP doesn't match |
| `OTPInput` | `error` | `INPUT` | `focused` | user starts typing |
| `ResendButton` | `disabled` | `COOLDOWN_END` | `enabled` | cooldown === 0 |
| `ResendButton` | `enabled` | `CLICK` | `loading` | - |
| `ResendButton` | `loading` | `SENT` | `disabled` | startCooldown() |
| `ResendButton` | `loading` | `ERROR` | `enabled` | - |
| `SubmitButton` | `disabled` | `OTP_COMPLETE` | `enabled` | otpCode.length === 6 |
| `SubmitButton` | `enabled` | `OTP_INCOMPLETE` | `disabled` | otpCode.length < 6 |
| `SubmitButton` | `enabled` | `CLICK` | `loading` | - |
| `SubmitButton` | `loading` | `SUCCESS` | `disabled` | - |
| `SubmitButton` | `loading` | `ERROR` | `enabled` | - |

### 7.3 Entity State Automaton

| Entity | Current State | Event | Next State | Actor | Side Effects |
|--------|---------------|-------|------------|-------|--------------|
| `otp_codes` | `(not exists)` | `SEND_OTP` | `active` | System | create doc, send email |
| `otp_codes` | `active` | `VERIFY_SUCCESS` | `verified` | User | update status |
| `otp_codes` | `active` | `TIMEOUT` | `expired` | System | 15 min expiry |
| `contacts` (purpose=candidate-contact) | `unverified_email` | `VERIFY_SUCCESS` | `verified_email` | User | update email field |
| `contacts` (purpose=company-contact) | `unverified_email` | `VERIFY_SUCCESS` | `verified_email` | User | update email field |
| `candidate_screening` | `emailVerification=false` | `CANDIDATE_VERIFY` | `emailVerification=true` | User | set flag |
| `Firebase Auth` (purpose=account) | `old_email` | `ACCOUNT_VERIFY` | `new_email` | User | updateUser() |
| `user_accounts` (purpose=account) | `old_email` | `ACCOUNT_VERIFY` | `new_email` | User | sync with Firebase |

---

## 7.5 Authentication & Authorization
## 7.5 Authentication & Authorization

### Route Protection

This page requires authentication. Users must have a valid session before accessing.

| Method | Implementation | Behavior |
|--------|----------------|----------|
| Server Component | `authenticateSession()` in page.tsx | Redirect to login if no session |
| Client Fallback | Check `sessionStateAtom` on mount | Redirect if session invalid |

### Page Load Pre-Checks

| # | Check | Condition | Failure Behavior |
|---|-------|-----------|------------------|
| 1 | Session exists | `authenticateSession()` succeeds | Redirect to `/auth/login?redirect={currentUrl}` |
| 2 | Query params valid | `purpose` and `email` present | Show error page |
| 3 | Purpose-specific auth | See table below | Show error page |

### Purpose-Specific Authorization

| Purpose | Required Role | Required Condition | Failure Message |
|---------|---------------|-------------------|-----------------|
| `account` | Any authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| `candidate-contact` | `candidate` | `userAtom.roles.includes('candidate')` | "ต้องเป็นผู้หางานเท่านั้น" |
| `company-contact` | `company` + `admin` | `userAtom.roles.includes('admin') && userAtom.companyId` | "ต้องเป็นผู้ดูแลบริษัทเท่านั้น" |

### OAuth User Restriction

| Auth Method | Can Change Account Email? | Reason |
|-------------|---------------------------|--------|
| Email/Password | ✅ Yes | Standard flow |
| Google OAuth | ❌ No | Email managed by Google |

**Detection:** Check `firebaseUser.providerData[0].providerId`
- `password` → Allow account email change
- `google.com` → Block with message: "บัญชีนี้ใช้ Google เข้าสู่ระบบ ไม่สามารถเปลี่ยนอีเมลได้"

### Session Expiry During Flow

**Source:** AUTH-010, AUTH-011

| Event | Behavior | User Experience |
|-------|----------|-----------------|
| Session expires during OTP entry | `sessionStateAtom` changes to `'expired'` | Redirect to `/auth/session-expired` |
| Session expires during update | Server action fails with auth error | Show error, redirect to login |
| Return after re-login | URL preserved via `?redirect` param | Resume from beginning (OTP re-sent) |

**Session Duration:** 1 hour with activity-based renewal (AUTH-010)

### Authorization Check Flow

```
┌─────────────────────┐
│   Page Request      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ authenticateSession │
│   (server-side)     │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
  no session   session valid
     │           │
     ▼           ▼
┌─────────┐  ┌─────────────────────┐
│Redirect │  │ Parse query params  │
│to login │  └──────────┬──────────┘
└─────────┘             │
                  ┌─────┴─────┐
                  │           │
            params invalid  params valid
                  │           │
                  ▼           ▼
           ┌─────────┐  ┌─────────────────────┐
           │ Error   │  │ Check purpose-      │
           │ Page    │  │ specific auth       │
           └─────────┘  └──────────┬──────────┘
                                   │
                        ┌──────────┼──────────┐
                        │          │          │
                    unauthorized  OAuth+account  authorized
                        │          │          │
                        ▼          ▼          ▼
                   ┌─────────┐ ┌─────────┐ ┌─────────────┐
                   │ Error   │ │ Error   │ │ Send OTP    │
                   │ Page    │ │ OAuth   │ │ (continue)  │
                   └─────────┘ └─────────┘ └─────────────┘
```

---

## 8. Component-Action Wiring

### 8.1 Page Load Sequence

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Page request | `authenticateSession()` (server) | Check session |
| 2 | No session | Redirect to `/auth/login?redirect={currentUrl}` | Exit |
| 3 | Session valid | Load user data, parse query params | Continue |
| 4 | Missing `purpose` | `setPageState('AUTH_ERROR')`, show error | Exit |
| 5 | Missing `email` | `setPageState('AUTH_ERROR')`, show error | Exit |
| 6 | Invalid `email` format | `setPageState('AUTH_ERROR')`, show error | Exit |
| 7 | `purpose=account` | Check if OAuth user | Gate |
| 8 | OAuth user + account | `setError('OAUTH_ACCOUNT')`, show error | Exit |
| 9 | `purpose=candidate-contact` | Check `roles.includes('candidate')` | Gate |
| 10 | Not candidate | `setError('ROLE_UNAUTHORIZED')`, show error | Exit |
| 11 | `purpose=company-contact` | Check `roles.includes('admin') && companyId` | Gate |
| 12 | Not company admin | `setError('ROLE_UNAUTHORIZED')`, show error | Exit |
| 13 | `purpose=company-contact` | Check `entityId === session.companyId` | Gate |
| 14 | Entity mismatch | `setError('UNAUTHORIZED_ENTITY')`, show error | Exit |
| 15 | All checks pass | `sendVerificationOTPEmail(email)` | Send OTP |
| 16 | OTP sent | Store `refCode`, start cooldown | Show OTP input |
| 17 | OTP send failed | `setError('OTP_SEND_FAILED')` | Show retry |

### 8.2 OTP Verification Sequence

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | OTP input | Update `otpCode` state | Track input |
| 2 | 6 digits complete | Auto-submit `verifyOTPCode(refCode, otpCode)` | Verify OTP |
| 3 | OTP valid | Call purpose-specific update | See 8.3 / 8.4 / 8.5 |
| 4 | OTP invalid | `setError('OTP_INVALID')` | Show error, clear input |
| 5 | OTP expired | `setError('OTP_EXPIRED')` | Show error + resend prompt |

### 8.3 Account Email Update Sequence (purpose=account)

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | OTP verified | Check email not already in use | Gate |
| 2 | Email in use | `setError('EMAIL_IN_USE')` | Show error, cannot proceed |
| 3 | Email available | `updateAccountEmail(newEmail)` | Server action |
| 4 | Server | `getFirebaseAdminAuth().updateUser(uid, { email })` | Update Firebase Auth |
| 5 | Server | Update `user_accounts.email` | Update Firestore |
| 6 | Success | Invalidate SWR `user-data-${uid}` | Refresh user data |
| 7 | Success | `setPageState('SUCCESS')` | Show success |
| 8 | Success | Auto-redirect after 2s OR button click | Navigate to redirect URL |

**Email-in-use check:** This check happens AFTER OTP verification to prevent email enumeration attacks. The check is done server-side in the `updateAccountEmail` action.

### 8.4 Candidate Contact Email Update Sequence (purpose=candidate-contact)

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | OTP verified | `updateCandidateContactEmail(newEmail)` | Server action |
| 2 | Server | Update `contacts.email` where uid = session.uid | Update Firestore |
| 3 | Server | Set `candidate_screening.emailVerification = true` | Mark verified |
| 4 | Success | Invalidate SWR `candidate-${uid}` | Refresh candidate data |
| 5 | Success | `setPageState('SUCCESS')` | Show success |
| 6 | Success | Auto-redirect after 2s OR button click | Navigate to redirect URL |

### 8.5 Company Contact Email Update Sequence (purpose=company-contact)

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | OTP verified | `updateCompanyContactEmail(entityId, newEmail)` | Server action |
| 2 | Server | Verify `session.companyId === entityId` | Authorization check |
| 3 | Server | Verify `session.roles.includes('admin')` | Role check |
| 4 | Server | Update `contacts.email` where uid = entityId | Update Firestore |
| 5 | Success | Invalidate SWR `company-${entityId}` | Refresh company data |
| 6 | Success | `setPageState('SUCCESS')` | Show success |
| 7 | Success | Auto-redirect after 2s OR button click | Navigate to redirect URL |

### 8.6 Resend OTP Sequence

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Resend click | Check `resendCooldown === 0` | Gate |
| 2 | Cooldown done | `sendVerificationOTPEmail(email)` | Send new OTP |
| 3 | OTP sent | Store new `refCode` | Update state |
| 4 | OTP sent | Reset cooldown (60s) | Restart timer |
| 5 | OTP sent | Clear previous error | Reset error state |

---

## 9. Error Handling

### 9.0 Authentication & Authorization Errors

| Error | Code | Thai Message | Display | Recovery |
|-------|------|--------------|---------|----------|
| No session | `NO_SESSION` | กรุณาเข้าสู่ระบบ | Redirect | → /auth/login |
| Session expired | `SESSION_EXPIRED` | เซสชันหมดอายุ | Redirect | → /auth/session-expired |
| OAuth account | `OAUTH_ACCOUNT` | บัญชีนี้ใช้ Google เข้าสู่ระบบ ไม่สามารถเปลี่ยนอีเมลได้ | Full page error | Back to settings |
| Role unauthorized | `ROLE_UNAUTHORIZED` | ไม่มีสิทธิ์เข้าถึง | Full page error | Back |
| Entity unauthorized | `UNAUTHORIZED_ENTITY` | ไม่มีสิทธิ์แก้ไขข้อมูลนี้ | Full page error | Back |
| Missing entity ID | `MISSING_ENTITY_ID` | ไม่พบข้อมูลที่ต้องการแก้ไข | Full page error | Back |

**OAuth Account Error Flow:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Page load | Check `firebaseUser.providerData[0].providerId` | Detect auth method |
| 2 | Provider is `google.com` AND `purpose=account` | `setError('OAUTH_ACCOUNT')` | Show error |
| 3 | Display | Show message + "กลับไปหน้าตั้งค่า" button | Allow exit |
| 4 | User clicks back | `router.push('/auth/settings')` | Navigate |

### 9.1 Validation Errors

| Error | Code | Thai Message | Display | Recovery |
|-------|------|--------------|---------|----------|
| Missing purpose | `MISSING_PURPOSE` | ไม่พบประเภทการยืนยัน | Full page error | Back to previous page |
| Missing email | `MISSING_EMAIL` | ไม่พบอีเมลที่ต้องการยืนยัน | Full page error | Back to previous page |
| Invalid email | `INVALID_EMAIL` | รูปแบบอีเมลไม่ถูกต้อง | Full page error | Back to previous page |
| Invalid purpose | `INVALID_PURPOSE` | ประเภทการยืนยันไม่ถูกต้อง | Full page error | Back to previous page |
| Missing entity ID | `MISSING_ENTITY_ID` | ไม่พบข้อมูลที่ต้องการแก้ไข | Full page error | Back to previous page |
| Invalid redirect | (silently ignored) | - | - | Use default redirect |

### 9.2 OTP Errors

**Source:** AUTH-017, AUTH-004

| Error | Code | Thai Message | Display | Recovery |
|-------|------|--------------|---------|----------|
| OTP invalid | `OTP_INVALID` | รหัส OTP ไม่ถูกต้อง | Below OTP input | Clear input, retry |
| OTP expired | `OTP_EXPIRED` | รหัส OTP หมดอายุ | Below OTP + resend | Click resend |
| OTP rate limited | `OTP_RATE_LIMITED` | ส่ง OTP มากเกินไป ลองใหม่ใน X นาที | Toast + countdown | Wait |
| OTP send failed | `OTP_SEND_FAILED` | ไม่สามารถส่งรหัส OTP ได้ | Toast | Retry |

**OTP Configuration (Verified):**
- Rate limit: 10 requests per 15 minutes (IP+email based) - AUTH-004 line 319
- OTP expiry: 15 minutes - AUTH-017 line 1130
- OTP length: 6 digits - AUTH-017 line 1136

### 9.3 Update Errors

| Error | Code | Thai Message | Display | Recovery |
|-------|------|--------------|---------|----------|
| Email in use | `EMAIL_IN_USE` | อีเมลนี้ถูกใช้งานแล้ว | Modal | Use different email |
| Update failed | `UPDATE_FAILED` | ไม่สามารถอัปเดตอีเมลได้ | Toast | Contact support |
| Network error | `NETWORK_ERROR` | เชื่อมต่อไม่สำเร็จ | Toast | Retry |

### 9.4 Error Recovery Sequences

**OTP Invalid Recovery:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | OTP verification fails | `setError('OTP_INVALID')` | Show error |
| 2 | (immediate) | Clear OTP input | Reset to empty |
| 3 | (immediate) | Focus OTP input | Ready for retry |
| 4 | User enters new code | Re-validate | Try again |

**OTP Expired Recovery:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | OTP verification fails (expired) | `setError('OTP_EXPIRED')` | Show error |
| 2 | (immediate) | Show "ส่งรหัสใหม่" button | Prompt resend |
| 3 | User clicks resend | `sendVerificationOTPEmail(email)` | Send new OTP |
| 4 | OTP sent | Clear error, store new refCode | Ready for input |

---

## 10. UI Components (Redesigned)

### 10.1 Layout

| Component | Purpose | Position | Responsive | Notes |
|-----------|---------|----------|------------|-------|
| **Verification Card** | Container | Center, max 400px | Full-width mobile | - |
| ↳ Back Button | Return to source | Top-left | - | ← icon, goes to source page |
| ↳ Icon | Visual | Top, centered | - | ✉️ email icon |
| ↳ Title | Status message | Center | - | "ยืนยันอีเมล" |
| ↳ Email Display | Show target email | Center | - | Full email shown |
| ↳ Context Text | Purpose explanation | Below email | - | See table below |
| ↳ Description | Instructions | Center | - | "กรอกรหัส 6 หลักที่ส่งไปยังอีเมลของคุณ" |
| ↳ OTP Input | 6-digit input | Center | - | 6 separate boxes |
| ↳ Error Message | Error display | Below OTP | - | Red text |
| ↳ Resend Section | Resend option | Below error | - | - |
| ↳↳ Countdown | Time remaining | - | - | "ส่งรหัสใหม่ใน 0:45" |
| ↳↳ Resend Link | Resend action | - | - | "ส่งรหัสใหม่" (when cooldown=0) |

### Context Text by Purpose

| Purpose | Context Text |
|---------|--------------|
| `account` | "เปลี่ยนอีเมลสำหรับเข้าสู่ระบบเป็น:" |
| `candidate-contact` | "ยืนยันอีเมลติดต่อในเรซูเม่:" |
| `company-contact` | "ยืนยันอีเมลติดต่อบริษัท:" |

### Back Button Destinations (Verified Route Patterns)

| Purpose | Destination | Source |
|---------|-------------|--------|
| `account` | `/auth/settings` | - |
| `candidate-contact` | `/candidates/[id]/profile` | 04-candidate-routes.md |
| `company-contact` | `/companies/[id]/dashboard/settings` | 05-company-routes.md |
| Error states | `router.back()` or source page | - |

### 10.2 Success State

| Component | Purpose | Position | Action |
|-----------|---------|----------|--------|
| Success Icon | ✓ checkmark | Top, centered | - |
| Title | "ยืนยันอีเมลสำเร็จ" | Center | - |
| Description | Purpose-specific | Center | - |
| Continue Button | Navigate | Full-width | Redirect |

### 10.3 Error State (Full Page)

| Component | Purpose | Position | Action |
|-----------|---------|----------|--------|
| Error Icon | ✗ or ⚠️ | Top, centered | - |
| Title | Error title | Center | - |
| Description | Error explanation | Center | - |
| Back Button | Return | Full-width | Navigate back |

---

## 11. Implementation Checklist

### Phase 0: Authentication & Authorization (P0)

- [ ] Server-side session check (`authenticateSession()`)
- [ ] Redirect to login if no session (preserve return URL)
- [ ] Query parameter validation (purpose, email, entityId)
- [ ] Purpose-specific role checks
  - [ ] `account`: Any authenticated user
  - [ ] `candidate-contact`: Must have `candidate` role
  - [ ] `company-contact`: Must have `admin` role + matching companyId
- [ ] OAuth user detection and blocking for `purpose=account`
- [ ] Entity ID validation for `company-contact`
- [ ] Session expiry handling (redirect to /auth/session-expired)

### Phase 1: Core OTP Verification (P0)

- [ ] Page component setup (`app/auth/verify/page.tsx`)
- [ ] OTP input component (6-digit, auto-advance, paste support)
- [ ] Auto-send OTP on page load (after auth checks pass)
- [ ] OTP verification via `verifyOTPCode()`
- [ ] Resend with cooldown timer (60 seconds)
- [ ] Error handling (invalid, expired, rate limited)
- [ ] Loading states

### Phase 2: Email Update Actions (P0)

- [ ] Server action: `updateAccountEmail(newEmail)`
  - [ ] Email-in-use check (AFTER OTP verified)
  - [ ] Call `getFirebaseAdminAuth().updateUser()`
  - [ ] Update `user_accounts.email`
- [ ] Server action: `updateCandidateContactEmail(newEmail)`
  - [ ] Update `contacts.email` where uid = session.uid
  - [ ] Set `candidate_screening.emailVerification = true`
- [ ] Server action: `updateCompanyContactEmail(entityId, newEmail)`
  - [ ] Verify session.companyId === entityId
  - [ ] Verify session.roles.includes('admin')
  - [ ] Update `contacts.email` where uid = entityId
- [ ] SWR cache invalidation for all purposes
- [ ] Redirect logic with sanitization

### Phase 3: UI Polish (P1)

- [ ] Success state with checkmark animation
- [ ] Error state full page (auth errors, validation errors)
- [ ] Back button with correct destinations
- [ ] Context text by purpose
- [ ] Countdown timer display (MM:SS format)
- [ ] Thai language strings

### Phase 4: Security (P1)

- [ ] Redirect URL sanitization (relative paths only)
- [ ] Session expiry mid-flow handling
- [ ] Leverage existing OTP rate limiting (10/15min, IP+email based)

### Phase 5: Audit Logging (P2) - DEFERRED TO FUTURE VERSION

- [ ] ~~Determine audit logging strategy for email changes~~ (Deferred - not in old system)
- [ ] ~~`activity_logs` is candidate_screening subcollection only - may need separate mechanism~~ (Deferred)

### Phase 6: Testing

- [ ] Unit tests: Query parameter validation
- [ ] Unit tests: Authorization checks
- [ ] Unit tests: OAuth detection
- [ ] Unit tests: OTP verification flow
- [ ] Integration tests: Server actions
- [ ] E2E tests: Full verification flow (all 3 purposes)
- [ ] E2E tests: Error states
- [ ] E2E tests: OAuth user blocked for account change
- [ ] E2E tests: Session expiry during flow
- [ ] Security tests: IDOR prevention
- [ ] Accessibility audit

---

## 12. Decisions Log

| Decision | Chosen | Rationale | Date | Source |
|----------|--------|-----------|------|--------|
| OTP instead of email link | OTP (SendGrid) | Cost savings, consistency with registration | 2025-12-07 | AUTH-004 |
| Multi-purpose page | Yes (account + contact) | Reusable verification chain | 2025-12-07 | - |
| Firebase Admin SDK | `updateUser()` | Only way to update email server-side | 2025-12-07 | - |
| Auto-submit on 6 digits | Yes | Better UX, reduces clicks | 2025-12-07 | - |
| Resend cooldown | 60 seconds | Industry standard UX, product confirmed | 2025-12-07 | - |
| OTP expiry | 15 minutes | Match existing OTP system | 2025-12-07 | AUTH-017 |
| OAuth email change | Block for OAuth users | Firebase Auth email is managed by OAuth provider, cannot be changed | 2025-12-07 | - |
| Contact email collection | Use `contacts` collection | Separate from user_accounts, shared structure for candidates and companies | 2025-12-07 | data-entities_contacts.md, COMP-003 |
| Email-in-use check timing | After OTP verification | Prevents email enumeration attacks via timing | 2025-12-07 | - |
| Redirect validation | Relative paths only | Prevents open redirect vulnerability | 2025-12-07 | - |
| Purpose split | `candidate-contact` vs `company-contact` | Different authorization rules and target collections | 2025-12-07 | - |
| Entity ID for company | Required in query param | Company contact uses companyId, not userId | 2025-12-07 | COMP-003 |
| Route patterns | `/[id]` not `/me` | Match existing route patterns | 2025-12-07 | 04-candidate-routes.md, 05-company-routes.md |
| Audit logging | Skip for v1 | activity_logs not in old system, defer to future | 2025-12-07 | - |

---

## 13. Related Routes

| Route | Relationship | Source |
|-------|--------------|--------|
| `/auth/settings` | Entry point for account email change | - |
| `/candidates/[id]/profile` | Entry point for candidate contact email change | 04-candidate-routes.md |
| `/companies/[id]/dashboard/settings` | Entry point for company contact email change | 05-company-routes.md |
| `/auth/login` | Redirect if no session | - |
| `/auth/session-expired` | Redirect if session expires | AUTH-011 |
| `/auth/register` | Uses same OTP system | AUTH-004 |

---

## 14. Future Extensibility

This verification page is designed to support additional email verification scenarios:

| Future Purpose | Collection | Notes |
|----------------|------------|-------|
| `job-contact` | `contacts` (per application) | Per-application contact email |
| `invoice-email` | TBD | Billing email |

To add a new purpose:
1. Add to `purpose` enum in query params
2. Add authorization check in Section 7.5
3. Create corresponding `update{Purpose}Email()` server action
4. Add redirect logic in success handler

---

## 15. Open Questions (All Resolved)

| # | Question | Resolution | Decided By |
|---|----------|------------|------------|
| OQ-1 | Resend cooldown duration | **60 seconds** - industry standard UX | Product decision |
| OQ-2 | `sendVerificationOTPEmail()` return type | Check actual signature during implementation | Deferred to impl |
| OQ-3 | Audit logging for email changes | **Skip for v1** - `activity_logs` not implemented in old system | Product decision |
| OQ-4 | `activity_logs` appropriateness | **N/A** - audit logging deferred | Product decision |
| OQ-5 | Page-level rate limiting | **Not needed** - OTP rate limit sufficient | Product decision |

---

## Appendix A: TypeScript Types

```typescript
// Query parameters
interface VerifyQueryParams {
  purpose: 'account' | 'candidate-contact' | 'company-contact';
  email: string;
  entityId?: string;  // Required for company-contact
  redirect?: string;
}

// Page state
type PageState =
  | 'CHECKING_AUTH'    // Initial auth check
  | 'AUTH_ERROR'       // Auth/authz failed
  | 'SENDING_OTP'
  | 'ENTER_OTP'
  | 'VERIFYING'
  | 'UPDATING'
  | 'SUCCESS'
  | 'ERROR';

// Error types
type VerifyErrorCode =
  // Auth errors
  | 'NO_SESSION'
  | 'SESSION_EXPIRED'
  | 'OAUTH_ACCOUNT'
  | 'ROLE_UNAUTHORIZED'
  | 'UNAUTHORIZED_ENTITY'
  // Validation errors
  | 'MISSING_PURPOSE'
  | 'MISSING_EMAIL'
  | 'MISSING_ENTITY_ID'
  | 'INVALID_EMAIL'
  | 'INVALID_PURPOSE'
  // OTP errors
  | 'OTP_INVALID'
  | 'OTP_EXPIRED'
  | 'OTP_RATE_LIMITED'
  | 'OTP_SEND_FAILED'
  // Update errors
  | 'EMAIL_IN_USE'
  | 'UPDATE_FAILED'
  | 'NETWORK_ERROR';

interface VerifyError {
  code: VerifyErrorCode;
  message: string;
  recoveryAction?: 'retry' | 'resend' | 'back' | 'wait' | 'login' | 'contact_support';
  countdown?: number;
}

// OTP state (based on AUTH-017)
interface OTPState {
  refCode: string;        // 10 chars per AUTH-017
  email: string;
  sentAt: number;
  expiresAt: number;      // sentAt + 15 minutes
}

// Auth check result
interface AuthCheckResult {
  authorized: boolean;
  error?: VerifyErrorCode;
  user?: {
    uid: string;
    email: string;
    roles: string[];
    companyId?: string;
    authProvider: 'password' | 'google.com' | string;
  };
}
```

---

## Appendix B: Server Actions

```typescript
// ===== Reused from existing system (AUTH-004, AUTH-017) =====

/**
 * Send OTP verification email
 * Source: AUTH-004
 */
async function sendVerificationOTPEmail(email: string): Promise<{
  success: boolean;
  refCode?: string;
  error?: string;
}>;

/**
 * Verify OTP code
 * Source: AUTH-017
 * 
 * Response codes:
 * - 200: Success
 * - 403: Not found / Already used / Expired
 * - 429: Rate limited
 */
async function verifyOTPCode(refCode: string, otpCode: string): Promise<{
  code: number;
  message: string;
}>;

// ===== New server actions =====

/**
 * Update account email (Firebase Auth + user_accounts)
 * Only for email/password users, not OAuth
 */
async function updateAccountEmail(newEmail: string): Promise<{
  success: boolean;
  error?: VerifyErrorCode;
}> {
  return withServerActionAuth(async (session) => {
    // 1. Check not OAuth user
    const firebaseUser = await getFirebaseAdminAuth().getUser(session.uid);
    const provider = firebaseUser.providerData[0]?.providerId;
    if (provider !== 'password') {
      return { success: false, error: 'OAUTH_ACCOUNT' };
    }
    
    // 2. Check email not in use (after OTP to prevent enumeration)
    const existing = await checkIfEmailExisted(newEmail);
    if (existing.exists) {
      return { success: false, error: 'EMAIL_IN_USE' };
    }
    
    // 3. Update Firebase Auth
    await getFirebaseAdminAuth().updateUser(session.uid, { email: newEmail });
    
    // 4. Update user_accounts
    await userAccountsRepository.update(session.uid, { email: newEmail });
    
    // Note: Audit logging deferred to future version (v1 decision)
    
    return { success: true };
  });
}

/**
 * Update candidate contact email
 * Updates contacts collection where uid = session.uid
 * Source: contacts collection verified in data-entities_contacts.md
 */
async function updateCandidateContactEmail(newEmail: string): Promise<{
  success: boolean;
  error?: VerifyErrorCode;
}> {
  return withServerActionAuth(async (session) => {
    // 1. Verify candidate role
    if (!session.roles.includes('candidate')) {
      return { success: false, error: 'ROLE_UNAUTHORIZED' };
    }
    
    // 2. Update contacts collection (uid = user UID)
    await contactsRepository.update(session.uid, { email: newEmail });
    
    // 3. Update verification flag (verified field name: data-entities_candidate-screening.md)
    await candidateScreeningRepository.update(session.uid, { 
      emailVerification: true 
    });
    
    return { success: true };
  });
}

/**
 * Update company contact email
 * Updates contacts collection where uid = companyId
 * Requires admin role for the target company
 * Source: COMP-003 creates contact doc for company
 */
async function updateCompanyContactEmail(
  companyId: string, 
  newEmail: string
): Promise<{
  success: boolean;
  error?: VerifyErrorCode;
}> {
  return withServerActionAuth(async (session) => {
    // 1. Verify admin role
    if (!session.roles.includes('admin')) {
      return { success: false, error: 'ROLE_UNAUTHORIZED' };
    }
    
    // 2. Verify company ownership
    if (session.companyId !== companyId) {
      return { success: false, error: 'UNAUTHORIZED_ENTITY' };
    }
    
    // 3. Update contacts collection (uid = company UID)
    await contactsRepository.update(companyId, { email: newEmail });
    
    return { success: true };
  });
}
```

---

## Appendix C: OTP Input Component Spec

```typescript
interface OTPInputProps {
  length: 6;  // Verified: AUTH-017
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

// Behavior:
// - 6 individual input boxes
// - Auto-focus first box on mount
// - Auto-advance on digit entry
// - Backspace moves to previous box
// - Paste support (paste 6 digits)
// - onComplete fires when 6 digits entered
// - error state shows red border
// - disabled state grays out inputs

// Accessibility:
// - aria-label="Enter verification code"
// - Each input: aria-label="Digit {n} of 6"
// - Error state: aria-invalid="true", aria-describedby pointing to error message
// - Keyboard navigable (Tab between digits)
```

---

## Appendix D: Research Sources

| Document | Used For |
|----------|----------|
| features_authentication.md | AUTH-004, AUTH-005, AUTH-010, AUTH-011, AUTH-017 |
| features_companies.md | COMP-003 (company creation creates contact) |
| data-entities_contacts.md | contacts collection schema |
| data-entities_candidate-screening.md | emailVerification field |
| data-entities_activity-logs.md | Audit logging (subcollection of candidate_screening) |
| 04-candidate-routes.md | Candidate route patterns |
| 05-company-routes.md | Company route patterns |

---

*End of RIS: /auth/verify (AUTH-R03) v1.5*
