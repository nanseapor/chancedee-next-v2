# Route Task Tracker Template

**Instructions:** Copy this template for each new route. Replace `{PLACEHOLDERS}` with actual values. Delete sections marked `[CONDITIONAL]` if not applicable.

---

# {DOMAIN}-R{NN}: {Route Name} - Task Tracker

**Route:** `/{route/path}`  
**Started:** {YYYY-MM-DD}  
**Status:** ⏳ Not Started | 🔄 In Progress | ✅ Complete  
**Branch:** `feat/{domain}-r{nn}-{short-name}`  
**RIS:** `{DOMAIN}-R{NN}_{name}_RIS.md`  
**Complexity:** Low | Medium | High

---

## Progress Overview

| Phase | Status | Tasks | Notes |
|-------|--------|-------|-------|
| Phase 1: Foundation | ⏳ Pending | 0/? | Auth, hooks, utilities |
| Phase 2: Shell | ⏳ Pending | 0/? | [CONDITIONAL: First route only] |
| Phase 3: Components | ⏳ Pending | 0/? | UI components |
| Phase 4: Quality Gates | ⏳ Pending | 0/4 | Build, lint, dev, types |
| Phase 5: Tests | ⏳ Pending | 0/3 | Unit, integration, E2E |

**Overall:** 0/? tasks complete

---

## Phase 1: Foundation ⏳

Core hooks, utilities, and server actions needed before UI work.

| Task | File | Status | Notes |
|------|------|--------|-------|
| 1.1 {Description} | `{file-path}` | ⏳ Pending | |
| 1.2 {Description} | `{file-path}` | ⏳ Pending | |

**Acceptance Criteria:**
- [ ] All hooks compile without errors
- [ ] Server actions return expected data shapes

---

## Phase 2: Shell [CONDITIONAL - Delete if reusing existing shell]

> **Note:** Only include this phase for the FIRST route in a domain that creates the shell.
> If reusing an existing shell, delete this section and note: "Shell: Reuses {ShellName} from {DOMAIN}-R{NN}"

| Task | File | Status | Notes |
|------|------|--------|-------|
| 2.1 Main Shell | `src/components/jobsmarket/shells/{Name}Shell.tsx` | ⏳ Pending | |
| 2.2 Sidebar | `src/components/jobsmarket/shells/{Name}Sidebar.tsx` | ⏳ Pending | |
| 2.3 Header | `src/components/jobsmarket/shells/{Name}Header.tsx` | ⏳ Pending | [If different from global] |

**Acceptance Criteria:**
- [ ] Shell renders with sidebar navigation
- [ ] Active route highlighted in sidebar
- [ ] Responsive (mobile menu works)

---

## Phase 3: Components 🔄

### Batch 3A: Core Structure (Do First)

| Task | File | Status | Acceptance Criteria |
|------|------|--------|---------------------|
| 3.1 Page wrapper | `src/app/jobsmarket/{path}/page.tsx` | ⏳ Pending | Server component, metadata |
| 3.2 Main client | `src/app/jobsmarket/{path}/_components/{Name}Client.tsx` | ⏳ Pending | State management, layout |

**Gate Check After 3A:**
- [ ] `npm run build` passes
- [ ] `npm run dev` → route loads at `/jobsmarket/{path}`
- [ ] Auth redirects work (if protected route)

### Batch 3B: {Section Name}

| Task | File | Status | Acceptance Criteria |
|------|------|--------|---------------------|
| 3.3 {Component} | `_components/{Name}.tsx` | ⏳ Pending | {criteria} |
| 3.4 {Component} | `_components/{Name}.tsx` | ⏳ Pending | {criteria} |

**Gate Check After 3B:**
- [ ] {Specific check}
- [ ] {Specific check}

### Batch 3C: {Section Name} [Add more batches as needed]

| Task | File | Status | Acceptance Criteria |
|------|------|--------|---------------------|
| 3.X {Component} | `_components/{Name}.tsx` | ⏳ Pending | {criteria} |

---

## Phase 4: Quality Gates ⏳

| Gate | Command | Status | Notes |
|------|---------|--------|-------|
| 4.1 Build | `npm run build` | ⏳ Pending | Must exit 0 |
| 4.2 Lint | `npm run lint` | ⏳ Pending | No new errors |
| 4.3 Dev Server | `npm run dev` | ⏳ Pending | Route loads without errors |
| 4.4 Type Check | `npx tsc --noEmit` | ⏳ Pending | No type errors |

---

## Phase 5: Tests ⏳

### Test Coverage Targets

| Category | Target | Actual | Status |
|----------|--------|--------|--------|
| Business Logic | ≥ 90% | TBD | ⏳ |
| Utilities | ≥ 80% | TBD | ⏳ |
| Branch Coverage | ≥ 70% | TBD | ⏳ |

### Batch 5A: Unit Tests

| Test File | Covers | Est. Tests | Status |
|-----------|--------|------------|--------|
| `tests/unit/jobsmarket/{domain}/{route}/{name}.test.ts` | {what it tests} | ~X | ⏳ Pending |

### Batch 5B: Integration Tests

| Test File | Covers | Est. Tests | Status |
|-----------|--------|------------|--------|
| `tests/integration/jobsmarket/{domain}/{route}/{name}.test.tsx` | {what it tests} | ~X | ⏳ Pending |

### Batch 5C: E2E Tests

| Test Case | Status |
|-----------|--------|
| {User journey description} | ⏳ Pending |
| {User journey description} | ⏳ Pending |

**E2E Test File:** `tests/e2e/jobsmarket/{domain}/{route}.spec.ts`

---

## Files Checklist

```
Foundation:
⏳ src/hooks/jobsmarket/{hook-name}.ts
⏳ src/lib/utils/{util-name}.ts

Shell: [CONDITIONAL]
⏳ src/components/jobsmarket/shells/{Name}Shell.tsx
⏳ src/components/jobsmarket/shells/{Name}Sidebar.tsx

Route:
⏳ src/app/jobsmarket/{path}/page.tsx
⏳ src/app/jobsmarket/{path}/_components/{Name}Client.tsx
⏳ src/app/jobsmarket/{path}/_components/{Component}.tsx

Tests:
⏳ tests/unit/jobsmarket/{domain}/{route}/*.test.ts
⏳ tests/integration/jobsmarket/{domain}/{route}/*.test.tsx
⏳ tests/e2e/jobsmarket/{domain}/{route}.spec.ts
```

---

## Dependencies

| Type | Route/Component | Status |
|------|-----------------|--------|
| **Requires** | {What must be done first} | ✅ Done / ⏳ Pending |
| **Blocks** | {What depends on this route} | - |
| **Shell** | {Creates new / Reuses existing} | - |

---

## Session Handoff Notes

**For Claude Code starting a new session:**

1. Read this tracker to understand current state
2. Check the "Current Next Task" below
3. Run gate checks after completing each batch
4. Update this tracker with progress before ending session

**Current Next Task:** {Batch ID} - {Description}

**Last Session Summary:**
> {Brief notes about what was completed, any issues encountered}

---

## Blockers & Issues

| Issue | Status | Resolution |
|-------|--------|------------|
| {Description} | 🔴 Blocking / 🟡 Minor | {How to resolve} |

---

## Notes & Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| {YYYY-MM-DD} | {What was decided} | {Why} |

---

*Last Updated: {YYYY-MM-DD}*
