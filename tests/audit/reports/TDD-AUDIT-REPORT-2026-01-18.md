# TDD Test Coverage Audit Report

**Date:** 2026-01-18
**Audit Scope:** ChanceDee Jobsmarket Test Coverage vs RIS/BLS Specifications
**Auditor:** Claude Code

---

## Executive Summary

### Test File Counts by Domain

| Domain | E2E Tests | Unit Tests | Integration Tests | Total |
|--------|-----------|------------|-------------------|-------|
| **auth** | 6 | 13 | 10 | **29** |
| **candidates** | 11 | 35 | 10 | **56** |
| **company** | 12 | 85 | 5 | **102** |
| **jobs** | 3 | 15 | 5 | **23** |
| **chat** | 2 | 24 | 2 | **28** |
| **admin** | 3 | 22 | 0 | **25** |
| **interview** | 3 | 10 | 3 | **16** |
| **notifications** | 1 | 5 | 0 | **6** |
| **wallet** | 1 | 14 | 0 | **15** |
| **companies** | 2 | 8 | 0 | **10** |
| **TOTAL** | **44** | **231** | **35** | **310** |

### Critical Gaps Identified

| Priority | RIS ID | Route | Gap Description |
|----------|--------|-------|-----------------|
| 🔴 **CRITICAL** | AUTH-R02 | `/auth/register` | **NO TESTS AT ALL** - Most complex RIS, 0 test files |
| 🔴 **CRITICAL** | ADM-R01 | `/platform/dashboard` | RIS exists but no dedicated tests |
| 🔴 **CRITICAL** | ADM-R03-R10 | Various admin routes | Multiple routes with NO test coverage |
| 🟡 **HIGH** | COMP-R04 | `/companies/[id]/dashboard` | RIS exists - 45% covered, missing quick actions flow |
| 🟡 **HIGH** | AUTH-R01 | `/auth/login` | E2E only - missing integration tests for server actions |

---

## Detailed Domain Coverage

### 1. AUTH Domain (9 RIS Documents)

#### AUTH-R00: Cross-cutting ⚠️ Partial
- **Test Files:** Covered via middleware and auth helpers
- **Missing:** Dedicated cross-cutting unit tests

#### AUTH-R01: Login ✅ Good E2E / ⚠️ Partial Unit
- **E2E:** `auth/login.spec.ts` - 19 tests covering:
  - Initial load states (CHECK_AUTH)
  - Form elements (IDLE state)
  - Form validation
  - Terms checkbox
  - Password visibility toggle
  - Query parameters (?from=, ?method=)
  - Navigation links
  - Authentication flow (factory-created candidate)

- **Covered Specs:**
  - ✅ Form display and validation
  - ✅ Query parameter handling (?from=, ?method=)
  - ✅ Navigation links
  - ✅ Invalid credentials error
  - ✅ Successful login redirect

- **Missing Specs:**
  - ❌ `login(idToken)` server action unit test
  - ❌ `hasSessionCookie()` server action unit test
  - ❌ `UserAccountGet(idToken)` server action integration test
  - ❌ Multi-role user routing to `/auth/select-role`
  - ❌ Rate limiting (TOO_MANY_REQUESTS) handling
  - ❌ Google OAuth popup flow
  - ❌ Email linking modal for existing accounts
  - ❌ `?redirect` URL whitelist validation
  - ❌ `?invite` token processing
  - ❌ `?context` parameter role mismatch handling
  - ❌ Deleted account redirect
  - ❌ Pending account routing variations

#### AUTH-R02: Register ❌ **CRITICAL GAP - NO TESTS**
- **Status:** 0 test files found
- **RIS Complexity:** VERY HIGH (200+ testable specifications)

**Required Tests:**
```
tests/e2e/jobsmarket/auth/register.spec.ts
├── Candidate Google OAuth flow
├── Candidate email/password + OTP flow
├── Company Mode A (new company) flow
├── Company Mode B (join existing) flow
├── All error states
└── File upload validation

tests/unit/jobsmarket/auth/register/
├── candidate-flow.test.ts
├── company-flow-mode-a.test.ts
├── company-flow-mode-b.test.ts
├── otp-verification.test.ts
└── form-validation.test.ts

tests/integration/jobsmarket/auth/register/
├── account-creation.test.ts
├── otp-email-send.test.ts
└── file-upload.test.ts
```

**Missing Server Actions to Test:**
- `sendVerificationOTPEmail(email)`
- `verifyOTPCode(refCode, otpCode)`
- `createCandidateAccount()` (via CAND-001)
- `CreateNewCompany()` (Mode A)
- `StaffRequestApply()` (Mode B)
- `processCandidateReferral(refCode)`

#### AUTH-R03: Verify ✅ Unit/Integration Only
- **Unit Tests:** `auth/verify/authorization.test.ts`, `query-validation.test.ts`
- **Integration Tests:** `auth/verify/email-updates.test.ts`
- **Missing:** E2E tests

#### AUTH-R04: Reset ✅ Good Coverage
- **E2E:** `auth/reset.spec.ts`
- **Unit:** `auth/reset/password-reset-service.test.ts`, `reset-validation.test.ts`
- **Integration:** `auth/reset/firebase-reset.test.ts`

#### AUTH-R05: Status ✅ Good Coverage
- **E2E:** `auth/status.spec.ts`
- **Unit:** `auth/status/status-detection.test.ts`
- **Integration:** `auth/status/status-routing.test.tsx`

#### AUTH-R06: Settings ✅ Good Coverage
- **E2E:** `auth/settings.spec.ts`
- **Unit:** 4 test files covering notification preferences, provider detection, sole admin check, tab visibility
- **Integration:** 5 test files covering all tabs

#### AUTH-R07: Select Role ✅ Good Coverage
- **E2E:** `auth/select-role.spec.ts`
- **Unit:** `redirect-validation.test.ts`, `role-detection.test.ts`
- **Integration:** `remember-preference.test.tsx`, `role-card.test.tsx`

#### AUTH-R08: Session Expired ⚠️ E2E Only
- **E2E:** `auth/session-expired.spec.ts`
- **Missing:** Unit tests, integration tests

---

### 2. CAND Domain (6 RIS Documents)

#### CAND-R00: Cross-cutting ✅ Good
- **Unit:** `candidates/dashboard/use-candidate-auth.test.ts`

#### CAND-R01: Dashboard ✅ Good Coverage
- **E2E:** `candidates/dashboard.spec.ts`, `dashboard-redirect-timing.spec.ts`
- **Unit:** `use-profile-completion.test.ts`, `date-th.test.ts`
- **Integration:** 3 test files

#### CAND-R02: Profile ✅ Excellent Coverage (35 test files total)
- **E2E:** 6 spec files covering:
  - Document upload
  - Section editing
  - Fresh graduate toggle
  - Mobile navigation
  - PDF export
  - Wizard completion

- **Unit:** 17 test files covering all components and drawers
- **Integration:** 4 test files

#### CAND-R03: Settings ✅ Good Coverage
- **E2E:** `candidates/settings.spec.ts`
- **Unit:** 4 test files
- **Integration:** `settings.test.ts`

#### CAND-R04: Applications ✅ Good Coverage
- **E2E:** `candidates/applications.spec.ts`
- **Unit:** 6 test files
- **Integration:** `job-application-actions.test.ts`

#### CAND-R05: Saved ✅ Good Coverage
- **E2E:** `candidates/saved-jobs.spec.ts`
- **Unit:** 4 test files
- **Integration:** `saved-jobs-actions.test.ts`

---

### 3. COMP Domain (9 RIS Documents)

#### COMP-R00: Cross-cutting ✅ Excellent
- **Unit:** `permission-matrix.test.ts`, `use-company-permission.test.ts`

#### COMP-R01: Pending ✅ Good Coverage
- **E2E:** `company/pending.spec.ts`
- **Unit:** 6 component tests

#### COMP-R02: Team ✅ Excellent Coverage
- **E2E:** `company/team.spec.ts`
- **Unit:** 14 test files
- **Integration:** Included in actions

#### COMP-R03: Settings ✅ Excellent Coverage
- **E2E:** `company/settings.spec.ts`
- **Unit:** 13 test files
- **Integration:** Included in hooks

#### COMP-R04: Dashboard ⚠️ **PARTIAL COVERAGE** (45%)
- **E2E:** `company/dashboard.spec.ts` - 18 tests
- **Unit:** 5 test files (~38 tests)
- **Integration:** 0 tests

**Covered:**
- ✅ Page load and authentication
- ✅ Quick Stats Grid (metrics + navigation links)
- ✅ Quick Actions section (create job, view apps buttons)
- ✅ Recent Activity Feed
- ✅ Responsive layout (mobile/tablet/desktop)
- ✅ Performance benchmarks

**Missing (per RIS Section 6.2, 7.3, 7.4):**
- ❌ Application quick actions (accept → chat drawer, reject → dialog)
- ❌ Recent Applications Table display
- ❌ Upcoming Appointments Section
- ❌ Empty states (no jobs, no apps, no interviews)
- ❌ Error retry flows
- ❌ Server action integration tests

**See:** `reports/COMP-R04_dashboard_coverage.md` for full audit

#### COMP-R05: Jobs List ✅ Excellent Coverage
- **E2E:** `company/jobs-list.spec.ts`
- **Unit:** 16 test files
- **Integration:** `job-actions.test.ts`

#### COMP-R06: Jobs New ✅ Excellent Coverage
- **E2E:** `company/job-wizard.spec.ts`
- **Unit:** 7 test files
- **Integration:** `job-wizard-actions.test.ts`

#### COMP-R07: Jobs Detail ✅ Excellent Coverage
- **E2E:** `company/job-detail.spec.ts`
- **Unit:** 12 test files
- **Integration:** `job-detail-actions.test.ts`

#### COMP-R08: Applications ✅ Good Coverage (187 specs in RIS)
- **E2E:** 4 spec files covering:
  - Page load and layout
  - Accept flow
  - Reject flow
  - Filter functionality

- **Unit:** 12 test files
- **Integration:** `application-flows.test.ts`

**Covered Specs:**
- ✅ Three-panel layout (desktop/tablet/mobile)
- ✅ Empty states
- ✅ Navigation from dashboard
- ✅ Filter panel visibility

**Missing Specs:**
- ❌ Accept server action (`AcceptApplication`) integration test
- ❌ Reject server action (`rejectApplication`) integration test
- ❌ Chat drawer opening after accept
- ❌ Real-time updates (FCM push)
- ❌ Concurrent update handling (409 errors)
- ❌ Match score breakdown display
- ❌ Internal notes CRUD

---

### 4. JOB Domain (4 RIS Documents)

#### JOB-R00: Cross-cutting ✅ Good
- **Unit:** `public-jobs-actions.test.ts`

#### JOB-R01: Jobs List ✅ Good Coverage
- **E2E:** `jobs/job-search.spec.ts`
- **Integration:** 2 test files

**Missing:** Unit tests for search logic

#### JOB-R02: Job Detail ✅ Good Coverage
- **E2E:** `jobs/job-detail.spec.ts`
- **Unit:** 5 test files
- **Integration:** `job-detail-integration.test.ts`

#### JOB-R02b: Apply Modal ✅ Good Coverage
- **E2E:** `jobs/apply-modal.spec.ts`
- **Unit:** 5 test files
- **Integration:** 2 test files

---

### 5. CHAT Domain (3 RIS Documents)

#### CHAT-R00: Cross-cutting ✅ Good
- **Unit:** 3 hook tests

#### CHAT-R01: Chat List ✅ Good Coverage
- **E2E:** `chat/chat-list.spec.ts`
- **Unit:** `ChatRoomList.test.tsx`, `ChatRoomCard.test.tsx`
- **Integration:** `fetch-chat-rooms-metadata.test.ts`

#### CHAT-R02: Chat Room ✅ Excellent Coverage (24 unit tests)
- **E2E:** `chat/chat-room.spec.ts`
- **Unit:** 14 component tests, 6 action tests
- **Integration:** `chat-room-actions.test.ts`

---

### 6. ADM Domain (11 RIS Documents)

#### ADM-R00: Cross-cutting ⚠️ Partial
- **Unit:** `hooks/use-admin-auth.test.ts`
- **Missing:** Server action tests for:
  - `logAdminAction()`
  - `queryAdminAuditLogs()`
  - `submitContentReport()`
  - Company screening actions

#### ADM-R01: Platform Dashboard ❌ **MISSING TESTS**
- **RIS:** 73 testable specifications identified
- **Tests:** No dedicated dashboard tests
- **Required:**
  - E2E: Dashboard load, metrics display, navigation
  - Unit: Stat card states, pending counts
  - Integration: `getDashboardStats()`, `getPendingCounts()`

#### ADM-R02: Companies ✅ Good Coverage
- **E2E:** 3 spec files (`companies-list.spec.ts`, `company-actions.spec.ts`, `company-detail.spec.ts`)
- **Unit:** 19 test files
- **Missing:** Integration tests for server actions

**Covered Specs:**
- ✅ List page load
- ✅ Company search
- ✅ Company approval flow
- ✅ Company rejection flow
- ✅ Status tabs
- ✅ Detail view

**Missing Specs:**
- ❌ Suspend/reactivate flow
- ❌ Risk score display
- ❌ Bulk actions
- ❌ Audit log creation

#### ADM-R03: Candidates ❌ **NO TESTS**
- **RIS Exists:** Yes
- **Tests:** 0

#### ADM-R04: Jobs ❌ **NO TESTS**
- **RIS Exists:** Yes
- **Tests:** 0

#### ADM-R05: Reports ❌ **NO TESTS**
- **RIS Exists:** Yes
- **Tests:** 0

#### ADM-R06: Users ❌ **NO TESTS**
- **RIS Exists:** Yes
- **Tests:** 0

#### ADM-R07: Analytics ❌ **NO TESTS**
- **RIS Exists:** Yes
- **Tests:** 0

#### ADM-R08: Settings ❌ **NO TESTS**
- **RIS Exists:** Yes
- **Tests:** 0

#### ADM-R09: Logs ❌ **NO TESTS** (Super-admin only)
- **RIS Exists:** Yes
- **Tests:** 0

#### ADM-R10: Notifications ❌ **NO TESTS**
- **RIS Exists:** Yes
- **Tests:** 0

---

### 7. Other Domains

#### NOTIF Domain ⚠️ Basic Coverage
- **E2E:** `notifications/notifications.spec.ts`
- **Unit:** 5 test files
- **Missing:** Integration tests

#### WALLET Domain ⚠️ Basic Coverage
- **E2E:** `wallet/wallet.spec.ts`
- **Unit:** 14 test files
- **Missing:** Integration tests

#### Interview Feature ✅ Good Coverage
- **E2E:** 3 spec files
- **Unit:** 10 test files
- **Integration:** 3 test files

---

## Gap Analysis Summary

### Completely Missing Test Coverage (Priority 1 - CRITICAL)

| RIS ID | Route | Testable Specs | Status |
|--------|-------|----------------|--------|
| AUTH-R02 | `/auth/register` | 200+ | **0 tests** |
| ADM-R01 | `/platform/dashboard` | 73 | **0 tests** |
| ADM-R03 | `/platform/candidates` | ~100 | **0 tests** |
| ADM-R04 | `/platform/jobs` | ~100 | **0 tests** |
| ADM-R05 | `/platform/reports` | ~80 | **0 tests** |
| ADM-R06 | `/platform/users` | ~80 | **0 tests** |
| ADM-R07 | `/platform/analytics` | ~50 | **0 tests** |
| ADM-R08 | `/platform/settings` | ~60 | **0 tests** |
| ADM-R09 | `/platform/logs` | ~40 | **0 tests** |
| ADM-R10 | `/platform/notifications` | ~50 | **0 tests** |

### Missing Integration Tests (Priority 2 - HIGH)

| Domain | Server Actions Missing Integration Tests |
|--------|----------------------------------------|
| AUTH | `login()`, `hasSessionCookie()`, `UserAccountGet()` |
| COMP-R08 | `AcceptApplication()`, `rejectApplication()` |
| ADM | All admin server actions (20+ actions) |
| NOTIF | Notification sending actions |
| WALLET | Transaction actions |

### Missing RIS Documents (Priority 3)

None - All expected RIS documents are present.

---

## Recommendations

### Immediate Actions (Sprint Priority)

1. **Create AUTH-R02 Register Tests** (Est: 8-12 hours)
   - This is the most complex feature without any tests
   - High user impact (new user onboarding)
   - Multiple flows: Candidate (Google/Email), Company (Mode A/B)

2. **Create ADM-R01 Dashboard Tests** (Est: 4-6 hours)
   - Admin dashboard is critical for platform operations
   - Simple specs compared to other admin routes

3. **Complete COMP-R04 Dashboard Tests** (Est: 3-4 hours)
   - Recent Applications Table with accept/reject quick actions
   - Upcoming Appointments Section
   - Empty states and error retry flows
   - See `reports/COMP-R04_dashboard_coverage.md` for details

### Short-term (Next 2 Sprints)

4. **Add Integration Tests for Server Actions**
   - `AcceptApplication()` - COMP-R08
   - `rejectApplication()` - COMP-R08
   - Auth server actions - AUTH-R01

5. **Create ADM-R02 Additional Tests**
   - Suspend/reactivate flows
   - Risk score logic
   - Bulk actions

### Medium-term (Future Sprints)

6. **Complete Admin Domain Coverage**
   - ADM-R03 through ADM-R10 (8 routes)
   - Estimated 40-60 hours total

7. **Add Missing Integration Tests Across All Domains**
   - Focus on server actions
   - Estimated 20-30 hours

---

## Test Quality Observations

### Positive Patterns Found

1. **Factory Pattern Usage** - Tests use `createTestCandidate()`, `createTestCompany()` factories
2. **Data-TestId Usage** - Components use `data-testid` for reliable selection
3. **Thai Localization Testing** - Tests verify Thai UI text
4. **Responsive Testing** - Tests cover mobile/tablet/desktop viewports
5. **State Machine Coverage** - Tests follow RIS state machines

### Concerns Found

1. **Defensive Skipping** - Some tests use conditional skipping (e.g., `applications.spec.ts:142`)
   ```typescript
   if (isVisible) { ... } else {
     test.skip(true, "Applications exist in test data - empty state not applicable");
   }
   ```
   This violates the TDD philosophy - tests should fail if expected state isn't reached.

2. **Missing Timeout Handling** - Some tests use `waitForTimeout()` instead of explicit waits

3. **No Coverage Reports** - Unit tests need coverage configuration verified

---

## Appendix: Test File Inventory

### E2E Tests (44 files)
<details>
<summary>Click to expand</summary>

```
tests/e2e/jobsmarket/
├── admin/
│   ├── companies-list.spec.ts
│   ├── company-actions.spec.ts
│   └── company-detail.spec.ts
├── auth/
│   ├── login.spec.ts
│   ├── reset.spec.ts
│   ├── select-role.spec.ts
│   ├── session-expired.spec.ts
│   ├── settings.spec.ts
│   └── status.spec.ts
├── candidates/
│   ├── applications.spec.ts
│   ├── dashboard.spec.ts
│   ├── dashboard-redirect-timing.spec.ts
│   ├── profile/
│   │   ├── profile-document-upload.spec.ts
│   │   ├── profile-edit-section.spec.ts
│   │   ├── profile-fresh-graduate.spec.ts
│   │   ├── profile-mobile-navigation.spec.ts
│   │   ├── profile-pdf-export.spec.ts
│   │   └── profile-wizard-complete.spec.ts
│   ├── saved-jobs.spec.ts
│   └── settings.spec.ts
├── chat/
│   ├── chat-list.spec.ts
│   └── chat-room.spec.ts
├── companies/
│   ├── directory.spec.ts
│   └── public-profile.spec.ts
├── company/
│   ├── applications.spec.ts
│   ├── applications-accept.spec.ts
│   ├── applications-filter.spec.ts
│   ├── applications-reject.spec.ts
│   ├── dashboard.spec.ts
│   ├── debug-auth.spec.ts
│   ├── job-detail.spec.ts
│   ├── job-wizard.spec.ts
│   ├── jobs-list.spec.ts
│   ├── pending.spec.ts
│   ├── settings.spec.ts
│   └── team.spec.ts
├── facility/
│   └── test-facility.spec.ts
├── interview/
│   ├── candidate-confirm-flow.spec.ts
│   ├── company-schedule-flow.spec.ts
│   └── interview-reschedule-cancel.spec.ts
├── jobs/
│   ├── apply-modal.spec.ts
│   ├── job-detail.spec.ts
│   └── job-search.spec.ts
├── notifications/
│   └── notifications.spec.ts
└── wallet/
    └── wallet.spec.ts
```
</details>

### Unit Tests (231 files)
<details>
<summary>Click to expand - organized by domain</summary>

- **admin/**: 22 files (actions, components, hooks)
- **auth/**: 13 files (OTP, reset, select-role, settings, status, verify)
- **candidates/**: 35 files (applications, dashboard, profile, saved, settings)
- **chat/**: 24 files (actions, components, hooks)
- **company/**: 85 files (applications, dashboard, job-detail, job-wizard, jobs-list, pending, settings, team)
- **companies/**: 8 files (directory, public profile)
- **interview/**: 10 files (actions, components)
- **jobs/**: 15 files (applications, apply-modal, job-detail)
- **notifications/**: 5 files
- **wallet/**: 14 files (actions, components, hooks)
</details>

### Integration Tests (35 files)
<details>
<summary>Click to expand</summary>

```
tests/integration/jobsmarket/
├── auth/
│   ├── reset/firebase-reset.test.ts
│   ├── select-role/remember-preference.test.tsx
│   ├── select-role/role-card.test.tsx
│   ├── settings/account-tab.test.tsx
│   ├── settings/delete-tab.test.tsx
│   ├── settings/notifications-tab.test.tsx
│   ├── settings/password-tab.test.tsx
│   ├── settings/settings-tabs.test.tsx
│   ├── status/status-routing.test.tsx
│   └── verify/email-updates.test.ts
├── candidates/
│   ├── applications/job-application-actions.test.ts
│   ├── dashboard/dashboard-rendering.test.tsx
│   ├── dashboard/error-handling.test.tsx
│   ├── dashboard/section-composition.test.tsx
│   ├── profile/profile-actions.test.ts
│   ├── profile/searchable-toggle.test.ts
│   ├── profile/wizard-completion.test.ts
│   ├── profile-personal-info.test.ts
│   ├── saved/saved-jobs-actions.test.ts
│   └── settings.test.ts
├── chat/
│   ├── chat-room-actions.test.ts
│   └── fetch-chat-rooms-metadata.test.ts
├── company/
│   ├── applications/application-flows.test.ts
│   ├── company-auth-flow.test.tsx
│   ├── job-detail/job-detail-actions.test.ts
│   ├── job-wizard/job-wizard-actions.test.ts
│   └── jobs-list/job-actions.test.ts
├── interview/
│   ├── interview-cancel-reschedule.test.ts
│   ├── interview-confirm-decline.test.ts
│   └── interview-schedule.test.ts
└── jobs/
    ├── applications/submit-application.test.ts
    ├── apply-modal-integration.test.tsx
    ├── job-detail-integration.test.ts
    ├── job-search-integration.test.ts
    └── public-jobs-integration.test.ts
```
</details>

---

**Report Generated:** 2026-01-18
**Next Review:** After AUTH-R02 tests are implemented
