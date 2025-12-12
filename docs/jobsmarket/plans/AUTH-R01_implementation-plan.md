# Route Implementation Plan: AUTH-R01

## Route: `/auth/login`
## RIS: `AUTH-R01_login_RIS.md`
## Related BLS: `BLS-01_onboarding.md` Section 3.1

---

## 1. Files to Create

| File | Purpose |
|------|---------|
| `src/app/jobsmarket/auth/login/page.tsx` | Login route page (server component) |
| `src/app/jobsmarket/auth/login/_components/LoginCard.tsx` | Main login card container |
| `src/app/jobsmarket/auth/login/_components/EmailLoginForm.tsx` | Email/password form |
| `src/app/jobsmarket/auth/login/_components/GoogleLoginButton.tsx` | OAuth button |
| `src/app/jobsmarket/auth/login/_components/SuspendedAccountCard.tsx` | Suspended/deleted account display |
| `src/app/jobsmarket/auth/login/_components/RateLimitedCard.tsx` | Too many attempts display |
| `src/app/jobsmarket/auth/login/_components/ContextMessage.tsx` | Shows redirect context message (SHOW_MESSAGE state) |
| `src/app/jobsmarket/auth/layout.tsx` | Minimal shell layout for auth routes |
| `src/store/jobsmarket/global-atoms.ts` | Cross-domain atoms (activeRole, sessionState) |
| `src/store/jobsmarket/auth-atoms.ts` | Login-flow-specific Jotai atoms |
| `src/domains/authentication/services/server/actions/jobsmarket/login-action.ts` | Login server action |
| `src/hooks/jobsmarket/use-login.ts` | Login hook for client-side orchestration |
| `tests/unit/jobsmarket/actions/auth/login.test.ts` | Server action unit tests |
| `tests/unit/jobsmarket/components/auth/LoginCard.test.tsx` | Component unit tests |
| `tests/e2e/jobsmarket/auth/login.spec.ts` | E2E test for login flow |

---

## 2. Server Actions Required

| Action | Source | Signature | New/Reuse |
|--------|--------|-----------|-----------|
| `login` | BLS-01 §3.1 | `(idToken: string) => Promise<LoginResult>` | **Reuse** from `src/domains/authentication/services/server/actions/session.ts` |
| `logout` | BLS-01 §3.1 | `() => Promise<{success: boolean}>` | **Reuse** from `src/domains/authentication/services/server/actions/session.ts` |
| `loginWithPostRouting` | BLS-01 §3.1 | `(idToken: string) => Promise<LoginWithRoutingResult>` | **New** - wraps existing `login` + adds routing logic |
| `webUserAccountGetCompleteById` | BLS-01 §3.1 | `(uid: string) => Promise<CompleteUserData>` | **Reuse** from `src/lib/database/actions/user-accounts.ts` |
| `webConsentRecordCreate` | BLS-01 §3.1 | `(payload, actorId) => Promise<string>` | **Reuse** from `src/lib/database/actions/consent-records.ts` |

### New Action Detail: `loginWithPostRouting`

```typescript
interface LoginWithRoutingResult {
  success: boolean;
  error?: {
    code: string;
    message: string; // Thai
  };
  redirectUrl?: string;
  user?: {
    uid: string;
    email: string;
    roles: string[];
  };
}
```

**Implementation Notes:**
1. Call existing `login(idToken)` to create session
2. Fetch user data via `webUserAccountGetCompleteById`
3. Apply post-login routing logic (BLS-01 §3.1 Post-Login Routing Logic)
4. Log consent record for terms acceptance
5. Return redirect URL based on user state

---

## 3. State Management

### 3.1 Atom Locations (Per SA Review)

| File | Atoms | Scope |
|------|-------|-------|
| `src/store/jobsmarket/global-atoms.ts` | `activeRoleAtom`, `sessionStateAtom` | Cross-domain (used by shells, navigation) |
| `src/store/jobsmarket/auth-atoms.ts` | `loginPageStateAtom`, `loginErrorAtom`, `termsAcceptedAtom`, `contextMessageAtom` | Login-flow-specific |

### 3.2 Login Page State Machine (Aligned with RIS §6.1)

```typescript
type LoginPageState =
  | 'check_auth'      // Initial load - checking existing session
  | 'already_auth'    // User has session, redirecting to dashboard
  | 'idle'            // Show login form
  | 'show_message'    // Show context (e.g., "เข้าสู่ระบบเพื่อดำเนินการต่อ")
  | 'authenticating'  // Firebase auth in progress
  | 'routing'         // Post-login routing logic
  | 'redirecting'     // Navigation happening
  | 'error';          // Error state, form re-enabled
```

### 3.3 Atom Definitions

| Atom/Hook | Purpose | New/Reuse |
|-----------|---------|-----------|
| `loginPageStateAtom` | Tracks login page state per RIS §6.1 state machine | **New** in `src/store/jobsmarket/auth-atoms.ts` |
| `loginErrorAtom` | Stores error info: `{ code: string, message: string }` | **New** in `src/store/jobsmarket/auth-atoms.ts` |
| `termsAcceptedAtom` | Tracks terms checkbox state | **New** in `src/store/jobsmarket/auth-atoms.ts` |
| `contextMessageAtom` | Context message from `?from` param | **New** in `src/store/jobsmarket/auth-atoms.ts` |
| `activeRoleAtom` | Selected role for multi-role users | **New** in `src/store/jobsmarket/global-atoms.ts` |
| `sessionStateAtom` | Current session state | **New** in `src/store/jobsmarket/global-atoms.ts` |
| `useLogin` | Hook orchestrating login flow | **New** in `src/hooks/jobsmarket/use-login.ts` |

### 3.4 Note on Existing Atoms
The existing `userAtom` in `src/store/atom-store.ts` is for the content subdomain. Per project conventions, we create new atoms in `src/store/jobsmarket/` for the jobsmarket subdomain.

---

## 4. Test Coverage Plan

| Type | Test Case | Covers |
|------|-----------|--------|
| **Unit** | `loginWithPostRouting` returns correct redirect for single-role candidate | Post-login routing logic |
| **Unit** | `loginWithPostRouting` returns `/auth/select-role` for multi-role user | Multi-role routing |
| **Unit** | `loginWithPostRouting` returns `/auth/status?type=deleted` for deleted user | Deleted account handling |
| **Unit** | `loginWithPostRouting` fails with INVALID_CREDENTIALS for wrong password | Error mapping |
| **Unit** | `loginWithPostRouting` fails with TERMS_NOT_ACCEPTED when terms unchecked | Terms validation |
| **Unit** | `LoginCard` renders all required elements | Component structure |
| **Unit** | `EmailLoginForm` validates email format | Client validation |
| **Unit** | `EmailLoginForm` shows error state | Error display |
| **Integration** | Google OAuth flow creates session | Full OAuth flow |
| **Integration** | Email login with valid credentials creates session | Full email flow |
| **E2E** | User logs in with email and reaches dashboard | Happy path |
| **E2E** | User logs in with Google and reaches dashboard | OAuth happy path |
| **E2E** | Invalid credentials show Thai error message | Error handling |
| **E2E** | Rate limited user sees countdown | Rate limit UI |

---

## 5. State Machine Verification

Per AUTH-R01 RIS §6.1 State Machine:

| State (from RIS §6.1) | Test Assertion |
|---------------------|----------------|
| CHECK_AUTH | Loading spinner shown on initial page load |
| ALREADY_AUTH | User with session immediately redirects to dashboard |
| IDLE | Form is enabled, submit button shows "เข้าสู่ระบบ" |
| SHOW_MESSAGE | Context message displayed (e.g., "เข้าสู่ระบบเพื่อดำเนินการต่อ"), form below |
| AUTHENTICATING | Form is disabled, spinner shown, button shows loading |
| ROUTING | Full-page loader shown, determining destination |
| REDIRECTING | Browser navigates to destination |
| ERROR | Error message displayed, form re-enabled, can retry |

### State Transitions

```
┌─────────────┐
│ CHECK_AUTH  │ (initial)
└──────┬──────┘
       │
       ├──── has session ────► ALREADY_AUTH ────► (redirect to dashboard)
       │
       ├──── ?from param ────► SHOW_MESSAGE ────► (user acknowledges) ────► IDLE
       │
       └──── no session ────► IDLE
                              │
                              ├──── submit form ────► AUTHENTICATING
                              │                              │
                              │                    ┌─────────┴─────────┐
                              │                    │                   │
                              │               success              failure
                              │                    │                   │
                              │                    ▼                   ▼
                              │               ROUTING              ERROR
                              │                    │                   │
                              │                    ▼                   │
                              │              REDIRECTING               │
                              │                                        │
                              └────────────── retry ◄──────────────────┘
```

---

## 6. Query Parameter Handling

Per AUTH-R01 RIS §12 (Query Parameter Conventions):

### 6.1 Supported Parameters

| Parameter | Purpose | Example | State Transition |
|-----------|---------|---------|------------------|
| `?redirect` | Return URL after login | `?redirect=/candidates/123/dashboard` | Store in atom, use after successful login |
| `?from=session-expired` | Session expired context | `/auth/login?from=session-expired` | → SHOW_MESSAGE with "เซสชันหมดอายุ" |
| `?from=registration` | Post-registration context | `/auth/login?from=registration` | → SHOW_MESSAGE with "สร้างบัญชีสำเร็จ" |
| `?from=protected` | Protected route redirect | `/auth/login?from=protected` | → SHOW_MESSAGE with "เข้าสู่ระบบเพื่อดำเนินการต่อ" |
| `?method=social` | Highlight Google | `/auth/login?method=social` | Focus/highlight Google button |
| `?method=email` | Focus email | `/auth/login?method=email` | Focus email input field |

### 6.2 Context Messages (Thai Copy)

| `?from` Value | Thai Message | Component |
|---------------|--------------|-----------|
| `session-expired` | เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่ | `ContextMessage.tsx` |
| `registration` | สร้างบัญชีสำเร็จ กรุณาเข้าสู่ระบบ | `ContextMessage.tsx` |
| `protected` | เข้าสู่ระบบเพื่อดำเนินการต่อ | `ContextMessage.tsx` |
| `password-reset` | รีเซ็ตรหัสผ่านสำเร็จ | `ContextMessage.tsx` |

### 6.3 State Flow with `?from` Parameter

```
1. Page loads with ?from=session-expired
2. CHECK_AUTH → no session → SHOW_MESSAGE
3. ContextMessage shows "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
4. User sees message (auto-dismiss after 3s or click)
5. SHOW_MESSAGE → IDLE (form shown)
6. User logs in → ROUTING → REDIRECTING → ?redirect URL or dashboard
```

---

## 7. Thai Copy Checklist

| Element | Thai Text | Source |
|---------|-----------|--------|
| Page title | เข้าสู่ระบบ | RIS §4 |
| Google button | เข้าสู่ระบบด้วย Google | Design System 4.1 |
| Divider | หรือ | Design System 4.1 |
| Email label | อีเมล | Design System 4.1 |
| Password label | รหัสผ่าน | Design System 4.1 |
| Forgot link | ลืมรหัสผ่าน? | Design System 4.1 |
| Submit button | เข้าสู่ระบบ | Design System 4.1 |
| Register prompt | ยังไม่มีบัญชี? | Design System 4.1 |
| Register link | ลงทะเบียน | Design System 4.1 |
| Terms checkbox | ฉันยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว | RIS §5.3.2 |
| Error: Invalid credentials | อีเมลหรือรหัสผ่านไม่ถูกต้อง | BLS-01 §3.1 |
| Error: Account not found | ไม่พบบัญชีผู้ใช้ | BLS-01 §3.1 |
| Error: Account deleted | บัญชีนี้ถูกลบแล้ว | BLS-01 §3.1 |
| Error: Terms not accepted | กรุณายอมรับข้อกำหนดและนโยบาย | BLS-01 §3.1 |
| Error: Rate limited | กรุณารอสักครู่แล้วลองใหม่ | BLS-01 §3.1 |
| Error: Google OAuth failed | เข้าสู่ระบบด้วย Google ไม่สำเร็จ | Design System 4.1 |
| Error: Popup blocked | Popup ถูกบล็อก | Design System 4.1 |
| Suspended title | บัญชีของคุณถูกระงับชั่วคราว | Design System 4.1 |
| Suspended description | หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อฝ่ายสนับสนุน | Design System 4.1 |
| Support button | ติดต่อฝ่ายสนับสนุน | Design System 4.1 |
| Context: Session expired | เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่ | §6.2 |
| Context: Registration | สร้างบัญชีสำเร็จ กรุณาเข้าสู่ระบบ | §6.2 |
| Context: Protected | เข้าสู่ระบบเพื่อดำเนินการต่อ | §6.2 |
| Context: Password reset | รีเซ็ตรหัสผ่านสำเร็จ | §6.2 |

---

## 8. Dependencies

- **Requires:** None (this is the first route)
- **Blocks:**
  - AUTH-R02 (Register) - shares form components
  - AUTH-R05 (Status) - redirect target for deleted/pending
  - AUTH-R07 (Select Role) - redirect target for multi-role users
  - CAND-R01 (Dashboard) - redirect target for candidates
  - COMP-R04 (Dashboard) - redirect target for companies

---

## 9. Open Questions

1. **Google OAuth popup vs redirect:** The RIS shows popup mode, but mobile browsers may block popups. Should we implement fallback to redirect mode?
   - **Recommendation:** Implement popup first with fallback detection for redirect mode.
   - **SA Assessment:** ✅ Approved

2. **Session duration:** Existing `login` action uses 5-day sessions. BLS-01 specifies 1-hour session with refresh. Should we change?
   - **Recommendation:** Keep 5-day session for now (existing behavior). Session refresh can be added in AUTH-R00 cross-cutting implementation.
   - **SA Assessment:** ✅ Approved

3. **Terms checkbox:** Should terms acceptance be required for returning users, or only new users?
   - **Recommendation:** Per BLS-01, terms must be accepted on every login (consent record created each time).
   - **SA Assessment:** ⚠️ Verify - Confirmed in BLS-01 §3.1 Data Effects Step 6: consent record created after session.

4. **Rate limiting:** Firebase handles rate limiting. Do we need additional app-level rate limiting?
   - **Recommendation:** Rely on Firebase rate limiting initially. Add app-level if needed based on usage patterns.
   - **SA Assessment:** ✅ Approved

---

## 10. Estimated Complexity

| Aspect | Estimate |
|--------|----------|
| Components | 7 new, 0 reuse |
| Server Actions | 1 new, 4 reuse |
| Atoms/Hooks | 6 new, 0 reuse |
| Test Cases | 8 unit, 2 integration, 4 e2e |
| Effort | **Medium** |

---

## 11. Implementation Sequence

1. **Phase 1: Infrastructure**
   - Create `src/app/jobsmarket/auth/layout.tsx` (minimal shell)
   - Create `src/store/jobsmarket/global-atoms.ts` (activeRoleAtom, sessionStateAtom)
   - Create `src/store/jobsmarket/auth-atoms.ts` (loginPageStateAtom, etc.)
   - Create `src/hooks/jobsmarket/use-login.ts`

2. **Phase 2: Server Action**
   - Create `loginWithPostRouting` action
   - Write unit tests for routing logic
   - Verify all error codes map to Thai messages

3. **Phase 3: Components**
   - Create `LoginCard` container
   - Create `EmailLoginForm` with validation
   - Create `GoogleLoginButton` with OAuth flow
   - Create `ContextMessage` for SHOW_MESSAGE state
   - Create `SuspendedAccountCard` for suspended accounts
   - Create `RateLimitedCard` for rate limit errors

4. **Phase 4: Page Assembly**
   - Create `page.tsx` with query param handling
   - Implement CHECK_AUTH → ALREADY_AUTH / SHOW_MESSAGE / IDLE transitions
   - Handle `?from` parameter → ContextMessage display
   - Handle `?redirect` parameter → post-login redirect
   - Handle `?method` parameter → focus Google or email

5. **Phase 5: Testing**
   - Run unit tests
   - Run integration tests
   - Run E2E tests
   - Verify all Thai copy
   - Verify all state transitions

---

## 12. Reusable Code Identified

| Existing Code | Location | How to Reuse |
|---------------|----------|--------------|
| `login()` | `src/domains/authentication/services/server/actions/session.ts` | Call directly in `loginWithPostRouting` |
| `webUserAccountGetCompleteById()` | `src/lib/database/actions/user-accounts.ts` | Call for user data after auth |
| `webConsentRecordCreate()` | `src/lib/database/actions/consent-records.ts` | Log terms acceptance |
| `createAuthError()` | `src/domains/authentication/services/server/core/auth-engine.ts` | Error handling helper |
| `AUTH_ERROR_CODES` | `src/domains/authentication/utils/auth-errors.ts` | Error code constants |

---

## 13. SA Review Checklist

| Required Change | Status |
|-----------------|--------|
| Align `loginPageStateAtom` type with RIS §6.1 state machine | ✅ Done |
| Add `ContextMessage.tsx` component for SHOW_MESSAGE state | ✅ Done |
| Move `activeRoleAtom` to `global-atoms.ts` (cross-domain scope) | ✅ Done |
| Rename `AccountBlockedCard.tsx` → `SuspendedAccountCard.tsx` | ✅ Done |
| Add explicit handling for `?from` query parameter with state transitions | ✅ Done |

---

*Plan created: 2025-12-12*
*SA Review: 2025-12-12*
*Status: ✅ APPROVED - Ready for Implementation*
