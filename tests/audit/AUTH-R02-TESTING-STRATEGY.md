# AUTH-R02 Testing Strategy

## The Challenge

AUTH-R02 (Register) is your most complex route with:

| Complexity Factor | Details |
|-------------------|---------|
| **4 Registration Flows** | Candidate Google, Candidate Email, Company Mode A, Company Mode B |
| **OTP Verification** | Email sending, 6-digit code, 15-minute expiry, server cookie |
| **File Uploads** | Company registration doc (Mode A), Name card (Mode B) |
| **External Dependencies** | Firebase Auth, SendGrid email, Firebase Storage |
| **Multi-step Wizard** | 2-3 steps depending on flow, state persistence across refresh |
| **200+ Testable Specs** | From the RIS document |

---

## Testing Strategy: Layered Approach

### Layer 1: Unit Tests (No External Dependencies)

**What to test:** UI components, form validation, state transitions, business logic

**How:** Mock everything external, test pure functions and React components

```
tests/unit/jobsmarket/auth/register/
├── components/
│   ├── RoleSelectCard.test.tsx      # Role selection UI
│   ├── EmailForm.test.tsx           # Email input + validation
│   ├── OTPInput.test.tsx            # 6-digit code input
│   ├── PasswordForm.test.tsx        # Password + confirm
│   ├── CompanyModeToggle.test.tsx   # Mode A/B toggle
│   ├── CompanySearchDropdown.test.tsx  # Mode B company search
│   ├── CompanyDetailsForm.test.tsx  # Mode A form fields
│   └── FileUploadZone.test.tsx      # Document upload UI
├── validation/
│   ├── email-validation.test.ts     # Email format rules
│   ├── password-validation.test.ts  # Password strength rules
│   ├── otp-validation.test.ts       # OTP format (6 digits)
│   ├── company-form-validation.test.ts  # Tax ID, company name
│   └── file-validation.test.ts      # File type, size limits
├── state/
│   ├── wizard-state-machine.test.ts # State transitions
│   ├── role-detection.test.ts       # From query params
│   └── mode-detection.test.ts       # Company Mode A/B
└── hooks/
    ├── use-register-wizard.test.ts  # Wizard orchestration
    ├── use-otp-timer.test.ts        # Resend countdown
    └── use-company-search.test.ts   # Debounced search
```

**Example Unit Test:**

```typescript
// password-validation.test.ts
describe('Password Validation', () => {
  test('rejects password shorter than 8 characters', () => {
    expect(validatePassword('short')).toEqual({
      valid: false,
      error: 'PASSWORD_TOO_SHORT'
    });
  });

  test('requires at least one number', () => {
    expect(validatePassword('abcdefgh')).toEqual({
      valid: false,
      error: 'PASSWORD_NO_NUMBER'
    });
  });

  test('accepts valid password', () => {
    expect(validatePassword('SecurePass123')).toEqual({
      valid: true,
      error: null
    });
  });
});
```

---

### Layer 2: Integration Tests (Mocked External Services)

**What to test:** Server actions, API calls, database operations

**How:** Use mocked Firebase Admin SDK, mocked SendGrid, test Firestore emulator

```
tests/integration/jobsmarket/auth/register/
├── actions/
│   ├── send-otp-email.test.ts       # OTP creation + email mock
│   ├── verify-otp-code.test.ts      # OTP validation logic
│   ├── create-candidate-account.test.ts  # User + candidate docs
│   ├── create-company-request.test.ts    # Mode A company creation
│   └── staff-request-apply.test.ts       # Mode B join request
├── flows/
│   ├── candidate-google-oauth.test.ts    # Full Google flow
│   ├── candidate-email-password.test.ts  # Full email flow
│   ├── company-mode-a.test.ts            # Create new company
│   └── company-mode-b.test.ts            # Join existing company
└── edge-cases/
    ├── email-already-exists.test.ts      # Existing user detection
    ├── otp-expired.test.ts               # 15-minute expiry
    ├── otp-max-attempts.test.ts          # Rate limiting
    └── file-upload-failure.test.ts       # Storage errors
```

**Key: Mock the External Boundaries**

```typescript
// test-setup.ts
import { vi } from 'vitest';

// Mock SendGrid
vi.mock('@sendgrid/mail', () => ({
  setApiKey: vi.fn(),
  send: vi.fn().mockResolvedValue([{ statusCode: 202 }])
}));

// Mock Firebase Admin Auth
vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    createUser: vi.fn().mockResolvedValue({ uid: 'test-uid' }),
    getUserByEmail: vi.fn().mockRejectedValue({ code: 'auth/user-not-found' })
  })
}));

// Use Firestore Emulator for real database tests
// Set FIRESTORE_EMULATOR_HOST=localhost:8080
```

**Example Integration Test:**

```typescript
// send-otp-email.test.ts
import { sendVerificationOTPEmail } from '@/domains/authentication/services/server/actions/otp';
import sgMail from '@sendgrid/mail';

describe('sendVerificationOTPEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('creates OTP record and sends email', async () => {
    const result = await sendVerificationOTPEmail('test@example.com');
    
    // Verify OTP record created
    expect(result.success).toBe(true);
    expect(result.refCode).toMatch(/^[A-Z0-9]{6}$/);
    
    // Verify email sent
    expect(sgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: expect.stringContaining('OTP')
      })
    );
  });

  test('invalidates previous OTPs for same email', async () => {
    // First OTP
    const first = await sendVerificationOTPEmail('test@example.com');
    
    // Second OTP
    const second = await sendVerificationOTPEmail('test@example.com');
    
    // Verify first is invalidated
    const firstOTP = await getOTPByRefCode(first.refCode);
    expect(firstOTP.status).toBe('invalidated');
    
    // Second is active
    const secondOTP = await getOTPByRefCode(second.refCode);
    expect(secondOTP.status).toBeNull(); // null = active
  });
});
```

---

### Layer 3: E2E Tests (Full Flow with Test Bypasses)

**What to test:** Complete user journeys through the UI

**How:** Use test factories + OTP bypass for testing

```
tests/e2e/jobsmarket/auth/
├── register.spec.ts                 # Main registration flows
├── register-candidate-google.spec.ts
├── register-candidate-email.spec.ts
├── register-company-mode-a.spec.ts
├── register-company-mode-b.spec.ts
└── register-errors.spec.ts          # Error handling flows
```

**The OTP Challenge in E2E**

You cannot actually send/receive emails in E2E tests. Solutions:

#### Option A: Test OTP Code (Recommended)

Create a test-only OTP that always works:

```typescript
// In server action: sendVerificationOTPEmail()
export async function sendVerificationOTPEmail(email: string) {
  // In test environment, use predictable OTP
  const otpCode = process.env.NODE_ENV === 'test' 
    ? '123456'  // Always this in tests
    : generateRandomOTP();
    
  // ... rest of logic
}
```

```typescript
// E2E test
test('completes email registration with OTP', async ({ page }) => {
  await page.goto('/auth/register?role=candidate');
  
  // Step 1: Enter email
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.click('[data-testid="send-otp-button"]');
  
  // Step 2: Enter test OTP
  await page.fill('[data-testid="otp-input"]', '123456'); // Known test value
  await page.click('[data-testid="verify-otp-button"]');
  
  // Step 3: Set password
  await page.fill('[data-testid="password-input"]', 'TestPass123');
  await page.fill('[data-testid="confirm-password-input"]', 'TestPass123');
  await page.click('[data-testid="register-button"]');
  
  // Verify redirect to profile
  await expect(page).toHaveURL(/\/candidates\/.*\/profile/);
});
```

#### Option B: Skip OTP Step via Factory

Create user in "OTP verified" state directly:

```typescript
// auth-factory.ts
export async function createPartiallyRegisteredUser(options: {
  email: string;
  otpVerified: boolean;
}) {
  // Create OTP record with verified status
  await createOTPRecord({
    email: options.email,
    refCode: 'TEST01',
    otpCode: '123456',
    status: options.otpVerified ? 'verified' : null
  });
  
  // Set the otpVerified cookie
  if (options.otpVerified) {
    await setTestCookie('otpVerified', 'TEST01');
  }
}
```

```typescript
// E2E test - start from password step
test('completes registration from password step', async ({ page }) => {
  // Pre-setup: User has verified OTP
  await createPartiallyRegisteredUser({
    email: 'test@example.com',
    otpVerified: true
  });
  
  await page.goto('/auth/register?role=candidate&email=test@example.com');
  
  // Should skip to password step due to cookie
  await expect(page.getByTestId('password-form')).toBeVisible();
  
  // Complete registration
  await page.fill('[data-testid="password-input"]', 'TestPass123');
  // ...
});
```

---

## Test Boundaries Summary

| Test Type | Tests What | Mocks What | Uses Real |
|-----------|------------|------------|-----------|
| **Unit** | Components, validation, state | Everything external | Nothing |
| **Integration** | Server actions, business logic | SendGrid, Firebase Auth | Firestore Emulator |
| **E2E** | Full user journeys | OTP (via test code) | Browser, Firestore |

---

## Recommended Test Implementation Order

### Phase 1: Unit Tests (Foundation)

1. Form validation (email, password, OTP format)
2. UI components (RoleSelectCard, OTPInput, etc.)
3. State machine transitions

**Why first:** Fastest to write, catches most bugs, no setup needed

### Phase 2: Integration Tests (Server Actions)

1. `sendVerificationOTPEmail()` - with mocked SendGrid
2. `verifyOTPCode()` - with Firestore emulator
3. Account creation actions

**Why second:** Validates business logic works correctly

### Phase 3: E2E Tests (User Journeys)

1. Candidate Google OAuth (simplest - no OTP)
2. Candidate Email/Password (with test OTP)
3. Company Mode A (create new company)
4. Company Mode B (join existing)

**Why last:** Most expensive, catches integration issues

---

## Test Data Factories Needed

```typescript
// tests/e2e/helpers/factories/register-factory.ts

export const registerFactory = {
  // For testing Google OAuth flow
  async createGoogleAuthUser(overrides?: Partial<GoogleUser>) {
    return {
      uid: `test-google-${Date.now()}`,
      email: `google-${Date.now()}@test.com`,
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
      ...overrides
    };
  },
  
  // For testing OTP flow
  async createVerifiedOTP(email: string) {
    const refCode = 'TEST01';
    await db.collection('otp_codes').doc(refCode).set({
      email,
      otp_code: '123456',
      ref_code: refCode,
      status: 'verified',
      create_date: new Date()
    });
    return { refCode, otpCode: '123456' };
  },
  
  // For testing company search (Mode B)
  async createApprovedCompany(overrides?: Partial<CompanyInfo>) {
    const companyId = `test-company-${Date.now()}`;
    await db.collection('company_information').doc(companyId).set({
      uid: companyId,
      company_name: 'Test Company Co., Ltd.',
      company_name_en: 'Test Company',
      status: 'approved',
      is_active: true,
      ...overrides
    });
    return companyId;
  }
};
```

---

## What NOT to Test in This Route

| Don't Test | Why | Where to Test Instead |
|------------|-----|----------------------|
| SendGrid email delivery | External service | SendGrid's own monitoring |
| Firebase Auth internals | External service | Firebase Console |
| File upload to Storage | Covered by Storage SDK | Storage integration tests |
| Wallet bonus logic | Different domain (WALLET) | WALLET-R01 tests |

---

## Summary

**Q: How do we test AUTH-R02?**

**A:** Layer by layer:
1. **Unit tests** - Test validation, components, state in isolation (mock everything)
2. **Integration tests** - Test server actions with mocked emails, real Firestore emulator
3. **E2E tests** - Test full flows using test OTP codes (`123456`) or factory-created verified states

The key insight is: **You don't need real emails to test OTP flows.** Use a predictable test OTP code in test environment, or pre-create "verified" OTP states via factories.
