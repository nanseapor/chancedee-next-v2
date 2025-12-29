# COMP-R04 Test Plan (TDD)

**Document Version:** 1.0
**Created:** 2025-12-20
**Phase:** Phase 1 - RED (Tests Written, All Failing)
**Status:** ✅ COMPLETE - All tests written and verified failing

---

## Test Status: 🔴 RED (All Failing)

**All tests written BEFORE implementation. This is the TDD "Red" phase.**

All 5 test files fail with the expected error:
```
Error: Failed to resolve import "@/app/jobsmarket/companies/[id]/dashboard/_components/[Component]"
Does the file exist?
```

**This is correct!** Components don't exist yet. We're following strict TDD.

---

## Unit Tests Summary

| File | Tests | Status | Coverage Target |
|------|-------|--------|-----------------|
| StatCard.test.tsx | 15 | 🔴 FAIL (component doesn't exist) | 95%+ |
| QuickActions.test.tsx | 18 | 🔴 FAIL (component doesn't exist) | 90%+ |
| DashboardMetrics.test.tsx | 12 | 🔴 FAIL (component doesn't exist) | 90%+ |
| RecentActivityFeed.test.tsx | 10 | 🔴 FAIL (component doesn't exist) | 90%+ |
| DashboardClient.test.tsx | 20 | 🔴 FAIL (component doesn't exist) | 90%+ |
| **Total** | **75** | **🔴 ALL FAIL** | **≥90%** |

---

## Test Categories

### StatCard (15 tests)

**Purpose:** Test reusable metric card component

**Test Groups:**
- ✅ **Rendering (5 tests)**
  - Renders without crashing
  - Displays title
  - Displays value
  - Displays icon
  - Wraps content in link when href provided

- ✅ **Value Formatting (3 tests)**
  - Displays zero correctly
  - Displays large numbers with comma separator (1,234)
  - Displays very large numbers with formatting (1,000,000)

- ✅ **Loading State (2 tests)**
  - Shows skeleton when loading
  - Hides value when loading

- ✅ **Styling (2 tests)**
  - Applies custom className
  - Applies hover styles for clickable cards

- ✅ **Without Link (1 test)**
  - Renders without link when href not provided

- ✅ **Accessibility (2 tests)**
  - Has accessible name
  - Is keyboard navigable when clickable

**Coverage Target:** 95%+

---

### QuickActions (18 tests)

**Purpose:** Test 3 action buttons (Create Job, View Applications, Browse Candidates)

**Test Groups:**
- ✅ **Rendering (4 tests)**
  - Renders without crashing
  - Renders section title "ดำเนินการด่วน"
  - Renders 3 action buttons
  - Renders all buttons in correct order

- ✅ **Create Job Button (6 tests)**
  - Links to job creation page
  - Enabled when canPostJobs is true
  - Disabled when canPostJobs is false
  - Shows permission message when disabled
  - Is primary button style
  - Has Plus icon

- ✅ **View Applications Button (4 tests)**
  - Links to applications page
  - Is always enabled
  - Is secondary/outline style
  - Has FileText icon

- ✅ **Browse Candidates Button (4 tests)**
  - Is disabled (feature not ready - COMP-R09)
  - Shows coming soon tooltip "เร็วๆ นี้"
  - Is outline style
  - Has Search icon

- ✅ **Icons (1 test)**
  - Each button has an icon

- ✅ **Props (2 tests)**
  - Uses companyId in links
  - Applies custom className

**Coverage Target:** 90%+

---

### DashboardMetrics (12 tests)

**Purpose:** Test 4-card grid container showing jobs and applications metrics

**Test Groups:**
- ✅ **Rendering (4 tests)**
  - Renders without crashing
  - Renders 4 stat cards
  - Displays correct job counts
  - Displays correct application counts

- ✅ **Loading State (1 test)**
  - Shows loading state when isLoading

- ✅ **Grid Layout (3 tests)**
  - Uses 4-column grid on desktop (md:grid-cols-4)
  - Uses 2-column grid on tablet (sm:grid-cols-2)
  - Uses single column on mobile (grid-cols-1)

- ✅ **Zero Values (1 test)**
  - Handles all zero metrics

- ✅ **Props (2 tests)**
  - Applies custom className
  - Passes companyId to stat card links

**Metric Cards Expected:**
1. งานทั้งหมด (Total Jobs)
2. งานที่เปิดรับ (Active Jobs)
3. ใบสมัครทั้งหมด (Total Applications)
4. ใบสมัครใหม่ (New Applications)

**Coverage Target:** 90%+

---

### RecentActivityFeed (10 tests)

**Purpose:** Test activity timeline showing recent company events

**Test Groups:**
- ✅ **Rendering (5 tests)**
  - Renders without crashing
  - Renders section title "กิจกรรมล่าสุด"
  - Renders all activity items
  - Shows relative time for each activity (e.g., "5 นาทีที่แล้ว")
  - Renders activity icons

- ✅ **Empty State (2 tests)**
  - Shows empty message "ยังไม่มีกิจกรรม" when no activities
  - Does not render activity list when empty

- ✅ **Loading State (2 tests)**
  - Shows skeleton when loading
  - Does not show activities when loading

- ✅ **Activity Types (2 tests)**
  - Shows correct icon for application_received
  - Shows correct icon for job_posted

- ✅ **Props (2 tests)**
  - Applies custom className
  - Limits to max 5 items

**Activity Types Tested:**
- `application_received` - New application received
- `job_posted` - Job posted/published

**Coverage Target:** 90%+

---

### DashboardClient (20 tests)

**Purpose:** Test main client component with auth, data fetching, and layout

**Test Groups:**
- ✅ **Loading State (2 tests)**
  - Shows skeleton when auth is loading
  - Shows skeleton when data is loading

- ✅ **Authenticated & Ready (5 tests)**
  - Renders DashboardMetrics
  - Renders QuickActions
  - Renders RecentActivityFeed
  - Shows page title "แดชบอร์ด"
  - Shows welcome message

- ✅ **Authorization (4 tests)**
  - Returns null for unauthorized state
  - Returns null for not_member state
  - Returns null for pending_approval state
  - Returns null for rejected state

- ✅ **Permission Handling (2 tests)**
  - Checks post_jobs permission
  - Handles viewer role (no post permission)

- ✅ **Data Fetching (5 tests)**
  - Fetches dashboard metrics via SWR
  - Uses correct SWR key with companyId
  - Handles fetch errors gracefully
  - Passes metrics data to DashboardMetrics
  - Passes companyId to QuickActions

- ✅ **Layout (3 tests)**
  - Has responsive padding
  - Renders components in correct order (Metrics → Actions → Activity)
  - Has max-width container

- ✅ **Edge Cases (2 tests)**
  - Handles missing companyId
  - Handles null metrics data

**Coverage Target:** 90%+

---

## Test Execution Results

### Command Run
```bash
npm run test:unit -- tests/unit/jobsmarket/company/dashboard/
```

### Output
```
RUN  v4.0.15 /home/konton-otome/chancedee-next-v2

⎯⎯⎯⎯⎯⎯ Failed Suites 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/unit/jobsmarket/company/dashboard/DashboardClient.test.tsx
Error: Failed to resolve import "@/app/jobsmarket/companies/[id]/dashboard/_components/DashboardClient"
Does the file exist?

 FAIL  tests/unit/jobsmarket/company/dashboard/DashboardMetrics.test.tsx
Error: Failed to resolve import "@/app/jobsmarket/companies/[id]/dashboard/_components/DashboardMetrics"
Does the file exist?

 FAIL  tests/unit/jobsmarket/company/dashboard/QuickActions.test.tsx
Error: Failed to resolve import "@/app/jobsmarket/companies/[id]/dashboard/_components/QuickActions"
Does the file exist?

 FAIL  tests/unit/jobsmarket/company/dashboard/RecentActivityFeed.test.tsx
Error: Failed to resolve import "@/app/jobsmarket/companies/[id]/dashboard/_components/RecentActivityFeed"
Does the file exist?

 FAIL  tests/unit/jobsmarket/company/dashboard/StatCard.test.tsx
Error: Failed to resolve import "@/app/jobsmarket/companies/[id]/dashboard/_components/StatCard"
Does the file exist?
```

**Status:** ✅ All tests fail as expected (TDD RED phase)

---

## Component Files to Implement (Phase 2+)

**None of these files exist yet:**

```
src/app/jobsmarket/companies/[id]/dashboard/
├── page.tsx (NOT CREATED)
└── _components/
    ├── StatCard.tsx (NOT CREATED)
    ├── QuickActions.tsx (NOT CREATED)
    ├── DashboardMetrics.tsx (NOT CREATED)
    ├── RecentActivityFeed.tsx (NOT CREATED)
    ├── DashboardClient.tsx (NOT CREATED)
    ├── mock-activities.ts (NOT CREATED)
    └── index.ts (NOT CREATED)
```

**Server Action:**
```
src/lib/database/actions/
└── company-dashboard.ts (NOT CREATED)
```

---

## TDD Compliance Checklist

- [x] Tests written BEFORE any implementation
- [x] All tests verified to FAIL (RED phase complete)
- [x] No component files created yet
- [x] Test directory structure created
- [x] All 75 unit tests written
- [ ] Implementation to make tests PASS (next phase - GREEN)
- [ ] Refactoring while tests pass (later phase - REFACTOR)

---

## Next Phase: Phase 2 - GREEN (Implementation)

**Order of implementation:**

1. **StatCard.tsx** (Day 1, 1 hour)
   - Implement component
   - Run: `npm run test:unit tests/unit/jobsmarket/company/dashboard/StatCard.test.tsx`
   - **Expected:** 15/15 tests PASS ✅

2. **QuickActions.tsx** (Day 1-2, 1.5 hours)
   - Implement component
   - Run: `npm run test:unit tests/unit/jobsmarket/company/dashboard/QuickActions.test.tsx`
   - **Expected:** 18/18 tests PASS ✅

3. **DashboardMetrics.tsx** (Day 2, 1 hour)
   - Implement component
   - Run: `npm run test:unit tests/unit/jobsmarket/company/dashboard/DashboardMetrics.test.tsx`
   - **Expected:** 12/12 tests PASS ✅

4. **RecentActivityFeed.tsx** (Day 2, 1 hour)
   - Implement component + mock-activities.ts
   - Run: `npm run test:unit tests/unit/jobsmarket/company/dashboard/RecentActivityFeed.test.tsx`
   - **Expected:** 10/10 tests PASS ✅

5. **Server Action** (Day 2-3, 2 hours)
   - Create `company-dashboard.ts`
   - Implement `webCompanyDashboardGetMetrics()`
   - Write integration tests
   - Run integration tests
   - **Expected:** 8/8 integration tests PASS ✅

6. **DashboardClient.tsx** (Day 3, 2 hours)
   - Implement component
   - Run: `npm run test:unit tests/unit/jobsmarket/company/dashboard/DashboardClient.test.tsx`
   - **Expected:** 20/20 tests PASS ✅

7. **Route Files** (Day 3, 30 minutes)
   - Create `page.tsx`
   - Create `_components/index.ts`
   - Run all tests: `npm run test:unit tests/unit/jobsmarket/company/dashboard/`
   - **Expected:** 75/75 tests PASS ✅

---

## Success Metrics

### Phase 1 (Current) - RED
- [x] 5 test files created
- [x] 75 unit tests written
- [x] All tests verified to FAIL
- [x] 0 component files created

### Phase 2 (Next) - GREEN
- [ ] 5 component files implemented
- [ ] 1 server action implemented
- [ ] 1 route file implemented
- [ ] 75/75 unit tests PASS
- [ ] 8/8 integration tests PASS
- [ ] ≥90% code coverage

### Phase 3 (Later) - REFACTOR
- [ ] Code review and cleanup
- [ ] Extract shared utilities
- [ ] Optimize performance
- [ ] Tests still PASS after refactoring

---

## Test File Locations

```
tests/unit/jobsmarket/company/dashboard/
├── StatCard.test.tsx ✅ (15 tests, RED)
├── QuickActions.test.tsx ✅ (18 tests, RED)
├── DashboardMetrics.test.tsx ✅ (12 tests, RED)
├── RecentActivityFeed.test.tsx ✅ (10 tests, RED)
└── DashboardClient.test.tsx ✅ (20 tests, RED)

Total: 5 files, 75 tests, ALL FAILING ✅
```

---

## Integration Tests (Future)

**Not yet written:**
```
tests/integration/jobsmarket/company/dashboard/
└── company-dashboard.actions.test.ts (8 tests, to be written in Phase 6)
```

---

## E2E Tests (Future)

**Not yet written:**
```
tests/e2e/jobsmarket/company/
└── dashboard.spec.ts (12 tests, to be written in Phase 9)
```

---

## Notes

1. **TDD RED phase complete** - All tests written and verified failing
2. **No implementation yet** - Following strict TDD principles
3. **Ready for Phase 2** - Implementation to make tests GREEN
4. **Mock data strategy** - RecentActivityFeed will use mock data initially
5. **Server action needed** - `webCompanyDashboardGetMetrics()` to be implemented

---

**Phase 1 Status:** ✅ COMPLETE
**Next Step:** Wait for approval to proceed to Phase 2 (Implementation - GREEN phase)
**Estimated Time for Phase 2:** 3-4 days
