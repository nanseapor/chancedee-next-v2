# TDD Violation Fix List

**Generated:** 2026-01-18
**Last Scan:** 2026-01-18
**Source:** TDD-AUDIT-REPORT-2026-01-18.md
**Purpose:** Identify and fix anti-patterns that violate TDD principles

---

## Executive Summary

| Violation Type | Count | Severity | Fix Effort | Status |
|----------------|-------|----------|------------|--------|
| Defensive Test Skipping | 32 | 🔴 High | Medium | ⚠️ Pending |
| Implicit Waits (`waitForTimeout`) | 206 | 🟡 Medium | High | ⚠️ Pending |
| Missing Coverage Thresholds | 0 | 🟡 Medium | Low | ✅ **FIXED** |
| Conditional Test Logic | 17 | 🔴 High | Medium | ⚠️ Pending |
| Console.log Debug Leftovers | 140 | 🟢 Low | Low | ⚠️ Pending |

**Total Violations:** 395

---

## ✅ FIXED: Coverage Configuration

**File:** `vitest.config.ts`

Coverage thresholds have been added:

```typescript
thresholds: {
  statements: 90,
  branches: 85,
  functions: 90,
  lines: 90,
}
```

---

## Violation Type 1: Defensive Test Skipping

### What It Is

Tests that skip themselves when preconditions aren't met, instead of failing or controlling their own state.

```typescript
// ❌ VIOLATION: Test skips instead of failing
if (isVisible) {
  // test something
} else {
  test.skip(true, "Applications exist in test data - empty state not applicable");
}
```

### Why It's Wrong

1. **Hides failures** - If the empty state should be testable but isn't, that's a bug
2. **Non-deterministic** - Test behavior depends on external state
3. **Violates TDD** - Tests should define expected behavior, not adapt to whatever exists
4. **Masks regressions** - A change that breaks empty state won't be caught

### Known Violations (32 found)

#### 🔴 High Priority - Conditional Runtime Skips

| File | Line | Pattern | Fix Required |
|------|------|---------|--------------|
| `e2e/jobsmarket/company/applications.spec.ts` | 150 | `test.skip(true, "Applications exist in test data - empty state not applicable")` | Split into 2 tests with controlled state |
| `e2e/jobsmarket/company/applications.spec.ts` | 201 | `test.skip(true, "Dashboard metrics card not found")` | Ensure metrics card exists or fix component |
| `e2e/jobsmarket/company/applications-filter.spec.ts` | 351 | `test.skip(true, "Filter panel not hidden on mobile")` | Fix mobile viewport detection |
| `e2e/jobsmarket/company/applications-filter.spec.ts` | 376 | `test.skip(true, "Could not find mobile filter button")` | Add data-testid to filter button |
| `e2e/jobsmarket/company/applications-filter.spec.ts` | 411 | `test.skip(true, "Could not open filter sheet")` | Fix sheet opening logic |
| `e2e/jobsmarket/debug-auth.spec.ts` | 72 | `test.skip(!email \|\| !password, "Credentials not configured")` | Use environment variables properly |

#### 🟡 Medium Priority - TODO Placeholders (Acceptable)

| File | Line | Pattern | Status |
|------|------|---------|--------|
| `e2e/jobsmarket/company/job-detail.spec.ts` | 197 | `test.skip('should publish draft job')` | Placeholder - needs implementation |
| `e2e/jobsmarket/company/job-detail.spec.ts` | 200 | `test.skip('should unpublish published job')` | Placeholder - needs implementation |
| `e2e/jobsmarket/company/job-detail.spec.ts` | 203 | `test.skip('should close job')` | Placeholder - needs implementation |
| `e2e/jobsmarket/company/job-wizard.spec.ts` | 124 | `test.skip("should resume editing existing draft")` | Placeholder - needs implementation |
| `e2e/jobsmarket/company/job-wizard.spec.ts` | 127 | `test.skip("should duplicate existing job")` | Placeholder - needs implementation |
| `e2e/jobsmarket/auth/reset.spec.ts` | 147 | `test.skip("should disable back button during submission")` | Placeholder - needs implementation |

#### 🟡 Medium Priority - Feature Not Implemented

| File | Line | Pattern | Status |
|------|------|---------|--------|
| `e2e/jobsmarket/chat/chat-list.spec.ts` | 164 | `test.skip("should be accessible via bottom navigation")` | Feature not yet built |
| `e2e/jobsmarket/chat/chat-list.spec.ts` | 305 | `test.skip("should show error state on network failure")` | Error simulation not available |
| `e2e/jobsmarket/chat/chat-list.spec.ts` | 331 | `test.skip("should have retry button on error")` | Error simulation not available |
| `e2e/jobsmarket/company/team.spec.ts` | 451 | `test.skip("should not show invite tab for non-admin")` | Needs non-admin test user |
| `e2e/jobsmarket/company/team.spec.ts` | 459 | `test.skip("should not show action menus for non-admin")` | Needs non-admin test user |
| `e2e/jobsmarket/company/team.spec.ts` | 467 | `test.skip("should not show accept/reject buttons for non-admin")` | Needs non-admin test user |
| `e2e/jobsmarket/company/applications-accept.spec.ts` | 573 | `test.skip("should show error toast when accept fails")` | Error simulation not available |
| `e2e/jobsmarket/company/applications-accept.spec.ts` | 577 | `test.skip("should re-enable button when accept fails")` | Error simulation not available |

---

## Violation Type 2: Implicit Waits

### What It Is

Using `waitForTimeout()` (fixed time delays) instead of explicit condition waits.

```typescript
// ❌ VIOLATION: Arbitrary wait time
await page.waitForTimeout(2000);
await expect(page.getByTestId('result')).toBeVisible();
```

### Why It's Wrong

1. **Flaky tests** - 2 seconds may not be enough on slow CI, or too long locally
2. **Slow tests** - Always waits full duration even when ready sooner
3. **Hides timing bugs** - Real users don't wait arbitrary times

### Known Violations (206 found)

#### 🔴 High Priority - Long Waits (>1s)

| File | Line | Wait Time | Fix |
|------|------|-----------|-----|
| `e2e/debug-work-exp-drawer.spec.ts` | 33 | 2000ms | Replace with element visibility check |
| `e2e/jobsmarket/chat/chat-room.spec.ts` | 124 | 2000ms | Wait for message list to load |
| `e2e/jobsmarket/chat/chat-list.spec.ts` | 297 | 2000ms | Wait for list items visible |
| `e2e/jobsmarket/chat/chat-list.spec.ts` | 344 | 5000ms | **Critical** - wait for specific condition |
| `e2e/jobsmarket/companies/directory.spec.ts` | 376 | 2000ms | Wait for filter results |

#### 🟡 Medium Priority - Short Waits (500ms-1s)

| File | Lines | Count | Fix |
|------|-------|-------|-----|
| `e2e/jobsmarket/company/applications.spec.ts` | 75, 94, 160, 180, 224 | 5 | Replace with explicit waits |
| `e2e/jobsmarket/company/job-detail.spec.ts` | 232, 246, 262, 278, 297 | 5 | Wait for edit mode state |
| `e2e/jobsmarket/company/jobs-list.spec.ts` | 78, multiple | 3+ | Wait for table rows |
| `e2e/jobsmarket/companies/directory.spec.ts` | 138, 166, 205, 303, 341, 408 | 6 | Wait for filter updates |
| `e2e/jobsmarket/chat/chat-list.spec.ts` | 119 | 1 | Wait for debounce (use `waitForFunction`) |

### Correct Pattern

```typescript
// ✅ CORRECT: Wait for specific condition
await expect(page.getByTestId('result')).toBeVisible({ timeout: 10000 });

// ✅ CORRECT: Wait for network response
await page.waitForResponse(resp => resp.url().includes('/api/data'));

// ✅ CORRECT: Wait for debounce
await page.waitForFunction(() => !document.querySelector('.loading'));
```

---

## Violation Type 3: Conditional Test Logic

### What It Is

Tests with branching logic that tests different things based on runtime conditions.

### Known Violations (17 found)

| File | Line | Pattern | Fix |
|------|------|---------|-----|
| `e2e/jobsmarket/notifications/notifications.spec.ts` | 206 | `if (notifications.interview.length > 0)` | Create test with controlled data |
| `e2e/jobsmarket/notifications/notifications.spec.ts` | 210 | `if (notifications.offer.length > 0)` | Create test with controlled data |
| `e2e/jobsmarket/notifications/notifications.spec.ts` | 214 | `if (notifications.system.length > 0)` | Create test with controlled data |
| `e2e/jobsmarket/notifications/notifications.spec.ts` | 235 | `if (notifications.interview.length > 0)` | Split into separate test |
| `e2e/jobsmarket/notifications/notifications.spec.ts` | 241 | `if (notifications.offer.length > 0)` | Split into separate test |
| `e2e/jobsmarket/notifications/notifications.spec.ts` | 245 | `if (notifications.system.length > 0)` | Split into separate test |
| `e2e/jobsmarket/notifications/notifications.spec.ts` | 266 | `if (notifications.offer.length > 0)` | Split into separate test |
| `e2e/jobsmarket/notifications/notifications.spec.ts` | 272 | `if (notifications.interview.length > 0)` | Split into separate test |
| `e2e/jobsmarket/notifications/notifications.spec.ts` | 293 | `if (notifications.system.length > 0)` | Split into separate test |
| `e2e/jobsmarket/notifications/notifications.spec.ts` | 299 | `if (notifications.interview.length > 0)` | Split into separate test |
| `e2e/jobsmarket/notifications/notifications.spec.ts` | 539 | `if (notifications.interview.length > 0)` | Split into separate test |
| `e2e/jobsmarket/notifications/notifications.spec.ts` | 579 | `if (notifications.interview.length > 0)` | Split into separate test |

### Recommended Fix

Refactor `notifications.spec.ts` to use explicit test scenarios:

```typescript
// ❌ WRONG: One test with many conditionals
test('shows notifications', async () => {
  if (notifications.interview.length > 0) { ... }
  if (notifications.offer.length > 0) { ... }
});

// ✅ CORRECT: Separate tests with controlled data
test('shows interview notifications when they exist', async () => {
  const scenario = await createNotificationScenario({
    interview: [mockInterview]
  });
  // Assert interview notifications visible
});

test('shows offer notifications when they exist', async () => {
  const scenario = await createNotificationScenario({
    offer: [mockOffer]
  });
  // Assert offer notifications visible
});
```

---

## Violation Type 4: Console.log Debug Leftovers

### What It Is

Debug statements left in test files that should be removed.

### Known Violations (140 found)

| File | Line Count | Status |
|------|------------|--------|
| `e2e/debug-drawer-click.spec.ts` | 10 | Debug file - can delete |
| `e2e/debug-work-exp-drawer.spec.ts` | 7 | Debug file - can delete |
| `e2e/debug-profile-edit.spec.ts` | 4 | Debug file - can delete |
| `e2e/debug-single.spec.ts` | Multiple | Debug file - can delete |
| `e2e/helpers/factories/*.ts` | ~50 | Development logging - remove |
| `e2e/jobsmarket/admin/*.spec.ts` | ~30 | Debug logging - remove |

### Fix

```bash
# Remove debug test files
rm tests/e2e/debug-*.spec.ts

# Remove console.log from test files
# Manual review required - some may be intentional
```

---

## Fix Priority

### Phase 1: High Impact (This Sprint) ✅ PARTIALLY COMPLETE

| # | Violation | File | Effort | Status |
|---|-----------|------|--------|--------|
| 1 | Coverage config | `vitest.config.ts` | 1 hour | ✅ **FIXED** |
| 2 | Defensive skip | `applications.spec.ts:150` | 2 hours | ⚠️ Pending |
| 3 | Defensive skip | `applications.spec.ts:201` | 1 hour | ⚠️ Pending |
| 4 | Defensive skip | `applications-filter.spec.ts:351,376,411` | 2 hours | ⚠️ Pending |

### Phase 2: Medium Impact (Next Sprint)

| # | Violation | Scope | Effort |
|---|-----------|-------|--------|
| 5 | `waitForTimeout` | `notifications.spec.ts` | 2 hours |
| 6 | Conditional logic | `notifications.spec.ts` (12 violations) | 4 hours |
| 7 | `waitForTimeout` | `chat-list.spec.ts` | 2 hours |
| 8 | `waitForTimeout` | `directory.spec.ts` | 2 hours |

### Phase 3: Low Priority (Future)

| # | Violation | Scope | Effort |
|---|-----------|-------|--------|
| 9 | Remove debug files | `debug-*.spec.ts` | 30 min |
| 10 | Remove console.log | All test files | 2 hours |
| 11 | Remaining `waitForTimeout` | ~180 instances | 8+ hours |

---

## Automated Prevention

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/bash

# Check for waitForTimeout in E2E tests
if grep -r "waitForTimeout" tests/e2e/ --include="*.spec.ts" | grep -v "node_modules"; then
  echo "❌ ERROR: waitForTimeout found in E2E tests"
  echo "Use explicit waits instead: await expect(element).toBeVisible()"
  exit 1
fi

# Check for console.log in tests
if grep -r "console.log" tests/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"; then
  echo "⚠️ WARNING: console.log found in tests"
fi
```

### ESLint Rules

Add to `.eslintrc.js`:

```javascript
rules: {
  // Disallow waitForTimeout in tests
  'no-restricted-syntax': [
    'error',
    {
      selector: "CallExpression[callee.property.name='waitForTimeout']",
      message: 'Avoid waitForTimeout. Use explicit element waits instead.'
    }
  ],
  // Warn on console.log in test files
  'no-console': ['warn', { allow: ['warn', 'error'] }]
}
```

---

## Success Criteria

After fixes are complete:

- [x] `vitest.config.ts` has coverage thresholds (90%)
- [ ] `grep -r "test.skip.*true" tests/e2e/` returns only legitimate skips
- [ ] `grep -r "waitForTimeout" tests/e2e/` returns 0 results
- [ ] `notifications.spec.ts` has no conditional assertions
- [ ] All debug files removed
- [ ] Pre-commit hook prevents new violations

---

## Commands to Run Violation Scan

```bash
cd tests/audit
./find-violations.sh
```

---

**Document Version:** 2.0 (Updated with scan results)
**Next Review:** After Phase 1 fixes complete
