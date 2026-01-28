# Test Coverage Gap Analysis

**Generated from:** `tree tests` output  
**Date:** Analysis of current state

---

## Executive Summary

| Category | Count | Coverage |
|----------|-------|----------|
| Total RIS Documents | 45 | - |
| RIS with E2E Tests | ~30 | 67% |
| RIS with Unit Tests | ~28 | 62% |
| RIS with Integration Tests | ~22 | 49% |
| **Fully Covered (all 3 types)** | ~20 | **44%** |

---

## 🔴 Critical Gaps (No Tests)

These RIS documents have **NO corresponding tests**:

| RIS ID | Route | Priority | Reason |
|--------|-------|----------|--------|
| **AUTH-R02** | `/auth/register` | 🔴 P0 | Core onboarding - most complex auth flow |
| ADM-R01 | `/platform/dashboard` | 🟡 P1 | Admin landing page |
| ADM-R03 | `/platform/candidates` | 🟡 P1 | Admin candidate management |
| ADM-R04 | `/platform/jobs` | 🟡 P1 | Admin job moderation |
| ADM-R05 | `/platform/reports` | 🟡 P1 | Content flagging review |
| ADM-R06 | `/platform/users` | 🟡 P1 | User management |
| ADM-R07 | `/platform/analytics` | 🟢 P2 | Analytics dashboard |
| ADM-R08 | `/platform/settings` | 🟢 P2 | Platform settings |
| ADM-R09 | `/platform/logs` | 🟢 P2 | Activity logs |
| ADM-R10 | `/platform/notifications` | 🟢 P2 | Admin notifications |

### AUTH-R02 is the Biggest Gap

AUTH-R02 (Register) is your **most complex RIS** at 193KB and covers:
- Candidate registration wizard (5 steps)
- Company registration wizard (4 steps)  
- OTP verification flow
- Terms/consent handling
- Role-based registration paths

**Recommended Action:** Prioritize AUTH-R02 tests immediately.

---

## 🟡 Partial Coverage (Missing Test Types)

### Has E2E Only (Missing Unit + Integration)

| RIS ID | Route | Has | Missing |
|--------|-------|-----|---------|
| AUTH-R01 | `/auth/login` | E2E | Unit tests for: form validation, error mapping, routing logic |
| AUTH-R08 | `/auth/session-expired` | E2E | Unit tests for: session detection, redirect logic |

### Has Unit Only (Missing E2E + Integration)

| RIS ID | Route | Has | Missing |
|--------|-------|-----|---------|
| JOB-R00 | Cross-cutting | Unit | E2E for public job access patterns |

### Has E2E + Unit (Missing Integration)

| RIS ID | Route | Has | Missing |
|--------|-------|-----|---------|
| COMP-R01 | `/companies/[id]/pending` | E2E, Unit | Integration tests for approval status checks |
| COMP-R04 | `/companies/[id]/dashboard` | E2E, Unit | Integration tests for dashboard data fetching |

---

## ✅ Well Covered Routes

These have all three test types:

| RIS ID | Route | E2E | Unit | Integration |
|--------|-------|-----|------|-------------|
| AUTH-R04 | `/auth/reset` | ✅ | ✅ | ✅ |
| AUTH-R05 | `/auth/status` | ✅ | ✅ | ✅ |
| AUTH-R06 | `/auth/settings` | ✅ | ✅ | ✅ |
| AUTH-R07 | `/auth/select-role` | ✅ | ✅ | ✅ |
| CAND-R01 | Dashboard | ✅ | ✅ | ✅ |
| CAND-R02 | Profile | ✅ | ✅ | ✅ |
| CAND-R03 | Settings | ✅ | ✅ | ✅ |
| CAND-R04 | Applications | ✅ | ✅ | ✅ |
| CAND-R05 | Saved | ✅ | ✅ | ✅ |
| COMP-R02 | Team | ✅ | ✅ | ✅ (via company-auth) |
| COMP-R03 | Settings | ✅ | ✅ | ✅ (via company-auth) |
| COMP-R05 | Jobs List | ✅ | ✅ | ✅ (via job-actions) |
| COMP-R06 | Jobs New | ✅ | ✅ | ✅ |
| COMP-R07 | Jobs Detail | ✅ | ✅ | ✅ |
| COMP-R08 | Applications | ✅ | ✅ | ✅ |
| JOB-R01 | Jobs Search | ✅ | ⚠️ | ✅ |
| JOB-R02 | Job Detail | ✅ | ✅ | ✅ |
| JOB-R02b | Apply Modal | ✅ | ✅ | ✅ |
| CHAT-R01 | Chat List | ✅ | ✅ | ✅ |
| CHAT-R02 | Chat Room | ✅ | ✅ | ✅ |
| NOTIF-R01 | Notifications | ✅ | ✅ | ⚠️ |
| WALLET-R01 | Wallet | ✅ | ✅ | ⚠️ |
| ADM-R02 | Companies | ✅ | ✅ | ⚠️ |

---

## Test File Count by Domain

| Domain | E2E | Unit | Integration | Total |
|--------|-----|------|-------------|-------|
| auth | 6 | 16 | 11 | 33 |
| candidates | 13 | 31 | 10 | 54 |
| company | 12 | 77 | 5 | 94 |
| jobs | 3 | 16 | 5 | 24 |
| chat | 2 | 18 | 2 | 22 |
| notifications | 1 | 4 | 0 | 5 |
| wallet | 1 | 12 | 0 | 13 |
| admin | 3 | 19 | 0 | 22 |
| interview | 3 | 7 | 3 | 13 |
| companies (public) | 2 | 8 | 0 | 10 |
| **TOTAL** | **46** | **208** | **36** | **290** |

---

## Recommended Priority Order

### Phase 1: Critical Missing (Week 1)
1. **AUTH-R02** - Register flow (all test types)
2. AUTH-R01 - Add unit tests for login

### Phase 2: Admin Routes (Week 2-3)
3. ADM-R01 - Platform dashboard
4. ADM-R03 - Candidates management
5. ADM-R04 - Jobs moderation
6. ADM-R05 - Reports/flags

### Phase 3: Admin Remaining (Week 4)
7. ADM-R06 - Users
8. ADM-R07 - Analytics
9. ADM-R08 - Settings
10. ADM-R09 - Logs
11. ADM-R10 - Notifications

### Phase 4: Fill Gaps (Ongoing)
- Add integration tests where missing
- Add unit tests for E2E-only routes

---

## Next Steps for Claude Code

Ask Claude Code to:

```
1. Start with AUTH-R02 audit:
   - Read docs/jobsmarket/RIS/AUTH-R02_register_RIS.md
   - Read docs/jobsmarket/BLS/BLS-01_onboarding.md (Section 3.2: register action)
   - Extract all testable specifications
   - Create test file structure for:
     - tests/e2e/jobsmarket/auth/register.spec.ts
     - tests/unit/jobsmarket/auth/register/*.test.ts
     - tests/integration/jobsmarket/auth/register/*.test.ts

2. Generate test stubs that reference RIS sections in comments
```
