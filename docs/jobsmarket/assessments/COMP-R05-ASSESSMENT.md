# COMP-R05 Assessment: Jobs List

**Route:** `/companies/[id]/dashboard/jobs`
**Assessed:** 2025-12-21
**Assessor:** Claude Code
**Status:** ✅ Ready for TDD Phase 1

---

## 1. Route Summary

| Property | Value |
|----------|-------|
| Route Path | `/companies/[id]/dashboard/jobs` |
| Route ID | COMP-R05 |
| Complexity | High |
| Shell | Company Shell (from COMP-R00) |
| Primary Features | Job list, filters, search, bulk actions, pagination |
| Estimated Effort | 13-18 hours with TDD |

### Key Features (from RIS Section 3)

| Feature | Priority | Description |
|---------|----------|-------------|
| Status Tabs | P0 | Filter by all/active/draft/paused/closed |
| Bulk Actions | P0 | Select multiple jobs for bulk operations |
| Search | P0 | Search jobs by title (debounced 300ms) |
| Sortable Columns | P0 | Sort by title, applications, views, date |
| Duplicate Job | P1 | Create copy of existing job |
| Pagination | P0 | Navigate through job list pages (offset-based) |
| Job Actions | P0 | View, edit, pause, resume, publish, close, delete |
| Mobile View | P0 | Card list for mobile devices |

---

## 2. Existing Code Audit

### 2.1 Reusable from COMP-R00/R01/R04

| Asset | Location | Reuse Level | Notes |
|-------|----------|-------------|-------|
| **CompanyShell** | `src/app/jobsmarket/companies/[id]/layout.tsx` | ✅ Direct | Full shell with sidebar |
| **useCompanyAuth** | `src/hooks/jobsmarket/company/use-company-auth.ts` | ✅ Direct | Auth + access control |
| **useCompanyPermission** | `src/hooks/jobsmarket/company/use-company-permission.ts` | ✅ Direct | Permission checks |
| **DashboardMetrics** | `src/app/jobsmarket/companies/[id]/dashboard/_components/` | Reference | Links already point to jobs route |

### 2.2 Existing Job-Related Code

| Asset | Location | Status | Notes |
|-------|----------|--------|-------|
| **Job Types** | `src/types/job.types.ts` | ✅ Complete | `JobStatus`, `FirebaseJobData`, `IJobReturnData` |
| **Job Repository** | `src/lib/database/repositories/jobs-repository.ts` | ✅ Complete | CRUD operations |
| **Job Actions (Basic)** | `src/lib/database/actions/jobs.ts` | ✅ Exists | `getById`, `getByFilter`, `create`, `update`, `delete` |
| **Job Applications Repository** | `src/lib/database/repositories/job-applications-repository.ts` | ✅ Complete | For counting applications |

**Missing:** Status-specific actions (publish, unpublish, close), bulk actions, duplicate, aggregation queries

### 2.3 Database Actions Available

| Action | Location | Can Use? | Notes |
|--------|----------|----------|-------|
| `webJobGetById` | `src/lib/database/actions/jobs.ts:9` | ✅ Yes | Fetch single job |
| `webJobGetByFilter` | `src/lib/database/actions/jobs.ts:18` | ✅ Yes | Base for list query |
| `webJobCreate` | `src/lib/database/actions/jobs.ts:36` | ✅ Yes | For duplicate |
| `webJobUpdate` | `src/lib/database/actions/jobs.ts:49` | ✅ Yes | For status changes |
| `webJobDelete` | `src/lib/database/actions/jobs.ts:62` | ✅ Yes | For delete action |

**Need to Create:**
- `fetchCompanyJobs(companyId, {status, query, page, sort})` - Paginated list with filters
- `fetchJobStatusCounts(companyId)` - Tab badge counts
- `webJobPostSet(jobId, status)` - Publish/unpublish
- `webJobDeactivate(jobId)` - Close job
- `webJobDuplicate(jobId)` - Copy job
- `webJobBulkUnpublish(jobIds[])` - Bulk pause
- `webJobBulkClose(jobIds[])` - Bulk close

---

## 3. Components to Create

### 3.1 Page Components

| Component | Location | Dependencies | Priority |
|-----------|----------|--------------|----------|
| `page.tsx` | `src/app/jobsmarket/companies/[id]/dashboard/jobs/` | JobsListClient | P0 |
| `JobsListClient` | `_components/JobsListClient.tsx` | All below | P0 |

### 3.2 UI Components

| Component | Purpose | Complexity | Est. Lines | Test Priority |
|-----------|---------|------------|------------|---------------|
| **JobStatusBadge** | Color-coded status badge | Low | ~30 | P0 (Start here) |
| **JobListEmpty** | Empty state | Low | ~40 | P0 |
| **JobListSkeleton** | Loading skeleton | Low | ~40 | P0 |
| **JobListHeader** | Title, search, create btn | Low | ~50 | P0 |
| **StatusTabs** | Filter tabs with badges | Medium | ~80 | P0 |
| **JobTableHeader** | Sortable columns | Low | ~60 | P0 |
| **JobRow** | Single job row | Medium | ~80 | P0 |
| **JobCard** | Single job card (mobile) | Medium | ~80 | P0 |
| **JobActionMenu** | Row actions dropdown | Medium | ~100 | P0 |
| **JobTable** | Desktop table view | Medium | ~100 | P0 |
| **JobCardList** | Mobile card view | Medium | ~60 | P0 |
| **BulkActionsBar** | Floating bulk bar | Medium | ~100 | P0 |
| **CloseJobModal** | Close confirmation | Low | ~50 | P0 |
| **DeleteJobModal** | Delete confirmation | Low | ~50 | P0 |
| **BulkActionModal** | Bulk confirm | Medium | ~70 | P0 |

**Total Components:** ~15
**Estimated Total Lines:** ~970

---

## 4. Hooks to Create

| Hook | Purpose | Returns | Complexity | Priority |
|------|---------|---------|------------|----------|
| `useCompanyJobs` | Fetch jobs with filters/pagination | `{ jobs, isLoading, mutate, counts }` | High | P0 |
| `useJobActions` | Single job mutations | `{ publish, unpublish, close, delete, duplicate }` | Medium | P0 |
| `useBulkJobActions` | Bulk operations | `{ bulkPause, bulkClose, selection state }` | Medium | P0 |

**Location:** `src/hooks/jobsmarket/company/`

---

## 5. Server Actions to Create/Use

### 5.1 Data Fetching (Read)

| Action | Exists? | Location | Notes | BLS Ref |
|--------|---------|----------|-------|---------|
| `fetchCompanyJobs` | ❌ Create | `src/lib/database/actions/jobs.ts` | Paginated, filtered | BLS-07-01 |
| `fetchJobStatusCounts` | ❌ Create | `src/lib/database/actions/jobs.ts` | For tab badges | BLS-07-01 |

### 5.2 Mutations (Write)

| Action | Exists? | Location | Notes | BLS Ref |
|--------|---------|----------|-------|---------|
| `webJobPostSet` | ❌ Create | `src/lib/database/actions/jobs.ts` | Publish/schedule job | BLS-07-05, BLS-07-06 |
| `webJobUnpublish` | ❌ Create | `src/lib/database/actions/jobs.ts` | Pause job | BLS-07-07 |
| `webJobDeactivate` | ❌ Create | `src/lib/database/actions/jobs.ts` | Close job | BLS-07-08 |
| `webJobDelete` | ✅ Exists | `src/lib/database/actions/jobs.ts:62` | Delete draft (add validation) | BLS-07-09 |
| `webJobDuplicate` | ❌ Create | `src/lib/database/actions/jobs.ts` | Copy job as draft | BLS-07-10 |
| `webJobBulkUnpublish` | ❌ Create | `src/lib/database/actions/job-bulk-actions.ts` | Bulk pause | BLS-07-07 |
| `webJobBulkClose` | ❌ Create | `src/lib/database/actions/job-bulk-actions.ts` | Bulk close | BLS-07-08 |

---

## 6. Test Plan (TDD Phase 1)

### 6.1 Unit Tests - Components (~52 tests)

#### JobStatusBadge Tests (5)
- [ ] renders "เผยแพร่แล้ว" for `published` status (green badge)
- [ ] renders "ร่าง" for `draft` status (gray badge)
- [ ] renders "หยุดชั่วคราว" for `unpublished` status (yellow badge)
- [ ] renders "ปิดแล้ว" for `closed` status (red badge)
- [ ] renders "รอเผยแพร่" for `ontimer` status (blue badge)

#### JobListHeader Tests (5)
- [ ] renders title "ประกาศงาน"
- [ ] renders search input with placeholder
- [ ] renders create button linking to `/jobs/new`
- [ ] search input triggers debounced callback (300ms)
- [ ] create button hidden if user lacks `post_jobs` permission

#### StatusTabs Tests (5)
- [ ] renders all 5 tabs (all, active, draft, paused, closed)
- [ ] shows count badges on each tab
- [ ] highlights active tab based on `status` prop
- [ ] clicking tab calls `onTabChange` with correct status
- [ ] disables all tabs when `isLoading` is true

#### JobTable Tests (6)
- [ ] renders table headers with correct Thai labels
- [ ] renders job rows from `jobs` prop
- [ ] shows `JobListEmpty` when jobs array is empty
- [ ] shows `JobListSkeleton` when `isLoading` is true
- [ ] checkbox in header selects/deselects all jobs
- [ ] displays pagination controls when `totalPages > 1`

#### JobRow Tests (8)
- [ ] renders job title
- [ ] renders department (`jobFunctionText`)
- [ ] renders application count with badge if `unreadApplicationCount > 0`
- [ ] renders view count
- [ ] renders posted date in Thai format
- [ ] renders `JobStatusBadge` with correct status
- [ ] clicking row navigates to job detail page
- [ ] action menu opens on menu button click

#### JobActionMenu Tests (9)
- [ ] shows "ดู" (View) action always
- [ ] shows "แก้ไข" (Edit) when job status is not `closed`
- [ ] shows "หยุดชั่วคราว" (Pause) when status is `published`
- [ ] shows "เปิดรับ" (Resume) when status is `unpublished`
- [ ] shows "เผยแพร่" (Publish) when status is `draft` or `ontimer`
- [ ] shows "ปิดรับสมัคร" (Close) when status is not `closed`
- [ ] shows "คัดลอก" (Duplicate) always
- [ ] shows "ลบ" (Delete) only for `draft` status with `applicationCount === 0`
- [ ] calls correct action handler on menu item click

#### BulkActionsBar Tests (5)
- [ ] hidden when `selectedCount === 0`
- [ ] displays selected count (e.g., "เลือกแล้ว 3 รายการ")
- [ ] shows "หยุดทั้งหมด" button when any selected job is `published`
- [ ] shows "ปิดทั้งหมด" button when any selected job is not `closed`
- [ ] "ล้างการเลือก" button clears all selections

#### Modal Tests (6)
- [ ] `CloseJobModal` displays job title and warning text
- [ ] `CloseJobModal` confirm button triggers `onConfirm` callback
- [ ] `DeleteJobModal` displays job title and permanent warning
- [ ] `DeleteJobModal` confirm button disabled if job has applications
- [ ] `BulkActionModal` displays selected count
- [ ] `BulkActionModal` confirm button triggers bulk action

#### Empty/Skeleton Tests (3)
- [ ] `JobListEmpty` shows "ลงประกาศงานแรก" CTA when `reason === 'no-jobs'`
- [ ] `JobListEmpty` shows "ไม่มีงานในสถานะนี้" when `reason === 'filtered'`
- [ ] `JobListSkeleton` renders 5 placeholder rows

### 6.2 Unit Tests - Hooks (~15 tests)

#### useCompanyJobs Tests (7)
- [ ] fetches jobs on mount with `companyId`
- [ ] returns `isLoading: true` while fetching
- [ ] returns `jobs` array on success
- [ ] returns `statusCounts` object on success
- [ ] refetches when `status` filter changes
- [ ] refetches when `page` changes
- [ ] handles fetch error gracefully

#### useJobActions Tests (5)
- [ ] `publishJob` updates job status to `published`
- [ ] `unpublishJob` updates job status to `unpublished`
- [ ] `closeJob` updates job status to `closed` and `isActive: false`
- [ ] `deleteJob` removes job document
- [ ] `duplicateJob` creates new job with status `draft`

#### useBulkJobActions Tests (3)
- [ ] `bulkPause` updates multiple jobs to `unpublished`
- [ ] `bulkClose` updates multiple jobs to `closed`
- [ ] handles partial failures (some jobs succeed, some fail)

### 6.3 Unit Tests - Utils (~5 tests)

Create `src/lib/utils/jobs.ts`:

- [ ] `getJobStatusColor(status)` returns correct color for each status
- [ ] `formatJobDate(timestamp)` formats Thai date correctly
- [ ] `canDeleteJob(job)` returns true only for draft with 0 applications
- [ ] `getAvailableActions(job)` returns correct actions based on status
- [ ] `sortJobs(jobs, field, direction)` sorts jobs correctly

### 6.4 E2E Tests (~20 tests)

**File:** `tests/e2e/jobsmarket/company/jobs-list.spec.ts`

#### Happy Paths (11)
- [ ] navigate to jobs list from dashboard total jobs card
- [ ] view jobs displayed in table format
- [ ] filter jobs by clicking "กำลังเปิดรับ" (active) tab
- [ ] search jobs by title using search input (debounced)
- [ ] sort jobs by clicking "ใบสมัคร" (applications) column header
- [ ] navigate to job detail by clicking job row
- [ ] navigate to create job by clicking "+ ลงประกาศงานใหม่" button
- [ ] publish a draft job using action menu
- [ ] unpublish a published job (pause)
- [ ] close a job with confirmation modal
- [ ] duplicate a job (creates new draft)

#### Error Scenarios (5)
- [ ] unauthorized user redirected to login
- [ ] non-company-member denied access (403)
- [ ] network error shows retry button
- [ ] delete blocked for job with applications (shows error message)
- [ ] bulk action partial failure shows appropriate message

#### Edge Cases (4)
- [ ] empty list (no jobs yet) shows "ลงประกาศงานแรก" CTA
- [ ] filtered empty (no jobs match filter) shows "ไม่มีงานในสถานะนี้"
- [ ] mobile view (viewport < 768px) shows card list instead of table
- [ ] pagination navigates to next page and updates URL

---

## 7. Build Order (Dependency Tree)

### Phase 1: Foundation (~2 hours)

```
1. Types
   ├── Create src/types/jobsmarket/jobs-list.types.ts
   │   ├── JobListItem
   │   ├── StatusCounts
   │   ├── SortConfig
   │   └── ActionModalState
   └── Write unit tests for types (if applicable)

2. Utils
   ├── Create src/lib/utils/jobs.ts
   │   ├── getJobStatusColor
   │   ├── formatJobDate
   │   ├── canDeleteJob
   │   ├── getAvailableActions
   │   └── sortJobs
   └── Write 5 unit tests

3. Server Actions (extend existing file)
   ├── Extend src/lib/database/actions/jobs.ts
   │   ├── fetchCompanyJobs
   │   ├── fetchJobStatusCounts
   │   ├── webJobPostSet
   │   ├── webJobUnpublish
   │   ├── webJobDeactivate
   │   └── webJobDuplicate
   ├── Create src/lib/database/actions/job-bulk-actions.ts
   │   ├── webJobBulkUnpublish
   │   └── webJobBulkClose
   └── Write 5 integration tests
```

### Phase 2: Hooks (~2 hours)

```
4. Hooks (depends on server actions)
   ├── Create src/hooks/jobsmarket/company/use-company-jobs.ts
   ├── Create src/hooks/jobsmarket/company/use-job-actions.ts
   ├── Create src/hooks/jobsmarket/company/use-bulk-job-actions.ts
   └── Write 15 unit tests
```

### Phase 3: Atomic Components (~2 hours)

```
5. Simple Components
   ├── JobStatusBadge.tsx → 5 tests
   ├── JobListEmpty.tsx → 2 tests
   └── JobListSkeleton.tsx → 1 test
```

### Phase 4: Composite Components (~3 hours)

```
6. Row/Card Components
   ├── JobRow.tsx (depends on JobStatusBadge) → 8 tests
   ├── JobCard.tsx (depends on JobStatusBadge) → Similar to JobRow
   └── JobTableHeader.tsx → Part of JobTable tests

7. Interactive Components
   ├── JobActionMenu.tsx → 9 tests
   ├── CloseJobModal.tsx → 2 tests
   ├── DeleteJobModal.tsx → 2 tests
   └── BulkActionModal.tsx → 2 tests
```

### Phase 5: Container Components (~3 hours)

```
8. Table/List Components
   ├── JobTable.tsx (depends on JobRow, JobTableHeader) → 6 tests
   ├── JobCardList.tsx (depends on JobCard) → Similar pattern
   ├── StatusTabs.tsx → 5 tests
   ├── BulkActionsBar.tsx → 5 tests
   └── JobListHeader.tsx → 5 tests
```

### Phase 6: Page Assembly (~2 hours)

```
9. Page Orchestrator
   ├── JobsListClient.tsx (composes all above) → Integration-level tests
   └── page.tsx (route entry) → E2E coverage
```

### Phase 7: E2E Tests (~2 hours)

```
10. E2E Test Suite
    └── tests/e2e/jobsmarket/company/jobs-list.spec.ts → 20 tests
```

---

## 8. Risk Assessment

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Server actions may not exist | High | ✅ Checked - basic CRUD exists, need extensions | Mitigated |
| Complex bulk action state | Medium | Use reducer pattern or simple Set | Planned |
| Mobile responsiveness | Medium | Separate `JobCardList` component, test early | Planned |
| Pagination edge cases | Low | Thorough E2E tests | Planned |
| Application count aggregation | High | Fetch counts in single query per BLS-07-01 | Planned |
| MeiliSearch integration | Medium | Stub for now, implement in server actions later | Deferred |

---

## 9. Estimated Effort

| Phase | Task | Est. Hours | Notes |
|-------|------|------------|-------|
| **Phase 1** | Foundation (types, utils, actions) | 2h | Server actions are critical |
| **Phase 2** | Hooks (3 hooks) | 2h | Complex data fetching logic |
| **Phase 3** | Atomic components (3) | 2h | Simple, fast to implement |
| **Phase 4** | Composite components (6) | 3h | Modals, menus, rows |
| **Phase 5** | Container components (5) | 3h | Tables, lists, filters |
| **Phase 6** | Page assembly (2) | 2h | Orchestration logic |
| **Phase 7** | E2E tests (20) | 2-3h | Full flow coverage |
| **Quality Gates** | Build, lint, dev, unit, E2E | 1-2h | Gate verification |
| **TOTAL** | | **17-20 hours** | ~2.5 days |

### Breakdown by Test Type

| Test Type | Count | Est. Hours |
|-----------|-------|------------|
| Unit Tests (components) | ~52 | Write in Phase 3-5 |
| Unit Tests (hooks) | ~15 | Write in Phase 2 |
| Unit Tests (utils) | ~5 | Write in Phase 1 |
| Integration Tests | ~5 | Write in Phase 1 |
| E2E Tests | ~20 | Write in Phase 7 |
| **TOTAL TESTS** | **~97** | **Included in phases above** |

---

## 10. Approval Checklist

- [x] RIS COMP-R05 fully reviewed (580 lines)
- [x] RIS COMP-R00 cross-cutting reviewed (sections 2-4)
- [x] BLS-07 job management reviewed (actions 01-11)
- [x] Existing code audited
  - [x] Jobs repository exists
  - [x] Basic job actions exist
  - [x] Job types exist
  - [x] Company hooks exist (auth, permission)
- [x] All components identified (~15)
- [x] All hooks identified (3)
- [x] All server actions identified (~9 new)
- [x] Test plan complete (~97 tests)
- [x] Build order defined (7 phases)
- [ ] **Ready for TDD Phase 1** ← AWAITING SA APPROVAL

---

## 11. Key Decisions from RIS

| Decision | Chosen | Rationale | RIS Reference |
|----------|--------|-----------|---------------|
| Pagination type | Offset-based | Simpler, jobs list won't be huge | Section 4.3 |
| Filter state persistence | URL params | Shareable, bookmarkable | Section 5.4 |
| Mobile view | Card list | Table too wide for mobile | Decision Log |
| Search debounce | 300ms | Reduce API calls | Decision Log |
| `ontimer` in "active" tab | Yes | Lazy evaluation - shows as published to candidates | Decision Log, Section 6.2 |
| Delete restriction | Draft only, no apps | Prevent data loss | Section 6.2, BLS-07-09 |
| Sort options | 4 columns | title, applications, views, created | Section 7.3 |

---

## 12. Job Status State Machine (from BLS-07)

```
                 ┌─────────────┐
                 │    draft    │
                 └──────┬──────┘
                        │ publish / schedule
            ┌───────────┼───────────┐
            ▼           │           ▼
     ┌──────────┐       │    ┌───────────┐
     │ published│       │    │  ontimer  │
     └────┬─────┘       │    └─────┬─────┘
          │             │          │ scheduled time
          │ unpublish   │          ▼
          ▼             │    ┌───────────┐
     ┌────────────┐     │    │ published │
     │ unpublished│◄────┘    └───────────┘
     └──────┬─────┘
            │ publish
            ▼
     ┌───────────┐      ┌────────┐
     │ published │ ─────► closed │  (from any active state)
     └───────────┘      └────────┘
```

**Allowed Transitions:**

| From | To | Action | Server Function | BLS Ref |
|------|----|----|---|---------|
| `draft` | `published` | Publish | `webJobPostSet` | BLS-07-05 |
| `draft` | `ontimer` | Schedule | `webJobPostSet` | BLS-07-06 |
| `draft` | `closed` | Close | `webJobDeactivate` | BLS-07-08 |
| `draft` | (deleted) | Delete | `webJobDelete` | BLS-07-09 |
| `ontimer` | `published` | Early activate | `webJobPostSet` | BLS-07-05 |
| `ontimer` | `unpublished` | Cancel schedule | `webJobUnpublish` | BLS-07-07 |
| `ontimer` | `closed` | Close | `webJobDeactivate` | BLS-07-08 |
| `published` | `unpublished` | Pause | `webJobUnpublish` | BLS-07-07 |
| `published` | `closed` | Close | `webJobDeactivate` | BLS-07-08 |
| `unpublished` | `published` | Resume | `webJobPostSet` | BLS-07-05 |
| `unpublished` | `closed` | Close | `webJobDeactivate` | BLS-07-08 |

---

## 13. Data Contract (from BLS-07-01)

### JobListItem Interface
```typescript
interface JobListItem {
  uid: string;
  title: string;
  jobStatus: JobStatus;
  isActive: boolean;
  jobFunctionText?: string;           // Department
  postStartDate?: number;
  postExpiryDate?: number;
  applicationCount: number;            // Total applications
  unreadApplicationCount: number;      // For badge
  viewCount: number;
  createdAt: number;
  updatedAt: number;
}
```

### StatusCounts Interface
```typescript
interface StatusCounts {
  total: number;
  active: number;         // published + ontimer
  draft: number;
  paused: number;         // unpublished
  closed: number;
}
```

---

## 14. Thai Copy Reference (from RIS Appendix C)

| Key | Thai Text | English Equivalent |
|-----|-----------|-------------------|
| `page_title` | ประกาศงาน | Job Postings |
| `search_placeholder` | ค้นหาตำแหน่งงาน | Search job titles |
| `btn_create` | + ลงประกาศงานใหม่ | + Create New Job |
| `tab_all` | ทั้งหมด | All |
| `tab_active` | กำลังเปิดรับ | Active |
| `tab_draft` | ร่าง | Draft |
| `tab_paused` | หยุดชั่วคราว | Paused |
| `tab_closed` | ปิดแล้ว | Closed |
| `col_title` | ตำแหน่ง | Position |
| `col_dept` | แผนก | Department |
| `col_apps` | ใบสมัคร | Applications |
| `col_views` | ผู้เข้าชม | Views |
| `col_posted` | วันที่ลง | Posted Date |
| `col_status` | สถานะ | Status |
| `action_view` | ดู | View |
| `action_edit` | แก้ไข | Edit |
| `action_pause` | หยุดชั่วคราว | Pause |
| `action_resume` | เปิดรับ | Resume |
| `action_publish` | เผยแพร่ | Publish |
| `action_close` | ปิดรับสมัคร | Close Applications |
| `action_duplicate` | คัดลอก | Duplicate |
| `action_delete` | ลบ | Delete |
| `bulk_pause` | หยุดทั้งหมด | Pause All |
| `bulk_close` | ปิดทั้งหมด | Close All |
| `empty_title` | ยังไม่มีประกาศงาน | No Job Postings |
| `empty_cta` | ลงประกาศงานแรก | Create First Job |
| `filter_empty` | ไม่มีงานในสถานะนี้ | No jobs in this status |

---

## Next Step

**Status:** ✅ **READY FOR TDD PHASE 1**

**Awaiting:** PM/SA approval to proceed

**After Approval:** Begin TDD Phase 1 by writing ALL tests FIRST (RED phase):
1. Start with utils tests (5 tests)
2. Then component tests (52 tests)
3. Then hook tests (15 tests)
4. Then integration tests (5 tests)
5. Finally E2E tests (20 tests)
6. **Verify ALL tests FAIL before writing any implementation code**

---

*Assessment completed: 2025-12-21*
*Assessor: Claude Code*
*Total Tests Planned: ~97*
*Estimated Effort: 17-20 hours (2.5 days with TDD)*
