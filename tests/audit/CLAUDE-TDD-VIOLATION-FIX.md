# CLAUDE.md - TDD Violation Fix Workspace

## Purpose

Fix all TDD violations identified in the audit. Work systematically, commit after each category, and generate a report of all changes.

---

## Violation Summary (From Audit)

| Type | Count | Priority |
|------|-------|----------|
| Console.log leftovers | 140 | 🟢 Low effort |
| waitForTimeout | 206 | 🟡 Medium effort |
| Defensive skips | 32 | 🔴 High effort |
| Conditional test logic | 17 | 🔴 High effort |

**Total: 395 violations**

---

## Task 1: Remove Console.log (140 instances)

### Instructions

1. Find all `console.log` in test files
2. Remove them (they're debug leftovers)
3. Exception: Keep if it's part of a mock or intentional test output

### Command to Find

```bash
grep -rn "console\.log" tests/e2e/ tests/unit/ tests/integration/
```

### Action

Remove lines containing `console.log` unless they're:
- Inside a mock definition
- Testing console output behavior
- Part of error handling being tested

### Commit

```bash
git add -A
git commit -m "test: remove console.log debug leftovers (140 instances)"
```

---

## Task 2: Replace waitForTimeout (206 instances)

### Instructions

For each `waitForTimeout`, understand what the test is waiting for, then replace with explicit wait.

### Command to Find

```bash
grep -rn "waitForTimeout" tests/e2e/
```

### Replacement Patterns

| Current Pattern | Context Clue | Replace With |
|-----------------|--------------|--------------|
| `waitForTimeout(N)` then `expect(el).toBeVisible()` | Waiting for element | `await expect(el).toBeVisible({ timeout: 10000 })` |
| `waitForTimeout(N)` then `expect(el).toHaveText()` | Waiting for text | `await expect(el).toHaveText('...', { timeout: 10000 })` |
| `waitForTimeout(N)` after `click()` | Waiting for navigation | `await page.waitForLoadState('networkidle')` |
| `waitForTimeout(N)` after `goto()` | Page load | `await page.waitForLoadState('domcontentloaded')` |
| `waitForTimeout(N)` before API check | Waiting for API | `await page.waitForResponse(r => r.url().includes('/api/'))` |
| `waitForTimeout(N)` for animation | Visual transition | Usually can just remove - Playwright auto-waits |
| `waitForTimeout(N)` with no clear purpose | Unknown | Add comment `// TODO: investigate why wait needed` |

### Example Transformations

```typescript
// ❌ BEFORE
await page.click('[data-testid="submit"]');
await page.waitForTimeout(2000);
await expect(page.getByTestId('success')).toBeVisible();

// ✅ AFTER
await page.click('[data-testid="submit"]');
await expect(page.getByTestId('success')).toBeVisible({ timeout: 10000 });
```

```typescript
// ❌ BEFORE
await page.goto('/dashboard');
await page.waitForTimeout(3000);
const title = await page.textContent('h1');

// ✅ AFTER
await page.goto('/dashboard');
await page.waitForLoadState('networkidle');
const title = await page.textContent('h1');
```

```typescript
// ❌ BEFORE
await page.fill('[data-testid="search"]', 'test');
await page.waitForTimeout(500); // debounce
await expect(page.getByTestId('results')).toBeVisible();

// ✅ AFTER
await page.fill('[data-testid="search"]', 'test');
await expect(page.getByTestId('results')).toBeVisible({ timeout: 5000 });
```

### Work Order

Process files in this order (highest impact first):

1. `tests/e2e/jobsmarket/candidates/` - Most user-facing tests
2. `tests/e2e/jobsmarket/company/` - Business-critical flows
3. `tests/e2e/jobsmarket/auth/` - Authentication flows
4. `tests/e2e/jobsmarket/jobs/` - Public-facing
5. `tests/e2e/jobsmarket/chat/` - Real-time features
6. Remaining directories

### After Each File

Run the tests for that file to verify no regressions:

```bash
npx playwright test tests/e2e/jobsmarket/{path}/{file}.spec.ts
```

### Commit

```bash
git add -A
git commit -m "test: replace waitForTimeout with explicit waits (206 instances)"
```

---

## Task 3: Convert Defensive Skips (32 instances)

### Instructions

Convert `test.skip()` to either:
- `test.fail()` - for specs not implemented
- `test.todo()` - for tests not written
- Split into multiple tests - for conditional skips

### Command to Find

```bash
grep -rn "test\.skip\|it\.skip\|describe\.skip" tests/
```

### Conversion Rules

| Current | Convert To | When |
|---------|-----------|------|
| `test.skip('name', async () => {...})` | `test.fail('name - NOT IMPLEMENTED (RIS-ID)', async () => { throw new Error('...'); })` | Has test body, spec exists |
| `test.skip('name')` | `test.todo('name - see RIS-ID Section X')` | No test body |
| `if (cond) { test.skip() }` | Split into separate tests | Conditional skip |
| `test.skip(browserName === 'webkit', 'reason')` | Keep as-is | Platform limitation (OK) |

### Priority Files (From Audit)

Fix these first:

```
tests/e2e/jobsmarket/candidates/applications.spec.ts:150
tests/e2e/jobsmarket/candidates/applications.spec.ts:201
tests/e2e/jobsmarket/company/applications-filter.spec.ts:351
tests/e2e/jobsmarket/company/applications-filter.spec.ts:376
tests/e2e/jobsmarket/company/applications-filter.spec.ts:411
```

### Example: Splitting Conditional Skip

```typescript
// ❌ BEFORE: Conditional skip
test('shows empty state or list', async ({ page }) => {
  const count = await page.locator('[data-testid="item"]').count();
  if (count > 0) {
    test.skip(true, 'Has items - empty state not applicable');
    return;
  }
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

// ✅ AFTER: Two separate tests with controlled state
test('shows empty state when no items', async ({ page }) => {
  // Arrange: Create user with no items
  const user = await createTestUser({ items: [] });
  await loginAs(page, user);
  await page.goto('/items');
  
  // Assert
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

test('shows item list when items exist', async ({ page }) => {
  // Arrange: Create user with items
  const user = await createTestUser({ items: [mockItem] });
  await loginAs(page, user);
  await page.goto('/items');
  
  // Assert
  await expect(page.getByTestId('item-list')).toBeVisible();
});
```

### Example: Converting to test.fail

```typescript
// ❌ BEFORE
test.skip('validates company tax ID', async ({ page }) => {
  // TODO: implement validation
});

// ✅ AFTER
test.fail('validates company tax ID - NOT IMPLEMENTED (AUTH-R02 Section 10.3)', async () => {
  throw new Error('Company tax ID validation not yet implemented');
});
```

### Commit

```bash
git add -A
git commit -m "test: convert defensive skips to explicit failures (32 instances)"
```

---

## Task 4: Fix Conditional Test Logic (17 instances)

### Instructions

Tests should not have `if/else` logic that changes what gets tested. Each test should verify ONE specific behavior.

### Command to Find

```bash
grep -rn -B2 -A2 "if.*expect\|expect.*if" tests/
```

### Fix Pattern

Split conditional tests into separate, focused tests:

```typescript
// ❌ BEFORE: One test, multiple behaviors
test('handles form submission', async ({ page }) => {
  await page.click('[data-testid="submit"]');
  
  const error = page.getByTestId('error');
  if (await error.isVisible()) {
    await expect(error).toHaveText(/error/i);
  } else {
    await expect(page.getByTestId('success')).toBeVisible();
  }
});

// ✅ AFTER: Separate tests for each outcome
test('shows error on invalid submission', async ({ page }) => {
  // Arrange: Setup invalid state
  await page.fill('[data-testid="email"]', 'invalid');
  
  // Act
  await page.click('[data-testid="submit"]');
  
  // Assert
  await expect(page.getByTestId('error')).toBeVisible();
  await expect(page.getByTestId('error')).toHaveText(/error/i);
});

test('shows success on valid submission', async ({ page }) => {
  // Arrange: Setup valid state
  await page.fill('[data-testid="email"]', 'valid@example.com');
  
  // Act
  await page.click('[data-testid="submit"]');
  
  // Assert
  await expect(page.getByTestId('success')).toBeVisible();
});
```

### Commit

```bash
git add -A
git commit -m "test: remove conditional logic from tests (17 instances)"
```

---

## Task 5: Generate Fix Report

After all fixes, create a summary report:

### Report Template

Create `tests/audit/reports/TDD-VIOLATION-FIX-REPORT.md`:

```markdown
# TDD Violation Fix Report

**Date:** {date}
**Fixed By:** Claude Code

## Summary

| Violation Type | Found | Fixed | Remaining | Notes |
|----------------|-------|-------|-----------|-------|
| console.log | 140 | X | Y | {notes} |
| waitForTimeout | 206 | X | Y | {notes} |
| Defensive skips | 32 | X | Y | {notes} |
| Conditional logic | 17 | X | Y | {notes} |
| **TOTAL** | **395** | **X** | **Y** | |

## Detailed Changes

### Console.log Removals
- {list files changed}

### waitForTimeout Replacements
| File | Line | Before | After |
|------|------|--------|-------|
| ... | ... | ... | ... |

### Skip Conversions
| File | Before | After | Reason |
|------|--------|-------|--------|
| ... | `test.skip(...)` | `test.fail(...)` | Spec not implemented |

### Conditional Logic Splits
| Original Test | Split Into |
|---------------|------------|
| ... | test A, test B |

## Tests Run

```
{paste test run output showing pass/fail counts}
```

## Remaining Issues

{list any violations that couldn't be fixed and why}

## Recommendations

{any follow-up work needed}
```

### Commit

```bash
git add -A
git commit -m "docs: add TDD violation fix report"
```

---

## Work Order Summary

1. **Task 1:** Remove console.log (quick win, ~15 min)
2. **Task 2:** Replace waitForTimeout (bulk of work, ~2-3 hours)
3. **Task 3:** Convert defensive skips (~1 hour)
4. **Task 4:** Fix conditional logic (~30 min)
5. **Task 5:** Generate report (~15 min)

**Total estimated time: 4-5 hours**

---

## Verification

After all tasks, run full test suite:

```bash
npm run test:unit
npm run test:e2e
```

Expected outcome:
- No more `console.log` in test files
- No more `waitForTimeout` (or documented exceptions)
- All skips converted to `fail`, `todo`, or split tests
- No conditional assertions
- Test count may increase (due to splits)
- Some tests may now show as "failed (expected)" - this is correct

---

## Do NOT

- Modify source code (only test files)
- Delete tests without converting them
- Add new `waitForTimeout` to "fix" timing issues
- Skip tests to make them pass
- Change test assertions to match current (possibly wrong) behavior

---

## Start Here

Begin with Task 1 (console.log removal) as it's the quickest win. Then proceed sequentially.

Report progress after each task completion.
