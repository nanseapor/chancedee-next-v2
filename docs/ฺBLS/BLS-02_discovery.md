# BLS-02: Discovery Stage Business Logic

**Document ID:** BLS-02  
**Version:** 1.0  
**Status:** Draft  
**Created:** 2025-12-11  
**Last Updated:** 2025-12-11

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-11 | Initial creation with 7 discovery actions |

---

## 1. Stage Overview

### 1.1 Purpose

This BLS specifies the business logic for the **Discovery Stage** — job searching, filtering, viewing job details, saving jobs, and viewing company profiles. These actions enable candidates to explore opportunities and companies to be discovered.

### 1.2 RIS Coverage

| RIS | Route | Relevance |
|-----|-------|-----------|
| JOB-R00 | (cross-cutting) | Shared patterns: Save Job, Login Prompt, Job Card |
| JOB-R01 | `/jobs` | Job search, filtering, pagination, save job |
| JOB-R02 | `/jobs/[id]` | Job detail view, similar jobs |
| CAND-R05 | `/candidates/[id]/saved` | Saved jobs list, unsave job |
| 02-public-routes | `/companies` | Company directory |
| 02-public-routes | `/companies/[id]` | Company profile, company jobs |

### 1.3 Data Entities Used

| Entity | Collection | Purpose |
|--------|------------|---------|
| Jobs | `jobs` | Job listings (MeiliSearch indexed) |
| Candidate Information | `candidate_information` | Saved jobs array, candidate profile |
| Candidate Saved Jobs | `candidate_saved_jobs` | Individual save records |
| Company Information | `company_information` | Company profiles |
| Master Data | `master_data` | Provinces, education levels, employment types |

### 1.4 Search Infrastructure

| Component | Purpose |
|-----------|---------|
| MeiliSearch | Primary search engine (job index) |
| Firestore | Fallback when MeiliSearch unavailable |
| SWR | Client-side caching with stale-while-revalidate |

---

## 2. Actor-Action Matrix

| Action | Guest | Candidate | Company | Admin |
|--------|-------|-----------|---------|-------|
| searchJobs | ✅ | ✅ | ✅ | ✅ |
| viewJob | ✅ | ✅ | ✅ | ✅ |
| saveJob | ⚠️ | ✅ | — | — |
| unsaveJob | — | ✅ | — | — |
| viewSavedJobs | — | ✅ | — | — |
| viewCompanyProfile | ✅ | ✅ | ✅ | ✅ |
| viewCompanyJobs | ✅ | ✅ | ✅ | ✅ |

**Legend:**
- ✅ = Can perform
- ⚠️ = Triggers login prompt (action requires authentication)
- — = Cannot perform / Not applicable

---

## 3. Action Specifications

### 3.1 Action: searchJobs

#### Purpose

Search and filter job listings with advanced criteria, pagination, and sorting.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Any user (guest or authenticated) |
| **Affected** | None (read-only) |
| **System** | MeiliSearch, Firestore (fallback) |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| JOB-R01 | `/jobs` | Page load, filter apply, search submit | URL query params |
| JOB-R01 | `/jobs` | Sort change | Sort option |
| JOB-R01 | `/jobs` | Pagination click | Page number |
| Landing | `/` | Hero search box | Keyword, location |

---

#### Input Parameters

```typescript
interface SearchJobsInput {
  q?: string;                    // Search keyword
  locations?: string[];          // Province codes (comma-separated in URL)
  types?: EmploymentType[];      // fulltime, parttime, contract, internship
  salaryMin?: number;            // Minimum salary (THB)
  salaryMax?: number;            // Maximum salary (THB)
  education?: EducationLevel[];  // Education requirements
  experience?: ExperienceRange;  // 0, 1-3, 3-5, 5-10, 10+
  remote?: WorkMode;             // onsite, hybrid, remote
  sort?: JobSortOption;          // newest, salary_desc, salary_asc, relevant
  page?: number;                 // 1-indexed page number
}

type EmploymentType = 'fulltime' | 'parttime' | 'contract' | 'internship';
type EducationLevel = 'high_school' | 'vocational' | 'bachelor' | 'master' | 'doctorate';
type ExperienceRange = '0' | '1-3' | '3-5' | '5-10' | '10+';
type WorkMode = 'onsite' | 'hybrid' | 'remote';
type JobSortOption = 'newest' | 'salary_desc' | 'salary_asc' | 'relevant';
```

---

#### Guards (Pre-conditions)

| Guard | Check | Failure Action |
|-------|-------|----------------|
| Valid page number | `page >= 1` | Reset to page 1 |
| Valid salary range | `salaryMin <= salaryMax` (if both provided) | Ignore invalid filter |
| Valid sort option | `sort` in allowed values | Use default 'newest' |
| Sort 'relevant' allowed | `sort === 'relevant'` requires `q` present | Fall back to 'newest' |

---

#### State Machine

```
                    ┌─────────────────┐
                    │    LOADING      │
                    │ (initial fetch) │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   ┌───────────┐      ┌───────────┐      ┌───────────┐
   │   IDLE    │      │   EMPTY   │      │   ERROR   │
   │ (results) │      │ (0 hits)  │      │ (failed)  │
   └─────┬─────┘      └─────┬─────┘      └─────┬─────┘
         │                  │                  │
         ▼                  ▼                  ▼
   ┌───────────┐      ┌───────────┐      ┌───────────┐
   │ SEARCHING │◄─────│   IDLE    │◄─────│   IDLE    │
   └───────────┘      └───────────┘      └───────────┘
         │
         ▼
    (loop back to IDLE/EMPTY/ERROR)
```

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `loading` | `SEARCH_SUCCESS` | `idle` | `results.length > 0` | Update job list, announce count |
| `loading` | `SEARCH_SUCCESS` | `empty` | `results.length === 0` | Show empty state |
| `loading` | `SEARCH_ERROR` | `error` | — | Set error message |
| `idle` | `APPLY_FILTERS` | `searching` | — | Update URL params |
| `idle` | `CHANGE_SORT` | `searching` | — | Update URL (immediate) |
| `idle` | `CHANGE_PAGE` | `searching` | — | Scroll to top |
| `idle` | `CLEAR_FILTERS` | `searching` | — | Reset all filters |
| `searching` | `SEARCH_SUCCESS` | `idle` | `results.length > 0` | Update list |
| `searching` | `SEARCH_SUCCESS` | `empty` | `results.length === 0` | Show empty state |
| `searching` | `SEARCH_ERROR` | `error` | — | Show error |
| `empty` | `APPLY_FILTERS` | `searching` | — | — |
| `empty` | `CLEAR_FILTERS` | `searching` | — | — |
| `empty` | `REMOVE_FILTER` | `searching` | — | Suggest filter removal |
| `error` | `RETRY` | `searching` | — | Clear error |
| `error` | `APPLY_FILTERS` | `searching` | — | New search |

---

#### Data Effects

**Read Operations:**

| Collection | Query | Purpose |
|------------|-------|---------|
| MeiliSearch `job` | Filter expression + pagination | Primary search |
| Firestore `jobs` | Where clauses (fallback) | Backup when MeiliSearch down |
| `master_data` | `type === 'provinces'` | Location filter options |
| `master_data` | `type === 'education_levels'` | Education filter options |
| `master_data` | `type === 'employment_types'` | Job type filter options |
| `candidate_saved_jobs` | `candidateId === uid` | Show saved state on cards |

**MeiliSearch Query Construction:**

```typescript
const baseFilters = [
  'isActive = true',
  'jobStatus IN [published, ontimer]',
  `postStartDate <= ${Date.now()}`
];

// User filters appended conditionally
const userFilters = [
  locations.length > 0 && `workLocation IN [${locations.map(l => `"${l}"`).join(',')}]`,
  types.length > 0 && `employment IN [${types.map(t => `"${t}"`).join(',')}]`,
  salaryMin && `maxSalary >= ${salaryMin}`,
  salaryMax && `minSalary <= ${salaryMax}`,
].filter(Boolean);
```

**Write Operations:** None (read-only)

---

#### Output

```typescript
interface SearchJobsResult {
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

interface JobCardData {
  uid: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  minSalary: number | null;
  maxSalary: number | null;
  isNegotiable: boolean;
  workLocationText: string;
  employmentText: string;
  experienceText: string;
  createdAt: number;
  _matchScore?: number;     // Only for logged-in candidates
}
```

---

#### Error Handling

| Error | Condition | Thai Message | Recovery |
|-------|-----------|--------------|----------|
| Search timeout | Response > 5s | กำลังค้นหานานกว่าปกติ กรุณาลองใหม่ | Retry button |
| Network error | Fetch failed | ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ต | Retry button |
| MeiliSearch down | 503/Connection refused | กำลังค้นหาแบบช้า กรุณารอสักครู่ | Auto-fallback to Firestore |
| Invalid page | `page > totalPages` | — | Redirect to page 1 |

---

#### Test Scenarios

| ID | Scenario | Input | Expected Output | Notes |
|----|----------|-------|-----------------|-------|
| DISC-001 | Basic search | `q="developer"` | Jobs with "developer" in title/function | Fuzzy match |
| DISC-002 | Filter by location | `location=["กรุงเทพมหานคร"]` | Only Bangkok jobs | |
| DISC-003 | Filter by salary | `salaryMin=30000` | Jobs with maxSalary >= 30000 | |
| DISC-004 | Combine filters | Multiple filters | Intersection of all filters | |
| DISC-005 | Sort by salary | `sort="salary_desc"` | Highest salary first | |
| DISC-006 | Empty results | `q="xyznonexistent"` | Empty state with suggestions | |
| DISC-007 | Pagination | `page=3` | Page 3 results, 20 items | |
| DISC-008 | Clear all filters | Click clear | Reset to defaults | |
| DISC-009 | MeiliSearch fallback | MeiliSearch unavailable | Firestore results + notice | |
| DISC-010 | URL state sync | Refresh with filters | Same results restored | |

---

### 3.2 Action: viewJob

#### Purpose

Display full job details including description, requirements, benefits, and company info.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Any user (guest or authenticated) |
| **Affected** | None (read-only) |
| **System** | Firestore |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| JOB-R02 | `/jobs/[id]` | Page load | Job ID from URL |
| JOB-R01 | `/jobs` | Job card click | Job ID |
| Landing | `/` | Featured job click | Job ID |
| CAND-R05 | `/candidates/[id]/saved` | Saved job click | Job ID |

---

#### Input Parameters

```typescript
interface ViewJobInput {
  jobId: string;                  // Job UID
  applyDeepLink?: boolean;        // ?apply=true - scroll to apply
  fromSearch?: boolean;           // ?from=search - show back link
}
```

---

#### Guards (Pre-conditions)

| Guard | Check | Failure Action |
|-------|-------|----------------|
| Job exists | Job document found | 404 page |
| Job is visible | `isActive === true` AND `jobStatus` in [published, ontimer] | 404 (unless owner) |
| Job not expired | `postExpiryDate > now` OR null | Show expired banner (still visible) |

---

#### State Machine

```
                    ┌─────────────┐
                    │   LOADING   │
                    │ (fetch job) │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
  ┌────────────┐   ┌────────────┐   ┌────────────┐
  │    IDLE    │   │ NOT_FOUND  │   │   ERROR    │
  │ (job data) │   │   (404)    │   │  (failed)  │
  └──────┬─────┘   └────────────┘   └──────┬─────┘
         │                                 │
         │                                 │
         ▼                                 ▼
    (view only)                      ┌────────────┐
                                     │    IDLE    │
                                     └────────────┘
```

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `loading` | `FETCH_SUCCESS` | `idle` | `job !== null` | Set job data |
| `loading` | `FETCH_SUCCESS` | `not_found` | `job === null` | — |
| `loading` | `FETCH_ERROR` | `error` | — | Set error message |
| `error` | `RETRY` | `loading` | — | Re-fetch |

---

#### Data Effects

**Read Operations:**

| Collection | Query | Purpose |
|------------|-------|---------|
| `jobs` | `uid === params.id` | Job details |
| `company_information` | `uid === job.companyId` | Company info for sidebar |
| `candidate_information` | `uid === currentUser.uid` | Profile completion check |
| `web_job_applications` | `candidateId === uid AND jobId === id` | Already applied check |
| `candidate_saved_jobs` | `candidateId === uid` | Saved state |
| MeiliSearch `job` | Similar function/industry | Similar jobs |

**Write Operations:** None (read-only, apply is separate action)

---

#### Output

```typescript
interface ViewJobResult {
  success: boolean;
  data?: {
    job: JobDetailData;
    company: CompanySummary;
    similarJobs: JobCardData[];
    applicationCount: number;
    existingApplication?: ApplicationStatus;
    isSaved: boolean;
    profileCompletion: ProfileCompletionStatus;
  };
  error?: string;
}

interface JobDetailData {
  uid: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  minSalary: number | null;
  maxSalary: number | null;
  isNegotiable: boolean;
  workLocationText: string;
  employmentText: string;
  experienceText: string;
  educationLevelText: string[];
  jobDescriptionDetails: string;   // HTML
  qualificationDetails: string;    // HTML
  benefitsDetails: string;         // HTML
  phone: string;
  email: string;
  postStartDate: number;
  postExpiryDate: number;
  jobStatus: JobStatus;
  isActive: boolean;
  positions: number;
}

type JobStatus = 'draft' | 'published' | 'ontimer' | 'unpublished' | 'closed';
```

---

#### Job Availability States

```typescript
type JobAvailability = 'available' | 'closed' | 'expired' | 'unpublished' | 'not_found';

function getJobAvailability(job: JobDetailData | null): JobAvailability {
  if (!job) return 'not_found';
  if (job.jobStatus === 'closed') return 'closed';
  if (job.jobStatus === 'unpublished') return 'unpublished';
  if (job.postExpiryDate && job.postExpiryDate < Date.now()) return 'expired';
  if (!job.isActive) return 'closed';
  return 'available';
}
```

| State | Display | Apply Allowed |
|-------|---------|---------------|
| `available` | Normal content | ✅ |
| `closed` | Gray banner: "ตำแหน่งนี้ปิดรับสมัครแล้ว" | ❌ |
| `expired` | Gray banner: "ประกาศงานหมดอายุแล้ว" | ❌ |
| `unpublished` | 404 page | ❌ |
| `not_found` | 404 page | ❌ |

---

#### Error Handling

| Error | Condition | Thai Message | Recovery |
|-------|-----------|--------------|----------|
| Job not found | Document doesn't exist | ไม่พบงานที่คุณกำลังค้นหา | Link to /jobs |
| Job closed | `jobStatus === 'closed'` | ตำแหน่งนี้ปิดรับสมัครแล้ว | Show banner |
| Job expired | Past expiry date | ประกาศงานหมดอายุแล้ว | Show banner |
| Network error | Fetch failed | เกิดข้อผิดพลาด กรุณาลองใหม่ | Retry button |

---

#### Test Scenarios

| ID | Scenario | Input | Expected Output | Notes |
|----|----------|-------|-----------------|-------|
| DISC-011 | Valid job | Valid job ID | Full job detail | |
| DISC-012 | Job not found | Invalid ID | 404 page | |
| DISC-013 | Closed job | Closed job ID | Content + gray banner | |
| DISC-014 | Expired job | Expired job ID | Content + gray banner | |
| DISC-015 | Apply deep link | `?apply=true` | Scroll to apply section | |
| DISC-016 | Similar jobs | — | Related jobs carousel | |
| DISC-017 | Application count | — | "XX คนสมัครแล้ว" | |
| DISC-018 | Company link | Click company name | Navigate to profile | |

---

### 3.3 Action: saveJob

#### Purpose

Add a job to candidate's saved jobs list for later reference.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Candidate (authenticated with candidate role) |
| **Affected** | Own saved jobs list |
| **System** | Firestore |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| JOB-R01 | `/jobs` | Heart icon on job card | Job ID |
| JOB-R02 | `/jobs/[id]` | Save button in sidebar | Job ID |
| JOB-R02 | `/jobs/[id]` | Similar job card heart | Job ID |

---

#### Input Parameters

```typescript
interface SaveJobInput {
  candidateId: string;    // Current user UID
  jobId: string;          // Job to save
}
```

---

#### Guards (Pre-conditions)

| Guard | Check | Failure Action |
|-------|-------|----------------|
| Authenticated | `sessionStateAtom === 'valid'` | Open login prompt modal |
| Has candidate role | `'candidate' in user.roles` | Reject (company users can't save) |
| Job exists | Job document found | Toast: "งานนี้ไม่พร้อมรับสมัครแล้ว" |
| Not already saved | `jobId NOT IN savedJobs` | No-op (idempotent) |

---

#### State Machine

```
                 ┌───────────────┐
       ┌─────────►   UNSAVED     │◄─────────┐
       │         └───────┬───────┘          │
       │                 │                  │
       │          SAVE_CLICK                │
       │                 │                  │
       │     ┌───────────┴───────────┐      │
       │     │                       │      │
       │     ▼ (guest)               ▼ (logged in)
       │ ┌───────────────┐     ┌───────────┐
       │ │ LOGIN_PROMPT  │     │  SAVING   │
       │ └───────┬───────┘     └─────┬─────┘
       │         │                   │
       │    ┌────┴────┐        ┌─────┴─────┐
       │    │         │        │           │
       │ DISMISS   LOGIN    SUCCESS      ERROR
       │    │         │        │           │
       │    ▼         ▼        ▼           │
       └───(back)  (redirect) ┌───────────┐│
                              │   SAVED   ││
                              └─────┬─────┘│
                                    │      │
                             UNSAVE_CLICK  │
                                    │      │
                                    ▼      │
                              ┌───────────┐│
                              │ UNSAVING  │┘
                              └─────┬─────┘
                                    │
                              ┌─────┴─────┐
                           SUCCESS      ERROR
                              │           │
                              ▼           │
                         (to UNSAVED)     │
                                          │
                         (revert to SAVED)┘
```

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `unsaved` | `SAVE_CLICK` | `login_prompt` | `!isLoggedIn` | Set `loginPromptJobId` |
| `unsaved` | `SAVE_CLICK` | `saving` | `isLoggedIn` | Optimistic: fill heart |
| `saving` | `SAVE_SUCCESS` | `saved` | — | Invalidate SWR, show toast |
| `saving` | `SAVE_ERROR` | `unsaved` | — | Revert heart, error toast |
| `login_prompt` | `DISMISS` | `unsaved` | — | Clear prompt |
| `login_prompt` | `LOGIN` | — | — | Redirect to login with return |

---

#### Data Effects

**Write Operations:**

| Collection | Operation | Fields | Trigger |
|------------|-----------|--------|---------|
| `candidate_saved_jobs` | Create | `candidateId`, `jobId`, `savedAt` | Save success |

**Example Document:**
```typescript
// candidate_saved_jobs/{autoId}
{
  candidateId: "user_abc123",
  jobId: "job_xyz789",
  savedAt: 1702300000000,
  createdAt: 1702300000000,
  updatedAt: 1702300000000
}
```

**SWR Invalidation:**
- `saved-jobs-${uid}` - Refresh saved job IDs list

---

#### Output

```typescript
interface SaveJobResult {
  success: boolean;
  error?: string;
}
```

---

#### Error Handling

| Error | Condition | Thai Message | Recovery |
|-------|-----------|--------------|----------|
| Not authenticated | No session | — | Login prompt modal |
| Save failed | Server error | ไม่สามารถบันทึกงานได้ กรุณาลองใหม่ | Toast with retry |
| Job not found | Job deleted | งานนี้ไม่พร้อมรับสมัครแล้ว | Toast (info) |

---

#### Optimistic Update Pattern

```typescript
async function saveJob(jobId: string) {
  // 1. Optimistic update
  const previousSaved = savedJobIds;
  setSavedJobIds(prev => [...prev, jobId]);
  
  try {
    // 2. Server action
    await CandidateSaveJob({ candidateId: uid, jobId });
    
    // 3. Invalidate cache
    mutate(`saved-jobs-${uid}`);
    
    // 4. Toast
    toast.success('บันทึกงานแล้ว');
    
  } catch (error) {
    // 5. Revert on error
    setSavedJobIds(previousSaved);
    toast.error('ไม่สามารถบันทึกงานได้ กรุณาลองใหม่');
  }
}
```

---

#### Test Scenarios

| ID | Scenario | Input | Expected Output | Notes |
|----|----------|-------|-----------------|-------|
| DISC-019 | Guest save | Heart click (guest) | Login prompt modal | |
| DISC-020 | Candidate save | Heart click (logged in) | Heart fills, toast | Optimistic |
| DISC-021 | Save error | Network failure | Heart reverts, error toast | |
| DISC-022 | Already saved | Click saved job | No-op (idempotent) | |
| DISC-023 | Login redirect | Login from prompt | Return to page, job saved | |

---

### 3.4 Action: unsaveJob

#### Purpose

Remove a job from candidate's saved jobs list.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Candidate (authenticated with candidate role) |
| **Affected** | Own saved jobs list |
| **System** | Firestore |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| JOB-R01 | `/jobs` | Filled heart icon click | Job ID |
| JOB-R02 | `/jobs/[id]` | Save button (already saved) | Job ID |
| CAND-R05 | `/candidates/[id]/saved` | Unsave button on card | Job ID |

---

#### Input Parameters

```typescript
interface UnsaveJobInput {
  candidateId: string;    // Current user UID
  jobId: string;          // Job to unsave
}
```

---

#### Guards (Pre-conditions)

| Guard | Check | Failure Action |
|-------|-------|----------------|
| Authenticated | `sessionStateAtom === 'valid'` | Reject |
| Has candidate role | `'candidate' in user.roles` | Reject |
| Job is saved | `jobId IN savedJobs` | No-op (idempotent) |

---

#### State Machine

(Continuation from saveJob state machine - `saved` → `unsaving` → `unsaved`)

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `saved` | `UNSAVE_CLICK` | `unsaving` | — | Optimistic: empty heart |
| `unsaving` | `UNSAVE_SUCCESS` | `unsaved` | — | Invalidate SWR |
| `unsaving` | `UNSAVE_ERROR` | `saved` | — | Revert heart, error toast |

---

#### Data Effects

**Write Operations:**

| Collection | Operation | Query | Trigger |
|------------|-----------|-------|---------|
| `candidate_saved_jobs` | Delete | `candidateId === uid AND jobId === id` | Unsave success |

**SWR Invalidation:**
- `saved-jobs-${uid}` - Refresh saved job IDs list

---

#### Output

```typescript
interface UnsaveJobResult {
  success: boolean;
  error?: string;
}
```

---

#### Error Handling

| Error | Condition | Thai Message | Recovery |
|-------|-----------|--------------|----------|
| Unsave failed | Server error | ไม่สามารถยกเลิกการบันทึกได้ | Toast with retry |

---

#### Test Scenarios

| ID | Scenario | Input | Expected Output | Notes |
|----|----------|-------|-----------------|-------|
| DISC-024 | Unsave job | Filled heart click | Heart empties | Optimistic |
| DISC-025 | Unsave error | Network failure | Heart refills, error toast | Revert |
| DISC-026 | Unsave from saved page | Unsave button | Card removed from list | |

---

### 3.5 Action: viewSavedJobs

#### Purpose

Display list of all jobs saved by the candidate.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Candidate (authenticated with candidate role) |
| **Affected** | None (read-only) |
| **System** | Firestore |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| CAND-R05 | `/candidates/[id]/saved` | Page load | Candidate ID |
| CAND-R05 | `/candidates/[id]/saved?tab=jobs` | Jobs tab | Tab parameter |

---

#### Input Parameters

```typescript
interface ViewSavedJobsInput {
  candidateId: string;    // Current user UID (must match route param)
}
```

---

#### Guards (Pre-conditions)

| Guard | Check | Failure Action |
|-------|-------|----------------|
| Authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| Has candidate role | `'candidate' in user.roles` | 403 page |
| Ownership | `params.id === currentUser.uid` | Redirect to own saved |

---

#### State Machine

```
                    ┌─────────────┐
                    │   LOADING   │
                    │ (fetch list)│
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌───────────┐    ┌───────────┐    ┌───────────┐
   │   IDLE    │    │   EMPTY   │    │   ERROR   │
   │ (has jobs)│    │ (no saved)│    │ (failed)  │
   └───────────┘    └───────────┘    └───────────┘
```

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `loading` | `FETCH_SUCCESS` | `idle` | `jobs.length > 0` | Set job list |
| `loading` | `FETCH_SUCCESS` | `empty` | `jobs.length === 0` | Show empty state |
| `loading` | `FETCH_ERROR` | `error` | — | Set error message |
| `idle` | `UNSAVE` | `idle` | — | Remove from list (optimistic) |
| `idle` | `UNSAVE_ERROR` | `idle` | — | Restore to list |

---

#### Data Effects

**Read Operations:**

| Collection | Query | Purpose |
|------------|-------|---------|
| `candidate_saved_jobs` | `candidateId === uid` | Get saved job IDs |
| `jobs` | `uid IN savedJobIds` | Get job details for display |
| `web_job_applications` | `candidateId === uid` | Check if already applied |

**Write Operations:** None (unsave is separate action)

---

#### Output

```typescript
interface ViewSavedJobsResult {
  success: boolean;
  data?: {
    jobs: SavedJobItem[];
    totalCount: number;
  };
  error?: string;
}

interface SavedJobItem {
  job: JobCardData;
  savedAt: number;
  hasApplication: boolean;
  jobAvailability: JobAvailability;  // available, closed, expired
}
```

---

#### Closed Job Display

| Job State | Display |
|-----------|---------|
| `available` | Normal card with "สมัครงาน" button |
| `closed` | Badge "ปิดแล้ว", greyed card |
| `expired` | Badge "หมดอายุแล้ว", greyed card |
| `not_found` | Remove from list silently |

---

#### Error Handling

| Error | Condition | Thai Message | Recovery |
|-------|-----------|--------------|----------|
| Network error | Fetch failed | ไม่สามารถโหลดรายการได้ | Retry button |
| Unauthorized | Not owner | — | Redirect to own saved |

---

#### Test Scenarios

| ID | Scenario | Input | Expected Output | Notes |
|----|----------|-------|-----------------|-------|
| DISC-027 | View saved jobs | Has saved jobs | List of job cards | |
| DISC-028 | Empty saved | No saved jobs | Empty state + CTA | "ค้นหางาน" link |
| DISC-029 | Closed job in list | Saved job is closed | Badge "ปิดแล้ว" | |
| DISC-030 | Click saved job | Job card click | Navigate to detail | |
| DISC-031 | Apply from saved | Apply button | Navigate to job detail | |

---

### 3.6 Action: viewCompanyProfile

#### Purpose

Display public company profile with company info and open positions.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Any user (guest or authenticated) |
| **Affected** | None (read-only) |
| **System** | Firestore |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| 02-public-routes | `/companies/[id]` | Page load | Company ID |
| JOB-R01 | `/jobs` | Company name/logo click | Company ID |
| JOB-R02 | `/jobs/[id]` | Company name/logo click | Company ID |
| Landing | `/` | Top companies carousel | Company ID |

---

#### Input Parameters

```typescript
interface ViewCompanyProfileInput {
  companyId: string;    // Company UID
}
```

---

#### Guards (Pre-conditions)

| Guard | Check | Failure Action |
|-------|-------|----------------|
| Company exists | Document found | 404 page |
| Company is visible | `status === 'approved'` AND `isActive === true` | 404 page |

---

#### State Machine

```
                    ┌─────────────┐
                    │   LOADING   │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌───────────┐    ┌───────────┐    ┌───────────┐
   │   IDLE    │    │ NOT_FOUND │    │   ERROR   │
   │  (loaded) │    │   (404)   │    │ (failed)  │
   └───────────┘    └───────────┘    └───────────┘
```

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `loading` | `FETCH_SUCCESS` | `idle` | `company !== null` | Set company data |
| `loading` | `FETCH_SUCCESS` | `not_found` | `company === null` | — |
| `loading` | `FETCH_ERROR` | `error` | — | Set error message |

---

#### Data Effects

**Read Operations:**

| Collection | Query | Purpose |
|------------|-------|---------|
| `company_information` | `uid === params.id` | Company profile |
| `jobs` | `companyId === id AND isActive AND jobStatus IN [published, ontimer]` | Open positions |

**Write Operations:** None (read-only)

---

#### Output

```typescript
interface ViewCompanyProfileResult {
  success: boolean;
  data?: {
    company: CompanyProfileData;
    openJobs: JobCardData[];
    openJobsCount: number;
  };
  error?: string;
}

interface CompanyProfileData {
  uid: string;
  companyName: string;
  profilePhoto: string;           // Logo
  coverPhoto: string;             // Banner
  industry: string;
  overview: string;               // HTML
  shortDescription: string;       // HTML
  benefitsDetails: string;        // HTML
  companySize: CompanySize;
  website: string;
  address: CompanyAddress;
  contact: CompanyContact;
  isVerified: boolean;            // status === 'approved'
}

type CompanySize = 'S' | 'M' | 'L';
```

---

#### Company Visibility Rules

| Status | isActive | Display |
|--------|----------|---------|
| `approved` | `true` | Normal profile |
| `approved` | `false` | 404 page |
| `pending` | any | 404 page |
| `rejected` | any | 404 page |
| `suspended` | any | 404 page |

---

#### Error Handling

| Error | Condition | Thai Message | Recovery |
|-------|-----------|--------------|----------|
| Not found | Company doesn't exist | ไม่พบบริษัทที่คุณกำลังค้นหา | Link to /companies |
| Company hidden | Not approved/active | — | 404 page |
| Network error | Fetch failed | เกิดข้อผิดพลาด กรุณาลองใหม่ | Retry button |

---

#### Test Scenarios

| ID | Scenario | Input | Expected Output | Notes |
|----|----------|-------|-----------------|-------|
| DISC-032 | Valid company | Valid company ID | Company profile | |
| DISC-033 | Not found | Invalid ID | 404 page | |
| DISC-034 | Pending company | Pending status | 404 page | |
| DISC-035 | Has open jobs | Company with jobs | Jobs section shown | |
| DISC-036 | No open jobs | No active jobs | "ยังไม่มีตำแหน่งเปิดรับ" | |
| DISC-037 | Click job | Job card click | Navigate to job detail | |

---

### 3.7 Action: viewCompanyJobs

#### Purpose

Display all open jobs from a specific company, optionally with filtering.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Any user (guest or authenticated) |
| **Affected** | None (read-only) |
| **System** | MeiliSearch, Firestore |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| 02-public-routes | `/companies/[id]` | "View All" on jobs section | Company ID |
| JOB-R01 | `/jobs?company=[id]` | Company filter applied | Company ID |

---

#### Input Parameters

```typescript
interface ViewCompanyJobsInput {
  companyId: string;    // Company UID
  page?: number;        // Pagination
}
```

---

#### Guards (Pre-conditions)

| Guard | Check | Failure Action |
|-------|-------|----------------|
| Company exists | Document found | Empty results |
| Company is visible | `status === 'approved'` AND `isActive === true` | Empty results |

---

#### Data Effects

**Read Operations:**

| Collection | Query | Purpose |
|------------|-------|---------|
| MeiliSearch `job` | `companyId = "${companyId}"` + base filters | Company jobs |
| `company_information` | `uid === companyId` | Company name for display |

**Write Operations:** None (read-only)

---

#### Output

```typescript
interface ViewCompanyJobsResult {
  success: boolean;
  data?: {
    company: { uid: string; companyName: string };
    jobs: JobCardData[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
  error?: string;
}
```

---

#### Error Handling

| Error | Condition | Thai Message | Recovery |
|-------|-----------|--------------|----------|
| Network error | Fetch failed | ไม่สามารถโหลดรายการได้ | Retry button |

---

#### Test Scenarios

| ID | Scenario | Input | Expected Output | Notes |
|----|----------|-------|-----------------|-------|
| DISC-038 | Company with jobs | Valid company | Job list | |
| DISC-039 | Company no jobs | No active jobs | Empty state | |
| DISC-040 | Pagination | Multiple pages | Paginated results | |
| DISC-041 | From jobs page | Filter by company | Same results | URL: ?company=xxx |

---

## 4. Cross-Cutting Concerns

### 4.1 URL State Synchronization

All search filters are reflected in URL query parameters for:
- Shareable/bookmarkable searches
- Browser back/forward navigation
- SEO for filtered pages

```typescript
// URL ↔ State serialization
function filterStateToURL(state: FilterState): URLSearchParams;
function urlToFilterState(params: URLSearchParams): FilterState;
```

### 4.2 SWR Cache Keys

| Key Pattern | Purpose | Config |
|-------------|---------|--------|
| `jobs-list-${filterHash}` | Job search results | `infiniteSWRConfig` |
| `job-${id}` | Job detail | `defaultSWRConfig` |
| `saved-jobs-${uid}` | User's saved job IDs | `defaultSWRConfig` |
| `company-${id}` | Company profile | `defaultSWRConfig` |
| `similar-jobs-${id}` | Similar job recommendations | `staticSWRConfig` |
| `master-data-provinces` | Province dropdown | `staticSWRConfig` |
| `master-data-education_levels` | Education filter | `staticSWRConfig` |
| `master-data-employment_types` | Job type filter | `staticSWRConfig` |

### 4.3 Login Prompt Modal

Triggered when guest attempts:
- Save job → "เข้าสู่ระบบเพื่อบันทึกงาน"
- Apply for job → "เข้าสู่ระบบเพื่อสมัครงาน" (handled in BLS-03)

### 4.4 MeiliSearch Fallback

| Condition | Behavior |
|-----------|----------|
| MeiliSearch available | Primary search path |
| Response > 3s | Show "กำลังค้นหานานกว่าปกติ..." |
| Timeout > 5s | Fallback to Firestore |
| Firestore fallback active | Show notice: "กำลังค้นหาแบบช้า กรุณารอสักครู่" |

### 4.5 Accessibility

| Component | ARIA | Keyboard |
|-----------|------|----------|
| Search input | `role="search"`, `aria-label="ค้นหางาน"` | `Enter` submits |
| Job list | `role="list"` | — |
| Job card | `role="listitem"` | `Enter`/`Space` navigates |
| Save button | `aria-pressed` | `Enter`/`Space` toggles |
| Pagination | `nav`, `aria-label="การนำทางหน้า"` | — |

---

## 5. Data Entity References

### 5.1 Collections Used

| Collection | Document ID | Key Fields |
|------------|-------------|------------|
| `jobs` | Auto-generated | `uid`, `title`, `companyId`, `jobStatus`, `isActive` |
| `candidate_saved_jobs` | Auto-generated | `candidateId`, `jobId`, `savedAt` |
| `company_information` | User UID | `companyName`, `status`, `isActive` |
| `master_data` | Auto-generated | `type`, `code`, `name_th` |

### 5.2 Indexes

**MeiliSearch `job` Index:**
- Searchable: `title`, `jobFunctionText`, `companyName`
- Filterable: `isActive`, `jobStatus`, `workLocation`, `employment`, `minSalary`, `maxSalary`, `postStartDate`
- Sortable: `createdAt`, `minSalary`, `maxSalary`

---

## 6. Inconsistencies Found

| Source | Issue | Resolution |
|--------|-------|------------|
| JOB-R01 vs CAND-R05 | Saved jobs collection name (`candidate_saved_jobs` vs `savedJobs` array in `candidate_information`) | Use `candidate_saved_jobs` as separate collection per JOB-R00 Section 3.1 |
| 02-public-routes | No explicit RIS for `/companies/[id]` | Created viewCompanyProfile action based on UI spec |

---

## 7. Appendices

### Appendix A: Server Actions

| Action | Signature | Purpose |
|--------|-----------|---------|
| `JobPostGetByFilterV3` | `(params: JobSearchParams) => Promise<JobSearchResponse>` | Main job search |
| `JobPostGet` | `(jobId: string) => Promise<JobDetailData \| null>` | Fetch job detail |
| `CandidateSaveJob` | `(params: SaveJobParams) => Promise<SaveJobResult>` | Save job |
| `CandidateUnsaveJob` | `(params: SaveJobParams) => Promise<SaveJobResult>` | Unsave job |
| `GetMasterData` | `(type: string) => Promise<MasterDataItem[]>` | Fetch dropdown options |
| `GetSimilarJobs` | `(jobId: string, limit: number) => Promise<JobCardData[]>` | Get similar jobs |
| `CompanyInformationGet` | `(companyId: string) => Promise<CompanyProfileData \| null>` | Get company profile |

### Appendix B: Thai Copy Reference

| Element | Thai | Context |
|---------|------|---------|
| Page title (jobs) | ค้นหางาน | /jobs |
| Page title (companies) | บริษัททั้งหมด | /companies |
| Search placeholder | ค้นหาตำแหน่งงาน, บริษัท | Search input |
| Filter header | ตัวกรอง | Filter sidebar |
| Clear all | ล้างทั้งหมด | Filter reset |
| Results count | พบ {count} งาน | Results header |
| No results | ไม่พบงานที่ตรงกับการค้นหา | Empty state |
| Save | บันทึก | Save button |
| Saved | บันทึกแล้ว | Saved state |
| Login to save | เข้าสู่ระบบเพื่อบันทึกงาน | Login prompt |
| Unsave | ยกเลิกการบันทึก | Unsave action |
| Job closed | ตำแหน่งนี้ปิดรับสมัครแล้ว | Closed job banner |
| Job expired | ประกาศงานหมดอายุแล้ว | Expired job banner |
| Open positions | ตำแหน่งที่เปิดรับ | Company profile section |
| No positions | ยังไม่มีตำแหน่งเปิดรับ | Empty jobs in company |
| Similar jobs | งานที่คล้ายกัน | Similar jobs section |
| View all | ดูทั้งหมด | View all link |

---

*End of BLS-02: Discovery Stage Business Logic*
