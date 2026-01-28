# Claude Code Task: Audit Test Coverage Against RIS/BLS Specifications

## Context

We're using TDD for ChanceDee jobs subdomain. Tests exist but we need to verify they cover ALL specifications from RIS and BLS documents.

**Current Test Structure:**
- Tests are organized by domain/feature (e.g., `auth/login.spec.ts`)
- NOT by RIS ID (e.g., `auth-r01-login.spec.ts`)
- This is fine - we'll map tests to RIS based on route/feature matching

---

## RIS-to-Test File Mapping

Based on the actual test structure, here's how tests map to RIS documents:

### Authentication Domain (AUTH-R*)

| RIS ID | RIS Document | Route | Test Files |
|--------|--------------|-------|------------|
| AUTH-R00 | Cross-cutting | (shared) | Middleware tests, auth helpers |
| AUTH-R01 | Login | `/auth/login` | `e2e/jobsmarket/auth/login.spec.ts` |
| AUTH-R02 | Register | `/auth/register` | ❌ **MISSING** |
| AUTH-R03 | Verify | `/auth/verify` | `unit/jobsmarket/auth/verify/*.test.ts`, `integration/jobsmarket/auth/verify/*.test.ts` |
| AUTH-R04 | Reset | `/auth/reset` | `e2e/jobsmarket/auth/reset.spec.ts`, `unit/jobsmarket/auth/reset/*.test.ts`, `integration/jobsmarket/auth/reset/*.test.ts` |
| AUTH-R05 | Status | `/auth/status` | `e2e/jobsmarket/auth/status.spec.ts`, `unit/jobsmarket/auth/status/*.test.ts`, `integration/jobsmarket/auth/status/*.test.ts` |
| AUTH-R06 | Settings | `/auth/settings` | `e2e/jobsmarket/auth/settings.spec.ts`, `unit/jobsmarket/auth/settings/*.test.ts`, `integration/jobsmarket/auth/settings/*.test.ts` |
| AUTH-R07 | Select Role | `/auth/select-role` | `e2e/jobsmarket/auth/select-role.spec.ts`, `unit/jobsmarket/auth/select-role/*.test.ts`, `integration/jobsmarket/auth/select-role/*.test.ts` |
| AUTH-R08 | Session Expired | `/auth/session-expired` | `e2e/jobsmarket/auth/session-expired.spec.ts` |

### Candidate Domain (CAND-R*)

| RIS ID | RIS Document | Route | Test Files |
|--------|--------------|-------|------------|
| CAND-R00 | Cross-cutting | (shared) | `unit/jobsmarket/candidates/dashboard/use-candidate-auth.test.ts` |
| CAND-R01 | Dashboard | `/candidates/[id]/dashboard` | `e2e/jobsmarket/candidates/dashboard*.spec.ts`, `unit/jobsmarket/candidates/dashboard/*.test.ts`, `integration/jobsmarket/candidates/dashboard/*.test.tsx` |
| CAND-R02 | Profile | `/candidates/[id]/profile` | `e2e/jobsmarket/candidates/profile/*.spec.ts`, `unit/jobsmarket/candidates/profile/*.test.tsx`, `unit/jobsmarket/candidates/profile-view/*.test.tsx`, `integration/jobsmarket/candidates/profile/*.test.ts` |
| CAND-R03 | Settings | `/candidates/[id]/settings` | `e2e/jobsmarket/candidates/settings.spec.ts`, `unit/jobsmarket/candidates/settings/*.test.tsx`, `integration/jobsmarket/candidates/settings.test.ts` |
| CAND-R04 | Applications | `/candidates/[id]/applications` | `e2e/jobsmarket/candidates/applications.spec.ts`, `unit/jobsmarket/candidates/applications/*.test.tsx`, `integration/jobsmarket/candidates/applications/*.test.ts` |
| CAND-R05 | Saved | `/candidates/[id]/saved` | `e2e/jobsmarket/candidates/saved-jobs.spec.ts`, `unit/jobsmarket/candidates/saved/*.test.tsx`, `integration/jobsmarket/candidates/saved/*.test.ts` |

### Company Domain (COMP-R*)

| RIS ID | RIS Document | Route | Test Files |
|--------|--------------|-------|------------|
| COMP-R00 | Cross-cutting | (shared) | `unit/jobsmarket/company/use-company-permission.test.ts`, `unit/jobsmarket/company/permission-matrix.test.ts` |
| COMP-R01 | Pending | `/companies/[id]/pending` | `e2e/jobsmarket/company/pending.spec.ts`, `unit/jobsmarket/company/pending/*.test.tsx` |
| COMP-R02 | Team | `/companies/[id]/team` | `e2e/jobsmarket/company/team.spec.ts`, `unit/jobsmarket/company/team/**/*.test.ts(x)` |
| COMP-R03 | Settings | `/companies/[id]/settings` | `e2e/jobsmarket/company/settings.spec.ts`, `unit/jobsmarket/company/settings/**/*.test.ts(x)` |
| COMP-R04 | Dashboard | `/companies/[id]/dashboard` | `e2e/jobsmarket/company/dashboard.spec.ts`, `unit/jobsmarket/company/dashboard/*.test.tsx` |
| COMP-R05 | Jobs List | `/companies/[id]/jobs` | `e2e/jobsmarket/company/jobs-list.spec.ts`, `unit/jobsmarket/company/jobs-list/**/*.test.ts(x)` |
| COMP-R06 | Jobs New | `/companies/[id]/jobs/new` | `e2e/jobsmarket/company/job-wizard.spec.ts`, `unit/jobsmarket/company/job-wizard/**/*.test.ts(x)` |
| COMP-R07 | Jobs Detail | `/companies/[id]/jobs/[jobId]` | `e2e/jobsmarket/company/job-detail.spec.ts`, `unit/jobsmarket/company/job-detail/*.test.ts(x)` |
| COMP-R08 | Applications | `/companies/[id]/applications` | `e2e/jobsmarket/company/applications*.spec.ts`, `unit/jobsmarket/company/applications/**/*.test.ts(x)`, `integration/jobsmarket/company/applications/*.test.ts` |

### Jobs Domain (JOB-R*)

| RIS ID | RIS Document | Route | Test Files |
|--------|--------------|-------|------------|
| JOB-R00 | Cross-cutting | (shared) | `unit/jobsmarket/jobs/public-jobs-actions.test.ts` |
| JOB-R01 | Jobs List | `/jobs` | `e2e/jobsmarket/jobs/job-search.spec.ts`, `integration/jobsmarket/jobs/job-search-integration.test.ts`, `integration/jobsmarket/jobs/public-jobs-integration.test.ts` |
| JOB-R02 | Job Detail | `/jobs/[id]` | `e2e/jobsmarket/jobs/job-detail.spec.ts`, `unit/jobsmarket/jobs/job-detail/*.test.tsx`, `integration/jobsmarket/jobs/job-detail-integration.test.ts` |
| JOB-R02b | Apply Modal | `/jobs/[id]` (modal) | `e2e/jobsmarket/jobs/apply-modal.spec.ts`, `unit/jobsmarket/jobs/apply-modal/*.test.tsx`, `unit/jobsmarket/jobs/applications/*.test.ts`, `integration/jobsmarket/jobs/apply-modal-integration.test.tsx`, `integration/jobsmarket/jobs/applications/*.test.ts` |

### Chat Domain (CHAT-R*)

| RIS ID | RIS Document | Route | Test Files |
|--------|--------------|-------|------------|
| CHAT-R00 | Cross-cutting | (shared) | `unit/jobsmarket/chat/hooks/*.test.ts` |
| CHAT-R01 | Chat List | `/chat` | `e2e/jobsmarket/chat/chat-list.spec.ts`, `unit/jobsmarket/chat/components/ChatRoomList.test.tsx`, `unit/jobsmarket/chat/components/ChatRoomCard.test.tsx`, `integration/jobsmarket/chat/fetch-chat-rooms-metadata.test.ts` |
| CHAT-R02 | Chat Room | `/chat/[roomId]` | `e2e/jobsmarket/chat/chat-room.spec.ts`, `unit/jobsmarket/chat/components/*.test.tsx`, `unit/jobsmarket/chat/actions/*.test.ts`, `integration/jobsmarket/chat/chat-room-actions.test.ts` |

### Notifications Domain (NOTIF-R*)

| RIS ID | RIS Document | Route | Test Files |
|--------|--------------|-------|------------|
| NOTIF-R00 | Cross-cutting | (shared) | `unit/jobsmarket/notifications/use-notifications.test.ts` |
| NOTIF-R01 | Notifications | `/notifications` | `e2e/jobsmarket/notifications/notifications.spec.ts`, `unit/jobsmarket/notifications/**/*.test.ts(x)` |

### Wallet Domain (WALLET-R*)

| RIS ID | RIS Document | Route | Test Files |
|--------|--------------|-------|------------|
| WALLET-R01 | Wallet | `/wallet` | `e2e/jobsmarket/wallet/wallet.spec.ts`, `unit/jobsmarket/wallet/**/*.test.ts(x)` |

### Admin Domain (ADM-R*)

| RIS ID | RIS Document | Route | Test Files |
|--------|--------------|-------|------------|
| ADM-R00 | Cross-cutting | (shared) | `unit/jobsmarket/admin/hooks/use-admin-auth.test.ts` |
| ADM-R01 | Platform Dashboard | `/platform/dashboard` | ❌ **MISSING** |
| ADM-R02 | Companies | `/platform/companies` | `e2e/jobsmarket/admin/companies-list.spec.ts`, `e2e/jobsmarket/admin/company-*.spec.ts`, `unit/jobsmarket/admin/**/*.test.ts(x)` |
| ADM-R03 | Candidates | `/platform/candidates` | ❌ **MISSING** |
| ADM-R04 | Jobs | `/platform/jobs` | ❌ **MISSING** |
| ADM-R05 | Reports | `/platform/reports` | ❌ **MISSING** |
| ADM-R06 | Users | `/platform/users` | ❌ **MISSING** |
| ADM-R07 | Analytics | `/platform/analytics` | ❌ **MISSING** |
| ADM-R08 | Settings | `/platform/settings` | ❌ **MISSING** |
| ADM-R09 | Logs | `/platform/logs` | ❌ **MISSING** |
| ADM-R10 | Notifications | `/platform/notifications` | ❌ **MISSING** |

### Interview (Cross-cutting - spans COMP-R08)

| Feature | Test Files |
|---------|------------|
| Interview Scheduling | `e2e/jobsmarket/interview/*.spec.ts`, `unit/jobsmarket/interview/**/*.test.ts(x)`, `integration/jobsmarket/interview/*.test.ts` |

### Companies Directory (Public)

| Feature | Test Files |
|---------|------------|
| Company Directory | `e2e/jobsmarket/companies/directory.spec.ts`, `e2e/jobsmarket/companies/public-profile.spec.ts`, `unit/jobsmarket/companies/**/*.test.ts(x)` |

---

## Step 1: Audit Specific RIS Coverage

For Claude Code to audit a specific RIS, use this prompt:

```
Audit test coverage for RIS: {RIS_ID}

1. Read the RIS document: docs/jobsmarket/RIS/{RIS_FILE}
2. Read related BLS documents (see mapping below)
3. Find all test files for this RIS (see mapping above)
4. For each testable specification in the RIS, check if a test exists
5. Generate a coverage report

Report format:
- List each RIS section with testable specs
- For each spec, indicate: ✅ Covered | ⚠️ Partial | ❌ Missing
- Include the test file path for covered specs
```

---

## Step 2: Full Coverage Audit Script

```bash
#!/bin/bash
# Run this to generate a quick coverage summary

echo "# Test Coverage Summary"
echo "Generated: $(date)"
echo ""

# Count tests per domain
for domain in auth candidates company jobs chat notifications wallet admin interview; do
  e2e_count=$(find tests/e2e/jobsmarket/$domain -name "*.spec.ts" 2>/dev/null | wc -l)
  unit_count=$(find tests/unit/jobsmarket/$domain -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | wc -l)
  int_count=$(find tests/integration/jobsmarket/$domain -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | wc -l)
  
  echo "## $domain"
  echo "- E2E: $e2e_count"
  echo "- Unit: $unit_count"
  echo "- Integration: $int_count"
  echo ""
done
```

---

## Step 3: RIS-Specific Audit Template

When auditing a specific RIS, Claude Code should:

### 3.1 Read the RIS and extract testable items:

```markdown
## {RIS_ID} Testable Specifications

### From Section 4: Data Contract
- [ ] Read: {list all read operations}
- [ ] Write: {list all write operations}

### From Section 6: Page States  
- [ ] State: {list all page states}
- [ ] Transition: {list all state transitions}

### From Section 9: Navigation/Routing
- [ ] Route: {list all routing decisions}

### From Section 10: Error Handling
- [ ] Error: {list all error states}

### From Appendix B: Server Actions
- [ ] Action: {list all server actions}
```

### 3.2 Cross-reference with existing tests:

```markdown
## {RIS_ID} Coverage Report

| Specification | Type | Test File | Status |
|---------------|------|-----------|--------|
| Login with email/password | Unit | `unit/jobsmarket/auth/...` | ✅ |
| Login with Google OAuth | E2E | `e2e/jobsmarket/auth/login.spec.ts` | ✅ |
| Rate limiting (TOO_MANY_REQUESTS) | Unit | ❌ MISSING | ❌ |
| ... | ... | ... | ... |
```

---

## Step 4: Identified Gaps (From Current Analysis)

### Missing Test Files (High Priority)

| RIS ID | Route | Missing Tests |
|--------|-------|---------------|
| AUTH-R02 | `/auth/register` | ALL (e2e, unit, integration) |
| ADM-R01 | `/platform/dashboard` | ALL |
| ADM-R03 | `/platform/candidates` | ALL |
| ADM-R04 | `/platform/jobs` | ALL |
| ADM-R05 | `/platform/reports` | ALL |
| ADM-R06 | `/platform/users` | ALL |
| ADM-R07 | `/platform/analytics` | ALL |
| ADM-R08 | `/platform/settings` | ALL |
| ADM-R09 | `/platform/logs` | ALL |
| ADM-R10 | `/platform/notifications` | ALL |

### Partial Coverage (Medium Priority)

| RIS ID | Route | Has | Missing |
|--------|-------|-----|---------|
| AUTH-R01 | `/auth/login` | E2E | Unit, Integration |
| AUTH-R08 | `/auth/session-expired` | E2E | Unit, Integration |
| JOB-R01 | `/jobs` | E2E, Integration | Unit |

---

## Your Task for Claude Code

Use this prompt to start the audit:

```
I need you to audit test coverage for the ChanceDee jobsmarket.

Step 1: Read the RIS-to-test mapping in tests/audit/ris-bls-test-mapping.md
Step 2: For each RIS document, check if corresponding tests exist
Step 3: For existing tests, verify they cover the specifications in the RIS
Step 4: Generate a coverage report with gaps identified

Start with: {RIS_ID or "all"}

For each RIS, I need:
1. List of testable specifications from the RIS document
2. Which specifications have tests (with file paths)
3. Which specifications are missing tests
4. Priority recommendation for missing tests
```