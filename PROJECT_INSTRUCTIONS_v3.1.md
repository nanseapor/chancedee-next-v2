# ChanceDee Project Instructions

**Version:** 3.1  
**Last Updated:** 2025-12-12  
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

Implement all routes in `src/app/jobsmarket/` according to RIS and BLS specifications using TDD approach.

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
4. IMPLEMENT → Claude Code writes tests first, then implementation
5. VERIFY    → Claude Code runs tests, ensures all pass
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
| `{actionName}` | BLS-{NN} §{N} | `(input) => Promise<Result>` | New / Reuse from {path} |

### 3. State Management

| Atom/Hook | Purpose | New/Reuse |
|-----------|---------|-----------|
| `{name}` | {purpose} | New / Reuse from {path} |

### 4. Test Coverage Plan

| Type | Test Case | Covers |
|------|-----------|--------|
| Unit | {description} | {state/action} |
| Integration | {description} | {workflow} |
| E2E | {description} | {user journey} |

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
| 19 | COMP-R05 | `/companies/[id]/dashboard/jobs` | `src/app/jobsmarket/companies/[id]/dashboard/jobs/` | P0 |
| 20 | COMP-R06 | `/companies/[id]/dashboard/jobs/new` | `src/app/jobsmarket/companies/[id]/dashboard/jobs/new/` | P0 |
| 21 | COMP-R07 | `/companies/[id]/dashboard/jobs/[jobId]` | `src/app/jobsmarket/companies/[id]/dashboard/jobs/[jobId]/` | P0 |

### Wave 4: Applications

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 22 | CAND-R04 | `/candidates/[id]/applications` | `src/app/jobsmarket/candidates/[id]/applications/` | P0 |
| 23 | COMP-R08 | `/companies/[id]/dashboard/applications` | `src/app/jobsmarket/companies/[id]/dashboard/applications/` | P0 |

### Wave 5: Communication

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 24 | CHAT-R01 | `/chat` | `src/app/jobsmarket/chat/` | P0 |
| 25 | CHAT-R02 | `/chat/[roomId]` | `src/app/jobsmarket/chat/[roomId]/` | P0 |

### Wave 6: Notifications

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 26 | NOTIF-R01 | `/notifications` | `src/app/jobsmarket/notifications/` | P1 |

### Wave 7: Supporting

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 27 | CAND-R05 | `/candidates/[id]/saved` | `src/app/jobsmarket/candidates/[id]/saved/` | P1 |
| 28 | WALLET-R01 | `/wallet` | `src/app/jobsmarket/wallet/` | P1 |

### Wave 8: Admin (Lower Priority)

| Order | RIS | Route | Filesystem Path | Priority |
|-------|-----|-------|-----------------|----------|
| 29+ | ADM-R01-R10 | `/platform/*` | `src/app/jobsmarket/platform/` | P2 |

---

### 6.1 Critical Gaps (from Gap Analysis)

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

## 7. Testing Strategy

### 7.1 Test Structure

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

### 7.2 Test Commands

Add these scripts to `package.json` if they don't exist:

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "vitest run --project unit",
    "test:unit:watch": "vitest --project unit",
    "test:integration": "vitest run --project integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Note:** If these scripts don't exist, Claude Code should ask before adding them.

### 7.3 Vitest Configuration

Create `vitest.workspace.ts` if needed:

```typescript
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'unit',
      include: ['tests/unit/**/*.test.ts'],
      environment: 'node',
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

### 7.4 CI/CD Pipeline

```yaml
# Tests run on every PR before merge
PR → Unit Tests → Integration Tests → Deploy Preview → E2E Tests → Review → Merge
```

### 7.5 TDD Approach

For each feature:

1. **Write test first** - Based on BLS action spec and RIS state machine
2. **Run test** - Should fail (red)
3. **Implement minimum code** - To make test pass
4. **Run test** - Should pass (green)
5. **Refactor** - Clean up while tests stay green
6. **Repeat** - For next test case

---

## 8. Code Standards

### 8.1 Error Handling

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
export async function someAction(input: Input): Promise<ActionResult<Output>> {
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

### 8.2 Commit Messages

Use conventional commits:

```
feat(auth): implement login page per AUTH-R01
fix(jobs): correct salary filter validation
test(auth): add login flow e2e tests
docs(readme): update setup instructions
refactor(components): extract JobCard to shared
```

### 8.3 PR Title Format

```
[{DOMAIN}-R{NN}] {Brief description}
```

Examples:
- `[AUTH-R01] Implement login page`
- `[JOB-R01] Add job search with filters`

---

## 9. Boundaries and Approvals

### 9.1 Claude Code Can Do Autonomously

- Create new files in `src/app/jobsmarket/` (except `/legal`, `/privacy`)
- Create new files in `tests/*/jobsmarket/`
- Create new namespaced components in `src/components/jobsmarket/`
- Extend existing domain services (add functions, don't modify existing)
- Run tests
- Create git commits
- Create PRs

### 9.2 Claude Code Must Ask First

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

### 9.3 Requires Plan Discussion

Before implementing any route:
1. Claude Code creates plan (Section 5.3 template)
2. Human reviews with Claude Chat (PM/SA role)
3. Human approves or requests changes
4. Only then does Claude Code implement

---

## 10. Quick Start Checklist

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
□ Write tests first (TDD)
□ Implement to pass tests
□ Verify all tests pass
□ Create PR with conventional commit
□ Wait for review
```

---

## 11. Reference Documents

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

## 12. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 3.1 | 2025-12-12 | Added URL-to-filesystem mapping (2.1.1), clarified doc locations (4.1), added critical gaps (6.1), clarified domain services convention (2.4.1), added test setup details (7.2, 7.3) |
| 3.0 | 2025-12-12 | Initial implementation phase instructions |

---

*Start with AUTH-R01 (`/auth/login`). Create the implementation plan and wait for approval before coding.*
