# Route Implementation Plan: AUTH-R02

## Route: `/auth/register`
## RIS: `AUTH-R02_register_RIS.md`
## Related BLS: `BLS-01_onboarding.md` Section 3.2

---

## 1. Files to Create

| File | Purpose |
|------|---------|
| **Route & Layout** | |
| `src/app/jobsmarket/auth/register/page.tsx` | Registration route page (server component) |
| **Candidate Flow Components** | |
| `src/app/jobsmarket/auth/register/_components/RoleSelection.tsx` | Role selection cards (candidate vs company) |
| `src/app/jobsmarket/auth/register/_components/CandidateFlow.tsx` | Orchestrator for candidate registration |
| `src/app/jobsmarket/auth/register/_components/GoogleRegisterButton.tsx` | Google OAuth registration button |
| `src/app/jobsmarket/auth/register/_components/EmailForm.tsx` | Email input form with blur validation (calls checkEmailExists) |
| `src/app/jobsmarket/auth/register/_components/PasswordCreateForm.tsx` | Password + confirm password form |
| **Company Flow Components** | |
| `src/app/jobsmarket/auth/register/_components/CompanyFlow.tsx` | Orchestrator for company registration |
| `src/app/jobsmarket/auth/register/_components/CompanyDetailsForm.tsx` | Company info form with Mode A/B toggle |
| `src/app/jobsmarket/auth/register/_components/ModeToggle.tsx` | Toggle between Mode A (create) and Mode B (join) |
| `src/app/jobsmarket/auth/register/_components/CompanyModeA.tsx` | Create new company form |
| `src/app/jobsmarket/auth/register/_components/CompanyModeB.tsx` | Join existing company form |
| `src/app/jobsmarket/auth/register/_components/CompanySearch.tsx` | Searchable dropdown for existing companies |
| `src/app/jobsmarket/auth/register/_components/PendingSuccess.tsx` | Success card for pending approval |
| **Shared Components (Consider Moving to `src/components/jobsmarket/auth/`)** | |
| `src/components/jobsmarket/auth/OTPVerifyForm.tsx` | OTP 6-digit input + verify (shared with AUTH-R03, AUTH-R06) |
| `src/components/jobsmarket/auth/OTPResendButton.tsx` | Resend OTP with countdown timer (shared) |
| `src/components/jobsmarket/auth/PasswordStrengthMeter.tsx` | Real-time password strength display (shared with AUTH-R06) |
| **Route-Specific Components** | |
| `src/app/jobsmarket/auth/register/_components/StepIndicator.tsx` | Progress wizard indicator |
| `src/app/jobsmarket/auth/register/_components/FileUploadArea.tsx` | Drag-drop file upload (company doc + name card) |
| `src/app/jobsmarket/auth/register/_components/TermsCheckbox.tsx` | Terms acceptance checkbox with link |
| **State & Hooks** | |
| `src/store/jobsmarket/register-atoms.ts` | Registration-flow-specific Jotai atoms |
| `src/hooks/jobsmarket/use-register-candidate.ts` | Candidate registration hook |
| `src/hooks/jobsmarket/use-register-company.ts` | Company registration hook |
| `src/hooks/jobsmarket/use-otp-verification.ts` | OTP send/verify/resend logic |
| `src/hooks/jobsmarket/use-company-search.ts` | Company search hook (Mode B) |
| **Server Actions** | |
| `src/domains/authentication/services/server/actions/jobsmarket/register-candidate-action.ts` | Candidate account creation |
| `src/domains/authentication/services/server/actions/jobsmarket/register-company-action.ts` | Company account creation |
| `src/domains/authentication/services/server/actions/jobsmarket/check-email-action.ts` | Email existence check |
| `src/domains/companies/services/server/actions/jobsmarket/create-company-action.ts` | Create new company (Mode A) |
| `src/domains/companies/services/server/actions/jobsmarket/join-company-action.ts` | Join existing company (Mode B) |
| `src/domains/companies/services/server/actions/jobsmarket/search-companies-action.ts` | Search approved companies (Mode B) |
| **Tests** | |
| `tests/unit/jobsmarket/actions/auth/register-candidate.test.ts` | Candidate registration unit tests |
| `tests/unit/jobsmarket/actions/auth/register-company.test.ts` | Company registration unit tests |
| `tests/unit/jobsmarket/actions/auth/otp.test.ts` | OTP send/verify unit tests |
| `tests/unit/jobsmarket/components/auth/RoleSelection.test.tsx` | Role selection component tests |
| `tests/e2e/jobsmarket/auth/register-candidate-google.spec.ts` | E2E: Candidate Google OAuth |
| `tests/e2e/jobsmarket/auth/register-candidate-email.spec.ts` | E2E: Candidate email/password |
| `tests/e2e/jobsmarket/auth/register-company-mode-a.spec.ts` | E2E: Company Mode A (create new) |
| `tests/e2e/jobsmarket/auth/register-company-mode-b.spec.ts` | E2E: Company Mode B (join existing) |

---

## 2. Server Actions Required

### 2.1 Reuse (Existing - From AUTH-R00)

| Action | Location | Signature | Usage |
|--------|----------|-----------|-------|
| `sendVerificationOTPEmail` | `src/domains/authentication/services/server/actions/jobsmarket/otp-actions.ts` | `(input: { email: string }) => Promise<{ success: boolean; refCode?: string; error?: string }>` | **✅ REUSE** - Already implements BLS-01 §3.3 with rate limiting |
| `verifyOTPCode` | `src/domains/authentication/services/server/actions/jobsmarket/otp-actions.ts` | `(input: { refCode: string; otpCode: string }) => Promise<{ success: boolean; error?: string }>` | **✅ REUSE** - Already implements BLS-01 §3.4 with rate limiting |
| `login` | `src/domains/authentication/services/server/actions/session.ts` | `(idToken: string) => Promise<{ success: boolean; user?: DecodedIdToken; error?: string }>` | **✅ REUSE** - Creates session cookie after Firebase Auth |
| `logout` | `src/domains/authentication/services/server/actions/session.ts` | `() => Promise<{ success: boolean }>` | **✅ REUSE** - Clear session |

### 2.2 New (To Be Created)

| Action | Purpose | Signature | Location |
|--------|---------|-----------|----------|
| **`checkEmailExists`** | Check if email is already registered (called on blur + submit) | `(email: string) => Promise<{ exists: boolean; roles?: string[]; method?: 'email' \| 'google' }>` | `src/domains/authentication/services/server/actions/jobsmarket/check-email-action.ts` |
| **`createCandidateAccount`** | Create candidate user_accounts + candidate_information + wallet + consent | `(data: CandidateRegistrationData) => Promise<{ success: boolean; uid?: string; error?: string }>` | `src/domains/authentication/services/server/actions/jobsmarket/register-candidate-action.ts` |
| **`createCompanyAccountModeA`** | Create user_accounts with roles=['company', 'admin', 'pending'] (Mode A) | `(data: CompanyRegistrationData) => Promise<{ success: boolean; uid?: string; error?: string }>` | `src/domains/authentication/services/server/actions/jobsmarket/register-company-action.ts` |
| **`createCompanyAccountModeB`** | Create user_accounts with roles=['candidate', 'pending'] (Mode B) | `(data: StaffRegistrationData) => Promise<{ success: boolean; uid?: string; error?: string }>` | `src/domains/authentication/services/server/actions/jobsmarket/register-company-action.ts` |
| **`createNewCompany`** | Create company_information (Mode A) | `(data: CompanyData, documentUrl: string) => Promise<{ success: boolean; companyId?: string; error?: string }>` | `src/domains/companies/services/server/actions/jobsmarket/create-company-action.ts` |
| **`joinExistingCompany`** | Set transfer.target_company (Mode B) | `(userId: string, companyId: string, nameCardUrl: string) => Promise<{ success: boolean; error?: string }>` | `src/domains/companies/services/server/actions/jobsmarket/join-company-action.ts` |
| **`searchApprovedCompanies`** | Search companies with status='approved' | `(query: string) => Promise<CompanySearchResult[]>` | `src/domains/companies/services/server/actions/jobsmarket/search-companies-action.ts` |
| **`uploadRegistrationDocument`** | Upload to Firebase Storage | `(file: File, path: string) => Promise<{ url: string }>` | Utility helper in register actions |
| **`processReferralCode`** | Award referral bonus if ?refCode present | `(newUserId: string, refCode: string) => Promise<{ success: boolean }>` | `src/domains/candidates/services/server/actions/jobsmarket/referral-action.ts` |

### 2.3 Action Implementation Details

#### `checkEmailExists`

```typescript
/**
 * Check if email already exists in Firebase Auth
 * Per BLS-01 §3.2 Email Existence Check
 *
 * Returns:
 * - exists: false → Email available
 * - exists: true, roles: ['candidate'] → Same role
 * - exists: true, roles: ['company'] → Different role
 * - exists: true, roles: ['chancedee'] → Platform user
 */
async function checkEmailExists(email: string): Promise<{
  exists: boolean;
  roles?: string[];
  method?: 'email' | 'google';
}> {
  // 1. Check Firebase Auth
  const auth = getFirebaseAdminAuth();
  const user = await auth.getUserByEmail(email);

  // 2. If exists, get user_accounts doc for roles
  const userAccount = await webUserAccountsGetById(user.uid);

  // 3. Determine auth method
  const method = user.providerData[0].providerId === 'google.com' ? 'google' : 'email';

  return {
    exists: true,
    roles: userAccount?.roles || [],
    method
  };
}
```

#### `createCandidateAccount`

```typescript
/**
 * Create candidate account (Google or Email)
 * Per BLS-01 §3.2 Candidate Flow (Data Effects Steps 1-9)
 *
 * Flow:
 * 1. Create user_accounts document (roles: ['candidate'])
 * 2. Create user_info document (auto via UserAccountSet)
 * 3. Create candidate_information document
 * 4. Initialize wallet (100 coins signup bonus) - NON-BLOCKING
 * 5. Process referral if refCode provided - NON-BLOCKING
 * 6. Log consent record (PDPA acceptance)
 * 7. Return success
 */
async function createCandidateAccount(data: {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  authMethod: 'google' | 'email';
  refCode?: string;
  termsAccepted: boolean;
}): Promise<{ success: boolean; uid?: string; error?: string }> {
  // Step 1: Create user_accounts
  await webUserAccountsCreate({
    uid: data.uid,
    email: data.email,
    roles: ['candidate'],
    is_active: true,
    is_policy_accepted: data.termsAccepted,
  });

  // Step 3: Create candidate_information
  await webCandidateInformationCreate({
    uid: data.uid,
    email: data.email,
    first_name_th: extractFirstName(data.displayName),
    last_name_th: extractLastName(data.displayName),
    avatar_url: data.photoURL,
    referral: {
      refer_code: generateReferralCode(6),
      refer_link: `${baseUrl}/auth/register?refCode={code}`,
    },
  });

  // Step 4: Initialize wallet (non-blocking)
  initializeWallet(data.uid, 100).catch(logError);

  // Step 5: Process referral (non-blocking)
  if (data.refCode) {
    processReferral(data.uid, data.refCode).catch(logError);
  }

  // Step 6: Log consent record
  await webConsentRecordsCreate({
    uid: generateUUID(),
    user_id: data.uid,
    policy_version: '2.0',
    consent_method: 'registration',
    preferences: {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    },
  });

  return { success: true, uid: data.uid };
}
```

#### `createCompanyAccountModeA` (NEW - Mode A)

```typescript
/**
 * Create company account for Mode A (Create New Company)
 * Per BLS-01 §3.2 Company Mode A (Data Effects Steps 1-8)
 *
 * CRITICAL: Different roles than Mode B!
 * Roles: ['company', 'admin', 'pending'] - will be company admin when approved
 *
 * Flow:
 * 1. Create user_accounts with company/admin/pending roles
 * 2. Set transfer.target_company (will be created next)
 * 3. Log consent record
 */
async function createCompanyAccountModeA(data: {
  uid: string;
  email: string;
  targetCompanyId: string; // New company ID (created separately)
  termsAccepted: boolean;
  employerTermsAccepted: boolean;
}): Promise<{ success: boolean; uid?: string; error?: string }> {
  // Step 1: Create user_accounts with Mode A roles
  await webUserAccountsCreate({
    uid: data.uid,
    email: data.email,
    roles: ['company', 'admin', 'pending'], // ← MODE A ROLES
    is_active: true,
    is_policy_accepted: data.termsAccepted,
    transfer: {
      target_company: data.targetCompanyId,
      transfer_approved: false,
      request_timestamp: serverTimestamp(),
    },
  });

  // Step 2: Log consent record (includes employer terms)
  await webConsentRecordsCreate({
    uid: generateUUID(),
    user_id: data.uid,
    policy_version: '2.0',
    consent_method: 'registration',
    preferences: {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    },
  });

  return { success: true, uid: data.uid };
}
```

#### `createCompanyAccountModeB` (NEW - Mode B)

```typescript
/**
 * Create company account for Mode B (Join Existing Company)
 * Per BLS-01 §3.2 Company Mode B (Data Effects Steps 1-7)
 *
 * CRITICAL: Different roles than Mode A!
 * Roles: ['candidate', 'pending'] - staff member when approved
 *
 * Flow:
 * 1. Create user_accounts with candidate/pending roles
 * 2. Set transfer.target_company (existing company ID)
 * 3. Log consent record
 */
async function createCompanyAccountModeB(data: {
  uid: string;
  email: string;
  targetCompanyId: string; // Existing company ID
  termsAccepted: boolean;
}): Promise<{ success: boolean; uid?: string; error?: string }> {
  // Step 1: Create user_accounts with Mode B roles
  await webUserAccountsCreate({
    uid: data.uid,
    email: data.email,
    roles: ['candidate', 'pending'], // ← MODE B ROLES (DIFFERENT!)
    is_active: true,
    is_policy_accepted: data.termsAccepted,
    transfer: {
      target_company: data.targetCompanyId,
      transfer_approved: false,
      request_timestamp: serverTimestamp(),
    },
  });

  // Step 2: Log consent record
  await webConsentRecordsCreate({
    uid: generateUUID(),
    user_id: data.uid,
    policy_version: '2.0',
    consent_method: 'registration',
    preferences: {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    },
  });

  return { success: true, uid: data.uid };
}
```

#### `createNewCompany` (Mode A - Company Creation)

```typescript
/**
 * Create new company_information document (Mode A)
 * Per BLS-01 §3.2, RIS AUTH-R02 §4.5.3
 *
 * Flow:
 * 1. Create company_information document with status='pending'
 * 2. Send notification to platform admins
 */
async function createNewCompany(data: {
  userId: string;
  companyName: string;
  companyNameEn?: string;
  taxId: string;
  industry: string;
  companySize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  documentUrl: string;
}): Promise<{ success: boolean; companyId?: string; error?: string }> {
  const companyId = generateCompanyId();

  // Step 1: Create company_information
  await webCompanyInformationCreate({
    uid: companyId,
    company_name: data.companyName,
    company_name_en: data.companyNameEn,
    tax_id: data.taxId,
    job_industry: data.industry,
    company_size: data.companySize,
    profile_photo: data.documentUrl, // Company registration document
    status: 'pending', // Awaits platform admin approval
    is_active: false,
    staff: [data.userId], // Founder is first staff
  });

  // Step 2: Notify platform admins (BLS-01 §3.2 Notifications)
  await sendEmailNotification({
    to: process.env.PLATFORM_ADMIN_EMAILS?.split(',') || [],
    template: 'company-registration-pending',
    data: {
      companyName: data.companyName,
      taxId: data.taxId,
      requestorEmail: data.email,
      reviewUrl: `${baseUrl}/platform/companies/pending/${companyId}`,
    },
  });

  return { success: true, companyId };
}
```

#### `joinExistingCompany` (Mode B - No Additional Action Needed)

**Note:** Mode B does NOT create a separate company document. It only:
1. Sets `transfer.target_company` in user_accounts (done in `createCompanyAccountModeB`)
2. Uploads name card to Firebase Storage (done in client)
3. Company admin approves via platform (future COMP route)

**No server action needed beyond `createCompanyAccountModeB`.**

---

## 3. State Management

### 3.1 Atom Locations

| File | Atoms | Scope |
|------|-------|-------|
| `src/store/jobsmarket/global-atoms.ts` | `activeRoleAtom`, `sessionStateAtom` | **Reuse** from AUTH-R01 |
| `src/store/jobsmarket/register-atoms.ts` | Registration-specific atoms | New |

### 3.2 Registration Atoms

```typescript
// src/store/jobsmarket/register-atoms.ts

/**
 * Registration flow state machine
 * Aligned with RIS §6.1 and §6.2 state diagrams
 */
type RegisterPageState =
  | 'role_select'          // Initial: show role cards
  | 'auth_form'            // Email/password/Google form
  | 'sending_otp'          // OTP being sent
  | 'otp_verify'           // Verify 6-digit OTP
  | 'create_password'      // Set password (email flow)
  | 'google_auth'          // OAuth popup in progress
  | 'creating_firebase'    // Firebase Auth user creation
  | 'creating_session'     // Session cookie creation
  | 'creating_account'     // Firestore docs creation
  | 'company_details'      // Company step 2 form (company only)
  | 'uploading_doc'        // Document upload in progress
  | 'submitting_request'   // Company request submission
  | 'pending'              // Success - pending approval
  | 'success'              // Success - redirect to dashboard
  | 'error';               // Error state

export const registerPageStateAtom = atom<RegisterPageState>('role_select');

/**
 * Selected role (candidate or company)
 */
export const selectedRoleAtom = atom<'candidate' | 'company' | null>(null);

/**
 * Company registration mode
 * Mode A: Create new company
 * Mode B: Join existing company
 */
export const companyModeAtom = atom<'new' | 'join'>('new');

/**
 * Current wizard step (for company flow)
 * Step 1: Auth form (email → OTP → password)
 * Step 2: Company details (Mode A or Mode B)
 * Step 3: Pending confirmation
 */
export const wizardStepAtom = atom<number>(1);

/**
 * OTP verification state
 */
export const otpStateAtom = atom({
  refCode: '',
  cooldownSeconds: 0,
  attemptCount: 0,
  verified: false,
});

/**
 * Error state
 */
export interface RegisterError {
  code: string;
  message: string;
  field?: string;
}

export const registerErrorAtom = atom<RegisterError | null>(null);

/**
 * Form data persistence
 */
export const emailAtom = atom<string>('');
export const passwordAtom = atom<string>('');
export const termsAcceptedAtom = atom<boolean>(false);
export const employerTermsAcceptedAtom = atom<boolean>(false); // Company only
```

### 3.3 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useRegisterCandidate` | `{ registerWithGoogle, registerWithEmail, isLoading, error }` | Orchestrate candidate flow |
| `useRegisterCompany` | `{ submitStep1, submitStep2ModeA, submitStep2ModeB, isLoading, error }` | Orchestrate company flow |
| `useOTPVerification` | `{ sendOTP, verifyOTP, resendOTP, countdown, canResend }` | OTP send/verify logic with **60-second cooldown** (BLS-01 §3.3) |
| `useCompanySearch` | `{ search, results, isLoading, selectCompany, selectedCompany }` | Company search (Mode B) |
| `usePasswordStrength` | `{ score, feedback, color }` | Real-time password validation |

**`useOTPVerification` Cooldown Spec:**
```typescript
// Per BLS-01 §3.3 Operational: Resend Cooldown = 60 seconds
const [cooldownSeconds, setCooldownSeconds] = useState(60);
const [canResend, setCanResend] = useState(false);

useEffect(() => {
  if (cooldownSeconds > 0) {
    const timer = setTimeout(() => {
      setCooldownSeconds(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  } else {
    setCanResend(true);
  }
}, [cooldownSeconds]);

async function resendOTP() {
  if (!canResend) return;

  const result = await sendVerificationOTPEmail({ email });
  if (result.success) {
    setCooldownSeconds(60); // Reset to 60 seconds
    setCanResend(false);
  }
}
```

---

## 4. Test Coverage Plan

### 4.1 Unit Tests

| Test Case | Covers | File |
|-----------|--------|------|
| **Server Actions** | | |
| `checkEmailExists` returns exists=false for new email | Email check | `tests/unit/jobsmarket/actions/auth/check-email.test.ts` |
| `checkEmailExists` returns exists=true + roles for existing email | Email check | Same |
| `createCandidateAccount` creates user_accounts + candidate_information | Account creation | `tests/unit/jobsmarket/actions/auth/register-candidate.test.ts` |
| `createCandidateAccount` awards 100 coin signup bonus | Wallet integration | Same |
| `createCandidateAccount` processes referral if refCode provided | Referral system | Same |
| `createNewCompany` creates company_information with status='pending' | Company creation (Mode A) | `tests/unit/jobsmarket/actions/companies/create-company.test.ts` |
| `joinExistingCompany` sets user_accounts.transfer.target_company | Join request (Mode B) | `tests/unit/jobsmarket/actions/companies/join-company.test.ts` |
| `searchApprovedCompanies` returns only approved companies | Company search | `tests/unit/jobsmarket/actions/companies/search-companies.test.ts` |
| **Components** | | |
| `RoleSelection` renders candidate and company cards | UI structure | `tests/unit/jobsmarket/components/auth/RoleSelection.test.tsx` |
| `RoleSelection` calls setSelectedRole on card click | User interaction | Same |
| `OTPVerifyForm` validates 6-digit input | Input validation | `tests/unit/jobsmarket/components/auth/OTPVerifyForm.test.tsx` |
| `OTPResendButton` shows countdown timer after send | Cooldown UI | `tests/unit/jobsmarket/components/auth/OTPResendButton.test.tsx` |
| `PasswordStrengthMeter` shows color based on score | Password feedback | `tests/unit/jobsmarket/components/auth/PasswordStrengthMeter.test.tsx` |
| `ModeToggle` switches between Mode A and Mode B | Toggle behavior | `tests/unit/jobsmarket/components/auth/ModeToggle.test.tsx` |

### 4.2 Integration Tests

| Test Case | Covers |
|-----------|--------|
| Candidate Google OAuth flow creates session + account | Full Google flow |
| Candidate email flow: OTP → password → account creation | Full email flow |
| Company Mode A: Email → OTP → Password → Company Details → Pending | Full company create flow |
| Company Mode B: Email → OTP → Password → Company Search → Join Request | Full company join flow |
| Referral code awards bonus to both users | Referral system |

### 4.3 E2E Tests

| Test File | Scenarios |
|-----------|-----------|
| `register-candidate-google.spec.ts` | 1. Google OAuth success → dashboard<br>2. Google OAuth popup blocked → error |
| `register-candidate-email.spec.ts` | 1. Email → OTP → Password → dashboard<br>2. OTP expired → resend → success<br>3. Weak password → validation error<br>4. Email exists (same role) → login link shown |
| `register-company-mode-a.spec.ts` | 1. Create new company → pending approval<br>2. Invalid tax ID → validation error<br>3. Document upload fails → error recovery |
| `register-company-mode-b.spec.ts` | 1. Search company → select → upload name card → pending<br>2. Company not found → switch to Mode A<br>3. Name card too large → error |

---

## 5. State Machine Verification

### 5.1 Candidate Flow States (Per RIS §6.1.2)

| State (from RIS §6.1) | Test Assertion |
|---------------------|----------------|
| `ROLE_SELECT` | Role cards visible, no form shown |
| `AUTH_FORM` | Email input + Google button OR email form (based on role) |
| `GOOGLE_AUTH` | Popup opens, loading spinner |
| `SENDING_OTP` | Loading spinner, form disabled |
| `OTP_VERIFY` | 6-digit OTP input visible, resend button |
| `CREATE_PASSWORD` | Password + confirm password fields, strength meter |
| `CREATING_FIREBASE` | Loading spinner, "Creating account..." |
| `CREATING_SESSION` | Loading spinner, "Setting up session..." |
| `CREATING_ACCOUNT` | Loading spinner, "Creating profile..." |
| `SUCCESS` | Redirect to `/candidates/{uid}` |
| `ERROR` | Error message displayed, form re-enabled |

### 5.2 Company Flow States (Per RIS §6.2.2)

| State (from RIS §6.2) | Test Assertion |
|---------------------|----------------|
| `ROLE_SELECT` | Role cards visible |
| `AUTH_FORM` | Email form (no Google option for company) |
| `SENDING_OTP` | Loading spinner |
| `OTP_VERIFY` | 6-digit OTP input |
| `CREATE_PASSWORD` | Password fields + employer terms checkbox |
| `CREATING_FIREBASE` | Loading spinner |
| `CREATING_SESSION` | **Session created BEFORE step 2** |
| `CREATING_ACCOUNT` | User created with roles=['company', 'admin', 'pending'] |
| `COMPANY_DETAILS` | Step 2 - Mode toggle + form (Mode A or Mode B) |
| `UPLOADING_DOC` | Upload progress bar |
| `SUBMITTING_REQUEST` | Loading spinner |
| `PENDING` | Success card, "Check status" link |

### 5.3 State Transitions

**Candidate Flow:**
```
ROLE_SELECT → SELECT_CANDIDATE → AUTH_FORM
AUTH_FORM → GOOGLE_CLICK → GOOGLE_AUTH → SUCCESS
AUTH_FORM → EMAIL_SUBMIT → SENDING_OTP → OTP_VERIFY → CREATE_PASSWORD → CREATING_FIREBASE → CREATING_SESSION → CREATING_ACCOUNT → SUCCESS
```

**Company Flow:**
```
ROLE_SELECT → SELECT_COMPANY → AUTH_FORM
AUTH_FORM → EMAIL_SUBMIT → SENDING_OTP → OTP_VERIFY → CREATE_PASSWORD → CREATING_FIREBASE → CREATING_SESSION → CREATING_ACCOUNT → COMPANY_DETAILS
COMPANY_DETAILS → MODE_A_SUBMIT → UPLOADING_DOC → SUBMITTING_REQUEST → PENDING
COMPANY_DETAILS → MODE_B_SUBMIT → UPLOADING_DOC → SUBMITTING_REQUEST → PENDING
```

---

## 6. Thai Copy Checklist

### 6.1 Role Selection

| Element | Thai Text | Source |
|---------|-----------|--------|
| Page title | ลงทะเบียน | RIS §4 |
| Candidate card title | ผู้หางาน | Design System |
| Candidate card description | สำหรับผู้ที่กำลังมองหางาน | Design System |
| Company card title | บริษัท | Design System |
| Company card description | สำหรับนายจ้างที่ต้องการหาพนักงาน | Design System |

### 6.2 Auth Form (Common)

| Element | Thai Text | Source |
|---------|-----------|--------|
| Email label | อีเมล | RIS §4 Thai Copy |
| Email placeholder | กรอกอีเมล | RIS §4 |
| Password label | รหัสผ่าน | RIS §4 |
| Password placeholder | กรอกรหัสผ่าน | RIS §4 |
| Confirm password label | ยืนยันรหัสผ่าน | RIS §4 |
| Terms checkbox | ฉันยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว | RIS §5.3.2 |
| Employer terms checkbox | ฉันยอมรับข้อกำหนดสำหรับนายจ้าง | RIS §5.3.2 |
| Google button (candidate) | ลงทะเบียนด้วย Google | Design System |
| Divider | หรือ | Design System |
| Submit button | ดำเนินการต่อ | RIS §4 |
| Already have account | มีบัญชีอยู่แล้ว? | RIS §4 |
| Login link | เข้าสู่ระบบ | RIS §4 |

### 6.3 OTP Verification

| Element | Thai Text | Source |
|---------|-----------|--------|
| OTP title | ตรวจสอบอีเมล | RIS §4 |
| OTP instruction | กรุณากรอกรหัส OTP 6 หลักที่ส่งไปยัง {email} | RIS §4 |
| OTP input label | รหัส OTP | RIS §4 |
| Ref code label | รหัสอ้างอิง | RIS §4 |
| Resend button (enabled) | ส่งรหัสใหม่ | RIS §4 |
| Resend countdown | ส่งรหัสใหม่ได้ในอีก {seconds} วินาที | RIS §4 + BLS-01 §3.3 (60s cooldown) |
| Verify button | ยืนยัน | RIS §4 |

### 6.4 Password Creation

| Element | Thai Text | Source |
|---------|-----------|--------|
| Password strength weak | รหัสผ่านอ่อนแอ | BLS-01 |
| Password strength medium | รหัสผ่านปานกลาง | BLS-01 |
| Password strength strong | รหัสผ่านแข็งแรง | BLS-01 |
| Password requirements | รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ | BLS-01 §6 |

### 6.5 Company Details (Mode A)

| Element | Thai Text | Source |
|---------|-----------|--------|
| Step indicator | ขั้นตอนที่ 2 จาก 3 | RIS §4 |
| Mode A tab | สร้างบริษัทใหม่ | RIS §4 |
| Mode B tab | เข้าร่วมบริษัทที่มีอยู่ | RIS §4 |
| Company name (TH) label | ชื่อบริษัท (ภาษาไทย) | RIS §4 |
| Company name (EN) label | ชื่อบริษัท (English) | RIS §4 |
| Tax ID label | เลขทะเบียนนิติบุคคล | RIS §4 |
| Industry label | ประเภทธุรกิจ | RIS §4 |
| Company size label | ขนาดบริษัท | RIS §4 |
| Upload document label | อัปโหลดเอกสารการจดทะเบียนบริษัท | RIS §4 |
| Upload hint | รองรับ PDF, JPG, PNG สูงสุด 10MB | RIS §11 |
| Back button | ย้อนกลับ | RIS §4 |
| Submit button | ส่งคำขอ | RIS §4 |

### 6.6 Company Details (Mode B)

| Element | Thai Text | Source |
|---------|-----------|--------|
| Search label | ค้นหาบริษัท | RIS §4 |
| Search placeholder | พิมพ์ชื่อบริษัท... | RIS §4 |
| No results | ไม่พบบริษัทที่ค้นหา | RIS §9.2 |
| Create instead link | สร้างบริษัทใหม่แทน | RIS §4 |
| Upload name card label | อัปโหลดนามบัตร | RIS §4 |
| Name card hint | รองรับ JPG, PNG สูงสุด 5MB | RIS §11 |

### 6.7 Pending Success

| Element | Thai Text | Source |
|---------|-----------|--------|
| Pending title (Mode A) | คำขอสร้างบริษัทของคุณอยู่ระหว่างการพิจารณา | RIS §4 |
| Pending description (Mode A) | ทีมงาน Chancedee จะตรวจสอบข้อมูลและติดต่อกลับภายใน 1-3 วันทำการ | RIS §4 |
| Pending title (Mode B) | คำขอเข้าร่วมบริษัทของคุณส่งสำเร็จ | RIS §4 |
| Pending description (Mode B) | รอการอนุมัติจากผู้ดูแลบริษัท | RIS §4 |
| Check status button | ตรวจสอบสถานะ | RIS §4 |
| Logout button | ออกจากระบบ | RIS §4 |

### 6.8 Error Messages

| Error | Thai Message | Source |
|-------|--------------|--------|
| Invalid email | รูปแบบอีเมลไม่ถูกต้อง | BLS-01 §3.2 |
| Weak password | รหัสผ่านไม่ปลอดภัยเพียงพอ | BLS-01 §3.2 |
| Password mismatch | รหัสผ่านไม่ตรงกัน | BLS-01 §3.2 |
| Terms not accepted | กรุณายอมรับข้อกำหนดการใช้งาน | BLS-01 §3.2 |
| Employer terms not accepted | กรุณายอมรับข้อกำหนดสำหรับนายจ้าง | BLS-01 §3.2 |
| Email exists (same role) | อีเมลนี้ลงทะเบียนแล้ว | RIS §9.2 |
| Email exists (different role) | อีเมลนี้มีบัญชีผู้หางานแล้ว ต้องการเพิ่มบทบาทบริษัท? | RIS §9.2 |
| OTP expired | รหัส OTP หมดอายุแล้ว | AUTH-R00 §8.5 |
| OTP invalid | รหัส OTP ไม่ถูกต้อง | AUTH-R00 §8.5 |
| OTP already used | รหัส OTP ถูกใช้งานแล้ว | AUTH-R00 §8.5 |
| OTP rate limited | คุณขอรหัส OTP มากเกินไป โปรดลองใหม่ในอีก X นาที | AUTH-R00 §8.5 |
| Invalid tax ID | เลขทะเบียนนิติบุคคลไม่ถูกต้อง | RIS §9.1 |
| File too large (company doc) | ไฟล์ใหญ่เกิน 10MB | RIS §9.3 |
| File too large (name card) | ไฟล์ใหญ่เกิน 5MB | AUTH-R00 §11 |
| Invalid file type | ประเภทไฟล์ไม่รองรับ | AUTH-R00 §11 |
| Company not found | ไม่พบบริษัทที่ค้นหา | RIS §9.2 |
| Google OAuth failed | ลงทะเบียนด้วย Google ไม่สำเร็จ | AUTH-R00 Appendix A |
| Popup blocked | กรุณาอนุญาต Popup ในเบราว์เซอร์ | AUTH-R00 Appendix A |
| Network error | ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่ | AUTH-R00 Appendix A |

---

## 7. Dependencies

### 7.1 Must Complete First

- ✅ **AUTH-R00 Infrastructure** - OTP actions, error messages, rate limiting (DONE)
- ✅ **AUTH-R01 Login** - Session management, global atoms (DONE)

### 7.2 Blocks Following Routes

- **AUTH-R03 Verify** - Shares OTP components
- **AUTH-R05 Status** - Redirect target for pending users
- **CAND-R01 Dashboard** - Redirect target for candidates
- **COMP-R01 Pending** - Redirect target for company Mode A

### 7.3 External Dependencies

- Firebase Auth (Google OAuth, email/password)
- Firebase Admin SDK (session cookies)
- Firebase Storage (document uploads)
- Firestore (user_accounts, candidate_information, company_information)
- SendGrid (OTP emails)
- Jotai (state management)
- Zod (validation)
- React Hook Form (form management)

---

## 8. Open Questions

### 8.1 OTP Cookie vs Server-Side State

**Question:** Should OTP verified state use HTTP-only cookie (OLD system) or server-side session state?

**Recommendation:** Use HTTP-only cookie per OLD system design.

**Rationale:**
- Prevents XSS attacks (cookie not accessible via JavaScript)
- Survives page refresh (good UX if user refreshes during password step)
- 15-minute TTL matches OTP expiry
- Already matches existing pattern

**SA Assessment:** ✅ Approved

---

### 8.2 Company Registration Number Validation

**Question:** Should we validate Thai company registration number (13 digits) with Luhn algorithm on server-side?

**Recommendation:** Yes, add server-side validation.

**Rationale:**
- Client-side validation can be bypassed
- Prevents invalid registrations from reaching admin approval queue
- Luhn check is lightweight (< 1ms)

**Implementation:**
```typescript
function isValidThaiTaxId(taxId: string): boolean {
  // Remove spaces/dashes
  const digits = taxId.replace(/[\s-]/g, '');

  // Must be 13 digits
  if (!/^\d{13}$/.test(digits)) return false;

  // Luhn algorithm (Mod 11)
  const weights = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }

  const checksum = (11 - (sum % 11)) % 10;
  return checksum === parseInt(digits[12]);
}
```

**SA Assessment:** ✅ Approved

---

### 8.3 Wallet Bonus Failure Handling

**Question:** What happens if wallet creation fails during candidate registration?

**Recommendation:** Registration succeeds, wallet creation logged as failed.

**Rationale:**
- Don't block registration for non-critical failure
- User can still use platform
- Admin can manually award bonus later
- Log error for monitoring

**BLS-01 §4.6 confirms:** "Wallet creation failure does NOT block registration"

**SA Assessment:** ✅ Approved - Per BLS-01

---

### 8.4 Company Search Security

**Question:** Should company search (Mode B) be rate-limited?

**Recommendation:** Yes, 20 searches per 5 minutes.

**Rationale:**
- Prevents scraping of company directory
- Still allows legitimate use (user unlikely to search 20 times in 5 min)
- Lighter than OTP rate limit (since less sensitive)

**Implementation:** Use `withRateLimit` HOF with `COMPANY_SEARCH` config

**SA Assessment:** ✅ Approved

---

### 8.5 Referral Code Processing Timing

**Question:** When should referral code be processed? During registration or after?

**Recommendation:** After candidate account creation, non-blocking.

**Per BLS-01 §4.6:**
```
createCandidateAccount()
    ├─► Create user_accounts + candidate_information
    ├─► Initialize wallet (100 coins)
    └─► Process referral (NON-BLOCKING)
        ├─► Award 100 coins to new user
        └─► Award 100 coins to referrer
```

**If referral fails:**
- User still gets account + signup bonus
- Referral error logged but doesn't block registration
- Can be manually processed later by admin

**SA Assessment:** ✅ Approved - Per BLS-01

---

## 9. Estimated Complexity

| Aspect | Estimate |
|--------|----------|
| Components | 21 new, 2 reuse (from AUTH-R01) |
| Server Actions | 8 new, 4 reuse |
| Atoms/Hooks | 12 new, 2 reuse |
| Test Cases | 16 unit, 5 integration, 8 e2e |
| Effort | **High** |

**Complexity Breakdown:**
- **High** due to:
  - Two divergent flows (candidate vs company)
  - Multi-step wizard with state persistence
  - File uploads (2 different types)
  - OTP verification system integration
  - Company search functionality (Mode B)
  - Wallet integration
  - Referral system

---

## 10. Implementation Sequence

### Phase 1: Infrastructure (Reuse + Foundation)

1. **Verify AUTH-R00 Reuse**
   - ✅ `sendVerificationOTPEmail` exists
   - ✅ `verifyOTPCode` exists
   - ✅ `login` session management exists
   - ✅ Thai error messages exist

2. **Create New Atoms**
   - `src/store/jobsmarket/register-atoms.ts`
   - State machine types
   - Form persistence atoms

3. **Create Base Hooks**
   - `use-otp-verification.ts` (wraps existing OTP actions)
   - `use-password-strength.ts`

---

### Phase 2: Shared Components

4. **OTP Components**
   - `OTPVerifyForm.tsx` (6-digit input + verify button)
   - `OTPResendButton.tsx` (countdown timer)

5. **Password Components**
   - `PasswordCreateForm.tsx`
   - `PasswordStrengthMeter.tsx`

6. **Utility Components**
   - `StepIndicator.tsx`
   - `TermsCheckbox.tsx`
   - `FileUploadArea.tsx`

---

### Phase 3: Candidate Flow

7. **Server Actions**
   - `check-email-action.ts`
   - `register-candidate-action.ts`
   - `referral-action.ts` (process ?refCode)

8. **Components**
   - `RoleSelection.tsx`
   - `CandidateFlow.tsx` (orchestrator)
   - `EmailForm.tsx`
   - `GoogleRegisterButton.tsx`

9. **Hook**
   - `use-register-candidate.ts`

10. **Tests**
    - Unit tests for candidate registration
    - E2E: Google OAuth flow
    - E2E: Email/password flow

---

### Phase 4: Company Flow - Mode A (Create New)

11. **Server Actions**
    - `register-company-action.ts`
    - `create-company-action.ts`

12. **Components**
    - `CompanyFlow.tsx` (orchestrator)
    - `CompanyDetailsForm.tsx`
    - `ModeToggle.tsx`
    - `CompanyModeA.tsx`
    - `PendingSuccess.tsx`

13. **Hook**
    - `use-register-company.ts`

14. **Tests**
    - Unit tests for company Mode A
    - E2E: Company create flow

---

### Phase 5: Company Flow - Mode B (Join Existing)

15. **Server Actions**
    - `search-companies-action.ts`
    - `join-company-action.ts`

16. **Components**
    - `CompanyModeB.tsx`
    - `CompanySearch.tsx`

17. **Hook**
    - `use-company-search.ts`

18. **Tests**
    - Unit tests for company Mode B
    - E2E: Company join flow

---

### Phase 6: Page Assembly

19. **Route Page**
    - `src/app/jobsmarket/auth/register/page.tsx`
    - Query parameter handling (?role, ?step, ?mode, ?email, ?refCode)
    - State machine orchestration
    - Route guard (redirect logged-in users)

20. **Integration Tests**
    - Full candidate flow (Google + Email)
    - Full company flow (Mode A + Mode B)
    - Referral code processing

---

### Phase 7: Quality Gates

21. **Gate 1: Build**
    - `npm run build` → exits with code 0
    - All TypeScript errors resolved
    - All async server actions verified

22. **Gate 2: Lint**
    - `npm run lint` → no errors (warnings OK)

23. **Gate 3: Dev Server**
    - `npm run dev`
    - Visit `/auth/register`
    - Test all flows manually
    - Check browser console for errors

24. **Gate 4: Tests**
    - `npm run test:unit` → all pass
    - `npm run test:e2e -- tests/e2e/jobsmarket/auth/register-*.spec.ts` → all pass

---

## 11. Reusable Code Identified

| Existing Code | Location | How to Reuse |
|---------------|----------|--------------|
| `sendVerificationOTPEmail` | `src/domains/authentication/services/server/actions/jobsmarket/otp-actions.ts` | ✅ Call directly in registration flow |
| `verifyOTPCode` | Same file | ✅ Call directly in OTP verification step |
| `login` | `src/domains/authentication/services/server/actions/session.ts` | ✅ Call after Firebase Auth success |
| `getThaiErrorMessage` | `src/domains/authentication/utils/error-messages.ts` | ✅ Use for all error display |
| `withRateLimit` | `src/lib/utils/server/with-rate-limit.ts` | ✅ Wrap new server actions |
| `activeRoleAtom` | `src/store/jobsmarket/global-atoms.ts` | ✅ Set after registration |
| `sessionStateAtom` | Same file | ✅ Update during session creation |

---

## 12. Critical Implementation Notes

### 12.1 Session Cookie Timing

**⚠️ CRITICAL:** For company registration, session cookie is created **AFTER password step, BEFORE company details step**.

**Why:**
- User needs authenticated session to access step 2 form
- Document upload requires authenticated UID for storage path
- Allows page refresh during step 2 without losing progress

**Flow:**
```
Step 1: Email → OTP → Password → CREATE FIREBASE USER → CREATE SESSION COOKIE → Create user_accounts with roles=['pending']
Step 2: Company Details (user is now authenticated)
Step 3: Pending (user remains authenticated)
```

**Per BLS-01 §3.2 and RIS §6.2.1**

---

### 12.2 OTP Verified Cookie

**Implementation:**
```typescript
// After OTP verification succeeds
async function verifyOTPCodeImpl(input) {
  // ... validation logic ...

  // Set HTTP-only cookie
  (await cookies()).set('otpVerified', refCode, {
    maxAge: 900, // 15 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return { success: true };
}
```

**Page refresh check:**
```typescript
// In register page load
const otpVerifiedCookie = (await cookies()).get('otpVerified')?.value;

if (otpVerifiedCookie && step === 'otp_verify') {
  // Skip to password step
  setStep('create_password');
}
```

---

### 12.3 File Upload Paths

**Per AUTH-R00 §11 and RIS §4.2:**

| Purpose | Path | Max Size | Allowed Types |
|---------|------|----------|---------------|
| Company registration doc (Mode A) | `companyProfile/{uid}/attachments/{filename}` | **10MB** | PDF, JPG, PNG |
| Name card (Mode B) | `nameCards/{uid}/{filename}` | **5MB** | JPG, PNG |

**Note:** AUTH-R00 §11 specifies 5MB as default, but AUTH-R02 RIS explicitly requires 10MB for company registration documents (Mode A). Name cards remain at 5MB per AUTH-R00 standard.

**Security:**
- Validate file type server-side (don't trust client MIME type)
- Check magic bytes (file signature)
- Scan filename for path traversal (`../`)
- Generate unique filename on server

---

### 12.4 Wallet Bonus Non-Blocking

**Per BLS-01 §4.6:**

```typescript
async function createCandidateAccount(data) {
  // Critical path
  await createUserAccounts();
  await createCandidateInformation();

  // Non-blocking (don't await)
  initializeWallet(data.uid).catch(error => {
    console.error('Wallet creation failed:', error);
    // Log to error monitoring (e.g., Sentry)
    // Don't throw - let registration succeed
  });

  if (data.refCode) {
    processReferral(data.uid, data.refCode).catch(error => {
      console.error('Referral processing failed:', error);
      // Log but don't block
    });
  }

  return { success: true, uid: data.uid };
}
```

---

## 13. SA Review Checklist

| Required Change | Status |
|-----------------|--------|
| Align state machine types with RIS §6.1 and §6.2 | ✅ Done |
| Reuse existing OTP actions from AUTH-R00 | ✅ Verified |
| Session cookie created BEFORE company step 2 | ✅ Documented |
| OTP verified cookie for page refresh | ✅ Planned |
| Company Mode A and Mode B divergence | ✅ Detailed |
| Wallet bonus non-blocking per BLS-01 §4.6 | ✅ Confirmed |
| File upload security measures | ✅ Documented |
| Thai copy for all error messages | ✅ Complete checklist |
| Rate limiting for company search | ✅ Planned |
| Tax ID Luhn validation | ✅ Planned |
| **Clarifications (Section 14)** | |
| File size limits: 10MB company doc, 5MB name card | ✅ Resolved (§14.1) |
| Email check on blur + submit with debouncing | ✅ Resolved (§14.2) |
| Shared component location for OTP/password components | ✅ Resolved (§14.3) |
| **SA Review Issues (Section 15)** | |
| Rate limit discrepancy (BLS vs implementation) | ✅ Resolved - Use existing (§15.1) |
| Company Mode B roles (CRITICAL) | ✅ Fixed - Split into 2 actions (§15.2) |
| Post-registration routing (BLS vs RIS) | ✅ Resolved - Follow RIS (§15.3) |
| Platform admin notification (Mode A) | ✅ Added to createNewCompany (§15.4) |
| OTP resend cooldown (60 seconds) | ✅ Added to hook spec (§15.4) |
| Consent record creation | ✅ Added to all actions (§15.4) |

---

## 14. Clarifications & Resolutions

### 14.1 File Size Limits (Resolved)

**Question:** AUTH-R00 §11 specifies 5MB max for all uploads, but AUTH-R02 RIS shows 10MB for company registration documents. Which is correct?

**Resolution:** ✅ **10MB for company registration documents, 5MB for name cards**

**Evidence:**
- AUTH-R02 RIS line 1400: "ไฟล์ใหญ่เกิน 10MB" for company documents
- AUTH-R02 RIS line 2097: "Document upload to Firebase Storage (PDF/JPG/PNG ≤10MB)"
- AUTH-R00 §11: 5MB is the **default/standard**, but routes can override for specific use cases

**Implementation:**
```typescript
// Company registration document (Mode A)
const MAX_COMPANY_DOC_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

// Name card (Mode B)
const MAX_NAME_CARD_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
```

---

### 14.2 Email Existence Check Timing (Resolved)

**Question:** Should email existence check happen on blur, on submit, or both?

**Resolution:** ✅ **Both blur AND submit for better UX**

**Rationale:**
- **On blur:** Immediate feedback prevents user from filling entire form only to discover email exists
- **On submit:** Safety check in case user modifies email after blur without triggering blur again
- **Rate limiting:** `checkEmailExists` should be debounced (500ms) and rate-limited (10 checks/min) to prevent abuse

**Implementation:**
```typescript
// In EmailForm component
const [email, setEmail] = useState('');
const [emailCheckResult, setEmailCheckResult] = useState(null);
const debouncedCheckEmail = useMemo(
  () => debounce(async (email: string) => {
    if (!isValidEmail(email)) return;
    const result = await checkEmailExists(email);
    setEmailCheckResult(result);
  }, 500),
  []
);

// On blur
<Input
  onBlur={(e) => debouncedCheckEmail(e.target.value)}
  onChange={(e) => setEmail(e.target.value)}
/>

// On submit
async function handleSubmit() {
  // Double-check (in case email changed after blur)
  const result = await checkEmailExists(email);
  if (result.exists) {
    // Show error
    return;
  }
  // Continue with OTP
}
```

---

### 14.3 Shared Component Location (Resolved)

**Question:** Should OTP components be in route-specific `_components/` or shared `src/components/jobsmarket/auth/`?

**Resolution:** ✅ **Move to shared location for reuse across AUTH routes**

**Components to Share:**

| Component | Current Plan | Should Be | Used By |
|-----------|--------------|-----------|---------|
| `OTPVerifyForm` | `register/_components/` | `src/components/jobsmarket/auth/` | AUTH-R02, AUTH-R03 (verify email change), AUTH-R06 (settings) |
| `OTPResendButton` | `register/_components/` | `src/components/jobsmarket/auth/` | AUTH-R02, AUTH-R03 |
| `PasswordStrengthMeter` | `register/_components/` | `src/components/jobsmarket/auth/` | AUTH-R02, AUTH-R06 (create/change password) |

**Benefits:**
- DRY (Don't Repeat Yourself) - single source of truth
- Consistent UX across all OTP flows
- Easier to maintain and test

**Directory Structure:**
```
src/
├── components/
│   └── jobsmarket/
│       └── auth/           ← NEW: Shared auth components
│           ├── OTPVerifyForm.tsx
│           ├── OTPResendButton.tsx
│           └── PasswordStrengthMeter.tsx
└── app/
    └── jobsmarket/
        └── auth/
            └── register/
                └── _components/  ← Route-specific only
                    ├── RoleSelection.tsx
                    ├── CompanyModeA.tsx
                    └── ...
```

**Implementation Note:** Create shared components in Phase 2 of implementation sequence, before route-specific components depend on them.

---

---

## 15. BLS-01 Deviations & SA Review Resolutions

**Per PROJECT_INSTRUCTIONS §4.4:** When RIS and BLS conflict, RIS takes precedence but deviations must be documented.

---

### 15.1 Rate Limiting Configuration

**BLS-01 §3.3 Specifies:**
- Send OTP: 3 requests / 5 minutes
- Verify OTP: 5 attempts / OTP

**Existing Implementation (AUTH-R00):**
```typescript
// src/lib/utils/server/rate-limiter.ts
OTP_REQUEST: {
  maxAttempts: 5,              // ← More permissive than BLS-01
  windowMs: 15 * 60 * 1000,    // 15 minutes (longer window)
},
OTP_VERIFY: {
  maxAttempts: 5,              // ← Same as BLS-01
  windowMs: 10 * 60 * 1000,    // 10 minutes (per refCode)
},
```

**Decision:** ✅ **Use existing implementation (no changes)**

**Rationale:**
- AUTH-R00 infrastructure already deployed and working
- More permissive limits (5/15min vs 3/5min) = better UX
- Still provides adequate abuse protection
- Changing now would break existing code
- `otp-actions.ts` already wrapped with these configs

**Impact:** None - no code changes required.

---

### 15.2 Company Mode B User Roles

**BLS-01 §3.2 Data Effects (Mode B):**
> Step 4: Create `user_accounts` with `roles: ['candidate', 'pending']`

**Original Plan Error:**
> `createCompanyAccountPending`: Create user_accounts with `roles=['company', 'admin', 'pending']`

**Resolution:** ✅ **Fixed - Split into two separate actions**

**Correct Implementation:**
- **Mode A:** `createCompanyAccountModeA` → `roles: ['company', 'admin', 'pending']`
- **Mode B:** `createCompanyAccountModeB` → `roles: ['candidate', 'pending']`

**Why Different:**
- Mode A users are creating a NEW company → become admin when approved
- Mode B users are joining EXISTING company → become staff when approved
- Mode B users default to `candidate` role (can use platform while waiting)

**Impact:** Section 2.2 (Server Actions) updated with two separate functions.

---

### 15.3 Post-Registration Routing

**BLS-01 §3.2 Success Criteria:**

| Flow | BLS-01 Destination |
|------|-------------------|
| Candidate | `/candidates/[uid]` |
| Company Mode A | `/companies/[id]/pending` |
| Company Mode B | `/auth/status?type=staff-pending` |

**RIS AUTH-R02 Routing:**

| Flow | RIS Destination |
|------|-----------------|
| Candidate | `/candidates/[uid]?tab=onboarding` |
| Company Mode A | Stay on `/auth/register?step=pending&mode=new` |
| Company Mode B | Stay on `/auth/register?step=pending&mode=join` |

**Decision:** ✅ **Follow RIS (higher document precedence)**

**Rationale:**
- RIS is the source of truth for NEW implementation per PROJECT_INSTRUCTIONS
- Staying on registration page with success card provides better UX
- User sees the context of what was just completed
- Success card includes "Check Status" link to navigate to status pages
- Query parameters (`?step=pending&mode=new`) enable page refresh without losing state

**Implementation:**
```typescript
// After successful registration

// Candidate - RIS routing
router.push(`/candidates/${uid}?tab=onboarding`);

// Company Mode A - Stay on page, show success card
setStep(3);
router.replace('/auth/register?role=company&step=pending&mode=new');

// Company Mode B - Stay on page, show success card
setStep(3);
router.replace('/auth/register?role=company&step=pending&mode=join');
```

**Impact:**
- Section 5.1 (State Machine) SUCCESS state updated
- E2E tests updated to check query params instead of redirects
- PendingSuccess component shows different messages for Mode A vs Mode B

---

### 15.4 Additional Fixes from SA Review

#### Platform Admin Notification (Mode A)

**BLS-01 §3.2 Notifications:**
> Company registered (Mode A) → Email → Platform admins

**Added:** Email notification in `createNewCompany` action (Section 2.3).

---

#### OTP Resend Cooldown

**BLS-01 §3.3 Operational:**
> Resend Cooldown: 60 seconds

**Added:** 60-second countdown timer in `useOTPVerification` hook (Section 3.3).

---

#### Consent Record Creation

**BLS-01 §3.2 Data Effects:**
- Step 8 (Candidate): Create `consent_records`
- Step 8 (Company Mode A): Create `consent_records`
- Step 7 (Company Mode B): Create `consent_records`

**Added:** `webConsentRecordsCreate` calls in all three registration actions (Section 2.3).

---

### 15.5 Summary of SA Review Changes

| Issue | Original Plan | Resolution | Impact |
|-------|---------------|------------|--------|
| Rate limits | Not specified | Use existing (5/15min) | Section 2.1 note |
| Company Mode B roles | `['company', 'admin', 'pending']` | `['candidate', 'pending']` | Section 2.2, 2.3 |
| Post-reg routing | Not clearly specified | Stay on page with query params (RIS) | Section 5.1 |
| Admin notification | Missing | Added to createNewCompany | Section 2.3 |
| OTP cooldown | Not specified | 60 seconds | Section 3.3, 6.3 |
| Consent records | Mentioned but not detailed | Added to all actions | Section 2.3 |

---

*Plan created: 2025-12-13*
*SA Review: 2025-12-13*
*BLS-01 Deviations Documented: 2025-12-13*
*Status: ✅ APPROVED - Ready for Implementation*
