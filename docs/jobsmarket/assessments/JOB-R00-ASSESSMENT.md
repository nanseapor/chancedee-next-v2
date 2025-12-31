# JOB-R00 Cross-Cutting Patterns Assessment

**Date:** 2025-12-29
**Route:** JOB-R00 (Cross-Cutting Patterns for Public Job Routes)
**Status:** Ready for PM/SA Review
**Developer:** Claude Code

---

## Executive Summary

This assessment evaluates the implementation requirements for JOB-R00 cross-cutting patterns that will be shared across JOB-R01 (Job List), JOB-R02 (Job Detail), and JOB-R02b (Job Application). The key finding is that **most infrastructure already exists** (MeiliSearch integration, jobs repository, basic types), but **public-facing components, server actions, and layout patterns are missing**.

### Key Differences from Company Routes

**PUBLIC vs AUTHENTICATED:**
- ✅ No authentication required (guest access allowed)
- ✅ Public layout (no sidebar, simplified header)
- ✅ MeiliSearch for fast search (primary data source)
- ✅ Firestore for job details (authoritative source)
- ✅ SEO-optimized (metadata, structured data)
- ✅ ISR + SWR caching strategy

---

## 1. Route Overview

| Property | Value |
|----------|-------|
| Route ID | JOB-R00 |
| Purpose | Define shared patterns for all public job routes |
| Applies To | JOB-R01 (Jobs List), JOB-R02 (Job Detail), JOB-R02b (Application Flow) |
| Shell | Public Shell (guest) / Candidate Shell (authenticated candidate) / Company Shell (authenticated company) |
| Authentication | **OPTIONAL** (public access allowed) |
| Primary Data Source | **MeiliSearch** for listing/search, **Firestore** for detail |

### Consumer Routes

| Route | Path | Uses R00 Patterns |
|-------|------|-------------------|
| JOB-R01 | `/jobs` | JobCard, SaveJob, JobFilters, PublicLayout |
| JOB-R02 | `/jobs/[id]` | JobCard (similar jobs), SaveJob, LoginPrompt |
| JOB-R02b | `/jobs/[id]/apply` | LoginPrompt |

---

## 2. RIS Requirements Summary

From `JOB-R00_cross-cutting_RIS.md` (read offset 1-500):

### 2.1 Shared Types & Interfaces

The following types need to be created:

| Type | Purpose | File Location |
|------|---------|---------------|
| `JobCardData` | Job card display data | `src/types/public-jobs.ts` |
| `JobSearchParams` | MeiliSearch query params | `src/types/public-jobs.ts` |
| `JobSearchResponse` | Search results shape | `src/types/public-jobs.ts` |
| `JobAvailabilityState` | Job status (available/closed/expired) | `src/types/public-jobs.ts` |
| `JobFilterState` | Filter sidebar state | `src/types/public-jobs.ts` |
| `SaveJobParams` | Save/unsave job input | `src/types/public-jobs.ts` |

### 2.2 Server Actions to Implement

| Action | Purpose | Input | Output | Data Source |
|--------|---------|-------|--------|-------------|
| `searchJobs` | Job search with filters | `JobSearchParams` | `JobSearchResponse` | MeiliSearch → Firestore fallback |
| `getJobById` | Fetch single job detail | `jobId: string` | `JobDetailData \| null` | Firestore |
| `getSimilarJobs` | Related jobs for detail page | `jobId: string, limit: number` | `JobCardData[]` | MeiliSearch |
| `saveJob` | Save job to candidate's list | `SaveJobParams` | `{ success: boolean }` | Firestore `candidate_saved_jobs` |
| `unsaveJob` | Remove saved job | `SaveJobParams` | `{ success: boolean }` | Firestore `candidate_saved_jobs` |
| `getSavedJobs` | Fetch candidate's saved jobs | `candidateId: string` | `JobCardData[]` | Firestore join |

**File Location:** `src/domains/jobs/services/server/actions/jobsmarket/public-jobs.ts`

### 2.3 Layout Requirements

| Component | Type | Purpose |
|-----------|------|---------|
| PublicJobsLayout | Layout | Container for `/jobs` and `/jobs/[id]` routes |
| PublicHeader | Component | Simplified header (no auth menu, search bar) |
| PublicFooter | Component | Legal links, social links |

**File Location:** `src/app/jobsmarket/jobs/layout.tsx`

### 2.4 Shared Components

| Component | Variants | Used In | File Location |
|-----------|----------|---------|---------------|
| JobCard | `list`, `compact`, `saved` | JOB-R01, R02, saved jobs | `src/components/jobsmarket/jobs/JobCard.tsx` |
| JobFilters | Desktop sidebar, Mobile bottom sheet | JOB-R01 | `src/components/jobsmarket/jobs/JobFilters.tsx` |
| SaveJobButton | `icon`, `button` | JobCard, job detail | `src/components/jobsmarket/jobs/SaveJobButton.tsx` |
| SalaryDisplay | - | JobCard, job detail | `src/components/jobsmarket/jobs/SalaryDisplay.tsx` |
| LocationBadge | - | JobCard | `src/components/jobsmarket/jobs/LocationBadge.tsx` |
| JobStatusBadge | - | JobCard (closed/expired) | `src/components/jobsmarket/jobs/JobStatusBadge.tsx` |
| LoginPromptModal | - | Save job, apply job | `src/components/jobsmarket/jobs/LoginPromptModal.tsx` |

### 2.5 Constants

| Constant | Purpose | File Location |
|----------|---------|---------------|
| `JOB_FILTER_OPTIONS` | Employment types, experience ranges, work modes | `src/lib/constants/jobsmarket/job-filters.ts` |
| `SALARY_PRESETS` | Thai market salary ranges | `src/lib/constants/jobsmarket/job-filters.ts` |
| `JOB_SORT_OPTIONS` | Sort options (newest, salary, relevant) | `src/lib/constants/jobsmarket/job-filters.ts` |

---

## 3. Existing Code Audit

### 3.1 Jobs Repository ✅ EXISTS

**File:** `src/lib/database/repositories/jobs-repository.ts`

**Available Methods:**
- `getById(uid: string)` ✅
- `getByFilter(filter?: Filter)` ✅
- `create(payload, actorId, uid?)` ✅ (company side)
- `update(uid, payload, actorId)` ✅ (company side)
- `delete(uid)` ✅ (company side)
- Transform functions ✅

**Can Reuse:** ✅ YES
- Already has correct transformations from Firestore to App model
- `getById` can be used directly for job detail page
- `getByFilter` can be used for Firestore fallback search

### 3.2 MeiliSearch Integration ✅ EXISTS

**File:** `src/lib/meilisearch/job-search.ts`

**Available:**
- MeiliSearch client configured ✅
- `searchJobs(params: JobSearchParams)` ✅ BASIC VERSION
  - Supports: `page`, `pageSize`, `keyword`
  - Base filters: `job_status IN ["ontimer", "published"]`, `is_active = true`
  - Sort: `post_start_date:desc`

**Needs Enhancement:** ⚠️
- Current version only supports keyword + basic pagination
- **Missing:** location filters, salary range, employment type, education, experience, remote mode
- **Missing:** advanced sort options (salary_desc, salary_asc, relevant)
- **Missing:** timeout/fallback logic

**Action Required:** ENHANCE existing `searchJobs` function

### 3.3 Server Actions ⚠️ PARTIALLY EXISTS

**File:** `src/lib/database/actions/jobs.ts`

**Available:**
- `webJobGetById(uid: string)` ✅ (can reuse)
- `webJobGetByFilter(filter?: Filter)` ✅ (for Firestore fallback)
- `webJobCreate`, `webJobUpdate`, `webJobDelete` ✅ (company side, not needed for public)
- `webJobPublish`, `webJobClose` ✅ (company side)

**Missing:**
- ❌ `searchJobs` with MeiliSearch integration (exists in meilisearch/job-search.ts but not as server action)
- ❌ `getSimilarJobs` (MeiliSearch-based similarity)
- ❌ `saveJob` / `unsaveJob` (candidate saved jobs)
- ❌ `getSavedJobs`

**Action Required:** CREATE new public-jobs server action file

### 3.4 Job Types ✅ EXISTS

**File:** `src/types/job.types.ts`

**Available:**
- `FirebaseJobData` ✅ (full job data)
- `jobDataProps` ✅ (from MeiliSearch)
- `IJobReturnData` ✅ (wrapper for job data)

**Missing:**
- ❌ `JobCardData` (lightweight for cards)
- ❌ `JobSearchParams` (public search interface)
- ❌ `JobSearchResponse`
- ❌ `JobAvailabilityState`
- ❌ `JobFilterState`

**Action Required:** CREATE `src/types/public-jobs.ts` with public-facing types

### 3.5 Saved Jobs Collection ❌ NOT IMPLEMENTED

**Expected:** Firestore collection `candidate_saved_jobs`

**Current State:**
- No repository found ❌
- No actions found ❌
- Grep search for "candidate_saved_jobs" returned no results ❌

**Action Required:** CREATE full saved jobs implementation:
- Repository: `src/lib/database/repositories/candidate-saved-jobs-repository.ts`
- Schema: `src/lib/database/schemas/candidate-saved-jobs.schema.ts`
- Actions in public-jobs server action file

### 3.6 Public Layout ❌ NOT EXISTS

**Current State:**
- `src/app/jobsmarket/layout.tsx` ✅ EXISTS (minimal, just AuthProvider + Jotai)
- NO `/jobs` subdirectory found ❌
- NO PublicHeader/PublicFooter components found ❌

**Existing Shells:**
- `CandidateShell.tsx` ✅ (for authenticated candidates)
- `CompanyShell.tsx` ✅ (for company users)
- `MinimalShell.tsx` ✅ (for pending companies)
- NO PublicShell ❌

**Action Required:** CREATE public shell and layout for jobs routes

### 3.7 Job Components ⚠️ PARTIALLY EXISTS

**Existing:**
- `src/components/jobsmarket/company/jobs/` ✅ (company-side job management)
  - JobStatusBadge ✅ (can reuse)
  - JobListSkeleton ✅ (can adapt)
  - JobActionMenu ✅ (company side, not relevant)
- `src/components/jobsmarket/jobs/indicators/SaveIndicator.tsx` ✅ (may be relevant)
- `src/components/jobsmarket/jobs/forms/` ✅ (company side, not relevant)

**Missing:**
- ❌ JobCard (public-facing)
- ❌ JobFilters
- ❌ SaveJobButton
- ❌ SalaryDisplay
- ❌ LocationBadge
- ❌ LoginPromptModal

**Action Required:** CREATE all public-facing job components

### 3.8 Constants ⚠️ PARTIALLY EXISTS

**File:** `src/lib/constants/jobsmarket/job-preferences.ts`

**Available:**
- `JOB_TYPES` ✅ (full_time, part_time, contract, freelance, internship)
- `PROVINCES` ✅ (all 77 Thai provinces)
- `AVAILABILITY` ✅ (immediate, within_1_month, etc.)

**Missing:**
- ❌ Employment types (RIS uses: fulltime, parttime, contract, internship)
- ❌ Experience ranges ('0', '1-3', '3-5', '5-10', '10+')
- ❌ Work modes (onsite, hybrid, remote)
- ❌ Education levels (high_school, vocational, bachelor, master, doctorate)
- ❌ Salary presets
- ❌ Sort options

**Action Required:** CREATE `src/lib/constants/jobsmarket/job-filters.ts`

---

## 4. Public Route Architecture

### 4.1 Key Architectural Differences

```
┌─────────────────────────────────────────────────────────────┐
│                  PUBLIC JOB ROUTES                           │
│                  (JOB-R00 Patterns)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Authentication:     OPTIONAL (guest access allowed)        │
│  Layout:             Public Shell (no sidebar)              │
│  Header:             Simplified (search bar, login button)  │
│  Footer:             Legal links, social                    │
│  Data Source:        MeiliSearch (primary) + Firestore      │
│  Caching:            ISR + SWR                               │
│  SEO:                ✅ Metadata + Structured Data           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

vs

┌─────────────────────────────────────────────────────────────┐
│              COMPANY/CANDIDATE ROUTES                        │
│              (COMP-R00 / CAND-R00 Patterns)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Authentication:     REQUIRED (redirect to login)           │
│  Layout:             Full Shell (sidebar + topbar)          │
│  Header:             Full (role switcher, notifications)    │
│  Footer:             None (dashboard context)               │
│  Data Source:        Firestore only                         │
│  Caching:            SWR (user-specific data)                │
│  SEO:                ❌ No-index (private pages)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Shell Selection Logic

```typescript
// From JOB-R00 Section 2.4
function determineJobsShell(
  sessionState: SessionState,
  activeRole: string | null
): ShellType {
  if (sessionState !== 'valid' || !activeRole) {
    return 'public'; // ← Guest users see public shell
  }

  switch (activeRole) {
    case 'candidate':
      return 'candidate'; // ← Authenticated candidates see candidate shell
    case 'company':
      return 'company'; // ← Company users see company shell
    case 'chancedee':
      return 'company'; // ← Admin sees company shell
    default:
      return 'public';
  }
}
```

### 4.3 Data Flow: MeiliSearch → Firestore Fallback

```
User Search Request
        │
        ▼
┌──────────────────┐
│  searchJobs()    │ ← Server Action
└────────┬─────────┘
         │
         ▼
┌──────────────────┐      Success     ┌──────────────────┐
│  MeiliSearch     │─────────────────▶│  Return Results  │
│  (Primary)       │  < 5s             └──────────────────┘
└────────┬─────────┘
         │
         │ Timeout/Error (> 5s)
         ▼
┌──────────────────┐      Success     ┌──────────────────┐
│  Firestore       │─────────────────▶│  Return Results  │
│  (Fallback)      │  < 10s            │  + isFallback    │
└────────┬─────────┘                   └──────────────────┘
         │
         │ Timeout/Error (> 10s)
         ▼
┌──────────────────┐
│  Error State     │
│  (Show retry)    │
└──────────────────┘
```

### 4.4 Caching Strategy

| Data Type | Strategy | SWR Key | Revalidation |
|-----------|----------|---------|--------------|
| Job List (search results) | SWR with dedupe | `jobs-list-${filterHash}` | 60s stale, 120s revalidate |
| Job Detail | ISR + SWR | `job-${id}` | ISR: 300s, SWR: 60s |
| Similar Jobs | SWR static | `similar-jobs-${id}` | 3600s (1hr) |
| Master Data (provinces, etc.) | SWR static | `master-data-${type}` | Infinity (never) |
| Saved Jobs (logged in) | SWR | `saved-jobs-${uid}` | 30s stale, on mutation |

---

## 5. Deliverables Checklist

### Phase 1: Types & Constants

- [ ] `src/types/public-jobs.ts`
  - [ ] `JobCardData` interface
  - [ ] `JobSearchParams` interface
  - [ ] `JobSearchResponse` interface
  - [ ] `JobAvailabilityState` type
  - [ ] `JobFilterState` interface
  - [ ] `SaveJobParams` interface
  - [ ] `SaveJobResult` interface

- [ ] `src/lib/constants/jobsmarket/job-filters.ts`
  - [ ] `EMPLOYMENT_TYPES` (fulltime, parttime, contract, internship)
  - [ ] `EXPERIENCE_RANGES` ('0', '1-3', '3-5', '5-10', '10+')
  - [ ] `WORK_MODES` (onsite, hybrid, remote)
  - [ ] `EDUCATION_LEVELS` (high_school, vocational, bachelor, master, doctorate)
  - [ ] `SALARY_PRESETS` (Thai market ranges)
  - [ ] `JOB_SORT_OPTIONS` (newest, salary_desc, salary_asc, relevant)

### Phase 2: Server Actions & Repository

- [ ] `src/lib/database/repositories/candidate-saved-jobs-repository.ts`
  - [ ] `create(candidateId, jobId)` → Add saved job
  - [ ] `delete(candidateId, jobId)` → Remove saved job
  - [ ] `getByCandidateId(candidateId)` → Fetch all saved jobs
  - [ ] `exists(candidateId, jobId)` → Check if job is saved

- [ ] `src/lib/database/schemas/candidate-saved-jobs.schema.ts`
  - [ ] Zod schema for validation

- [ ] `src/domains/jobs/services/server/actions/jobsmarket/public-jobs.ts`
  - [ ] `searchJobs(params: JobSearchParams)` → MeiliSearch with fallback
  - [ ] `getJobById(jobId: string)` → Firestore job detail
  - [ ] `getSimilarJobs(jobId: string, limit: number)` → MeiliSearch similarity
  - [ ] `saveJob(params: SaveJobParams)` → Save job
  - [ ] `unsaveJob(params: SaveJobParams)` → Unsave job
  - [ ] `getSavedJobs(candidateId: string)` → Fetch saved jobs with details

- [ ] ENHANCEMENT: `src/lib/meilisearch/job-search.ts`
  - [ ] Add location filter support
  - [ ] Add salary range filter support
  - [ ] Add employment type filter support
  - [ ] Add education level filter support
  - [ ] Add experience filter support
  - [ ] Add remote mode filter support
  - [ ] Add advanced sort options
  - [ ] Add timeout/fallback logic

### Phase 3: Layout & Shell

- [ ] `src/app/jobsmarket/jobs/layout.tsx`
  - [ ] PublicJobsLayout component
  - [ ] Shell detection logic
  - [ ] SEO metadata defaults

- [ ] `src/components/jobsmarket/shells/PublicShell.tsx`
  - [ ] Public header
  - [ ] Main content area
  - [ ] Public footer

- [ ] `src/components/jobsmarket/jobs/PublicHeader.tsx`
  - [ ] Logo + brand
  - [ ] Search bar (keyword + location)
  - [ ] Login/Register buttons (if not authenticated)
  - [ ] User menu (if authenticated)

- [ ] `src/components/jobsmarket/jobs/PublicFooter.tsx`
  - [ ] Legal links (terms, privacy)
  - [ ] Social media links
  - [ ] Copyright notice

### Phase 4: Shared Components

- [ ] `src/components/jobsmarket/jobs/JobCard.tsx`
  - [ ] `list` variant (horizontal, full info)
  - [ ] `compact` variant (vertical, minimal info)
  - [ ] `saved` variant (with unavailable states)
  - [ ] Company logo (48×48)
  - [ ] Job title (link)
  - [ ] Company name (link)
  - [ ] Location badge
  - [ ] Employment type badge
  - [ ] Salary display
  - [ ] Posted date (relative)
  - [ ] Match score (if logged in)
  - [ ] Save button (heart icon)

- [ ] `src/components/jobsmarket/jobs/JobFilters.tsx`
  - [ ] Desktop sidebar (300px)
  - [ ] Mobile bottom sheet
  - [ ] Active filters display (chips)
  - [ ] Clear all button
  - [ ] Job type section (checkboxes)
  - [ ] Salary section (slider + presets)
  - [ ] Location section (multi-select)
  - [ ] Education section (checkboxes)
  - [ ] Experience section (radio)
  - [ ] Remote section (radio)
  - [ ] Collapsible sections

- [ ] `src/components/jobsmarket/jobs/SaveJobButton.tsx`
  - [ ] Icon variant (heart only)
  - [ ] Button variant (with text)
  - [ ] Optimistic update logic
  - [ ] Login prompt trigger (if guest)
  - [ ] Toast notifications

- [ ] `src/components/jobsmarket/jobs/SalaryDisplay.tsx`
  - [ ] Format: ฿XX,XXX - ฿XX,XXX
  - [ ] Single salary: ฿XX,XXX
  - [ ] Minimum only: ฿XX,XXX+
  - [ ] Negotiable: ตามตกลง
  - [ ] Not specified: ไม่ระบุ

- [ ] `src/components/jobsmarket/jobs/LocationBadge.tsx`
  - [ ] Province display
  - [ ] Icon (map pin)
  - [ ] Responsive sizing

- [ ] `src/components/jobsmarket/jobs/JobStatusBadge.tsx`
  - [ ] `available` (hidden, default)
  - [ ] `closed` (gray, "ปิดแล้ว")
  - [ ] `expired` (gray, "หมดอายุแล้ว")
  - [ ] `unpublished` (gray, "ไม่พร้อม")

- [ ] `src/components/jobsmarket/jobs/LoginPromptModal.tsx`
  - [ ] Modal dialog
  - [ ] Action-specific message (save, apply, view_saved)
  - [ ] Login button (redirect with returnUrl)
  - [ ] Register button
  - [ ] Close button

### Phase 5: Tests

**Unit Tests** (coverage ≥ 90%):
- [ ] `tests/unit/jobsmarket/jobs/public-jobs-actions.test.ts`
  - [ ] searchJobs with various filters
  - [ ] getJobById with valid/invalid IDs
  - [ ] getSimilarJobs
  - [ ] saveJob / unsaveJob (mocked repository)
  - [ ] getSavedJobs

- [ ] `tests/unit/jobsmarket/jobs/saved-jobs-repository.test.ts`
  - [ ] create
  - [ ] delete
  - [ ] getByCandidateId
  - [ ] exists

- [ ] `tests/unit/jobsmarket/jobs/JobCard.test.tsx`
  - [ ] All variants render correctly
  - [ ] Save button click (guest vs logged in)
  - [ ] Navigation links work

- [ ] `tests/unit/jobsmarket/jobs/JobFilters.test.tsx`
  - [ ] Filter state management
  - [ ] Apply button behavior
  - [ ] Clear all button
  - [ ] Mobile bottom sheet

- [ ] `tests/unit/jobsmarket/jobs/SalaryDisplay.test.tsx`
  - [ ] All format cases

**Integration Tests**:
- [ ] `tests/integration/jobsmarket/jobs/public-jobs-integration.test.ts`
  - [ ] searchJobs with real dev database
  - [ ] saveJob creates Firestore document
  - [ ] unsaveJob deletes Firestore document
  - [ ] getSavedJobs returns correct data

**E2E Tests**:
- [ ] `tests/e2e/jobsmarket/jobs/job-list.spec.ts`
  - [ ] Page loads without errors
  - [ ] Search keyword updates URL
  - [ ] Filter apply updates results
  - [ ] Sort change updates order
  - [ ] Pagination works
  - [ ] Guest save triggers login prompt
  - [ ] Logged-in save works (optimistic update)

- [ ] `tests/e2e/jobsmarket/jobs/job-detail.spec.ts`
  - [ ] Job detail page loads
  - [ ] Similar jobs display
  - [ ] Save button works
  - [ ] Closed job shows banner
  - [ ] 404 for invalid job ID

---

## 6. Server Actions Specification

### 6.1 searchJobs

```typescript
interface JobSearchParams {
  q?: string;                    // Keyword search
  locations?: string[];          // Province codes
  types?: EmploymentType[];      // fulltime, parttime, contract, internship
  salaryMin?: number;            // Minimum salary (THB)
  salaryMax?: number;            // Maximum salary (THB)
  education?: EducationLevel[];  // Education requirements
  experience?: ExperienceRange;  // 0, 1-3, 3-5, 5-10, 10+
  remote?: WorkMode;             // onsite, hybrid, remote
  sort?: JobSortOption;          // newest, salary_desc, salary_asc, relevant
  page?: number;                 // 1-indexed page number
  pageSize?: number;             // Default: 20
}

interface JobSearchResponse {
  success: boolean;
  data?: {
    jobs: JobCardData[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    processingTime: number;
    isFallback: boolean;    // True if using Firestore
  };
  error?: string;
}

async function searchJobs(params: JobSearchParams): Promise<JobSearchResponse>
```

**Data Source:** MeiliSearch (primary) → Firestore (fallback on timeout > 5s)

**Timeout Strategy:**
- MeiliSearch: 5s timeout
- Firestore fallback: 10s timeout
- Total max: 15s

**Caching:** SWR key `jobs-list-${filterHash}`, 60s stale

### 6.2 getJobById

```typescript
async function getJobById(jobId: string): Promise<JobDetailData | null>
```

**Data Source:** Firestore `jobs` collection

**Returns:** Full job details or null if not found

**Caching:** SWR key `job-${id}`, 60s stale + ISR 300s

### 6.3 getSimilarJobs

```typescript
async function getSimilarJobs(
  jobId: string,
  limit: number = 5
): Promise<JobCardData[]>
```

**Data Source:** MeiliSearch (filter by similar jobFunction/industry)

**Algorithm:**
1. Get current job's `jobFunction` and `jobIndustry`
2. Search MeiliSearch with filters:
   - `jobFunction = currentJob.jobFunction` OR `jobIndustry = currentJob.jobIndustry`
   - `uid != currentJob.uid` (exclude current job)
   - `isActive = true`, `jobStatus IN [published, ontimer]`
3. Sort by `createdAt` desc
4. Limit to `limit` results

**Caching:** SWR key `similar-jobs-${id}`, 3600s (1hr)

### 6.4 saveJob

```typescript
interface SaveJobParams {
  candidateId: string;
  jobId: string;
}

interface SaveJobResult {
  success: boolean;
  error?: string;
}

async function saveJob(params: SaveJobParams): Promise<SaveJobResult>
```

**Data Effect:**
- Creates document in `candidate_saved_jobs` collection:
  ```typescript
  {
    candidateId: string;
    jobId: string;
    savedAt: number; // Timestamp
    createdAt: number;
    updatedAt: number;
  }
  ```

**Guards:**
- Check user is authenticated
- Check user has candidate role
- Check job exists and is active
- Idempotent (no-op if already saved)

**SWR Invalidation:** `saved-jobs-${candidateId}`

### 6.5 unsaveJob

```typescript
async function unsaveJob(params: SaveJobParams): Promise<SaveJobResult>
```

**Data Effect:**
- Deletes document from `candidate_saved_jobs` where `candidateId` and `jobId` match

**Guards:**
- Check user is authenticated
- Check user has candidate role
- Idempotent (no-op if not saved)

**SWR Invalidation:** `saved-jobs-${candidateId}`

### 6.6 getSavedJobs

```typescript
interface SavedJobItem {
  job: JobCardData;
  savedAt: number;
  hasApplication: boolean;
  jobAvailability: JobAvailabilityState;
}

async function getSavedJobs(
  candidateId: string
): Promise<SavedJobItem[]>
```

**Data Source:**
1. Fetch `candidate_saved_jobs` where `candidateId === uid`
2. Fetch job details from `jobs` collection (batch get)
3. Check application status from `web_job_applications`
4. Determine job availability

**Caching:** SWR key `saved-jobs-${candidateId}`, 30s stale

---

## 7. Test Plan

### 7.1 Unit Tests

| Test File | Test Count | Coverage Target |
|-----------|------------|-----------------|
| `public-jobs-actions.test.ts` | ~15 | ≥90% |
| `saved-jobs-repository.test.ts` | ~8 | ≥90% |
| `JobCard.test.tsx` | ~12 | ≥90% |
| `JobFilters.test.tsx` | ~15 | ≥90% |
| `SalaryDisplay.test.tsx` | ~8 | ≥90% |
| `SaveJobButton.test.tsx` | ~10 | ≥90% |
| `LoginPromptModal.test.tsx` | ~6 | ≥90% |
| **TOTAL** | **~74 tests** | **≥90%** |

### 7.2 Integration Tests

| Test File | Test Count | Purpose |
|-----------|------------|---------|
| `public-jobs-integration.test.ts` | ~10 | Verify DB operations with real dev database |

**Critical Integration Tests:**
1. `searchJobs` with various filters returns correct Firestore results
2. `saveJob` creates document in `candidate_saved_jobs`
3. `unsaveJob` deletes document from `candidate_saved_jobs`
4. `getSavedJobs` returns jobs with correct availability states
5. MeiliSearch fallback triggers on timeout
6. Similar jobs algorithm works correctly

### 7.3 E2E Tests

| Test File | Test Count | Flows Covered |
|-----------|------------|---------------|
| `job-list.spec.ts` | ~15 | All JOB-R01 user flows |
| `job-detail.spec.ts` | ~10 | All JOB-R02 user flows |
| **TOTAL** | **~25 tests** | **All RIS flows** |

**From BLS-02 Test Scenarios:**

| ID | Scenario | Route | Expected |
|----|----------|-------|----------|
| DISC-001 | Basic search | JOB-R01 | Jobs with "developer" in title/function |
| DISC-002 | Filter by location | JOB-R01 | Only Bangkok jobs |
| DISC-003 | Filter by salary | JOB-R01 | Jobs with maxSalary >= 30000 |
| DISC-004 | Combine filters | JOB-R01 | Intersection of all filters |
| DISC-005 | Sort by salary | JOB-R01 | Highest salary first |
| DISC-006 | Empty results | JOB-R01 | Empty state with suggestions |
| DISC-007 | Pagination | JOB-R01 | Page 3 results, 20 items |
| DISC-008 | Clear all filters | JOB-R01 | Reset to defaults |
| DISC-009 | MeiliSearch fallback | JOB-R01 | Firestore results + notice |
| DISC-010 | URL state sync | JOB-R01 | Same results restored on refresh |
| DISC-011 | Valid job | JOB-R02 | Full job detail |
| DISC-012 | Job not found | JOB-R02 | 404 page |
| DISC-013 | Closed job | JOB-R02 | Content + gray banner |
| DISC-014 | Expired job | JOB-R02 | Content + gray banner |
| DISC-019 | Guest save | JOB-R01/R02 | Login prompt modal |
| DISC-020 | Candidate save | JOB-R01/R02 | Heart fills, toast |

---

## 8. Dependencies & Risks

### 8.1 External Dependencies

| Dependency | Status | Risk | Mitigation |
|------------|--------|------|------------|
| MeiliSearch | ✅ Configured | Medium (timeout/unavailability) | Firestore fallback + timeout handling |
| Firestore | ✅ Available | Low | Standard retry logic |
| Master Data (provinces, etc.) | ✅ Exists | Low | Already implemented |

### 8.2 Technical Risks

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| MeiliSearch performance degradation | Medium | Slow search, poor UX | Implement aggressive timeout (5s), fallback to Firestore |
| Saved jobs collection performance | Low | Slow save/unsave | Use batch operations, client-side cache |
| Public route SEO not optimized | Medium | Low search visibility | Implement ISR, structured data, metadata |
| Guest/authenticated state confusion | Low | Wrong shell displayed | Robust shell selection logic, unit tests |

### 8.3 Open Questions for PM/SA

#### Q1: PublicHeader Search Bar

**Question:** Should the PublicHeader include a job search bar, or should search functionality only be available on the `/jobs` page?

**Options:**
- **A)** Search bar in header (always visible, global job search)
- **B)** No search bar in header (search only on `/jobs` page)

**Recommendation:** Option B (no search bar in header) for v1.0
- **Rationale:** Simpler initial implementation, search is primary function of `/jobs` page
- **Future:** Can add global search in v2.0

**Decision Required:** [ ] Approved / [ ] Modified / [ ] Rejected

---

#### Q2: ISR Revalidation Interval

**Question:** What ISR revalidation interval should we use for job detail pages?

**Options:**
- **A)** 60s (more fresh, higher server load)
- **B)** 300s (5 min - balanced)
- **C)** 600s (10 min - lower load, less fresh)

**Recommendation:** Option B (300s)
- **Rationale:** Balances freshness with server load, job details don't change frequently
- **Additional:** Use SWR 60s stale for client-side updates

**Decision Required:** [ ] Approved / [ ] Modified / [ ] Rejected

---

#### Q3: Similar Jobs Algorithm

**Question:** How should we determine "similar" jobs?

**Options:**
- **A)** Same jobFunction OR same jobIndustry (broad, more results)
- **B)** Same jobFunction AND same jobIndustry (narrow, fewer results)
- **C)** MeiliSearch semantic similarity (requires ML, not available yet)

**Recommendation:** Option A (jobFunction OR jobIndustry)
- **Rationale:** Ensures we always show some similar jobs, better discovery
- **Future:** Can enhance with ML-based similarity later

**Decision Required:** [ ] Approved / [ ] Modified / [ ] Rejected

---

#### Q4: Saved Jobs Limit

**Question:** Should we impose a limit on how many jobs a candidate can save?

**Options:**
- **A)** No limit (unlimited saved jobs)
- **B)** 50 saved jobs max
- **C)** 100 saved jobs max

**Recommendation:** Option C (100 max)
- **Rationale:** Prevents abuse, encourages candidates to curate their saves, reasonable for most users
- **UX:** Show count in UI (e.g., "15/100 saved jobs")

**Decision Required:** [ ] Approved / [ ] Modified / [ ] Rejected

---

#### Q5: Guest Job Search Analytics

**Question:** Should we track guest job searches for analytics?

**Options:**
- **A)** Yes, track keyword + filters (anonymized)
- **B)** No, only track authenticated user searches

**Recommendation:** Option A (track anonymous searches)
- **Rationale:** Valuable data for understanding job market demand, SEO optimization
- **Privacy:** Fully anonymized, no PII

**Decision Required:** [ ] Approved / [ ] Modified / [ ] Rejected

---

#### Q6: Empty State Filter Suggestions

**Question:** When no jobs match filters, which filter should we suggest removing first?

**Options:**
- **A)** Most restrictive filter (e.g., highest salary requirement)
- **B)** Last applied filter
- **C)** Show count preview for each filter removal (e.g., "Remove education filter → 5 jobs")

**Recommendation:** Option C (show count preview)
- **Rationale:** Most helpful for users, clear cause-and-effect
- **Implementation:** Run multiple searches to get counts (may be slow, consider showing only for critical filters)

**Decision Required:** [ ] Approved / [ ] Modified / [ ] Rejected

---

## 9. Phase Breakdown Proposal

### Phase 1: Types & Constants (Day 1 AM, ~2-3 hours)

**Deliverables:**
- [ ] `src/types/public-jobs.ts` (all interfaces)
- [ ] `src/lib/constants/jobsmarket/job-filters.ts` (all constants)

**Quality Gates:**
- [x] Gate 1: Build passes ✅
- [x] Gate 2: Lint passes ✅
- [ ] Gate 4a: Unit tests N/A (types only)

**Estimated Test Count:** 0 (types don't require tests)

---

### Phase 2: Server Actions & Repository (Day 1 PM, ~4-5 hours)

**Deliverables:**
- [ ] `src/lib/database/repositories/candidate-saved-jobs-repository.ts`
- [ ] `src/lib/database/schemas/candidate-saved-jobs.schema.ts`
- [ ] `src/domains/jobs/services/server/actions/jobsmarket/public-jobs.ts`
- [ ] ENHANCEMENT: `src/lib/meilisearch/job-search.ts`

**Quality Gates:**
- [ ] Gate 1: Build passes ⛔ STOP
- [ ] Gate 2: Lint passes ⛔ STOP
- [ ] Gate 4a: Unit tests ≥90% coverage ⛔ STOP
- [ ] Gate 4b: Integration tests pass ⛔ STOP

**Estimated Test Count:**
- Unit: ~23 tests
- Integration: ~10 tests

---

### Phase 3: Layout & Shell (Day 2 AM, ~3-4 hours)

**Deliverables:**
- [ ] `src/app/jobsmarket/jobs/layout.tsx`
- [ ] `src/components/jobsmarket/shells/PublicShell.tsx`
- [ ] `src/components/jobsmarket/jobs/PublicHeader.tsx`
- [ ] `src/components/jobsmarket/jobs/PublicFooter.tsx`

**Quality Gates:**
- [ ] Gate 1: Build passes ⛔ STOP
- [ ] Gate 2: Lint passes ⛔ STOP
- [ ] Gate 3: Dev server starts, route loads ⛔ STOP
- [ ] Gate 4a: Unit tests ≥90% coverage ⛔ STOP

**Estimated Test Count:**
- Unit: ~18 tests
- E2E: ~5 tests (basic rendering)

---

### Phase 4: Shared Components (Day 2 PM + Day 3 AM, ~6-8 hours)

**Deliverables:**
- [ ] `src/components/jobsmarket/jobs/JobCard.tsx`
- [ ] `src/components/jobsmarket/jobs/JobFilters.tsx`
- [ ] `src/components/jobsmarket/jobs/SaveJobButton.tsx`
- [ ] `src/components/jobsmarket/jobs/SalaryDisplay.tsx`
- [ ] `src/components/jobsmarket/jobs/LocationBadge.tsx`
- [ ] `src/components/jobsmarket/jobs/JobStatusBadge.tsx`
- [ ] `src/components/jobsmarket/jobs/LoginPromptModal.tsx`

**Quality Gates:**
- [ ] Gate 1: Build passes ⛔ STOP
- [ ] Gate 2: Lint passes ⛔ STOP
- [ ] Gate 3: Dev server + browser (components render) ⛔ STOP
- [ ] Gate 4a: Unit tests ≥90% coverage ⛔ STOP

**Estimated Test Count:**
- Unit: ~51 tests

---

### Phase 5: Tests & Quality Gates (Day 3 PM, ~3-4 hours)

**Deliverables:**
- [ ] E2E tests for all flows
- [ ] Final quality gate verification
- [ ] Coverage report

**Quality Gates:**
- [ ] Gate 4c: E2E tests pass ⛔ STOP
- [ ] Gate 4c: All RIS flows covered ⛔ STOP

**Estimated Test Count:**
- E2E: ~20 tests

---

### Total Effort Estimate

| Phase | Estimated Time |
|-------|----------------|
| Phase 1 | 2-3 hours |
| Phase 2 | 4-5 hours |
| Phase 3 | 3-4 hours |
| Phase 4 | 6-8 hours |
| Phase 5 | 3-4 hours |
| **TOTAL** | **18-24 hours (~2-3 days)** |

---

## 10. Summary & Recommendations

### 10.1 Key Findings

✅ **Strong Foundation:**
- Jobs repository fully implemented and production-ready
- MeiliSearch integration exists (needs enhancement)
- Basic server actions available
- Master data (provinces) exists

⚠️ **Gaps to Fill:**
- Public-facing types and constants
- Enhanced MeiliSearch search function
- Saved jobs collection (full implementation)
- Public layout and shell
- All public-facing components

❌ **Critical Missing:**
- No saved jobs functionality (repository, schema, actions)
- No public shell/layout
- No job card components
- No filter components

### 10.2 Recommended Approach

1. **START with Phase 1-2 (foundation)** - Types, constants, server actions
   - Low risk, high value
   - Enables all other phases

2. **THEN Phase 3 (layout)** - Public shell infrastructure
   - Required for Phase 4 to be testable

3. **THEN Phase 4 (components)** - Build public UI
   - Most time-consuming
   - User-facing value

4. **FINALLY Phase 5 (tests)** - Comprehensive testing
   - Ensure quality before PR

### 10.3 Success Criteria

Implementation is successful when:

✅ All quality gates pass:
- [ ] Build passes (0 errors)
- [ ] Lint passes (0 errors)
- [ ] Dev server starts, routes load without errors
- [ ] Unit tests ≥90% coverage
- [ ] Integration tests pass
- [ ] E2E tests cover all BLS-02 scenarios

✅ All open questions resolved by PM/SA

✅ Assessment approved for implementation

---

## 11. Next Steps

**FOR PM/SA:**
1. Review this assessment
2. Answer open questions (Section 8.3)
3. Approve/modify phase breakdown (Section 9)
4. Authorize implementation start

**FOR DEVELOPER (after approval):**
1. Begin Phase 1 (Types & Constants)
2. Follow TDD workflow (RED → GREEN)
3. Report completion with evidence after each phase

---

**Assessment Complete. Awaiting PM/SA Review.**
