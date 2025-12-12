# RIS: /auth/register

**Route ID:** AUTH-R02  
**Version:** 1.6  
**Status:** Draft  
**Created:** 2025-12-07  
**Last Updated:** 2025-12-09

**Changes in v1.6:**
- Added Cross-References section linking to AUTH-R00 shared patterns

**Changes in v1.5:**
- Added Section 6.1.2 Candidate Flow State Transition Table (5-column format per RIS_ORCHESTRATOR_GUIDE.md)
- Added Section 6.2.2 Company Flow State Transition Table (5-column format)
- Replaced Section 6.3 Component States with Component State Automaton (5-column format)
- Added Section 6.4 Entity State Automaton

**Changes in v1.4:**
- Fixed platform routes: /admin/dashboard → /platform/dashboard (3 occurrences)

---

## Cross-References

This document references shared specifications from **AUTH-R00_cross-cutting_RIS.md**.

| Topic | AUTH-R00 Section |
|-------|------------------|
| Server actions architecture | Section 1 |
| Error UX standards | Section 2 |
| Session management | Section 3 |
| Global atoms | Section 4 |
| Rate limiting (OTP) | Section 5 |
| i18n & Thai copy guidelines | Section 6 |
| Analytics events | Section 7 |
| **OTP system (policy, collection, endpoints)** | **Section 8** |
| Role semantics | Section 9 |
| **Wallet integration (signup bonus, referral)** | **Section 10** |
| File upload standards | Section 11 |
| Query parameter conventions | Section 12 |
| Error code → message mapping | Appendix A |
| Thai copy reference | Appendix B |
| Server action signatures | Appendix C |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/auth/register` |
| Shell | Minimal Shell |
| Purpose | User self-registration with role selection (Candidate or Company) |
| Complexity | High (multi-step wizard, two divergent flows, OTP verification) |
| Phase | 1 (Foundation) |
| UI Spec | `03-auth-routes.md` Section 4.2 |

---

## 2. Domain Classification

### Primary Domain: Authentication

- **Owns:** User account creation, OTP verification, session creation
- **Mutations:**
  - Send OTP email (`sendVerificationOTPEmail()`)
  - Verify OTP (`verifyOTPCode()`)
  - Create Firebase Auth user (email/password or Google OAuth)
  - Create `user_accounts` document
  - Create `user_info` document
  - Create session cookie (`login()`)
  - Log PDPA consent

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Candidate | Profile creation (Google OAuth) | Write `candidate_information` on success |
| Company | Request creation | Write `company_requests` on step 2 (Mode A) |
| Wallet | Initial balance | Write `pockets`, `wallet_transactions` (100 coins signup bonus) |

> **Source:** data-entities_data-entity-references.md - Collection names verified against schema

### Global Domains

| Domain | Requirement |
|--------|-------------|
| Auth | This route IS the auth entry point |
| Chat | Not available (pre-auth / pending) |
| Notifications | Not available (pre-auth / pending) |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Old Route | Coverage | Notes |
|------------|--------------|-----------|----------|-------|
| AUTH-004 | Company Registration with OTP | `/auth/register` | Full | 4-step wizard: Email → OTP → Password → Company Details |
| AUTH-005 | Email Verification | `/auth/email/verification` | Partial | OTP replaces Firebase email link for new design |
| AUTH-014 | Company Account Creation | `/auth/register/create-account` | Full | Merged into step 2 - Mode A (create new company) |
| AUTH-017 | OTP Verification | Backend API | Full | `verifyOTPCode()` server action |
| AUTH-001 | Social Login (Google) | `/auth/social` | Partial | Candidate-only, creates account + redirects |
| CAND-014 | Process Referral Code | Registration dialog | Full | Preserve `?refCode` parameter |
| CAND-015 | Generate Referral Link | Auto on account creation | Full | Auto-generate on candidate creation |
| **COMP-018** | **Apply to Join Company** | `/auth/register/create-account` | **Full** | **Step 2 - Mode B (join existing company via search)** |

### Deprecated Features

| Feature | Old Route | Reason | Future |
|---------|-----------|--------|--------|
| Facebook OAuth | `/auth/social` | Meta approval pending | Re-enable when approved |
| Firebase Email Link | `/auth/email/verification` | SendGrid OTP is cheaper | N/A |

### New Features (Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| Unified Registration | Merge candidate + company flows | P0 |
| Role Selection UI | Visual cards for role choice | P0 |
| Existing Account Detection | Check email on blur, show options | P0 |
| **Company Mode Toggle** | **Toggle between create new / join existing company** | **P0** |
| Add Role Flow | Existing user adding different role | P1 |
| Step Indicator | Progress visualization | P0 |

### Future Features (Stub Only)

| Feature | Description | Stub Behavior |
|---------|-------------|---------------|
| Employer Terms Tracking | Track acceptance of employer-specific terms separately | Log with general terms (single timestamp) |
| Facebook OAuth | Social login for candidates | Button hidden |
| **Company Invitation Link** | **Company generates link for staff to join directly** | **Not implemented, Mode B covers use case** |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition |
|------|------------|--------|-----------|
| Email Existence | Firebase Auth | - | On email blur, via `checkIfEmailExisted()` |
| User Account (existing) | `user_accounts` | `uid`, `roles`, `companyId` | If email exists in Firebase |
| Industry Master Data | `master_job_industries` | `id`, `name` | Company step 2, dropdown |
| OTP Code | `otp_codes` | `email`, `otp_code`, `ref_code`, `status`, `create_date` | OTP verification |
| **Company Search (Mode B)** | `company_information` | `uid`, `company_name`, `company_name_en`, `company_logo`, `industry` | **Step 2 Mode B, searchable dropdown (approved companies only)** |

### 4.2 Write Operations

| Action | Collection | Server Action | Trigger |
|--------|------------|---------------|---------|
| Send OTP | `otp_codes` | `sendVerificationOTPEmail(email)` | Email submit (step 1) |
| Invalidate Old OTPs | `otp_codes` | `sendVerificationOTPEmail()` | Sets old OTPs status="invalidated" |
| Verify OTP | `otp_codes` | `verifyOTPCode(refCode, otpCode)` | OTP submit |
| Create Firebase User | Firebase Auth | Client SDK `createUserWithEmailAndPassword()` | After OTP verified |
| Create User Account | `user_accounts` | `UserAccountSet()` | After Firebase user created |
| Create User Info | `user_info` | Auto via account creation | After Firebase user created |
| Create Session | Cookie | `login(idToken)` | After account created |
| Create Candidate Profile | `candidate_information` | `createCandidateAccount()` (CAND-001) | Candidate Google OAuth |
| **Mode A: Create Company Request** | `company_information` | `CreateNewCompany()` | Company step 2 submit (Mode A) |
| **Mode A: Upload Company Doc** | Firebase Storage | `companyProfile/{uid}/{filename}` | Company step 2 (Mode A) |
| **Mode B: Set Target Company** | `user_accounts.transfer` | `StaffRequestApply()` | Company step 2 submit (Mode B) |
| **Mode B: Upload Name Card** | Firebase Storage | `nameCards/{uid}/{filename}` | Company step 2 (Mode B) |
| Award Signup Bonus | `pockets`, `wallet_transactions` | Via CAND-001 → WALLET-003/004 | Candidate account creation |
| Process Referral | `candidate_referral` | `processCandidateReferral()` | If `?refCode` present |

> **Source:** data-entities_data-entity-references.md, features_candidates.md (CAND-001), features_companies.md (COMP-003, COMP-018)

#### Company Registration Mode Comparison

| Aspect | Mode A (Create New) | Mode B (Join Existing) |
|--------|---------------------|------------------------|
| Collection | `company_information` | `user_accounts.transfer` |
| Server Action | `CreateNewCompany()` | `StaffRequestApply()` |
| Upload | Company registration doc | Name card image |
| Storage Path | `companyProfile/{uid}/` | `nameCards/{uid}/` |
| Roles Assigned | `['company', 'admin', 'pending']` | `['candidate', 'pending']` |
| Approver | Platform Admin (chancedee) | Company Admin |
| Status Route | `/auth/status?type=company-pending` | `/auth/status?type=staff-pending` |

> **Source:** features_companies.md (COMP-003, COMP-018)

### 4.3 Firebase Auth Operations

| Operation | Method | Trigger |
|-----------|--------|---------|
| Google Sign In | `signInWithPopup(GoogleAuthProvider)` | Candidate Google button |
| Create User | `createUserWithEmailAndPassword()` | After OTP verified (email flow) |
| Get ID Token | `getIdToken()` | After sign-in/create success |

### 4.4 Email Operations

| Email | Template | Trigger |
|-------|----------|---------|
| OTP Verification | SendGrid `d-49496573d0954f62a25110c564ad89d3` | Email submit |

### 4.5 Account Creation Payloads

> **Source:** features_authentication.md (AUTH-001, AUTH-002, AUTH-004), features_candidates.md (CAND-001), features_companies.md (COMP-003, COMP-018), data-entities_user-info.md

#### 4.5.1 Candidate - Google OAuth

**Server Action:** `createCandidateAccount()` (via CAND-001 trigger)

**`user_accounts` document:**
```typescript
{
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  phone_number: firebaseUser.phoneNumber || null,
  roles: ['candidate'],                     // Simple candidate role
  company_id: null,
  is_active: true,
  is_policy_accepted: true,                 // Terms accepted via UI
  created_by: firebaseUser.uid,
  updated_by: firebaseUser.uid,
  created_at: serverTimestamp(),
  updated_at: serverTimestamp()
}
```

**`user_info` document:** (auto-created)
```typescript
{
  uid: firebaseUser.uid,
  roles: ['candidate'],
  company_id: null,
  current_step: 1,
  current_step_name: 'identity-photo',
  is_verified: true,                        // Google email is pre-verified
  is_preference_set: false,
  is_first_applicantion_rewarded: false,    // Note: typo preserved from old system
  is_first_interviewer_rewarded: false,
  is_new_user_rewarded: false,
  is_onboarded: false,                      // Triggers onboarding flow
  is_resume_completed: false,
  created_by: firebaseUser.uid,
  updated_by: firebaseUser.uid,
  created_at: serverTimestamp(),
  updated_at: serverTimestamp()
}
```

**`candidate_information` document:**
```typescript
{
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  phone_number: null,
  first_name_th: extractFromGoogleName?.firstName || '',
  last_name_th: extractFromGoogleName?.lastName || '',
  nick_name_th: '',
  avatar_url: firebaseUser.photoURL || null,
  is_active: true,
  is_searchable: false,                     // Starts private
  is_onboarded: false,
  is_preference_set: false,
  is_resume_completed: false,
  referral: {
    refer_code: generateReferralCode(6),    // Auto-generated 6-char code
    refer_link: `${baseUrl}/auth/register?refCode={code}`,
    refer_by: null,
    referred_list: []
  },
  // ... other empty fields for profile completion
  created_by: firebaseUser.uid,
  updated_by: firebaseUser.uid,
  created_at: serverTimestamp(),
  updated_at: serverTimestamp()
}
```

#### 4.5.2 Candidate - Email/Password

**Same as Google OAuth EXCEPT:**
- `is_verified: false` (must verify email via Firebase)
- `avatar_url: null` (no Google profile pic)
- Name fields empty (user fills during onboarding)

#### 4.5.3 Company - Mode A (Create New Company)

**Server Action:** `CreateNewCompany()` then `requestTransferCompanyAccount()`

**`user_accounts` document:**
```typescript
{
  uid: firebaseUser.uid,
  email: email,
  phone_number: null,
  roles: ['company', 'admin', 'pending'],   // Triple roles for pending company admin
  company_id: null,                         // Not yet assigned
  is_active: true,
  is_policy_accepted: true,
  transfer: {
    target_company: newCompanyId,           // Created company_information doc ID
    transfer_approved: false,
    request_timestamp: serverTimestamp()
  },
  created_by: firebaseUser.uid,
  updated_by: firebaseUser.uid,
  created_at: serverTimestamp(),
  updated_at: serverTimestamp()
}
```

**`company_information` document:** (created via COMP-003)
```typescript
{
  uid: newCompanyId,                        // Generated document ID
  company_name: formData.companyName,
  company_name_en: formData.companyNameEn || null,
  tax_id: formData.taxId,
  job_industry: formData.industry,
  company_size: formData.companySize,       // 'S' | 'M' | 'L' | 'XL' | 'XXL'
  company_logo: null,
  profile_photo: uploadedDocUrl,            // Company registration document
  status: 'pending',                        // Awaits platform admin approval
  is_active: false,                         // Inactive until approved
  staff: [firebaseUser.uid],                // Founder is first staff
  created_by: firebaseUser.uid,
  updated_by: firebaseUser.uid,
  created_at: serverTimestamp(),
  updated_at: serverTimestamp()
}
```

#### 4.5.4 Company - Mode B (Join Existing Company)

**Server Action:** `StaffRequestApply()`

**`user_accounts` document:**
```typescript
{
  uid: firebaseUser.uid,
  email: email,
  phone_number: null,
  roles: ['candidate', 'pending'],          // Candidate + pending (awaiting company admin)
  company_id: null,                         // Not yet assigned
  is_active: true,
  is_policy_accepted: true,
  transfer: {
    target_company: selectedCompanyId,      // Existing company they want to join
    transfer_approved: false,
    request_timestamp: serverTimestamp()
  },
  current_step_name: 'pending',             // Awaiting company admin
  created_by: firebaseUser.uid,
  updated_by: firebaseUser.uid,
  created_at: serverTimestamp(),
  updated_at: serverTimestamp()
}
```

> **Source:** features_companies.md (COMP-018) - Note: Default roles include 'candidate' for Mode B users

#### 4.5.5 Role Assignment Logic

| Registration Type | `roles` Array | Approver | After Approval |
|-------------------|---------------|----------|----------------|
| Candidate (any method) | `['candidate']` | None (immediate) | `['candidate']` |
| Company Mode A | `['company', 'admin', 'pending']` | Platform Admin (chancedee) | `['company', 'admin']` |
| Company Mode B | `['candidate', 'pending']` | Company Admin | `['candidate', 'company']` (staff) |

> **Source:** features_authentication.md (AUTH-004), features_companies.md (COMP-007, COMP-014, COMP-018)

### 4.6 Wallet Signup Bonus

> **Source:** features_wallet.md (WALLET-003, WALLET-004), features_candidates.md (CAND-001)

**Trigger:** Candidate account creation (CAND-001 → `createCandidateAccount()`)

**Who Gets Bonus:**
- ✅ Candidates (Google OAuth or Email/Password)
- ❌ Company Mode A (pending company admin)
- ❌ Company Mode B (pending staff)

**Mechanism:**
```
createCandidateAccount()
    │
    ├─► Create user_accounts document
    ├─► Create candidate_information document
    │
    └─► Initialize wallet (WALLET-003)
        │
        ├─► Create `pockets/{uid}` document (currency: 'coin')
        │   {
        │     uid: firebaseUser.uid,
        │     currency: 'coin',
        │     balance: 100,              // Signup bonus
        │     latest: [transactionId],   // First 10 transaction IDs
        │     created_by: 'system',
        │     updated_by: 'system'
        │   }
        │
        └─► Create `wallet_transactions/{txId}` document
            {
              uid: transactionId,
              transaction_owner: 'chancedee',
              transaction_receiver: firebaseUser.uid,
              transaction_origin: 'register',      // or 'onboarding'
              transaction_type: 'deposit',
              transaction_amount: 100,
              transaction_currency: 'coin',
              transaction_time: serverTimestamp(),
              remark: 'โบนัสสมัครสมาชิกใหม่',
              created_by: 'system',
              updated_by: 'system'
            }
```

**Error Handling:**
- Wallet creation failure does NOT block registration
- User can still complete registration
- Balance shows 0 if wallet creation failed
- Admin can manually award bonus later via `/admin/loyalty/coin-system`

> **Source:** features_wallet.md (WALLET-003, WALLET-004, WALLET-010)

### 4.7 Collection Name Mapping

> **Source:** data-entities_data-entity-references.md

| RIS Reference | Actual Firestore Collection | Notes |
|---------------|----------------------------|-------|
| `user_accounts` | `user_accounts` | ✅ Correct |
| `user_info` | `user_info` | ✅ Correct |
| `user_transfer` | Embedded in `user_accounts.transfer` | ⚠️ Not separate collection |
| `candidate_information` | `candidate_information` | ✅ Correct |
| `candidate_referral` | Embedded in `candidate_information.referral` | ⚠️ Not separate collection |
| `company_information` | `company_information` | ✅ Correct |
| `company_requests` | `company_requests` | ✅ Correct (separate from company_information) |
| `otp_codes` | `otp_codes` | ✅ Correct |
| `pockets` | `pockets` (or `{currency}` e.g., `coin`, `star`) | ⚠️ Collection name varies by currency |
| `wallet_transactions` | `wallet_transactions` | ✅ Correct |
| `consent_records` | `consent_records` | ✅ Correct |

**Legacy References (Old System):**

| Old Reference | Maps To |
|---------------|---------|
| `web_candidate_data` | `candidate_information` |
| `web_company_requests` | `company_requests` |
| `web_pockets` | `pockets` |
| `web_wallet_transactions` | `wallet_transactions` |
| `web_delete_requests` | `delete_requests` |

### 4.8 Consent Logging

> **Source:** features_consent.md (CONSENT-002), data-entities_consent-records.md

**Timing:** Consent is logged AFTER account creation, NOT before (UID required).

**When Logged:**
1. User checks terms checkbox during Step 1
2. User submits registration form
3. Account creation succeeds (Firebase + user_accounts)
4. **THEN** consent record is created

**Server Action:** Called internally during account creation flow

**`consent_records` document:**
```typescript
{
  uid: generatedUid,                        // UUID v4
  user_id: firebaseUser.uid,                // Links to user_accounts
  session_id: sessionId || null,            // For anonymous tracking
  ip_hash: hashIp(clientIp).substring(0, 16), // First 16 chars of SHA256
  user_agent: request.headers['user-agent'],
  policy_version: '2.0',                    // COOKIE_POLICY_VERSION constant
  preferences: {
    essential: true,                        // Always true
    analytics: true,                        // User's choice
    marketing: true,                        // User's choice
    functional: true                        // User's choice
  },
  consent_method: 'banner',                 // or 'settings_page'
  withdrawal_date: null,
  is_active: true,
  parent_consent_id: null,                  // First consent has no parent
  version_number: 1,
  change_reason: 'initial',
  previous_preferences: null,
  created_by: firebaseUser.uid,
  updated_by: firebaseUser.uid,
  created_at: serverTimestamp(),
  updated_at: serverTimestamp()
}
```

**Note:** For registration flow, consent is logged with `consent_method: 'banner'` since user accepts via checkbox in registration form, not the cookie settings page.

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose | Set When |
|------|------|-----|---------|----------|
| `firebaseUserAtom` | `User \| null` | R/W | Firebase user object | After auth |
| `userAtom` | `userDataProps \| null` | R/W | Full user data | After data fetch |
| `navBarAtom` | `string` | W | Navigation context | Before redirect |
| `sessionStateAtom` | `'valid' \| 'expired' \| 'none' \| 'validating'` | R/W | Session status | After login |
| `authInitializedAtom` | `boolean` | W | Auth init complete | After init |

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useFirebaseAuth` | `{ user, signOutFirebase, navigateUserByRole, ... }` | Core auth orchestration |
| `useBusinessRegister` | Step state, form handlers | Company registration wizard |
| `useFileUpload` | Upload progress, file list | Document upload |
| `useStepper` | Step navigation | Multi-step wizard |

### 5.3 SWR Keys

| Key Pattern | Data | Populated When |
|-------------|------|----------------|
| `user-data-${uid}` | User account data | After successful registration |
| `master-job-industries` | Industry dropdown | Company step 2 load |

### 5.4 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `currentStep` | `number` | `1` | Wizard step (1-3 for company, 1-2 for candidate) |
| `selectedRole` | `'candidate' \| 'company' \| null` | from `?role` or `null` | Selected role |
| `email` | `string` | from `?email` or `''` | Email input |
| `password` | `string` | `''` | Password input |
| `confirmPassword` | `string` | `''` | Password confirmation |
| `otpCode` | `string` | `''` | 6-digit OTP input |
| `refCode` | `string` | `''` | OTP reference code (from server) |
| `termsAccepted` | `boolean` | `false` | General terms checkbox |
| `employerTermsAccepted` | `boolean` | `false` | Employer terms checkbox (company only) |
| `isLoading` | `boolean` | `false` | Submit loading state |
| `error` | `RegisterError \| null` | `null` | Error display |
| `emailExists` | `EmailExistsResult \| null` | `null` | Email check result |
| `companyMode` | `'new' \| 'join'` | from `?mode` or `'new'` | Company registration mode (Mode A/B) |
| `companyData` | `CompanyFormData` | `{}` | Company details form (Mode A) |
| `uploadedFile` | `File \| null` | `null` | Company document (Mode A) |
| `searchQuery` | `string` | `''` | Company search input (Mode B) |
| `searchResults` | `CompanySearchResult[]` | `[]` | Company search results (Mode B) |
| `selectedCompany` | `CompanySearchResult \| null` | `null` | Selected company to join (Mode B) |
| `nameCardFile` | `File \| null` | `null` | Name card image (Mode B) |

### 5.5 OTP Verification State Persistence

> **Source:** features_authentication.md (AUTH-004, AUTH-017)

**Problem:** How does the OLD system persist OTP verified state across page refresh?

**Mechanism:** Server-side cookie after successful OTP verification

```
verifyOTPCode(refCode, otpCode)
    │
    ├─► OTP valid? ──► Set server-side cookie
    │   └─► Cookie: `otpVerified={refCode}`
    │   └─► Expiry: 15 minutes
    │   └─► HttpOnly: true
    │   └─► Secure: true (production)
    │   └─► SameSite: 'lax'
    │
    └─► OTP invalid? ──► No cookie set, return error
```

**Cookie Properties:**
| Property | Value | Purpose |
|----------|-------|---------|
| Name | `otpVerified` | Identifies OTP verification state |
| Value | `{refCode}` | Links to specific OTP record |
| Max-Age | 900 (15 minutes) | Same as OTP expiry |
| HttpOnly | `true` | Cannot be read by JavaScript (XSS protection) |
| Secure | `true` (prod) | HTTPS only in production |
| SameSite | `lax` | CSRF protection |

**Page Refresh Behavior:**
1. User verifies OTP → Cookie set
2. User refreshes page during password step
3. Page load checks for `otpVerified` cookie
4. If cookie exists and valid → Skip to password step
5. If cookie missing/expired → Restart from OTP step

**OTP Record Status Updates:**

| `otp_codes.status` | Meaning |
|--------------------|---------|
| `null` | Active, unused |
| `'verified'` | Successfully verified |
| `'expired'` | Past 15-minute window |
| `'invalidated'` | New OTP sent for same email |

> **Source:** data-entities_otp-codes.md, features_authentication.md (AUTH-017)

### 5.6 Wizard State Persistence

> **Source:** features_authentication.md (AUTH-004, AUTH-014)

**Company Registration State Persistence:**

The company registration flow uses **URL parameters** + **server session** for state persistence:

**URL-Based Persistence:**
```
/auth/register?role=company&step=account    → Step 1 (Auth Form)
/auth/register?role=company&step=company    → Step 2 (Company Details)
/auth/register?role=company&step=pending    → Step 3 (Pending Confirmation)
```

**On Page Refresh:**
1. Check URL `?step` parameter
2. Check server session (authenticated user?)
3. Determine which step to show:

| Session | URL Step | OTP Cookie | Behavior |
|---------|----------|------------|----------|
| None | Any | - | Show step 1 (start over) |
| None | account | Valid | Show password form (OTP verified) |
| Valid (pending role) | account | - | Redirect to step=company |
| Valid (pending role) | company | - | Show step 2 |
| Valid (pending role) | pending | - | Show step 3 |
| Valid (approved) | Any | - | Redirect to company dashboard |

**Key Insight:** Once session is created (after password step), user state is persisted server-side. The session cookie + user's role determines the step on page refresh.

**Candidate Flow State:**

Simpler because candidate registration is 1-2 steps only:

| Session | OTP Cookie | Behavior |
|---------|------------|----------|
| None | None | Show auth form (start) |
| None | Valid | Show password form |
| Valid (candidate) | - | Redirect to profile |

> **Source:** features_authentication.md (AUTH-004), Section 6.2.1 Company Session Note

---

## 6. UI State Machine

### 6.1 Page States - Candidate Flow

```
                                    ┌─────────────────────┐
                                    │   ROLE_SELECT       │
                                    │ (show role cards)   │
                                    └─────────┬───────────┘
                                              │
                              role selected OR ?role param
                                              │
                                              ▼
                                    ┌─────────────────────┐
                        ┌───────────│   AUTH_FORM         │
                        │           │ (Google OR Email)   │
                        │           └─────────┬───────────┘
                        │                     │
              Google OAuth                Email submit
                        │                     │
                        ▼                     ▼
               ┌─────────────────┐   ┌─────────────────────┐
               │ GOOGLE_AUTH    │   │   SENDING_OTP       │
               │ (popup)        │   │   (loading)         │
               └───────┬────────┘   └─────────┬───────────┘
                       │                      │
              success  │                      │ OTP sent
                       │                      ▼
                       │            ┌─────────────────────┐
                       │            │   OTP_VERIFY        │
                       │            │ (6-digit input)     │
                       │            └─────────┬───────────┘
                       │                      │
                       │             OTP verified
                       │                      ▼
                       │            ┌─────────────────────┐
                       │            │   CREATE_PASSWORD   │
                       │            │ (password form)     │
                       │            └─────────┬───────────┘
                       │                      │
                       │            password submitted
                       │                      │
                       └──────────┬───────────┘
                                  │
                                  ▼
                         ┌─────────────────────┐
                         │   CREATING_FIREBASE │
                         │   (loading)         │
                         │ createUserWithEmail │
                         │ OR signInWithPopup  │
                         └─────────┬───────────┘
                                   │
                          Firebase user created
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │   CREATING_SESSION  │
                         │   (loading)         │
                         │ 1. getIdToken()     │
                         │ 2. login(idToken)   │◄── SESSION COOKIE CREATED
                         │ 3. set sessionState │
                         │    Atom = 'valid'   │
                         └─────────┬───────────┘
                                   │
                          session cookie set
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │   CREATING_ACCOUNT  │
                         │   (loading)         │
                         │ 1. UserAccountSet() │
                         │ 2. set userAtom     │
                         │ 3. set navBarAtom   │
                         │    = 'candidate'    │
                         └─────────┬───────────┘
                                   │
                          account docs created
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │   SUCCESS           │
                         │ → /candidates/[id]  │
                         │   (with onboarding) │
                         └─────────────────────┘
```

#### 6.1.2 Candidate Flow State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `ROLE_SELECT` | `SELECT_CANDIDATE` | `AUTH_FORM` | - | setSelectedRole('candidate') |
| `ROLE_SELECT` | `URL_ROLE_PARAM` | `AUTH_FORM` | ?role=candidate | setSelectedRole('candidate') |
| `AUTH_FORM` | `GOOGLE_CLICK` | `GOOGLE_AUTH` | termsAccepted | signInWithPopup() |
| `AUTH_FORM` | `EMAIL_SUBMIT` | `SENDING_OTP` | email.isValid && termsAccepted | sendVerificationOTPEmail() |
| `GOOGLE_AUTH` | `AUTH_SUCCESS` | `CREATING_SESSION` | - | getIdToken() |
| `GOOGLE_AUTH` | `AUTH_ERROR` | `AUTH_FORM` | - | setError() |
| `SENDING_OTP` | `OTP_SENT` | `OTP_VERIFY` | - | setRefCode(), startCooldown() |
| `SENDING_OTP` | `OTP_ERROR` | `AUTH_FORM` | - | setError() |
| `OTP_VERIFY` | `OTP_SUBMIT` | `VERIFYING` | otpCode.length === 6 | verifyOTPCode() |
| `OTP_VERIFY` | `RESEND_CLICK` | `SENDING_OTP` | cooldown === 0 | sendVerificationOTPEmail() |
| `VERIFYING` | `OTP_VALID` | `CREATE_PASSWORD` | - | setOtpVerifiedCookie() |
| `VERIFYING` | `OTP_INVALID` | `OTP_VERIFY` | - | setError(), incrementAttempts() |
| `CREATE_PASSWORD` | `PASSWORD_SUBMIT` | `CREATING_FIREBASE` | password.isValid && password === confirmPassword | createUserWithEmailAndPassword() |
| `CREATING_FIREBASE` | `USER_CREATED` | `CREATING_SESSION` | - | getIdToken() |
| `CREATING_FIREBASE` | `CREATE_ERROR` | `CREATE_PASSWORD` | - | setError() |
| `CREATING_SESSION` | `SESSION_CREATED` | `CREATING_ACCOUNT` | - | login(), setSessionState('valid') |
| `CREATING_ACCOUNT` | `ACCOUNT_CREATED` | `SUCCESS` | - | UserAccountSet(), processReferral(), setNavBarAtom('candidate') |
| `SUCCESS` | `REDIRECT` | - | - | router.replace('/candidates/{uid}') |

### 6.1.1 Session Creation Sequence (Detail)

```
┌─────────────────────────────────────────────────────────────────────┐
│ After Firebase Auth Success (OAuth or Email/Password)               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Firebase Auth completes                                         │
│     └─► Firebase user object available (client-side)                │
│                                                                     │
│  2. Get ID Token                                                    │
│     └─► await firebaseUser.getIdToken()                             │
│                                                                     │
│  3. Create Session Cookie (SERVER ACTION)                           │
│     └─► await login(idToken)                                        │
│         ├─► Server validates token with Firebase Admin SDK          │
│         ├─► Server creates HTTP-only session cookie                 │
│         └─► Cookie expiry = JWT remaining lifetime (≤1 hour)        │
│                                                                     │
│  4. Update Client State                                             │
│     ├─► setSessionState('valid')                                    │
│     ├─► setFirebaseUser(user)                                       │
│     └─► setAuthInitialized(true)                                    │
│                                                                     │
│  5. Create Account Documents (if new user)                          │
│     ├─► UserAccountSet() → user_accounts                            │
│     ├─► Auto-creates user_info                                      │
│     └─► Auto-creates wallet (100 coins bonus)                       │
│                                                                     │
│  6. Navigate                                                        │
│     └─► navigateUserByRole('register') → /candidates/[id]           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Page States - Company Flow

```
                                    ┌─────────────────────┐
                                    │   ROLE_SELECT       │
                                    │ (show role cards)   │
                                    └─────────┬───────────┘
                                              │
                                    role = company
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │   AUTH_FORM         │
                                    │ (Email only)        │
                                    │ Step 1 of 3         │
                                    └─────────┬───────────┘
                                              │
                                    Email submit
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │   SENDING_OTP       │
                                    └─────────┬───────────┘
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │   OTP_VERIFY        │
                                    └─────────┬───────────┘
                                              │
                                    OTP verified
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │   CREATE_PASSWORD   │
                                    └─────────┬───────────┘
                                              │
                                    password submitted
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │   CREATING_FIREBASE │
                                    │ createUserWithEmail │
                                    └─────────┬───────────┘
                                              │
                                     Firebase user created
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │   CREATING_SESSION  │
                                    │ 1. getIdToken()     │
                                    │ 2. login(idToken)   │◄── SESSION COOKIE CREATED
                                    │ 3. sessionState =   │
                                    │    'valid'          │
                                    └─────────┬───────────┘
                                              │
                                     session cookie set
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │   CREATING_ACCOUNT  │
                                    │ 1. UserAccountSet() │
                                    │    roles: ['pending']│
                                    │ 2. navBarAtom =     │
                                    │    'pending'        │
                                    └─────────┬───────────┘
                                              │
                                     account created (pending role)
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │   COMPANY_DETAILS   │
                                    │   Step 2 of 3       │
                                    │ (company form)      │
                                    └─────────┬───────────┘
                                              │
                                    form submit with doc
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │   UPLOADING_DOC     │
                                    │ Firebase Storage    │
                                    └─────────┬───────────┘
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │   SUBMITTING_REQUEST│
                                    │ requestTransfer     │
                                    │ CompanyAccount()    │
                                    └─────────┬───────────┘
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │   PENDING           │
                                    │   Step 3 of 3       │
                                    │ (?step=pending)     │
                                    │ (success card)      │
                                    └─────────────────────┘
```

#### 6.2.2 Company Flow State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `ROLE_SELECT` | `SELECT_COMPANY` | `AUTH_FORM` | - | setSelectedRole('company') |
| `AUTH_FORM` | `EMAIL_SUBMIT` | `SENDING_OTP` | email.isValid && termsAccepted && employerTermsAccepted | sendVerificationOTPEmail() |
| `SENDING_OTP` | `OTP_SENT` | `OTP_VERIFY` | - | setRefCode() |
| `OTP_VERIFY` | `OTP_SUBMIT` | `VERIFYING` | otpCode.length === 6 | verifyOTPCode() |
| `VERIFYING` | `OTP_VALID` | `CREATE_PASSWORD` | - | - |
| `CREATE_PASSWORD` | `PASSWORD_SUBMIT` | `CREATING_FIREBASE` | password.isValid | createUserWithEmailAndPassword() |
| `CREATING_FIREBASE` | `USER_CREATED` | `CREATING_SESSION` | - | getIdToken() |
| `CREATING_SESSION` | `SESSION_CREATED` | `CREATING_ACCOUNT` | - | login(), setSessionState('valid') |
| `CREATING_ACCOUNT` | `ACCOUNT_CREATED` | `COMPANY_DETAILS` | - | UserAccountSet() with roles=['pending'] |
| `COMPANY_DETAILS` | `MODE_TOGGLE` | `COMPANY_DETAILS` | - | setCompanyMode(toggle) |
| `COMPANY_DETAILS` | `FORM_SUBMIT_A` | `UPLOADING_DOC` | mode='new' && form.isValid | uploadToStorage() |
| `COMPANY_DETAILS` | `FORM_SUBMIT_B` | `UPLOADING_DOC` | mode='join' && selectedCompany && nameCard | uploadToStorage() |
| `UPLOADING_DOC` | `UPLOAD_COMPLETE` | `SUBMITTING_REQUEST` | - | CreateNewCompany() OR StaffRequestApply() |
| `SUBMITTING_REQUEST` | `REQUEST_CREATED` | `PENDING` | - | updateURL(?step=pending) |
| `PENDING` | `VIEW_STATUS` | - | - | router.push('/auth/status?type=...') |

### 6.2.1 Company Session Note

For company registration, the session is created **BEFORE** company details are submitted:

```
┌─────────────────────────────────────────────────────────────────────┐
│ Company Flow: Session Created Early                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Step 1 (Auth Form):                                                │
│  ├─► Email → OTP verification → Password                            │
│  ├─► Create Firebase Auth user                                      │
│  ├─► login(idToken) ← SESSION COOKIE CREATED HERE                   │
│  ├─► UserAccountSet() with roles: ['pending']                       │
│  └─► User is now authenticated with 'pending' role                  │
│                                                                     │
│  Step 2 (Company Details):                                          │
│  ├─► User fills company form (already has session!)                 │
│  ├─► Upload document to Firebase Storage                            │
│  └─► requestTransferCompanyAccount() creates company_requests doc   │
│                                                                     │
│  Step 3 (Pending):                                                  │
│  └─► User stays logged in with 'pending' role                       │
│      Can revisit /auth/status to check approval status              │
│                                                                     │
│  Why early session?                                                 │
│  • Allows page refresh without losing progress                      │
│  • Company details form is protected (requires auth)                │
│  • Document upload requires authenticated user UID for storage path │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 Component State Automaton

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| `RoleCard[candidate]` | `idle` | `HOVER` | `hover` | - |
| `RoleCard[candidate]` | `hover` | `LEAVE` | `idle` | - |
| `RoleCard[candidate]` | `idle` | `CLICK` | `selected` | - |
| `RoleCard[candidate]` | `selected` | `OTHER_SELECTED` | `idle` | company card clicked |
| `RoleCard[company]` | `idle` | `CLICK` | `selected` | - |
| `GoogleButton` | `idle` | `CLICK` | `loading` | termsAccepted |
| `GoogleButton` | `loading` | `SUCCESS` | `idle` | - |
| `GoogleButton` | `loading` | `ERROR` | `idle` | - |
| `OTPInput` | `idle` | `FOCUS` | `focused` | - |
| `OTPInput` | `focused` | `INPUT` | `focused` | length < 6 |
| `OTPInput` | `focused` | `COMPLETE` | `complete` | length === 6 |
| `OTPInput` | `complete` | `AUTO_SUBMIT` | `validating` | - |
| `OTPInput` | `validating` | `VALID` | `success` | - |
| `OTPInput` | `validating` | `INVALID` | `error` | - |
| `OTPInput` | `error` | `CLEAR` | `idle` | - |
| `PasswordStrengthMeter` | `idle` | `INPUT` | `weak` | score < 2 |
| `PasswordStrengthMeter` | `idle` | `INPUT` | `medium` | score >= 2 && score < 4 |
| `PasswordStrengthMeter` | `idle` | `INPUT` | `strong` | score >= 4 |
| `PasswordConfirmField` | `idle` | `INPUT` | `match` | value === password |
| `PasswordConfirmField` | `idle` | `INPUT` | `mismatch` | value !== password |
| `ModeToggle` | `new` | `TOGGLE` | `join` | - |
| `ModeToggle` | `join` | `TOGGLE` | `new` | - |
| `CompanySearch` | `idle` | `INPUT` | `searching` | query.length >= 2 |
| `CompanySearch` | `searching` | `RESULTS` | `idle` | - |
| `CompanySearch` | `idle` | `SELECT` | `selected` | - |
| `UploadArea` | `empty` | `DROP` | `uploading` | file valid |
| `UploadArea` | `empty` | `CLICK` | `uploading` | file selected |
| `UploadArea` | `uploading` | `PROGRESS` | `uploading` | - |
| `UploadArea` | `uploading` | `COMPLETE` | `uploaded` | - |
| `UploadArea` | `uploading` | `ERROR` | `error` | - |
| `UploadArea` | `uploaded` | `REMOVE` | `empty` | - |
| `TermsCheckbox` | `unchecked` | `TOGGLE` | `checked` | - |
| `TermsCheckbox` | `checked` | `TOGGLE` | `unchecked` | - |
| `SubmitButton` | `disabled` | `FORM_VALID` | `enabled` | all required fields valid |
| `SubmitButton` | `enabled` | `FORM_INVALID` | `disabled` | validation fails |
| `SubmitButton` | `enabled` | `CLICK` | `loading` | - |
| `SubmitButton` | `loading` | `SUCCESS` | `enabled` | - |
| `SubmitButton` | `loading` | `ERROR` | `enabled` | - |

### 6.4 Entity State Automaton

| Entity | Current State | Event | Next State | Actor | Side Effects |
|--------|---------------|-------|------------|-------|--------------|
| `otp_codes` | `(not exists)` | `SEND_OTP` | `active` | System | create doc, send email, set ref_code |
| `otp_codes` | `active` | `VERIFY_SUCCESS` | `verified` | User | update status field |
| `otp_codes` | `active` | `TIMEOUT` | `expired` | System | 15 min expiry |
| `otp_codes` | `active` | `RESEND_OTP` | `invalidated` | User | new OTP sent for same email |
| `user_accounts` | `(not exists)` | `CREATE_CANDIDATE` | `active` | User | roles=['candidate'], is_active=true |
| `user_accounts` | `(not exists)` | `CREATE_COMPANY_PENDING` | `pending` | User | roles=['company','admin','pending'] (Mode A) |
| `user_accounts` | `(not exists)` | `CREATE_STAFF_PENDING` | `pending` | User | roles=['candidate','pending'], target_company set (Mode B) |
| `user_info` | `(not exists)` | `AUTO_CREATE` | `exists` | System | current_step=1, is_verified based on auth method |
| `candidate_information` | `(not exists)` | `CREATE` | `exists` | System | auto via createCandidateAccount() |
| `company_information` | `(not exists)` | `CREATE_REQUEST` | `pending` | User | status='pending', await platform approval |
| `pockets` | `(not exists)` | `CREATE` | `active` | System | amount=100 (signup bonus) |
| `wallet_transactions` | `(not exists)` | `SIGNUP_BONUS` | `completed` | System | record 100 coins credit |
| `candidate_referral` | `(not exists)` | `PROCESS_REFERRAL` | `processed` | System | if ?refCode present |

### 6.5 Route Guard for Logged-In Users
### 6.5 Route Guard for Logged-In Users

> **Source:** features_authentication.md (AUTH-016 Role-Based Navigation)

**Question:** What happens when an already-logged-in user visits `/auth/register`?

**OLD System Behavior:**

```
User visits /auth/register
    │
    ├─► No session cookie? ──► Show registration form normally
    │
    └─► Valid session cookie?
        │
        └─► Call navigateUserByRole('auto')
            │
            ├─► roles.includes('chancedee') ──► Redirect to /platform/dashboard
            │
            ├─► roles.includes('deleted') ────► Redirect to /auth/deleted
            │
            ├─► roles.includes('pending')
            │   ├─► company+admin ────────────► Redirect to /companies/{targetCompany}/pending
            │   └─► other pending ────────────► Redirect to /auth/pending
            │
            ├─► roles.includes('candidate')
            │   ├─► isOnboarded: false ───────► Redirect to /candidates/{uid} (with onboarding)
            │   └─► isOnboarded: true ────────► Redirect to /candidates/{uid}
            │
            └─► roles.includes('company') + companyId
                └─► Redirect to /companies/{companyId}/dashboard
```

**Implementation Notes:**

1. **Client-side redirect:** The redirect happens in `useFirebaseAuth` hook when auth state initializes
2. **No server middleware:** The route itself doesn't block access; the hook handles navigation
3. **Race condition handling:** `authInitializedAtom` prevents premature redirects

**Special Case: Pending-Only Users**

Users with ONLY `pending` role (before company/staff approval):
- They CAN stay on registration page (e.g., to review pending status)
- They are redirected only if they try to access non-pending routes

**NEW Design Behavior (Recommended):**

| Session State | Behavior |
|---------------|----------|
| No session | Show registration form |
| Valid + candidate | Redirect to `/candidates/{uid}` |
| Valid + company | Redirect to `/companies/{companyId}/dashboard` |
| Valid + pending (company flow) | Redirect to `/auth/status?type=company-pending` |
| Valid + pending (staff flow) | Redirect to `/auth/status?type=staff-pending` |
| Valid + chancedee | Redirect to `/platform/dashboard` |
| Valid + deleted | Redirect to `/auth/status?type=deleted` |

> **Source:** features_authentication.md (AUTH-016), `navigateUserByRole()` in `use-auth.ts`

---

## 7. Query Parameters

| Param | Type | Purpose | Behavior |
|-------|------|---------|----------|
| `?role=candidate` | `string` | Pre-select role | Skip role selection, show candidate form |
| `?role=company` | `string` | Pre-select role | Skip role selection, show company form |
| `?email=[email]` | `string` | Pre-fill email | From referral, failed login, or invitation |
| `?step=account` | `string` | Wizard step | Default, step 1 |
| `?step=company` | `string` | Wizard step | Step 2, company details (company only) |
| `?step=pending` | `string` | Wizard step | Step 3, pending approval (company only) |
| `?mode=new` | `string` | Company mode | Mode A - Create new company (default) |
| `?mode=join` | `string` | Company mode | Mode B - Join existing company |
| `?refCode=[code]` | `string` | Referral code | Process after candidate creation (CAND-014) |

### Mode Parameter Usage

| Step | Mode | URL Example |
|------|------|-------------|
| Step 2 | Create new (default) | `/auth/register?role=company&step=company` |
| Step 2 | Join existing | `/auth/register?role=company&step=company&mode=join` |
| Step 3 | New company pending | `/auth/register?role=company&step=pending&mode=new` |
| Step 3 | Join company pending | `/auth/register?role=company&step=pending&mode=join` |

---

## 8. Component-Action Wiring

### 8.1 Role Selection

| # | Component | Trigger | Action | Effect |
|---|-----------|---------|--------|--------|
| 1 | Candidate Card | Click | `setSelectedRole('candidate')` | Show candidate auth form |
| 2 | Company Card | Click | `setSelectedRole('company')` | Show company auth form |

### 8.2 Candidate Flow - Google OAuth (Complete Sequence)

| # | Component | Trigger | Action | Effect |
|---|-----------|---------|--------|--------|
| 1 | Google Button | Click | `signInWithPopup(GoogleAuthProvider)` | Open OAuth popup |
| 2 | (OAuth popup) | User approves | Firebase returns `UserCredential` | Popup closes |
| 3 | (background) | OAuth success | `user.getIdToken()` | Get ID token |
| 4 | (background) | Token received | `login(idToken)` | **SESSION COOKIE CREATED** |
| 5 | (background) | Cookie set | `setSessionState('valid')` | Update atom |
| 6 | (background) | Session valid | `UserAccountSet(token, userData)` | Create user_accounts doc |
| 7 | (background) | Account created | `setUserAtom(userData)` | Update atom |
| 8 | (background) | User set | `setNavBarAtom('candidate')` | Update atom |
| 9 | (background) | Nav set | `router.push('/candidates/[uid]')` | Redirect to profile |

### 8.3 Candidate Flow - Email/Password (Complete Sequence)

| # | Component | Trigger | Action | Effect |
|---|-----------|---------|--------|--------|
| 1 | Email Input | Blur | `checkIfEmailExisted(email)` | Check Firebase Auth |
| 2 | Email Input | Blur result | Update `emailExists` state | Show login link or continue |
| 3 | Terms Checkbox | Click | `setTermsAccepted(!termsAccepted)` | Toggle state |
| 4 | Email Form | Submit | `sendVerificationOTPEmail(email)` | Send OTP email |
| 5 | (background) | OTP sent | Store `refCode` in state | Show OTP input |
| 6 | OTP Input | 6 digits entered | `verifyOTPCode(refCode, otpCode)` | Verify OTP |
| 7 | (background) | OTP valid | Set `otpVerified` cookie (15min) | Show password form |
| 8 | Password Input | Input | Calculate strength score | Update strength meter |
| 9 | Confirm Password | Input | Compare with password | Show match/mismatch |
| 10 | Password Form | Submit | `createUserWithEmailAndPassword(email, password)` | Create Firebase user |
| 11 | (background) | Firebase user created | `user.getIdToken()` | Get ID token |
| 12 | (background) | Token received | `login(idToken)` | **SESSION COOKIE CREATED** |
| 13 | (background) | Cookie set | `setSessionState('valid')` | Update atom |
| 14 | (background) | Session valid | `UserAccountSet(token, userData)` | Create user_accounts doc |
| 15 | (background) | Account created | `setUserAtom(userData)` | Update atom |
| 16 | (background) | User set | `setNavBarAtom('candidate')` | Update atom |
| 17 | (background) | Nav set | Check `?refCode` param | Process referral if present |
| 18 | (background) | Referral done | `router.push('/candidates/[uid]')` | Redirect to profile |

### 8.4 Company Flow - Email/Password (Complete Sequence)

**Step 1: Auth Form**

| # | Component | Trigger | Action | Effect |
|---|-----------|---------|--------|--------|
| 1 | Email Input | Blur | `checkIfEmailExisted(email)` | Check Firebase Auth |
| 2 | Terms Checkbox | Click | `setTermsAccepted(!termsAccepted)` | Toggle state |
| 3 | Employer Terms | Click | `setEmployerTermsAccepted(!val)` | Toggle state |
| 4 | Email Form | Submit | `sendVerificationOTPEmail(email)` | Send OTP email |
| 5 | OTP Input | 6 digits entered | `verifyOTPCode(refCode, otpCode)` | Verify OTP |
| 6 | Password Form | Submit | `createUserWithEmailAndPassword(email, password)` | Create Firebase user |
| 7 | (background) | Firebase user created | `user.getIdToken()` | Get ID token |
| 8 | (background) | Token received | `login(idToken)` | **SESSION COOKIE CREATED** |
| 9 | (background) | Cookie set | `setSessionState('valid')` | Update atom |
| 10 | (background) | Session valid | `UserAccountSet(token, { roles: ['pending'] })` | Create user with pending role |
| 11 | (background) | Account created | `setUserAtom(userData)` | Update atom |
| 12 | (background) | User set | `setNavBarAtom('pending')` | Update atom |
| 13 | (background) | Nav set | `setStep(2)` + update URL `?step=company` | Show company details form |

**Step 2: Company Details - Mode Toggle**

| # | Component | Trigger | Action | Effect |
|---|-----------|---------|--------|--------|
| 13.1 | Mode A Tab | Click | `setCompanyMode('new')` | Show create company form |
| 13.2 | Mode B Tab | Click | `setCompanyMode('join')` | Show join company form |

**Step 2 - Mode A: Create New Company (Default)**

| # | Component | Trigger | Action | Effect |
|---|-----------|---------|--------|--------|
| 14 | Company Name (TH) | Input | `setCompanyData({ ...data, nameTH })` | Update form |
| 15 | Company Name (EN) | Input | `setCompanyData({ ...data, nameEN })` | Update form (optional) |
| 16 | Registration Number | Input | Client-side Luhn validation | Show format error if invalid |
| 17 | Industry Dropdown | Select | `setCompanyData({ ...data, industry })` | Update form |
| 18 | Company Size | Select | `setCompanyData({ ...data, size })` | Update form |
| 19 | Upload Area | Drop/Click | Select file | Validate type & size |
| 20 | Upload Area | File selected | `setUploadedFile(file)` | Show file preview |
| 21 | Back Button | Click | `setStep(1)` + update URL `?step=account` | Return to auth form |
| 22 | Submit Button | Click | Start submission sequence | Show loading |
| 23 | (background) | Submit start | `uploadToStorage(file, 'companyProfile/{uid}/')` | Upload to Firebase Storage |
| 24 | (background) | Upload complete | Get download URL | Store file URL |
| 25 | (background) | URL received | `requestTransferCompanyAccount(data)` | Create company_requests doc |
| 26 | (background) | Request created | `setStep(3)` + update URL `?step=pending&mode=new` | Show pending card |

**Step 2 - Mode B: Join Existing Company**

| # | Component | Trigger | Action | Effect |
|---|-----------|---------|--------|--------|
| 14b | Company Search Input | Input (≥2 chars) | `searchCompanies(query)` | Debounced search, show dropdown |
| 15b | Search Results | Loading | Show spinner in dropdown | Visual feedback |
| 16b | Company Result Item | Click | `setSelectedCompany(company)` | Display selected company card |
| 17b | No Results Message | - | Show "ไม่พบบริษัท" + create link | Link switches to Mode A |
| 18b | Selected Company Card | Display | Show logo, name, industry | Read-only display |
| 19b | Change Button | Click | `setSelectedCompany(null)` | Clear selection, show search again |
| 20b | Name Card Upload Area | Drop/Click | Select image file | Validate type (JPG/PNG) & size (≤5MB) |
| 21b | Name Card Upload Area | File selected | `setNameCardFile(file)` | Show image preview |
| 22b | Back Button | Click | `setStep(1)` + update URL `?step=account` | Return to auth form |
| 23b | Submit Button | Click | Start join request sequence | Show loading |
| 24b | (background) | Submit start | `uploadToStorage(file, 'nameCards/{uid}/')` | Upload to Firebase Storage |
| 25b | (background) | Upload complete | Get download URL | Store file URL |
| 26b | (background) | URL received | `StaffRequestApply(targetCompany, nameCardUrl)` | Set transfer.targetCompany |
| 27b | (background) | Request created | `setStep(3)` + update URL `?step=pending&mode=join` | Show pending card |

**Step 3: Pending - Mode A**

| # | Component | Trigger | Action | Effect |
|---|-----------|---------|--------|--------|
| 27 | Check Status Link | Click | `router.push('/auth/status?type=company-pending')` | Navigate to status page |
| 28 | Logout Button | Click | `signOutFirebase()` | Clear session, redirect to login |

**Step 3: Pending - Mode B**

| # | Component | Trigger | Action | Effect |
|---|-----------|---------|--------|--------|
| 28b | Check Status Link | Click | `router.push('/auth/status?type=staff-pending')` | Navigate to status page |
| 29b | Logout Button | Click | `signOutFirebase()` | Clear session, redirect to login |

### 8.5 Resend OTP

| # | Component | Trigger | Action | Effect |
|---|-----------|---------|--------|--------|
| 1 | Resend Link | Click (if enabled) | `sendVerificationOTPEmail(email)` | Send new OTP |
| 2 | (background) | OTP sent | Reset countdown timer (60s) | Disable resend link |
| 3 | (background) | Rate limited | Show error | Display wait time |

### 8.6 Error Recovery Actions

| Error State | Component | Action | Effect |
|-------------|-----------|--------|--------|
| OTP expired | Resend Link | `sendVerificationOTPEmail(email)` | New OTP sent |
| OTP invalid | OTP Input | Clear input, focus | User retries |
| Network error | Retry Button | Retry last action | Re-attempt |
| OAuth popup blocked | Error Message | Show instructions | User allows popups |
| Email exists (same role) | Login Link | `router.push('/auth/login?email=X')` | Navigate to login |
| Email exists (different role) | Modal Button | `router.push('/auth/login')` | Login to add role |

---

## 9. Error Handling

### 9.1 Validation Errors

| Error | Code | Thai Message | Display Location |
|-------|------|--------------|------------------|
| Invalid email format | `INVALID_EMAIL` | รูปแบบอีเมลไม่ถูกต้อง | Below email field |
| Weak password | `WEAK_PASSWORD` | รหัสผ่านไม่ปลอดภัย | Below password + requirements list |
| Password mismatch | `PASSWORD_MISMATCH` | รหัสผ่านไม่ตรงกัน | Below confirm field |
| Terms not accepted | `TERMS_NOT_ACCEPTED` | กรุณายอมรับข้อกำหนด | Highlight checkbox |
| Employer terms not accepted | `EMPLOYER_TERMS_NOT_ACCEPTED` | กรุณายอมรับข้อกำหนดสำหรับนายจ้าง | Highlight checkbox |
| Invalid registration number | `INVALID_REG_NUMBER` | เลขทะเบียนไม่ถูกต้อง | Below field |

**Validation Error Recovery Sequence:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Form submit with invalid data | Client-side Zod validation | Prevent submit |
| 2 | (immediate) | `setError({ code, message, field })` | Update error state |
| 3 | (immediate) | Focus invalid field | Scroll to field if needed |
| 4 | (immediate) | Show error message below field | Red text + icon |
| 5 | User fixes input | `onChange` clears field error | Remove error message |
| 6 | User re-submits | Re-validate all fields | Proceed if valid |

---

### 9.2 Account Errors

| Error | Code | Thai Message | Display Location |
|-------|------|--------------|------------------|
| Email exists (same role) | `EMAIL_EXISTS_SAME_ROLE` | อีเมลนี้ลงทะเบียนแล้ว | Below email + login link |
| Email exists (different role) | `EMAIL_EXISTS_DIFFERENT_ROLE` | อีเมลนี้มีบัญชีผู้หางานแล้ว | Modal dialog |
| Platform user detected | `PLATFORM_USER` | ไม่สามารถลงทะเบียนได้ | Below email + contact support |
| Registration number exists | `REG_NUMBER_EXISTS` | บริษัทนี้ลงทะเบียนแล้ว | Below field + contact support |
| Company not found | `COMPANY_NOT_FOUND` | ไม่พบบริษัทที่ค้นหา | Below search input |
| Already company member | `ALREADY_COMPANY_MEMBER` | คุณเป็นสมาชิกบริษัทนี้แล้ว | Toast notification |
| Pending request exists | `PENDING_REQUEST_EXISTS` | คุณมีคำขอรออนุมัติอยู่แล้ว | Toast + check status link |
| Name card too large | `NAME_CARD_TOO_LARGE` | ไฟล์ใหญ่เกิน 5MB | Below upload area (Mode B) |
| Invalid name card type | `INVALID_NAME_CARD_TYPE` | รองรับเฉพาะ JPG, PNG | Below upload area (Mode B) |

**Email Exists (Same Role) Recovery Sequence:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Email blur | `checkIfEmailExisted(email)` | API call |
| 2 | (background) | API returns `{ exists: true, roles: ['candidate'] }` | Same role as selected |
| 3 | (background) | `setEmailExists({ exists: true, sameRole: true })` | Update state |
| 4 | (immediate) | Show error: "อีเมลนี้ลงทะเบียนแล้ว" | Below email field |
| 5 | (immediate) | Show login link | Inline link |
| 6 | User clicks login link | `router.push('/auth/login?email=' + email)` | Navigate |
| 7 | (background) | Login page pre-fills email | Ready to login |

**Email Exists (Different Role) Recovery Sequence:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Email blur | `checkIfEmailExisted(email)` | API call |
| 2 | (background) | API returns `{ exists: true, roles: ['candidate'] }` | User selected 'company' |
| 3 | (background) | `setEmailExists({ exists: true, sameRole: false })` | Update state |
| 4 | (immediate) | `setShowAddRoleModal(true)` | Open modal |
| 5 | (immediate) | Modal shows: "อีเมลนี้มีบัญชีผู้หางานแล้ว ต้องการเพิ่มบทบาทบริษัท?" | Explain situation |
| 6 | User clicks "เข้าสู่ระบบ" | `router.push('/auth/login?email=' + email + '&addRole=company')` | Navigate |
| 7 | (background) | After login, redirect to add-role flow | Settings page |

**Platform User Recovery Sequence:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Email blur | `checkIfEmailExisted(email)` | API call |
| 2 | (background) | API returns `{ exists: true, roles: ['chancedee'] }` | Platform admin |
| 3 | (background) | `setEmailExists({ exists: true, isPlatformUser: true })` | Update state |
| 4 | (immediate) | Show error: "ไม่สามารถลงทะเบียนด้วยอีเมลนี้" | Below email |
| 5 | (immediate) | Show contact link | Support email/phone |
| 6 | (immediate) | Disable form submit | Prevent registration |

**Company Not Found Recovery Sequence (Mode B):**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Company search input | `searchCompanies(query)` | API call with debounce |
| 2 | (background) | API returns empty results | No matching companies |
| 3 | (background) | `setSearchResults([])` | Update state |
| 4 | (immediate) | Show message: "ไม่พบบริษัทที่ค้นหา" | In dropdown |
| 5 | (immediate) | Show "สร้างบริษัทใหม่แทน" link | Alternative option |
| 6 | User clicks create link | `setCompanyMode('new')` | Switch to Mode A |

**Pending Request Exists Recovery Sequence (Mode B):**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Mode B submit | `StaffRequestApply(targetCompany, ...)` | API call |
| 2 | (background) | API returns error: existing pending request | Duplicate check |
| 3 | (background) | `setError('PENDING_REQUEST_EXISTS')` | Update state |
| 4 | (immediate) | Show toast: "คุณมีคำขอรออนุมัติอยู่แล้ว" | Error notification |
| 5 | (immediate) | Show "ตรวจสอบสถานะ" link | Navigate option |
| 6 | User clicks link | `router.push('/auth/status?type=staff-pending')` | Check existing request |

**Already Company Member Recovery Sequence (Mode B):**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Company selected | Check user membership | Client-side or API |
| 2 | (background) | User already member of selected company | Membership check |
| 3 | (background) | `setError('ALREADY_COMPANY_MEMBER')` | Update state |
| 4 | (immediate) | Show toast: "คุณเป็นสมาชิกบริษัทนี้แล้ว" | Error notification |
| 5 | (immediate) | Clear company selection | Reset search |
| 6 | User selects different company | `setSelectedCompany(newCompany)` | Try again |

---

### 9.3 OTP Errors

| Error | Code | Thai Message | Display Location |
|-------|------|--------------|------------------|
| OTP invalid | `OTP_INVALID` | รหัส OTP ไม่ถูกต้อง | Below OTP input |
| OTP expired | `OTP_EXPIRED` | รหัส OTP หมดอายุ | Below OTP + resend button |
| OTP rate limited | `OTP_RATE_LIMITED` | ส่ง OTP มากเกินไป ลองใหม่ใน X นาที | Toast + countdown |

**OTP Invalid Recovery Sequence:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | OTP input complete (6 digits) | `verifyOTPCode(refCode, otpCode)` | API call |
| 2 | (background) | API returns `{ code: 400, message: 'invalid' }` | Wrong code |
| 3 | (background) | `setOtpError('OTP_INVALID')` | Update state |
| 4 | (immediate) | Show error: "รหัส OTP ไม่ถูกต้อง" | Below OTP input |
| 5 | (immediate) | Clear OTP input | Reset to empty |
| 6 | (immediate) | Focus OTP input | Ready for retry |
| 7 | (immediate) | Increment attempt counter | Track attempts |
| 8 | User enters new code | Re-validate | Try again (max 5 attempts) |

**OTP Expired Recovery Sequence:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | OTP input complete | `verifyOTPCode(refCode, otpCode)` | API call |
| 2 | (background) | API returns `{ code: 400, message: 'expired' }` | Code too old |
| 3 | (background) | `setOtpError('OTP_EXPIRED')` | Update state |
| 4 | (immediate) | Show error: "รหัส OTP หมดอายุ" | Below OTP input |
| 5 | (immediate) | Show resend button (enabled) | Allow immediate resend |
| 6 | User clicks "ส่งรหัสใหม่" | `sendVerificationOTPEmail(email)` | API call |
| 7 | (background) | API returns new `refCode` | New OTP sent |
| 8 | (background) | `setRefCode(newRefCode)` | Update state |
| 9 | (background) | `setOtpError(null)` | Clear error |
| 10 | (immediate) | Clear OTP input | Reset for new code |
| 11 | (immediate) | Start countdown timer (60s) | Disable resend |
| 12 | (immediate) | Show toast: "ส่งรหัส OTP ใหม่แล้ว" | Confirm to user |

**OTP Rate Limited Recovery Sequence:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Resend OTP click | `sendVerificationOTPEmail(email)` | API call |
| 2 | (background) | API returns `{ code: 429, retryAfter: 300 }` | Rate limited |
| 3 | (background) | `setOtpError('OTP_RATE_LIMITED')` | Update state |
| 4 | (background) | `setRateLimitCountdown(retryAfter)` | Store wait time |
| 5 | (immediate) | Show toast: "ส่ง OTP มากเกินไป ลองใหม่ใน 5 นาที" | Error notification |
| 6 | (immediate) | Disable resend button | Prevent spam |
| 7 | (immediate) | Show countdown timer | Display remaining time |
| 8 | (background) | Countdown interval (1s) | Decrement timer |
| 9 | (background) | Timer reaches 0 | `setOtpError(null)` |
| 10 | (immediate) | Enable resend button | Allow retry |

---

### 9.4 File Upload Errors

| Error | Code | Thai Message | Display Location |
|-------|------|--------------|------------------|
| File too large | `FILE_TOO_LARGE` | ไฟล์ใหญ่เกิน 10MB | Below upload area |
| Invalid file type | `INVALID_FILE_TYPE` | รองรับเฉพาะ PDF, JPG, PNG | Below upload area |
| Upload failed | `UPLOAD_FAILED` | อัพโหลดไม่สำเร็จ | Toast + retry button |

**File Too Large Recovery Sequence:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | File drop/select | `handleFileSelect(file)` | Check file |
| 2 | (immediate) | `file.size > 10 * 1024 * 1024` | Size check (client-side) |
| 3 | (immediate) | `setFileError('FILE_TOO_LARGE')` | Update state |
| 4 | (immediate) | Show error: "ไฟล์ใหญ่เกิน 10MB (ขนาดไฟล์: X MB)" | Below upload |
| 5 | (immediate) | Reject file (don't set `uploadedFile`) | Keep upload area empty |
| 6 | User selects smaller file | `handleFileSelect(newFile)` | Re-validate |
| 7 | (immediate) | `setFileError(null)` | Clear error |
| 8 | (immediate) | `setUploadedFile(newFile)` | Show preview |

**Upload Failed Recovery Sequence:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Form submit | `uploadToStorage(file, path)` | Start upload |
| 2 | (background) | Firebase Storage error | Network/permission issue |
| 3 | (background) | `setUploadError('UPLOAD_FAILED')` | Update state |
| 4 | (immediate) | Hide loading spinner | Stop progress |
| 5 | (immediate) | Show toast: "อัพโหลดไม่สำเร็จ" | Error notification |
| 6 | (immediate) | Show retry button in upload area | Allow retry |
| 7 | User clicks retry | `uploadToStorage(file, path)` | Re-attempt |
| 8 | (background) | Upload succeeds | Get download URL |
| 9 | (background) | `setUploadError(null)` | Clear error |
| 10 | (immediate) | Continue with form submission | Proceed to next step |

---

### 9.5 Network Errors

| Error | Code | Thai Message | Display Location |
|-------|------|--------------|------------------|
| Network error | `NETWORK_ERROR` | เชื่อมต่อไม่สำเร็จ | Toast + retry |
| Google OAuth failed | `OAUTH_FAILED` | ลงทะเบียนด้วย Google ไม่สำเร็จ | Toast |
| Popup blocked | `POPUP_BLOCKED` | Popup ถูกบล็อก กรุณาอนุญาต Popup | Toast + instructions |

**Network Error Recovery Sequence:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Any API call | `fetch()` or Firebase operation | Network request |
| 2 | (background) | Request fails (timeout, no connection) | Catch error |
| 3 | (background) | `setNetworkError(true)` | Update state |
| 4 | (immediate) | Show toast: "เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่" | Error notification |
| 5 | (immediate) | Show inline retry button | Near failed action |
| 6 | (background) | Store last action for retry | `setLastAction({ type, payload })` |
| 7 | User clicks retry | Execute stored action | Re-attempt |
| 8 | (background) | Request succeeds | Continue flow |
| 9 | (background) | `setNetworkError(false)` | Clear error |

**OAuth Popup Blocked Recovery Sequence:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Google button click | `signInWithPopup(GoogleAuthProvider)` | Open popup |
| 2 | (browser) | Popup blocked by browser | No popup appears |
| 3 | (background) | Firebase throws `auth/popup-blocked` | Catch error |
| 4 | (background) | `setOAuthError('POPUP_BLOCKED')` | Update state |
| 5 | (immediate) | Show toast with instructions | Explain how to allow |
| 6 | (immediate) | Show browser-specific help link | "วิธีอนุญาต Popup" |
| 7 | User allows popups in browser | Browser settings changed | Popups enabled |
| 8 | User clicks Google button again | `signInWithPopup(GoogleAuthProvider)` | Popup opens |

**OAuth Failed Recovery Sequence:**

| # | Trigger | Action | Effect |
|---|---------|--------|--------|
| 1 | Google button click | `signInWithPopup(GoogleAuthProvider)` | Open popup |
| 2 | (user) | User cancels or error occurs | OAuth fails |
| 3 | (background) | Firebase throws error | Catch error |
| 4 | (background) | `setOAuthError('OAUTH_FAILED')` | Update state |
| 5 | (immediate) | Show toast: "ลงทะเบียนด้วย Google ไม่สำเร็จ" | Error notification |
| 6 | (immediate) | Re-enable Google button | Allow retry |
| 7 | (immediate) | Show email form as alternative | Fallback option |
| 8 | User retries or uses email | Continue registration | Either path works |

---

### 9.6 Error State Summary

| Error Type | Blocks Form? | Auto-Clear? | Retry Method |
|------------|--------------|-------------|--------------|
| Validation | Yes (field-level) | On input change | Fix and re-submit |
| Email exists (same) | Yes | No | Navigate to login |
| Email exists (different) | Yes | Modal dismiss | Login to add role |
| Platform user | Yes | No | Contact support |
| OTP invalid | No | On new input | Enter correct code |
| OTP expired | No | On resend | Resend OTP |
| OTP rate limited | Yes (resend only) | After countdown | Wait |
| File too large | No | On new file | Select smaller file |
| File type invalid | No | On new file | Select correct type |
| Upload failed | No | On retry | Retry upload |
| Network error | No | On retry success | Retry action |
| OAuth failed | No | On retry | Retry or use email |
| Popup blocked | No | On retry | Allow popups, retry |
| Company not found (Mode B) | No | On new search | Try different terms or Mode A |
| Already member (Mode B) | No | On selection clear | Select different company |
| Pending request (Mode B) | Yes | No | Check existing status |
| Name card too large (Mode B) | No | On new file | Select smaller file (≤5MB) |
| Name card type invalid (Mode B) | No | On new file | Select JPG or PNG |

---

## 10. Email Existence Detection Logic

> **Source:** features_authentication.md (AUTH-002, AUTH-003, AUTH-004), `checkIfEmailExisted()` server action

### 10.1 checkIfEmailExisted Return Type

```typescript
// Server action response
interface CheckEmailResponse {
  code: number;               // 200 (own), 204 (not found), 403 (used)
  message: string;
  data?: {
    uid: string;              // User ID if found
    roles: string[];          // ['candidate'] or ['company', 'admin'] or ['chancedee']
  };
}
```

**Response Codes:**

| Code | Meaning | `data` Contains |
|------|---------|-----------------|
| `200` | Email found, is current user's | `{ uid, roles }` |
| `204` | Email not found (free to use) | `null` |
| `403` | Email exists, belongs to another user | `{ uid, roles }` |

**Role Detection Logic:**

```typescript
function determineEmailExistsScenario(response, selectedRole) {
  if (response.code === 204) {
    return 'NEW_USER';  // Continue registration
  }
  
  const roles = response.data.roles;
  
  if (roles.includes('chancedee')) {
    return 'PLATFORM_USER';  // Block registration
  }
  
  if (roles.includes(selectedRole)) {
    return 'SAME_ROLE';  // Redirect to login
  }
  
  return 'DIFFERENT_ROLE';  // Show add-role modal
}
```

### 10.2 Flow Diagram

On email input blur:

```
Email Input Blur
      │
      ▼
checkIfEmailExisted(email)
      │
      ├─── Not in Firebase ─────► Continue normally (new user)
      │
      ├─── Exists in Firebase ──► Fetch user roles
      │                                  │
      │         ┌────────────────────────┼────────────────────────┐
      │         ▼                        ▼                        ▼
      │   Same role as           Different role              Platform user
      │   selected               (candidate ↔ company)        (chancedee role)
      │         │                        │                        │
      │         ▼                        ▼                        ▼
      │   "อีเมลนี้ลงทะเบียนแล้ว"      Modal:                    "ไม่สามารถลงทะเบียน"
      │   + Login link              "เพิ่มบทบาทบริษัท?"            + Contact support
      │         │                        │
      │         ▼                        ▼
      │   → /auth/login?email=X    → /auth/login
      │                            (login first, then add role)
      │
      └───────────────────────────────────────────────────────────────►
```

### 10.3 Edge Case: Google Account Exists in Firebase But Not in user_accounts

> **Source:** features_authentication.md (AUTH-001)

**Scenario:** User previously started Google OAuth but didn't complete registration (e.g., browser closed).

**Detection:**
- `checkIfEmailExisted()` finds Firebase Auth user
- Query to `user_accounts` returns no document
- This indicates incomplete registration

**Handling:**
```
Firebase Auth exists + No user_accounts doc
      │
      ▼
Show message: "พบบัญชีที่ยังไม่เสร็จสิ้น"
      │
      ├─► Option 1: Complete with Google ──► Sign in with Google, create user_accounts
      │
      └─► Option 2: Use different email ──► Clear email, let user enter new one
```

---

## 11. Post-Registration Routing

### Candidate Flow

| Method | Condition | Destination | `navBarAtom` |
|--------|-----------|-------------|--------------|
| Google OAuth | New user (`isOnboarded: false`) | `/candidates/[uid]?tab=onboarding` | `'candidate'` |
| Email/Password | New user (`isOnboarded: false`) | `/candidates/[uid]?tab=onboarding` | `'candidate'` |
| Any | Existing user (`isOnboarded: true`) | `/candidates/[uid]` | `'candidate'` |

> **REMARK (OLD vs NEW):**
> - OLD system: New users → `/candidates/{uid}/edit-profile`
> - NEW design: New users → `/candidates/{uid}?tab=onboarding`
> - The `?tab=onboarding` triggers the onboarding wizard within the profile page
> - Users are blocked from leaving until completing step 2 of onboarding

### Candidate Referral Handling

Referral system is **PRESERVED** from OLD system (CAND-014, CAND-015):

| Condition | Behavior |
|-----------|----------|
| `?refCode` present | Store in session/state during registration |
| After account created | Show referral dialog on onboarding page |
| Dialog auto-fills code | If `?refCode` was in URL |
| User submits valid code | Award 100 coins to both parties (WALLET-005, WALLET-006) |

See **Section 12** for detailed referral flow.

### Company Flow

Company registration has **two modes** selected in Step 2:

#### Mode A: Create New Company

| Condition | Destination | `navBarAtom` |
|-----------|-------------|--------------|
| Company request submitted | Stay on page with `?step=pending&mode=new` | `'pending'` |
| User returns later (pending role) | `/auth/status?type=company-pending` | `'pending'` |
| Platform admin approves (later) | `/companies/[companyId]/dashboard` | `'company'` |
| Platform admin rejects | `/auth/status?type=company-rejected` | `'pending'` |

#### Mode B: Join Existing Company

| Condition | Destination | `navBarAtom` |
|-----------|-------------|--------------|
| Join request submitted | Stay on page with `?step=pending&mode=join` | `'pending'` |
| User returns later (pending role) | `/auth/status?type=staff-pending` | `'pending'` |
| **Company admin** approves (later) | `/companies/[companyId]/dashboard` | `'company'` |
| **Company admin** rejects | User becomes standalone candidate | `'candidate'` |

> **KEY DIFFERENCE:** 
> - Mode A (new company): **Platform admin** reviews and approves
> - Mode B (join existing): **Company admin** reviews and approves

> **REMARK (OLD vs NEW):**
> - OLD system: Pending company admin → `/companies/{targetCompany}/pending`
> - NEW design: 
>   - Mode A (new) → `/auth/status?type=company-pending`
>   - Mode B (join) → `/auth/status?type=staff-pending`
> - The `/auth/status` page is a unified status page for all pending states

### Company Staff Invitation Link - FUTURE STUB

> **⚠️ FUTURE WORK:** Company-generated invitation link flow is NOT in NEW UI spec.
> 
> **What this would enable:**
> - Company admin generates invitation link with `targetCompany` and `invitedRole` embedded
> - Staff clicks link → Registration with pre-linked company (skips company search)
> - Simplified flow for invited staff
> 
> **Stub implementation:**
> - Do NOT implement invitation link generation in company dashboard
> - Route `/auth/status?type=staff-pending` exists in NEW UI spec
> - The Mode B flow (search + select company) provides equivalent functionality
> 
> **When implementing later:**
> - Add `?invite=[token]` query parameter support to `/auth/register`
> - Decode token to get `targetCompany` and `invitedRole`
> - Pre-select Mode B and pre-fill selected company
> - Skip company search step

### Navigation Logic Summary

```
navigateUserByRole() after registration:
│
├─ roles.includes('chancedee') ────────► /platform/dashboard
├─ roles.includes('deleted') ──────────► /auth/status?type=deleted
├─ roles.includes('pending')
│   └─► (company registration) ────────► /auth/status?type=company-pending
│
├─ roles.includes('candidate')
│   ├─ isOnboarded: false ─────────────► /candidates/{uid}?tab=onboarding
│   └─ isOnboarded: true ──────────────► /candidates/{uid}
│
└─ roles.includes('company') + companyId
    └─► /companies/{companyId}/dashboard
```

### 11.5 isOnboarded Lifecycle

> **Source:** features_candidates.md (CAND-017), data-entities_user-info.md

**When is `isOnboarded` set to `true`?**

The `isOnboarded` flag is set when:
1. User completes ALL required onboarding steps (profile wizard)
2. Specifically: After step 2 of the edit-profile wizard is completed

**Flag Locations:**
- `user_info.is_onboarded` (main flag used for routing)
- `candidate_information.is_onboarded` (duplicate, kept in sync)

**State Transitions:**

```
Account Created
    │
    └─► isOnboarded: false
        │
        ▼
User visits /candidates/{uid}
    │
    └─► Redirect to ?tab=onboarding (NEW design)
        OR /edit-profile (OLD system)
        │
        ▼
User completes Step 1 (Identity + Contact)
    │
    └─► isOnboarded: still false
        │
        ▼
User completes Step 2 (Work Experience OR "New Graduate" toggle)
    │
    └─► isOnboarded: true  ◄─── FLAG SET HERE
        │
        ▼
User can now access full dashboard
```

**Completion Criteria:**

| Step | Fields Required | For `isOnboarded` |
|------|-----------------|-------------------|
| Step 1 | first_name, last_name, phone, email | Required |
| Step 2 | Work experience OR new_graduate=true | Required |
| Step 3+ | Education, skills, about me | Not required for flag |

**Impact on Routing:**

| `isOnboarded` | Route | Behavior |
|---------------|-------|----------|
| `false` | `/candidates/{uid}` | Forced to onboarding tab |
| `true` | `/candidates/{uid}` | Full dashboard access |

> **Source:** features_candidates.md (CAND-017), features_authentication.md (AUTH-016)

### 11.6 Candidate Role Clarification

> **Source:** features_authentication.md (AUTH-001, AUTH-004), features_companies.md (COMP-018)

**Question:** Do regular candidates have `['candidate']` or `['candidate', 'pending']`?

**Answer:** It depends on the registration path:

| Registration Path | Initial Roles | When Pending Clears |
|-------------------|---------------|---------------------|
| Candidate (Google OAuth) | `['candidate']` | N/A (no pending) |
| Candidate (Email/Password) | `['candidate']` | N/A (no pending) |
| Company Mode A (create new) | `['company', 'admin', 'pending']` | Platform admin approves |
| Company Mode B (join existing) | `['candidate', 'pending']` | Company admin approves |

**Key Distinction:**
- Regular candidates: **NO `pending` role** - they are immediately active
- Company Mode B staff: **HAS `pending` role** - awaiting company admin approval

**Post-Approval Role Changes:**

| Initial Roles | After Approval | After Rejection |
|---------------|----------------|-----------------|
| `['candidate']` | N/A | N/A |
| `['company', 'admin', 'pending']` | `['company', 'admin']` | `['candidate', 'company-deleted']` |
| `['candidate', 'pending']` | `['candidate', 'company']` | `['candidate']` only |

> **Source:** features_companies.md (COMP-007, COMP-008, COMP-014, COMP-015)

---

## 12. Referral Code Handling

Preserve existing referral system (CAND-014, CAND-015):

```
Registration with ?refCode=ABC123
      │
      ▼
Create Candidate Account
      │
      ▼
Show Referral Dialog
(src/domains/candidates/components/dialogs/referral-dialog.tsx)
      │
      ▼
processCandidateReferral(refCode)
      │
      ├─── Valid code ──────► Award 100 coins to new user (WALLET-005)
      │                       Award 100 coins to referrer (WALLET-006)
      │                       Set referral.referBy = referrerId
      │                       Add new user UID to referrer's referredList[]
      │
      ├─── Invalid code ────► Show error "Invalid referral code"
      │
      └─── Self-referral ───► Show error "Invalid referral code"
```

---

## 13. Company Registration Flow Detail

### Step 1: Auth Form (?step=account)

```
┌─────────────────────────────────────┐
│ Email input                         │
│ ──────────────────────────────────  │
│ [Send OTP]                          │
│                                     │
│ (after OTP verified)                │
│ Password input (strength meter)    │
│ Confirm password                    │
│ ──────────────────────────────────  │
│ ☐ ยอมรับ ข้อกำหนดการใช้งาน          │
│ ☐ ยอมรับ ข้อกำหนดสำหรับนายจ้าง      │
│ ──────────────────────────────────  │
│ [ถัดไป]                             │
└─────────────────────────────────────┘
```

#### Terms & Conditions URLs

> **Source:** 02-public-routes.md (Section 3.6 `/legal/[slug]`)

| Checkbox | Thai Label | Link URL | Link Text |
|----------|------------|----------|-----------|
| General Terms | ยอมรับ ข้อกำหนดการใช้งาน | `/legal/terms` | "ข้อกำหนดการใช้งาน" |
| Privacy Policy | (linked in terms) | `/legal/privacy` | "นโยบายความเป็นส่วนตัว" |
| Cookies Policy | (linked in terms) | `/legal/cookies` | "นโยบายคุกกี้" |
| Employer Terms | ยอมรับ ข้อกำหนดสำหรับนายจ้าง | `/legal/employer-terms` | "ข้อกำหนดสำหรับนายจ้าง" |

**Checkbox Display:**

| Role | General Terms | Employer Terms |
|------|---------------|----------------|
| Candidate | ✅ Required | ❌ Hidden |
| Company | ✅ Required | ✅ Required |

**Link Behavior:**
- Links open in new tab (`target="_blank"`)
- Include `rel="noopener noreferrer"` for security

> **Note:** `/legal/employer-terms` slug needs to be added to legal pages if not already present. Check with legal team for content.

### Step 2: Company Details (?step=company) - WITH MODE TOGGLE

```
┌─────────────────────────────────────┐
│ ┌───────────────┬───────────────┐   │
│ │สร้างบริษัทใหม่ │เข้าร่วมบริษัท │   │
│ │   (Mode A)   │   (Mode B)    │   │
│ └───────────────┴───────────────┘   │
│                                     │
│ (Content changes based on mode)     │
└─────────────────────────────────────┘
```

### Step 2 - Mode A: Create New Company (Default)

```
┌─────────────────────────────────────┐
│ [สร้างบริษัทใหม่] | เข้าร่วมบริษัท   │
│ ─────────────────────────────────── │
│ ชื่อบริษัท (ไทย) *                   │
│ ชื่อบริษัท (อังกฤษ)                  │
│ เลขทะเบียนนิติบุคคล * (13 หลัก)      │
│ ประเภทธุรกิจ * (dropdown)            │
│ ขนาดบริษัท * (S/M/L/XL/XXL)         │
│ ──────────────────────────────────  │
│ เอกสารทะเบียนบริษัท *                │
│ [Upload Area - PDF/JPG/PNG ≤10MB]   │
│ ──────────────────────────────────  │
│ [ย้อนกลับ]              [ส่งข้อมูล]  │
└─────────────────────────────────────┘
```

### Step 2 - Mode B: Join Existing Company

```
┌─────────────────────────────────────┐
│ สร้างบริษัทใหม่ | [เข้าร่วมบริษัท]   │
│ ─────────────────────────────────── │
│ ค้นหาบริษัท                         │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 พิมพ์ชื่อบริษัท...            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ (After company selected:)           │
│ ┌─────────────────────────────────┐ │
│ │ [Logo] ABC Company Ltd.         │ │
│ │        ธุรกิจเทคโนโลยี  [เปลี่ยน] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ นามบัตรของคุณ *                      │
│ "อัพโหลดนามบัตรเพื่อยืนยันตัวตน"      │
│ [Upload Area - JPG/PNG ≤5MB]        │
│ ──────────────────────────────────  │
│ [ย้อนกลับ]          [ส่งคำขอเข้าร่วม] │
└─────────────────────────────────────┘
```

### Step 3: Pending - Mode A (?step=pending&mode=new)

**Approver:** Platform Admin

```
┌─────────────────────────────────────┐
│            ✓ (green checkmark)      │
│                                     │
│ ส่งข้อมูลเรียบร้อยแล้ว                │
│ บัญชีของคุณอยู่ระหว่างการตรวจสอบ      │
│                                     │
│ โดยประมาณ 1-2 วันทำการ               │
│ เราจะแจ้งผลทางอีเมล [email]         │
│                                     │
│ ขั้นตอนถัดไป:                        │
│ 1. รอการตรวจสอบเอกสาร                │
│ 2. รับอีเมลยืนยัน                    │
│ 3. เริ่มลงประกาศงาน                  │
│                                     │
│ [ตรวจสอบสถานะ]    [ออกจากระบบ]       │
└─────────────────────────────────────┘
```

### Step 3: Pending - Mode B (?step=pending&mode=join)

**Approver:** Company Admin (not Platform Admin)

```
┌─────────────────────────────────────┐
│            ✓ (green checkmark)      │
│                                     │
│ ส่งคำขอเรียบร้อยแล้ว                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [Logo] ABC Company Ltd.         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ คำขอของคุณถูกส่งไปยังผู้ดูแลบริษัทแล้ว  │
│                                     │
│ โดยประมาณ 1-3 วันทำการ               │
│ เราจะแจ้งผลทางอีเมล [email]         │
│                                     │
│ ขั้นตอนถัดไป:                        │
│ 1. รอผู้ดูแลบริษัทอนุมัติ              │
│ 2. รับอีเมลยืนยัน                    │
│ 3. เริ่มใช้งานในนามบริษัท             │
│                                     │
│ [ตรวจสอบสถานะ]    [ออกจากระบบ]       │
└─────────────────────────────────────┘
```

### Data Written on Submit

#### Mode A: Create New Company

| Collection | Document | Fields |
|------------|----------|--------|
| `user_accounts` | `{uid}` | `email`, `roles: ['company', 'admin', 'pending']` |
| `user_info` | `{uid}` | `roles`, `isVerified: true` (OTP verified) |
| `web_company_requests` | `{requestId}` | `companyName`, `taxId`, `jobIndustry`, `companySize`, `attachedFiles`, `status: 'pending'`, `createdBy: {uid}` |
| Firebase Storage | `companyProfile/{uid}/{filename}` | Registration document |

#### Mode B: Join Existing Company

| Collection | Document | Fields |
|------------|----------|--------|
| `user_accounts` | `{uid}` | `email`, `roles: ['candidate', 'pending']`, `transfer.targetCompany: {companyId}` |
| `user_info` | `{uid}` | `roles`, `isVerified: true` (OTP verified) |
| Firebase Storage | `nameCards/{uid}/{filename}` | Name card image |

> **Note:** Mode B uses `transfer.targetCompany` to link pending user to target company. Company admin sees this user in their pending staff list.

### Company Search Implementation

```typescript
// Search approved companies only
const searchCompanies = async (query: string) => {
  // MeiliSearch or Firestore query
  return await webCompanyInformationSearch({
    query: query,
    filters: ['status = "approved"'],
    limit: 10,
    attributesToRetrieve: ['uid', 'company_name', 'company_name_en', 'company_logo', 'industry']
  });
};
```

---

## 14. Password Requirements

Use OLD system `PASSWORD_REGEX`:

```typescript
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
```

| Requirement | Description |
|-------------|-------------|
| Minimum length | 8 characters |
| Uppercase | At least 1 uppercase letter |
| Lowercase | At least 1 lowercase letter |
| Number | At least 1 digit |
| Special character | At least 1 of `@$!%*?&` |

### Strength Meter Logic

| Score | Level | Display |
|-------|-------|---------|
| 0-1 | Weak | Red bar (20%) |
| 2-3 | Medium | Orange bar (60%) |
| 4+ | Strong | Green bar (100%) |

Scoring:
- +1 for length ≥ 8
- +1 for uppercase
- +1 for lowercase
- +1 for number
- +1 for special character

---

## 15. OTP Rate Limiting

Preserve OLD system rate limits:

| Action | Limit | Window | Key Pattern |
|--------|-------|--------|-------------|
| Send OTP | 10 requests | 15 minutes | `otp_send_{email}_{IP}` |
| Verify OTP | 5 attempts | 5 minutes | `otp_verify_{refCode}_{IP}` |

OTP Configuration:
- Code: 6 digits
- Expiry: 15 minutes
- Reference code: 10 alphanumeric characters

---

## 16. Implementation Checklist

### Phase 1: Core Registration (P0)

- [ ] Page component setup (`app/auth/register/page.tsx`)
- [ ] Role selection cards with responsive layout
- [ ] Candidate Google OAuth button with loading state
- [ ] Candidate email form with OTP flow
  - [ ] Email input with existence check on blur
  - [ ] OTP send and verify
  - [ ] Password form with strength meter
- [ ] Terms checkbox with links
- [ ] Firebase Auth integration (createUser, Google OAuth)
- [ ] Session cookie creation (`login()` server action)
- [ ] Error handling (all error states)
- [ ] Basic routing (single role)

### Phase 2: Company Flow (P0)

- [ ] Company auth form (email only, no OAuth)
- [ ] Employer terms checkbox (additional)
- [ ] **Mode toggle tabs (Mode A / Mode B)**
- [ ] Company details form - Mode A (step 2)
  - [ ] Company name inputs (TH required, EN optional)
  - [ ] Registration number with Luhn validation
  - [ ] Industry dropdown (from master data)
  - [ ] Company size dropdown (5 options: S/M/L/XL/XXL)
  - [ ] Document upload to Firebase Storage (PDF/JPG/PNG ≤10MB)
- [ ] **Company details form - Mode B (step 2)**
  - [ ] **Company search input with debounce (min 2 chars)**
  - [ ] **Company search results dropdown (max 10 results)**
  - [ ] **Selected company display card with change button**
  - [ ] **Name card upload to Firebase Storage (JPG/PNG ≤5MB)**
- [ ] Create company request on submit (Mode A)
- [ ] **`StaffRequestApply()` integration (Mode B)**
- [ ] Pending confirmation card - Mode A (step 3)
- [ ] **Pending confirmation card - Mode B (step 3)**
- [ ] `navBarAtom` set to 'pending'

### Phase 3: Edge Cases (P1)

- [ ] Existing account detection on email blur
- [ ] "Add role" modal for different role exists
- [ ] Platform user rejection
- [ ] Step indicator component
- [ ] Query parameter handling (`?role`, `?email`, `?step`)
- [ ] Back button (step 2 → step 1)

### Phase 4: Referral System (P1)

- [ ] `?refCode` parameter handling
- [ ] Referral dialog after candidate creation
- [ ] `processCandidateReferral()` integration
- [ ] Wallet bonus awards (WALLET-005, WALLET-006)

### Phase 5: Enhancements (P2)

- [ ] OTP resend with countdown timer
- [ ] Password visibility toggle
- [ ] File upload progress indicator
- [ ] File preview with remove button
- [ ] Registration number duplicate check (against company_information)

### Phase 6: Future Stubs (P3 - Do Not Implement)

- [ ] **Company Staff Invitation Link** - Add stub comment in code
  - [ ] `?invite=[token]` parameter - parse but ignore
  - [ ] `targetCompany` field - do not write
  - [ ] `/auth/status?type=staff-pending` - page exists but no registration flow
  - [ ] Log warning if invitation params detected: "Staff invitation not yet supported"

### Phase 7: Testing

- [ ] Unit tests: Form validation
- [ ] Unit tests: OTP flow
- [ ] Unit tests: Password strength
- [ ] Unit tests: Luhn validation
- [ ] Integration tests: Firebase Auth
- [ ] Integration tests: File upload
- [ ] E2E tests: Full candidate flow
- [ ] E2E tests: Full company flow
- [ ] E2E tests: Error states
- [ ] Accessibility audit

---

## 17. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| OTP vs Firebase email | OTP (SendGrid) | Cost savings vs Firebase email templates | 2025-12-07 |
| OAuth providers | Google only (candidate) | Facebook pending, company = email only | 2025-12-07 |
| Password requirements | OLD PASSWORD_REGEX | Maintain security standards | 2025-12-07 |
| Registration number validation | Client-side format only | Human verification via uploaded docs | 2025-12-07 |
| Employer terms tracking | Future stub | Not legally required, single consent timestamp | 2025-12-07 |
| Referral system | Preserve CAND-014/015 | Existing feature with wallet integration | 2025-12-07 |
| Company document storage | Firebase Storage `companyProfile` bucket | Existing infrastructure | 2025-12-07 |
| Add role flow | Login first, then add | Simpler, more secure | 2025-12-07 |
| Candidate redirect | `/candidates/{uid}?tab=onboarding` | NEW design (OLD: `/candidates/{uid}/edit-profile`) | 2025-12-07 |
| Company pending redirect | `/auth/status?type=company-pending` | NEW design (OLD: `/companies/{targetCompany}/pending`) | 2025-12-07 |
| Company staff invitation | Future stub | Generated link feature doesn't exist in OLD, Mode B covers join flow | 2025-12-07 |
| **Company registration modes** | **Mode A + Mode B toggle** | **Preserve OLD feature: join existing company via search (AUTH-014, COMP-018)** | **2025-12-07** |

---

## 18. Related Routes

| Route | Relationship |
|-------|--------------|
| `/auth/login` | CTA for existing users |
| `/auth/status` | Pending user status page |
| `/auth/verify` | Email verification (if ever needed) |
| `/candidates/[id]` | Candidate post-registration destination |
| `/candidates/[id]/edit-profile` | Candidate onboarding |
| `/companies/[id]/dashboard` | Company post-approval destination |
| `/legal/privacy` | Privacy policy link |
| `/legal/terms` | Terms of service link |
| `/legal/employer-terms` | Employer terms link |

---

## 19. Open Questions (Resolved)

| Question | Resolution | Resolved By |
|----------|------------|-------------|
| OTP vs Firebase verification | OTP (SendGrid) for cost | Human input |
| Company email verification timing | OTP in auth form step | Human input |
| Password requirements | Use OLD PASSWORD_REGEX | Human input |
| Registration number validation | Client-side format check only | Human input |
| Document storage location | Firebase Storage `companyProfile` | Human input |
| Employer terms tracking | Future stub | Human input |
| Referral preservation | Yes, CAND-014/015 | Human input |
| Add role to existing account | Login first, then add from settings | Human input |

---

## Appendix A: TypeScript Types

```typescript
// Role selection
type RegistrationRole = 'candidate' | 'company';

// Registration form data - Candidate
interface CandidateRegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

// Registration form data - Company
interface CompanyRegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  employerTermsAccepted: boolean;
}

// Company details form data - Mode A
interface CompanyDetailsFormData {
  companyNameTH: string;
  companyNameEN?: string;
  registrationNumber: string;
  industry: string;
  companySize: 'S' | 'M' | 'L' | 'XL' | 'XXL';  // 1-10, 11-50, 51-200, 201-500, 500+
  document: File | null;
}

// Join company form data - Mode B
interface JoinCompanyFormData {
  selectedCompany: CompanySearchResult | null;
  nameCard: File | null;
}

// Company search result
interface CompanySearchResult {
  uid: string;
  company_name: string;
  company_name_en?: string;
  company_logo?: string;
  industry: string;
}

// Company registration mode
type CompanyRegistrationMode = 'new' | 'join';

// OTP state
interface OTPState {
  refCode: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

// Email existence check result
interface EmailExistsResult {
  exists: boolean;
  roles?: string[];
  sameRole?: boolean;
  isPlatformUser?: boolean;
}

// Registration error types
type RegisterErrorCode =
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'PASSWORD_MISMATCH'
  | 'TERMS_NOT_ACCEPTED'
  | 'EMPLOYER_TERMS_NOT_ACCEPTED'
  | 'INVALID_REG_NUMBER'
  | 'EMAIL_EXISTS_SAME_ROLE'
  | 'EMAIL_EXISTS_DIFFERENT_ROLE'
  | 'REG_NUMBER_EXISTS'
  | 'OTP_INVALID'
  | 'OTP_EXPIRED'
  | 'OTP_RATE_LIMITED'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'UPLOAD_FAILED'
  | 'NETWORK_ERROR'
  | 'OAUTH_FAILED'
  | 'POPUP_BLOCKED'
  | 'PLATFORM_USER'
  // Mode B errors
  | 'COMPANY_NOT_FOUND'
  | 'ALREADY_COMPANY_MEMBER'
  | 'PENDING_REQUEST_EXISTS'
  | 'NAME_CARD_TOO_LARGE'
  | 'INVALID_NAME_CARD_TYPE';

interface RegisterError {
  code: RegisterErrorCode;
  message: string;
  field?: string;
  recoveryAction?: 'retry' | 'login' | 'contact_support' | 'wait' | 'fix_input';
  countdown?: number;
}

// Query parameters
interface RegisterQueryParams {
  role?: 'candidate' | 'company';
  email?: string;
  step?: 'account' | 'company' | 'pending';
  mode?: 'new' | 'join';  // Company registration mode (step 2+)
  refCode?: string;
}

// Wizard step
type RegistrationStep = 1 | 2 | 3;

// Company size options
const COMPANY_SIZES = [
  { value: 'S', label: '1-10 คน' },
  { value: 'M', label: '11-50 คน' },
  { value: 'L', label: '51-200 คน' },
  { value: 'XL', label: '201-500 คน' },
  { value: 'XXL', label: '500+ คน' },
] as const;
```

---

## Appendix B: Server Actions

> **Source:** features_authentication.md (Server Actions section), features_companies.md (COMP-003, COMP-018)

### B.1 Authorization Patterns

All server actions use Higher-Order Functions (HOFs) for consistent authentication:

| HOF | Use Case | How It Works |
|-----|----------|--------------|
| `withServerActionAuth` | Protected server actions | Extracts UID from session cookie, passes to action |
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

> **Source:** features_authentication.md (Security Features - Authentication Patterns)

### B.2 Server Action Signatures

```typescript
// OTP Management (PUBLIC - no auth required)
async function sendVerificationOTPEmail(email: string): Promise<{
  success: boolean;
  refCode?: string;
  error?: string;
}>;
// Authorization: None (public action for registration)
// Rate Limited: Yes (10 requests per 15 min per IP+email)

async function verifyOTPCode(refCode: string, otpCode: string): Promise<{
  code: number;  // 200=success, 403=expired/invalid, 429=rate limited
  message: string;
}>;
// Authorization: None (public action)
// Rate Limited: Yes (5 attempts per 5 min per refCode+IP)
// Side Effect: Sets `otpVerified` cookie on success

// Email Check (PUBLIC - no auth required)
async function checkIfEmailExisted(email: string): Promise<{
  code: number;  // 200=own, 204=not found, 403=used by other
  message: string;
  data?: {
    uid: string;
    roles: string[];
  };
}>;
// Authorization: None (public action for registration check)
// Note: Returns roles to differentiate same-role vs different-role scenarios

// Account Creation (PROTECTED after Firebase Auth)
async function UserAccountSet(
  token: string, 
  userData: Partial<userDataProps>
): Promise<void>;
// Authorization: Validates token with Firebase Admin SDK
// Note: Token is Firebase ID token from client auth
// Security: Whitelists safe fields, preserves protected fields from DB

// Candidate Account Creation (PROTECTED)
async function createCandidateAccount(): Promise<{
  data: string;  // UID
  status: number;
  message?: string;
}>;
// Authorization: withServerActionAuth (requires valid session)
// Side Effects: Creates user_accounts, candidate_information, pockets, wallet_transactions
// Note: Idempotent - returns existing account if already exists

// Company Request - Mode A (PROTECTED)
async function CreateNewCompany(data: {
  companyName: string;
  companyNameEn?: string;
  taxId: string;
  jobIndustry: string;
  companySize: string;
  profilePhoto: string;  // Uploaded doc URL
}): Promise<{ success: boolean; companyId?: string }>;
// Authorization: withServerActionAuth
// UID Source: auth.user.uid (from session, cannot be spoofed)
// Side Effects: Creates company_information, address, contact docs

// Join Company Request - Mode B (PROTECTED)
async function StaffRequestApply(data: {
  targetCompany: string;
  nameCardUrl: string;
}): Promise<{ success: boolean; error?: string }>;
// Authorization: withServerActionAuth
// UID Source: auth.user.uid (from session, cannot be spoofed)
// Side Effects: Updates user_accounts.transfer, sets pending role
// IDOR Protection: Cannot request for different UID

// Company Search - Mode B (PUBLIC)
async function searchCompanies(query: string): Promise<{
  results: Array<{
    uid: string;
    company_name: string;
    company_name_en?: string;
    company_logo?: string;
    industry: string;
  }>;
}>;
// Authorization: None (public search for approved companies)
// Filter: Only returns status='approved' and is_active=true companies

// Session (PUBLIC - creates session)
async function login(idToken: string): Promise<{ 
  success: boolean; 
  error?: string 
}>;
// Authorization: Validates Firebase ID token with Admin SDK
// Side Effect: Creates httpOnly session cookie (1 hour expiry)

// Referral (PROTECTED)
async function processCandidateReferral(refCode: string): Promise<{
  success: boolean;
  error?: string;
}>;
// Authorization: withServerActionAuth
// UID Source: auth.user.uid
// Side Effects: Awards coins to both parties, updates referral records
```

### B.3 Industry Dropdown Data

> **Source:** features_authentication.md (AUTH-014), master data management

**Collection:** `master_job_industries`

**Document Structure:**
```typescript
interface MasterJobIndustry {
  uid: string;           // Document ID
  name: string;          // Thai name (e.g., "เทคโนโลยีสารสนเทศ")
  name_en?: string;      // English name (optional)
  is_active: boolean;    // Whether to show in dropdown
  sort_order?: number;   // Display order
}
```

**Server Action:**
```typescript
async function getMasterJobIndustries(): Promise<MasterJobIndustry[]>;
// Authorization: None (public master data)
// Caching: SWR key 'master-job-industries', long stale time
```

**Dropdown Display:**
- Sort by `sort_order` ascending, then `name` alphabetically
- Show Thai name in dropdown
- Store `uid` as form value (not the name string)

---

## Appendix C: Validation Schemas

```typescript
import { z } from 'zod';

// Email validation
const EmailSchema = z.string().email('รูปแบบอีเมลไม่ถูกต้อง');

// Password validation (matching OLD PASSWORD_REGEX)
const PasswordSchema = z.string()
  .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
  .regex(/[a-z]/, 'ต้องมีตัวอักษรพิมพ์เล็ก')
  .regex(/[A-Z]/, 'ต้องมีตัวอักษรพิมพ์ใหญ่')
  .regex(/\d/, 'ต้องมีตัวเลข')
  .regex(/[@$!%*?&]/, 'ต้องมีอักขระพิเศษ (@$!%*?&)');

// Registration number (13-digit Luhn)
const RegistrationNumberSchema = z.string()
  .length(13, 'เลขทะเบียนต้องมี 13 หลัก')
  .regex(/^\d+$/, 'เลขทะเบียนต้องเป็นตัวเลขเท่านั้น')
  .refine(luhnCheck, 'เลขทะเบียนไม่ถูกต้อง');

// OTP validation
const OTPSchema = z.string()
  .length(6, 'รหัส OTP ต้องมี 6 หลัก')
  .regex(/^\d+$/, 'รหัส OTP ต้องเป็นตัวเลขเท่านั้น');

// Luhn check function
function luhnCheck(value: string): boolean {
  let sum = 0;
  let isEven = false;
  for (let i = value.length - 1; i >= 0; i--) {
    let digit = parseInt(value[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

// Full candidate registration schema
const CandidateRegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  confirmPassword: z.string(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'กรุณายอมรับข้อกำหนด' }),
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

// Full company registration schema
const CompanyRegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  confirmPassword: z.string(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'กรุณายอมรับข้อกำหนด' }),
  }),
  employerTermsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'กรุณายอมรับข้อกำหนดสำหรับนายจ้าง' }),
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

// Company details schema - Mode A
const CompanyDetailsSchema = z.object({
  companyNameTH: z.string().min(1, 'กรุณาระบุชื่อบริษัท'),
  companyNameEN: z.string().optional(),
  registrationNumber: RegistrationNumberSchema,
  industry: z.string().min(1, 'กรุณาเลือกประเภทธุรกิจ'),
  companySize: z.enum(['S', 'M', 'L', 'XL', 'XXL']),
  document: z.instanceof(File, { message: 'กรุณาอัพโหลดเอกสาร' }),
});

// Join company schema - Mode B
const JoinCompanySchema = z.object({
  selectedCompany: z.object({
    uid: z.string(),
    company_name: z.string(),
  }, { required_error: 'กรุณาเลือกบริษัท' }),
  nameCard: z.instanceof(File, { message: 'กรุณาอัพโหลดนามบัตร' })
    .refine(
      file => file.size <= 5 * 1024 * 1024, 
      'ไฟล์ใหญ่เกิน 5MB'
    )
    .refine(
      file => ['image/jpeg', 'image/png'].includes(file.type),
      'รองรับเฉพาะ JPG, PNG'
    ),
});
```

---

*End of RIS: /auth/register (AUTH-R02)*
