# AUTH-R08 Implementation Plan: Session Expired Page

**Route:** `/auth/session-expired`
**RIS Document:** `docs/jobsmarket/RIS/AUTH-R08_session-expired_RIS.md`
**Cross-Cutting:** `docs/jobsmarket/RIS/AUTH-R00_cross-cutting_RIS.md` (Section 3: Session Management)
**Created:** 2025-12-14
**Status:** Awaiting Approval

---

## 0. Critical Architecture Rule ⚠️

### ❌ DO NOT Create `/api/` Routes for Jobsmarket

**Rule:** Use **Server Actions ONLY** - No API routes.

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| `fetch('/api/auth/...')` | Server action imports |
| Create new API route | Use existing server actions |

**Existing Server Actions for This Route:**
- ✅ **NONE REQUIRED** - This is a static display page with client-side navigation only

**No server actions needed** - This is a terminal notification page that only performs navigation.

---

## 1. Executive Summary

### 1.1 Purpose
Implement a session expiry notification page that informs users their session has expired and provides clear paths to either re-login or return home. This is the "final destination" when in-place re-authentication (Session Expiry Modal) is not possible or when the user has been idle too long.

### 1.2 Scope
- **In Scope:**
  - Display session expiry message (Thai + English)
  - "เข้าสู่ระบบอีกครั้ง" (Re-login) button
  - "กลับหน้าแรก" (Return home) link
  - Pass-through `?redirect` parameter to login page
  - Logo navigation to home
  - Minimal footer with legal links
  - Mobile responsive design

- **Out of Scope:**
  - Auto-redirect countdown (deferred per RIS §13)
  - Session cleanup logic (already done by redirect source)
  - Data fetching (user already logged out)
  - Error states (no mutations possible)

### 1.3 Complexity: Low
- Static display page with no mutations
- No data fetching required (user already logged out)
- No server actions needed
- Simple navigation logic only
- Estimated effort: ~2-3 hours

### 1.4 Key Questions Answered

**Q1: What triggers this page?**
- Middleware intercepts request with expired/invalid session cookie
- `useSessionRenewal` hook detects expiry and redirects
- User navigates to protected route after session expired
- See RIS §9 for trigger scenarios

**Q2: Is this a simple static page or dynamic?**
- Static display with minimal interactivity
- Only dynamic aspect: reading and passing through `?redirect` parameter

**Q3: What actions are available?**
- Primary: "เข้าสู่ระบบอีกครั้ง" → navigates to `/auth/login?redirect={url}`
- Secondary: "กลับหน้าแรก" → navigates to `/`
- Logo: Also navigates to `/`

**Q4: Are there query params?**
- Yes: `?redirect` - URL-encoded destination after re-login
- Validated on login page (not here) per AUTH-R00 §12.2

**Q5: Any server actions needed?**
- **No** - Session cleanup already performed by redirect source
- This page only displays information and navigates

---

## 2. Requirements Analysis

### 2.1 Key Findings from RIS

**Page Purpose (RIS §1):**
- Minimal shell layout (no header/nav)
- Display-only route with no write operations
- Auth NOT required (session already expired)
- Low complexity

**Trigger Scenarios (RIS §9.1):**

| Trigger | Source | Behavior |
|---------|--------|----------|
| Expired cookie | Middleware | Intercepts request, redirects here |
| Idle timeout | `useSessionRenewal` hook | Detects expiry, redirects here |
| Protected route access | Middleware | Session invalid, redirects here |

**Session Expiry Modal vs Route (RIS §9, AUTH-R00 §3.3):**

| Mechanism | When Used | Behavior |
|-----------|-----------|----------|
| **Session Expiry Modal** | API returns 401 during active use | In-page modal, re-auth without leaving, preserves state |
| **This Route** | Middleware detects expired cookie OR idle timeout | Full page redirect, clean slate |

**UI Layout (RIS §7.1):**
```
┌─────────────────────────────────────────────────────────────────┐
│                      [ChanceDee Logo]                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │                   ⏱️ เซสชันหมดอายุ                        │  │
│  │                                                           │  │
│  │  เซสชันของคุณหมดอายุแล้ว                                   │  │
│  │  กรุณาเข้าสู่ระบบอีกครั้งเพื่อดำเนินการต่อ                    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │           [เข้าสู่ระบบอีกครั้ง]                        │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │                    [กลับหน้าแรก]                          │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│              [ข้อกำหนดการใช้งาน] | [นโยบายความเป็นส่วนตัว]       │
└─────────────────────────────────────────────────────────────────┘
```

**State Machine (RIS §6):**
```
[DISPLAY]
    │
    ├── "เข้าสู่ระบบอีกครั้ง" clicked ──► Navigate to /auth/login
    │
    ├── "กลับหน้าแรก" clicked ──► Navigate to /
    │
    └── Logo clicked ──► Navigate to /
```

Single state (DISPLAY) - all events navigate away.

**Component Wiring (RIS §7):**

| Component | Trigger | Action | Effect |
|-----------|---------|--------|--------|
| ChanceDee Logo | Click | `router.push('/')` | Navigate to home |
| "เข้าสู่ระบบอีกครั้ง" Button | Click | `handleLogin()` | Navigate to login with optional redirect |
| "กลับหน้าแรก" Link | Click | `router.push('/')` | Navigate to home |

**Query Parameters (RIS §8):**

| Param | Type | Purpose | Example |
|-------|------|---------|---------|
| `redirect` | `string` (URL-encoded) | URL to redirect back after re-login | `?redirect=%2Fcandidates%2F123` |

**Redirect Parameter Handling (RIS §8.1):**
```typescript
const searchParams = useSearchParams();
const redirectUrl = searchParams.get('redirect');

function handleLogin() {
  const loginUrl = redirectUrl
    ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`
    : '/auth/login';
  router.push(loginUrl);
}
```

**Thai Copy (RIS §11.1, AUTH-R00 Appendix B):**

| Element | Thai | English |
|---------|------|---------|
| Page Title | เซสชันหมดอายุ | Session Expired |
| Heading | เซสชันหมดอายุ | Session Expired |
| Message | เซสชันของคุณหมดอายุแล้ว<br>กรุณาเข้าสู่ระบบอีกครั้งเพื่อดำเนินการต่อ | Your session has expired<br>Please log in again to continue |
| Primary Button | เข้าสู่ระบบอีกครั้ง | Log In Again |
| Secondary Link | กลับหน้าแรก | Return Home |

### 2.2 Existing Architecture Assessment

**Atoms Used (AUTH-R00 §4.1):**
- ❌ **NONE** - User already logged out, no auth state needed
- This is different from AUTH-R07 which reads `userAtom`

**Hooks Used:**
- `useSearchParams` (Next.js) - Read `?redirect` parameter
- `useRouter` (Next.js) - Navigation

**Existing Components to Reuse:**
- ✅ `src/components/ui/button.tsx` - shadcn Button for primary action
- ✅ Minimal Shell pattern (similar to AUTH-R01 login page)
- Logo component (if exists) or inline Link

**No Existing Server Actions Required:**
- Session cleanup already done by source (middleware or `useSessionRenewal`)
- This page only displays and navigates

### 2.3 Decisions from RIS §13

| Decision | Chosen | Rationale |
|----------|--------|-----------|
| Auto-redirect countdown | ❌ Defer | Keep simple for v1.0, add if requested |
| Pass-through redirect param | ✅ Yes | Preserves user intent, validate on login |
| No data fetching | ✅ Yes | User already logged out, nothing to fetch |
| Static display only | ✅ Yes | Simplest implementation for notification page |

---

## 3. Files to Create

### 3.1 Source Files

| File | Purpose | Lines (Est.) |
|------|---------|--------------|
| `src/app/jobsmarket/auth/session-expired/page.tsx` | Route page with metadata | ~80 |

**Total:** 1 file, ~80 lines

**Note:** Single-file implementation - page component contains all UI inline (no separate `_components/` needed for such a simple page).

### 3.2 Test Files

| File | Type | Purpose | Tests (Est.) |
|------|------|---------|--------------|
| `tests/e2e/jobsmarket/auth/session-expired.spec.ts` | E2E | Navigation flows, redirect param | 6 |

**Total:** 1 test file, ~6 tests

**Note:** No unit or integration tests needed - this is a pure presentation + navigation page with no business logic.

---

## 4. Component Architecture

### 4.1 Page Component Structure

```
page.tsx (Server Component with metadata)
  └─► SessionExpiredContent (Client Component)
        ├─► Logo/Link (home navigation)
        ├─► Heading (Thai + English)
        ├─► Message (Thai + English)
        ├─► Button (เข้าสู่ระบบอีกครั้ง)
        ├─► Link (กลับหน้าแรก)
        └─► Footer (legal links)
```

**Why Client Component:**
- Needs `useSearchParams` to read `?redirect`
- Needs `useRouter` for navigation
- Must have `"use client"` directive

### 4.2 Component Pseudocode

```typescript
// src/app/jobsmarket/auth/session-expired/page.tsx

import { Metadata } from "next";
import SessionExpiredClient from "./_components/SessionExpiredClient";

export const metadata: Metadata = {
  title: "เซสชันหมดอายุ - ChanceDee",
  description: "Your session has expired",
};

export default function SessionExpiredPage() {
  return <SessionExpiredClient />;
}

// ./_components/SessionExpiredClient.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SessionExpiredClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const handleLogin = () => {
    const loginUrl = redirectUrl
      ? `/jobsmarket/auth/login?redirect=${encodeURIComponent(redirectUrl)}`
      : "/jobsmarket/auth/login";
    router.push(loginUrl);
  };

  const handleHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/" className="text-2xl font-bold text-primary">
          ChanceDee
        </Link>
      </div>

      {/* Card */}
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mb-4 text-5xl">⏱️</div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          เซสชันหมดอายุ
        </h1>
        <p className="text-sm text-gray-500 mb-6">Session Expired</p>

        {/* Message */}
        <p className="text-gray-700 mb-2">เซสชันของคุณหมดอายุแล้ว</p>
        <p className="text-gray-600 text-sm mb-8">
          กรุณาเข้าสู่ระบบอีกครั้งเพื่อดำเนินการต่อ
        </p>

        {/* Primary Button */}
        <Button
          onClick={handleLogin}
          className="w-full mb-4"
          size="lg"
        >
          เข้าสู่ระบบอีกครั้ง
        </Button>

        {/* Secondary Link */}
        <button
          onClick={handleHome}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          กลับหน้าแรก
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-sm text-gray-500">
        <Link href="/jobsmarket/legal/terms" className="hover:text-gray-700">
          ข้อกำหนดการใช้งาน
        </Link>
        {" | "}
        <Link href="/jobsmarket/privacy" className="hover:text-gray-700">
          นโยบายความเป็นส่วนตัว
        </Link>
      </div>
    </div>
  );
}
```

---

## 5. Server Actions Required

**None** - This page only displays information and navigates. No mutations.

---

## 6. State Management

### 6.1 Atoms

**None** - User is already logged out when reaching this page.

### 6.2 Hooks

| Hook | Source | Purpose | New/Reuse |
|------|--------|---------|-----------|
| `useSearchParams` | Next.js | Read `?redirect` parameter | Reuse |
| `useRouter` | Next.js | Navigate to login or home | Reuse |

---

## 7. Test Coverage Plan

### 7.1 Unit Tests

**None** - No business logic to test in isolation.

### 7.2 Integration Tests

**None** - No component interactions complex enough to require integration testing.

### 7.3 E2E Tests

| # | Test Case | Covers | Expected Behavior |
|---|-----------|--------|-------------------|
| 1 | Direct navigation | Route accessibility | Page loads without error (HTTP 200) |
| 2 | Page title | Metadata | Title is "เซสชันหมดอายุ - ChanceDee" |
| 3 | UI elements | Rendering | Title, message, button, link all visible |
| 4 | Re-login button (no redirect) | Navigation | Navigates to `/jobsmarket/auth/login` |
| 5 | Re-login button (with redirect) | Query param pass-through | Navigates to `/jobsmarket/auth/login?redirect=%2Fcandidates%2F123` |
| 6 | Return home link | Navigation | Navigates to `/` |
| 7 | Logo click | Navigation | Navigates to `/` |

**Test File:** `tests/e2e/jobsmarket/auth/session-expired.spec.ts`

**Estimated Test Count:** 7 E2E tests

---

## 8. State Machine Verification

From RIS §6.2, there is only one state:

| State | Event | Expected Behavior | Test Assertion |
|-------|-------|-------------------|----------------|
| `DISPLAY` | `LOGIN_CLICK` | Navigate to `/auth/login` with optional `?redirect` | Verify URL after click |
| `DISPLAY` | `HOME_CLICK` | Navigate to `/` | Verify URL after click |
| `DISPLAY` | `LOGO_CLICK` | Navigate to `/` | Verify URL after click |

All states tested in E2E suite.

---

## 9. Thai Copy Checklist

| Element | Thai Text | English | Source |
|---------|-----------|---------|--------|
| Page Title | เซสชันหมดอายุ - ChanceDee | Session Expired - ChanceDee | RIS §11.1, AUTH-R00 Appendix B |
| Heading | เซสชันหมดอายุ | Session Expired | RIS §7.1, AUTH-R00 Appendix B.1 |
| Message Line 1 | เซสชันของคุณหมดอายุแล้ว | Your session has expired | RIS §7.1 |
| Message Line 2 | กรุณาเข้าสู่ระบบอีกครั้งเพื่อดำเนินการต่อ | Please log in again to continue | RIS §7.1 |
| Primary Button | เข้าสู่ระบบอีกครั้ง | Log In Again | AUTH-R00 §2.4 |
| Secondary Link | กลับหน้าแรก | Return Home | RIS §7.1 |
| Terms Link | ข้อกำหนดการใช้งาน | Terms of Use | Standard footer |
| Privacy Link | นโยบายความเป็นส่วนตัว | Privacy Policy | Standard footer |

---

## 10. Dependencies

### 10.1 Required Before Implementation

**None** - This page is standalone and doesn't depend on other routes being completed first.

### 10.2 Blocks

**None** - No routes depend on this page being implemented first.

### 10.3 Related Routes

| Route | Relationship |
|-------|--------------|
| AUTH-R01 (Login) | Destination of "เข้าสู่ระบบอีกครั้ง" button |
| AUTH-R00 §3 | Session management patterns (cross-cutting) |

---

## 11. Open Questions

**None** - RIS is clear and complete. All implementation details are specified.

---

## 12. Estimated Complexity

| Aspect | Estimate | Notes |
|--------|----------|-------|
| **Source Files** | 1 file | Single page component |
| **Lines of Code** | ~80 lines | Simple display + navigation |
| **Components** | 0 new | Reuse Button from shadcn/ui |
| **Server Actions** | 0 new | No mutations, navigation only |
| **Test Files** | 1 file | E2E only |
| **Test Cases** | 7 E2E | Navigation flows, redirect param |
| **Effort** | **Low (2-3 hours)** | Simplest route in auth domain |

### 12.1 Effort Breakdown

| Task | Time |
|------|------|
| Create page component | 30 min |
| Write E2E tests | 45 min |
| Run quality gates (build, lint, dev) | 15 min |
| Manual testing | 15 min |
| Documentation | 15 min |
| **Total** | **~2 hours** |

---

## 13. Implementation Order

### Step 1: Create Page Component
1. Create `src/app/jobsmarket/auth/session-expired/page.tsx`
2. Add metadata (title, description)
3. Create `SessionExpiredClient.tsx` component
4. Implement UI layout per RIS §7.1
5. Add redirect parameter handling per RIS §8.1
6. Add navigation handlers

### Step 2: Write Tests
1. Create E2E test file
2. Test direct navigation (route exists)
3. Test page title
4. Test UI rendering
5. Test re-login navigation (with and without redirect)
6. Test home navigation (link and logo)

### Step 3: Quality Gates
1. Run `npm run build` → must pass
2. Run `npm run lint` → must have no errors
3. Run `npm run dev` → visit `/jobsmarket/auth/session-expired`
4. Run E2E tests → all pass

### Step 4: Manual Verification
1. Visit page directly
2. Test navigation buttons
3. Test with `?redirect=/candidates/123` parameter
4. Verify mobile responsive layout

---

## 14. Edge Cases & Defensive Programming

### 14.1 Edge Cases

| Case | Handling |
|------|----------|
| No redirect parameter | Navigate to `/auth/login` (default) |
| Invalid redirect parameter | Pass through to login, validate there (AUTH-R00 §12.2) |
| User refreshes page | Works fine - static page |
| User navigates back | Works fine - no state to lose |

### 14.2 Security Considerations

**Redirect Validation:**
- ✅ Pass-through only - don't validate here
- ✅ LOGIN page validates redirect per AUTH-R00 §12.2
- ✅ Prevents open redirect vulnerabilities

**No Session Operations:**
- ✅ No cookies to clear (already done by redirect source)
- ✅ No auth state to check (session already expired)
- ✅ No sensitive data displayed

---

## 15. Quality Gates Checklist

### Pre-Implementation
- [x] RIS document read and understood
- [x] AUTH-R00 cross-cutting patterns reviewed
- [x] No conflicting routes exist
- [x] Plan approved by human

### Implementation
- [ ] Page component created
- [ ] Metadata configured
- [ ] Redirect parameter handling implemented
- [ ] Navigation handlers implemented
- [ ] Thai copy matches RIS exactly

### Testing
- [ ] E2E test file created (7 tests)
- [ ] All navigation flows tested
- [ ] Redirect parameter tested
- [ ] Mobile responsive verified

### Quality Gates
- [ ] Gate 1: `npm run build` → exits with code 0
- [ ] Gate 2: `npm run lint` → no errors
- [ ] Gate 3: `npm run dev` → page loads without errors
- [ ] Gate 4: E2E tests → 7 passed

---

## 16. Success Criteria

Implementation is complete when:

1. ✅ Page renders at `/jobsmarket/auth/session-expired`
2. ✅ All UI elements match RIS §7.1 layout
3. ✅ Thai copy matches AUTH-R00 Appendix B exactly
4. ✅ Re-login button navigates correctly (with/without redirect)
5. ✅ Home link and logo navigate to `/`
6. ✅ All 7 E2E tests pass
7. ✅ All 4 quality gates pass
8. ✅ Mobile responsive layout verified
9. ✅ No console errors or warnings

---

## Appendix A: Related RIS Sections

| RIS Section | Topic | Key Points |
|-------------|-------|------------|
| AUTH-R08 §1 | Route Metadata | Minimal shell, no auth required |
| AUTH-R08 §3 | Feature Mapping | AUTH-011 Session Expiration Handling |
| AUTH-R08 §6 | UI State Machine | Single DISPLAY state, 3 navigation events |
| AUTH-R08 §7 | Component Wiring | Logo, button, link → navigation |
| AUTH-R08 §8 | Query Parameters | `?redirect` pass-through |
| AUTH-R08 §9 | Modal vs Route | This is the "final destination" route |
| AUTH-R08 §11 | Implementation Checklist | Optional countdown deferred |
| AUTH-R00 §2.4 | Error Recovery Actions | "เข้าสู่ระบบอีกครั้ง" button label |
| AUTH-R00 §3 | Session Management | Session cookie spec, expiry detection |
| AUTH-R00 §12 | Query Params | Redirect validation (done on login) |
| AUTH-R00 Appendix B | Thai Copy | Page titles, button labels |

---

## Appendix B: Test Scenarios

### E2E Test Scenarios (Playwright)

```typescript
test.describe("AUTH-R08: Session Expired Page", () => {
  test("should render page when accessed directly", async ({ page }) => {
    await page.goto("/jobsmarket/auth/session-expired");

    // Check title
    expect(await page.title()).toContain("เซสชันหมดอายุ");

    // Check UI elements
    await expect(page.getByText("เซสชันหมดอายุ")).toBeVisible();
    await expect(page.getByText("เซสชันของคุณหมดอายุแล้ว")).toBeVisible();
    await expect(page.getByRole("button", { name: "เข้าสู่ระบบอีกครั้ง" })).toBeVisible();
    await expect(page.getByText("กลับหน้าแรก")).toBeVisible();
  });

  test("should navigate to login without redirect param", async ({ page }) => {
    await page.goto("/jobsmarket/auth/session-expired");

    await page.getByRole("button", { name: "เข้าสู่ระบบอีกครั้ง" }).click();

    expect(page.url()).toContain("/jobsmarket/auth/login");
    expect(page.url()).not.toContain("redirect=");
  });

  test("should pass redirect param to login", async ({ page }) => {
    await page.goto("/jobsmarket/auth/session-expired?redirect=%2Fcandidates%2F123");

    await page.getByRole("button", { name: "เข้าสู่ระบบอีกครั้ง" }).click();

    expect(page.url()).toContain("/jobsmarket/auth/login?redirect=");
    expect(decodeURIComponent(page.url())).toContain("/candidates/123");
  });

  test("should navigate to home via link", async ({ page }) => {
    await page.goto("/jobsmarket/auth/session-expired");

    await page.getByText("กลับหน้าแรก").click();
    await page.waitForURL("/");

    expect(page.url()).toBe("/");
  });

  test("should navigate to home via logo", async ({ page }) => {
    await page.goto("/jobsmarket/auth/session-expired");

    await page.getByRole("link", { name: "ChanceDee" }).click();
    await page.waitForURL("/");

    expect(page.url()).toBe("/");
  });
});
```

---

*End of AUTH-R08 Implementation Plan*
