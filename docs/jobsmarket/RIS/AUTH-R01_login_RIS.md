# RIS: /auth/login

**Route ID:** AUTH-R01  
**Version:** 1.4  
**Status:** Draft  
**Created:** 2025-12-07  
**Last Updated:** 2025-12-09

**Changes in v1.4:**
- Added Cross-References section linking to AUTH-R00 shared patterns
- Renamed `navBarAtom` → `activeRoleAtom` per AUTH-R00 atom naming convention

**Changes in v1.3:**
- Added Section 6.1 Page State Transition Table (5-column format per RIS_ORCHESTRATOR_GUIDE.md)
- Replaced Section 6.2 Component States with Component State Automaton (5-column format)

**Changes in v1.2:**
- Fixed collection name: `web_candidate_data` → `candidate_information`
- Updated platform routes: `/admin/dashboard` → `/platform/dashboard`
- Confirmed rate limit behavior: Firebase does not return countdown value

**Changes in v1.1:**
- Added Section 6.3: Already-Authenticated User Handling (Task 1)
- Added Section 9.1: `navigateUserByRole()` Full Specification (Task 2)
- Added Section 14.1: Session Cookie Specification (Task 3)
- Added Section 10.4: New User Auto-Creation Flow (Task 5)
- Added Section 4.4: Account Status Fields (Task 6)
- Updated Section 9: Fixed `/auth/deleted` → `/auth/status?type=deleted` (Task 14)
- Added Section 10.5: Partial Failure Handling (Task 13)
- Added Section 14.2: Rate Limiting Details (Task 15)
- Expanded Appendix A with `userDataProps` interface (Task 4)
- Expanded Appendix B with server action details
- Added Section 9.5: Pending User Routing Details (Task 16)
- Clarified consent timing in Section 11 (Task 7, 10)
- Added Section 7.2: Parameter Priority (Task 9)
- Added multi-company clarification (Task 8)
- Added login timestamp field (Task 12)
- Added account linking details (Task 11)

---

## Cross-References

This document references shared specifications from **AUTH-R00_cross-cutting_RIS.md**.

| Topic | AUTH-R00 Section |
|-------|------------------|
| Server actions architecture | Section 1 |
| Error UX standards (toast vs inline) | Section 2 |
| **Session cookie specification** | **Section 3** |
| Global atoms (including `activeRoleAtom`) | Section 4 |
| **Rate limiting (Firebase + OTP)** | **Section 5** |
| i18n & Thai copy guidelines | Section 6 |
| Analytics events | Section 7 |
| **Role semantics & navigation priority** | **Section 9** |
| Query parameter conventions | Section 12 |
| Error code → message mapping | Appendix A |
| Thai copy reference | Appendix B |
| Server action signatures | Appendix C |


## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/auth/login` |
| Shell | Minimal Shell |
| Purpose | Unified login with smart post-auth routing |
| Complexity | Medium |
| Phase | 1 (Foundation) |
| UI Spec | `03-auth-routes.md` Section 4.1 |

---

## 2. Domain Classification

### Primary Domain: Authentication

- **Owns:** User authentication flow, session creation
- **Mutations:**
  - Firebase Auth sign-in (Google OAuth, Email/Password)
  - Session cookie creation (`login()` server action)
  - `user_accounts.updated_at` timestamp update
  - Consent timestamp logging

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Candidate | Post-login routing | Read `roles` array |
| Company | Post-login routing | Read `roles`, `company_id`, `target_company` |

### Global Domains

| Domain | Requirement |
|--------|-------------|
| Auth | This route IS the auth entry point |
| Chat | Not available (pre-auth) |
| Notifications | Not available (pre-auth) |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Old Route | Coverage | Notes |
|------------|--------------|-----------|----------|-------|
| AUTH-001 | Social Login (Google) | `/auth/social` | Full | Google OAuth button, auto-creates account |
| AUTH-002 | Email/Password (Candidate) | `/auth/social` (tab) | Full | Email form |
| AUTH-003 | Email/Password (Company) | `/auth/email/sign-in` | Full | Merged, terms required |
| AUTH-010 | Session Management | Middleware | Full | 1-hour httpOnly cookie |
| AUTH-016 | Role-Based Navigation | `navigateUserByRole()` | Full | Smart routing |

### Deprecated Features

| Feature | Old Route | Reason | Future |
|---------|-----------|--------|--------|
| Facebook OAuth | `/auth/social` | Meta approval pending | Re-enable when approved |

### New Features (Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| Unified Login | Merge candidate + company routes | P0 |
| Query Parameters | `?method`, `?redirect`, `?context`, `?invite`, `?email` | P0 |
| Context Explanation | Explain mismatch before redirect | P1 |
| Multi-role Detection | Route to `/auth/select-role` | P0 |

### Future Features (Stub Only)

| Feature | Description | Stub Behavior |
|---------|-------------|---------------|
| 2FA Flow | Platform admin 2FA | Check returns `true` (bypass) |
| Facebook OAuth | Social login | Button hidden/disabled |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition |
|------|------------|--------|-----------|
| User Account | `user_accounts` | `uid`, `email`, `roles`, `company_id`, `target_company`, `is_active`, `updated_at` | After Firebase auth |
| User Info | `user_info` | `roles`, `isVerified`, `isOnboarded`, `companyId` | After Firebase auth |
| Invite Token | `admin_invitations` or `company_invitations` | `status`, `expiresAt` | If `?invite` param |

### 4.2 Write Operations

| Action | Collection | Field | Server Action | Trigger |
|--------|------------|-------|---------------|---------|
| Update login timestamp | `user_accounts` | `updated_at` | Implicit via `UserAccountGet()` | Successful auth |
| Create session | Cookie | `session` | `login(idToken)` | After Firebase auth + ID token |
| Log consent | `consent_records` | Multiple | `logConsentTimestamp()` | After terms accepted |
| Create new user | `user_accounts` + `candidate_information` | Multiple | Auto in OAuth flow | First-time Google OAuth |

**Source:** `features_authentication.md` AUTH-001 Side Effects

### 4.3 Firebase Auth Operations

| Operation | Method | Trigger |
|-----------|--------|---------|
| Google Sign In | `signInWithPopup(GoogleAuthProvider)` | Google button click |
| Email Sign In | `signInWithEmailAndPassword()` | Form submit |
| Get ID Token | `getIdToken()` | After sign-in success |

### 4.4 Account Status Fields

**Source:** `features_authentication.md` - Database Collections (lines 1256-1272)

The `roles` array in `user_accounts` contains status flags (not a separate status field):

| Role Value | Meaning | Check |
|------------|---------|-------|
| `candidate` | Has candidate profile | `roles.includes('candidate')` |
| `company` | Has company role | `roles.includes('company')` |
| `admin` | Company admin | `roles.includes('admin')` |
| `pending` | Awaiting approval | `roles.includes('pending')` |
| `deleted` | Account in deletion grace period | `roles.includes('deleted')` |
| `chancedee` | Platform staff/admin | `roles.includes('chancedee')` |

**Status Detection Timing:** Checked AFTER `UserAccountGet()` returns user data, BEFORE navigation.

**Related fields for pending state:**
- `target_company` - Company ID user is waiting to join (transfer target)
- `transfer_approved` - Boolean, set when approved
- `request_timestamp` - When transfer was requested

**Suspension Records:** Stored in `suspension_records` subcollection under `candidate_screening`. Contains `reason`, `duration`, `status`, `adminId`. However, login flow checks `roles` array, not this subcollection directly.

**Source:** `data-entities_suspension-records.md`

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose | Set When |
|------|------|-----|---------|----------|
| `firebaseUserAtom` | `User \| null` | R/W | Firebase user object | Auth state change |
| `userAtom` | `userDataProps \| null` | R/W | Full user data | After data fetch |
| `activeRoleAtom` | `'anonymous' \| 'candidate' \| 'company' \| 'chancedee' \| 'pending'` | W | Navigation context | Before redirect |
| `sessionStateAtom` | `'valid' \| 'expired' \| 'none' \| 'validating'` | R/W | Session status | After login |
| `authInitializedAtom` | `boolean` | W | Auth init complete | After init |

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useFirebaseAuth` | `{ user, userChancedee, signOutFirebase, navigateUserByRole, refreshUserData, loading }` | Core auth orchestration |
| `useSessionRenewal` | Session management | Auto-renewal (not used directly here) |

**Source:** `state-inventory_hooks-global.md` lines 20-134

### 5.3 SWR Keys

| Key Pattern | Fetcher | Config | Populated When |
|-------------|---------|--------|----------------|
| `user-data-${uid}` | `/api/user-data/${uid}` | `{ revalidateOnFocus: false, dedupingInterval: 2000, errorRetryCount: 3 }` | After successful login |

**Note:** Key pattern is NOT using centralized factory (per `state-inventory_hooks-global.md` line 42)

### 5.4 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `email` | `string` | `''` or from `?email` | Email input |
| `password` | `string` | `''` | Password input |
| `termsAccepted` | `boolean` | `false` | PDPA consent checkbox |
| `isLoading` | `boolean` | `false` | Submit loading state |
| `error` | `LoginError \| null` | `null` | Error display |
| `showPassword` | `boolean` | `false` | Password visibility toggle |

---

## 6. UI State Machine

### 6.1 Page State Automaton

```
                                    ┌─────────────────┐
                                    │   CHECK_AUTH    │
                                    │ (initial load)  │
                                    └────────┬────────┘
                                             │
                        ┌────────────────────┼────────────────────┐
                        │                    │                    │
                        ▼                    ▼                    ▼
               ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
               │  ALREADY_AUTH  │   │     IDLE       │   │  SHOW_MESSAGE  │
               │ (redirect out) │   │ (show form)    │   │ (context info) │
               └────────────────┘   └───────┬────────┘   └───────┬────────┘
                                            │                    │
                                            │         user acknowledges
                                            │                    │
                                            ▼                    ▼
                                    ┌────────────────┐          │
                        ┌───────────│ AUTHENTICATING │◄─────────┘
                        │           │  (loading)     │
                        │           └───────┬────────┘
                        │                   │
              error     │                   │ success
                        │                   │
                        ▼                   ▼
               ┌────────────────┐   ┌────────────────┐
               │     ERROR      │   │    ROUTING     │
               │ (show message) │   │ (determining   │
               └───────┬────────┘   │  destination)  │
                       │            └───────┬────────┘
                       │                    │
              retry    │                    │
                       │                    ▼
                       │            ┌────────────────┐
                       └───────────►│   REDIRECTING  │
                                    │ (navigate out) │
                                    └────────────────┘
```

#### Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `CHECK_AUTH` | `AUTH_INITIALIZED` | `ALREADY_AUTH` | sessionState === 'valid' && firebaseUser exists | - |
| `CHECK_AUTH` | `AUTH_INITIALIZED` | `IDLE` | sessionState !== 'valid' && no ?context mismatch | - |
| `CHECK_AUTH` | `AUTH_INITIALIZED` | `SHOW_MESSAGE` | ?context param present && user lacks that role | - |
| `ALREADY_AUTH` | `AUTO_REDIRECT` | `REDIRECTING` | - | navigateUserByRole('auto') |
| `SHOW_MESSAGE` | `USER_ACKNOWLEDGE` | `IDLE` | - | - |
| `SHOW_MESSAGE` | `USER_CANCEL` | `REDIRECTING` | - | router.push('/auth/register') |
| `IDLE` | `GOOGLE_CLICK` | `AUTHENTICATING` | termsAccepted === true | signInWithPopup() |
| `IDLE` | `GOOGLE_CLICK` | `IDLE` | termsAccepted === false | show terms error toast |
| `IDLE` | `EMAIL_SUBMIT` | `AUTHENTICATING` | form.isValid && termsAccepted | signInWithEmailAndPassword() |
| `IDLE` | `EMAIL_SUBMIT` | `IDLE` | !form.isValid | show validation errors |
| `AUTHENTICATING` | `AUTH_SUCCESS` | `ROUTING` | - | getIdToken(), login(), UserAccountGet(), logConsentTimestamp() |
| `AUTHENTICATING` | `AUTH_ERROR` | `ERROR` | - | setError(errorMessage) |
| `ROUTING` | `STATUS_DELETED` | `REDIRECTING` | roles.includes('deleted') | router.replace('/auth/status?type=deleted') |
| `ROUTING` | `STATUS_PENDING` | `REDIRECTING` | roles.includes('pending') | route to pending destination |
| `ROUTING` | `MULTI_ROLE` | `REDIRECTING` | roles includes both candidate & company && !savedPreference | router.replace('/auth/select-role') |
| `ROUTING` | `SINGLE_ROLE` | `REDIRECTING` | - | navigateUserByRole(), set activeRoleAtom |
| `ERROR` | `RETRY` | `IDLE` | - | clearError() |
| `ERROR` | `DISMISS` | `IDLE` | - | clearError() |

### 6.2 Component State Automaton

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| `GoogleButton` | `idle` | `CLICK` | `loading` | termsAccepted === true |
| `GoogleButton` | `idle` | `CLICK` | `idle` | termsAccepted === false |
| `GoogleButton` | `loading` | `AUTH_SUCCESS` | `idle` | - |
| `GoogleButton` | `loading` | `AUTH_ERROR` | `idle` | - |
| `GoogleButton` | `idle` | `DISABLE` | `disabled` | isSubmitting === true |
| `GoogleButton` | `disabled` | `ENABLE` | `idle` | isSubmitting === false |
| `EmailForm` | `idle` | `INPUT_CHANGE` | `idle` | - |
| `EmailForm` | `idle` | `BLUR` | `validating` | - |
| `EmailForm` | `validating` | `VALID` | `idle` | validation passes |
| `EmailForm` | `validating` | `INVALID` | `error` | validation fails |
| `EmailForm` | `idle` | `SUBMIT` | `submitting` | form.isValid && termsAccepted |
| `EmailForm` | `error` | `SUBMIT` | `submitting` | form.isValid && termsAccepted |
| `EmailForm` | `submitting` | `SUCCESS` | `idle` | - |
| `EmailForm` | `submitting` | `ERROR` | `error` | - |
| `TermsCheckbox` | `unchecked` | `TOGGLE` | `checked` | - |
| `TermsCheckbox` | `checked` | `TOGGLE` | `unchecked` | - |
| `PasswordField` | `hidden` | `TOGGLE_VISIBILITY` | `visible` | - |
| `PasswordField` | `visible` | `TOGGLE_VISIBILITY` | `hidden` | - |
| `ErrorAlert` | `hidden` | `SHOW_ERROR` | `visible` | error !== null |
| `ErrorAlert` | `visible` | `DISMISS` | `hidden` | - |
| `ErrorAlert` | `visible` | `RETRY` | `hidden` | - |

### 6.3 Already-Authenticated User Handling

**Source:** `03-auth-routes.md` Line 204, `state-inventory_hooks-global.md` lines 90-119

When a user who is already logged in visits `/auth/login`:

| Check | Method | Result |
|-------|--------|--------|
| Firebase user exists | `onAuthStateChanged` listener in `useFirebaseAuth` | If user → check session |
| Session cookie valid | `hasSessionCookie()` server action | If valid → redirect |
| Redirect destination | `navigateUserByRole('auto')` | Smart routing based on roles |

**Detection Flow (from `useFirebaseAuth` initAuth logic):**
```
Page Load
  │
  ├─ 1. Check if auth already initialized (authInitializedAtom)
  │     └─ If yes → skip initialization
  │
  ├─ 2. Check current Firebase user (getFirebaseAuth().currentUser)
  │     └─ If user exists → verify token is valid
  │
  ├─ 3. If no user OR invalid token:
  │     └─ Try session authentication via authenticateSession()
  │
  ├─ 4. Set authInitialized = true
  │
  └─ 5. Firebase onAuthStateChanged listener handles ongoing state
        ├─ If user exists → update firebaseUserAtom
        └─ If user is null:
            ├─ Skip if auth not initialized (restoration in progress)
            ├─ Check for session cookie (SSO case)
            │   └─ If session exists → restore Firebase user via signInWithCustomToken
            └─ If no session → clear state, set sessionState to 'none'
```

**When Already Authenticated:**
- Session state is `'valid'` AND Firebase user exists
- **No interstitial message shown** - immediate redirect
- Uses `navigateUserByRole('auto')` for destination

---

## 7. Query Parameters

| Param | Type | Purpose | Behavior |
|-------|------|---------|----------|
| `?method=social` | `string` | Highlight Google | Focus/scroll to Google button |
| `?method=email` | `string` | Email focus | Auto-focus email input |
| `?redirect=[url]` | `string` | Return URL | Validate against whitelist, redirect after auth |
| `?context=candidate` | `string` | Intended role | Route to candidate dashboard |
| `?context=company` | `string` | Intended role | Route to company dashboard (or register if no role) |
| `?context=admin` | `string` | Intended role | Route to platform dashboard (stub 2FA check) |
| `?invite=[token]` | `string` | Invitation | Process invite after login |
| `?email=[email]` | `string` | Pre-fill | Pre-populate email field |

### 7.1 URL Whitelist for `?redirect`

```typescript
const REDIRECT_WHITELIST = [
  /^\/candidates\/.*/,
  /^\/companies\/.*/,
  /^\/jobs\/.*/,
  /^\/chat.*/,
  /^\/notifications.*/,
  /^\/platform\/.*/,  // Only if user has 'chancedee' role
];
```

### 7.2 Parameter Priority

**Source:** `features_authentication.md` AUTH-016

**Processing order after successful login:**
1. **Already authenticated check** → Immediate redirect via `navigateUserByRole()`, ignores all params
2. **`?redirect`** takes highest priority (if URL passes whitelist validation)
3. **`?invite`** takes second priority → Route to invite processing
4. **`?context`** takes third priority → Attempt role-specific routing
5. **Default** → Role-based routing via `navigateUserByRole()`

**Conflict Resolution:**
- If `?redirect` AND `?context` both present: `?redirect` wins (if valid)
- If `?redirect` fails whitelist: Falls through to `?context`
- If `?context` role doesn't match user: Shows explanation message, offers registration

**Note:** `?redirect` validation includes role check for `/platform/*` URLs - only allowed if user has `'chancedee'` role.

---

## 8. Component-Action Wiring

| Component | Trigger | Action | Effect |
|-----------|---------|--------|--------|
| **Google Button** | Click | `signInWithPopup(GoogleAuthProvider)` | OAuth popup → Firebase auth → Create session → Route |
| **Email Form** | Submit | `signInWithEmailAndPassword()` | Validate → Firebase auth → Create session → Route |
| **Terms Checkbox** | Change | `setTermsAccepted(!termsAccepted)` | Update local state |
| **Forgot Link** | Click | `router.push('/auth/reset')` | Navigate to reset page |
| **Register Link** | Click | `router.push('/auth/register')` | Navigate to registration |
| **Show Password Toggle** | Click | `setShowPassword(!showPassword)` | Toggle input type |
| **Logo** | Click | `router.push('/')` | Navigate home |

### 8.1 Login Flow Sequence

**Source:** `features_authentication.md` AUTH-001, AUTH-002, AUTH-003; `state-inventory_hooks-global.md`

```
1. User clicks Google Button OR submits Email Form
   │
2. [If Email] Validate form (email format, password required, terms checked)
   │   └─ Terms validation: Client-side only (AUTH-003 preconditions)
   │
3. Firebase Auth: signInWithPopup() OR signInWithEmailAndPassword()
   │   └─ For new Google users: Firebase creates auth user with email_verified=true
   │
4. Get Firebase ID Token: getIdToken()
   │
5. Server Action: login(idToken) → Create session cookie
   │   ├─ Validates Firebase ID token with Admin SDK
   │   └─ Creates httpOnly cookie named 'session', 1-hour expiry
   │
6. Set sessionStateAtom = 'valid'
   │
7. Server Action: UserAccountGet(idToken) → Fetch user data
   │   ├─ For existing users: Returns user_accounts document
   │   └─ For new Google OAuth users: Auto-creates user_accounts + candidate_information
   │
8. [If Terms Checkbox Checked] logConsentTimestamp(uid)
   │   └─ Non-blocking - failure doesn't prevent login
   │
9. Set userAtom = userData
   │
10. Determine activeRoleAtom (priority: chancedee > pending > company > candidate)
    │
11. Check account status in userData.roles
    │   ├─ If 'deleted' → redirect to /auth/status?type=deleted
    │   └─ If 'pending' → route based on pending type
    │
12. Routing Logic (see Section 9)
    │
13. Navigate: window.location.replace(destination)
```

**Consent Timing Clarification (Task 7, 10):**
- Terms checkbox is visible on login form BEFORE authentication
- User must check terms before form submission is enabled
- Consent is logged AFTER successful Firebase auth AND session creation
- For Google OAuth: Terms checkbox applies same as email login
- UID source: From Firebase user object (`user.uid`) available after step 3

---

## 9. Post-Login Routing Logic

### 9.1 `navigateUserByRole()` Full Specification

**Source:** `features_authentication.md` AUTH-016, `state-inventory_hooks-global.md` lines 111-119

**Location:** `src/hooks/use-auth.ts`

**Signature:**
```typescript
navigateUserByRole(
  pageType: 'candidate' | 'company' | 'auto',
  refCode?: string | null,
  jobId?: string | null
): void
```

**Internal Logic (reconstructed from AUTH-016):**
```typescript
async function navigateUserByRole(pageType, refCode, jobId) {
  // 1. Get ID token and create session
  const idToken = await user.getIdToken();
  const sessionResult = await login(idToken);
  setSessionState('valid');

  // 2. Fetch user data
  const userData = await UserAccountGet(idToken);
  // Note: For new Google users, this auto-creates account

  // 3. Determine navbar mode (priority order)
  let navBarMode: string;
  if (userData.roles.includes('chancedee')) {
    navBarMode = 'chancedee';
  } else if (userData.roles.includes('pending')) {
    navBarMode = 'pending';
  } else if (userData.roles.includes('company') && userData.company_id) {
    navBarMode = 'company';
  } else if (userData.roles.includes('candidate')) {
    navBarMode = 'candidate';
  } else {
    navBarMode = 'anonymous';
  }
  setNavBar(navBarMode);

  // 4. Determine destination
  let destination: string;

  if (userData.roles.includes('chancedee')) {
    destination = '/platform/dashboard';
  } 
  else if (userData.roles.includes('deleted')) {
    destination = '/auth/status?type=deleted';
  } 
  else if (userData.roles.includes('pending')) {
    // See Section 9.5 for pending routing details
    if (userData.roles.includes('company') && 
        userData.roles.includes('admin') && 
        userData.target_company) {
      destination = `/companies/${userData.target_company}/pending`;
    } else {
      destination = '/auth/pending';
    }
  } 
  else if (pageType === 'company' && userData.company_id) {
    destination = `/companies/${userData.company_id}/dashboard`;
  } 
  else if (pageType === 'candidate' || userData.roles.includes('candidate')) {
    if (jobId) {
      destination = `/jobs/${jobId}`;
    } else {
      destination = `/candidates/${userData.uid}`;
    }
  } 
  else if (userData.roles.includes('company') && userData.company_id) {
    destination = `/companies/${userData.company_id}/dashboard`;
  } 
  else {
    destination = '/';
  }

  // 5. Hard navigation (not client-side routing)
  window.location.replace(destination);
}
```

**Atoms Read:**
- `firebaseUserAtom` - To get current user for `getIdToken()`

**Atoms Written:**
- `sessionStateAtom` - Set to `'valid'` after `login()` succeeds
- `activeRoleAtom` - Set based on role priority before redirect

**Server Actions Called:**
- `login(idToken)` - Create session cookie
- `UserAccountGet(idToken)` - Fetch user data

### 9.2 Routing Decision Tree

```
Login Success
      │
      ├─── Has ?redirect param ─────────► Validate URL
      │                                        ├─► Valid + role OK → Redirect to URL
      │                                        └─► Invalid/role mismatch → Ignore, continue
      │
      ├─── Has ?invite param ───────────► /auth/invite/process/[token]
      │
      ├─── Has ?context=admin ──────────► Check 'chancedee' in roles
      │                                        ├─► Yes → [2FA stub] → /platform/dashboard
      │                                        └─► No → Error toast + default routing
      │
      ├─── Has ?context=company ────────► Check company role + company_id
      │                                        ├─► Yes → /companies/[company_id]/dashboard
      │                                        └─► No → Explanation → /auth/register?role=company
      │
      ├─── Has ?context=candidate ──────► Check candidate role
      │                                        ├─► Yes → /candidates/[uid]
      │                                        └─► No → Explanation → /auth/register?role=candidate
      │
      └─── No context (default) ────────► navigateUserByRole('auto')
```

### 9.3 Routing Decision Table

| User Roles | Additional Condition | Redirect To | NavBar |
|------------|---------------------|-------------|--------|
| `['chancedee', ...]` | - | `/platform/dashboard` | `chancedee` |
| `['deleted', ...]` | - | `/auth/status?type=deleted` | - |
| `['company', 'admin', 'pending']` | Has `target_company` | `/companies/[target_company]/pending` | `pending` |
| `['company', 'pending']` | Staff invited, no admin | `/auth/status?type=staff-pending` | `pending` |
| `['pending']` | No company role | `/auth/pending` | `pending` |
| `['candidate']` only | - | `/candidates/[uid]` | `candidate` |
| `['company']` only | Has `company_id` | `/companies/[company_id]/dashboard` | `company` |
| `['candidate', 'company']` | Multi-role | `/auth/select-role` | - |
| `[]` (empty) | New user shouldn't reach this | `/` | `anonymous` |

### 9.4 NavBar Context Setting

| Destination Pattern | `activeRoleAtom` Value |
|---------------------|-------------------|
| `/platform/*` | `'chancedee'` |
| `/companies/*/pending` | `'pending'` |
| `/auth/pending`, `/auth/status*` | `'pending'` |
| `/companies/*` | `'company'` |
| `/candidates/*` | `'candidate'` |
| Default | `'anonymous'` |

### 9.5 Pending User Routing Details

**Source:** `features_authentication.md` AUTH-016, AUTH-015

| Pending Type | Roles Array | Additional Fields | Destination |
|--------------|-------------|-------------------|-------------|
| Company Admin (new company) | `['company', 'admin', 'pending']` | `target_company` set | `/companies/[target_company]/pending` |
| Company Staff (invited) | `['company', 'pending']` | `target_company` set | `/auth/status?type=staff-pending` |
| Generic Pending | `['pending']` | - | `/auth/pending` |
| Role Addition Pending | `['candidate', 'pending']` | Adding company role | `/auth/status?type=role-pending` |

**Detection Logic:**
```typescript
if (roles.includes('pending')) {
  if (roles.includes('company') && roles.includes('admin') && target_company) {
    // Company admin waiting for platform approval
    return `/companies/${target_company}/pending`;
  } else if (roles.includes('company') && target_company) {
    // Staff waiting for company admin approval
    return '/auth/status?type=staff-pending';
  } else {
    // Generic pending
    return '/auth/pending';
  }
}
```

### 9.6 Multi-Company Detection

**Source:** `data-entities_user-info.md`, `features_companies.md`

**Finding:** Users can only belong to ONE company at a time.

- `company_id` field is a single string reference, NOT an array
- Multi-role means `candidate` + `company`, NOT multiple companies
- To switch companies, user must go through transfer flow (detach from old, attach to new)

**Multi-role routing (candidate + company):**
- If user has both roles → `/auth/select-role`
- User chooses which context to enter
- Does NOT mean multiple companies

---

## 10. Error Handling

### 10.1 Error States Table

| Error Code | Condition | Thai Display | Position | Recovery |
|------------|-----------|--------------|----------|----------|
| `INVALID_CREDENTIALS` | Wrong email/password | "อีเมลหรือรหัสผ่านไม่ถูกต้อง" | Below password field | Clear password |
| `ACCOUNT_NOT_FOUND` | Email not registered | "ไม่พบบัญชี" + register link | Below email field | Offer registration |
| `ACCOUNT_DELETED` | `roles.includes('deleted')` | Redirect | - | → `/auth/status?type=deleted` |
| `COMPANY_PENDING` | Company approval pending | Redirect | - | Auto-redirect |
| `STAFF_PENDING` | Staff invitation pending | Redirect | - | Auto-redirect |
| `TOO_MANY_REQUESTS` | Rate limited (Firebase) | "ลองใหม่ใน 15 นาที" | Replace form | Wait timer |
| `POPUP_BLOCKED` | OAuth popup blocked | "Popup ถูกบล็อก" + fallback | Toast | Provide redirect link |
| `OAUTH_FAILED` | Google OAuth error | "เข้าสู่ระบบด้วย Google ไม่สำเร็จ" | Toast | Retry option |
| `EMAIL_EXISTS_PASSWORD` | Google email has password account | "อีเมลนี้ลงทะเบียนด้วยรหัสผ่าน" | Modal | Offer to link accounts |
| `NETWORK_ERROR` | Network failure | "เชื่อมต่อไม่สำเร็จ" | Toast | Retry button |
| `TERMS_NOT_ACCEPTED` | Terms checkbox unchecked | "กรุณายอมรับข้อกำหนด" | Below checkbox | Focus checkbox |
| `INVALID_INVITE` | Bad/expired invite token | "ลิงก์คำเชิญไม่ถูกต้อง" | Toast | Continue login normally |
| `CONTEXT_MISMATCH` | Role doesn't match context | Explanation message | Modal/Inline | Redirect to register |

### 10.2 Account Deleted Block

When `roles.includes('deleted')` detected after `UserAccountGet()`:
- Immediate redirect to `/auth/status?type=deleted`
- No error displayed on login page
- Status page shows recovery option if within 30-day grace period

**Source:** `03-auth-routes.md` lines 586-608

### 10.3 Firebase Error Mapping

```typescript
const FIREBASE_ERROR_MAP: Record<string, LoginErrorCode | null> = {
  'auth/invalid-email': 'INVALID_CREDENTIALS',
  'auth/user-not-found': 'ACCOUNT_NOT_FOUND',
  'auth/wrong-password': 'INVALID_CREDENTIALS',
  'auth/invalid-credential': 'INVALID_CREDENTIALS',
  'auth/too-many-requests': 'TOO_MANY_REQUESTS',
  'auth/popup-blocked': 'POPUP_BLOCKED',
  'auth/popup-closed-by-user': null,  // Silent, user cancelled
  'auth/network-request-failed': 'NETWORK_ERROR',
  'auth/account-exists-with-different-credential': 'EMAIL_EXISTS_PASSWORD',
};
```

### 10.4 New User Auto-Creation Flow (Google OAuth)

**Source:** `features_authentication.md` AUTH-001 (lines 71-75)

When a user logs in via Google OAuth and has no existing `user_accounts` document:

| Step | Action | Collection | Result |
|------|--------|------------|--------|
| 1 | Google OAuth succeeds | Firebase Auth | User created with `email_verified=true` |
| 2 | `login()` creates session | Cookie | Session established |
| 3 | `UserAccountGet(idToken)` called | - | Detects no document exists |
| 4 | Auto-create user account | `user_accounts` | Created with `roles: ['candidate']` |
| 5 | Auto-create candidate profile | `candidate_information` | Empty profile created |
| 6 | Return user data | - | `userDataProps` returned |
| 7 | Navigate | Router | → `/candidates/${uid}` (for onboarding) |

**This is NOT an error state** - it's the expected flow for new Google OAuth users.

**Post-creation routing:** New users go to `/candidates/${uid}` which triggers onboarding flow.

### 10.5 Partial Failure Handling

**Source:** `features_authentication.md` error handling patterns

| Failure Point | User Impact | Recovery |
|---------------|-------------|----------|
| Firebase auth succeeds, `login()` fails | No session cookie | Show error toast, offer retry |
| Session created, `UserAccountGet()` fails | Session exists but no user data | Clear session via `logout()`, show error, retry |
| Everything succeeds, consent log fails | User logged in | Log error server-side, **continue** (non-blocking) |
| Redirect URL invalid | User logged in | Fallback to role-based routing |

**Implementation Pattern:**
```typescript
try {
  // Step 1: Firebase auth (already completed)
  const idToken = await user.getIdToken();
  
  // Step 2: Create session - CRITICAL
  const sessionResult = await login(idToken);
  if (!sessionResult.success) {
    throw new Error('SESSION_CREATION_FAILED');
  }
  setSessionState('valid');
  
  // Step 3: Fetch user data - CRITICAL
  const userData = await UserAccountGet(idToken);
  if (!userData) {
    await logout(); // Clean up partial state
    throw new Error('USER_DATA_FETCH_FAILED');
  }
  setUserAtom(userData);
  
  // Step 4: Log consent - NON-BLOCKING
  if (termsAccepted) {
    logConsentTimestamp(userData.uid).catch(err => {
      console.error('Consent logging failed:', err);
      // Continue - don't block login
    });
  }
  
  // Step 5: Navigate
  navigateUserByRole('auto');
  
} catch (error) {
  setError(mapError(error));
  setIsLoading(false);
}
```

### 10.6 Account Linking Flow

**Source:** `features_authentication.md` AUTH-001

When Google OAuth email matches an existing password-only account:
- Firebase throws `auth/account-exists-with-different-credential`
- Map to `EMAIL_EXISTS_PASSWORD` error code
- Display modal with options:
  1. "เข้าสู่ระบบด้วยรหัสผ่าน" → Switch to email form, pre-fill email
  2. "เชื่อมต่อบัญชี" → Prompt for password, then link credentials

**Linking Process:**
1. User enters existing password
2. Sign in with email/password first
3. Link Google credential via `linkWithCredential()`
4. User now has both providers available

**Note:** Firebase handles the actual linking. Our code needs to orchestrate the UI flow.

---

## 11. PDPA Consent Handling

### Consent Requirement

**Decision:** Terms acceptance required at EVERY login session for both user types.

**Rationale:** Maximum legal protection under Thailand PDPA. Creates undeniable consent chain.

### Consent UI Timing

| Login Method | Terms Visibility | Validation |
|--------------|------------------|------------|
| Email/Password | Checkbox visible on form BEFORE submit | Client-side, must be checked |
| Google OAuth | Checkbox visible BEFORE clicking button | Client-side, must be checked |

**Source:** `features_authentication.md` AUTH-003 preconditions

### Consent UI Components

| Component | Purpose | Validation |
|-----------|---------|------------|
| Terms Checkbox | ☐ ยอมรับข้อกำหนดและนโยบายความเป็นส่วนตัว | Must be checked |
| Terms Link | "ข้อกำหนด" | Opens `/legal/terms` |
| Privacy Link | "นโยบายความเป็นส่วนตัว" | Opens `/legal/privacy` |

### Consent Logging

**Timing:** AFTER successful Firebase auth AND session creation, BEFORE navigation.

**UID Source:** From Firebase user object (`user.uid`) - available after Firebase auth succeeds.

```typescript
interface ConsentLog {
  uid: string;                    // From user.uid
  user_id?: string;               // Same as uid for authenticated users
  session_id: string;             // UUID v4
  consent_type: 'login_session';
  policy_version: string;         // e.g., "2.0"
  consent_method: 'settings_page' | 'banner' | 'api';
  preferences: {
    essential: true;              // Always true
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  };
  ip_hash: string;                // SHA256 first 16 chars
  user_agent: string;
  is_active: true;
  version_number: number;         // Increments per update
  change_reason: 'initial' | 'user_update';
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

**Source:** `features_consent.md` CONSENT-002, `data-entities_consent-records.md`

### Consent Validation

| Validation | Location | Behavior |
|------------|----------|----------|
| Checkbox checked | Client-side | Prevent form submission if unchecked |
| Server validation | **NONE** | Terms not validated server-side per AUTH-003 |

**Note:** This is a potential security gap - client could bypass checkbox. Consider adding server validation in future.

---

## 12. Accessibility Requirements

| Requirement | Implementation |
|-------------|---------------|
| Keyboard Navigation | Tab order: Google → Email → Password → Terms → Forgot → Login → Register |
| Focus Management | Auto-focus based on `?method` param |
| Screen Reader | ARIA labels on all inputs, error announcements |
| Error Announcement | `role="alert"` on error messages |
| Form Labels | Visible labels, not just placeholders |
| Color Contrast | WCAG AA minimum (4.5:1) |
| Touch Targets | Minimum 44×44px for mobile |

---

## 13. Performance Considerations

| Concern | Mitigation |
|---------|------------|
| OAuth Popup Delay | Show loading state immediately on click |
| Session Creation | Optimistic UI - show loading, redirect on success |
| User Data Fetch | SWR with 2-second deduping |
| Bundle Size | Lazy load OAuth providers |
| Rate Limit Check | Client-side countdown timer to prevent wasted requests |

---

## 14. Security Considerations

| Concern | Mitigation |
|---------|------------|
| Session Hijacking | httpOnly, Secure, SameSite cookies |
| CSRF | Firebase handles token-based auth |
| Rate Limiting | Firebase Auth built-in + custom OTP limits |
| Password Exposure | Password field type, no logging |
| Redirect Attacks | Whitelist validation for `?redirect` param |
| OAuth State | Firebase handles state parameter |
| Token Expiry | 1-hour session, refresh via `useSessionRenewal` |

### 14.1 Session Cookie Specification

**Source:** `features_authentication.md` AUTH-010 (lines 637-696), Security Features (lines 1239-1243)

| Property | Value |
|----------|-------|
| Cookie Name | `session` |
| httpOnly | `true` |
| Secure | `true` (production only) |
| SameSite | `lax` |
| Path | `/` |
| Max-Age | 3600 (1 hour) |
| Domain | Auto (current domain) |

**Created by:** `login(idToken)` server action  
**Location:** `src/domains/authentication/services/server/actions/auth-session.ts`

**Validation:** Firebase Admin SDK token verification

**Renewal:** Activity-based via `useSessionRenewal` hook - extends on user activity

**Cleanup:**
- On logout: `logout()` server action clears cookie
- On expiration: Auto-redirect to `/auth/session-expired`
- On invalid token: Clear cookie and redirect

**localStorage (for activity tracking):**
- `sessionCreated` - Creation timestamp
- `lastActivity` - Last activity timestamp

### 14.2 Rate Limiting Details

**Source:** `features_authentication.md` Security Features (lines 1217-1226)

**Firebase Auth Rate Limiting (built-in):**
- Cannot be customized
- Triggers `auth/too-many-requests` error
- Approximately 5 failed attempts → lockout
- Lockout duration: Firebase does NOT provide unlock time; use fixed 15-minute message

**Custom OTP Rate Limiting (Redis-backed, for registration):**

| Operation | Limit | Window | Key Format |
|-----------|-------|--------|------------|
| OTP Request | 10 requests | 15 minutes | `otp_request_{email}_{IP}` |
| OTP Verify | 5 attempts | 5 minutes | `otp_verify_{refCode}_{IP}` |

**Configuration:** `src/lib/utils/server/rate-limiter.ts` (`RATE_LIMIT_CONFIGS`)

**Countdown Timer Implementation:**
- Firebase does NOT return a `retryAfter` value or specific unlock time
- Display fixed message: "ลองใหม่ใน 15 นาที"
- Client shows static message, not a countdown (no server value available)

---

## 15. Implementation Checklist

### Phase 1: Core Login (P0)

- [ ] Page component setup (`app/auth/login/page.tsx`)
- [ ] Login Card layout with responsive design
- [ ] Already-authenticated redirect check (Section 6.3)
- [ ] Google OAuth button with loading state
- [ ] Email/Password form with validation
- [ ] Terms checkbox with links
- [ ] Firebase Auth integration
- [ ] Session cookie creation (`login()` server action)
- [ ] Error handling (all error states from Section 10)
- [ ] Basic routing (single role)

### Phase 2: Smart Routing (P0)

- [ ] Query parameter parsing (`?method`, `?email`, `?context`)
- [ ] `navigateUserByRole()` implementation (Section 9.1)
- [ ] Multi-role detection → `/auth/select-role`
- [ ] Pending user routing (Section 9.5)
- [ ] `activeRoleAtom` setting before redirect
- [ ] `?redirect` URL validation with whitelist

### Phase 3: Edge Cases (P1)

- [ ] Context mismatch explanation modal
- [ ] Account deleted redirect (`/auth/status?type=deleted`)
- [ ] Rate limiting message display
- [ ] OAuth popup blocked fallback
- [ ] Partial failure handling (Section 10.5)
- [ ] Account linking modal (Section 10.6)

### Phase 4: Enhancements (P1)

- [ ] Invite token handling (`?invite`)
- [ ] PDPA consent logging
- [ ] 2FA stub (returns true)

### Phase 5: Testing

- [ ] Unit tests: Form validation
- [ ] Unit tests: Routing logic
- [ ] Integration tests: Firebase Auth
- [ ] E2E tests: Full login flow
- [ ] E2E tests: Error states
- [ ] Accessibility audit

---

## 16. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| OAuth providers | Google only | Facebook pending Meta approval | 2025-12-07 |
| Terms consent | Every session | Maximum PDPA legal protection | 2025-12-07 |
| Terms for both roles | Yes | Unified experience, legal consistency | 2025-12-07 |
| Context mismatch | Explain first | Better UX than silent redirect | 2025-12-07 |
| Expired invite | Treat as invalid | Simplify logic, toast + continue | 2025-12-07 |
| Rate limit message | 15 minutes | Firebase doesn't provide actual time | 2025-12-07 |
| Already logged in | Immediate redirect | No interstitial needed per UI spec | 2025-12-07 |
| 2FA | Future (stub) | Not existing feature | 2025-12-07 |
| Multi-role select | Always show | No default bypass per business rule | 2025-12-07 |
| Consent logging | Non-blocking | Failure shouldn't prevent login | 2025-12-07 |
| Deleted account route | `/auth/status?type=deleted` | Consolidated status page per UI spec | 2025-12-07 |
| Server-side terms validation | No (existing behavior) | Matches AUTH-003, consider future enhancement | 2025-12-07 |

---

## 17. Related Routes

| Route | Relationship |
|-------|--------------|
| `/auth/register` | CTA for new users |
| `/auth/reset` | Forgot password link |
| `/auth/select-role` | Multi-role routing target |
| `/auth/status` | Status page with type parameter |
| `/auth/status?type=deleted` | Deleted account display |
| `/auth/status?type=company-pending` | Company pending approval |
| `/auth/status?type=staff-pending` | Staff pending approval |
| `/auth/pending` | Generic pending state |
| `/auth/session-expired` | Session expiration handling |
| `/auth/2fa` | Future: Platform admin verification |
| `/auth/invite/process/[token]` | Invite handling |
| `/candidates/[id]` | Candidate post-login destination |
| `/companies/[id]/dashboard` | Company post-login destination |
| `/companies/[id]/pending` | Pending company admin destination |
| `/platform/dashboard` | Platform staff destination |

---

## 18. Open Questions

| Question | Status | Notes |
|----------|--------|-------|
| Server-side terms validation | ❓ Unclear | AUTH-003 shows client validation only. Should server also validate? Consider security enhancement. |
| Account linking UI details | ❓ Needs Design | Modal content, button labels, error states for linking flow need UI spec |
| Consent failure handling | ✅ Resolved | Non-blocking - log error server-side, continue with login |
| Multi-company support | ✅ Resolved | NOT supported - single `company_id` field. Multi-role ≠ multi-company. |
| Rate limit countdown value | ✅ Resolved | Firebase doesn't provide - use fixed "15 นาที" message |
| New Google user auto-creation | ✅ Resolved | Auto-creates `user_accounts` + `candidate_information` per AUTH-001 |

---

## Appendix A: TypeScript Types

```typescript
// User data from API - userDataProps
// Source: features_authentication.md Database Collections (lines 1256-1272)
interface userDataProps {
  uid: string;
  email: string;
  phone?: string;
  first_name_th?: string;
  last_name_th?: string;
  first_name_en?: string;
  last_name_en?: string;
  nick_name_th?: string;
  nick_name_en?: string;
  gender?: string;
  avatar_url?: string;
  citizen_id?: string;
  roles: Array<'candidate' | 'company' | 'admin' | 'pending' | 'deleted' | 'chancedee'>;
  company_id?: string;
  current_step?: number;
  current_step_name?: string;
  is_active?: boolean;
  is_policy_accepted?: boolean;
  target_company?: string;
  transfer_approved?: boolean;
  request_timestamp?: number;
  created_at: number;
  updated_at: number;
  created_by: string;
  updated_by: string;
}

// Login form data
interface LoginFormData {
  email: string;
  password: string;
  termsAccepted: boolean;
}

// Login error types
type LoginErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_NOT_FOUND'
  | 'ACCOUNT_DELETED'
  | 'TOO_MANY_REQUESTS'
  | 'POPUP_BLOCKED'
  | 'OAUTH_FAILED'
  | 'EMAIL_EXISTS_PASSWORD'
  | 'NETWORK_ERROR'
  | 'TERMS_NOT_ACCEPTED'
  | 'INVALID_INVITE'
  | 'CONTEXT_MISMATCH'
  | 'SESSION_CREATION_FAILED'
  | 'USER_DATA_FETCH_FAILED';

interface LoginError {
  code: LoginErrorCode;
  message: string;
  recoveryAction?: 'retry' | 'register' | 'contact_support' | 'wait' | 'link_accounts';
}

// Query parameters
interface LoginQueryParams {
  method?: 'social' | 'email';
  redirect?: string;
  context?: 'candidate' | 'company' | 'admin';
  invite?: string;
  email?: string;
}

// Post-login routing
type PostLoginDestination =
  | { type: 'redirect'; url: string }
  | { type: 'invite'; token: string }
  | { type: 'select-role' }
  | { type: 'status'; statusType: string }
  | { type: 'dashboard'; dashboardType: 'candidate' | 'company' | 'platform' | 'pending-company'; id: string };

// NavBar modes
type ActiveRoleMode = 'anonymous' | 'candidate' | 'company' | 'chancedee' | 'pending';
```

---

## Appendix B: Server Actions

**Source:** `features_authentication.md` API Endpoints (lines 1318-1333)

```typescript
// ============================================
// Session Management
// Location: src/domains/authentication/services/server/actions/auth-session.ts
// ============================================

/**
 * Create session cookie after Firebase authentication
 */
async function login(idToken: string): Promise<{ success: boolean; error?: string }>;
// - Validates Firebase ID token with Admin SDK
// - Creates httpOnly session cookie named 'session'
// - Cookie: httpOnly=true, secure=true (prod), sameSite=lax, maxAge=3600
// - Returns { success: true } or { success: false, error: string }

/**
 * Destroy session cookie
 */
async function logout(): Promise<void>;
// - Clears 'session' cookie
// - Clears localStorage sessionCreated, lastActivity
// - No return value

/**
 * Check if session cookie exists and is valid
 */
async function hasSessionCookie(): Promise<boolean>;
// - Checks if 'session' cookie exists
// - Validates with Firebase Admin SDK
// - Returns boolean

/**
 * Authenticate request using session cookie
 */
async function authenticateSession(options?: { 
  requireRoles?: string[] 
}): Promise<AuthResult>;
// - Validates session cookie
// - Optionally checks for required roles
// - Returns user profile if valid
// - Throws AuthenticationError if invalid

// ============================================
// User Management
// Location: src/domains/authentication/services/server/actions/user-management.ts
// ============================================

/**
 * Fetch user account data
 */
async function UserAccountGet(idToken: string): Promise<userDataProps>;
// - Validates ID token
// - Fetches from user_accounts collection
// - For new Google OAuth users: AUTO-CREATES account with roles=['candidate']
// - Also creates candidate_information document
// - Returns full userDataProps object

/**
 * Update user account data
 */
async function UserAccountSet(
  idToken: string, 
  userData: Partial<userDataProps>
): Promise<void>;
// - Validates ID token
// - WHITELISTS safe fields (IDOR protection)
// - Preserves protected fields from database
// - Updates updated_at timestamp

/**
 * Check if email is registered
 */
async function checkIfEmailExisted(email: string): Promise<{ 
  exists: boolean; 
  roles?: string[] 
}>;
// - Uses auth.user.uid internally (IDOR protected)
// - Returns roles if email exists (for "add role" flow)

// ============================================
// Consent Logging
// Location: src/lib/database/actions/consent-records.ts
// ============================================

/**
 * Record consent timestamp
 */
async function logConsentTimestamp(uid: string, consentData?: Partial<ConsentLog>): Promise<void>;
// - Creates record in consent_records collection
// - NON-BLOCKING - failure should not prevent login
// - Called after successful auth, before redirect
```

---

## Appendix C: Source References

| Section | Source File/Feature |
|---------|---------------------|
| Session cookie | `features_authentication.md` AUTH-010 (lines 637-696) |
| Session security | `features_authentication.md` Security Features (lines 1239-1243) |
| navigateUserByRole | `features_authentication.md` AUTH-016 (lines 1044-1109) |
| useFirebaseAuth hook | `state-inventory_hooks-global.md` (lines 20-134) |
| Roles array | `features_authentication.md` Database Collections (lines 1256-1272) |
| Already-auth handling | `03-auth-routes.md` Line 204 |
| New user auto-creation | `features_authentication.md` AUTH-001 (lines 71-75) |
| Rate limiting | `features_authentication.md` Security Features (lines 1217-1226) |
| Status routes | `03-auth-routes.md` Section 4.6 (lines 500-617) |
| Consent records | `features_consent.md` CONSENT-002 |
| Suspension records | `data-entities_suspension-records.md` |

---

*End of RIS: /auth/login (AUTH-R01) v1.4*
