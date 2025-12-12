# CAND-R05: Saved Items Route Implementation Spec

**Version:** 1.0  
**Last Updated:** 2025-12-10  
**Route:** `/candidates/[id]/saved`  
**Primary Domain:** Candidate

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial RIS creation with 3-tab structure, state machines, and CRUD operations |

---

## Cross-References

This document references shared specifications from other RIS documents.

| Topic | Source Document | Section |
|-------|-----------------|---------|
| Candidate Shell | CAND-R00_cross-cutting_RIS.md | Section 2 |
| Authentication Patterns | CAND-R00_cross-cutting_RIS.md | Section 3 |
| Save Job State Machine | JOB-R00_cross-cutting_RIS.md | Section 3.1 |
| Job Card Component | JOB-R00_cross-cutting_RIS.md | Section 4.1 |
| Ownership Redirect | CAND-R00_cross-cutting_RIS.md | Section 3.3 |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | CAND-R05 |
| Route Path | `/candidates/[id]/saved` |
| Shell | Candidate Shell |
| Purpose | Manage saved jobs, searches, and job alerts |
| Complexity | Medium |
| Phase | Wave 7 (Supporting Features) |
| UI Spec | `04-candidate-routes.md` Section 5.4 |

### Route Parameters

| Parameter | Type | Source | Validation |
|-----------|------|--------|------------|
| `id` | `string` | URL path segment | Must be valid candidate UID, must match logged-in user |

### URL Query Parameters

| Parameter | Type | Default | Purpose | URL Format |
|-----------|------|---------|---------|------------|
| `tab` | `string` | `jobs` | Active tab selection | `?tab=jobs` |

### Tab Values

| Value | Thai Label | English | Default |
|-------|------------|---------|---------|
| `jobs` | งานที่บันทึก | Saved Jobs | ✅ Yes |
| `searches` | การค้นหาที่บันทึก | Saved Searches | |
| `alerts` | การแจ้งเตือนงาน | Job Alerts | |

---

## 2. Domain Classification

### Primary Domain: Candidate (●)

- **Owns:** Saved jobs list, saved searches, job alerts configuration
- **Mutations:** Save/unsave jobs, create/delete searches, CRUD alerts

### Secondary Domains (○)

| Domain | Role | Access |
|--------|------|--------|
| Jobs | Job data for saved items display | Read `web_jobs` for job details |
| Auth | User identity, ownership check | Read session, roles |

### Global Domains (⊙) - Via Shell

| Domain | Requirement |
|--------|-------------|
| Auth | User must be authenticated with candidate role |
| Chat | FAB in shell |
| Notifications | Bell icon in shell |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Tab | Notes |
|------------|--------------|----------|-----|-------|
| - | Save Job | Indirect | Jobs | Save action happens on /jobs routes |
| - | Unsave Job | Full | Jobs | Remove from savedJobs array |
| - | View Saved Jobs | Full | Jobs | Display saved jobs with details |
| - | Save Search | Indirect | Searches | Save action on /jobs route |
| - | View Saved Searches | Full | Searches | Display with filter summary |
| - | Run Saved Search | Full | Searches | Navigate to /jobs with filters |
| - | Delete Saved Search | Full | Searches | Remove from array |
| - | Create Job Alert | Full | Alerts | Max 10 alerts |
| - | Edit Job Alert | Full | Alerts | Modify criteria/frequency |
| - | Toggle Job Alert | Full | Alerts | Enable/disable |
| - | Delete Job Alert | Full | Alerts | Remove from array |

### New Features (Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| View Toggle | Grid/List view for saved jobs | P1 |
| Job Status Badge | Show "ปิดแล้ว" for closed jobs | P0 |
| Results Count | Show current job count for searches | P1 |

### Not Implemented in v1.0

| Feature | Description | Status |
|---------|-------------|--------|
| Alert Notification Preview | Preview what emails look like | ☆ Future |
| Bulk Unsave | Remove multiple saved jobs at once | ☆ Future |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Saved Job IDs | `candidate_information` | `savedJobs[]` | `uid === params.id` | `candidate-${id}` |
| Saved Searches | `candidate_information` | `savedSearches[]` | `uid === params.id` | `candidate-${id}` |
| Job Alerts | `candidate_information` | `jobAlerts[]` | `uid === params.id` | `candidate-${id}` |
| Job Details | `web_jobs` | See Job Fields | `uid IN savedJobs` | `saved-jobs-details-${id}` |

### 4.2 Job Fields for Display

| Field | Type | Purpose | Display |
|-------|------|---------|---------|
| `uid` | string | Job ID | Link to detail |
| `title` | string | Job title | Bold, primary text |
| `companyName` | string | Company display name | Secondary text |
| `companyLogo` | string | Logo URL | 48×48 image |
| `minSalary` | number | Salary range start | ฿XX,XXX format |
| `maxSalary` | number | Salary range end | ฿XX,XXX format |
| `isNegotiable` | boolean | Salary negotiable | "ตามตกลง" if true |
| `workLocationText` | string | Province/district | Location badge |
| `jobStatus` | string | Current job status | Badge if closed |
| `createdAt` | number | Posted timestamp | Relative time |

### 4.3 Saved Search Structure

```typescript
interface SavedSearch {
  id: string;                    // Unique identifier
  name?: string;                 // User-provided name (optional)
  filters: {
    q?: string;                  // Search keyword
    location?: string[];         // Province filter
    type?: string[];             // Employment type
    salary_min?: number;         // Min salary
    salary_max?: number;         // Max salary
    education?: string[];        // Education level
    experience?: string;         // Experience range
    remote?: string;             // Work mode
  };
  createdAt: number;             // When saved
  lastRunAt?: number;            // When last executed
}
```

### 4.4 Job Alert Structure

```typescript
interface JobAlert {
  id: string;                    // Unique identifier
  name?: string;                 // Alert name (auto or user-provided)
  criteria: {
    keywords?: string[];         // Search keywords
    locations?: string[];        // Provinces
    jobTypes?: string[];         // Employment types
    salaryMin?: number;          // Minimum salary
    salaryMax?: number;          // Maximum salary
    educationLevels?: string[];  // Education requirements
  };
  frequency: 'instant' | 'daily' | 'weekly';
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  lastSentAt?: number;           // Last notification sent
}
```

### 4.5 Write Operations

| Action | Collection | Field | Mutation | Invalidates |
|--------|------------|-------|----------|-------------|
| Unsave Job | `candidate_information` | `savedJobs` | Array remove | `candidate-${id}` |
| Delete Search | `candidate_information` | `savedSearches` | Array remove | `candidate-${id}` |
| Create Alert | `candidate_information` | `jobAlerts` | Array push | `candidate-${id}` |
| Update Alert | `candidate_information` | `jobAlerts[n]` | Object update | `candidate-${id}` |
| Toggle Alert | `candidate_information` | `jobAlerts[n].isActive` | Boolean toggle | `candidate-${id}` |
| Delete Alert | `candidate_information` | `jobAlerts` | Array remove | `candidate-${id}` |

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose | Set When |
|------|------|-----|---------|----------|
| `userAtom` | `userDataProps \| null` | R | Get user data, check ownership | After auth validation |
| `candidateAtom` | `candidateDataProps \| null` | R/W | Candidate profile + saved data | After data fetch |
| `activeRoleAtom` | `string` | R/W | Navigation context ('candidate') | On page mount |
| `savedJobsAtom` | `string[]` | R/W | Cached saved job IDs | On candidate load |

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useFirebaseAuth` | `{ user, userChancedee, loading }` | Auth state |
| `useParams` | `{ id: string }` | Route parameters |
| `useRouter` | Next.js router | Navigation |
| `useSearchParams` | URLSearchParams | Tab query param |
| `useSavedJobs` | `{ jobs, isLoading, mutate }` | Saved jobs with details |
| `useSavedSearches` | `{ searches, isLoading, mutate }` | Saved searches |
| `useJobAlerts` | `{ alerts, isLoading, mutate }` | Job alerts |

### 5.3 SWR Keys

| Key Pattern | Purpose | Config | Invalidation Trigger |
|-------------|---------|--------|----------------------|
| `candidate-${id}` | Candidate profile + arrays | `defaultSWRConfig` | Save/unsave, alert CRUD |
| `saved-jobs-details-${id}` | Job details for saved | `revalidateOnFocus: false` | Job status change |
| `saved-search-count-${searchId}` | Result count per search | `refreshInterval: 300000` | 5 min |

---

## 6. UI State Machine

### 6.1 Page State Automaton

```
                    ┌─────────────────┐
                    │    loading      │
                    │   (initial)     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   auth_check    │
                    └────────┬────────┘
                             │
               ┌─────────────┼─────────────┐
               │             │             │
               ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ redirect │  │  owner   │  │redirect  │
        │ _login   │  │  _check  │  │_role     │
        └──────────┘  └────┬─────┘  └──────────┘
                           │
               ┌───────────┼───────────┐
               │           │           │
               ▼           ▼           ▼
        ┌──────────┐ ┌───────────┐ ┌──────────┐
        │redirect  │ │loading    │ │onboard   │
        │_own      │ │_data      │ │_check    │
        └──────────┘ └─────┬─────┘ └────┬─────┘
                           │            │
                           ▼            ▼
                    ┌──────────┐  ┌──────────────┐
                    │   ready  │  │redirect      │
                    └────┬─────┘  │_onboarding   │
                         │        └──────────────┘
                         ▼
                    ┌──────────┐
                    │  idle    │
                    │ (tabs)   │
                    └──────────┘
```

### 6.2 Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `INIT` | `auth_check` | - | Check session |
| `auth_check` | `AUTH_SUCCESS` | `owner_check` | `session.valid && roles.includes('candidate')` | - |
| `auth_check` | `AUTH_FAILED` | `redirect_login` | `!session.valid` | `redirect('/auth/login')` |
| `auth_check` | `WRONG_ROLE` | `redirect_role` | `!roles.includes('candidate')` | `redirect('/auth/select-role')` |
| `owner_check` | `IS_OWNER` | `onboard_check` | `params.id === user.uid` | - |
| `owner_check` | `NOT_OWNER` | `redirect_own` | `params.id !== user.uid` | `redirect('/candidates/${user.uid}/saved')` |
| `onboard_check` | `IS_ONBOARDED` | `loading_data` | `isOnboarded === true` | Fetch saved data |
| `onboard_check` | `NOT_ONBOARDED` | `redirect_onboarding` | `isOnboarded === false` | `redirect('/candidates/${id}/profile')` |
| `loading_data` | `DATA_SUCCESS` | `ready` | - | Set atoms |
| `loading_data` | `DATA_ERROR` | `error` | - | Show error toast |
| `ready` | `TAB_CHANGE` | `ready` | - | Update URL |
| `error` | `RETRY` | `loading_data` | - | Refetch |

### 6.3 Tab State Automaton

| Current Tab | Event | Next Tab | Guard | Side Effects |
|-------------|-------|----------|-------|--------------|
| `jobs` | `CLICK_SEARCHES` | `searches` | - | `router.push('?tab=searches')` |
| `jobs` | `CLICK_ALERTS` | `alerts` | - | `router.push('?tab=alerts')` |
| `searches` | `CLICK_JOBS` | `jobs` | - | `router.push('?tab=jobs')` |
| `searches` | `CLICK_ALERTS` | `alerts` | - | `router.push('?tab=alerts')` |
| `alerts` | `CLICK_JOBS` | `jobs` | - | `router.push('?tab=jobs')` |
| `alerts` | `CLICK_SEARCHES` | `searches` | - | `router.push('?tab=searches')` |

### 6.4 Unsave Job State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `saved` | `UNSAVE_CLICK` | `unsaving` | - | Optimistic: remove from list |
| `unsaving` | `SUCCESS` | `removed` | - | Invalidate SWR, show toast |
| `unsaving` | `ERROR` | `saved` | - | Revert UI, error toast |
| `removed` | - | - | - | Card removed from DOM |

### 6.5 Alert CRUD State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `idle` | `CREATE_CLICK` | `form_open` | `alerts.length < 10` | Open modal |
| `idle` | `CREATE_CLICK` | `idle` | `alerts.length >= 10` | Toast: "สร้างได้สูงสุด 10 รายการ" |
| `idle` | `EDIT_CLICK` | `form_open` | - | Load alert data to form |
| `idle` | `DELETE_CLICK` | `confirm_delete` | - | Open confirm modal |
| `idle` | `TOGGLE_CLICK` | `toggling` | - | Optimistic toggle |
| `form_open` | `SUBMIT` | `submitting` | Form valid | - |
| `form_open` | `CANCEL` | `idle` | - | Close modal |
| `submitting` | `SUCCESS` | `idle` | - | Close modal, invalidate SWR |
| `submitting` | `ERROR` | `form_open` | - | Show error |
| `confirm_delete` | `CONFIRM` | `deleting` | - | - |
| `confirm_delete` | `CANCEL` | `idle` | - | Close modal |
| `deleting` | `SUCCESS` | `idle` | - | Invalidate SWR, toast |
| `deleting` | `ERROR` | `idle` | - | Error toast |
| `toggling` | `SUCCESS` | `idle` | - | - |
| `toggling` | `ERROR` | `idle` | - | Revert, error toast |

---

## 7. Component-Action Wiring

### 7.1 Page Header

| Component | Purpose | Action |
|-----------|---------|--------|
| PageTitle | "รายการที่บันทึก" | - |

### 7.2 Tab Navigation

| Component | Thai Label | Action | Active When |
|-----------|------------|--------|-------------|
| TabButton | งานที่บันทึก | `?tab=jobs` | `tab === 'jobs'` |
| TabButton | การค้นหาที่บันทึก | `?tab=searches` | `tab === 'searches'` |
| TabButton | การแจ้งเตือนงาน | `?tab=alerts` | `tab === 'alerts'` |

### 7.3 Jobs Tab Components

| Component | Purpose | Action | Condition |
|-----------|---------|--------|-----------|
| ViewToggle | Grid/List switch | Local state toggle | - |
| JobCard | Display saved job | → `/jobs/[id]` | - |
| JobCard.StatusBadge | Show if closed | - | `job.jobStatus === 'closed'` |
| JobCard.SavedDate | "บันทึกเมื่อ XX" | - | - |
| JobCard.ApplyButton | Apply to job | Open apply modal | `job.jobStatus !== 'closed'` |
| JobCard.AppliedBadge | Show if applied | - | `hasApplication` |
| JobCard.UnsaveButton | Remove from saved | `unsaveJob(jobId)` | - |
| JobCard.ShareButton | Share job | Open share sheet | - |
| EmptyState | No saved jobs | → `/jobs` "ค้นหางาน" | `savedJobs.length === 0` |

### 7.4 Searches Tab Components

| Component | Purpose | Action | Condition |
|-----------|---------|--------|-----------|
| SearchCard | Display saved search | - | - |
| SearchCard.Name | Search name/label | - | - |
| SearchCard.Filters | Filter tags | - | - |
| SearchCard.LastRun | "ค้นหาล่าสุด XX" | - | `lastRunAt` exists |
| SearchCard.ResultCount | "พบ XX งาน" | - | From search count |
| SearchCard.RunButton | Execute search | → `/jobs?${filters}` | - |
| SearchCard.DeleteButton | Remove search | `deleteSearch(id)` | - |
| EmptyState | No saved searches | → `/jobs` "ไปค้นหางาน" | `savedSearches.length === 0` |

### 7.5 Alerts Tab Components

| Component | Purpose | Action | Condition |
|-----------|---------|--------|-----------|
| CreateButton | "+ สร้างการแจ้งเตือน" | Open create modal | `alerts.length < 10` |
| CreateButton (disabled) | Limit reached | Toast error | `alerts.length >= 10` |
| AlertCard | Display job alert | - | - |
| AlertCard.Criteria | Filter summary | - | - |
| AlertCard.Frequency | ทันที/รายวัน/รายสัปดาห์ | - | - |
| AlertCard.ActiveToggle | On/Off switch | `toggleAlert(id)` | - |
| AlertCard.EditButton | Modify alert | Open edit modal | - |
| AlertCard.DeleteButton | Remove alert | Open confirm modal | - |
| EmptyState | No alerts | Open create modal "สร้างการแจ้งเตือน" | `alerts.length === 0` |

### 7.6 Alert Form Modal

| Component | Purpose | Validation |
|-----------|---------|------------|
| AlertNameInput | Optional name | Max 100 chars |
| KeywordInput | Search keywords | At least 1 required |
| LocationSelect | Province multi-select | Optional |
| JobTypeSelect | Employment type | Optional |
| SalaryRangeInput | Min/max salary | Min <= Max |
| EducationSelect | Education level | Optional |
| FrequencySelect | Notification frequency | Required |
| SubmitButton | Save alert | Form must be valid |
| CancelButton | Close modal | - |

---

## 8. Error Handling

### 8.1 Error Scenarios

| Error | Display | Recovery Action |
|-------|---------|-----------------|
| Fetch failed | Toast + error state | Retry button |
| Unsave failed | Toast + revert UI | "ไม่สามารถยกเลิกการบันทึกได้" |
| Delete search failed | Toast | "ลบการค้นหาไม่สำเร็จ" |
| Create alert failed | Toast + keep form | "สร้างการแจ้งเตือนไม่สำเร็จ" |
| Toggle alert failed | Toast + revert | "เปลี่ยนสถานะไม่สำเร็จ" |
| Alert limit reached | Toast (info) | "สร้างได้สูงสุด 10 รายการ" |
| Job not found | Auto-remove from list | Silent cleanup |
| Network error | Toast | "ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่" |

### 8.2 Error Toast Patterns

```typescript
// Error with retry
toast.error("ไม่สามารถโหลดข้อมูลได้", {
  action: {
    label: "ลองใหม่",
    onClick: () => mutate()
  }
});

// Error info only
toast.error("ลบการค้นหาไม่สำเร็จ กรุณาลองใหม่");

// Limit warning
toast.warning("สร้างได้สูงสุด 10 รายการ");
```

---

## 9. Empty States

### 9.1 Empty State Configurations

| Tab | Message (Thai) | CTA Label | CTA Action |
|-----|----------------|-----------|------------|
| Jobs | ยังไม่มีงานที่บันทึก | ค้นหางาน | → `/jobs` |
| Searches | บันทึกการค้นหาจากหน้าค้นหางาน | ไปค้นหางาน | → `/jobs` |
| Alerts | ยังไม่มีการแจ้งเตือน | สร้างการแจ้งเตือน | Open create modal |

### 9.2 Empty State Component

```typescript
interface EmptyStateProps {
  icon: 'bookmark' | 'search' | 'bell';
  title: string;
  description?: string;
  ctaLabel: string;
  ctaAction: () => void;
}
```

---

## 10. Implementation Checklist

### Phase 1: Core Layout + Jobs Tab
- [ ] Page layout with tab navigation
- [ ] URL query param sync for tabs
- [ ] Jobs tab with job cards (reuse from JOB-R01)
- [ ] Unsave job functionality
- [ ] Empty state for jobs tab
- [ ] Loading states

### Phase 2: Searches Tab
- [ ] Search card component
- [ ] Run search navigation (apply filters to /jobs)
- [ ] Delete search functionality
- [ ] Results count fetch (background)
- [ ] Empty state for searches tab

### Phase 3: Alerts Tab CRUD
- [ ] Alert card component
- [ ] Create alert modal + form
- [ ] Edit alert modal
- [ ] Delete confirmation modal
- [ ] Toggle alert active/inactive
- [ ] Alert limit enforcement (max 10)
- [ ] Empty state for alerts tab

### Phase 4: Polish
- [ ] View toggle (Grid/List) for jobs
- [ ] Animations (tab switch, card removal)
- [ ] Keyboard navigation
- [ ] Mobile responsive adjustments
- [ ] Analytics events
- [ ] E2E tests

---

## 11. Decisions Log

| Decision | Chosen | Alternatives | Rationale | Date |
|----------|--------|--------------|-----------|------|
| Alert limit | 10 alerts max | Unlimited | Prevent notification spam, server cost | 2025-12-10 |
| Search naming | Auto-generate from filters | User required | Lower friction | 2025-12-10 |
| Frequency options | instant/daily/weekly | Hourly, monthly | Balance timeliness vs spam | 2025-12-10 |
| Job status display | Badge on card | Hide closed jobs | Users want to track even closed | 2025-12-10 |
| Unsave behavior | Optimistic with revert | Wait for server | Better UX | 2025-12-10 |
| Tab default | Jobs | Alerts | Most common use case | 2025-12-10 |

---

## Appendix A: TypeScript Types

```typescript
// Page component props
interface SavedPageProps {
  params: { id: string };
  searchParams: { tab?: string };
}

// Tab type
type SavedTab = 'jobs' | 'searches' | 'alerts';

// Job card in saved context
interface SavedJobCard {
  job: JobListItem;
  savedAt: number;
  hasApplication: boolean;
}

// Saved search
interface SavedSearch {
  id: string;
  name?: string;
  filters: SearchFilters;
  createdAt: number;
  lastRunAt?: number;
}

// Job alert
interface JobAlert {
  id: string;
  name?: string;
  criteria: AlertCriteria;
  frequency: AlertFrequency;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  lastSentAt?: number;
}

type AlertFrequency = 'instant' | 'daily' | 'weekly';

interface AlertCriteria {
  keywords?: string[];
  locations?: string[];
  jobTypes?: string[];
  salaryMin?: number;
  salaryMax?: number;
  educationLevels?: string[];
}

// Alert form values
interface AlertFormValues {
  name: string;
  keywords: string[];
  locations: string[];
  jobTypes: string[];
  salaryMin?: number;
  salaryMax?: number;
  educationLevels: string[];
  frequency: AlertFrequency;
}
```

---

## Appendix B: Server Actions

```typescript
// Unsave job
export async function unsaveJob(
  candidateId: string,
  jobId: string
): Promise<{ success: boolean; error?: string }>;

// Delete saved search
export async function deleteSavedSearch(
  candidateId: string,
  searchId: string
): Promise<{ success: boolean; error?: string }>;

// Create job alert
export async function createJobAlert(
  candidateId: string,
  alert: Omit<JobAlert, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; alertId?: string; error?: string }>;

// Update job alert
export async function updateJobAlert(
  candidateId: string,
  alertId: string,
  updates: Partial<JobAlert>
): Promise<{ success: boolean; error?: string }>;

// Toggle job alert
export async function toggleJobAlert(
  candidateId: string,
  alertId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }>;

// Delete job alert
export async function deleteJobAlert(
  candidateId: string,
  alertId: string
): Promise<{ success: boolean; error?: string }>;

// Get saved search result count
export async function getSavedSearchCount(
  filters: SearchFilters
): Promise<{ count: number }>;
```

---

## Appendix C: Thai Label Reference

| Key | Thai | English |
|-----|------|---------|
| page_title | รายการที่บันทึก | Saved Items |
| tab_jobs | งานที่บันทึก | Saved Jobs |
| tab_searches | การค้นหาที่บันทึก | Saved Searches |
| tab_alerts | การแจ้งเตือนงาน | Job Alerts |
| saved_date | บันทึกเมื่อ {date} | Saved on {date} |
| job_closed | ปิดแล้ว | Closed |
| applied | สมัครแล้ว | Applied |
| unsave | ยกเลิกการบันทึก | Unsave |
| apply | สมัครงาน | Apply |
| share | แชร์ | Share |
| run_search | ค้นหา | Search |
| delete | ลบ | Delete |
| last_run | ค้นหาล่าสุด {date} | Last searched {date} |
| results_count | พบ {count} งาน | Found {count} jobs |
| create_alert | + สร้างการแจ้งเตือน | + Create Alert |
| alert_limit | สร้างได้สูงสุด 10 รายการ | Maximum 10 alerts |
| freq_instant | ทันที | Instant |
| freq_daily | รายวัน | Daily |
| freq_weekly | รายสัปดาห์ | Weekly |
| alert_active | เปิด | On |
| alert_inactive | ปิด | Off |
| edit | แก้ไข | Edit |
| empty_jobs | ยังไม่มีงานที่บันทึก | No saved jobs yet |
| empty_searches | บันทึกการค้นหาจากหน้าค้นหางาน | Save searches from the jobs page |
| empty_alerts | ยังไม่มีการแจ้งเตือน | No job alerts yet |
| find_jobs | ค้นหางาน | Find Jobs |
| go_search | ไปค้นหางาน | Go to Search |
| error_unsave | ไม่สามารถยกเลิกการบันทึกได้ | Could not unsave |
| error_delete | ลบไม่สำเร็จ กรุณาลองใหม่ | Delete failed, please retry |
| error_create | สร้างการแจ้งเตือนไม่สำเร็จ | Could not create alert |
| error_toggle | เปลี่ยนสถานะไม่สำเร็จ | Could not toggle status |
| error_network | ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่ | Connection failed, please retry |

---

## Appendix D: Related Routes

| Route | RIS | Relationship |
|-------|-----|--------------|
| `/candidates/[id]` | CAND-R01 | Dashboard sidebar link |
| `/jobs` | JOB-R01 | Save job action origin, search destination |
| `/jobs/[id]` | JOB-R02 | Job detail, save action origin |
| `/candidates/[id]/profile` | CAND-R02 | Redirect if not onboarded |
| `/candidates/[id]/settings` | CAND-R03 | Settings link in shell |

---

## Appendix E: Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `saved_page_view` | Page load | `{ tab }` |
| `saved_tab_change` | Tab click | `{ from_tab, to_tab }` |
| `saved_job_unsave` | Unsave click | `{ job_id }` |
| `saved_search_run` | Run button click | `{ search_id, filter_count }` |
| `saved_search_delete` | Delete search | `{ search_id }` |
| `job_alert_create` | Create alert | `{ frequency, criteria_count }` |
| `job_alert_toggle` | Toggle switch | `{ alert_id, new_state }` |
| `job_alert_edit` | Edit alert | `{ alert_id }` |
| `job_alert_delete` | Delete alert | `{ alert_id }` |

---

*End of RIS: /candidates/[id]/saved (CAND-R05) v1.0*
