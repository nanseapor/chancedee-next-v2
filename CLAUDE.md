# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT:** Read `docs/jobsmarket/PROJECT_INSTRUCTIONS_v3_2.md` for full project context and workflow.

---

## ⛔ MANDATORY: Quality Gates (STOP Points)

### ❗ READ THIS FIRST - NON-NEGOTIABLE

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

Then visit the route you implemented in browser using playwright MCP.

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

# View coverage report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
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
| ✅ All E2E tests pass | Proceed to completion |
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

## 🔴 TDD Workflow (MANDATORY)

### TDD Phases

You MUST follow Test-Driven Development. Write tests BEFORE implementation.

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
│                                                              │
│ ⚠️ DO NOT write implementation code yet!                     │
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
│ • Fill completion checklist with evidence                    │
│ • Create PR                                                  │
│ • Request review                                             │
└─────────────────────────────────────────────────────────────┘
```

### TDD Rules

1. **Write test first** - Based on BLS action spec and RIS state machine
2. **Run test** - Should fail (RED)
3. **Implement minimum code** - To make test pass
4. **Run test** - Should pass (GREEN)
5. **Refactor** - Clean up while tests stay green
6. **Repeat** - For next test case

### Test-First Checklist

Before writing ANY implementation code:

- [ ] Unit tests written for all components
- [ ] Unit tests written for all hooks
- [ ] Unit tests written for all utility functions
- [ ] Integration tests written for server actions (if applicable)
- [ ] E2E tests outlined for all RIS user flows
- [ ] All tests verified to FAIL (RED phase)
- [ ] Gate 1 (Build) passes
- [ ] Gate 2 (Lint) passes

Only AFTER all tests are written and failing:

- [ ] Begin implementation
- [ ] Run tests after each component
- [ ] Continue until all tests pass (GREEN phase)

---

## 🚫 ANTI-PATTERNS: What You Must NEVER Do

### ❌ NEVER Defer Tests

| ❌ WRONG - Immediate rejection | ✅ CORRECT |
|-------------------------------|------------|
| "I'll add tests later" | Write tests NOW, BEFORE implementation |
| "Tests can be added in a follow-up PR" | Tests are in THIS PR |
| "The code works, tests are optional" | Tests are MANDATORY, not optional |
| "I've implemented the feature, just need tests" | Feature is NOT implemented without tests |
| "Due to time constraints, skipping tests" | There are no time constraints for tests |
| "Let me implement first, then add tests" | NO. Tests come FIRST (TDD) |

### ❌ NEVER Skip TDD Phases

| ❌ WRONG | ✅ CORRECT |
|----------|------------|
| Write code first, tests later | Write tests first (RED), then code (GREEN) |
| Skip the RED phase | All tests must FAIL before implementation |
| Implement multiple components before testing | Implement ONE component, run tests, repeat |

### ❌ NEVER Skip Test Types

| Implementation Type | Required Tests | You May NOT Skip |
|--------------------|----------------|------------------|
| Hook/Utility function | Unit tests (90%+ coverage) | ❌ Cannot skip |
| Server action | Unit tests + Integration tests | ❌ Cannot skip |
| Page/Route | Unit tests + E2E tests | ❌ Cannot skip |
| Full feature | Unit + Integration + E2E | ❌ Cannot skip |

### ❌ NEVER Declare Complete Without Evidence

You must provide **actual test output** showing:
- Unit test pass count and coverage percentage
- Integration test pass count (if applicable)
- E2E test pass count

---

## ✅ Definition of "Implementation Complete"

You may ONLY say implementation is complete when ALL of these are true:

```markdown
## Completion Checklist

### TDD Compliance
- [ ] Phase 2 completed: All tests written FIRST and verified to FAIL
- [ ] Phase 3 completed: Implementation makes all tests PASS
- [ ] Phase 4 completed: All quality gates verified

### Quality Gates (ALL must pass)
- [ ] Gate 1: `npm run build` → exits with code 0
- [ ] Gate 2: `npm run lint` → no errors (warnings OK)
- [ ] Gate 3: `npm run dev` → route loads in browser without errors
- [ ] Gate 4a: Unit tests → X passed, 0 failed, **coverage ≥ 90%**
- [ ] Gate 4b: Integration tests → X passed, 0 failed (or N/A with reason)
- [ ] Gate 4c: E2E tests → X passed, 0 failed, **all RIS flows covered**

### Test Evidence (REQUIRED - paste actual output)

**Unit Test Coverage:**
```
[paste coverage summary showing ≥ 90%]
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
your-new-file.ts      |   95.2  |   92.3   |  100    |   95.2  |
```

**Unit Test Results:**
```
✓ tests/unit/jobsmarket/.../your-test.test.ts (X tests)
Test Files  X passed
Tests       X passed
```

**Integration Test Results:**
```
✓ tests/integration/jobsmarket/.../your-test.test.ts (X tests)
Test Files  X passed
Tests       X passed
```

**E2E Test Results:**
```
Running X tests using Y workers
  ✓ tests/e2e/jobsmarket/.../your-test.spec.ts:XX:X › Test name (Xs)
  X passed
```

### RIS Flow Coverage (REQUIRED for routes)
- [ ] Flow 1: [flow name from RIS] → tested in `test-file.spec.ts`
- [ ] Flow 2: [flow name from RIS] → tested in `test-file.spec.ts`
- [ ] Invalid inputs tested: [list what you tested]
- [ ] Error states tested: [list what you tested]

### Manual Verification
- [ ] Visited route in browser: [URL]
- [ ] Core functionality works: [describe what you tested]
```

**⚠️ IMPORTANT:** Copy and fill this checklist in your completion message. If you cannot fill it, you are not done.

---

## 🚫 What Human Should NEVER See

These errors are YOUR responsibility. Human reviews logic and specs, not compilation errors.

| Error Type | Your Gate | Human Should See |
|------------|-----------|------------------|
| Syntax errors | Gate 1 | ❌ Never |
| TypeScript errors | Gate 1 | ❌ Never |
| `"use server"` + sync function | Gate 1 | ❌ Never |
| Import/export errors | Gate 1 | ❌ Never |
| Lint errors | Gate 2 | ❌ Never |
| Page crash on load | Gate 3 | ❌ Never |
| Missing unit tests | Gate 4a | ❌ Never |
| Coverage < 90% | Gate 4a | ❌ Never |
| Missing integration tests | Gate 4b | ❌ Never |
| Missing E2E tests | Gate 4c | ❌ Never |
| Test assertion failures | Gate 4 | ⚠️ Only if spec unclear |
| Logic/spec questions | N/A | ✅ Yes, ask |

---

## Test Writing Guidelines

### Unit Test Best Practices

1. **Test file naming:** `{component-or-function-name}.test.ts(x)`
2. **Organize with describe blocks:** Group by functionality
3. **Test all branches:** Every if/else, every switch case
4. **Test edge cases:** null, undefined, empty arrays, boundary values
5. **Mock external dependencies:** Don't test imported libraries

```typescript
// ✅ Good: Tests all branches
describe("calculateDiscount", () => {
  it("returns 0 for amounts below threshold", () => { /* ... */ });
  it("returns 10% for amounts between 100-500", () => { /* ... */ });
  it("returns 20% for amounts above 500", () => { /* ... */ });
  it("handles null amount gracefully", () => { /* ... */ });
  it("handles negative amounts", () => { /* ... */ });
});

// ❌ Bad: Only tests happy path
describe("calculateDiscount", () => {
  it("calculates discount", () => { /* only tests one case */ });
});
```

### Integration Test Best Practices

1. **Use real dev database** - NOT Firebase emulator
2. **Clean up after tests** - Remove test data in afterEach
3. **Use unique test identifiers** - Prevent collision with real data
4. **Test complete operations** - Create → Read → Update → Delete

### E2E Test Best Practices

1. **One test file per RIS route**
2. **Use descriptive test names** - Reference RIS flow
3. **Test user perspective** - Not implementation details
4. **Use accessible selectors** - getByRole, getByLabel, getByText
5. **Handle async properly** - Use waitFor, expect with retry

```typescript
// ✅ Good: Accessible selectors, clear intent
await page.getByRole("button", { name: /บันทึก/ }).click();
await expect(page.getByText(/บันทึกสำเร็จ/)).toBeVisible();

// ❌ Bad: Implementation-dependent selectors
await page.click(".btn-primary");
await page.waitForSelector(".toast-success");
```

---

## Next.js 16 / React 19 Rules

### Server Actions (`"use server"`)

**RULE:** ALL exported functions in `"use server"` files MUST be `async`.

```typescript
// ✅ CORRECT - async function
"use server"
export async function myAction() { ... }

// ❌ WRONG - will fail build (Gate 1)
"use server"  
export function myAction() { ... }  // Missing async!

// ❌ WRONG - non-async helper exported
"use server"
export const helper = () => { ... }  // Must be async if exported!

// ✅ CORRECT - non-exported helper can be sync
"use server"
const helper = () => { ... }  // OK - not exported
export async function myAction() { 
  helper()  // OK
}
```

### Server vs Client Components

```typescript
// Server Component (default) - NO client hooks
// ❌ WRONG - will fail at runtime (Gate 3)
export default function Page() {
  const [state, setState] = useState()  // ERROR!
}

// ✅ CORRECT - add "use client" for interactive components
"use client"
export default function Page() {
  const [state, setState] = useState()  // OK
}
```

**Rules:**
- Server Components (default): No `useState`, `useEffect`, `onClick`, event handlers
- Client Components: Must have `"use client"` directive at top
- Server Actions: Can be called from Client Components

### Common Pattern: Page with Client Interactivity

```typescript
// src/app/jobsmarket/auth/login/page.tsx (Server Component - default)
import { LoginClient } from './_components/LoginClient'

export default function LoginPage() {
  return <LoginClient />  // Delegate to client component
}

// src/app/jobsmarket/auth/login/_components/LoginClient.tsx
"use client"
export function LoginClient() {
  const [email, setEmail] = useState('')
  // ... interactive logic
}
```

---

## Design System Quick Reference

### Color Usage

| Color | Token | Usage |
|-------|-------|-------|
| **Teal** (Primary brand) | `secondary-*` | Navigation, headers, icons, links |
| **Orange** (Action) | `primary-*` | ONE primary CTA per section only |
| **Gray** | `gray-*` | Text, borders, backgrounds |
| **Semantic** | `red/green/amber` | Error/Success/Warning states |

### Typography Scale

| Element | Classes |
|---------|---------|
| H1 | `text-3xl font-semibold tracking-wide leading-snug` |
| H2 | `text-2xl font-semibold tracking-wide leading-snug` |
| H3 | `text-xl font-medium tracking-wide leading-normal` |
| Body | `text-base font-normal tracking-wider leading-relaxed` |
| Small | `text-sm font-normal tracking-wider` |
| Caption | `text-xs font-normal tracking-widest` |
| Button/Label | `font-medium tracking-widest` |

**Font Weight Reference (Custom):**
| Weight | Value | Usage |
|--------|-------|-------|
| `font-light` | 200 | Decorative, large display |
| `font-normal` | 300 | Body text |
| `font-medium` | 400 | UI elements, buttons |
| `font-semibold` | 500 | Headings |
| `font-bold` | 600 | Strong emphasis (sparingly) |

---

### Button Hierarchy

| Level | Name | Style | Usage |
|-------|------|-------|-------|
| 1 | **Primary** | `bg-primary text-primary-foreground hover:bg-primary-900` | Main action (one per section) |
| 2 | **Secondary** | `bg-secondary-900 text-secondary-foreground hover:bg-secondary-800` | Supporting actions |
| 3 | **Outline** | `border border-secondary-500 text-secondary-700 hover:bg-secondary-50` | Dismissive/back actions |
| 4 | **Ghost** | `text-secondary-600 hover:text-secondary-800 hover:bg-secondary-50` | Lowest priority |
| 5 | **Destructive** | `bg-red-600 text-white hover:bg-red-700` | Dangerous actions (+ icon + confirm) |

**Button Properties:**
- Border radius: `rounded-[0.625rem]` (10px)
- Font: `font-medium tracking-widest`
- Padding: `px-4 py-2` (sm), `px-6 py-3` (default), `px-8 py-4` (lg)

---

### Status Badges

Map all statuses to 4 variants for simplicity:

| Variant | Classes | Use For |
|---------|---------|---------|
| `waiting` | `bg-amber-100 text-amber-700 border-amber-700` | Pending, In Review |
| `success` | `bg-green-100 text-green-700 border-green-700` | Confirmed, Approved |
| `problem` | `bg-rose-100 text-rose-700 border-rose-700` | Declined, Rejected, No-show |
| `neutral` | `bg-gray-100 text-gray-600 border-gray-600` | Completed, Cancelled |

**"Needs Action" (urgent):** Add `border-2` and 🔔 icon.

---

### Form Elements

**Input Default:**
```
border border-gray-300 rounded-lg bg-white text-gray-900
focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200
```

**Input Error:**
```
border-2 border-red-500 bg-red-50 text-gray-900
```

**Labels:**
- Default: `text-sm text-gray-700 font-medium`
- Required: Add `text-red-500` asterisk
- Optional: Add `text-gray-400 text-xs` "(ไม่บังคับ)"

---

### Design Rules Summary

| ✅ DO | ❌ DON'T |
|-------|----------|
| Use orange for ONE primary CTA per section | Multiple orange buttons side-by-side |
| Use teal for navigation, links, icons | Orange for navigation items |
| Pair color with icons/text for meaning | Color alone to convey meaning |
| Use `rounded-[0.625rem]` for corners | Mix corner radius styles |
| Follow 80/20 teal/orange ratio | Overuse orange throughout UI |

---

## File Access Tiers

### 🔴 Tier 1: Rarely Modify (Push Back First)

These paths are in production. **Push back and suggest alternatives first.**

| Path | Reason |
|------|--------|
| `src/app/content/*` | Content subdomain in production |
| `src/app/jobsmarket/legal/` | Live, serves legal requirements |
| `src/app/jobsmarket/privacy/` | Live, serves legal requirements |

**Behavior:** "This file is in production for [reason]. I suggest [alternative]. If you still want me to modify it, please confirm."

### 🟡 Tier 2: Ask Before Modifying

Shared resources. Check if existing code can be reused first.

| Path | Reason |
|------|--------|
| `src/lib/*` | Database layer, shared across subdomains |
| `src/domains/*/services/*` | Domain services, shared across subdomains |
| `src/components/ui/*` | shadcn base components |
| `src/app/` (root layouts) | Affects all subdomains |
| `src/hooks/*` (existing files) | May be shared |
| `src/store/*` (existing files) | May be shared |
| `package.json` | Dependencies and scripts |
| `tailwind.config.ts` | Design tokens, affects entire app |

**Behavior:** "I need to modify [file] to [reason]. This is a shared resource. Should I proceed?"

### 🟢 Tier 3: Autonomous

Create and modify freely in these namespaced areas per RIS/BLS specs.

| Path | Purpose |
|------|---------|
| `src/app/jobsmarket/*` (except legal, privacy) | Route pages |
| `src/app/jobsmarket/{route}/_components/` | Co-located page components |
| `src/components/jobsmarket/*` | Shared jobsmarket components |
| `src/hooks/jobsmarket/*` | New hooks |
| `src/store/jobsmarket/*` | New atoms |
| `tests/*/jobsmarket/*` | All test files |

> **Note on Domain Services:** Domain services (`src/domains/*/services/`) are **shared resources** (Tier 2). Reuse existing services rather than creating jobsmarket-specific duplicates. If a new service is needed, add it to the shared domain and check with human first.

### Decision Flow

```
Need a function/component?
    ↓
Check if it exists in Tier 2 paths
    ↓
┌─────────────────────────────────────────┐
│ Exists and works? → Reuse it            │
│ Exists but needs changes? → Ask human   │
│ Doesn't exist? → Create in Tier 3       │
└─────────────────────────────────────────┘
```

---

## Implementation Workflow

Before implementing any route:

1. **Read** the RIS document (`docs/jobsmarket/RIS/{DOMAIN}-R{NN}_*.md`)
2. **Read** the cross-cutting RIS (`*-R00_cross-cutting.md`)
3. **Read** relevant BLS sections (`docs/jobsmarket/BLS/BLS-{NN}_*.md`)
4. **Read** design guidelines (`docs/jobsmarket/design-systems/chancedee-design-guidelines.md`)
5. **Check** for reusable code in `src/lib/database/actions/` and `src/domains/`
6. **Create** an implementation plan (template in PROJECT_INSTRUCTIONS §5.3)
7. **Wait** for human approval before coding

**TDD Implementation (after approval):**

8. **Write tests first** (TDD RED phase):
   - Write unit tests for functions/hooks → verify they FAIL
   - Write integration tests for server actions → verify they FAIL
   - Write E2E tests for user flows → verify they FAIL
9. **Implement** to pass tests (TDD GREEN phase):
   - Implement ONE component at a time
   - Run tests after each component
   - Continue until all tests pass
10. **Verify coverage** ≥ 90% for unit tests
11. **Run ALL quality gates** (Gates 1-4)
12. **Fill completion checklist** with evidence
13. **Create PR** with conventional commit message

---

## File Creation Conventions

| Type | Location |
|------|----------|
| Route pages | `src/app/jobsmarket/{path}/page.tsx` |
| Page components | `src/app/jobsmarket/{path}/_components/` |
| Shared components | `src/components/jobsmarket/{feature}/` |
| Domain services | `src/domains/{domain}/services/` (shared, ask before creating new) |
| Hooks | `src/hooks/jobsmarket/` |
| Atoms | `src/store/jobsmarket/` |
| Unit tests | `tests/unit/jobsmarket/{domain}/{feature}/` |
| Integration tests | `tests/integration/jobsmarket/{domain}/` |
| E2E tests | `tests/e2e/jobsmarket/{domain}/` |

---

## Key Directories

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── content/(body)/     # Content subdomain
│   └── jobsmarket/         # Jobs subdomain ← IMPLEMENT HERE
├── components/
│   ├── ui/                 # shadcn/ui base components
│   └── jobsmarket/         # Jobs subdomain components ← CREATE HERE
├── domains/                # Domain-driven modules
│   └── {domain}/services/  # Shared services (REUSE, ask before creating)
├── hooks/
│   └── jobsmarket/         # Jobs subdomain hooks ← CREATE HERE
├── lib/
│   └── database/           # Firebase repository layer (REUSE)
├── store/
│   └── jobsmarket/         # Jobs subdomain atoms ← CREATE HERE
└── types/                  # TypeScript type definitions

public/
├── icons/
│   └── brand/              # Brand icons (favicons, app icons)
└── images/                 # Brand images, illustrations

docs/
└── jobsmarket/
    ├── PROJECT_INSTRUCTIONS_v3_2.md  # ← READ THIS FIRST
    ├── DOCUMENTATION-GUIDE.md
    ├── RIS/                # Route Implementation Specs
    ├── BLS/                # Business Logic Specs
    └── design-systems/     # UI Component Specs
        └── chancedee-design-guidelines.md  # ← DESIGN REFERENCE

tests/
├── unit/
│   └── jobsmarket/         # Unit tests ← CREATE HERE
├── integration/
│   └── jobsmarket/         # Integration tests ← CREATE HERE
└── e2e/
    └── jobsmarket/         # E2E tests ← CREATE HERE
```

---

## Project Documentation

### Quick Reference

| Task | Document |
|------|----------|
| **Full project context** | `docs/jobsmarket/PROJECT_INSTRUCTIONS_v3_2.md` |
| **How to use docs** | `docs/jobsmarket/DOCUMENTATION-GUIDE.md` |
| **Implement a route** | `docs/jobsmarket/RIS/{DOMAIN}-R{NN}_*.md` |
| **Server action logic** | `docs/jobsmarket/BLS/BLS-{NN}_*.md` |
| **UI components** | `docs/jobsmarket/design-systems/` |
| **Design guidelines** | `docs/jobsmarket/design-systems/chancedee-design-guidelines.md` |
| **Cross-cutting patterns** | `*-R00_cross-cutting.md` or `BLS-00_*.md` |

### Document Precedence

- RIS > BLS > Design Systems for implementation decisions
- DO NOT use `docs/jobsmarket/architecture/state-inventory/` - it documents the old implementation
- See PROJECT_INSTRUCTIONS_v3_2.md §4.4 for details

### URL to Filesystem Mapping

Routes in docs are relative to `/jobsmarket`:

| Doc Reference | User URL | Filesystem |
|---------------|----------|------------|
| `/auth/login` | `jobs.chancedee.com/auth/login` | `src/app/jobsmarket/auth/login/page.tsx` |
| `/jobs/[id]` | `jobs.chancedee.com/jobs/123` | `src/app/jobsmarket/jobs/[id]/page.tsx` |

---

## External Services

- Firebase (Auth, Firestore, Storage)
- Directus CMS
- SendGrid (email)
- MeiliSearch (job search)
- Google Analytics