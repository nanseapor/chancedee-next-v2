# ChanceDee Project Instructions

**Version:** 3.2  
**Last Updated:** 2025-12-20  
**Project:** ChanceDee Platform - Jobs Subdomain (Next.js 16 + React 19)  
**Phase:** Implementation

---

## 1. Project Context

### 1.1 Situation

ChanceDee is a Thai recruitment platform with **multiple subdomains**:
- `chancedee.com` → Content website (implemented)
- `jobs.chancedee.com` → Job market platform (implementing now)

A **CVSS 10.0 CVE in React 19** forced an emergency upgrade to Next.js 16. The upgrade has breaking changes that require rewriting the jobs subdomain features, while preserving the working content subdomain.

### 1.2 What's Already Done

| Phase | Status | Output |
|-------|--------|--------|
| Feature Extraction | ✅ Complete | `features_*.md` files |
| Route Specifications | ✅ Complete | 45 RIS documents |
| Business Logic Specs | ✅ Complete | 13 BLS documents |
| Design System Specs | ✅ Complete | 25+ design system docs |
| Gap Analysis | ✅ Complete | `feature-gaps/` folder |
| Database Layer Migration | ✅ Complete | `src/lib/*` tested and working |
| **Implementation** | ⏳ **Current Phase** | This is what we're doing now |

### 1.3 Implementation Goal

Implement all routes in `src/app/jobsmarket/` according to RIS and BLS specifications using TDD approach with mandatory quality gates.

---

## 2. Codebase Architecture

### 2.1 Multi-Subdomain Structure

```
src/app/
├── api/                    # 🔒 PROTECTED - Shared API routes
├── content/(body)/         # 🔒 PROTECTED - Content subdomain
└── jobsmarket/             # 🎯 OUR WORKSPACE
    ├── legal/              # 🔒 PROTECTED - Already implemented
    ├── privacy/            # 🔒 PROTECTED - Already implemented
    ├── auth/               # ✅ TO IMPLEMENT
    ├── candidates/         # ✅ TO IMPLEMENT
    ├── companies/          # ✅ TO IMPLEMENT
    ├── jobs/               # ✅ TO IMPLEMENT
    ├── chat/               # ✅ TO IMPLEMENT
    ├── notifications/      # ✅ TO IMPLEMENT
    └── platform/           # ✅ TO IMPLEMENT (admin)
```

### 2.1.1 URL to Filesystem Mapping

The `jobs.chancedee.com` subdomain maps to `src/app/jobsmarket/`:

| User-Facing URL | Filesystem Path |
|-----------------|-----------------|
| `jobs.chancedee.com/auth/login` | `src/app/jobsmarket/auth/login/page.tsx` |
| `jobs.chancedee.com/auth/register` | `src/app/jobsmarket/auth/register/page.tsx` |
| `jobs.chancedee.com/jobs` | `src/app/jobsmarket/jobs/page.tsx` |
| `jobs.chancedee.com/jobs/[id]` | `src/app/jobsmarket/jobs/[id]/page.tsx` |
| `jobs.chancedee.com/candidates/[id]/dashboard` | `src/app/jobsmarket/candidates/[id]/dashboard/page.tsx` |
| `jobs.chancedee.com/companies/[id]/dashboard` | `src/app/jobsmarket/companies/[id]/dashboard/page.tsx` |
| `jobs.chancedee.com/chat` | `src/app/jobsmarket/chat/page.tsx` |
| `jobs.chancedee.com/chat/[roomId]` | `src/app/jobsmarket/chat/[roomId]/page.tsx` |

**Important:** Routes in Section 6 show subdomain-relative paths (e.g., `/auth/login`). When creating files, always prepend `src/app/jobsmarket/`.

### 2.2 Protected Paths (DO NOT Modify)

| Path | Reason |
|------|--------|
| `src/app/` (root layout) | Shared across subdomains |
| `src/app/api/*` | Serves multiple subdomains |
| `src/app/content/*` | Content subdomain in production |
| `src/app/jobsmarket/legal/` | Already implemented, in production |
| `src/app/jobsmarket/privacy/` | Already implemented, in production |
| `src/components/ui/*` | shadcn/ui base components |
| `src/lib/*` | Database layer (tested, working) |

### 2.3 Shared Resources (CAN Reuse, DO NOT Modify)

| Path | Contents | Usage |
|------|----------|-------|
| `src/components/*` (non-ui) | Shared components | Import if fits, don't modify |
| `src/domains/*/services/*` | Existing services | Import if fits, don't modify |
| `src/hooks/*` | Existing hooks | Import if fits, don't modify |
| `src/store/*` | Existing atoms | Import if fits, don't modify |

### 2.4 Where to Create New Files

| Type | Location | Convention |
|------|----------|------------|
| Routes/Pages | `src/app/jobsmarket/{domain}/` | Per RIS route paths |
| Page Components | `src/app/jobsmarket/{domain}/_components/` | Co-located with route |
| Shared Components | `src/components/jobsmarket/{feature}/` | Namespaced to avoid conflicts |
| Domain Services | `src/domains/{domain}/services/server/actions/jobsmarket/` | See Section 2.4.1 |
| Hooks | `src/hooks/jobsmarket/` or co-located with route | Namespaced |
| Atoms | `src/store/jobsmarket/` | Namespaced |
| Tests | `tests/{unit|integration|e2e}/jobsmarket/` | Mirror source structure |

#### 2.4.1 Domain Services Convention

Existing services in `src/domains/{domain}/services/server/actions/` serve both content and jobsmarket subdomains. To avoid breaking existing code:

**Option A (Preferred): Add to existing files if action doesn't exist**
```
src/domains/authentication/services/server/actions/
├── auth-session.ts          # Existing - add new functions here if compatible
├── user-management.ts       # Existing - add new functions here if compatible
└── jobsmarket/              # NEW namespace for jobsmarket-specific actions
    └── auth-actions.ts      # Only if incompatible with existing
```

**Option B: Create namespaced subfolder for jobsmarket-specific actions**
```
src/domains/{domain}/services/server/actions/jobsmarket/
```

**Decision Rule:**
1. First, check if the action already exists in `src/lib/database/actions/` → Use it
2. Then, check if existing domain service can be extended → Extend it
3. Only if incompatible → Create in `jobsmarket/` subfolder

---

## 3. Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 16 | App Router |
| UI | React 19 | Server Components default |
| Styling | Tailwind CSS 4 | With shadcn/ui |
| Components | shadcn/ui | Extended with custom components |
| State (Client) | Jotai | Atoms in `src/store/` |
| Data Fetching | SWR | For client-side data |
| Database | Firebase/Firestore | Via `src/lib/database/` |
| Search | MeiliSearch | Job search index |
| Unit Tests | Vitest | Fast, ESM-native |
| E2E Tests | Playwright | Browser automation |
| Language | TypeScript | Strict mode |

---

## 4. Documentation Reference

### 4.1 Document Locations

**Important:** Documentation exists in two places with different structures:

| Location | Structure | Used By |
|----------|-----------|---------|
| **Project Knowledge** (Claude Chat) | Flat files at root (e.g., `AUTH-R01_login_RIS.md`) | This conversation |
| **Local Repository** | Nested folders (e.g., `docs/jobsmarket/RIS/AUTH-R01_login_RIS.md`) | Claude Code |

When referencing documents:
- In Claude Chat: Use filename directly (e.g., "see AUTH-R01_login_RIS.md")
- In Claude Code: Use full path (e.g., `docs/jobsmarket/RIS/AUTH-R01_login_RIS.md`)

See `docs/jobsmarket/DOCUMENTATION-GUIDE.md` for detailed usage.

### 4.2 Quick Reference

| Task | Read First | Then Read |
|------|------------|-----------|
| Implement a route | `{DOMAIN}-R{NN}_*_RIS.md` | `BLS-{NN}_*.md` for actions |
| Server action | `BLS-{NN}_*.md` | RIS for data contract |
| UI component | `design-systems/` | RIS for composition |
| Form validation | BLS Input Validation tables | - |
| Error handling | BLS Security Matrix | RIS error UX |

### 4.3 Document Hierarchy

```
Design Systems (appearance) 
       ↓
      RIS (route implementation) 
       ↓
      BLS (business logic)
       ↓
   src/lib/* (database layer - already done)
```

### 4.4 Document Precedence Rules

| Priority | Document Type | Usage |
|----------|---------------|-------|
| 1 | RIS documents | Source of truth for NEW implementation |
| 2 | BLS documents | Business logic specifications |
| 3 | Design Systems | UI component specs |
| 4 | features_*.md | WHAT to implement (reference) |
| 5 | state-inventory/ | OLD implementation (DO NOT USE for new code) |

---

## 5. Implementation Workflow

### 5.1 Role Separation

| Role | Actor | Responsibility |
|------|-------|----------------|
| **Developer** | Claude Code | Creates plans, writes code, runs tests, creates PRs |
| **PM / SA** | Claude Chat | Reviews plans, discusses architecture, validates approach |
| **Approver** | Human | Final approval on plans and PRs |

### 5.2 Per-Route Workflow

```
1. PLAN      → Claude Code reads RIS + BLS, creates implementation plan
2. DISCUSS   → Human brings plan to Claude Chat for SA review
3. APPROVE   → Human approves plan (or requests changes)
4. IMPLEMENT → Claude Code writes tests first (TDD), then implementation
5. VERIFY    → Claude Code runs ALL quality gates (Section 7)
6. PR        → Claude Code creates PR with conventional commit
7. REVIEW    → Human + Claude Chat review PR
8. MERGE     → Human merges after approval
```

### 5.3 Plan Template

When starting a new route, Claude Code must create a plan in this format:

```markdown
## Route Implementation Plan: {DOMAIN}-R{NN}

### Route: `{path}`
### RIS: `{filename}`
### Related BLS: `{filename}` Section {N}

---

### 1. Files to Create

| File | Purpose |
|------|---------|
| `src/app/jobsmarket/{path}/page.tsx` | Route page |
| `src/app/jobsmarket/{path}/_components/*.tsx` | Page components |
| ... | ... |

### 2. Server Actions Required

| Action | Source | Signature | New/Reuse |
|--------|--------|-----------|-----------|
| `{actionName}` | BLS-{NN} §{N} | `(input) => Promise<R>` | New / Reuse from {path} |

### 3. State Management

| Atom/Hook | Purpose | New/Reuse |
|-----------|---------|-----------|
| `{name}` | {purpose} | New / Reuse from {path} |

### 4. Test Coverage Plan

| Type | Test File | Test Cases | Count |
|------|-----------|------------|-------|
| Unit | `{component}.test.tsx` | {description} | {N} |
| Integration | `{feature}.test.ts` | {description} | {N} |
| E2E | `{route}.spec.ts` | {description} | {N} |

### 5. State Machine Verification

| State (from RIS §6) | Test Assertion |
|---------------------|----------------|
| {state_name} | {what to verify} |

### 6. Thai Copy Checklist

| Element | Thai Text | Source |
|---------|-----------|--------|
| {element} | {text} | RIS §{N} |

### 7. Dependencies

- **Requires:** {routes that must be done first}
- **Blocks:** {routes that depend on this}

### 8. Open Questions

1. {Any clarifications needed before implementation}

### 9. Estimated Complexity

| Aspect | Estimate |
|--------|----------|
| Components | {N} new, {M} reuse |
| Server Actions | {N} new, {M} reuse |
| Test Cases | {N} unit, {M} integration, {K} e2e |
| Effort | {Low/Medium/High} |

### 10. Quality Gate Checklist

- [ ] Gate 1: Build passes
- [ ] Gate 2: Lint passes
- [ ] Gate 3: Dev server + browser test passes
- [ ] Gate 4a: Unit tests 90%+ coverage
- [ ] Gate 4b: Integration tests pass
- [ ] Gate 4c: E2E tests cover all RIS flows
```

---

## 6. Implementation Order

Follow the Wave-based order from RIS documents:

### Wave 0: Authentication (Foundation)

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 1 | AUTH-R01 | `/auth/login` | `src/app/jobsmarket/auth/login/` | P0 |
| 2 | AUTH-R02 | `/auth/register` | `src/app/jobsmarket/auth/register/` | P0 |
| 3 | AUTH-R03 | `/auth/verify` | `src/app/jobsmarket/auth/verify/` | P0 |
| 4 | AUTH-R04 | `/auth/reset` | `src/app/jobsmarket/auth/reset/` | P0 |
| 5 | AUTH-R05 | `/auth/status` | `src/app/jobsmarket/auth/status/` | P0 |
| 6 | AUTH-R06 | `/auth/settings` | `src/app/jobsmarket/auth/settings/` | P1 |
| 7 | AUTH-R07 | `/auth/select-role` | `src/app/jobsmarket/auth/select-role/` | P1 |
| 8 | AUTH-R08 | `/auth/session-expired` | `src/app/jobsmarket/auth/session-expired/` | P1 |

### Wave 1: Identity

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 9 | CAND-R01 | `/candidates/[id]/dashboard` | `src/app/jobsmarket/candidates/[id]/dashboard/` | P0 |
| 10 | CAND-R02 | `/candidates/[id]/profile` | `src/app/jobsmarket/candidates/[id]/profile/` | P0 |
| 11 | CAND-R03 | `/candidates/[id]/settings` | `src/app/jobsmarket/candidates/[id]/settings/` | P1 |
| 12 | COMP-R01 | `/companies/[id]/pending` | `src/app/jobsmarket/companies/[id]/pending/` | P0 |
| 13 | COMP-R02 | `/companies/[id]/team` | `src/app/jobsmarket/companies/[id]/team/` | P1 |
| 14 | COMP-R03 | `/companies/[id]/settings` | `src/app/jobsmarket/companies/[id]/settings/` | P1 |

### Wave 2: Discovery

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 15 | JOB-R01 | `/jobs` | `src/app/jobsmarket/jobs/` | P0 |
| 16 | JOB-R02 | `/jobs/[id]` | `src/app/jobsmarket/jobs/[id]/` | P0 |
| 17 | JOB-R02b | `/jobs/[id]` (apply modal) | (same as above, modal component) | P0 |

### Wave 3: Job Management

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 18 | COMP-R04 | `/companies/[id]/dashboard` | `src/app/jobsmarket/companies/[id]/dashboard/` | P0 |
| 19 | COMP-R05 | `/companies/[id]/jobs` | `src/app/jobsmarket/companies/[id]/jobs/` | P0 |
| 20 | COMP-R06 | `/companies/[id]/jobs/new` | `src/app/jobsmarket/companies/[id]/jobs/new/` | P0 |
| 21 | COMP-R07 | `/companies/[id]/jobs/[jobId]` | `src/app/jobsmarket/companies/[id]/jobs/[jobId]/` | P0 |

### Wave 4: Applications

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 22 | CAND-R04 | `/candidates/[id]/applications` | `src/app/jobsmarket/candidates/[id]/applications/` | P0 |
| 23 | COMP-R08 | `/companies/[id]/applications` | `src/app/jobsmarket/companies/[id]/applications/` | P0 |

### Wave 5: Communication

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 24 | CHAT-R01 | `/chat` | `src/app/jobsmarket/chat/` | P0 |
| 25 | CHAT-R02 | `/chat/[roomId]` | `src/app/jobsmarket/chat/[roomId]/` | P0 |

### Wave 6: Notifications

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 26 | NOTIF-R01 | `/notifications` | `src/app/jobsmarket/notifications/` | P1 |

### Wave 7: Wallet

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 27 | WALLET-R01 | `/candidates/[id]/wallet` | `src/app/jobsmarket/candidates/[id]/wallet/` | P1 |

### Wave 8: Admin

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 28-37 | ADM-R01 to ADM-R10 | `/platform/*` | `src/app/jobsmarket/platform/` | P1 |

### 6.1 Critical Gaps (P0)

The gap analysis identified features missing from the old system migration. These should be prioritized within their respective waves:

| Priority | Feature ID | Feature | Wave | Insert After | Effort |
|----------|------------|---------|------|--------------|--------|
| **P0** | JOB-029 | Job Close & Archive | Wave 3 | COMP-R07 | Medium (2-3 days) |
| **P0** | WALLET-014 | Star Transaction History | Wave 7 | WALLET-R01 | Low (1 day) |
| **P1** | ADMIN-033 | Export User Data | Wave 8 | ADM routes | Medium (3-4 days) |
| **P1** | CONSENT-007 | Re-consent on Policy Update | Cross-cutting | Any auth route | Medium (2-3 days) |
| **P1** | JOB-028 | Job Recommendations UI | Wave 2 | JOB-R02 | Medium (3 days) |
| **P2** | CHAT-013 | Message Retry on Failure | Wave 5 | CHAT-R02 | Low (1-2 days) |
| **P2** | CHAT-014 | Chat Room Archive | Wave 5 | CHAT-R02 | Low (1 day) |

**P0 gaps must be completed before launch.** See `feature-gaps/04-gap-analysis-details.md` for implementation details.

---

## 7. Quality Gates (MANDATORY)

### ⛔ READ THIS FIRST - NON-NEGOTIABLE

These gates are **BLOCKING**. You may NOT proceed past any gate until it passes.
You may NOT report "implementation complete" until ALL gates pass.
**Violations will require re-work.**

---

### Gate 1: BUILD MUST PASS ⛔ STOP

```bash
npm run build
```

| Result | Action |
|--------|--------|
| ✅ Build succeeds | Proceed to Gate 2 |
| ❌ Build fails | **STOP. FIX IT. DO NOT PROCEED.** |

**Common build errors YOU must catch:**

| Error | Cause | Fix |
|-------|-------|-----|
| `"use server"` with sync function | Missing `async` keyword | Add `async` to ALL exports |
| Type errors | TypeScript violations | Fix types |
| Missing imports | Incomplete imports | Add missing imports |
| Server/Client component misuse | Hooks in server component | Add `"use client"` directive |

**Example - WRONG vs RIGHT:**
```typescript
// ❌ WRONG - will fail build
"use server"
export function myAction() { ... }  // Missing async!

// ✅ CORRECT
"use server"
export async function myAction() { ... }
```

---

### Gate 2: LINT MUST PASS ⛔ STOP

```bash
npm run lint
```

| Result | Action |
|--------|--------|
| ✅ No errors | Proceed to Gate 3 |
| ⚠️ Warnings only | Proceed (document warnings) |
| ❌ Errors | **STOP. FIX IT. DO NOT PROCEED.** |

---

### Gate 3: DEV SERVER MUST START ⛔ STOP

```bash
npm run dev
```

Then visit the route you implemented in browser (use Playwright MCP if available).

| Result | Action |
|--------|--------|
| ✅ Route loads without error | Proceed to Gate 4 |
| ❌ Server crash | **STOP. FIX IT. DO NOT PROCEED.** |
| ❌ Route shows error page | **STOP. FIX IT. DO NOT PROCEED.** |
| ❌ Console errors (red) | **STOP. FIX IT. DO NOT PROCEED.** |

---

### Gate 4: TESTS MUST BE WRITTEN AND PASS ⛔ STOP

> **⚠️ CRITICAL: NO DEFERRING TESTS**
> 
> You may NOT say "tests can be added later" or "I'll write tests in a follow-up."
> Tests are part of the implementation, not a separate task.
> **Implementation without tests = incomplete implementation.**

---

#### Gate 4a: UNIT TESTS - 90%+ Coverage Required ⛔ STOP

**What needs unit tests:**
- All new functions and hooks you write
- All server actions
- All utility functions
- All business logic

**Coverage requirement:** 90%+ of YOUR new code (not imported libraries)

```bash
# Run unit tests with coverage
npm run test:unit -- --coverage

# Or with specific config
npx vitest run --coverage
```

| Result | Action |
|--------|--------|
| ✅ All tests pass AND coverage ≥ 90% | Proceed to Gate 4b |
| ❌ Tests fail | **STOP. FIX IT. DO NOT PROCEED.** |
| ❌ Coverage < 90% | **STOP. ADD MORE TESTS. DO NOT PROCEED.** |

**Coverage checklist - ensure you test:**
- [ ] Happy path (normal inputs)
- [ ] All logic branches (if/else, switch cases)
- [ ] Edge cases (empty arrays, null values, boundary conditions)
- [ ] Error conditions (invalid inputs, thrown exceptions)
- [ ] All exported functions

**Unit test location:** `tests/unit/jobsmarket/{domain}/{feature}/`

**Example unit test structure:**
```typescript
// tests/unit/jobsmarket/candidates/profile/use-profile-wizard.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProfileWizard } from "@/hooks/jobsmarket/use-profile-wizard";

describe("useProfileWizard", () => {
  describe("Initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useProfileWizard());
      expect(result.current.currentStep).toBe(1);
    });
  });

  describe("Navigation", () => {
    it("should move to next step", () => { /* ... */ });
    it("should not go beyond last step", () => { /* ... */ });
    it("should handle invalid step number", () => { /* ... */ });
  });

  describe("Error Handling", () => {
    it("should handle null input gracefully", () => { /* ... */ });
  });
});
```

---

#### Gate 4b: INTEGRATION TESTS Required ⛔ STOP

**What needs integration tests:**
- Server actions that interact with database
- Services that combine multiple operations
- API route handlers

**Environment:** Uses real dev database (NOT Firebase emulator)

```bash
# Run integration tests
npx vitest run --config vitest.integration.config.ts

# With coverage
npx vitest run --config vitest.integration.config.ts --coverage
```

| Result | Action |
|--------|--------|
| ✅ All integration tests pass | Proceed to Gate 4c |
| ❌ Tests fail | **STOP. FIX IT. DO NOT PROCEED.** |
| ⚠️ No DB actions implemented | Skip to Gate 4c (document reason) |

**Integration test location:** `tests/integration/jobsmarket/{domain}/`

**Example integration test structure:**
```typescript
// tests/integration/jobsmarket/candidates/profile/profile-actions.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { webCandidateSaveAboutMe } from "@/lib/database/actions/candidate-information";

describe("Profile Actions Integration", () => {
  const testUserId = "test-integration-user";

  beforeEach(async () => {
    // Setup test data in real dev database
  });

  afterEach(async () => {
    // Clean up test data
  });

  it("should save about me to database", async () => {
    const result = await webCandidateSaveAboutMe(testUserId, "Test about me");
    expect(result.success).toBe(true);
  });
});
```

---

#### Gate 4c: E2E TESTS Required ⛔ STOP

**What needs E2E tests:**
- Every route/page you implement
- All user flows defined in the RIS specification
- Invalid input handling (form validation, error states)
- Edge cases that can be tested via UI

**E2E test requirements per RIS:**
1. **All user flows** - Every flow described in the RIS must have a corresponding E2E test
2. **Invalid inputs** - Test form validation, error messages, boundary conditions
3. **Error states** - Test network errors, permission denied, not found states
4. **Cross-browser** - Must pass on Chromium (other browsers optional)

```bash
# Run E2E tests for specific route
npx playwright test tests/e2e/jobsmarket/auth/login.spec.ts --project=chromium

# Run all E2E tests for a domain
npx playwright test tests/e2e/jobsmarket/candidates/ --project=chromium

# Run with UI for debugging
npx playwright test --ui
```

| Result | Action |
|--------|--------|
| ✅ All E2E tests pass | ✅ IMPLEMENTATION COMPLETE |
| ❌ Tests fail | **STOP. FIX IT. DO NOT PROCEED.** |
| ❌ Missing RIS flow coverage | **STOP. ADD TESTS. DO NOT PROCEED.** |

**E2E test location:** `tests/e2e/jobsmarket/{domain}/`

**E2E Test Credential Handling:**

Test credentials are in `.env.playwright`. Check before writing auth tests:

```bash
cat .env.playwright | grep -E "^(TEST_|E2E_)"
```

**Example E2E test structure:**
```typescript
// tests/e2e/jobsmarket/auth/login.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Login Page - AUTH-R01", () => {
  const TEST_EMAIL = process.env.TEST_USER_EMAIL;
  const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

  test.skip(!TEST_EMAIL || !TEST_PASSWORD, "Test credentials not configured");

  test.describe("Happy Path - User Flows from RIS", () => {
    test("should login with valid credentials", async ({ page }) => {
      await page.goto("/jobsmarket/auth/login");
      await page.getByLabel("อีเมล").fill(TEST_EMAIL!);
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill(TEST_PASSWORD!);
      await page.getByRole("button", { name: /เข้าสู่ระบบ/ }).click();
      await expect(page).toHaveURL(/dashboard/);
    });
  });

  test.describe("Invalid Inputs - Validation", () => {
    test("should show error for invalid email format", async ({ page }) => {
      await page.goto("/jobsmarket/auth/login");
      await page.getByLabel("อีเมล").fill("invalid-email");
      await page.getByRole("button", { name: /เข้าสู่ระบบ/ }).click();
      await expect(page.getByText(/รูปแบบอีเมลไม่ถูกต้อง/)).toBeVisible();
    });

    test("should show error for empty password", async ({ page }) => {
      await page.goto("/jobsmarket/auth/login");
      await page.getByLabel("อีเมล").fill(TEST_EMAIL!);
      await page.getByRole("button", { name: /เข้าสู่ระบบ/ }).click();
      await expect(page.getByText(/กรุณากรอกรหัสผ่าน/)).toBeVisible();
    });
  });

  test.describe("Error States", () => {
    test("should show error for wrong credentials", async ({ page }) => {
      await page.goto("/jobsmarket/auth/login");
      await page.getByLabel("อีเมล").fill("wrong@example.com");
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill("wrongpassword");
      await page.getByRole("button", { name: /เข้าสู่ระบบ/ }).click();
      await expect(page.getByText(/อีเมลหรือรหัสผ่านไม่ถูกต้อง/)).toBeVisible();
    });
  });
});
```

---

### Quality Gate Summary

| Gate | Command | Requirement | Blocking |
|------|---------|-------------|----------|
| **1** | `npm run build` | 0 errors | ⛔ STOP |
| **2** | `npm run lint` | 0 errors | ⛔ STOP |
| **3** | `npm run dev` + browser | Route loads, no console errors | ⛔ STOP |
| **4a** | `npm run test:unit -- --coverage` | All pass, 90%+ coverage | ⛔ STOP |
| **4b** | Integration tests | All pass | ⛔ STOP |
| **4c** | `npx playwright test` | All RIS flows covered | ⛔ STOP |

---

## 8. TDD Workflow

### 8.1 TDD Phases with Quality Gates

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: ASSESSMENT                                          │
├─────────────────────────────────────────────────────────────┤
│ • Read RIS document                                          │
│ • Read BLS sections                                          │
│ • Create implementation plan                                 │
│ • Identify test cases                                        │
│ • Get SA approval                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: WRITE TESTS FIRST (RED)                             │
├─────────────────────────────────────────────────────────────┤
│ • Write unit tests → All should FAIL                         │
│ • Write integration tests → All should FAIL                  │
│ • Write E2E test outlines → All should FAIL                  │
│ • Verify: Gate 1 (Build) + Gate 2 (Lint) must pass           │
│ • Verify: All tests FAIL (components don't exist yet)        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: IMPLEMENTATION (GREEN)                              │
├─────────────────────────────────────────────────────────────┤
│ • Implement ONE component at a time                          │
│ • Run tests after each component                             │
│ • Watch tests turn GREEN                                     │
│ • Continue until all unit tests pass                         │
│ • Verify: Gate 1 + Gate 2 + Gate 4a must pass                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: VERIFY ALL GATES                                    │
├─────────────────────────────────────────────────────────────┤
│ • Gate 1: Build ✅                                           │
│ • Gate 2: Lint ✅                                            │
│ • Gate 3: Dev Server + Browser ✅                            │
│ • Gate 4a: Unit Tests 90%+ ✅                                │
│ • Gate 4b: Integration Tests ✅                              │
│ • Gate 4c: E2E Tests ✅                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ IMPLEMENTATION COMPLETE                                   │
├─────────────────────────────────────────────────────────────┤
│ • Create completion report                                   │
│ • Create PR                                                  │
│ • Request review                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 TDD Rules

1. **Write test first** - Based on BLS action spec and RIS state machine
2. **Run test** - Should fail (red)
3. **Implement minimum code** - To make test pass
4. **Run test** - Should pass (green)
5. **Refactor** - Clean up while tests stay green
6. **Repeat** - For next test case

### 8.3 Test-First Checklist

Before writing ANY implementation code:

- [ ] Unit tests written for all components
- [ ] Unit tests written for all hooks
- [ ] Unit tests written for all utility functions
- [ ] Integration tests written for server actions
- [ ] E2E tests outlined for all RIS user flows
- [ ] All tests verified to FAIL (RED phase)

Only AFTER all tests are written and failing:

- [ ] Begin implementation
- [ ] Run tests after each component
- [ ] Continue until all tests pass (GREEN phase)

---

## 9. Testing Infrastructure

### 9.1 Test Structure

```
tests/
├── unit/                           # Vitest - fast, isolated
│   └── jobsmarket/
│       ├── actions/                # Server action tests
│       │   ├── auth/
│       │   ├── jobs/
│       │   └── ...
│       └── components/             # Component unit tests
├── integration/                    # Vitest - with Firestore dev
│   └── jobsmarket/
│       └── workflows/              # Multi-step business flows
├── e2e/                            # Playwright - browser tests
│   └── jobsmarket/
│       ├── auth/                   # Auth user journeys
│       ├── candidate/              # Candidate journeys
│       ├── company/                # Company journeys
│       └── fixtures/               # Test data, page objects
└── __mocks__/                      # Shared mocks
```

### 9.2 Test Commands

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "vitest run --project unit",
    "test:unit:watch": "vitest --project unit",
    "test:unit:coverage": "vitest run --project unit --coverage",
    "test:integration": "vitest run --project integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Note:** If these scripts don't exist, Claude Code should ask before adding them.

### 9.3 Vitest Configuration

Create `vitest.workspace.ts` if needed:

```typescript
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'unit',
      include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
      environment: 'jsdom',
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'integration',
      include: ['tests/integration/**/*.test.ts'],
      environment: 'node',
      // Uses .env.local for Firestore dev connection
      setupFiles: ['./tests/setup/integration.ts'],
    },
  },
])
```

### 9.4 CI/CD Pipeline

```yaml
# Tests run on every PR before merge
PR → Unit Tests → Integration Tests → Deploy Preview → E2E Tests → Review → Merge
```

---

## 10. Code Standards

### 10.1 Error Handling

Use typed error objects with graceful fallbacks:

```typescript
// Error type definition
interface ActionError {
  code: string;        // Machine-readable code
  message: string;     // Thai user-facing message
  details?: unknown;   // Debug info (dev only)
}

// Action response type
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ActionError };

// Usage in server action
export async function someAction(input: Input): Promise<ActionResult<O>> {
  try {
    // ... logic
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: {
        code: 'SOME_ERROR',
        message: 'ข้อความภาษาไทย',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }
    };
  }
}
```

### 10.2 Commit Messages

Use conventional commits:

```
feat(auth): implement login page per AUTH-R01
fix(jobs): correct salary filter validation
test(auth): add login flow e2e tests
docs(readme): update setup instructions
refactor(components): extract JobCard to shared
```

### 10.3 PR Title Format

```
[{DOMAIN}-R{NN}] {Brief description}
```

Examples:
- `[AUTH-R01] Implement login page`
- `[JOB-R01] Add job search with filters`

---

## 11. Boundaries and Approvals

### 11.1 Claude Code Can Do Autonomously

- Create new files in `src/app/jobsmarket/` (except `/legal`, `/privacy`)
- Create new files in `tests/*/jobsmarket/`
- Create new namespaced components in `src/components/jobsmarket/`
- Extend existing domain services (add functions, don't modify existing)
- Run tests
- Create git commits
- Create PRs

### 11.2 Claude Code Must Ask First

| Action | Ask Who |
|--------|---------|
| Create/modify files in `src/lib/*` | Human |
| Create/modify files in `src/app/` (root) | Human |
| Create/modify files in `src/app/content/*` | Human |
| Modify existing functions in `src/domains/*/services/*` | Human |
| Add new npm dependencies | Human |
| Modify database schema | Human |
| Add/modify scripts in `package.json` | Human |
| Anything affecting protected paths | Human |

### 11.3 Requires Plan Discussion

Before implementing any route:
1. Claude Code creates plan (Section 5.3 template)
2. Human reviews with Claude Chat (PM/SA role)
3. Human approves or requests changes
4. Only then does Claude Code implement

---

## 12. Quick Start Checklist

For Claude Code starting a new route:

```markdown
□ Read the RIS document for this route
□ Read the *-R00 cross-cutting RIS for the domain
□ Read relevant BLS sections for server actions
□ Check design-systems/ for component specs
□ Check if similar actions exist in src/lib/database/actions/
□ Check if similar services exist in src/domains/*/services/
□ Create implementation plan (Section 5.3 template)
□ Wait for human approval of plan

TDD Phase (Tests First):
□ Write all unit tests (should fail)
□ Write all integration tests (should fail)
□ Write E2E test outlines (should fail)
□ Verify Gate 1 (Build) passes
□ Verify Gate 2 (Lint) passes

Implementation Phase:
□ Implement components one by one
□ Run tests after each component
□ Continue until all tests pass

Quality Gate Phase:
□ Gate 1: Build passes
□ Gate 2: Lint passes
□ Gate 3: Dev server + browser test passes
□ Gate 4a: Unit tests 90%+ coverage
□ Gate 4b: Integration tests pass
□ Gate 4c: E2E tests pass

Completion:
□ All gates pass
□ Create completion report
□ Create PR with conventional commit
□ Wait for review
```

---

## 13. Reference Documents

| Document | Local Path | Project Knowledge | Purpose |
|----------|------------|-------------------|---------|
| Documentation Guide | `docs/jobsmarket/DOCUMENTATION-GUIDE.md` | N/A | How to use RIS/BLS/Design docs |
| RIS Documents | `docs/jobsmarket/RIS/*.md` | `*_RIS.md` (flat) | Route specifications |
| BLS Documents | `docs/jobsmarket/BLS/*.md` | `BLS-*.md` (flat) | Business logic specs |
| Design Systems | `docs/jobsmarket/design-systems/` | `*.md` (various) | UI component specs |
| Gap Analysis | `docs/jobsmarket/feature-gaps/` | `feature-gaps_*.md` | What's missing |
| Data Entities | `docs/jobsmarket/data-entities/` | `data-entities_*.md` | Database schemas |
| State Inventory | `docs/jobsmarket/state-inventory/` | `state-inventory_*.md` | Atoms, hooks, SWR keys |

---

## 14. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 3.2 | 2025-12-20 | **MAJOR:** Added Section 7 (Quality Gates - MANDATORY) with 4 blocking gates. Added Section 8 (TDD Workflow) with explicit phases. Renumbered sections 8-11 to 9-12. Enhanced plan template with quality gate checklist. Added test-first checklist. Added coverage requirements (90%+). Added "NO DEFERRING TESTS" policy. |
| 3.1 | 2025-12-12 | Added URL-to-filesystem mapping (2.1.1), clarified doc locations (4.1), added critical gaps (6.1), clarified domain services convention (2.4.1), added test setup details |
| 3.0 | 2025-12-12 | Initial implementation phase instructions |

---

*Start with your current route. Follow TDD: Write tests first, verify they fail, then implement to make them pass. ALL quality gates must pass before marking implementation complete.*
