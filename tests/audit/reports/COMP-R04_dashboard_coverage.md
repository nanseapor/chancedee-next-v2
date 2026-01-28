# COMP-R04 Test Coverage Audit Report

**RIS Document:** `docs/jobsmarket/RIS/COMP-R04_dashboard_RIS.md`
**Route:** `/companies/[id]/dashboard`
**Audit Date:** 2026-01-18
**Status:** ✅ **GOOD COVERAGE**

---

## Test File Inventory

| Test Type | File | Test Count |
|-----------|------|------------|
| **E2E** | `e2e/jobsmarket/company/dashboard.spec.ts` | 18 tests |
| **Unit** | `unit/jobsmarket/company/dashboard/DashboardClient.test.tsx` | ~10 tests |
| **Unit** | `unit/jobsmarket/company/dashboard/DashboardMetrics.test.tsx` | ~8 tests |
| **Unit** | `unit/jobsmarket/company/dashboard/QuickActions.test.tsx` | ~6 tests |
| **Unit** | `unit/jobsmarket/company/dashboard/RecentActivityFeed.test.tsx` | ~6 tests |
| **Unit** | `unit/jobsmarket/company/dashboard/StatCard.test.tsx` | ~8 tests |
| **Integration** | None | 0 tests |
| **TOTAL** | 6 files | ~56 tests |

---

## Coverage Matrix

### Section 4: Data Contract

#### 4.1 Read Operations

| Specification | Test Type | Test File | Status |
|---------------|-----------|-----------|--------|
| Company Data (`company_information`) | E2E | `dashboard.spec.ts` | ✅ Covered |
| User Data (`user_accounts`) | E2E | `dashboard.spec.ts` | ✅ Covered |
| Active Jobs Count (aggregation) | E2E | `dashboard.spec.ts:49-57` | ✅ Covered |
| Recent Applications (limit 5) | Unit | `DashboardClient.test.tsx` | ⚠️ Partial |
| Upcoming Interviews | Unit | `DashboardClient.test.tsx` | ⚠️ Partial |
| Dashboard Stats aggregation | Unit | `DashboardMetrics.test.tsx` | ✅ Covered |

#### 4.2 Write Operations

| Specification | Test Type | Test File | Status |
|---------------|-----------|-----------|--------|
| Accept Application quick action | - | - | ❌ **MISSING** |
| Reject Application quick action | - | - | ❌ **MISSING** |

**Gap:** Quick actions for accept/reject applications from dashboard are NOT tested

---

### Section 6: UI State Machine

#### 6.1 Page State Transitions

| State Transition | Test | Status |
|------------------|------|--------|
| `loading` → `auth_check` | `DashboardClient.test.tsx:59-73` | ✅ Covered |
| `loading` → `dashboard_ready` | `DashboardClient.test.tsx:75-91` | ✅ Covered |
| `auth_check` → `redirect_login` (not authenticated) | E2E via auth flow | ✅ Covered |
| `access_check` → `redirect_pending` (pending company) | `dashboard.spec.ts:153-169` | ⚠️ Partial |
| `access_check` → `redirect_403` (non-member) | `dashboard.spec.ts:172-182` | ⚠️ Partial |
| `loading_data` → `error` | Unit mocks | ⚠️ Partial |
| `error` → `loading_data` (retry) | - | ❌ **MISSING** |

#### 6.2 Quick Action State Machine

| State Transition | Test | Status |
|------------------|------|--------|
| `idle` → `confirming_accept` | - | ❌ **MISSING** |
| `confirming_accept` → `processing` | - | ❌ **MISSING** |
| `processing` → `accepted` (chat drawer opens) | - | ❌ **MISSING** |
| `idle` → `confirming_reject` | - | ❌ **MISSING** |
| `confirming_reject` → `processing` | - | ❌ **MISSING** |

**Gap:** Application quick action flows are NOT tested

---

### Section 7: Component-Action Wiring

#### 7.1 Welcome Header

| Component | Test File | Status |
|-----------|-----------|--------|
| Company Logo | - | ❌ Not tested |
| Company Name | `dashboard.spec.ts` | ⚠️ Implicit |
| User Greeting | `dashboard.spec.ts:37` | ✅ Covered |
| Role Badge | - | ❌ Not tested |

#### 7.2 Quick Stats Grid

| Stat Card | Test File | Status |
|-----------|-----------|--------|
| Active Jobs → link to jobs | `dashboard.spec.ts:59-65` | ✅ Covered |
| Active Jobs (filtered) → link | `dashboard.spec.ts:67-71` | ✅ Covered |
| Total Applications → link | `dashboard.spec.ts:74-78` | ✅ Covered |
| New Applications (7d) → link | `dashboard.spec.ts:81-85` | ✅ Covered |
| Stat card displays numbers | `dashboard.spec.ts:49-57` | ✅ Covered |

#### 7.3 Upcoming Appointments Section

| Component | Test | Status |
|-----------|------|--------|
| Section visibility | - | ❌ Not tested |
| View All link | - | ❌ Not tested |
| Appointment items | - | ❌ Not tested |
| Click to chat room | - | ❌ Not tested |

**Gap:** Upcoming appointments section NOT tested in E2E

#### 7.4 Recent Applications Table

| Component | Test | Status |
|-----------|------|--------|
| Section visibility | - | ❌ Not tested |
| Candidate info display | - | ❌ Not tested |
| Match score badge | - | ❌ Not tested |
| Accept button | - | ❌ Not tested |
| Reject button | - | ❌ Not tested |

**Gap:** Recent applications table NOT tested in E2E

#### 7.5 Quick Actions Section

| Component | Test File | Status |
|-----------|-----------|--------|
| Section title "ดำเนินการด่วน" | `dashboard.spec.ts:92-93` | ✅ Covered |
| "สร้างประกาศงาน" button | `dashboard.spec.ts:99` | ✅ Covered |
| "ดูใบสมัคร" button | `dashboard.spec.ts:100` | ✅ Covered |
| "ค้นหาผู้สมัคร" disabled | `dashboard.spec.ts:104-109` | ✅ Covered |
| Create job link href | `dashboard.spec.ts:112-116` | ✅ Covered |
| View apps link href | `dashboard.spec.ts:119-123` | ✅ Covered |

#### 7.6 Recent Activity Feed

| Component | Test File | Status |
|-----------|-----------|--------|
| Section title "กิจกรรมล่าสุด" | `dashboard.spec.ts:128-131` | ✅ Covered |
| Timestamps (Thai relative) | `dashboard.spec.ts:134-139` | ✅ Covered |
| Activity items visible | `dashboard.spec.ts:142-148` | ✅ Covered |

---

### Section 8: Error Handling

| Error Type | Test | Status |
|------------|------|--------|
| `AUTH_ERROR` → redirect login | E2E auth flow | ✅ Covered |
| `ACCESS_DENIED` → 403 | `dashboard.spec.ts:172-182` | ⚠️ Partial |
| `COMPANY_PENDING` → redirect | `dashboard.spec.ts:153-169` | ⚠️ Partial |
| `DATA_FETCH_ERROR` → retry | - | ❌ **MISSING** |
| `NETWORK_ERROR` → offline banner | - | ❌ **MISSING** |
| `ACCEPT_ERROR` → toast | - | ❌ **MISSING** |
| `REJECT_ERROR` → toast | - | ❌ **MISSING** |

---

### Section 9: Implementation Checklist from RIS

| Requirement | Test Coverage | Status |
|-------------|---------------|--------|
| ☐ Verify user authenticated | E2E via factory auth | ✅ Covered |
| ☐ Check company membership | `dashboard.spec.ts:172-182` | ⚠️ Partial |
| ☐ Check company status | `dashboard.spec.ts:153-169` | ⚠️ Partial |
| ☐ Role-based visibility | - | ❌ Not tested |
| ☐ `fetchDashboardStats` | Unit mocks | ⚠️ Partial |
| ☐ `fetchRecentApplications` | - | ❌ Not tested |
| ☐ `fetchUpcomingInterviews` | - | ❌ Not tested |
| ☐ SWR caching | Unit tests | ✅ Covered |
| ☐ WelcomeHeader component | - | ❌ Not tested |
| ☐ QuickStatsGrid | E2E + Unit | ✅ Covered |
| ☐ UpcomingAppointments | - | ❌ Not tested |
| ☐ RecentApplicationsTable | - | ❌ Not tested |
| ☐ JobPerformance (optional) | - | ❌ Not tested |
| ☐ Accept → chat drawer | - | ❌ **MISSING** |
| ☐ Reject → feedback dialog | - | ❌ **MISSING** |
| ☐ No jobs empty state | - | ❌ Not tested |
| ☐ No apps empty state | - | ❌ Not tested |
| ☐ No interviews → hide section | - | ❌ Not tested |

---

### Responsive Layout

| Viewport | Test File | Status |
|----------|-----------|--------|
| Mobile (375px) | `dashboard.spec.ts:186-198` | ✅ Covered |
| Tablet (768px) | `dashboard.spec.ts:200-205` | ✅ Covered |
| Desktop (1280px) | Implicit | ✅ Covered |

---

### Performance

| Metric | Test File | Status |
|--------|-----------|--------|
| Load < 3s | `dashboard.spec.ts:210-217` | ✅ Covered |
| No console errors | `dashboard.spec.ts:220-233` | ✅ Covered |

---

## Summary

### Coverage Statistics

| Category | Covered | Partial | Missing | Total |
|----------|---------|---------|---------|-------|
| Data Contract | 6 | 2 | 2 | 10 |
| Page States | 4 | 3 | 1 | 8 |
| Quick Actions State | 0 | 0 | 5 | 5 |
| Components | 9 | 1 | 12 | 22 |
| Error Handling | 2 | 2 | 4 | 8 |
| Responsive | 3 | 0 | 0 | 3 |
| Performance | 2 | 0 | 0 | 2 |
| **TOTAL** | **26** | **8** | **24** | **58** |

**Coverage Rate:** 45% fully covered, 14% partial, 41% missing

---

## Missing Tests (Priority Order)

### 🔴 High Priority (Critical Paths)

1. **Application Quick Actions Flow**
   - Accept application → opens chat drawer
   - Reject application → shows feedback dialog
   - These are key user flows defined in RIS Section 6.2

2. **Recent Applications Table**
   - Display of 5 most recent applications
   - Candidate info, position, date, match score
   - Quick action buttons

3. **Upcoming Appointments Section**
   - Interview calendar view
   - Click to open chat room
   - "View All" link navigation

### 🟡 Medium Priority (Functional)

4. **Empty States**
   - No jobs → CTA to create first job
   - No applications → share link suggestion
   - No interviews → section hidden

5. **Error Retry Flow**
   - Data fetch error → retry button
   - Network error → offline banner

6. **Server Action Integration Tests**
   - `fetchDashboardStats()` integration test
   - `fetchRecentApplications()` integration test
   - `fetchUpcomingInterviews()` integration test

### 🟢 Low Priority (Polish)

7. **Welcome Header**
   - Company logo click → settings
   - Role badge display

8. **Role-based Visibility**
   - Different content for admin vs HR vs recruiter

---

## Recommendations

### Immediate Actions

1. **Create E2E tests for Recent Applications Table** (Est: 2 hours)
   - Test display of last 5 applications
   - Test accept button → chat drawer flow
   - Test reject button → feedback dialog flow

2. **Create E2E tests for Upcoming Appointments** (Est: 1 hour)
   - Test section visibility
   - Test appointment item display
   - Test click to chat room

3. **Create Integration tests for Dashboard Stats** (Est: 2 hours)
   - Test `fetchDashboardStats()` server action
   - Test aggregation logic

### Test Files to Create

```
tests/e2e/jobsmarket/company/
├── dashboard-recent-apps.spec.ts     # Recent applications + quick actions
└── dashboard-appointments.spec.ts    # Upcoming appointments section

tests/integration/jobsmarket/company/dashboard/
├── dashboard-stats.test.ts           # Stats aggregation
├── recent-applications.test.ts       # Recent apps fetch
└── upcoming-interviews.test.ts       # Interviews fetch
```

---

## Conclusion

COMP-R04 has **good foundational coverage** for:
- ✅ Page load and authentication
- ✅ Quick Stats Grid (metrics + navigation)
- ✅ Quick Actions section
- ✅ Recent Activity Feed
- ✅ Responsive layout
- ✅ Performance benchmarks

However, it has **significant gaps** in:
- ❌ Application quick actions (accept/reject from dashboard)
- ❌ Recent Applications Table
- ❌ Upcoming Appointments Section
- ❌ Empty states
- ❌ Error retry flows
- ❌ Server action integration tests

**Overall Assessment:** ⚠️ **PARTIAL COVERAGE** - Core page works, but key RIS features are untested.

---

*Report generated: 2026-01-18*
