# CLAUDE.md - Test Coverage Audit Workspace

## Purpose

This workspace is for **auditing test coverage** against RIS and BLS specifications.

**You are NOT implementing features here.** You are:
1. Reading RIS/BLS documents to extract testable specifications
2. Checking if corresponding tests exist
3. Verifying tests cover the specifications
4. Reporting gaps and recommending priorities

---

## Quick Start

```bash
# Your current location
pwd  # Should be: /path/to/chancedee-next-v2/tests/audit

# Key paths (relative to repo root)
DOCS_PATH="../../docs/jobsmarket"
TESTS_PATH=".."
```

---

## Document Locations

| Document Type | Path | Example |
|---------------|------|---------|
| RIS Documents | `../../docs/jobsmarket/RIS/` | `AUTH-R01_login_RIS.md` |
| BLS Documents | `../../docs/jobsmarket/BLS/` | `BLS-01_onboarding.md` |
| E2E Tests | `../e2e/jobsmarket/` | `auth/login.spec.ts` |
| Unit Tests | `../unit/jobsmarket/` | `auth/reset/*.test.ts` |
| Integration Tests | `../integration/jobsmarket/` | `auth/settings/*.test.ts` |

---

## RIS-to-Test Mapping

Tests are organized by **domain/feature**, not by RIS ID. Use this mapping:

### Authentication (AUTH-R*)

| RIS | Route | Test Location |
|-----|-------|---------------|
| AUTH-R00 | Cross-cutting | Middleware, auth helpers |
| AUTH-R01 | `/auth/login` | `auth/login.spec.ts` |
| AUTH-R02 | `/auth/register` | `auth/register/` ❌ MISSING |
| AUTH-R03 | `/auth/verify` | `auth/verify/` |
| AUTH-R04 | `/auth/reset` | `auth/reset/` |
| AUTH-R05 | `/auth/status` | `auth/status/` |
| AUTH-R06 | `/auth/settings` | `auth/settings/` |
| AUTH-R07 | `/auth/select-role` | `auth/select-role/` |
| AUTH-R08 | `/auth/session-expired` | `auth/session-expired.spec.ts` |

### Candidates (CAND-R*)

| RIS | Route | Test Location |
|-----|-------|---------------|
| CAND-R00 | Cross-cutting | `candidates/dashboard/use-candidate-auth.test.ts` |
| CAND-R01 | `/candidates/[id]/dashboard` | `candidates/dashboard/` |
| CAND-R02 | `/candidates/[id]/profile` | `candidates/profile/` |
| CAND-R03 | `/candidates/[id]/settings` | `candidates/settings/` |
| CAND-R04 | `/candidates/[id]/applications` | `candidates/applications/` |
| CAND-R05 | `/candidates/[id]/saved` | `candidates/saved/` |

### Companies (COMP-R*)

| RIS | Route | Test Location |
|-----|-------|---------------|
| COMP-R00 | Cross-cutting | `company/permission-matrix.test.ts`, `use-company-permission.test.ts` |
| COMP-R01 | `/companies/[id]/pending` | `company/pending/` |
| COMP-R02 | `/companies/[id]/team` | `company/team/` |
| COMP-R03 | `/companies/[id]/settings` | `company/settings/` |
| COMP-R04 | `/companies/[id]/dashboard` | `company/dashboard/` |
| COMP-R05 | `/companies/[id]/jobs` | `company/jobs-list/` |
| COMP-R06 | `/companies/[id]/jobs/new` | `company/job-wizard/` |
| COMP-R07 | `/companies/[id]/jobs/[jobId]` | `company/job-detail/` |
| COMP-R08 | `/companies/[id]/applications` | `company/applications/` |

### Jobs (JOB-R*)

| RIS | Route | Test Location |
|-----|-------|---------------|
| JOB-R00 | Cross-cutting | `jobs/public-jobs-actions.test.ts` |
| JOB-R01 | `/jobs` | `jobs/job-search.spec.ts` |
| JOB-R02 | `/jobs/[id]` | `jobs/job-detail/` |
| JOB-R02b | Apply Modal | `jobs/apply-modal/`, `jobs/applications/` |

### Chat (CHAT-R*)

| RIS | Route | Test Location |
|-----|-------|---------------|
| CHAT-R00 | Cross-cutting | `chat/hooks/` |
| CHAT-R01 | `/chat` | `chat/chat-list.spec.ts` |
| CHAT-R02 | `/chat/[roomId]` | `chat/chat-room.spec.ts`, `chat/components/`, `chat/actions/` |

### Notifications (NOTIF-R*)

| RIS | Route | Test Location |
|-----|-------|---------------|
| NOTIF-R00 | Cross-cutting | `notifications/use-notifications.test.ts` |
| NOTIF-R01 | `/notifications` | `notifications/` |

### Wallet (WALLET-R*)

| RIS | Route | Test Location |
|-----|-------|---------------|
| WALLET-R01 | `/wallet` | `wallet/` |

### Admin (ADM-R*)

| RIS | Route | Test Location |
|-----|-------|---------------|
| ADM-R00 | Cross-cutting | `admin/hooks/use-admin-auth.test.ts` |
| ADM-R01 | `/platform/dashboard` | ❌ MISSING |
| ADM-R02 | `/platform/companies` | `admin/companies-list.spec.ts`, `admin/company-*.spec.ts` |
| ADM-R03-R10 | Various | ❌ MISSING |

---

## BLS-to-RIS Mapping

| BLS | Covers Actions For | Related RIS |
|-----|-------------------|-------------|
| BLS-00 | Cross-cutting (auth, guards) | All *-R00 documents |
| BLS-01 | Onboarding (login, register, password) | AUTH-R01 through AUTH-R07 |
| BLS-02 | Discovery (job search, save) | JOB-R01, JOB-R02, CAND-R05 |
| BLS-03 | Application (apply, withdraw) | JOB-R02b, CAND-R04, COMP-R08 |
| BLS-04 | Screening | COMP-R08 |
| BLS-05 | Interview | COMP-R08, Interview features |
| BLS-06 | Communication (chat) | CHAT-R01, CHAT-R02 |
| BLS-07 | Job Management | COMP-R05, COMP-R06, COMP-R07 |
| BLS-08 | Candidate Profile | CAND-R02, CAND-R03 |
| BLS-09 | Company Profile | COMP-R02, COMP-R03 |
| BLS-10 | Wallet | WALLET-R01 |
| BLS-11 | Notifications | NOTIF-R01 |
| BLS-12 | Admin | ADM-R01 through ADM-R10 |

---

## Audit Workflow

### Step 1: Select RIS to Audit

```bash
# Check current known gaps
cat test-gap-analysis.md
```

Priority order:
1. 🔴 AUTH-R02 (Register) - No tests, most complex
2. 🔴 ADM-R01, R03-R10 - No tests
3. 🟡 Routes with partial coverage

### Step 2: Read RIS Document

```bash
# Example for AUTH-R01
cat ../../docs/jobsmarket/RIS/AUTH-R01_login_RIS.md
```

Extract testable specifications from these sections:
- **Section 4: Data Contract** → Test data operations
- **Section 6: Page States** → Test state transitions
- **Section 9: Navigation/Routing** → Test routing decisions
- **Section 10: Error Handling** → Test error states
- **Appendix B: Server Actions** → Test each action

### Step 3: Read Related BLS

```bash
# Find related BLS from mapping above
cat ../../docs/jobsmarket/BLS/BLS-01_onboarding.md
```

Extract from BLS:
- **Action specifications** → Input validation, business rules
- **Actor-Action Matrix** → Permission tests
- **Error codes** → Error handling tests

### Step 4: Find Existing Tests

```bash
# For AUTH-R01 (login)
find ../e2e/jobsmarket/auth -name "*login*"
find ../unit/jobsmarket/auth -name "*login*" -o -name "*auth*"
find ../integration/jobsmarket/auth -name "*login*"
```

### Step 5: Generate Coverage Report

Use this template for each RIS:

```markdown
# Coverage Report: {RIS_ID}

**RIS Document:** {filename}
**Related BLS:** {list}
**Route:** {route path}

## Testable Specifications

### Section 4: Data Contract
| Specification | Test Type | Test File | Status |
|---------------|-----------|-----------|--------|
| Read user_accounts after auth | Integration | `...` | ✅/❌ |
| Write session cookie | Integration | `...` | ✅/❌ |

### Section 6: Page States
| State | Test Type | Test File | Status |
|-------|-----------|-----------|--------|
| Initial (form visible) | Unit | `...` | ✅/❌ |
| Loading | Unit | `...` | ✅/❌ |
| Error | Unit | `...` | ✅/❌ |

### Section 9: Routing
| Condition | Expected Route | Test File | Status |
|-----------|----------------|-----------|--------|
| Has redirect param | Validate & redirect | `...` | ✅/❌ |
| Multi-role user | /auth/select-role | `...` | ✅/❌ |

### Section 10: Error Handling
| Error Code | Test File | Status |
|------------|-----------|--------|
| INVALID_CREDENTIALS | `...` | ✅/❌ |
| ACCOUNT_NOT_FOUND | `...` | ✅/❌ |
| TOO_MANY_REQUESTS | `...` | ✅/❌ |

### Appendix B: Server Actions
| Action | Test Type | Test File | Status |
|--------|-----------|-----------|--------|
| login(idToken) | Integration | `...` | ✅/❌ |
| UserAccountGet(idToken) | Integration | `...` | ✅/❌ |

## Summary
- Total Specifications: X
- Covered: Y (Z%)
- Missing: W

## Recommended Test Files to Create
1. `../unit/jobsmarket/auth/login/form-validation.test.ts`
2. `../integration/jobsmarket/auth/login/session-creation.test.ts`
```

---

## Output Files

Save audit results to this directory:

```
tests/audit/
├── CLAUDE.md                    # This file
├── ris-bls-test-mapping.md      # Reference mapping
├── test-gap-analysis.md         # Overall gap summary
└── reports/                     # Individual RIS reports
    ├── AUTH-R01_coverage.md
    ├── AUTH-R02_coverage.md
    └── ...
```

---

## Commands Reference

```bash
# Count tests by domain
find ../e2e/jobsmarket -name "*.spec.ts" | wc -l
find ../unit/jobsmarket -name "*.test.ts" -o -name "*.test.tsx" | wc -l
find ../integration/jobsmarket -name "*.test.ts" -o -name "*.test.tsx" | wc -l

# List all test files for a domain
find .. -path "*/jobsmarket/auth/*" -name "*.test.*" -o -path "*/jobsmarket/auth/*" -name "*.spec.*"

# Search for specific RIS references in tests
grep -r "AUTH-R01\|login" ../e2e/jobsmarket/auth/ ../unit/jobsmarket/auth/

# Check if specific spec is tested
grep -r "INVALID_CREDENTIALS\|invalid.*credentials" ../unit/jobsmarket/auth/
```

---

## Important Notes

1. **Do NOT modify source code** from this workspace - audit only
2. **Do NOT run tests** - just analyze coverage
3. **Output reports** should be Markdown files in `reports/` subdirectory
4. **Reference RIS sections** in reports (e.g., "Section 10.1 Error States Table")
5. **Use relative paths** from this directory

---

## Starting Point

Begin with the biggest gap:

```
Audit AUTH-R02 (Register):
1. Read ../../docs/jobsmarket/RIS/AUTH-R02_register_RIS.md
2. Read ../../docs/jobsmarket/BLS/BLS-01_onboarding.md (Section 3.2)
3. Check ../e2e/jobsmarket/auth/ for register tests
4. Check ../unit/jobsmarket/auth/ for register tests
5. Check ../integration/jobsmarket/auth/ for register tests
6. Generate reports/AUTH-R02_coverage.md
```
