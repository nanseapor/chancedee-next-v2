# RIS: /auth/reset

**Route ID:** AUTH-R04  
**Version:** 1.2  
**Status:** Draft  
**Created:** 2025-12-08  
**Last Updated:** 2025-12-09

**Changes in v1.2:**
- Added Cross-References section linking to AUTH-R00 shared patterns

**Changes in v1.1:**
- Updated Section 7.2 to use 5-column State Transition Table format per RIS_ORCHESTRATOR_GUIDE.md
- Added Section 7.3 Component State Automaton

---

## Cross-References

This document references shared specifications from **AUTH-R00_cross-cutting_RIS.md**.

| Topic | AUTH-R00 Section |
|-------|------------------|
| Error UX standards | Section 2 |
| i18n & Thai copy guidelines | Section 6 |
| Error code → message mapping | Appendix A |
| Thai copy reference | Appendix B |

> **Note:** This is a simple public route. Most AUTH-R00 sections (session, atoms, rate limiting) do not apply.

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/auth/reset` |
| Shell | Minimal Shell |
| Purpose | Password reset email request form |
| Complexity | Low |
| Phase | 1 (Foundation) |
| UI Spec | `08-component-index.md` - Auth Routes: "Reset Form, Success State" |

---

## 2. Domain Classification

### Primary Domain: Authentication

- **Owns:** Password reset request flow
- **Mutations:**
  - Firebase `sendPasswordResetEmail()` call

### Secondary Domains

None — this is a standalone public route.

### Global Domains

| Domain | Requirement |
|--------|-------------|
| Auth | Not required (public route, no session needed) |
| Chat | Not available (minimal shell) |
| Notifications | Not available (minimal shell) |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Reference |
|------------|--------------|----------|-----------|
| AUTH-006 | Password Reset Request | Full | `features_authentication.md` lines 396-447 |
| AUTH-007 | Password Reset Completion | Trigger only | Firebase handles via email link |

### Feature Details

**AUTH-006: Password Reset Request**
- Entry Point: `/auth/reset` (this route)
- UI Trigger: "ลืมรหัสผ่าน?" link from login pages
- Component: `ResetPassword` client component
- Firebase Method: `sendPasswordResetEmail(email)`

**AUTH-007: Password Reset Completion**
- Not handled by this route — Firebase provides the reset form via email link
- After Firebase reset completion, user redirects to `/auth/login`

---

## 4. Data Contract

### 4.1 Read Operations

None — this is a public route with no data fetching.

### 4.2 Write Operations

| Action | Method | Target | Trigger |
|--------|--------|--------|---------|
| Send reset email | `sendPasswordResetEmail(email)` | Firebase Auth | Form submit |

### 4.3 Firebase Auth Operations

| Operation | Method | Trigger |
|-----------|--------|---------|
| Send Password Reset | `sendPasswordResetEmail(auth, email, actionCodeSettings)` | Submit button |

**Action Code Settings:**
```typescript
const actionCodeSettings = {
  url: `${window.location.origin}/auth/login`,
  handleCodeInApp: false
};
```

---

## 5. State Contract

### 5.1 Atoms

None required — this is a stateless public page.

### 5.2 Hooks

None required — direct Firebase SDK call.

### 5.3 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `email` | `string` | `''` or from `?email` | Email input value |
| `pageState` | `PageState` | `'idle'` | Current page state |
| `error` | `ResetError \| null` | `null` | Error display |

---

## 6. Query Parameters

| Param | Type | Required | Purpose | Source |
|-------|------|----------|---------|--------|
| `?email` | `string` | No | Pre-fill email field | Link from `/auth/login` "ลืมรหัสผ่าน?" |

**Usage:**
- When user clicks "ลืมรหัสผ่าน?" from login page, email field is passed via query param
- Pre-fills the email input to streamline the flow

---

## 7. UI State Machine

### 7.1 Page States

```
                        ┌─────────────────────┐
                        │        IDLE         │
                        │  (email form shown) │
                        └──────────┬──────────┘
                                   │
                                   │ form submit (valid email)
                                   ▼
                        ┌─────────────────────┐
                        │     SUBMITTING      │
                        │  (loading spinner)  │
                        └──────────┬──────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
         ┌─────────────────────┐      ┌─────────────────────┐
         │       SUCCESS       │      │        ERROR        │
         │  (confirmation msg) │      │  (error + form)     │
         └─────────────────────┘      └─────────────────────┘
                    │                             │
                    │ "ส่งอีกครั้ง"                │ retry / fix input
                    │                             │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │     SUBMITTING      │
                        └─────────────────────┘
```


### 7.2 Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `IDLE` | `FORM_SUBMIT` | `SUBMITTING` | email.isValid | sendPasswordResetEmail() |
| `IDLE` | `FORM_SUBMIT` | `IDLE` | !email.isValid | show inline validation error |
| `IDLE` | `BACK_CLICK` | - | - | router.push('/auth/login') |
| `SUBMITTING` | `FIREBASE_SUCCESS` | `SUCCESS` | - | display confirmation with email |
| `SUBMITTING` | `FIREBASE_ERROR` | `ERROR` | - | setError(), keep form visible |
| `SUCCESS` | `LOGIN_CLICK` | - | - | router.push('/auth/login') |
| `SUCCESS` | `RESEND_CLICK` | `SUBMITTING` | - | sendPasswordResetEmail() |
| `ERROR` | `FORM_SUBMIT` | `SUBMITTING` | email.isValid | sendPasswordResetEmail() |
| `ERROR` | `BACK_CLICK` | - | - | router.push('/auth/login') |
| `*` | `BROWSER_BACK` | - | - | navigate to previous page |

### 7.3 Component State Automaton

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| `EmailInput` | `idle` | `FOCUS` | `focused` | - |
| `EmailInput` | `focused` | `INPUT` | `focused` | - |
| `EmailInput` | `focused` | `BLUR` | `validating` | - |
| `EmailInput` | `validating` | `VALID` | `idle` | email format OK |
| `EmailInput` | `validating` | `INVALID` | `error` | email format bad |
| `EmailInput` | `error` | `FOCUS` | `focused` | - |
| `SubmitButton` | `disabled` | `EMAIL_VALID` | `enabled` | email.isValid === true |
| `SubmitButton` | `enabled` | `EMAIL_INVALID` | `disabled` | email.isValid === false |
| `SubmitButton` | `enabled` | `CLICK` | `loading` | - |
| `SubmitButton` | `loading` | `SUCCESS` | `hidden` | show success view |
| `SubmitButton` | `loading` | `ERROR` | `enabled` | - |
| `ErrorAlert` | `hidden` | `SHOW_ERROR` | `visible` | error !== null |
| `ErrorAlert` | `visible` | `DISMISS` | `hidden` | - |
| `ErrorAlert` | `visible` | `RETRY` | `hidden` | - |
| `BackLink` | `idle` | `CLICK` | `idle` | navigate to /auth/login |
| `ResendButton` | `hidden` | `SHOW_SUCCESS` | `visible` | pageState === 'success' |
| `ResendButton` | `visible` | `CLICK` | `loading` | - |
| `ResendButton` | `loading` | `SENT` | `visible` | show "sent" confirmation |

---

## 8. UI Layout

### 8.1 IDLE State

```
┌─────────────────────────────────────────────────────────────┐
│                      [ChanceDee Logo]                       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │                   🔐 ลืมรหัสผ่าน                       │  │
│  │                                                       │  │
│  │  กรอกอีเมลที่ใช้ลงทะเบียน                               │  │
│  │  เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ                │  │
│  │                                                       │  │
│  │  อีเมล *                                              │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ [pre-filled from ?email or empty]               │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  [inline validation error if any]                     │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              [ส่งลิงก์รีเซ็ต]                     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │                   [← กลับไปหน้าเข้าสู่ระบบ]             │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 SUBMITTING State

Same as IDLE, but:
- Submit button shows loading spinner
- Submit button is disabled
- Email input is disabled
- Back link is disabled

### 8.3 SUCCESS State

```
┌─────────────────────────────────────────────────────────────┐
│                      [ChanceDee Logo]                       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │                   ✅ ส่งลิงก์แล้ว                      │  │
│  │                                                       │  │
│  │  เราส่งลิงก์รีเซ็ตรหัสผ่านไปที่                          │  │
│  │  user@example.com                                     │  │
│  │                                                       │  │
│  │  กรุณาตรวจสอบอีเมลของคุณ                               │  │
│  │  (อาจอยู่ในโฟลเดอร์สแปม)                               │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              [กลับไปหน้าเข้าสู่ระบบ]              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │              ไม่ได้รับอีเมล? [ส่งอีกครั้ง]              │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.4 ERROR State

Same as IDLE, but:
- Error message displayed below email input
- Form remains functional for retry

---

## 9. Component Layout

| Component | Purpose | Position | Responsive | Notes |
|-----------|---------|----------|------------|-------|
| **Logo** | Brand identity | Top center | - | ChanceDee logo |
| **Reset Card** | Form container | Center | Full-width mobile, max 400px desktop | - |
| ↳ Icon | Visual cue | Top center | - | 🔐 or lock icon |
| ↳ Title | Page heading | Center | - | "ลืมรหัสผ่าน" |
| ↳ Description | Instructions | Center | - | Email request text |
| ↳ Email Input | Email field | Full-width | - | With validation |
| ↳ Submit Button | Primary action | Full-width | - | "ส่งลิงก์รีเซ็ต" |
| ↳ Back Link | Navigation | Center | - | "← กลับไปหน้าเข้าสู่ระบบ" |

---

## 10. Error Handling

### 10.1 Firebase Error Mapping

| Firebase Code | Condition | Thai Message | Recovery Action |
|---------------|-----------|--------------|-----------------|
| `auth/user-not-found` | Email not in Firebase | ไม่พบบัญชีที่ใช้อีเมลนี้ | Show register link |
| `auth/invalid-email` | Invalid email format | รูปแบบอีเมลไม่ถูกต้อง | Fix input |
| `auth/too-many-requests` | Rate limited | กรุณารอสักครู่แล้วลองใหม่ | Wait ~15 minutes |
| `auth/network-request-failed` | Network failure | เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่ | Retry button |
| (unknown) | Unexpected error | เกิดข้อผิดพลาด กรุณาลองใหม่ | Retry |

### 10.2 Client-Side Validation

| Field | Validation | Error Message |
|-------|------------|---------------|
| Email | Required | กรุณากรอกอีเมล |
| Email | Valid format | รูปแบบอีเมลไม่ถูกต้อง |

**Validation Schema (Zod):**
```typescript
const ResetSchema = z.object({
  email: z.string()
    .min(1, 'กรุณากรอกอีเมล')
    .email('รูปแบบอีเมลไม่ถูกต้อง')
});
```

### 10.3 User Not Found Recovery

When `auth/user-not-found` error occurs:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ ไม่พบบัญชีที่ใช้อีเมลนี้                                   │
│                                                             │
│  อีเมลนี้ยังไม่ได้ลงทะเบียน                                   │
│  [สร้างบัญชีใหม่]                                            │
└─────────────────────────────────────────────────────────────┘
```

"สร้างบัญชีใหม่" links to `/auth/register?email={email}`

---

## 11. Component-Action Wiring

| Component | Trigger | Action | Effect |
|-----------|---------|--------|--------|
| Email Input | onChange | Update `email` state | Controlled input |
| Email Input | onBlur | Validate email | Show/hide inline error |
| Submit Button | onClick | Submit form | Trigger reset flow |
| Submit Button | disabled when | `pageState === 'submitting'` OR invalid email | Prevent double-submit |
| Back Link | onClick | `router.push('/auth/login')` | Navigate |
| "ส่งอีกครั้ง" Link | onClick | Resend email | Trigger reset flow again |
| Register Link | onClick | `router.push('/auth/register?email=${email}')` | Navigate with email |

---

## 12. Implementation Checklist

### 12.1 Page Component

- [ ] Create `app/auth/reset/page.tsx`
- [ ] Minimal Shell wrapper (logo only)
- [ ] Reset Card component with form

### 12.2 State Management

- [ ] Local state for `email`, `pageState`, `error`
- [ ] Read `?email` query param on mount
- [ ] Initialize email from query param if present

### 12.3 Form Implementation

- [ ] Email input with Zod validation (`ResetSchema`)
- [ ] Submit button with loading state
- [ ] Inline validation error display
- [ ] Back link to `/auth/login`

### 12.4 Firebase Integration

- [ ] Import `sendPasswordResetEmail` from Firebase Auth
- [ ] Configure `actionCodeSettings` with login redirect URL
- [ ] Handle success → SUCCESS state
- [ ] Handle errors → ERROR state with mapped messages

### 12.5 Success State

- [ ] Success card with confirmation message
- [ ] Display submitted email
- [ ] "กลับไปหน้าเข้าสู่ระบบ" primary button
- [ ] "ส่งอีกครั้ง" link for resend

### 12.6 Error Handling

- [ ] Map Firebase error codes to Thai messages
- [ ] Show inline error on form
- [ ] "สร้างบัญชีใหม่" link for user-not-found error

### 12.7 Testing

- [ ] Test: Valid email submits successfully
- [ ] Test: Invalid email shows validation error
- [ ] Test: User not found shows register link
- [ ] Test: Rate limiting shows wait message
- [ ] Test: Network error shows retry option
- [ ] Test: Query param pre-fills email
- [ ] Test: Resend button works from SUCCESS state

---

## 13. System Constraints

### 13.1 Current Constraints

| Constraint | Description |
|------------|-------------|
| Firebase-handled reset | Actual password change happens via Firebase email link |
| No custom reset page | Firebase provides the reset form UI |
| Rate limiting | Firebase enforces rate limits on reset emails (~5 per hour) |
| Email delivery | Depends on Firebase/SendGrid email delivery |
| No confirmation | Cannot verify if email was delivered successfully |

### 13.2 State Rename (Migration Note)

| Old | New | Reason |
|-----|-----|--------|
| `navBarAtom` | `activeRoleAtom` | Semantic — role drives UI, not vice versa |

*Note: This route does not use `navBarAtom` since it's a public route.*

---

## 14. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| No session check | Public route | User forgot password = can't log in | 2025-12-08 |
| Pre-fill from query param | Yes | UX improvement from login flow | 2025-12-08 |
| Show email in success | Yes | Confirm which inbox to check | 2025-12-08 |
| Resend option | In SUCCESS state | Common UX for email flows | 2025-12-08 |
| Register link on not-found | Yes | Guide user to correct action | 2025-12-08 |
| Rate limit message | Generic "wait" | Firebase doesn't provide countdown | 2025-12-08 |

---

## 15. Related Routes

| Route | Relationship |
|-------|--------------|
| `/auth/login` | Source — "ลืมรหัสผ่าน?" link comes from here |
| `/auth/login` | Destination — redirect after Firebase reset completion |
| `/auth/register` | Related — link shown when email not found |

---

## 16. User Flow Diagram

```
[User on /auth/login]
       │
       │ clicks "ลืมรหัสผ่าน?" (passes ?email if entered)
       ▼
[/auth/reset] ──── Email pre-filled (if passed) ──── [User enters/confirms email]
       │                                                      │
       │                                                      │
       │                                         ┌────────────┴────────────┐
       │                                         │                         │
       │                                         ▼                         ▼
       │                                   [Email valid]            [Email invalid]
       │                                         │                         │
       │                                         │                    Show error
       │                                         │                    Fix & retry
       │                                         ▼
       │                                   [SUBMITTING]
       │                                         │
       │                         ┌───────────────┴───────────────┐
       │                         │                               │
       │                         ▼                               ▼
       │                   [SUCCESS]                        [ERROR]
       │                "ส่งลิงก์แล้ว"                    Show error + form
       │                         │                               │
       │          ┌──────────────┤                               │
       │          │              │                               │
       │          ▼              ▼                               │
       │    [Check email]  [ส่งอีกครั้ง]                          │
       │          │              └───────────────────────────────┘
       │          │
       │          │ (User clicks link in email)
       │          ▼
       │    [Firebase Reset Form] ←── Hosted by Firebase
       │          │
       │          │ (User sets new password)
       │          ▼
       │    [/auth/login] ←── Redirect with success
       │          │
       │          ▼
       │    [User logs in with new password]
       ▼
```

---

## Appendix A: TypeScript Types

```typescript
// Page state
type PageState = 'idle' | 'submitting' | 'success' | 'error';

// Error types
interface ResetError {
  code: ResetErrorCode;
  message: string;
  showRegisterLink?: boolean;
}

type ResetErrorCode =
  | 'USER_NOT_FOUND'
  | 'INVALID_EMAIL'
  | 'TOO_MANY_REQUESTS'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// Form data
interface ResetFormData {
  email: string;
}

// Query params
interface ResetQueryParams {
  email?: string;
}
```

---

## Appendix B: Firebase Integration

```typescript
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

async function handleSubmit(email: string): Promise<void> {
  const auth = getAuth();
  
  const actionCodeSettings = {
    url: `${window.location.origin}/auth/login`,
    handleCodeInApp: false
  };
  
  try {
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    setPageState('success');
  } catch (error) {
    const firebaseError = error as { code?: string };
    setError(mapFirebaseError(firebaseError.code));
    setPageState('error');
  }
}

function mapFirebaseError(code?: string): ResetError {
  switch (code) {
    case 'auth/user-not-found':
      return {
        code: 'USER_NOT_FOUND',
        message: 'ไม่พบบัญชีที่ใช้อีเมลนี้',
        showRegisterLink: true
      };
    case 'auth/invalid-email':
      return {
        code: 'INVALID_EMAIL',
        message: 'รูปแบบอีเมลไม่ถูกต้อง'
      };
    case 'auth/too-many-requests':
      return {
        code: 'TOO_MANY_REQUESTS',
        message: 'กรุณารอสักครู่แล้วลองใหม่'
      };
    case 'auth/network-request-failed':
      return {
        code: 'NETWORK_ERROR',
        message: 'เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่'
      };
    default:
      return {
        code: 'UNKNOWN_ERROR',
        message: 'เกิดข้อผิดพลาด กรุณาลองใหม่'
      };
  }
}
```

---

## Appendix C: Component File Structure

```
src/
├── app/
│   └── auth/
│       └── reset/
│           └── page.tsx              # Main page component
├── components/
│   └── auth/
│       ├── ResetCard.tsx             # Form container
│       ├── ResetForm.tsx             # Email form
│       └── ResetSuccess.tsx          # Success state
└── lib/
    └── validations/
        └── auth.ts                   # ResetSchema (existing)
```

---

## Appendix D: Source References

| Section | Source |
|---------|--------|
| AUTH-006 feature | `features_authentication.md` lines 396-447 |
| AUTH-007 feature | `features_authentication.md` lines 450-504 |
| Firebase errors | `features_authentication.md` Error Handling section |
| Minimal Shell | `01-navigation-shells.md`, `AUTH-R01_login_RIS.md` |
| Validation schema | `src/lib/validations/auth.ts` |

---

*End of RIS: /auth/reset (AUTH-R04) v1.1*
