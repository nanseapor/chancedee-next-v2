# COMP-R04 (Dashboard) Assessment Report

**Document Version:** 1.0
**Created:** 2025-12-20
**Status:** Ready for SA Review
**Implementation Approach:** Test-Driven Development (TDD)

---

## Executive Summary

COMP-R04 is the **main dashboard** for approved companies - the landing page after login that provides an at-a-glance overview of their hiring activity.

**Key Characteristics:**
- **Complexity:** Medium-High
- **Estimated Effort:** 4-5 days (with TDD)
- **Dependencies:** COMP-R00 (✅ complete), job data, application data
- **Priority:** P2 - Core navigation hub
- **RIS Status:** ⚠️ No dedicated RIS document (specs inferred from COMP-R00 and strategic assessment)

---

## 1. Route Overview

### 1.1 Basic Information

| Property | Value |
|----------|-------|
| **Route ID** | COMP-R04 |
| **Path** | `/jobsmarket/companies/[id]/dashboard` |
| **Shell** | Company Shell (full sidebar, header, chat FAB, notifications) |
| **Purpose** | Company overview with key metrics and quick actions |
| **Access** | All approved company members (read-only) |

### 1.2 Route Context

**Navigation:**
- **Entry Point:** Primary landing page after company login
- **Sidebar Item:** "แดชบอร์ด" (Dashboard) - Home icon, no badge
- **Breadcrumb:** Dashboard (no parent)

**User Journey:**
```
Company logs in (approved status)
    ↓
Auto-redirect to /companies/[id]/dashboard  ← THIS ROUTE
    ↓
User sees: Metrics + Quick Actions + Recent Activity
    ↓
Clicks "สร้างประกาศงาน" → navigates to COMP-R06 (Create Job)
```

---

## 2. RIS Requirements Summary

**Note:** COMP-R04 does not have a dedicated RIS document yet. Requirements below are **inferred** from:
- COMP-R00 Section 1.1 (Route Summary)
- COMP-STRATEGIC-ASSESSMENT.md Section 4 (COMP-R04)
- Industry standard dashboard patterns

### 2.1 Core Features

#### Feature 1: Dashboard Metrics (4 Stat Cards)

**Display 4 key metrics in a grid:**

1. **Total Jobs** (ประกาศงานทั้งหมด)
   - Count: All jobs owned by company (any status)
   - Subtext: "ทั้งหมด" (All)
   - Icon: Briefcase
   - Color: Secondary (teal)
   - Link: → `/companies/[id]/dashboard/jobs` (COMP-R05)

2. **Active Jobs** (ประกาศงานที่เปิดรับ)
   - Count: Jobs with status = 'published' OR 'ontimer'
   - Subtext: "กำลังเปิดรับ" (Currently open)
   - Icon: CheckCircle
   - Color: Green (success)
   - Link: → `/companies/[id]/dashboard/jobs?filter=active`

3. **Total Applications** (ใบสมัครทั้งหมด)
   - Count: All applications across all company jobs
   - Subtext: "ทั้งหมด" (All)
   - Icon: FileText
   - Color: Secondary (teal)
   - Link: → `/companies/[id]/dashboard/applications` (COMP-R08)

4. **New Applications** (ใบสมัครใหม่)
   - Count: Applications with status = 'applied' (not yet reviewed)
   - Subtext: "รอการตรวจสอบ" (Awaiting review)
   - Icon: AlertCircle
   - Color: Amber (warning)
   - Link: → `/companies/[id]/dashboard/applications?filter=applied`

**Layout:**
- Desktop: 4-column grid
- Tablet: 2x2 grid
- Mobile: Single column stack

---

#### Feature 2: Quick Actions

**3 primary action buttons:**

1. **Create Job** (สร้างประกาศงาน)
   - Button: Primary (orange)
   - Icon: Plus
   - Link: → `/companies/[id]/dashboard/jobs/new` (COMP-R06)
   - Permission: `post_jobs`

2. **View Applications** (ดูใบสมัครงาน)
   - Button: Secondary (teal outline)
   - Icon: FileText
   - Link: → `/companies/[id]/dashboard/applications` (COMP-R08)
   - Permission: None (all can view)

3. **Browse Candidates** (ค้นหาผู้สมัคร)
   - Button: Secondary (teal outline)
   - Icon: Search
   - Link: → `/companies/[id]/dashboard/candidates` (COMP-R09)
   - Permission: None (all can browse)
   - Note: COMP-R09 not implemented yet, button should be disabled

**Layout:**
- Desktop: Horizontal row (3 buttons side-by-side)
- Mobile: Vertical stack (full-width buttons)

---

#### Feature 3: Recent Activity Feed

**Show last 5 company-related events:**

**Activity Types:**
1. New job posted
2. Job closed/paused
3. New application received
4. Application status changed
5. Team member joined

**Each activity item shows:**
- Icon (based on type)
- Primary text (e.g., "ประกาศงาน [Job Title] เปิดรับสมัครแล้ว")
- Secondary text (relative time, e.g., "2 ชั่วโมงที่แล้ว")
- Optional: Link to relevant detail page

**Layout:**
- Vertical list (card with dividers)
- Max height: 400px with scroll
- Empty state: "ยังไม่มีกิจกรรม" (No activity yet)

**Note:** Activity feed requires a new `activities` collection or query from existing data. For initial implementation, this can be:
- Option A: Mock data (for UI testing)
- Option B: Inferred from job/application timestamps (last 5 created/updated items)
- Option C: Deferred to future phase

**Decision for TDD:** Use **Option A (mock data)** initially so tests can be written without blocking on data layer design.

---

### 2.2 Non-Functional Requirements

#### Performance
- Dashboard should load within 1.5 seconds
- Use SWR for caching metrics
- Parallel data fetching (jobs + applications)

#### Accessibility
- All stat cards keyboard navigable
- Screen reader labels for metrics
- Color not sole indicator of status

#### Responsive Design
- Mobile-first approach
- Stat cards stack vertically on mobile
- Quick actions full-width on mobile

---

## 3. Data Requirements

### 3.1 Data Entities

**From Company:**
- `company.uid` - For filtering jobs/applications
- `company.name` - Display in shell header
- `company.status` - Must be 'approved'

**From Jobs:**
- Total job count (all statuses)
- Active job count (status = 'published' OR 'ontimer')

**From Applications:**
- Total application count (across all company jobs)
- New application count (status = 'applied')

### 3.2 Server Actions Needed

#### Option 1: Individual Queries (Existing Actions)

Use existing server actions:

```typescript
// src/lib/database/actions/jobs.ts (already exists)
webJobGetByFilter(filter: Filter) // Filter by companyId

// src/lib/database/actions/job-applications.ts (already exists)
webJobApplicationGetByFilter(filter: Filter) // Filter by companyId
```

**Pros:** No new server actions needed
**Cons:** Multiple round trips, client must aggregate counts

---

#### Option 2: New Aggregation Action (Recommended)

Create new server action for dashboard metrics:

```typescript
// src/lib/database/actions/company-dashboard.ts (NEW)
export async function webCompanyDashboardGetMetrics(companyId: string) {
  // Fetch jobs count
  const allJobs = await webJobGetByFilter(
    Filter.where('companyId', '==', companyId)
  );
  const jobsCount = allJobs?.length || 0;
  const activeJobsCount = allJobs?.filter(
    job => job.status === 'published' || job.status === 'ontimer'
  ).length || 0;

  // Fetch applications count
  const allApplications = await webJobApplicationGetByFilter(
    Filter.where('companyId', '==', companyId)
  );
  const applicationsCount = allApplications?.length || 0;
  const newApplicationsCount = allApplications?.filter(
    app => app.status === 'applied'
  ).length || 0;

  return {
    jobs: {
      total: jobsCount,
      active: activeJobsCount,
    },
    applications: {
      total: applicationsCount,
      new: newApplicationsCount,
    },
  };
}
```

**Pros:** Single round trip, server-side aggregation
**Cons:** New server action to write and test

**Decision for TDD:** Use **Option 2** - write tests for the new action as part of TDD process.

---

### 3.3 Recent Activity Data

**Decision:** Use mock data initially (can be replaced with real queries later).

```typescript
// src/app/jobsmarket/companies/[id]/dashboard/_components/mock-activities.ts
export const MOCK_ACTIVITIES = [
  {
    id: '1',
    type: 'job_posted',
    title: 'ประกาศงาน "Senior Developer" เปิดรับสมัครแล้ว',
    timestamp: Date.now() - 7200000, // 2 hours ago
    icon: 'Briefcase',
  },
  // ... more mock items
];
```

---

## 4. Component Breakdown

Based on requirements, we need these components:

### 4.1 Route Files

| File | Purpose | Type |
|------|---------|------|
| `page.tsx` | Server component, layout wrapper | Server |
| `_components/DashboardClient.tsx` | Main client component, auth check | Client |

### 4.2 UI Components

| Component | Purpose | Props |
|-----------|---------|-------|
| **DashboardMetrics** | 4-card grid container | `metrics: DashboardMetricsData` |
| **StatCard** | Individual metric card | `title, count, subtext, icon, color, href?` |
| **QuickActions** | 3 action buttons | `companyId, hasPermission(permission)` |
| **RecentActivityFeed** | Activity list | `activities: Activity[]` (mock initially) |

### 4.3 Component File Structure

```
src/app/jobsmarket/companies/[id]/dashboard/
├── page.tsx (server component)
└── _components/
    ├── DashboardClient.tsx (auth + layout)
    ├── DashboardMetrics.tsx (4-card grid)
    ├── StatCard.tsx (reusable metric card)
    ├── QuickActions.tsx (3 buttons)
    ├── RecentActivityFeed.tsx (activity list)
    ├── mock-activities.ts (temporary mock data)
    └── index.ts (barrel export)
```

---

## 5. Test Plan (TDD Approach)

### 5.1 TDD Process

**CRITICAL:** Write ALL tests BEFORE writing implementation.

```
Phase 1: Write Tests (RED) - ALL tests should FAIL initially
    ├── Unit tests for StatCard
    ├── Unit tests for QuickActions
    ├── Unit tests for DashboardMetrics
    ├── Unit tests for RecentActivityFeed
    ├── Unit tests for DashboardClient
    └── Integration tests for webCompanyDashboardGetMetrics

Phase 2: Implement Components (GREEN) - Make tests PASS
    ├── StatCard implementation
    ├── QuickActions implementation
    ├── DashboardMetrics implementation
    ├── RecentActivityFeed implementation
    ├── DashboardClient implementation
    └── Server action implementation

Phase 3: Refactor (REFACTOR) - Clean up while tests PASS
    └── Extract shared utilities, improve code quality

Phase 4: Quality Gates
    ├── Gate 1: Build
    ├── Gate 2: Lint
    ├── Gate 3: Unit tests (≥90% coverage)
    └── Gate 4: E2E tests
```

---

### 5.2 Unit Tests to Write FIRST

#### Test File 1: `StatCard.test.tsx` (~15 tests)

**Describe Blocks:**

```typescript
describe('StatCard', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {});
    it('should display title', () => {});
    it('should display count', () => {});
    it('should display subtext', () => {});
    it('should render icon', () => {});
  });

  describe('Props Handling', () => {
    it('should handle zero count', () => {});
    it('should handle large numbers (1000+)', () => {});
    it('should format numbers with commas', () => {});
    it('should apply custom color class', () => {});
    it('should render without href (non-clickable)', () => {});
  });

  describe('Navigation', () => {
    it('should render as link when href provided', () => {});
    it('should use correct href', () => {});
    it('should have hover state on clickable cards', () => {});
  });

  describe('Accessibility', () => {
    it('should have semantic structure', () => {});
    it('should be keyboard navigable when clickable', () => {});
  });
});
```

**Coverage Target:** 95%+

---

#### Test File 2: `QuickActions.test.tsx` (~18 tests)

```typescript
describe('QuickActions', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {});
    it('should render section title', () => {});
    it('should render 3 action buttons', () => {});
  });

  describe('Create Job Action', () => {
    it('should display "สร้างประกาศงาน" text', () => {});
    it('should be primary button', () => {});
    it('should link to /jobs/new', () => {});
    it('should use companyId in link', () => {});
    it('should have Plus icon', () => {});
  });

  describe('View Applications Action', () => {
    it('should display "ดูใบสมัครงาน" text', () => {});
    it('should be secondary outline button', () => {});
    it('should link to /applications', () => {});
    it('should have FileText icon', () => {});
  });

  describe('Browse Candidates Action', () => {
    it('should display "ค้นหาผู้สมัคร" text', () => {});
    it('should be secondary outline button', () => {});
    it('should be disabled (COMP-R09 not implemented)', () => {});
    it('should have Search icon', () => {});
  });

  describe('Layout', () => {
    it('should have responsive layout classes', () => {});
    it('should render buttons in correct order', () => {});
  });

  describe('Company ID Usage', () => {
    it('should use companyId in all links', () => {});
  });
});
```

**Coverage Target:** 90%+

---

#### Test File 3: `DashboardMetrics.test.tsx` (~12 tests)

```typescript
describe('DashboardMetrics', () => {
  const mockMetrics = {
    jobs: { total: 15, active: 8 },
    applications: { total: 120, new: 23 },
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {});
    it('should render 4 stat cards', () => {});
  });

  describe('Jobs Metrics', () => {
    it('should display total jobs count', () => {});
    it('should display active jobs count', () => {});
    it('should link total jobs to /jobs', () => {});
    it('should link active jobs to /jobs?filter=active', () => {});
  });

  describe('Applications Metrics', () => {
    it('should display total applications count', () => {});
    it('should display new applications count', () => {});
    it('should link total apps to /applications', () => {});
    it('should link new apps to /applications?filter=applied', () => {});
  });

  describe('Edge Cases', () => {
    it('should handle zero metrics', () => {});
    it('should handle undefined metrics gracefully', () => {});
  });
});
```

**Coverage Target:** 90%+

---

#### Test File 4: `RecentActivityFeed.test.tsx` (~10 tests)

```typescript
describe('RecentActivityFeed', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {});
    it('should render section title "กิจกรรมล่าสุด"', () => {});
    it('should render activity items', () => {});
  });

  describe('Activity Items', () => {
    it('should display activity title', () => {});
    it('should display relative timestamp', () => {});
    it('should render activity icon', () => {});
    it('should limit to max 5 items', () => {});
  });

  describe('Empty State', () => {
    it('should show "ยังไม่มีกิจกรรม" when empty', () => {});
  });

  describe('Layout', () => {
    it('should have scrollable container', () => {});
    it('should have dividers between items', () => {});
  });
});
```

**Coverage Target:** 90%+

---

#### Test File 5: `DashboardClient.test.tsx` (~20 tests)

```typescript
describe('DashboardClient', () => {
  const mockCompanyId = 'test-company-123';

  describe('Rendering', () => {
    it('should render without crashing', () => {});
    it('should show loading skeleton initially', () => {});
  });

  describe('Access Control', () => {
    it('should use useCompanyAuth hook', () => {});
    it('should pass companyId to useCompanyAuth', () => {});
    it('should not require specific permission', () => {});
    it('should redirect if not authorized', () => {});
  });

  describe('Data Fetching', () => {
    it('should fetch dashboard metrics via SWR', () => {});
    it('should use correct SWR key', () => {});
    it('should show loading state while fetching', () => {});
    it('should handle fetch errors gracefully', () => {});
  });

  describe('Successful Load', () => {
    it('should render DashboardMetrics with data', () => {});
    it('should render QuickActions with companyId', () => {});
    it('should render RecentActivityFeed', () => {});
  });

  describe('Layout', () => {
    it('should use CompanyShell wrapper', () => {});
    it('should have page title "แดชบอร์ด"', () => {});
    it('should have responsive padding', () => {});
  });

  describe('Integration', () => {
    it('should pass metrics to DashboardMetrics', () => {});
    it('should pass hasPermission to QuickActions', () => {});
  });

  describe('Edge Cases', () => {
    it('should handle missing companyId', () => {});
    it('should handle null metrics data', () => {});
  });
});
```

**Coverage Target:** 90%+

---

### 5.3 Integration Tests

#### Test File: `company-dashboard.actions.test.ts` (~8 tests)

```typescript
describe('webCompanyDashboardGetMetrics Integration', () => {
  const testCompanyId = 'test-integration-company';

  beforeEach(async () => {
    // Setup: Create test jobs and applications in dev database
  });

  afterEach(async () => {
    // Cleanup: Remove test data
  });

  describe('Jobs Metrics', () => {
    it('should count total jobs for company', async () => {});
    it('should count only active jobs (published/ontimer)', async () => {});
    it('should return 0 when no jobs exist', async () => {});
  });

  describe('Applications Metrics', () => {
    it('should count total applications across all jobs', async () => {});
    it('should count only new applications (applied status)', async () => {});
    it('should return 0 when no applications exist', async () => {});
  });

  describe('Error Handling', () => {
    it('should handle invalid companyId gracefully', async () => {});
    it('should not throw on database errors', async () => {});
  });
});
```

**Note:** Integration tests use **real dev database**, not emulator.

---

### 5.4 E2E Tests

#### Test File: `dashboard.spec.ts` (~12 tests)

```typescript
test.describe('Company Dashboard - COMP-R04', () => {
  test.describe('Access Control', () => {
    test('should redirect to login if not authenticated', async ({ page }) => {});
    test('should redirect if not company member', async ({ page }) => {});
    test('should load for approved company members', async ({ page }) => {});
  });

  test.describe('Dashboard Metrics', () => {
    test('should display 4 metric cards', async ({ page }) => {});
    test('should show jobs count', async ({ page }) => {});
    test('should show applications count', async ({ page }) => {});
    test('should navigate to job list when clicking jobs card', async ({ page }) => {});
  });

  test.describe('Quick Actions', () => {
    test('should display 3 action buttons', async ({ page }) => {});
    test('should navigate to create job page', async ({ page }) => {});
    test('should navigate to applications page', async ({ page }) => {});
  });

  test.describe('Recent Activity', () => {
    test('should display recent activity feed', async ({ page }) => {});
  });
});
```

**Test Credentials:** Use `.env.playwright` test company account.

---

### 5.5 Test Coverage Summary

| Test Type | Files | Tests | Target Coverage |
|-----------|-------|-------|-----------------|
| **Unit Tests** | 5 | ~75 | ≥90% |
| **Integration Tests** | 1 | ~8 | N/A (server actions) |
| **E2E Tests** | 1 | ~12 | N/A (user flows) |
| **Total** | 7 | ~95 | - |

---

## 6. Implementation Order (TDD)

### Phase 1: Write ALL Tests (Day 1, RED)

**Duration:** 3-4 hours

**Tasks:**
1. Create test directory structure
2. Write `StatCard.test.tsx` (15 tests) - should FAIL
3. Write `QuickActions.test.tsx` (18 tests) - should FAIL
4. Write `DashboardMetrics.test.tsx` (12 tests) - should FAIL
5. Write `RecentActivityFeed.test.tsx` (10 tests) - should FAIL
6. Write `DashboardClient.test.tsx` (20 tests) - should FAIL
7. Write `company-dashboard.actions.test.ts` (8 tests) - should FAIL
8. Run tests: **ALL SHOULD FAIL** ❌

**Verification:**
```bash
npm run test:unit tests/unit/jobsmarket/company/dashboard/
# Expected: 75 tests, 75 failed, 0 passed
```

---

### Phase 2: Implement StatCard (Day 1, GREEN)

**Duration:** 1 hour

**Tasks:**
1. Create `StatCard.tsx`
2. Implement rendering logic
3. Run tests: `StatCard.test.tsx` should PASS ✅
4. Refactor if needed

**Verification:**
```bash
npm run test:unit tests/unit/jobsmarket/company/dashboard/StatCard.test.tsx
# Expected: 15 tests, 15 passed
```

---

### Phase 3: Implement QuickActions (Day 1-2, GREEN)

**Duration:** 1.5 hours

**Tasks:**
1. Create `QuickActions.tsx`
2. Implement 3 buttons with links
3. Add permission checking (mock initially)
4. Run tests: `QuickActions.test.tsx` should PASS ✅

**Verification:**
```bash
npm run test:unit tests/unit/jobsmarket/company/dashboard/QuickActions.test.tsx
# Expected: 18 tests, 18 passed
```

---

### Phase 4: Implement DashboardMetrics (Day 2, GREEN)

**Duration:** 1 hour

**Tasks:**
1. Create `DashboardMetrics.tsx`
2. Implement 4-card grid using StatCard
3. Run tests: `DashboardMetrics.test.tsx` should PASS ✅

**Verification:**
```bash
npm run test:unit tests/unit/jobsmarket/company/dashboard/DashboardMetrics.test.tsx
# Expected: 12 tests, 12 passed
```

---

### Phase 5: Implement RecentActivityFeed (Day 2, GREEN)

**Duration:** 1 hour

**Tasks:**
1. Create `RecentActivityFeed.tsx`
2. Create `mock-activities.ts`
3. Implement activity list UI
4. Run tests: `RecentActivityFeed.test.tsx` should PASS ✅

---

### Phase 6: Implement Server Action (Day 2-3, GREEN)

**Duration:** 2 hours

**Tasks:**
1. Create `src/lib/database/actions/company-dashboard.ts`
2. Implement `webCompanyDashboardGetMetrics()`
3. Run integration tests: should PASS ✅

**Verification:**
```bash
npx vitest run --config vitest.integration.config.ts tests/integration/jobsmarket/company/dashboard/
# Expected: 8 tests, 8 passed
```

---

### Phase 7: Implement DashboardClient (Day 3, GREEN)

**Duration:** 2 hours

**Tasks:**
1. Create `DashboardClient.tsx`
2. Implement auth check with `useCompanyAuth`
3. Implement SWR data fetching
4. Integrate all child components
5. Run tests: `DashboardClient.test.tsx` should PASS ✅

---

### Phase 8: Implement Route Files (Day 3, GREEN)

**Duration:** 30 minutes

**Tasks:**
1. Create `page.tsx` (server component)
2. Export `DashboardClient` from `_components/index.ts`
3. Run all unit tests: **ALL SHOULD PASS** ✅

**Verification:**
```bash
npm run test:unit tests/unit/jobsmarket/company/dashboard/
# Expected: 75 tests, 75 passed, coverage ≥90%
```

---

### Phase 9: Quality Gates (Day 4)

**Duration:** 2 hours

**Tasks:**
1. **Gate 1: Build** - `npm run build`
2. **Gate 2: Lint** - `npm run lint`
3. **Gate 3: Unit Tests** - Coverage ≥90%
4. Write E2E tests (`dashboard.spec.ts`)
5. **Gate 4: E2E Tests** - All pass
6. Manual browser verification

---

### Phase 10: Documentation & PR (Day 4)

**Duration:** 1 hour

**Tasks:**
1. Create `COMP-R04-COMPLETION-REPORT.md`
2. Update `COMP-STRATEGIC-ASSESSMENT.md` (mark R04 complete)
3. Create PR with conventional commit
4. Fill completion checklist

---

## 7. Questions for SA

### 7.1 RIS Document Clarification

**Question 1:** COMP-R04 does not have a dedicated RIS document. Should we:
- Option A: Extract detailed requirements from COMP-R00 and create a full RIS
- Option B: Proceed with inferred requirements (as outlined in this assessment)
- Option C: Wait for RIS to be written first

**Recommendation:** Option B - proceed with inferred requirements (dashboard is standard pattern)

---

### 7.2 Recent Activity Feed

**Question 2:** Recent activity feed requires activity tracking. Should we:
- Option A: Use mock data initially (quick implementation, defer real data)
- Option B: Infer from job/application timestamps (limited activity types)
- Option C: Design and implement full activity logging system (complex, out of scope)

**Recommendation:** Option A - mock data (can be replaced later without breaking tests)

---

### 7.3 Server Action Design

**Question 3:** For dashboard metrics, should we:
- Option A: Create new `webCompanyDashboardGetMetrics()` action (single round trip)
- Option B: Use existing `webJobGetByFilter` + `webJobApplicationGetByFilter` (multiple queries, client aggregation)

**Recommendation:** Option A - new action (better performance, cleaner API)

---

### 7.4 COMP-R09 (Browse Candidates) Status

**Question 4:** Quick Actions includes "Browse Candidates" button linking to COMP-R09 (not implemented). Should we:
- Option A: Show button but disabled with tooltip "เร็วๆ นี้" (Coming soon)
- Option B: Hide button until COMP-R09 is implemented
- Option C: Link to placeholder page

**Recommendation:** Option A - show disabled (communicates feature exists, prevents layout shift)

---

## 8. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **No dedicated RIS** | Medium | Already occurred | Use inferred specs, get SA approval |
| **Activity feed data unclear** | Low | Medium | Use mock data initially |
| **Metrics query performance** | Medium | Low | Use SWR caching, optimize queries |
| **COMP-R09 dependency** | Low | High | Show disabled button |

---

## 9. Success Criteria

### 9.1 Functional Requirements

- ✅ Dashboard displays 4 metric cards (jobs/applications counts)
- ✅ All cards are clickable and navigate correctly
- ✅ Quick Actions section shows 3 buttons
- ✅ "Create Job" button only visible if user has `post_jobs` permission
- ✅ Recent activity feed shows mock data (5 items max)
- ✅ Auth check redirects unauthorized users
- ✅ Page loads within 1.5 seconds

### 9.2 Test Requirements

- ✅ All 75 unit tests pass
- ✅ Unit test coverage ≥90%
- ✅ All 8 integration tests pass
- ✅ All 12 E2E tests pass
- ✅ No console errors in browser

### 9.3 Quality Gates

- ✅ Gate 1 (Build): PASS
- ✅ Gate 2 (Lint): PASS - 0 errors
- ✅ Gate 3 (Unit Tests): PASS - 75/75 tests, ≥90% coverage
- ✅ Gate 4 (E2E Tests): PASS - 12/12 tests

---

## 10. Deliverables

**Code Files:**
```
src/app/jobsmarket/companies/[id]/dashboard/
├── page.tsx
└── _components/
    ├── DashboardClient.tsx
    ├── DashboardMetrics.tsx
    ├── StatCard.tsx
    ├── QuickActions.tsx
    ├── RecentActivityFeed.tsx
    ├── mock-activities.ts
    └── index.ts

src/lib/database/actions/
└── company-dashboard.ts (new)

tests/unit/jobsmarket/company/dashboard/
├── StatCard.test.tsx
├── QuickActions.test.tsx
├── DashboardMetrics.test.tsx
├── RecentActivityFeed.test.tsx
└── DashboardClient.test.tsx

tests/integration/jobsmarket/company/dashboard/
└── company-dashboard.actions.test.ts

tests/e2e/jobsmarket/company/
└── dashboard.spec.ts
```

**Documentation:**
```
docs/jobsmarket/implementation/
└── COMP-R04-COMPLETION-REPORT.md
```

---

## 11. Next Steps

**After SA Approval:**

1. **Immediate:** Start Phase 1 (Write all tests - RED)
2. **Day 1-4:** Follow TDD implementation order
3. **Day 4:** Create PR and completion report
4. **After COMP-R04:** Move to COMP-R05 (Job List) with TDD

---

**Document Status:** ✅ Ready for SA Review
**Approved by:** (Pending SA approval)
**Date:** 2025-12-20
