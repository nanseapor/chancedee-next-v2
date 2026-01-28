# Skip-to-Fail Conversion Guide

## Philosophy

Test skips hide missing coverage. According to TDD principles:

> **A skipped test is a lie.** It says "we have coverage" when we don't.

Your request is correct: **All skipped tests should either be removed or fail explicitly** so the test suite honestly reports what specifications are not yet met.

---

## Conversion Strategy

### Option 1: Convert to `test.fail()` (Preferred)

Mark as expected failure with clear message:

```typescript
// ❌ BEFORE: Silent skip
test.skip('handles empty state', async () => {
  // ...
});

// ✅ AFTER: Explicit expected failure
test.fail('handles empty state - NOT IMPLEMENTED', async () => {
  throw new Error('Spec AUTH-R02.6.2: Empty state not implemented');
});
```

**Benefits:**
- Test runs and fails (visible in reports)
- Message explains which spec is missing
- CI can track "expected failures" separately
- Forces you to address it

### Option 2: Use `test.todo()` for Planned Tests

For tests that are planned but not written:

```typescript
// ❌ BEFORE: Empty skip
test.skip('validates company tax ID format');

// ✅ AFTER: Todo with spec reference
test.todo('validates company tax ID format - see AUTH-R02 Section 10.3');
```

**Benefits:**
- Shows in test report as "todo"
- Documents which specs need tests
- No false coverage claims

### Option 3: Remove If Redundant

If another test covers the same spec, just delete:

```typescript
// ❌ BEFORE: Duplicate test that was skipped
test.skip('shows error on invalid email', async () => {
  // Same as test on line 45
});

// ✅ AFTER: Delete it entirely
// (document why in commit message)
```

---

## Conversion Table

| Current Pattern | Convert To | When |
|-----------------|------------|------|
| `test.skip('...', async () => { ... })` | `test.fail('... - NOT IMPLEMENTED', ...)` | Spec exists, impl missing |
| `test.skip('...')` (no body) | `test.todo('... - see RIS X.Y')` | Test not written yet |
| `if (condition) test.skip()` | Split into 2 tests with controlled state | Conditional skip |
| `test.skip.each([...])` | `test.fail.each([...])` | Parameterized tests |
| Skipped due to flakiness | Fix the flakiness, then unskip | Don't hide flaky tests |

---

## Playwright-Specific Patterns

### Conditional Skips → Split Tests

```typescript
// ❌ BEFORE: Conditional skip
test('shows empty state or list', async ({ page }) => {
  const apps = await page.locator('[data-testid="app-card"]').count();
  if (apps > 0) {
    test.skip(true, 'Has applications - empty state not testable');
    return;
  }
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

// ✅ AFTER: Two explicit tests with controlled state
test('shows empty state when no applications', async ({ page }) => {
  // Use factory to create user with NO applications
  const user = await createTestCandidate({ applications: [] });
  await loginAs(page, user);
  await page.goto(`/candidates/${user.uid}/applications`);
  
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

test('shows application list when applications exist', async ({ page }) => {
  // Use factory to create user WITH applications
  const user = await createTestCandidate({ 
    applications: [mockApplication] 
  });
  await loginAs(page, user);
  await page.goto(`/candidates/${user.uid}/applications`);
  
  await expect(page.getByTestId('app-list')).toBeVisible();
});
```

### Browser-Conditional Skips → Keep But Document

```typescript
// ✅ OK to keep: Browser-specific limitation
test('handles file drag-drop', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit does not support synthetic drag events');
  // ...
});
```

This is acceptable because it's a **known platform limitation**, not missing implementation.

---

## Vitest-Specific Patterns

### Skip → Fail

```typescript
// ❌ BEFORE
it.skip('validates OTP expiry', () => {
  // TODO: implement
});

// ✅ AFTER
it.fails('validates OTP expiry - NOT IMPLEMENTED (AUTH-R02.5.5)', () => {
  throw new Error('OTP expiry validation not implemented');
});
```

### Skip → Todo

```typescript
// ❌ BEFORE
describe.skip('Company Mode B', () => {
  it('searches approved companies');
  it('selects company from dropdown');
});

// ✅ AFTER
describe('Company Mode B', () => {
  it.todo('searches approved companies - AUTH-R02 Section 4.1');
  it.todo('selects company from dropdown - AUTH-R02 Section 7.3');
});
```

---

## Bulk Conversion Script

```bash
#!/bin/bash
# convert-skips-to-fails.sh
# Run from tests/audit/

echo "Converting test.skip to test.fail..."

# Find all test.skip patterns
grep -rln --include="*.ts" --include="*.tsx" "test\.skip\|it\.skip\|describe\.skip" ../e2e/ ../unit/ ../integration/ 2>/dev/null | while read file; do
  echo "Processing: $file"
  
  # Convert test.skip('name', ...) to test.fail('name - NOT IMPLEMENTED', ...)
  sed -i "s/test\.skip('\([^']*\)'/test.fail('\1 - NOT IMPLEMENTED'/g" "$file"
  
  # Convert it.skip to it.fails
  sed -i "s/it\.skip('\([^']*\)'/it.fails('\1 - NOT IMPLEMENTED'/g" "$file"
  
  # Note: describe.skip needs manual review (can't auto-convert)
done

echo "Done! Review changes with: git diff"
```

---

## Expected Test Output After Conversion

### Before (Misleading)

```
✓ 45 tests passed
○ 12 tests skipped    ← Looks like we chose to skip them
```

### After (Honest)

```
✓ 45 tests passed
✗ 8 tests failed (expected)  ← Clearly shows missing implementations
○ 4 tests todo              ← Tests not written yet
```

---

## CI Configuration

Update CI to distinguish expected failures:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm test
  continue-on-error: false  # Still fail CI on unexpected failures

- name: Report expected failures
  run: |
    # Count expected failures (test.fail)
    EXPECTED=$(grep -r "test.fail\|it.fails" tests/ | wc -l)
    echo "Expected failures (NOT IMPLEMENTED): $EXPECTED"
    
    # Count todos
    TODOS=$(grep -r "test.todo\|it.todo" tests/ | wc -l)
    echo "Test todos: $TODOS"
```

---

## Files to Convert (From Audit)

Based on the TDD audit, these files have defensive skips:

| File | Line | Current Pattern | Action |
|------|------|-----------------|--------|
| `e2e/jobsmarket/candidates/applications.spec.ts` | 150 | `if...test.skip()` | Split into 2 tests |
| `e2e/jobsmarket/candidates/applications.spec.ts` | 201 | `if...test.skip()` | Split into 2 tests |
| `e2e/jobsmarket/company/applications-filter.spec.ts` | 351 | `if...test.skip()` | Split into 2 tests |
| `e2e/jobsmarket/company/applications-filter.spec.ts` | 376 | `if...test.skip()` | Split into 2 tests |
| `e2e/jobsmarket/company/applications-filter.spec.ts` | 411 | `if...test.skip()` | Split into 2 tests |
| ... | ... | ... | ... |

(Full list in `TDD-VIOLATION-FIX-LIST.md`)

---

## Claude Code Task

Give Claude Code this prompt:

```
Read tests/audit/SKIP-TO-FAIL-GUIDE.md

Task: Convert defensive skips to explicit failures

1. Start with applications.spec.ts:150,201
2. For each conditional skip:
   - Analyze what state it's checking
   - Create a factory that produces that exact state
   - Split into 2 tests (one for each state)
   - Remove all conditional logic
3. Run tests to verify both scenarios now execute

Acceptance criteria:
- No `if...test.skip()` patterns remain
- All tests either pass, fail explicitly, or are marked todo
- Each test controls its own preconditions via factories
```

---

## Summary

| Skip Type | Convert To | Result |
|-----------|------------|--------|
| Missing implementation | `test.fail('... - NOT IMPLEMENTED')` | Fails with clear message |
| Test not written | `test.todo('... - see RIS X.Y')` | Shows as todo |
| Conditional skip | Split into separate tests | Full coverage |
| Redundant test | Delete | Clean codebase |
| Platform limitation | Keep skip with reason | Documented exception |

**Goal:** The test suite should honestly report what works and what doesn't. No silent skips.
