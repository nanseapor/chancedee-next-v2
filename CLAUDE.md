# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT:** Read `docs/jobsmarket/PROJECT_INSTRUCTIONS_v3.1.md` for full project context and workflow.

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

Then visit the route you implemented in browser.

| Result | Action |
|--------|--------|
| ✅ Route loads without error | Proceed to Gate 4 |
| ❌ Server crash | **STOP. FIX IT. DO NOT PROCEED.** |
| ❌ Route shows error page | **STOP. FIX IT. DO NOT PROCEED.** |
| ❌ Console errors (red) | **STOP. FIX IT. DO NOT PROCEED.** |

---

### Gate 4: TESTS MUST RUN ⛔ STOP

Run the appropriate test command:

```bash
# Unit tests
npm run test:unit

# E2E tests for specific route
npx playwright test tests/e2e/jobsmarket/auth/login.spec.ts --project=chromium
```

| Result | Action |
|--------|--------|
| ✅ All tests pass | Proceed to completion |
| ⚠️ Some tests skipped (documented) | Proceed (note in checklist) |
| ❌ Tests fail | **STOP. Either fix code OR document why test is wrong** |
| ❌ Tests won't run | **STOP. FIX IT. DO NOT PROCEED.** |

---

### Gate 4a: E2E TEST CREDENTIALS

**Test credentials are available in `.env.playwright`**

Before writing E2E tests that require authentication:

```bash
# Check available test credentials
cat .env.playwright | grep -E "^(TEST_|E2E_)" 
```

**Usage in Playwright tests:**

```typescript
test.describe("Tests requiring auth", () => {
  const TEST_EMAIL = process.env.TEST_USER_EMAIL;
  const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;
  
  // Skip if credentials not available (CI environment)
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Test credentials not configured');

  test("should login successfully", async ({ page }) => {
    await page.getByLabel("อีเมล").fill(TEST_EMAIL!);
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill(TEST_PASSWORD!);
    // ...
  });
});
```

**Rules:**
- ✅ DO use `.env.playwright` credentials for auth flow tests
- ✅ DO add `test.skip()` guard for missing credentials
- ❌ DO NOT hardcode credentials in test files
- ❌ DO NOT commit `.env.playwright` to git
- ❌ DO NOT skip auth tests without trying credentials first

**If tests are skipped due to "missing credentials":**
1. First verify `.env.playwright` exists
2. Verify Playwright config loads it: `dotenv.config({ path: '.env.playwright' })`
3. Only then mark as "skipped - credentials not in CI"

---

## ✅ Definition of "Implementation Complete"

You may ONLY say implementation is complete when ALL of these are true:

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
| Test won't run | Gate 4 | ❌ Never |
| Test assertion failures | Gate 4 | ⚠️ Only if spec unclear |
| Logic/spec questions | N/A | ✅ Yes, ask |

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
  const [email, setEmail] = useState('')  // OK - client component
  // ...
}
```

---

## Commands Reference

```bash
# Gate 1 - Build
npm run build         # MUST pass before completion

# Gate 2 - Lint
npm run lint          # MUST have no errors

# Gate 3 - Dev server
npm run dev           # Then visit route in browser

# Gate 4 - Tests
npm run test:unit                    # Unit tests (Vitest)
npm run test:integration             # Integration tests
npm run test:e2e                     # All E2E tests (Playwright)

# Quick E2E for specific file
npx playwright test tests/e2e/jobsmarket/auth/login.spec.ts --project=chromium
```

---

## Architecture Overview

This is a Thai-language career/lifestyle content platform built with Next.js 16 (App Router) and React 19.

### Multi-Subdomain Structure

```
src/app/
├── api/                    # Shared API routes
├── content/(body)/         # Content subdomain (chancedee.com)
└── jobsmarket/             # Jobs subdomain (jobs.chancedee.com) ← OUR FOCUS
```

### Data Layer

**Two Backend Systems:**
1. **Directus CMS** (`src/lib/directus.ts`) - Blog/content management via REST API
2. **Firebase Admin** (`src/lib/firebase-admin.ts`) - User/business data

**Repository Pattern for Firebase:**
- `src/lib/database/repositories/` - Type-safe data access with generic factory
- `src/lib/database/schemas/` - Zod schemas for validation
- `src/lib/database/actions/` - Server actions for each domain

### State Management

- **Jotai** for global client state (`src/store/`)
- **SWR** for server data fetching

### UI Components

- **shadcn/ui** components in `src/components/ui/`
- **Tailwind CSS v4** with CSS variables
- Utility: `cn()` from `src/lib/utils.ts`

### Path Alias

`@/*` maps to `./src/*`

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
| `src/components/ui/*` | shadcn base components |
| `src/app/` (root layouts) | Affects all subdomains |
| `src/domains/*/services/*` (existing files) | May be used by content subdomain |
| `src/hooks/*` (existing files) | May be shared |
| `src/store/*` (existing files) | May be shared |
| `package.json` | Dependencies and scripts |

**Behavior:** "I need to modify [file] to [reason]. This is a shared resource. Should I proceed?"

### 🟢 Tier 3: Autonomous

Create and modify freely in these namespaced areas per RIS/BLS specs.

| Path | Purpose |
|------|---------|
| `src/app/jobsmarket/*` (except legal, privacy) | Route pages |
| `src/app/jobsmarket/{route}/_components/` | Co-located page components |
| `src/components/jobsmarket/*` | Shared jobsmarket components |
| `src/domains/*/services/server/actions/jobsmarket/*` | New domain services |
| `src/hooks/jobsmarket/*` | New hooks |
| `src/store/jobsmarket/*` | New atoms |
| `tests/*/jobsmarket/*` | All test files |

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
4. **Check** for reusable code in `src/lib/database/actions/` and `src/domains/`
5. **Create** an implementation plan (template in PROJECT_INSTRUCTIONS §5.3)
6. **Wait** for human approval before coding
7. **Write tests first** (TDD)
8. **Implement** to pass tests
9. **Run ALL quality gates** (Gates 1-4)
10. **Fill completion checklist** with evidence
11. **Create PR** with conventional commit message

---

## File Creation Conventions

| Type | Location |
|------|----------|
| Route pages | `src/app/jobsmarket/{path}/page.tsx` |
| Page components | `src/app/jobsmarket/{path}/_components/` |
| Shared components | `src/components/jobsmarket/{feature}/` |
| Domain services | `src/domains/{domain}/services/server/actions/jobsmarket/` |
| Hooks | `src/hooks/jobsmarket/` |
| Atoms | `src/store/jobsmarket/` |
| Unit tests | `tests/unit/jobsmarket/` |
| Integration tests | `tests/integration/jobsmarket/` |
| E2E tests | `tests/e2e/jobsmarket/` |

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
│   └── {domain}/services/server/actions/
│       └── jobsmarket/     # New jobsmarket actions ← CREATE HERE
├── hooks/
│   └── jobsmarket/         # Jobs subdomain hooks ← CREATE HERE
├── lib/
│   └── database/           # Firebase repository layer (REUSE)
├── store/
│   └── jobsmarket/         # Jobs subdomain atoms ← CREATE HERE
└── types/                  # TypeScript type definitions

docs/
└── jobsmarket/
    ├── PROJECT_INSTRUCTIONS_v3.1.md  # ← READ THIS FIRST
    ├── DOCUMENTATION-GUIDE.md
    ├── RIS/                # Route Implementation Specs
    ├── BLS/                # Business Logic Specs
    └── design-systems/     # UI Component Specs

tests/
└── {unit|integration|e2e}/
    └── jobsmarket/         # All tests ← CREATE HERE
```

---

## Project Documentation

### Quick Reference

| Task | Document |
|------|----------|
| **Full project context** | `docs/jobsmarket/PROJECT_INSTRUCTIONS_v3.1.md` |
| **How to use docs** | `docs/jobsmarket/DOCUMENTATION-GUIDE.md` |
| **Implement a route** | `docs/jobsmarket/RIS/{DOMAIN}-R{NN}_*.md` |
| **Server action logic** | `docs/jobsmarket/BLS/BLS-{NN}_*.md` |
| **UI components** | `docs/jobsmarket/design-systems/` |
| **Cross-cutting patterns** | `*-R00_cross-cutting.md` or `BLS-00_*.md` |

### Document Precedence

- RIS > BLS > Design Systems for implementation decisions
- DO NOT use `docs/jobsmarket/architecture/state-inventory/` - it documents the old implementation
- See PROJECT_INSTRUCTIONS_v3.1.md §4.4 for details

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