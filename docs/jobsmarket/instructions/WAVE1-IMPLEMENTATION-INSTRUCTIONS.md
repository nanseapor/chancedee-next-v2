# Wave 1 Implementation Instructions for Claude Code

**Document Purpose:** Instructions for Claude Code to create implementation plans for Wave 1  
**Created:** 2024-12-14  
**Project Branch:** `development` (from commit `fe2e998520751cae90043b6e4f99622de6882b59`)

---

## 1. Context Summary

### 1.1 What's Done (Wave 0)

Wave 0 (Authentication) is **COMPLETE**:
- 8 routes implemented (AUTH-R01 through AUTH-R08)
- 524+ tests passing (373 unit, 235 integration, 72 E2E)
- 95.61% statement coverage, 93.63% branch coverage
- All merged to `development` branch

### 1.2 What's Next (Wave 1)

Wave 1 is split into two **independent** sub-waves that can be developed in parallel:

| Sub-Wave | Domain | Routes | Can Start |
|----------|--------|--------|-----------|
| **Wave 1a** | Candidate Identity | CAND-R01 to CAND-R05 | ✅ Immediately |
| **Wave 1b** | Company Identity | COMP-R01 to COMP-R04 | ✅ Immediately |

---

## 2. Wave 1a: Candidate Identity Routes

### 2.1 Route List

| Order | Route ID | Path | RIS Document | Complexity | Dependencies |
|-------|----------|------|--------------|------------|--------------|
| 1 | CAND-R01 | `/candidates/[id]` | `CAND-R01_dashboard_RIS.md` | Medium | None |
| 2 | CAND-R02 | `/candidates/[id]/profile` | `CAND-R02_profile_RIS.md` | High | CAND-R01 (shell) |
| 3 | CAND-R03 | `/candidates/[id]/settings` | `CAND-R03_settings_RIS.md` | Low | CAND-R01 (shell) |
| 4 | CAND-R04 | `/candidates/[id]/applications` | `CAND-R04_applications_RIS.md` | Medium | CAND-R01 (shell) |
| 5 | CAND-R05 | `/candidates/[id]/saved` | `CAND-R05_saved_RIS.md` | Low | CAND-R01 (shell) |

### 2.2 Implementation Order Rationale

**CAND-R01 MUST be first** because:
1. Implements the **Candidate Shell** (shared layout for all `/candidates/*` routes)
2. Establishes **authentication/authorization patterns** reused by R02-R05
3. Creates **ownership check** logic (redirect to own resource, not "Access Denied")

After CAND-R01, routes R02-R05 can be done in any order (all depend only on the shell).

### 2.3 Documents to Read for Wave 1a

**Before ANY Candidate route:**
```
docs/jobsmarket/RIS/CAND-R00_cross-cutting_RIS.md  (REQUIRED - shared patterns)
docs/jobsmarket/BLS/BLS-00_cross-cutting.md        (REQUIRED - auth patterns)
docs/jobsmarket/BLS/BLS-08_candidate-profile.md    (For profile actions)
```

**Per-route RIS:**
```
docs/jobsmarket/RIS/CAND-R01_dashboard_RIS.md
docs/jobsmarket/RIS/CAND-R02_profile_RIS.md
docs/jobsmarket/RIS/CAND-R03_settings_RIS.md
docs/jobsmarket/RIS/CAND-R04_applications_RIS.md
docs/jobsmarket/RIS/CAND-R05_saved_RIS.md
```

**Design Systems:**
```
docs/jobsmarket/design-systems/01-navigation-shells.md  (Candidate Shell)
docs/jobsmarket/design-systems/cards.md                  (Profile cards, stats)
docs/jobsmarket/design-systems/form-elements.md          (Profile editing)
docs/jobsmarket/design-systems/widgets.md                (Dashboard widgets)
```

---

## 3. Wave 1b: Company Identity Routes

### 3.1 Route List

| Order | Route ID | Path | RIS Document | Complexity | Dependencies |
|-------|----------|------|--------------|------------|--------------|
| 1 | COMP-R01 | `/companies/pending` | `COMP-R01_pending_RIS.md` | Low | None |
| 2 | COMP-R04 | `/companies/[id]/dashboard` | `COMP-R04_dashboard_RIS.md` | Medium | None (different shell) |
| 3 | COMP-R02 | `/companies/[id]/team` | `COMP-R02_team_RIS.md` | Medium | COMP-R04 (shell) |
| 4 | COMP-R03 | `/companies/[id]/settings` | `COMP-R03_settings_RIS.md` | Medium | COMP-R04 (shell) |

### 3.2 Implementation Order Rationale

**Two parallel tracks:**

1. **COMP-R01 (Pending)** uses **Minimal Shell** - can be done independently
2. **COMP-R04 (Dashboard)** establishes **Company Shell** - must be done before R02/R03

### 3.3 Documents to Read for Wave 1b

**Before ANY Company route:**
```
docs/jobsmarket/RIS/COMP-R00_cross-cutting_RIS.md  (REQUIRED - shared patterns)
docs/jobsmarket/BLS/BLS-00_cross-cutting.md        (REQUIRED - auth patterns)
docs/jobsmarket/BLS/BLS-09_company-profile.md      (For company actions)
```

**Per-route RIS:**
```
docs/jobsmarket/RIS/COMP-R01_pending_RIS.md
docs/jobsmarket/RIS/COMP-R02_team_RIS.md
docs/jobsmarket/RIS/COMP-R03_settings_RIS.md
docs/jobsmarket/RIS/COMP-R04_dashboard_RIS.md
```

**Design Systems:**
```
docs/jobsmarket/design-systems/01-navigation-shells.md  (Company Shell, Minimal Shell)
docs/jobsmarket/design-systems/tables.md                 (Team management)
docs/jobsmarket/design-systems/modals.md                 (Confirmation dialogs)
```

---

## 4. Plan Template (REQUIRED FORMAT)

Use this exact template for every implementation plan:

```markdown
## Route Implementation Plan: {DOMAIN}-R{NN}

### Route: `{path}`
### RIS: `{filename}`
### Related BLS: `{filename}` Section {N}

---

### 1. Files to Create

| File | Purpose |
|------|---------|
| `src/app/jobsmarket/{path}/page.tsx` | Route page (Server Component) |
| `src/app/jobsmarket/{path}/_components/{Name}Client.tsx` | Main client component |
| `src/app/jobsmarket/{path}/_components/{Component}.tsx` | Supporting components |
| `tests/unit/jobsmarket/{domain}/{route}/*.test.ts` | Unit tests |
| `tests/integration/jobsmarket/{domain}/{route}/*.test.tsx` | Integration tests |
| `tests/e2e/jobsmarket/{domain}/{route}.spec.ts` | E2E tests |

### 2. Server Actions Required

| Action | Source | Signature | New/Reuse |
|--------|--------|-----------|-----------|
| `{actionName}` | BLS-{NN} §{N} | `(input) => Promise<Result>` | New / Reuse from {path} |

**CRITICAL:** 
- ✅ Use Server Actions from `src/lib/database/actions/` or `src/domains/*/services/server/actions/`
- ❌ Do NOT create `/api/` routes

### 3. State Management

| Atom/Hook | Purpose | New/Reuse |
|-----------|---------|-----------|
| `{atomName}` | {purpose} | New / Reuse from {path} |
| `use{HookName}` | {purpose} | New / Reuse from {path} |

**SWR Pattern:**
```typescript
// ✅ CORRECT - SWR with server action
const { data } = useSWR(
  user?.uid ? ['candidate-info', user.uid] : null,
  ([, id]) => webCandidateInformationGetById(id)
);
```

### 4. Test Coverage Plan

**Coverage Targets:**
- Business Logic: ≥ 90%
- Utilities: ≥ 80%
- E2E: 100% of critical user journeys

| Type | Test Case | Covers |
|------|-----------|--------|
| Unit | {description} | {state/action} |
| Integration | {description} | {workflow} |
| E2E | {description} | {user journey} |

### 5. State Machine Verification

From RIS §6 (State Transition Tables):

| State | Event | Next State | Test Assertion |
|-------|-------|------------|----------------|
| {state} | {event} | {next} | {what to verify} |

### 6. Thai Copy Checklist

| Element | Thai Text | English Text | Source |
|---------|-----------|--------------|--------|
| Page Title | {ภาษาไทย} | {English} | RIS §{N} |
| Button | {ภาษาไทย} | {English} | RIS §{N} |

### 7. Dependencies

- **Requires:** {routes that must be done first}
- **Blocks:** {routes that depend on this}
- **Shell:** {Candidate Shell / Company Shell / Minimal Shell / None}

### 8. Component Reuse Analysis

Check these locations before creating new components:

| Component Type | Check Location | Reusable? |
|----------------|----------------|-----------|
| Shell/Layout | `src/components/jobsmarket/shells/` | {Yes/No/Create} |
| Cards | `src/components/jobsmarket/cards/` | {Yes/No/Create} |
| Forms | `src/components/jobsmarket/forms/` | {Yes/No/Create} |
| Modals | `src/components/ui/` (shadcn) | {Yes/No/Create} |

### 9. Open Questions

1. {Any clarifications needed before implementation}

### 10. Estimated Complexity

| Aspect | Estimate |
|--------|----------|
| Components | {N} new, {M} reuse |
| Server Actions | {N} new, {M} reuse |
| Test Cases | {N} unit, {M} integration, {K} E2E |
| Effort | {Low/Medium/High} |
| Estimated Tests | {N} total |
```

---

## 5. Critical Architecture Rules

### 5.1 Server Actions ONLY (NO API Routes)

```typescript
// ❌ WRONG - Never create API routes for jobsmarket
const { data } = useSWR('/api/candidates/123', fetcher);
fetch('/api/companies/profile');

// ✅ CORRECT - Always use server actions
import { webCandidateInformationGetById } from '@/lib/database/actions/candidate-information';
const { data } = useSWR(['candidate', id], ([, id]) => webCandidateInformationGetById(id));
```

### 5.2 Server Action Locations

| Priority | Location | When to Use |
|----------|----------|-------------|
| 1 | `src/lib/database/actions/*.ts` | Database operations (check first!) |
| 2 | `src/domains/*/services/server/actions/*.ts` | Extend existing if compatible |
| 3 | `src/domains/*/services/server/actions/jobsmarket/*.ts` | Create new if incompatible |

### 5.3 Bilingual Copy (Thai Primary)

All user-facing text MUST include both languages:

```tsx
<h1 className="text-2xl font-semibold">แดชบอร์ด</h1>
<p className="text-sm text-gray-500">Dashboard</p>
```

### 5.4 Component File Structure

```
src/app/jobsmarket/{domain}/{route}/
├── page.tsx                    # Server component wrapper (minimal)
└── _components/
    ├── {Route}Client.tsx       # Main client component ('use client')
    └── {SubComponent}.tsx      # Supporting components

tests/
├── unit/jobsmarket/{domain}/{route}/
│   └── *.test.ts
├── integration/jobsmarket/{domain}/{route}/
│   └── *.test.tsx
└── e2e/jobsmarket/{domain}/
    └── {route}.spec.ts
```

---

## 6. Quality Gates (ALL Must Pass)

Before submitting any implementation for review:

```bash
# Gate 1: Build
npm run build
# Must exit with code 0

# Gate 2: Lint
npm run lint
# No errors in new files (pre-existing errors acceptable)

# Gate 3: Dev Server
npm run dev
# Route must load at http://localhost:3000/jobsmarket/{route} without errors

# Gate 4: Tests
npm run test:unit           # Unit tests must pass
npm run test:integration    # Integration tests must pass
npm run test:e2e            # E2E tests must pass (skips OK for missing credentials)
```

---

## 7. Test Coverage Requirements

### 7.1 Coverage Targets

| Category | Target | Notes |
|----------|--------|-------|
| **Core Business Logic** | **≥ 90%** | Authorization, validation, security paths |
| **Utility Functions** | **≥ 80%** | Helpers, formatters, shared utilities |
| **E2E User Workflows** | **100%** | All critical user journeys |
| **Branch Coverage** | **≥ 70%** | Minimum for all files |

### 7.2 Test File Locations

```
tests/
├── unit/jobsmarket/{domain}/{route}/
│   ├── components/           # Component unit tests
│   ├── hooks/                # Hook tests
│   └── utils/                # Utility function tests
├── integration/jobsmarket/{domain}/{route}/
│   └── workflows/            # Multi-step business flows
└── e2e/jobsmarket/{domain}/
    └── {route}.spec.ts       # Browser automation tests
```

### 7.3 Real Firebase E2E Testing

```typescript
// Load test credentials from .env.playwright
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env.playwright') });

// Skip pattern for missing credentials
const hasTestCredentials = !!process.env.PLAYWRIGHT_TEST_CANDIDATE_UID;
describe.skipIf(!hasTestCredentials)('Tests requiring auth', () => {
  // Tests here
});
```

---

## 8. Workflow Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. READ DOCUMENTS                                                       │
│     - Read *-R00_cross-cutting_RIS.md for domain                        │
│     - Read specific route RIS                                            │
│     - Read relevant BLS sections                                         │
│     - Check design-systems/ for UI specs                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. CREATE PLAN                                                          │
│     - Use template from Section 4                                        │
│     - Check for existing server actions in src/lib/database/actions/    │
│     - Check for reusable components                                      │
│     - Estimate test coverage                                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. SA REVIEW (Claude Chat)                                              │
│     - Human brings plan to Claude Chat                                   │
│     - SA reviews for architecture compliance                             │
│     - SA checks: No API routes, coverage targets, component reuse        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. PLAN APPROVAL                                                        │
│     - SA approves OR requests corrections                                │
│     - Human gives final approval                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  5. IMPLEMENTATION (TDD)                                                 │
│     - Write tests FIRST (unit → integration → E2E)                       │
│     - Implement code to pass tests                                       │
│     - Refactor while tests stay green                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  6. QUALITY GATES                                                        │
│     - Gate 1: npm run build                                              │
│     - Gate 2: npm run lint                                               │
│     - Gate 3: npm run dev (verify route loads)                           │
│     - Gate 4: npm run test:unit && test:integration && test:e2e          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  7. MERGE                                                                │
│     - Commit: feat({domain}): {ROUTE-ID} {description} (X tests)        │
│     - Merge to development branch                                        │
│     - Delete feature branch                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Starting Instructions

### 9.1 For Wave 1a (Candidate Routes) - Start with CAND-R01

```
Task: Create implementation plan for CAND-R01 (Candidate Dashboard)

Read these documents FIRST:
1. docs/jobsmarket/RIS/CAND-R00_cross-cutting_RIS.md (REQUIRED)
2. docs/jobsmarket/RIS/CAND-R01_dashboard_RIS.md
3. docs/jobsmarket/BLS/BLS-00_cross-cutting.md
4. docs/jobsmarket/BLS/BLS-08_candidate-profile.md (Section on dashboard data)
5. docs/jobsmarket/design-systems/01-navigation-shells.md (Candidate Shell)

Then create plan using template in Section 4.

Key implementation notes:
- This route creates the Candidate Shell (reused by R02-R05)
- Implements ownership check (redirect to own resource, not "Access Denied")
- Dashboard is READ-ONLY (no mutations)
- Must handle: profile completion %, application stats, recommended jobs
```

### 9.2 For Wave 1b (Company Routes) - Start with COMP-R01 OR COMP-R04

**Option A: Start with COMP-R01 (Pending Page)**
```
Task: Create implementation plan for COMP-R01 (Company Pending Status)

Read these documents FIRST:
1. docs/jobsmarket/RIS/COMP-R00_cross-cutting_RIS.md (REQUIRED)
2. docs/jobsmarket/RIS/COMP-R01_pending_RIS.md
3. docs/jobsmarket/BLS/BLS-00_cross-cutting.md
4. docs/jobsmarket/design-systems/01-navigation-shells.md (Minimal Shell)

Then create plan using template in Section 4.

Key implementation notes:
- Uses MINIMAL SHELL (not full Company Shell)
- Handles company status: pending, rejected, approved (redirect)
- Low complexity - good starting point
```

**Option B: Start with COMP-R04 (Company Dashboard)**
```
Task: Create implementation plan for COMP-R04 (Company Dashboard)

Read these documents FIRST:
1. docs/jobsmarket/RIS/COMP-R00_cross-cutting_RIS.md (REQUIRED)
2. docs/jobsmarket/RIS/COMP-R04_dashboard_RIS.md
3. docs/jobsmarket/BLS/BLS-00_cross-cutting.md
4. docs/jobsmarket/BLS/BLS-09_company-profile.md
5. docs/jobsmarket/design-systems/01-navigation-shells.md (Company Shell)

Then create plan using template in Section 4.

Key implementation notes:
- This route creates the Company Shell (reused by R02, R03, R05-R08)
- Implements company role permissions (admin, staff, etc.)
- Dashboard shows: job stats, application counts, team overview
```

---

## 10. SA Review Checklist

When reviewing implementation plans, the SA (Claude Chat) will verify:

- [ ] No `/api/` routes proposed
- [ ] Uses server actions from correct locations
- [ ] SWR pattern uses server action functions (not fetch)
- [ ] Test coverage plan meets 90%/80% targets
- [ ] Component reuse identified (checked existing components)
- [ ] Thai + English copy included for all UI text
- [ ] Quality gates listed
- [ ] State machine from RIS is covered in tests
- [ ] Dependencies correctly identified
- [ ] Shell implementation (if first route in domain) follows spec
- [ ] Ownership check pattern (redirect to own, not "Access Denied")
- [ ] Estimated complexity is reasonable

---

## 11. Commit Message Format

```bash
# Feature implementation
feat({domain}): {ROUTE-ID} {description} ({N} tests, {X}% coverage)

# Examples:
feat(cand): CAND-R01 candidate dashboard (45 tests, 92% coverage)
feat(comp): COMP-R01 company pending page (28 tests, 89% coverage)

# Test additions
test({domain}): add tests for {ROUTE-ID}

# Bug fixes
fix({domain}): fix {issue} in {ROUTE-ID}
```

---

## 12. Branch Naming

```bash
feat/{domain}-r{number}-{short-name}

# Examples:
feat/cand-r01-dashboard
feat/cand-r02-profile
feat/comp-r01-pending
feat/comp-r04-dashboard
```

---

*End of Wave 1 Implementation Instructions*
