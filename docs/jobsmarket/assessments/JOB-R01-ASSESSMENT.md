# JOB-R01: Job Search & Listings - Implementation Assessment

**Date:** 2025-12-31
**Route:** `/jobs` (Job Search & Filtering)
**Assessor:** Developer (Claude Code)
**Status:** Ready for Implementation

---

## Executive Summary

JOB-R01 is a **medium complexity** route implementing job search with advanced filtering, pagination, and save functionality. The assessment reveals that **~70% of required components already exist** from JOB-R00, primarily needing:
- New page components (search interface, results display, pagination)
- URL sync logic with filter state
- SWR integration for search results
- **Missing server actions** for job search and save functionality

**Estimated Duration:** 3-4 days
**Key Risk:** Server actions (`searchPublicJobs`, `saveJob`, `unsaveJob`) **do not exist yet** and must be created first.

---

## 1. Route Analysis

### 1.1 Page Structure

```
/jobs Route Structure
│
├── Shell Detection Layer
│   ├── Guest → Public Shell
│   ├── Candidate → Candidate Shell
│   └── Company → Company Shell
│
├── Search Header
│   ├── Search input (keyword)
│   ├── Location dropdown
│   └── Search button
│
├── Main Content (2-column desktop)
│   ├── LEFT: Filter Sidebar (300px)
│   │   ├── Active filter chips
│   │   ├── Clear all button
│   │   ├── Job Type (checkboxes)
│   │   ├── Salary Range (presets)
│   │   ├── Location (multi-select)
│   │   ├── Education (checkboxes)
│   │   ├── Experience (radio)
│   │   └── Remote (radio)
│   │
│   └── RIGHT: Results Area
│       ├── Results header (count + sort)
│       ├── Job cards list
│       └── Pagination
│
└── Mobile Layout (1-column)
    ├── Search header (compact)
    ├── Filter button (opens bottom sheet)
    ├── Job cards list
    └── Pagination (compact)
```

### 1.2 Component Hierarchy

```typescript
JobsPage (Server Component - URL parsing)
├── SearchHeader (Client - search input + location)
├── JobFilters (Client - desktop sidebar) ✅ EXISTS
│   ├── ActiveFiltersChips ✅ EXISTS
│   ├── FilterSection (collapsible) ✅ EXISTS
│   ├── CheckboxGroup ✅ EXISTS
│   ├── SalaryRangeFilter ✅ EXISTS
│   └── RadioGroup ✅ EXISTS
├── JobFiltersMobile (Client - bottom sheet) ✅ EXISTS
├── ResultsHeader (Client - count + sort) ❌ NEW
├── JobListResults (Client - SWR data) ❌ NEW
│   ├── JobCard (list variant) ✅ EXISTS
│   │   ├── SalaryDisplay ✅ EXISTS
│   │   ├── LocationBadge ✅ EXISTS
│   │   └── SaveJobButton ✅ EXISTS
│   ├── LoadingSkeletons ❌ NEW
│   └── EmptyState ❌ NEW
├── Pagination (Client) ❌ NEW
└── LoginPromptModal (Client) ✅ EXISTS
```

### 1.3 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. URL Parameters → Parse to FilterState                    │
│    ?q=developer&type=fulltime&page=2                        │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Client: useJobSearch Hook (SWR)                          │
│    - SWR Key: jobs-list-${filterHash}                       │
│    - Fetcher: searchPublicJobs(params) ❌ MISSING           │
│    - Returns: JobSearchResponse                             │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Server Action: searchPublicJobs ❌ MISSING               │
│    - Try MeiliSearch first (5s timeout)                     │
│    - Fallback to Firestore if timeout                       │
│    - Return JobSearchResponse                               │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Display Results                                           │
│    - Map jobs to JobCard components                         │
│    - Show empty state if 0 results                          │
│    - Show pagination if > 20 results                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Existing Code Audit (JOB-R00)

### 2.1 ✅ Components Ready to Use

| Component | File | Lines | Status |
|-----------|------|-------|--------|
| JobCard | `src/components/jobsmarket/jobs/JobCard.tsx` | 265 | ✅ 3 variants ready |
| JobFilters | `src/components/jobsmarket/jobs/JobFilters.tsx` | 380 | ✅ Desktop + mobile |
| SaveJobButton | `src/components/jobsmarket/jobs/SaveJobButton.tsx` | 81 | ✅ Icon + button |
| SalaryDisplay | `src/components/jobsmarket/jobs/SalaryDisplay.tsx` | 57 | ✅ All formats |
| LocationBadge | `src/components/jobsmarket/jobs/LocationBadge.tsx` | 25 | ✅ Ready |
| JobStatusBadge | `src/components/jobsmarket/jobs/JobStatusBadge.tsx` | 33 | ✅ Ready |
| LoginPromptModal | `src/components/jobsmarket/jobs/LoginPromptModal.tsx` | 83 | ✅ 3 action types |
| PublicShell | `src/components/jobsmarket/jobs/PublicHeader.tsx` + `PublicFooter.tsx` | ~5K | ✅ Ready |

**Total:** 8 components, ~924 lines of code reusable from JOB-R00.

### 2.2 ✅ Types & Constants Ready

| File | Exports | Status |
|------|---------|--------|
| `src/types/public-jobs.ts` | All job types | ✅ Complete |
| `src/lib/constants/jobsmarket/job-filters.ts` | All filter constants | ✅ Complete |

**Types available:**
- `JobCardData`, `JobSearchParams`, `JobSearchResponse`
- `JobFilterState`, `JobAvailabilityState`, `LoginPromptAction`
- `EmploymentType`, `EducationLevel`, `ExperienceRange`, `WorkMode`, `JobSortOption`

**Constants available:**
- `EMPLOYMENT_TYPES`, `EDUCATION_LEVELS`, `EXPERIENCE_RANGES`, `WORK_MODES`, `JOB_SORT_OPTIONS`, `SALARY_PRESETS`

### 2.3 ❌ Server Actions MISSING

**CRITICAL:** The following server actions referenced in JOB-R01 RIS **do not exist**:

| Action | Signature | Expected File | Status |
|--------|-----------|---------------|--------|
| `searchPublicJobs` | `(params: JobSearchParams) => Promise<JobSearchResponse>` | `src/lib/database/actions/jobs.ts` | ❌ MISSING |
| `saveJob` | `(params: SaveJobParams) => Promise<SaveJobResult>` | `src/lib/database/actions/candidate-information.ts` | ❌ MISSING |
| `unsaveJob` | `(params: SaveJobParams) => Promise<SaveJobResult>` | `src/lib/database/actions/candidate-information.ts` | ❌ MISSING |
| `getSavedJobs` | `(candidateId: string) => Promise<string[]>` | `src/lib/database/actions/candidate-information.ts` | ❌ MISSING |

**Existing actions in `jobs.ts`:**
- `webJobGetById` (get single job by ID)
- `webJobCreate`, `webJobUpdate`, `webJobDelete` (CRUD for companies)
- `webJobPublish`, `webJobUnpublish` (status changes)
- `webJobGetList` (list for company dashboard - NOT public search)

**Conclusion:** We need to create **4 new server actions** before implementing JOB-R01.

---

## 3. New Deliverables

### 3.1 Server Actions (CRITICAL - Phase 0)

**Must be created BEFORE page components:**

#### A. `searchPublicJobs` - Job Search with MeiliSearch Fallback

```typescript
// src/lib/database/actions/jobs.ts

/**
 * BLS-02 DISC-001 to DISC-010: Public Job Search
 * Searches jobs using MeiliSearch with Firestore fallback
 */
export async function searchPublicJobs(
  params: JobSearchParams
): Promise<JobSearchResponse> {
  // 1. Construct MeiliSearch filter expressions
  const baseFilters = [
    'isActive = true',
    'jobStatus IN [published, ontimer]',
    `postStartDate <= ${Date.now()}`
  ];

  // 2. Add user filters (location, type, salary, etc.)
  // 3. Try MeiliSearch with 5s timeout
  // 4. Fallback to Firestore if timeout
  // 5. Return JobSearchResponse
}
```

**Complexity:** High (MeiliSearch integration + fallback logic)
**Estimated:** 4-6 hours
**Dependencies:** MeiliSearch client configuration

#### B. `saveJob` - Save Job to Candidate List

```typescript
// src/lib/database/actions/candidate-information.ts

/**
 * BLS-02 DISC-019, DISC-020: Save Job
 * Creates entry in candidate_saved_jobs collection
 */
export async function saveJob(params: SaveJobParams): Promise<SaveJobResult> {
  // 1. Validate candidate authentication
  // 2. Check job exists and is active
  // 3. Create document in candidate_saved_jobs
  // 4. Return success/error
}
```

**Complexity:** Low
**Estimated:** 1-2 hours
**Dependencies:** `candidate_saved_jobs` collection

#### C. `unsaveJob` - Remove Job from Saved List

```typescript
/**
 * BLS-02 DISC-024, DISC-025: Unsave Job
 * Deletes entry from candidate_saved_jobs collection
 */
export async function unsaveJob(params: SaveJobParams): Promise<SaveJobResult> {
  // 1. Find document with candidateId + jobId
  // 2. Delete document
  // 3. Return success/error
}
```

**Complexity:** Low
**Estimated:** 1 hour

#### D. `getSavedJobs` - Get Candidate's Saved Job IDs

```typescript
/**
 * BLS-02 DISC-027: Get Saved Job IDs
 * Returns array of job IDs saved by candidate
 */
export async function getSavedJobs(candidateId: string): Promise<string[]> {
  // 1. Query candidate_saved_jobs WHERE candidateId = uid
  // 2. Map to array of jobId strings
  // 3. Return array
}
```

**Complexity:** Low
**Estimated:** 1 hour

**Total Server Action Effort:** 7-10 hours

---

### 3.2 Page Components (Phase 1)

#### A. `src/app/jobsmarket/jobs/page.tsx` - Main Page

```typescript
// Server Component - parses URL params, passes to client components
export default function JobsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>;
}) {
  // 1. Parse URL params to FilterState
  // 2. Set page metadata (title based on filters)
  // 3. Render JobsClient with initial filters
}
```

**Complexity:** Low
**Estimated:** 2 hours
**Lines:** ~100

#### B. `src/app/jobsmarket/jobs/_components/JobsClient.tsx` - Main Client Component

```typescript
'use client';

// Main client component coordinating all interactions
export function JobsClient({ initialFilters }: { initialFilters: JobFilterState }) {
  // 1. useJobSearch hook (SWR)
  // 2. useJobFilters hook (filter state + URL sync)
  // 3. useSaveJobMutation hook
  // 4. Render layout with all child components
}
```

**Complexity:** High (orchestration)
**Estimated:** 4 hours
**Lines:** ~200

#### C. `src/app/jobsmarket/jobs/_components/SearchHeader.tsx`

```typescript
'use client';

export function SearchHeader({ filters, onFilterChange }) {
  // 1. Search input (keyword)
  // 2. Location dropdown (optional)
  // 3. Search button
  // 4. Result count display
}
```

**Complexity:** Low
**Estimated:** 2 hours
**Lines:** ~80

#### D. `src/app/jobsmarket/jobs/_components/ResultsHeader.tsx`

```typescript
'use client';

export function ResultsHeader({ totalCount, sort, onSortChange }) {
  // 1. "พบ {count} งาน" display
  // 2. Sort dropdown
}
```

**Complexity:** Low
**Estimated:** 1 hour
**Lines:** ~50

#### E. `src/app/jobsmarket/jobs/_components/JobListResults.tsx`

```typescript
'use client';

export function JobListResults({
  jobs,
  savedJobs,
  onSaveToggle,
  isLoading,
  error,
}) {
  // 1. Loading skeletons
  // 2. Error state
  // 3. Empty state
  // 4. Map jobs to JobCard
}
```

**Complexity:** Medium
**Estimated:** 2 hours
**Lines:** ~120

#### F. `src/app/jobsmarket/jobs/_components/Pagination.tsx`

```typescript
'use client';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  // Desktop: Full page numbers
  // Mobile: Prev/Next + page input
}
```

**Complexity:** Medium
**Estimated:** 2 hours
**Lines:** ~100

#### G. `src/app/jobsmarket/jobs/_components/EmptyState.tsx`

```typescript
export function EmptyState({ filters, onClearFilters, onRemoveFilter }) {
  // 1. Illustration
  // 2. Message based on context (no filters vs with filters)
  // 3. Suggested actions (clear all, remove specific filter)
}
```

**Complexity:** Low
**Estimated:** 1.5 hours
**Lines:** ~80

#### H. `src/app/jobsmarket/jobs/_components/ErrorState.tsx`

```typescript
export function ErrorState({ error, onRetry }) {
  // 1. Error message
  // 2. Retry button
}
```

**Complexity:** Low
**Estimated:** 1 hour
**Lines:** ~50

**Total Page Component Effort:** 15.5 hours (~2 days)

---

### 3.3 Hooks (Phase 1)

#### A. `src/hooks/jobsmarket/use-job-search.ts` - SWR Integration

```typescript
import useSWR from 'swr';
import { searchPublicJobs } from '@/lib/database/actions/jobs';

export function useJobSearch(filters: JobFilterState) {
  const swrKey = useMemo(() => {
    // Create stable key from filter params
    return `jobs-search-${createFilterHash(filters)}`;
  }, [filters]);

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => searchPublicJobs(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  return { jobs: data?.data?.jobs || [], totalCount: data?.data?.totalCount || 0, /* ... */ };
}
```

**Complexity:** Medium
**Estimated:** 3 hours

#### B. `src/hooks/jobsmarket/use-job-filters.ts` - Filter State + URL Sync

```typescript
export function useJobFilters(initialFilters: JobFilterState) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState(initialFilters);
  const [pendingFilters, setPendingFilters] = useState(initialFilters);

  // Update URL when filters change (debounced)
  const updateURL = useCallback((newFilters: JobFilterState) => {
    const params = new URLSearchParams(window.location.search);
    // ... update params
    const newURL = `${pathname}?${params.toString()}`;
    router.replace(newURL, { scroll: false });
  }, [router, pathname]);

  // Apply filters (commit pending → active)
  const applyFilters = useCallback(() => {
    setFilters(pendingFilters);
    updateURL(pendingFilters);
  }, [pendingFilters, updateURL]);

  return { filters, pendingFilters, setPendingFilters, applyFilters, /* ... */ };
}
```

**Complexity:** High (URL sync pattern from COMP-R08 lessons)
**Estimated:** 4 hours

#### C. `src/hooks/jobsmarket/use-save-job-mutation.ts` - Optimistic Updates

```typescript
import useSWRMutation from 'swr/mutation';
import { saveJob, unsaveJob } from '@/lib/database/actions/candidate-information';

export function useSaveJobMutation(candidateId: string | null) {
  const { trigger, isMutating } = useSWRMutation(
    candidateId ? `saved-jobs-${candidateId}` : null,
    async (key, { arg }: { arg: { jobId: string; save: boolean } }) => {
      if (arg.save) {
        await saveJob({ candidateId: candidateId!, jobId: arg.jobId });
      } else {
        await unsaveJob({ candidateId: candidateId!, jobId: arg.jobId });
      }
    },
    {
      optimisticData: (current) => {
        // Optimistic update logic
      },
      rollbackOnError: true,
    }
  );

  return { toggleSave: trigger, isSaving: isMutating };
}
```

**Complexity:** Medium
**Estimated:** 3 hours

**Total Hooks Effort:** 10 hours

---

### 3.4 Utilities (Phase 1)

#### A. `src/lib/utils/filter-url-sync.ts` - URL Serialization

```typescript
export function filterStateToURL(state: JobFilterState): URLSearchParams {
  // Convert FilterState to URLSearchParams
}

export function urlToFilterState(params: URLSearchParams): JobFilterState {
  // Convert URLSearchParams to FilterState
}

export function createFilterHash(filters: JobFilterState): string {
  // Create stable hash for SWR key
}
```

**Complexity:** Low
**Estimated:** 2 hours

---

## 4. URL Sync Strategy

### 4.1 Approach (Based on COMP-R08 Lessons Learned)

**Use `window.location.search` directly** to avoid stale closure issues:

```typescript
const updateURL = useCallback((params: JobFilterState) => {
  // ✅ CORRECT - Use window.location directly
  const newParams = new URLSearchParams(window.location.search);

  // Update params based on filter state
  if (params.q) newParams.set('q', params.q);
  else newParams.delete('q');

  if (params.types.length > 0) newParams.set('type', params.types.join(','));
  else newParams.delete('type');

  // ... more params

  const newURL = `${pathname}?${newParams.toString()}`;
  router.replace(newURL, { scroll: false });
}, [router, pathname]);
```

**Do NOT use `searchParams` in dependency array** - it causes stale closures.

### 4.2 URL Parameter Format

| Filter | URL Format | Example |
|--------|------------|---------|
| Keyword | `?q=value` | `?q=developer` |
| Location | `?location=val1,val2` | `?location=กรุงเทพมหานคร,เชียงใหม่` |
| Type | `?type=val1,val2` | `?type=fulltime,parttime` |
| Salary Min | `?salary_min=number` | `?salary_min=30000` |
| Salary Max | `?salary_max=number` | `?salary_max=50000` |
| Education | `?education=val1,val2` | `?education=bachelor,master` |
| Experience | `?experience=value` | `?experience=1-3` |
| Remote | `?remote=value` | `?remote=hybrid` |
| Sort | `?sort=value` | `?sort=salary_desc` |
| Page | `?page=number` | `?page=3` |

---

## 5. State Management

### 5.1 Client State (React useState)

| State | Scope | Purpose |
|-------|-------|---------|
| `pendingFilters` | `useJobFilters` hook | Accumulate filter changes before apply |
| `isFilterSheetOpen` | `JobsClient` | Mobile bottom sheet visibility |
| `loginPromptJobId` | `JobsClient` | Job ID that triggered login prompt |

### 5.2 Server State (SWR)

| SWR Key | Fetcher | Config | Invalidation |
|---------|---------|--------|--------------|
| `jobs-search-${hash}` | `searchPublicJobs()` | `keepPreviousData: true` | On filter change |
| `saved-jobs-${uid}` | `getSavedJobs(uid)` | `revalidateOnFocus: true` | On save/unsave |
| `master-data-provinces` | `getMasterData('provinces')` | `dedupingInterval: 1h` | Never (static) |

### 5.3 Global State (Jotai Atoms)

| Atom | Used For |
|------|----------|
| `userAtom` | Check login state, get UID |
| `activeRoleAtom` | Determine shell type |
| `sessionStateAtom` | Auth state for save functionality |

---

## 6. Test Plan

### 6.1 Unit Tests (~30 tests)

| File | Test Count | Focus |
|------|------------|-------|
| `use-job-search.test.ts` | 8 | SWR integration, loading states, error handling |
| `use-job-filters.test.ts` | 10 | URL sync, filter state, apply/clear logic |
| `use-save-job-mutation.test.ts` | 6 | Optimistic updates, rollback on error |
| `filter-url-sync.test.ts` | 6 | URL serialization/deserialization |

**Total:** ~30 unit tests
**Estimated:** 6 hours

### 6.2 Integration Tests (~10 tests)

| Scenario | Test |
|----------|------|
| DISC-001 | Basic search with keyword |
| DISC-002 | Filter by location |
| DISC-003 | Filter by salary range |
| DISC-004 | Combine multiple filters |
| DISC-007 | Pagination |
| DISC-009 | MeiliSearch fallback to Firestore |
| DISC-010 | URL state sync (refresh preserves filters) |
| DISC-019 | Guest save triggers login prompt |
| DISC-020 | Candidate save job (optimistic) |
| DISC-021 | Save error rollback |

**Total:** ~10 integration tests
**Estimated:** 4 hours

### 6.3 E2E Tests (~15 tests)

#### Critical Path Tests

| ID | Scenario | Expected |
|----|----------|----------|
| R01-01 | Initial load | Skeleton → job list |
| R01-02 | Search with no results | Empty state with clear CTA |
| R01-03 | Filter + sort | URL updates, results filtered |
| R01-08 | Guest save | Login prompt appears |
| R01-09 | Logged-in save | Heart fills, toast shows |
| R01-13 | Browser back | Previous filter state restored |

#### Edge Cases

| Scenario | Expected |
|----------|----------|
| Invalid page `?page=999` | Redirect to page 1 |
| Empty location `?location=` | Ignore, use no filter |
| Malformed salary `?salary_min=abc` | Ignore, use no filter |
| MeiliSearch down | Firestore fallback with notice |
| 0 total results | Empty state (not error) |

**Total:** ~15 E2E tests
**Estimated:** 6 hours

**Total Test Effort:** 16 hours (~2 days)

---

## 7. BLS-02 Scenario Coverage

| BLS-02 Scenario | Route | Test Type | Test File |
|-----------------|-------|-----------|-----------|
| DISC-001: Basic search | JOB-R01 | Integration, E2E | `jobs-search.test.ts`, `jobs.spec.ts` |
| DISC-002: Filter location | JOB-R01 | Integration, E2E | `jobs-filters.test.ts`, `jobs.spec.ts` |
| DISC-003: Filter salary | JOB-R01 | Integration, E2E | `jobs-filters.test.ts`, `jobs.spec.ts` |
| DISC-004: Combine filters | JOB-R01 | Integration, E2E | `jobs-filters.test.ts`, `jobs.spec.ts` |
| DISC-005: Sort by salary | JOB-R01 | Unit, E2E | `use-job-filters.test.ts`, `jobs.spec.ts` |
| DISC-006: Empty results | JOB-R01 | Unit, E2E | `EmptyState.test.tsx`, `jobs.spec.ts` |
| DISC-007: Pagination | JOB-R01 | Integration, E2E | `Pagination.test.tsx`, `jobs.spec.ts` |
| DISC-008: Clear all filters | JOB-R01 | Unit, E2E | `use-job-filters.test.ts`, `jobs.spec.ts` |
| DISC-009: MeiliSearch fallback | JOB-R01 | Integration | `searchPublicJobs.test.ts` |
| DISC-010: URL state sync | JOB-R01 | Unit, E2E | `filter-url-sync.test.ts`, `jobs.spec.ts` |
| DISC-019: Guest save | JOB-R01 | E2E | `jobs-save.spec.ts` |
| DISC-020: Candidate save | JOB-R01 | Integration, E2E | `saveJob.test.ts`, `jobs-save.spec.ts` |
| DISC-021: Save error | JOB-R01 | Unit, Integration | `use-save-job-mutation.test.ts`, `saveJob.test.ts` |

**Coverage:** 13 of 13 scenarios (100%)

---

## 8. Phase Breakdown

### Phase 0: Server Actions (CRITICAL - 7-10 hours)

**Must complete before anything else:**
- [ ] Create `searchPublicJobs` server action
- [ ] Create `saveJob` server action
- [ ] Create `unsaveJob` server action
- [ ] Create `getSavedJobs` server action
- [ ] Write unit tests for server actions
- [ ] Write integration tests for server actions

**Gate:** All server actions working with real dev database

### Phase 1: Core Search (15.5 hours)

- [ ] Create `JobsPage` (server component)
- [ ] Create `JobsClient` (main orchestrator)
- [ ] Create `SearchHeader`
- [ ] Create `ResultsHeader`
- [ ] Create `JobListResults`
- [ ] Create `useJobSearch` hook
- [ ] Create `useJobFilters` hook
- [ ] Create filter URL sync utilities

**Gate:** Search works, URL syncs, results display

### Phase 2: Pagination & States (4.5 hours)

- [ ] Create `Pagination` component
- [ ] Create `EmptyState` component
- [ ] Create `ErrorState` component
- [ ] Add loading skeletons

**Gate:** All states handled correctly

### Phase 3: Save Job Feature (3 hours)

- [ ] Create `useSaveJobMutation` hook
- [ ] Wire up `SaveJobButton` in `JobCard`
- [ ] Wire up `LoginPromptModal`
- [ ] Add optimistic updates

**Gate:** Save/unsave works, optimistic updates correct

### Phase 4: Testing (16 hours)

- [ ] Write unit tests (~30 tests)
- [ ] Write integration tests (~10 tests)
- [ ] Write E2E tests (~15 tests)
- [ ] Verify all BLS-02 scenarios covered

**Gate:** ≥90% coverage, all gates pass

### Phase 5: Quality Gates (2 hours)

- [ ] Gate 1: `npm run build` → 0 errors
- [ ] Gate 2: `npm run lint` → 0 errors
- [ ] Gate 3: `npm run dev` + browser test
- [ ] Gate 4a: Unit tests → 90%+ coverage
- [ ] Gate 4b: Integration tests → all pass
- [ ] Gate 4c: E2E tests → ≥80% pass
- [ ] Create Firebase index: `candidate_saved_jobs` (candidate_id ASC, saved_at DESC)

**Total Estimated Time:** 48 hours (~3-4 days with 12-16h work days)

---

## 9. Open Questions for PM/SA

### 9.1 MeiliSearch Configuration

**Q1:** Is MeiliSearch already configured with the `job` index?
**Need:** Index settings, searchable/filterable/sortable attributes
**Impact:** If not configured, add +4 hours for MeiliSearch setup

### 9.2 Master Data for Location Filter

**Q2:** Are provinces already in `master_data` collection with type='provinces'?
**Alternative:** Do we need to fetch from a different source?
**Impact:** If missing, need to populate master data first

### 9.3 Salary Negotiable Filter

**Q3:** JOB-R01 RIS says "Salary Negotiable Filter" is future, but BLS-02 doesn't mention it. Confirm we're skipping this for v1.0?
**Impact:** No impact if confirmed skipped

### 9.4 Match Score Display

**Q4:** BLS-02 mentions `_matchScore` for logged-in candidates. Is this from MeiliSearch attribute matching or a separate calculation?
**Impact:** If separate calculation needed, add +2 hours

### 9.5 Similar Jobs in Search Results

**Q5:** Should we show "Similar Jobs" carousel when viewing a job card in the search results, or only on detail page (JOB-R02)?
**Impact:** If yes, add +2 hours

### 9.6 Server Action Naming Convention

**Q6:** Existing actions use `web` prefix (e.g., `webJobGetById`). Should new actions follow same convention or use plain names?
**Recommendation:** Use `web` prefix for consistency:
- `webSearchPublicJobs`
- `webCandidateSaveJob`
- `webCandidateUnsaveJob`
- `webCandidateGetSavedJobs`

### 9.7 Filter Apply Behavior Clarification

**Q7:** JOB-R01 Decision Log says "Explicit Apply button" for desktop, but component-action wiring table shows filters apply immediately on change. Which is correct?
**RIS Line 610 says:** "Desktop filter apply: Immediate (per change)"
**Recommendation:** Use immediate apply for desktop (matches mobile's explicit Apply button philosophy)

### 9.8 Firestore Fallback Performance

**Q8:** What's the expected query performance for Firestore fallback with ~10,000 jobs?
**Concern:** Client-side filtering may be slow
**Recommendation:** Implement server-side filtering in Firestore fallback

---

## 10. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Server actions don't exist** | 🔴 Critical | **Phase 0 must complete first** |
| **MeiliSearch not configured** | 🟡 Medium | Use Firestore-only for v1.0 if needed |
| **URL sync complexity** | 🟡 Medium | Use proven pattern from COMP-R08 |
| **Optimistic update edge cases** | 🟡 Medium | Thorough unit tests for rollback |
| **Firestore fallback slow** | 🟢 Low | Show "slow search" notice, acceptable UX |

---

## 11. Success Criteria

### 11.1 Functional

- [ ] Job search works with all filter combinations
- [ ] URL preserves filter state (shareable links)
- [ ] Pagination works correctly
- [ ] Save/unsave job works with optimistic updates
- [ ] Login prompt appears for guests
- [ ] MeiliSearch fallback works when primary down
- [ ] Empty state shows helpful suggestions

### 11.2 Performance

- [ ] Initial search < 2s (MeiliSearch)
- [ ] Fallback search < 5s (Firestore)
- [ ] Filter apply < 500ms (URL update)
- [ ] Save job < 1s (optimistic feels instant)

### 11.3 Quality

- [ ] Gate 1: Build passes (0 errors)
- [ ] Gate 2: Lint passes (0 errors)
- [ ] Gate 3: Dev server loads route
- [ ] Gate 4a: Unit tests ≥90% coverage
- [ ] Gate 4b: Integration tests all pass
- [ ] Gate 4c: E2E tests ≥80% pass
- [ ] All BLS-02 scenarios covered

---

## 12. Implementation Checklist

Copied from JOB-R01 RIS Section 9:

### 9.1 Page Structure

- [ ] Page component with URL query parameter parsing
- [ ] Shell detection and switching logic
- [ ] SEO metadata (title, description based on filters)
- [ ] Structured data (JobPosting schema.org)

### 9.2 Search & Filter Components

- [ ] Search header (desktop)
  - [ ] Search input with keyword
  - [ ] Location dropdown
  - [ ] Search button
- [ ] Filter sidebar (desktop, 300px) ✅ EXISTS
  - [ ] Active filters display (chips) ✅ EXISTS
  - [ ] Clear all button ✅ EXISTS
  - [ ] Job type section (checkboxes) ✅ EXISTS
  - [ ] Salary section (slider + presets) ✅ EXISTS
  - [ ] Location section (multi-select) ✅ EXISTS
  - [ ] Education section (checkboxes) ✅ EXISTS
  - [ ] Experience section (radio) ✅ EXISTS
  - [ ] Remote section (radio) ✅ EXISTS
  - [ ] Collapsible sections ✅ EXISTS
- [ ] Mobile search header (compact)
  - [ ] Search input
  - [ ] Filter button with active count badge
- [ ] Filter bottom sheet (mobile) ✅ EXISTS
  - [ ] Sheet header with close ✅ EXISTS
  - [ ] All filter controls ✅ EXISTS
  - [ ] Sticky apply button with result count ✅ EXISTS
  - [ ] Clear all button ✅ EXISTS

### 9.3 Results Components

- [ ] Results header
  - [ ] Result count display
  - [ ] Sort dropdown
- [ ] Job list container
- [ ] Job card component ✅ EXISTS
  - [ ] Company logo (48×48) ✅ EXISTS
  - [ ] Job title (link) ✅ EXISTS
  - [ ] Company name (link) ✅ EXISTS
  - [ ] Location badge ✅ EXISTS
  - [ ] Job type badge ✅ EXISTS
  - [ ] Salary display ✅ EXISTS
  - [ ] Posted date (relative, Thai) ✅ EXISTS
  - [ ] Match score (logged-in candidate only) - FUTURE
  - [ ] Save button (heart toggle) ✅ EXISTS
- [ ] Pagination component
  - [ ] Desktop: Full numbers
  - [ ] Mobile: Compact (prev/next + page input)

### 9.4 State Management

- [ ] URL ↔ Filter state synchronization
- [ ] Filter state with pending changes pattern
- [ ] SWR integration for job search
- [ ] Master data fetching (provinces, education, types)
- [ ] Saved jobs state (logged-in users)

### 9.5 Empty & Error States

- [ ] Empty state component
  - [ ] Illustration
  - [ ] Message based on context
  - [ ] Filter removal suggestions
- [ ] Error state component
  - [ ] Error message
  - [ ] Retry button
- [ ] Loading skeletons
  - [ ] Job card skeleton
  - [ ] Filter sidebar skeleton

### 9.6 Save Job Feature

- [ ] Save button component with states ✅ EXISTS
- [ ] Optimistic update logic
- [ ] Login prompt modal ✅ EXISTS
- [ ] Toast notifications for errors

### 9.7 Performance

- [ ] Virtualized list for large result sets (optional)
- [ ] Image lazy loading for company logos
- [ ] Filter debouncing (salary slider)
- [ ] URL update debouncing

### 9.8 Accessibility

- [ ] Keyboard navigation for filters
- [ ] ARIA labels for interactive elements
- [ ] Focus management on page/filter changes
- [ ] Screen reader announcements for result counts

---

## 13. Next Steps

### Immediate Actions

1. **Get PM/SA approval for this assessment**
2. **Answer open questions (Section 9)**
3. **Begin Phase 0: Server Actions** (CRITICAL)
   - Create `searchPublicJobs` with MeiliSearch + fallback
   - Create save/unsave/getSavedJobs actions
   - Test with real dev database
4. **Once Phase 0 complete, begin Phase 1** (Core Search)

### Blockers

- ⛔ **Cannot start page components until server actions exist**
- ⚠️ Need MeiliSearch configuration details
- ⚠️ Need confirmation on master data (provinces)

---

**Assessment Complete**
**Ready for PM/SA Review and Approval**

---

*End of JOB-R01 Implementation Assessment*
