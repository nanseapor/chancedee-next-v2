# Route Implementation Plan: AUTH-R03

**Route:** `/auth/verify`
**RIS:** `AUTH-R03_verify_RIS.md`
**Related BLS:** `BLS-01_onboarding.md` Sections 3.3, 3.4
**Created:** 2025-12-13
**Status:** Awaiting Approval

---

## 1. Files to Create

| File | Purpose |
|------|---------|
| `src/app/jobsmarket/auth/verify/page.tsx` | Server Component - Auth checks, OTP sending, redirect logic |
| `src/app/jobsmarket/auth/verify/_components/VerifyClient.tsx` | Client Component - Main page orchestrator |
| `src/app/jobsmarket/auth/verify/_components/OAuthBlockedError.tsx` | Client Component - Error page for OAuth users |
| `src/app/jobsmarket/auth/verify/_components/AuthError.tsx` | Client Component - Generic auth/validation error page |
| `src/app/jobsmarket/auth/verify/_components/SuccessScreen.tsx` | Client Component - Success confirmation screen |
| `src/domains/authentication/services/server/actions/jobsmarket/email-update-actions.ts` | Server actions for email updates (3 new functions) |
| `tests/unit/jobsmarket/auth/verify/query-validation.test.ts` | Unit tests for query parameter validation |
| `tests/unit/jobsmarket/auth/verify/authorization.test.ts` | Unit tests for auth checks |
| `tests/integration/jobsmarket/auth/verify/email-updates.test.ts` | Integration tests for update actions |
| `tests/e2e/jobsmarket/auth/verify.spec.ts` | E2E tests for all 3 purposes |

---

## 2. Server Actions Required

| Action | Source | Signature | New/Reuse | Notes |
|--------|--------|-----------|-----------|-------|
| `sendVerificationOTPEmail()` | **REUSE** - [src/domains/authentication/services/server/actions/jobsmarket/otp-actions.ts:350](src/domains/authentication/services/server/actions/jobsmarket/otp-actions.ts#L350) | `(input: {email: string}) => Promise<{success, refCode?, error?}>` | ✅ **Reuse** | Already implemented |
| `verifyOTPCode()` | **REUSE** - [src/domains/authentication/services/server/actions/jobsmarket/otp-actions.ts:366](src/domains/authentication/services/server/actions/jobsmarket/otp-actions.ts#L366) | `(input: {refCode, otpCode}) => Promise<{success, error?}>` | ✅ **Reuse** | Already implemented |
| `updateAccountEmail()` | **NEW** - BLS-01 implicit, RIS Appendix B | `(newEmail: string) => Promise<{success, error?}>` | 🆕 New | Update Firebase Auth + user_accounts |
| `updateCandidateContactEmail()` | **NEW** - BLS-01 implicit, RIS Appendix B | `(newEmail: string) => Promise<{success, error?}>` | 🆕 New | Update contacts + verification flag |
| `updateCompanyContactEmail()` | **NEW** - BLS-01 implicit, RIS Appendix B | `(companyId: string, newEmail: string) => Promise<{success, error?}>` | 🆕 New | Update company contacts |
| `authenticateSession()` | **REUSE** - src/domains/authentication/services/server/actions/session.ts | Standard session auth | ✅ **Reuse** | Already implemented |

---

## 3. State Management

| Atom/Hook | Purpose | New/Reuse | Location |
|-----------|---------|-----------|----------|
| `userAtom` | Current user data | ✅ **Reuse** | Already in src/store/ |
| `sessionStateAtom` | Session validity | ✅ **Reuse** | Already in src/store/ |
| `firebaseUserAtom` | Firebase user (for OAuth check) | ✅ **Reuse** | Already in src/store/ |
| `useOTPVerification` | OTP flow management | ✅ **Reuse** | [src/hooks/jobsmarket/use-otp-verification.ts](src/hooks/jobsmarket/use-otp-verification.ts) |
| Local state: `pageState` | Page state machine | 🆕 New | In VerifyClient component |
| Local state: `error` | Error display | 🆕 New | In VerifyClient component |

---

## 4. Test Coverage Plan

### Unit Tests

| Test Case | Covers | Location |
|-----------|--------|----------|
| Query param validation - all valid | Happy path validation | query-validation.test.ts |
| Query param validation - missing purpose | Error: MISSING_PURPOSE | query-validation.test.ts |
| Query param validation - missing email | Error: MISSING_EMAIL | query-validation.test.ts |
| Query param validation - invalid email | Error: INVALID_EMAIL | query-validation.test.ts |
| Query param validation - invalid purpose | Error: INVALID_PURPOSE | query-validation.test.ts |
| Query param validation - company-contact without entityId | Error: MISSING_ENTITY_ID | query-validation.test.ts |
| Auth check - OAuth user + purpose=account | Error: OAUTH_ACCOUNT | authorization.test.ts |
| Auth check - purpose=candidate-contact without candidate role | Error: ROLE_UNAUTHORIZED | authorization.test.ts |
| Auth check - purpose=company-contact without admin role | Error: ROLE_UNAUTHORIZED | authorization.test.ts |
| Auth check - purpose=company-contact with wrong companyId | Error: UNAUTHORIZED_ENTITY | authorization.test.ts |

### Integration Tests

| Test Case | Covers | Location |
|-----------|--------|----------|
| updateAccountEmail - success | Firebase Auth + user_accounts update | email-updates.test.ts |
| updateAccountEmail - email in use | Error: EMAIL_IN_USE | email-updates.test.ts |
| updateAccountEmail - OAuth user blocked | Error: OAUTH_ACCOUNT | email-updates.test.ts |
| updateCandidateContactEmail - success | contacts + emailVerification flag | email-updates.test.ts |
| updateCompanyContactEmail - success | Company contacts update | email-updates.test.ts |
| updateCompanyContactEmail - wrong company | Error: UNAUTHORIZED_ENTITY | email-updates.test.ts |

### E2E Tests

| Test Case | Covers | Location |
|-----------|--------|----------|
| Account email change - full flow | Send OTP → Verify → Update → Redirect | verify.spec.ts |
| Candidate contact email - full flow | Send OTP → Verify → Update → Redirect | verify.spec.ts |
| Company contact email - full flow | Send OTP → Verify → Update → Redirect | verify.spec.ts |
| OAuth user blocked | Show error page | verify.spec.ts |
| OTP expired | Show error + resend option | verify.spec.ts |
| Session expires mid-flow | Redirect to session-expired | verify.spec.ts |
| Invalid redirect param | Use default redirect | verify.spec.ts |

---

## 5. State Machine Verification

Per RIS Section 7.1.1 Page State Transition Table:

| State (from RIS §7.1) | Test Assertion |
|----------------------|----------------|
| `CHECKING_AUTH` (initial) | Page loads, shows loading spinner |
| `SENDING_OTP` | After auth pass, OTP sent automatically |
| `ENTER_OTP` | 6-digit input shown, refCode stored |
| `VERIFYING` | Loading state when 6 digits entered |
| `UPDATING` | After OTP valid, purpose-specific update called |
| `SUCCESS` | Success screen shown with redirect |
| `ERROR` | Error message shown, retry available |
| `AUTH_ERROR` | Full-page error for auth failures |

---

## 6. Thai Copy Checklist

Per RIS Section 10 UI Components:

| Element | Thai Text | Source |
|---------|-----------|--------|
| Page title | "ยืนยันอีเมล" | RIS §10.1 |
| Account purpose context | "เปลี่ยนอีเมลสำหรับเข้าสู่ระบบเป็น:" | RIS §10.1 Context Text table |
| Candidate contact context | "ยืนยันอีเมลติดต่อในเรซูเม่:" | RIS §10.1 Context Text table |
| Company contact context | "ยืนยันอีเมลติดต่อบริษัท:" | RIS §10.1 Context Text table |
| OTP instruction | "กรอกรหัส 6 หลักที่ส่งไปยังอีเมลของคุณ" | RIS §10.1 |
| Resend countdown | "ส่งรหัสใหม่ใน {MM}:{SS}" | RIS §10.1 |
| Resend link | "ส่งรหัสใหม่" | RIS §10.1 |
| Success title | "ยืนยันอีเมลสำเร็จ" | RIS §10.2 |
| OAuth blocked error | "บัญชีนี้ใช้ Google เข้าสู่ระบบ ไม่สามารถเปลี่ยนอีเมลได้" | RIS §9.0 |
| OTP invalid | "รหัส OTP ไม่ถูกต้อง" | AUTH-R00 Appendix A |
| OTP expired | "รหัส OTP หมดอายุแล้ว" | AUTH-R00 Appendix A |

---

## 7. Dependencies

### Requires (must be done first)
- ✅ AUTH-R00 cross-cutting infrastructure - **DONE** (OTP system exists)
- ✅ AUTH-R02 OTP components - **DONE** (OTPVerifyForm, OTPResendButton, PasswordCreateForm exist per instructions)
- ✅ Authentication atoms - **DONE** (userAtom, sessionStateAtom, firebaseUserAtom exist)

### Blocks (depend on this)
- AUTH-R06 `/auth/settings` - Will link to this page for email changes
- CAND-R02 `/candidates/[id]/profile` - Will link for contact email verification
- COMP-R03 `/companies/[id]/settings` - Will link for company contact email

---

## 8. Component Reuse

Per instructions, AUTH-R02 already created shared OTP components. We MUST reuse them:

| Component | Location | Reuse Strategy |
|-----------|----------|----------------|
| `OTPVerifyForm` | [src/components/jobsmarket/auth/OTPVerifyForm.tsx](src/components/jobsmarket/auth/OTPVerifyForm.tsx) | Import directly, pass refCode and onVerify callback |
| `OTPResendButton` | [src/components/jobsmarket/auth/OTPResendButton.tsx](src/components/jobsmarket/auth/OTPResendButton.tsx) | Import directly, pass email and onResend callback |
| `PasswordCreateForm` | [src/components/jobsmarket/auth/PasswordCreateForm.tsx](src/components/jobsmarket/auth/PasswordCreateForm.tsx) | **NOT USED** in this route |
| `useOTPVerification` | [src/hooks/jobsmarket/use-otp-verification.ts](src/hooks/jobsmarket/use-otp-verification.ts) | Import and use for OTP flow logic |

---

## 9. Open Questions

### 9.1 Rate Limit Discrepancy (RESOLVED)

**Discrepancy Found:**
- **RIS §9.2:** OTP rate limit = 10 requests / 15 minutes
- **BLS §3.3:** OTP rate limit = 3 requests / 5 minutes
- **Actual Implementation:** [src/lib/utils/server/rate-limiter.ts:188](src/lib/utils/server/rate-limiter.ts#L188)
  ```typescript
  OTP_REQUEST: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }
  ```

**Resolution:** Use actual implementation: **5 requests / 15 minutes**

This is a reasonable middle ground and is already working in production. Document in plan and note for future RIS/BLS updates.

### 9.2 Email-in-use Check Timing

**From RIS §8.3:** Email-in-use check happens AFTER OTP verification to prevent enumeration attacks.

**Question:** Should we check email availability at page load or only after OTP?

**Answer per RIS §8.3 Step 1-2:** Check happens in `updateAccountEmail()` server action, AFTER OTP is verified. Do NOT check on page load.

**Security Rationale:** Prevents attackers from using this page to enumerate valid emails.

### 9.3 Default Redirect URLs

**From RIS §6 getDefaultRedirect():**
```typescript
const getDefaultRedirect = (purpose: string): string => {
  switch (purpose) {
    case 'account': return '/auth/settings';
    case 'candidate-contact': return `/candidates/${uid}/profile`;
    case 'company-contact': return `/companies/${entityId}/settings`;
    default: return '/';
  }
};
```

**Question:** Do these routes exist yet?

**Answer:**
- `/auth/settings` - Not yet (AUTH-R06, Wave 0)
- `/candidates/[id]/profile` - Not yet (CAND-R02, Wave 1)
- `/companies/[id]/settings` - Not yet (COMP-R03, Wave 1)

**Resolution:** For now, use fallback redirects:
- `account`: `/` (home)
- `candidate-contact`: `/candidates/${uid}` (dashboard)
- `company-contact`: `/companies/${companyId}/dashboard`

Update when those routes are implemented.

---

## 10. Estimated Complexity

| Aspect | Estimate |
|--------|----------|
| **Components** | 4 new (VerifyClient, OAuthBlockedError, AuthError, SuccessScreen), 2 reuse (OTPVerifyForm, OTPResendButton) |
| **Server Actions** | 3 new (email update actions), 2 reuse (OTP actions) |
| **Test Cases** | 10 unit, 6 integration, 7 e2e = **23 total** |
| **Lines of Code (estimated)** | ~800 lines (400 implementation + 400 tests) |
| **Effort** | **Medium** (2-3 days) |
| **Risk** | **Low-Medium** - Reuses OTP system, but 3 different purposes add complexity |

### Complexity Drivers
1. **Multi-purpose logic:** 3 different email update flows with different authorization rules
2. **OAuth detection:** Must detect and block OAuth users for account email changes
3. **Error handling:** 12+ error states per RIS §9
4. **Security:** IDOR prevention, redirect validation, email enumeration prevention
5. **State management:** Complex state machine with 8 states

### Simplifying Factors
1. **OTP system already working:** Can reuse existing components and actions
2. **Clear RIS spec:** Very detailed state machine and error handling
3. **No new UI patterns:** Standard form + OTP input + success screen

---

## 11. Discrepancies Found (RIS vs BLS vs Implementation)

| Issue | RIS | BLS | Implementation | Resolution |
|-------|-----|-----|----------------|------------|
| **OTP Rate Limit** | 10 req / 15 min | 3 req / 5 min | 5 req / 15 min | Use implementation: **5/15min** |
| **OTP Verify Rate Limit** | Not specified | 5 attempts / 5 min | 5 attempts / 10 min | Use implementation: **5/10min** |

### Recommendation
Update RIS §9.2 and BLS §5.2 to match actual implementation (5 requests / 15 minutes for send, 5 attempts / 10 minutes for verify).

---

## 12. Implementation Strategy

### Phase 1: Core Infrastructure (Day 1)
1. Create server actions in `email-update-actions.ts`:
   - `updateAccountEmail()` with Firebase Admin SDK
   - `updateCandidateContactEmail()` with contacts + screening update
   - `updateCompanyContactEmail()` with company contacts
2. Write integration tests for all 3 actions
3. Ensure all tests pass before proceeding

### Phase 2: Page Components (Day 2)
1. Create `page.tsx` with server-side auth checks
2. Create `VerifyClient.tsx` with state machine
3. Reuse `OTPVerifyForm` and `OTPResendButton` from AUTH-R02
4. Create error screens (OAuthBlockedError, AuthError)
5. Create success screen
6. Write unit tests for query validation and auth checks

### Phase 3: Testing & Polish (Day 3)
1. Write E2E tests for all 3 purposes
2. Test OAuth blocking
3. Test session expiry handling
4. Test redirect sanitization
5. Manual testing in browser
6. Run all quality gates
7. Create PR

---

## 13. Security Checklist

Per RIS §8, §9, and security best practices:

- [ ] Server-side session validation (`authenticateSession()`)
- [ ] Purpose-specific authorization checks (roles, companyId matching)
- [ ] OAuth detection for account email changes
- [ ] Email-in-use check AFTER OTP (not before - prevents enumeration)
- [ ] Redirect URL validation (relative paths only, whitelist patterns)
- [ ] IDOR prevention (use session UID, not client-provided)
- [ ] Rate limiting via `withRateLimit` wrapper
- [ ] Session expiry detection (sessionStateAtom monitoring)
- [ ] Entity ID validation for company-contact purpose
- [ ] Role validation for each purpose type

---

## 14. File Structure Preview

```
src/app/jobsmarket/auth/verify/
├── page.tsx                          # Server Component
└── _components/
    ├── VerifyClient.tsx              # Main client orchestrator
    ├── OAuthBlockedError.tsx         # OAuth user error page
    ├── AuthError.tsx                 # Generic error page
    └── SuccessScreen.tsx             # Success confirmation

src/domains/authentication/services/server/actions/jobsmarket/
├── otp-actions.ts                    # ✅ Already exists (reuse)
└── email-update-actions.ts           # 🆕 NEW (3 actions)

src/components/jobsmarket/auth/
├── OTPVerifyForm.tsx                 # ✅ Already exists (reuse from AUTH-R02)
└── OTPResendButton.tsx               # ✅ Already exists (reuse from AUTH-R02)

src/hooks/jobsmarket/
└── use-otp-verification.ts           # ✅ Already exists (reuse from AUTH-R02)

tests/
├── unit/jobsmarket/auth/verify/
│   ├── query-validation.test.ts
│   └── authorization.test.ts
├── integration/jobsmarket/auth/verify/
│   └── email-updates.test.ts
└── e2e/jobsmarket/auth/
    └── verify.spec.ts
```

---

## 15. Next Steps (After Approval)

1. **Create branch:** `git checkout -b feat/auth-r03-verify`
2. **Write tests first (TDD):**
   - Start with unit tests for query validation
   - Then unit tests for auth checks
   - Then integration tests for email update actions
3. **Implement server actions:**
   - `updateAccountEmail()`
   - `updateCandidateContactEmail()`
   - `updateCompanyContactEmail()`
4. **Implement page components:**
   - Server page with auth checks
   - Client component with state machine
   - Error screens
   - Success screen
5. **Write E2E tests**
6. **Run quality gates:**
   - `npm run build` (Gate 1)
   - `npm run lint` (Gate 2)
   - `npm run dev` + browser test (Gate 3)
   - `npm run test:unit && npm run test:integration` (Gate 4)
7. **Create PR** with conventional commit message

---

## 16. Completion Checklist Template

(To be filled when implementation is complete)

```markdown
## Completion Checklist

### Quality Gates (ALL must pass)
- [ ] Gate 1: `npm run build` → exits with code 0
- [ ] Gate 2: `npm run lint` → no errors (warnings OK)
- [ ] Gate 3: `npm run dev` → route loads in browser without errors
- [ ] Gate 4: Tests run → X passed, Y skipped, 0 failed

### Evidence (paste actual output)
**Build output:**
```
[paste last few lines showing success]
```

**Test output:**
```
[paste summary showing pass/fail counts]
```

### Manual Verification
- [ ] Visited route: `/auth/verify?purpose=account&email=test@example.com`
- [ ] Account email change works end-to-end
- [ ] Candidate contact email change works end-to-end
- [ ] Company contact email change works end-to-end
- [ ] OAuth user sees error page for account change
- [ ] Session expiry redirects to `/auth/session-expired`
- [ ] Invalid redirect params use default redirects
```

---

**Plan Status:** 📝 Draft - Awaiting Approval
**Estimated Start:** After approval
**Estimated Completion:** 2-3 days after start
**Blocking Issues:** None - all dependencies met

---

*End of AUTH-R03 Implementation Plan*
