# JOB-R01: Job Search & Listings Route Implementation Spec

**Version:** 1.1  
**Last Updated:** 2025-12-09  
**Route:** `/jobs`  
**Primary Domain:** Jobs

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2025-12-09 | Added cross-references to JOB-R00; consolidated shared patterns; added accessibility and test scenarios |
| 1.0 | 2025-12-09 | Initial RIS creation with complete state machines, filter behavior, pagination |

---

## Cross-References

This document references shared specifications from **JOB-R00_cross-cutting_RIS.md**.

| Topic | JOB-R00 Section |
|-------|-----------------|
| Save Job State Machine | Section 3.1 |
| Login Prompt Modal | Section 3.2 |
| Job Card Component | Section 4.1 |
| Salary Display | Section 4.2 |
| Posted Date Formatting | Section 4.3 |
| Job Badges | Section 4.4 |
| MeiliSearch Integration | Section 5 |
| Timeout Configuration | Section 5.6 |
| Server Actions | Section 6 |
| SWR Cache Keys | Section 7 |
| Error Handling | Section 9 |
| Accessibility | Section 14 |
| Loading States | Section 15 |
| Test Scenarios | Section 17.1 |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | JOB-R01 |
| Route Path | `/jobs` |
| Shell | Public Shell (guest) / Candidate Shell (authenticated candidate) / Company Shell (authenticated company) |
| Purpose | Primary job discovery - search, filter, browse public job listings |
| Complexity | Medium |
| Phase | 2 (Public & Jobs) |
| UI Spec | `02-public-routes.md` Section 3.2 |

### Shell Switching Behavior

| User State | Shell | Determined By |
|------------|-------|---------------|
| Guest (not logged in) | Public Shell | `sessionStateAtom === 'none'` |
| Logged in as Candidate | Candidate Shell | `activeRoleAtom === 'candidate'` |
| Logged in as Company | Company Shell | `activeRoleAtom === 'company'` |
| Logged in as Admin | Company Shell (fallback) | `activeRoleAtom === 'chancedee'` |

### URL Query Parameters

| Parameter | Type | Default | Purpose | URL Format |
|-----------|------|---------|---------|------------|
| `q` | string | - | Search keyword (title, company, function) | `?q=developer` |
| `location` | string[] | - | Province filter (comma-separated) | `?location=กรุงเทพมหานคร,เชียงใหม่` |
| `type` | string[] | - | Employment type filter | `?type=fulltime,parttime` |
| `salary_min` | number | - | Minimum salary (THB) | `?salary_min=15000` |
| `salary_max` | number | - | Maximum salary (THB) | `?salary_max=50000` |
| `education` | string[] | - | Education level filter | `?education=bachelor,master` |
| `experience` | string | - | Experience range | `?experience=1-3` |
| `remote` | string | - | Work mode (onsite/hybrid/remote) | `?remote=hybrid` |
| `sort` | string | `newest` | Sort order | `?sort=salary_desc` |
| `page` | number | `1` | Current page (1-indexed) | `?page=3` |

### Sort Options

| Value | Thai Label | English | Condition |
|-------|-----------|---------|-----------|
| `newest` | ใหม่สุด | Newest | Default, always available |
| `salary_desc` | เงินเดือนมาก-น้อย | Salary High-Low | Always available |
| `salary_asc` | เงินเดือนน้อย-มาก | Salary Low-High | Always available |
| `relevant` | ตรงที่สุด | Most Relevant | Only when `q` parameter present |

---

## 2. Domain Classification

### Primary Domain: Jobs (●)

- **Owns:** Job search, filtering, pagination, result display
- **Mutations:** None on this route (read-only search)
- **Data Source:** MeiliSearch index `job` with Firestore fallback

### Secondary Domains (○)

| Domain | Role | Access | Condition |
|--------|------|--------|-----------|
| Candidate | Save job, match score display | Read saved jobs, calculate match | Logged in as candidate |
| Auth | Login prompt on save attempt | Check `sessionStateAtom` | Guest user attempts save |
| Company | Company profile links | Read company display info | Display only |

### Global Domains (⊙) - Via Shell

| Domain | Requirement |
|--------|-------------|
| Auth | Session state check for shell selection |
| Chat | FAB in Candidate/Company shells (not Public) |
| Notifications | Bell icon in Candidate/Company shells |
| Consent | Cookie banner in Public shell |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| JOB-001 | View Public Job Listings | Full | Main job list display with pagination |
| JOB-003 | Search & Filter Jobs | Full | Filter sidebar + search header |

**Source:** `features_jobs.md` lines 208-349

### Feature Implementation Details

#### JOB-001: View Public Job Listings

| Aspect | Implementation |
|--------|----------------|
| Entry Point | `/jobs` route |
| Server Action | `JobPostGetByFilterV3` |
| Data Source | MeiliSearch index `job` |
| Visibility Filter | `jobStatus IN [published, ontimer]` AND `isActive = true` AND `postStartDate <= now` |
| Pagination | 20 items per page, numbered pagination |

#### JOB-003: Search & Filter Jobs

| Aspect | Implementation |
|--------|----------------|
| Search Fields | `title`, `jobFunctionText`, `companyName` (fuzzy match) |
| Filter Behavior | Explicit "Apply" button (batch filters) |
| Sort Behavior | Immediate on change |
| URL Sync | All filters reflected in URL query params |

### New Features (Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| Match Score | % match based on MeiliSearch attribute matching | P0 (logged-in candidates) |
| Save Job | Heart toggle with optimistic update | P0 |
| Login Prompt Modal | When guest tries to save | P0 |
| Mobile Filter Sheet | Bottom sheet with Apply button | P0 |
| Empty State Suggestions | Filter removal suggestions when no results | P1 |

### Not Implemented in v1.0

| Feature | Description | Status |
|---------|-------------|--------|
| BTS/MRT Station Filter | Nearby transit station search | ☐ Future (no location feature yet) |
| Salary Negotiable Filter | Filter for negotiable salary jobs | ☐ Future |
| Real-time Job Alerts | Push notification for new matches | ☐ Future |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Source | Fields | Condition | SWR Key |
|------|--------|--------|-----------|---------|
| Job Listings | MeiliSearch `job` | See Job Fields below | Filters applied | `jobs-list-${filterHash}` |
| Master Data - Provinces | Firestore `master_data` | `code`, `name_th`, `name_en` | `type === 'provinces'` | `master-data-provinces` |
| Master Data - Education | Firestore `master_data` | `code`, `name_th`, `name_en` | `type === 'education_levels'` | `master-data-education_levels` |
| Master Data - Job Types | Firestore `master_data` | `code`, `name_th`, `name_en` | `type === 'employment_types'` | `master-data-employment_types` |
| Saved Jobs | Firestore `candidate_saved_jobs` | `jobId`, `savedAt` | `candidateId === currentUser.uid` | `saved-jobs-${uid}` |
| User Data | Atom | `uid`, `roles` | Current session | `userAtom` |

### Job Fields Returned

| Field | Type | Purpose | Display |
|-------|------|---------|---------|
| `uid` | string | Job ID | Link to detail |
| `title` | string | Job title | Bold, primary text |
| `companyId` | string | Company reference | Link to company |
| `companyName` | string | Company display name | Secondary text |
| `companyLogo` | string | Logo URL | 48×48 image |
| `minSalary` | number | Salary range start | ฿XX,XXX format |
| `maxSalary` | number | Salary range end | ฿XX,XXX format |
| `isNegotiable` | boolean | Salary negotiable | "ตามตกลง" if true |
| `workLocationText` | string | Province/district | Location badge |
| `employmentText` | string | Job type display | Type badge |
| `experienceText` | string | Experience required | Experience badge |
| `createdAt` | number | Posted timestamp | Relative time (Thai) |
| `_matchScore` | number | MeiliSearch relevance | Match % (logged in only) |

### 4.2 Write Operations

| Action | Collection | Field | Server Action | Trigger |
|--------|------------|-------|---------------|---------|
| Save Job | `candidate_saved_jobs` | `jobId`, `candidateId`, `savedAt` | `CandidateSaveJob` | Save button click (authenticated) |
| Unsave Job | `candidate_saved_jobs` | - (delete doc) | `CandidateUnsaveJob` | Unsave button click |

### 4.3 MeiliSearch Query Structure

```typescript
interface JobSearchParams {
  q?: string;                    // Search query
  filter: string[];              // Filter expressions
  sort?: string[];               // Sort expressions
  page: number;                  // 1-indexed
  hitsPerPage: number;           // 20
  attributesToRetrieve: string[];
  attributesToSearchOn?: string[];
}

// Example filter construction
const filters = [
  'isActive = true',
  'jobStatus IN [published, ontimer]',
  `postStartDate <= ${Date.now()}`,
  // User-selected filters
  locations.length > 0 && `workLocation IN [${locations.map(l => `"${l}"`).join(',')}]`,
  types.length > 0 && `employment IN [${types.map(t => `"${t}"`).join(',')}]`,
  salaryMin && `maxSalary >= ${salaryMin}`,
  salaryMax && `minSalary <= ${salaryMax}`,
].filter(Boolean);
```

### 4.4 Fallback Strategy

> See **JOB-R00 Section 5.6** for standardized timeout configuration.

| Condition | Behavior |
|-----------|----------|
| MeiliSearch available | Primary search path |
| MeiliSearch slow (>3s) | Show "กำลังค้นหานานกว่าปกติ..." |
| MeiliSearch timeout (>5s) | Fallback to Firestore with client-side filtering |
| Firestore fallback active | Show notice: "กำลังค้นหาแบบช้า กรุณารอสักครู่" |
| Firestore timeout (>10s) | Show error state with retry |

---

## 5. State Contract

### 5.1 Atoms Used

| Atom | Type | Access | Purpose |
|------|------|--------|---------|
| `userAtom` | `userDataProps \| null` | Read | Check login state, get UID for saved jobs |
| `activeRoleAtom` | `string` | Read | Determine shell type |
| `sessionStateAtom` | `'valid' \| 'expired' \| 'none' \| 'validating'` | Read | Auth state for save functionality |
| `searchQueryAtom` | `string` | Read/Write | Global search query sync (optional) |

**Source:** `state-inventory_atoms.md`

### 5.2 SWR Keys

| Key Pattern | Purpose | Config |
|-------------|---------|--------|
| `jobs-list-${filterHash}` | Job search results | `infiniteSWRConfig` |
| `master-data-provinces` | Province dropdown | `staticSWRConfig` |
| `master-data-education_levels` | Education filter | `staticSWRConfig` |
| `master-data-employment_types` | Job type filter | `staticSWRConfig` |
| `saved-jobs-${uid}` | User's saved job IDs | `defaultSWRConfig` |

**Source:** `state-inventory_swr-keys.md`

### 5.3 Local Component State

| State | Type | Scope | Purpose |
|-------|------|-------|---------|
| `pendingFilters` | `FilterState` | Filter sidebar | Accumulate filter changes before apply |
| `isFilterSheetOpen` | `boolean` | Mobile only | Control bottom sheet visibility |
| `savingJobs` | `Set<string>` | Job cards | Track jobs currently being saved/unsaved |
| `loginPromptJobId` | `string \| null` | Page | Job ID that triggered login prompt |

### 5.4 Filter State Shape

```typescript
interface FilterState {
  q: string;
  locations: string[];
  types: string[];           // 'fulltime' | 'parttime' | 'contract' | 'internship'
  salaryMin: number | null;
  salaryMax: number | null;
  education: string[];
  experience: string | null; // '0' | '1-3' | '3-5' | '5-10' | '10+'
  remote: string | null;     // 'onsite' | 'hybrid' | 'remote'
  sort: string;              // 'newest' | 'salary_desc' | 'salary_asc' | 'relevant'
  page: number;
}

// URL ↔ State serialization
function filterStateToURL(state: FilterState): URLSearchParams;
function urlToFilterState(params: URLSearchParams): FilterState;
```

---

## 6. UI State Machine

### 6.1 Page State Automaton

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
         ┌────────┴────────┐        │                  │
         ▼                 ▼        ▼                  ▼
   ┌───────────┐    ┌───────────┐                ┌───────────┐
   │ SEARCHING │◄───│  IDLE     │◄───────────────│   IDLE    │
   │           │    │           │                │           │
   └───────────┘    └───────────┘                └───────────┘
```

#### Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `SEARCH_SUCCESS` | `idle` | `results.length > 0` | Update job list |
| `loading` | `SEARCH_SUCCESS` | `empty` | `results.length === 0` | Show empty state |
| `loading` | `SEARCH_ERROR` | `error` | - | Set `errorMessage` |
| `idle` | `APPLY_FILTERS` | `searching` | - | Update URL params, fetch |
| `idle` | `CHANGE_SORT` | `searching` | - | Update URL params, fetch |
| `idle` | `CHANGE_PAGE` | `searching` | - | Update URL params, fetch, scroll to top |
| `idle` | `CLEAR_ALL_FILTERS` | `searching` | - | Reset filters, update URL |
| `searching` | `SEARCH_SUCCESS` | `idle` | `results.length > 0` | Update job list |
| `searching` | `SEARCH_SUCCESS` | `empty` | `results.length === 0` | Show empty state |
| `searching` | `SEARCH_ERROR` | `error` | - | Set `errorMessage` |
| `empty` | `APPLY_FILTERS` | `searching` | - | Update URL params, fetch |
| `empty` | `CLEAR_ALL_FILTERS` | `searching` | - | Reset filters |
| `empty` | `REMOVE_FILTER` | `searching` | - | Remove specific filter, fetch |
| `error` | `RETRY` | `searching` | - | Clear error, retry fetch |
| `error` | `APPLY_FILTERS` | `searching` | - | Clear error, new search |

### 6.2 Filter Sidebar Automaton (Mobile Bottom Sheet)

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `closed` | `OPEN_FILTERS` | `open` | `viewport.width < 768` | - |
| `open` | `CLOSE` | `closed` | - | Discard pending changes |
| `open` | `APPLY` | `closed` | - | Commit `pendingFilters`, trigger search |
| `open` | `CLEAR_ALL` | `open` | - | Reset `pendingFilters` to defaults |
| `open` | `TOGGLE_FILTER` | `open` | - | Update `pendingFilters` |
| `open` | `SET_SALARY_RANGE` | `open` | - | Update `pendingFilters.salaryMin/Max` |
| `open` | `BACKDROP_CLICK` | `closed` | - | Discard pending changes |

### 6.3 Save Job Automaton (Per Job Card)

> **Canonical Definition:** See **JOB-R00 Section 3.1** for the complete Save Job state machine with diagram and transition table.

This route implements the shared Save Job automaton with route-specific behavior:

| Aspect | JOB-R01 Specific |
|--------|------------------|
| Trigger location | Heart icon on each job card |
| Login redirect | `/auth/login?redirect=/jobs` (preserves current filters via URL) |
| UI feedback | Optimistic update on card, toast notification |
| SWR invalidation | `saved-jobs-${uid}` |

#### State Summary

| State | Description |
|-------|-------------|
| `unsaved` | Default state, empty heart icon |
| `saving` | Calling server, filled heart (optimistic) |
| `saved` | Confirmed saved, filled heart |
| `unsaving` | Calling server, empty heart (optimistic) |
| `login_prompt` | Guest clicked save, modal open |

### 6.4 Filter Section Automaton (Desktop Collapsible)

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `expanded` | `TOGGLE` | `collapsed` | - | Animate height to 0 |
| `collapsed` | `TOGGLE` | `expanded` | - | Animate height to auto |

**Note:** Each filter section (Job Type, Salary, Location, Education, Experience, Remote) has its own instance of this automaton. Initial state configurable via `defaultExpandedSections` array.

---

## 7. Component-Action Wiring

### 7.1 Search Header Components

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Search Input | Input change | `setPendingFilters({...pending, q: value})` | - (pending only) |
| Search Input | Enter key | `applyFilters()` | `idle` → `searching` |
| Search Button | Click | `applyFilters()` | `idle` → `searching` |
| Location Dropdown | Change | `setPendingFilters({...pending, locations: value})` | - (pending only) |

### 7.2 Filter Sidebar Components (Desktop)

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Clear All Button | Click | `clearAllFilters()` | `idle` → `searching` |
| Active Filter Chip × | Click | `removeFilter(key, value)` | `idle` → `searching` |
| Job Type Checkbox | Change | `toggleFilter('types', value)` then `applyFilters()` | `idle` → `searching` |
| Salary Range Slider | Change + Release | `setSalaryRange(min, max)` then `applyFilters()` | `idle` → `searching` |
| Salary Preset Button | Click | `setSalaryRange(preset.min, preset.max)` then `applyFilters()` | `idle` → `searching` |
| Location Multi-select | Change | `toggleFilter('locations', value)` then `applyFilters()` | `idle` → `searching` |
| Education Checkbox | Change | `toggleFilter('education', value)` then `applyFilters()` | `idle` → `searching` |
| Experience Radio | Change | `setFilter('experience', value)` then `applyFilters()` | `idle` → `searching` |
| Remote Radio | Change | `setFilter('remote', value)` then `applyFilters()` | `idle` → `searching` |
| Section Header | Click | `toggleSection(sectionId)` | Section `expanded` ↔ `collapsed` |

### 7.3 Filter Bottom Sheet Components (Mobile)

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Filter Button (header) | Click | `openFilterSheet()` | Sheet `closed` → `open` |
| Close Button (×) | Click | `closeFilterSheet()` | Sheet `open` → `closed` |
| Backdrop | Click | `closeFilterSheet()` | Sheet `open` → `closed` |
| Apply Button | Click | `applyFilters(); closeFilterSheet()` | Sheet `open` → `closed`, Page `idle` → `searching` |
| Clear All | Click | `resetPendingFilters()` | - (pending only) |
| All filter controls | Change | `updatePendingFilters()` | - (pending only, no immediate search) |

### 7.4 Results Area Components

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Sort Dropdown | Change | `setSort(value)` | `idle` → `searching` (immediate) |
| Job Card | Click | `router.push('/jobs/${jobId}')` | - (navigation) |
| Company Logo | Click | `router.push('/companies/${companyId}')` | - (navigation) |
| Company Name Link | Click | `router.push('/companies/${companyId}')` | - (navigation) |
| Save Button (heart) | Click | `toggleSave(jobId)` | Per Save Job automaton |
| Pagination Number | Click | `setPage(n)` | `idle` → `searching` |
| Pagination Prev | Click | `setPage(currentPage - 1)` | `idle` → `searching` |
| Pagination Next | Click | `setPage(currentPage + 1)` | `idle` → `searching` |

### 7.5 Empty State Components

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Remove Filter Suggestion | Click | `removeFilter(suggested)` | `empty` → `searching` |
| Clear All Button | Click | `clearAllFilters()` | `empty` → `searching` |

### 7.6 Error State Components

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Retry Button | Click | `retrySearch()` | `error` → `searching` |

### 7.7 Login Prompt Modal Components

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Close Button (×) | Click | `dismissLoginPrompt()` | `login_prompt` → `unsaved` |
| Backdrop | Click | `dismissLoginPrompt()` | `login_prompt` → `unsaved` |
| Login Button | Click | `redirectToLogin()` | `login_prompt` → redirect |
| Register Button | Click | `redirectToRegister()` | `login_prompt` → redirect |

---

## 8. Error Handling

### 8.1 Search Errors

| Error Type | Condition | UI State | Display (Thai) | Display (English) | Recovery |
|------------|-----------|----------|----------------|-------------------|----------|
| Search Timeout | Response >10s | `error` | กำลังค้นหานานกว่าปกติ กรุณาลองใหม่ | Search is taking longer than usual | Retry button |
| Network Error | Fetch failed | `error` | ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ต | Unable to connect. Please check your internet | Retry button |
| MeiliSearch Down | 503/Connection refused | `idle` (fallback) | กำลังค้นหาแบบช้า กรุณารอสักครู่ | Using slower search, please wait | Auto-fallback to Firestore |
| Invalid Page | `page > totalPages` | - | - | - | Redirect to `page=1` |
| Invalid Filter Value | Malformed URL params | - | - | - | Ignore invalid, use defaults |

### 8.2 Save Job Errors

| Error Type | Condition | Display (Thai) | Recovery |
|------------|-----------|----------------|----------|
| Save Failed | Server action error | ไม่สามารถบันทึกงานได้ กรุณาลองใหม่ | Toast with retry (auto-dismiss 5s) |
| Unsave Failed | Server action error | ไม่สามารถยกเลิกการบันทึกได้ | Toast with retry |
| Job Not Found | Job deleted/closed | งานนี้ไม่พร้อมรับสมัครแล้ว | Toast (info), remove from list |

### 8.3 Empty State Handling

| Scenario | Display (Thai) | Suggestions |
|----------|----------------|-------------|
| Zero results (no filters) | ไม่พบงานในขณะนี้ | - |
| Zero results (with filters) | ไม่พบงานที่ตรงกับการค้นหา | "ลบตัวกรอง [X] เพื่อดู N งาน" |
| Zero results (with search query) | ไม่พบงานที่ตรงกับ "[term]" | "ลองค้นหาคำอื่น หรือลบตัวกรอง" |

---

## 9. Implementation Checklist

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
- [ ] Filter sidebar (desktop, 300px)
  - [ ] Active filters display (chips)
  - [ ] Clear all button
  - [ ] Job type section (checkboxes)
  - [ ] Salary section (slider + presets)
  - [ ] Location section (multi-select)
  - [ ] Education section (checkboxes)
  - [ ] Experience section (radio)
  - [ ] Remote section (radio)
  - [ ] Collapsible sections
- [ ] Mobile search header (compact)
  - [ ] Search input
  - [ ] Filter button with active count badge
- [ ] Filter bottom sheet (mobile)
  - [ ] Sheet header with close
  - [ ] All filter controls
  - [ ] Sticky apply button with result count
  - [ ] Clear all button

### 9.3 Results Components

- [ ] Results header
  - [ ] Result count display
  - [ ] Sort dropdown
- [ ] Job list container
- [ ] Job card component
  - [ ] Company logo (48×48)
  - [ ] Job title (link)
  - [ ] Company name (link)
  - [ ] Location badge
  - [ ] Job type badge
  - [ ] Salary display
  - [ ] Posted date (relative, Thai)
  - [ ] Match score (logged-in candidate only)
  - [ ] Save button (heart toggle)
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

- [ ] Save button component with states
- [ ] Optimistic update logic
- [ ] Login prompt modal
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

## 10. Decisions Log

| Decision | Value | Rationale | Date |
|----------|-------|-----------|------|
| Filter apply behavior | Explicit "Apply" button | Matches Thai job market (JobThai, JobsDB), batches user intent, efficient API usage | 2025-12-09 |
| Sort apply behavior | Immediate on change | Single value selection, clear user intent | 2025-12-09 |
| URL state sync | All filters in URL | Enable sharing, bookmarking, SEO | 2025-12-09 |
| Pagination style | Numbered (20/page) | Position awareness, shareable, matches market | 2025-12-09 |
| Mobile pagination | Compact (prev/next + page) | Touch-friendly, space efficient | 2025-12-09 |
| Saved closed jobs | Keep with badge + greyed | User awareness, no silent data loss | 2025-12-09 |
| Match score | MeiliSearch attribute %, logged-in only | Performance (pre-calculated), privacy | 2025-12-09 |
| Sort "Relevant" | Only with search query | Makes semantic sense only when there's a query | 2025-12-09 |
| Filter URL format | Comma-separated arrays | Clean URLs (`?type=fulltime,parttime`) | 2025-12-09 |
| Desktop filter apply | Immediate (per change) | Matches batch model with explicit Apply on mobile | 2025-12-09 |
| Salary slider debounce | 300ms on release | Prevent excessive API calls during drag | 2025-12-09 |

---

## 11. Appendices

### Appendix A: Type Definitions

```typescript
// Filter State
interface JobFilterState {
  q: string;
  locations: string[];
  types: EmploymentType[];
  salaryMin: number | null;
  salaryMax: number | null;
  education: EducationLevel[];
  experience: ExperienceRange | null;
  remote: WorkMode | null;
  sort: JobSortOption;
  page: number;
}

type EmploymentType = 'fulltime' | 'parttime' | 'contract' | 'internship';
type EducationLevel = 'high_school' | 'vocational' | 'bachelor' | 'master' | 'doctorate';
type ExperienceRange = '0' | '1-3' | '3-5' | '5-10' | '10+';
type WorkMode = 'onsite' | 'hybrid' | 'remote';
type JobSortOption = 'newest' | 'salary_desc' | 'salary_asc' | 'relevant';

// Job Card Data
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
  _matchScore?: number;  // Only for logged-in candidates
}

// Search Response
interface JobSearchResponse {
  data: JobCardData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  processingTime: number;
  isFallback: boolean;  // True if using Firestore fallback
}

// Save Job Action
interface SaveJobParams {
  candidateId: string;
  jobId: string;
}

interface SaveJobResult {
  success: boolean;
  error?: string;
}
```

### Appendix B: Server Actions

| Action | Signature | Purpose |
|--------|-----------|---------|
| `JobPostGetByFilterV3` | `(params: JobSearchParams) => Promise<JobSearchResponse>` | Main job search |
| `CandidateSaveJob` | `(params: SaveJobParams) => Promise<SaveJobResult>` | Save job to candidate's list |
| `CandidateUnsaveJob` | `(params: SaveJobParams) => Promise<SaveJobResult>` | Remove job from saved list |
| `GetMasterData` | `(type: string) => Promise<MasterDataItem[]>` | Fetch dropdown options |

### Appendix C: Thai Copy Reference

| Element | Thai | English |
|---------|------|---------|
| Page Title | ค้นหางาน | Find Jobs |
| Search Placeholder | ค้นหาตำแหน่งงาน, บริษัท | Search job title, company |
| Filter Header | ตัวกรอง | Filters |
| Clear All | ล้างทั้งหมด | Clear All |
| Job Type | ประเภทงาน | Job Type |
| Full-time | งานประจำ | Full-time |
| Part-time | งานพาร์ทไทม์ | Part-time |
| Contract | สัญญาจ้าง | Contract |
| Internship | ฝึกงาน | Internship |
| Salary | เงินเดือน | Salary |
| Location | สถานที่ | Location |
| Education | ระดับการศึกษา | Education |
| Experience | ประสบการณ์ | Experience |
| Remote | การทำงานระยะไกล | Remote Work |
| Sort | เรียงตาม | Sort By |
| Newest | ใหม่สุด | Newest |
| Salary High | เงินเดือนมาก-น้อย | Salary High-Low |
| Salary Low | เงินเดือนน้อย-มาก | Salary Low-High |
| Relevance | ตรงที่สุด | Most Relevant |
| Results | พบ {count} งาน | Found {count} jobs |
| No Results | ไม่พบงานที่ตรงกับการค้นหา | No jobs match your search |
| Apply Filters | แสดงผลลัพธ์ | Show Results |
| Save | บันทึก | Save |
| Saved | บันทึกแล้ว | Saved |
| Login to Save | เข้าสู่ระบบเพื่อบันทึกงาน | Login to save job |
| Job Unavailable | งานนี้ไม่พร้อมรับสมัครแล้ว | This job is no longer available |
| Posted | เมื่อ {time} | {time} ago |
| Negotiable | ตามตกลง | Negotiable |
| Match | ตรง {percent}% | {percent}% match |

### Appendix D: Salary Presets (Thai Market)

| Preset | Min (THB) | Max (THB) | Label |
|--------|-----------|-----------|-------|
| Entry | 0 | 15,000 | ต่ำกว่า 15,000 |
| Junior | 15,000 | 30,000 | 15,000 - 30,000 |
| Mid | 30,000 | 50,000 | 30,000 - 50,000 |
| Senior | 50,000 | 100,000 | 50,000 - 100,000 |
| Executive | 100,000 | null | มากกว่า 100,000 |

### Appendix E: Experience Ranges

| Code | Label (Thai) | Label (English) | Years |
|------|-------------|-----------------|-------|
| `0` | ไม่มีประสบการณ์ / จบใหม่ | No experience / Fresh graduate | 0 |
| `1-3` | 1-3 ปี | 1-3 years | 1-3 |
| `3-5` | 3-5 ปี | 3-5 years | 3-5 |
| `5-10` | 5-10 ปี | 5-10 years | 5-10 |
| `10+` | มากกว่า 10 ปี | More than 10 years | 10+ |

---

## 12. Accessibility

> See **JOB-R00 Section 14** for complete accessibility specifications.

### Route-Specific a11y Requirements

| Component | ARIA | Keyboard | Focus |
|-----------|------|----------|-------|
| Search input | `role="search"`, `aria-label="ค้นหางาน"` | `Enter` submits | Auto-focus on page load |
| Job list | `role="list"` | - | - |
| Job card | `role="listitem"`, `aria-label="{title} ที่ {company}"` | `Enter`/`Space` navigates | Visible focus ring |
| Save button | `aria-pressed`, `aria-label` | `Enter`/`Space` | - |
| Filter panel | `role="region"`, `aria-labelledby` | - | - |
| Filter checkbox | Standard | `Space` toggles | - |
| Salary slider | `role="slider"`, `aria-valuemin/max/now` | `←`/`→` adjusts | - |
| Pagination | `nav`, `aria-label="การนำทางหน้า"` | `Enter` on buttons | - |
| Results count | `role="status"`, `aria-live="polite"` | - | Announced on change |

### Screen Reader Announcements

| Event | Announcement |
|-------|--------------|
| Search complete | "พบ {count} งาน" |
| Filter applied | "กรองแล้ว พบ {count} งาน" |
| Job saved | "บันทึกงานแล้ว" |
| Job unsaved | "ยกเลิกการบันทึกแล้ว" |
| Page changed | "หน้า {n} จาก {total}" |

---

## 13. Test Scenarios

> See **JOB-R00 Section 17.1** for complete test scenario table.

### Critical Path Tests

| ID | Scenario | Expected |
|----|----------|----------|
| R01-01 | Initial load | Skeleton → job list |
| R01-02 | Search with no results | Empty state with clear CTA |
| R01-03 | Filter + sort | URL updates, results filtered |
| R01-08 | Guest save | Login prompt appears |
| R01-09 | Logged-in save | Heart fills, toast shows |
| R01-13 | Browser back | Previous filter state restored |

### Edge Cases

| Scenario | Expected |
|----------|----------|
| Invalid page `?page=999` | Redirect to page 1 |
| Empty location `?location=` | Ignore, use no filter |
| Malformed salary `?salary_min=abc` | Ignore, use no filter |
| MeiliSearch down | Firestore fallback with notice |
| 0 total results | Empty state (not error) |

---

## 14. Related Documents

| Document | Relationship |
|----------|--------------|
| `JOB-R00_cross-cutting_RIS.md` | Shared patterns (Save Job, Login Prompt, etc.) |
| `02-public-routes.md` | UI specification source |
| `features_jobs.md` | Feature definitions (JOB-001, JOB-003) |
| `data-entities_jobs.md` | Job collection schema |
| `state-inventory_swr-keys.md` | SWR key patterns |
| `state-inventory_atoms.md` | Atom definitions |
| `JOB-R02_job-detail_RIS.md` | Related route (job detail) |

---

*End of JOB-R01 Route Implementation Spec*
