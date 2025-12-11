# RIS: /companies/[id]/dashboard/jobs/[jobId]

**Route ID:** COMP-R07  
**Version:** 1.0  
**Status:** Draft  
**Created:** 2025-12-10  
**Last Updated:** 2025-12-10

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial RIS creation for job detail/edit page |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/companies/[id]/dashboard/jobs/[jobId]` |
| Route ID | COMP-R07 |
| Shell | Company Shell |
| Purpose | View job performance, edit details, manage status |
| Complexity | High |
| Phase | 3 (Job Management) |
| UI Spec | `05-company-routes.md` Section 6.5 |

### Route Parameters

| Parameter | Type | Source | Validation |
|-----------|------|--------|------------|
| `id` | `string` | URL path segment | Must be valid company ID |
| `jobId` | `string` | URL path segment | Must be valid job ID |

### Query Parameters

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `mode` | `'view' \| 'edit'` | `'view'` | Page mode |
| `tab` | `string` | `'overview'` | Active tab in view mode |

---

## 2. Domain Classification

### Primary Domain: Company (Job Management)

- **Owns:** Job detail view, editing, status management
- **Mutations:** Update job, change status, delete job

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Jobs | Core entity | Read/Write: Full access |
| Applications | Display: recent applications | Read: List, counts |
| Analytics | Display: job performance | Read: Views, conversion |

### Global Domains (Shell-Injected)

| Domain | Requirement |
|--------|-------------|
| Auth | User must be authenticated, company member |
| Chat | FAB available |
| Notifications | Bell icon available |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| JOB-005 | Edit Job | Full | Inline editing |
| JOB-006 | Publish Job | Action | Status action |
| JOB-007 | Unpublish Job | Action | Status action |
| JOB-008 | Close/Deactivate Job | Action | Status action |
| JOB-009 | View Job by Company | Full | Detail view with metrics |

### New Features (This Route Introduces)

| Feature | Description | Priority |
|---------|-------------|----------|
| Performance Metrics | Views, applications, conversion rate | P0 |
| Views Chart | 30-day daily views trend | P1 |
| Quick Status Actions | Publish/Unpublish/Close from header | P0 |
| Recent Applications | Last 5 applications list | P0 |
| Inline Edit | Edit without wizard navigation | P0 |
| Change Tracking | Show modified fields before save | P1 |

### Not Implemented in v1.0

| Feature | Description | Status |
|---------|-------------|--------|
| A/B Testing | Compare job variations | â˜ Future Work |
| Applicant Funnel | Visual funnel chart | â˜ Future Work |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Job Detail | `web_jobs` | All fields | `uid === params.jobId` | `job-${jobId}` |
| Company Data | `company_information` | `uid`, `company_name`, `status` | `uid === params.id` | `company-${id}` |
| Job Applications | `web_job_applications` | Recent 5 | `job_id === params.jobId` | `job-applications-${jobId}` |
| Job Analytics | `web_job_analytics` | Daily views, 30 days | `job_id === params.jobId` | `job-analytics-${jobId}` |

### 4.2 Write Operations

| Action | Server Action | Collection | Fields Modified | Guard |
|--------|---------------|------------|-----------------|-------|
| Update Job | `JobUpdate` | `web_jobs` | Changed fields | Owner, not closed |
| Publish Job | `JobPostSet` | `web_jobs` | `jobStatus: 'published'` | Owner, not closed |
| Unpublish Job | `JobUnpublish` | `web_jobs` | `jobStatus: 'unpublished'` | Owner, published |
| Close Job | `JobDeactivate` | `web_jobs` | `jobStatus: 'closed', is_active: false` | Owner |
| Delete Job | `JobDelete` | `web_jobs` | Document deleted | Owner, draft only, no apps |
| Duplicate Job | `JobDuplicate` | `web_jobs` | Create new draft | Owner |

### 4.3 Data Fetching Strategy

```typescript
// Job detail with related data
const { data: job, mutate: mutateJob } = useSWR(
  jobId ? jobKeys.detail(jobId) : null,
  () => fetchJobDetail(jobId),
  defaultSWRConfig
);

// Recent applications
const { data: applications } = useSWR(
  jobId ? jobKeys.applications(jobId, { limit: 5 }) : null,
  () => fetchJobApplications(jobId, { limit: 5 }),
  defaultSWRConfig
);

// Analytics (30-day views)
const { data: analytics } = useSWR(
  jobId ? jobKeys.analytics(jobId) : null,
  () => fetchJobAnalytics(jobId),
  { refreshInterval: 60000 } // Refresh every minute
);
```

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose |
|------|------|-----|---------|
| `userAtom` | `userDataProps \| null` | R | Get user roles, companyId |
| `firebaseUserAtom` | `User \| null` | R | Verify authenticated |
| `companyAtom` | `companyDataProps \| null` | R | Company data cache |

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useJobDetail` | `{ job, isLoading, mutate }` | Job data |
| `useJobApplications` | `{ applications, total }` | Recent applications |
| `useJobAnalytics` | `{ views, trend, conversion }` | Performance metrics |
| `useJobActions` | `{ publish, unpublish, close, delete, duplicate }` | Status actions |
| `useJobForm` | Form state for edit mode | Edit form management |
| `useRouter` | Next.js router | Navigation |
| `useSearchParams` | Query params | Mode, tab state |

### 5.3 SWR Keys

| Key Pattern | Purpose | Config |
|-------------|---------|--------|
| `job-${jobId}` | Job detail | `defaultSWRConfig` |
| `job-applications-${jobId}` | Applications list | `defaultSWRConfig` |
| `job-analytics-${jobId}` | Performance data | `refreshInterval: 60000` |
| `company-jobs-${id}` | Invalidated on status change | - |

### 5.4 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `mode` | `'view' \| 'edit'` | From URL | Page mode |
| `activeTab` | `string` | `'overview'` | View mode tab |
| `editData` | `Partial<JobFormData>` | `{}` | Edit form state |
| `changedFields` | `Set<string>` | `new Set()` | Track modifications |
| `isDirty` | `boolean` | `false` | Unsaved changes |
| `actionModal` | `ActionModalState` | `null` | Active modal |

---

## 6. UI State Machine

### 6.1 Page State Automaton

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚        LOADING              â”‚
                    â”‚    (fetch job data)         â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                  â”‚
                           AUTH_CHECK
                                  â”‚
           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
           â”‚                      â”‚                      â”‚
           â–¼                      â–¼                      â–¼
    [redirect_login]      [ACCESS_CHECK]           [error]
                                  â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚                           â”‚
                    â–¼                           â–¼
             [data_loading]               [not_found]
                    â”‚
           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”
           â”‚                 â”‚
           â–¼                 â–¼
      [view_mode]       [edit_mode]
           â”‚                 â”‚
           â”‚            â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”
           â”‚            â”‚         â”‚
           â”‚         [clean]   [dirty]
           â”‚            â”‚         â”‚
           â”‚            â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜
           â”‚                 â”‚
           â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                    â”‚
            [status_action]
                    â”‚
           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”
           â”‚                 â”‚
           â–¼                 â–¼
      [confirming]      [processing]
           â”‚                 â”‚
           â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                    â”‚
                    â–¼
             [action_complete]
```

#### Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `AUTH_LOADED` | `auth_check` | - | - |
| `auth_check` | `NOT_AUTHENTICATED` | `redirect_login` | `!firebaseUser` | Redirect |
| `auth_check` | `AUTHENTICATED` | `access_check` | - | - |
| `access_check` | `NOT_MEMBER` | `not_found` | `job.company_id !== params.id` | 404 |
| `access_check` | `JOB_NOT_FOUND` | `not_found` | `!job` | 404 |
| `access_check` | `ACCESS_GRANTED` | `view_mode` | `mode !== 'edit'` | - |
| `access_check` | `ACCESS_GRANTED` | `edit_mode` | `mode === 'edit'` | Init form |
| `view_mode` | `EDIT_CLICK` | `edit_mode` | Job not closed | Update URL |
| `edit_mode` | `FIELD_CHANGE` | `edit_mode (dirty)` | - | Track field |
| `edit_mode` | `CANCEL` | `confirming` | `isDirty` | Show modal |
| `edit_mode` | `CANCEL` | `view_mode` | `!isDirty` | Clear form |
| `confirming` | `DISCARD` | `view_mode` | - | Clear form |
| `confirming` | `STAY` | `edit_mode` | - | Close modal |
| `edit_mode` | `SAVE` | `saving` | Form valid | - |
| `saving` | `SUCCESS` | `view_mode` | - | Invalidate, toast |
| `saving` | `ERROR` | `edit_mode` | - | Show error |
| `view_mode` | `ACTION_CLICK` | `confirming` | Destructive action | Show modal |
| `confirming` | `CONFIRM` | `processing` | - | Execute action |
| `processing` | `SUCCESS` | `view_mode` | - | Invalidate, toast |

### 6.2 Edit Mode State Machine

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `clean` | `FIELD_CHANGE` | `dirty` | Value differs from original | Add to changedFields |
| `dirty` | `FIELD_REVERT` | `clean` | All fields match original | Clear changedFields |
| `dirty` | `SAVE` | `saving` | Form valid | - |
| `saving` | `SUCCESS` | `clean` | - | Update original, clear changes |
| `saving` | `ERROR` | `dirty` | - | Show error |
| `dirty` | `CANCEL` | `confirming` | - | Show discard modal |
| `confirming` | `DISCARD` | `clean` | - | Reset form |
| `confirming` | `STAY` | `dirty` | - | Close modal |

### 6.3 Status Actions (Job Status State Machine)

Reference: PROJECT_INSTRUCTIONS.md Section 4.2 and COMP-R06

| Current Status | Available Actions | Next Status |
|----------------|-------------------|-------------|
| `draft` | Publish, Close, Delete | `published`, `closed`, (deleted) |
| `ontimer` | Early Activate, Cancel, Close | `published`, `unpublished`, `closed` |
| `published` | Unpublish, Close | `unpublished`, `closed` |
| `unpublished` | Publish, Close | `published`, `closed` |
| `closed` | Duplicate only | (new draft) |

---

## 7. Component-Action Wiring

### 7.1 Page Header (View Mode)

| Component | Data Source | Action | Target |
|-----------|-------------|--------|--------|
| Back Button | - | Click | â†’ `/companies/[id]/dashboard/jobs` |
| Job Title | `job.title` | - | - |
| Status Badge | `job.jobStatus` | - | Color-coded |
| Edit Button | - | Click | Switch to edit mode |
| Status Actions | Based on status | Click | Action modal |

### 7.2 Status Action Buttons

| Status | Primary Action | Secondary Actions |
|--------|----------------|-------------------|
| `draft` | à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆ (Publish) | à¹à¸à¹‰à¹„à¸‚, à¸¥à¸š |
| `ontimer` | à¹€à¸›à¸´à¸”à¸£à¸±à¸šà¸—à¸±à¸™à¸—à¸µ (Activate Now) | à¸¢à¸à¹€à¸¥à¸´à¸à¸•à¸±à¹‰à¸‡à¹€à¸§à¸¥à¸², à¸›à¸´à¸” |
| `published` | à¸«à¸¢à¸¸à¸”à¸Šà¸±à¹ˆà¸§à¸„à¸£à¸²à¸§ (Pause) | à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£ |
| `unpublished` | à¹€à¸›à¸´à¸”à¸£à¸±à¸šà¸­à¸µà¸à¸„à¸£à¸±à¹‰à¸‡ (Resume) | à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£ |
| `closed` | à¸„à¸±à¸”à¸¥à¸­à¸ (Duplicate) | - |

### 7.3 Overview Tab (View Mode)

| Section | Data Source | Components |
|---------|-------------|------------|
| Stats Cards | `job`, `analytics` | Views, Applications, Conversion |
| Views Chart | `analytics.dailyViews` | Line chart, 30 days |
| Recent Applications | `applications` | ApplicationListItem Ã— 5 |
| Job Preview | `job` | Read-only job card |

### 7.4 Stats Cards

| Card | Value | Change | Link |
|------|-------|--------|------|
| à¸œà¸¹à¹‰à¹€à¸‚à¹‰à¸²à¸Šà¸¡ | `analytics.totalViews` | vs last 7 days | - |
| à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£ | `job.applicationCount` | New this week | â†’ Applications tab |
| à¸­à¸±à¸•à¸£à¸²à¸à¸²à¸£à¸ªà¸¡à¸±à¸„à¸£ | `(apps/views) * 100%` | vs last period | - |
| à¸§à¸±à¸™à¸—à¸µà¹ˆà¹€à¸«à¸¥à¸·à¸­ | Days until expiry | - | - |

### 7.5 Edit Mode Form

| Section | Fields | From Step |
|---------|--------|-----------|
| Basic Info | Title, Type, Level, Salary, Positions | Wizard Step 1 |
| Details | Description, Responsibilities, Requirements, Skills | Wizard Step 2 |
| Location | Work Mode, Province, District, BTS | Wizard Step 3 |

### 7.6 Edit Mode Sidebar

| Component | Data Source | Purpose |
|-----------|-------------|---------|
| Change Summary | `changedFields` | List modified fields |
| Save Button | `isDirty`, `isValid` | Submit changes |
| Cancel Button | - | Discard with confirm |
| Last Saved | `job.updatedAt` | Reference |

---

## 8. Error Handling

### 8.1 Error States

| Error Type | Display | Recovery |
|------------|---------|----------|
| `JOB_NOT_FOUND` | 404 page | Link to job list |
| `ACCESS_DENIED` | 403 page | Link to company dashboard |
| `FETCH_ERROR` | Error state | Retry button |
| `SAVE_ERROR` | Toast | Form stays open, manual retry |
| `ACTION_ERROR` | Toast | Modal stays open |
| `DELETE_HAS_APPS` | Modal: "à¸‡à¸²à¸™à¸™à¸µà¹‰à¸¡à¸µ XX à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£" | Suggest close |
| `EDIT_CLOSED_JOB` | Redirect to view | Toast: "à¸‡à¸²à¸™à¸—à¸µà¹ˆà¸›à¸´à¸”à¹à¸¥à¹‰à¸§à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹à¸à¹‰à¹„à¸‚à¹„à¸”à¹‰" |

### 8.2 Edit Mode Validation

Same validation rules as COMP-R07 (Job Creation Wizard).

### 8.3 Navigation Guard

| Scenario | Behavior |
|----------|----------|
| Navigate away with dirty form | Show confirm modal |
| Browser back with dirty form | Show confirm modal |
| Tab close with dirty form | `beforeunload` warning |

---

## 9. Implementation Checklist

### 9.1 Access Control
- [ ] Verify company owns this job
- [ ] Check user is company member
- [ ] Block edit mode for closed jobs

### 9.2 View Mode
- [ ] Create PageHeader with status actions
- [ ] Create StatsCards row
- [ ] Create ViewsChart (line chart)
- [ ] Create RecentApplicationsList
- [ ] Create JobPreviewCard (read-only)

### 9.3 Edit Mode
- [ ] Create EditForm with all sections
- [ ] Create ChangesSidebar
- [ ] Implement field-level change tracking
- [ ] Wire save with validation
- [ ] Implement cancel with confirm

### 9.4 Status Actions
- [ ] Wire Publish action with MeiliSearch index
- [ ] Wire Unpublish action with search removal
- [ ] Wire Close action with confirmation
- [ ] Wire Delete action (draft only, no apps)
- [ ] Wire Duplicate action

### 9.5 Analytics
- [ ] Fetch 30-day view data
- [ ] Calculate conversion rate
- [ ] Calculate week-over-week change
- [ ] Render line chart

### 9.6 Testing
- [ ] Test: View mode renders all sections
- [ ] Test: Edit mode pre-fills form
- [ ] Test: Save updates and returns to view
- [ ] Test: Publish/unpublish toggles status
- [ ] Test: Close action with confirmation
- [ ] Test: Duplicate creates new draft
- [ ] Test: Unsaved changes guard
- [ ] Test: Delete blocked with applications
- [ ] Test: Edit blocked for closed jobs

---

## 10. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| Inline edit vs wizard | Inline | Less navigation, faster editing | 2025-12-10 |
| Change tracking sidebar | Yes | Clear visibility of modifications | 2025-12-10 |
| 30-day analytics window | Yes | Meaningful trend data | 2025-12-10 |
| Recent 5 applications | Yes | Balance info density | 2025-12-10 |
| Status actions in header | Yes | Primary actions visible | 2025-12-10 |

---

## 11. Related Routes

| Route | Relationship |
|-------|--------------|
| `/companies/[id]/dashboard/jobs` | Parent list (COMP-R06) |
| `/companies/[id]/dashboard/jobs/new` | Duplicate destination (COMP-R07) |
| `/companies/[id]/dashboard/applications` | View all applications (COMP-R05) |
| `/jobs/[jobId]` | Public job view (JOB-R02) |

---

## 12. Cross-References

This document references shared specifications from:

| Document | Section | Topic |
|----------|---------|-------|
| COMP-R00 | Section 2-4 | Shell, access control, roles |
| COMP-R07 | Section 7 | Form fields, validation rules |
| JOB-R00 | Section 3-4 | Job entity lifecycle |
| PROJECT_INSTRUCTIONS | Section 4.2 | Job status state machine |

---

## Appendix A: TypeScript Types

```typescript
// Page modes
type PageMode = 'view' | 'edit';

// View mode tabs
type ViewTab = 'overview' | 'applications' | 'settings';

// Page states
type PageState = 
  | 'loading'
  | 'auth_check'
  | 'access_check'
  | 'view_mode'
  | 'edit_mode'
  | 'saving'
  | 'confirming'
  | 'processing'
  | 'not_found'
  | 'error';

// Edit state
type EditState = 'clean' | 'dirty' | 'saving' | 'confirming';

// Job with analytics
interface JobWithAnalytics {
  // Core job fields
  uid: string;
  title: string;
  jobStatus: JobStatus;
  isActive: boolean;
  // ... all job fields from COMP-R07
  
  // Aggregated counts
  applicationCount: number;
  unreadApplicationCount: number;
  viewCount: number;
}

// Analytics data
interface JobAnalytics {
  totalViews: number;
  viewsChange: number;        // % change vs last period
  dailyViews: DailyView[];    // 30 days
  conversionRate: number;     // apps / views * 100
  conversionChange: number;   // % change
}

interface DailyView {
  date: string;  // YYYY-MM-DD
  views: number;
}

// Action modal state
type ActionModalState = 
  | null
  | { type: 'close'; title: string }
  | { type: 'delete'; title: string; hasApps: boolean }
  | { type: 'discard_changes' }
  | { type: 'unpublish'; title: string };

// Status action availability matrix
const STATUS_ACTIONS: Record<JobStatus, string[]> = {
  draft: ['publish', 'close', 'delete', 'duplicate'],
  ontimer: ['activate_now', 'cancel_schedule', 'close', 'duplicate'],
  published: ['unpublish', 'close', 'duplicate'],
  unpublished: ['publish', 'close', 'duplicate'],
  closed: ['duplicate']
};
```

---

## Appendix B: Component File Structure

```
src/
â”œâ”€â”€ app/
â”‚   â””â”€â”€ companies/
â”‚       â””â”€â”€ [id]/
â”‚           â””â”€â”€ dashboard/
â”‚               â””â”€â”€ jobs/
â”‚                   â””â”€â”€ [jobId]/
â”‚                       â””â”€â”€ page.tsx              # Job detail page
â”œâ”€â”€ components/
â”‚   â””â”€â”€ companies/
â”‚       â””â”€â”€ jobs/
â”‚           â””â”€â”€ detail/
â”‚               â”œâ”€â”€ JobDetailPage.tsx             # Page orchestrator
â”‚               â”œâ”€â”€ JobDetailHeader.tsx           # Title, status, actions
â”‚               â”œâ”€â”€ StatusActionButtons.tsx       # Context-aware actions
â”‚               â”œâ”€â”€ JobStatsCards.tsx             # Metrics row
â”‚               â”œâ”€â”€ JobViewsChart.tsx             # 30-day line chart
â”‚               â”œâ”€â”€ RecentApplicationsList.tsx    # Last 5 applications
â”‚               â”œâ”€â”€ ApplicationListItem.tsx       # Single application row
â”‚               â”œâ”€â”€ JobPreviewCard.tsx            # Read-only preview
â”‚               â”œâ”€â”€ JobEditForm.tsx               # Edit mode form
â”‚               â”œâ”€â”€ EditFormSection.tsx           # Collapsible section
â”‚               â”œâ”€â”€ ChangesSidebar.tsx            # Modified fields list
â”‚               â”œâ”€â”€ CloseJobModal.tsx             # Close confirmation
â”‚               â”œâ”€â”€ DeleteJobModal.tsx            # Delete confirmation
â”‚               â”œâ”€â”€ DiscardChangesModal.tsx       # Unsaved changes
â”‚               â””â”€â”€ JobDetailSkeleton.tsx         # Loading skeleton
â”œâ”€â”€ hooks/
â”‚   â””â”€â”€ companies/
â”‚       â””â”€â”€ jobs/
â”‚           â”œâ”€â”€ use-job-detail.ts                 # Job data hook
â”‚           â”œâ”€â”€ use-job-analytics.ts              # Analytics hook
â”‚           â”œâ”€â”€ use-job-edit.ts                   # Edit form state
â”‚           â””â”€â”€ use-change-tracking.ts            # Field change tracking
â””â”€â”€ domains/
    â””â”€â”€ jobs/
        â””â”€â”€ services/
            â””â”€â”€ server/
                â””â”€â”€ actions/
                    â””â”€â”€ job-analytics.ts          # Analytics queries
```

---

## Appendix C: Thai Copy Reference

| Key | Thai Text | English Equivalent |
|-----|-----------|-------------------|
| `page_back` | â† à¸à¸¥à¸±à¸šà¹„à¸›à¸£à¸²à¸¢à¸à¸²à¸£à¸‡à¸²à¸™ | Back to Job List |
| `btn_edit` | à¹à¸à¹‰à¹„à¸‚ | Edit |
| `btn_save` | à¸šà¸±à¸™à¸—à¸¶à¸ | Save |
| `btn_cancel` | à¸¢à¸à¹€à¸¥à¸´à¸ | Cancel |
| `btn_publish` | à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆ | Publish |
| `btn_unpublish` | à¸«à¸¢à¸¸à¸”à¸Šà¸±à¹ˆà¸§à¸„à¸£à¸²à¸§ | Pause |
| `btn_close` | à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£ | Close Applications |
| `btn_delete` | à¸¥à¸š | Delete |
| `btn_duplicate` | à¸„à¸±à¸”à¸¥à¸­à¸ | Duplicate |
| `btn_activate_now` | à¹€à¸›à¸´à¸”à¸£à¸±à¸šà¸—à¸±à¸™à¸—à¸µ | Activate Now |
| `stat_views` | à¸œà¸¹à¹‰à¹€à¸‚à¹‰à¸²à¸Šà¸¡ | Views |
| `stat_applications` | à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£ | Applications |
| `stat_conversion` | à¸­à¸±à¸•à¸£à¸²à¸à¸²à¸£à¸ªà¸¡à¸±à¸„à¸£ | Conversion Rate |
| `stat_days_left` | à¸§à¸±à¸™à¸—à¸µà¹ˆà¹€à¸«à¸¥à¸·à¸­ | Days Remaining |
| `chart_title` | à¸œà¸¹à¹‰à¹€à¸‚à¹‰à¸²à¸Šà¸¡ 30 à¸§à¸±à¸™à¸¥à¹ˆà¸²à¸ªà¸¸à¸” | Views (Last 30 Days) |
| `recent_apps_title` | à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¸¥à¹ˆà¸²à¸ªà¸¸à¸” | Recent Applications |
| `recent_apps_empty` | à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£ | No applications yet |
| `recent_apps_view_all` | à¸”à¸¹à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” | View All |
| `preview_title` | à¸•à¸±à¸§à¸­à¸¢à¹ˆà¸²à¸‡à¸›à¸£à¸°à¸à¸²à¸¨ | Job Preview |
| `edit_section_basic` | à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸žà¸·à¹‰à¸™à¸à¸²à¸™ | Basic Information |
| `edit_section_details` | à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¸‡à¸²à¸™ | Job Details |
| `edit_section_location` | à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆà¸—à¸³à¸‡à¸²à¸™ | Work Location |
| `changes_title` | à¸à¸²à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡ | Changes |
| `changes_none` | à¹„à¸¡à¹ˆà¸¡à¸µà¸à¸²à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡ | No changes |
| `changes_count` | {n} à¸£à¸²à¸¢à¸à¸²à¸£à¸—à¸µà¹ˆà¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡ | {n} fields changed |
| `last_saved` | à¸šà¸±à¸™à¸—à¸¶à¸à¸¥à¹ˆà¸²à¸ªà¸¸à¸” | Last saved |
| `confirm_close_title` | à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£à¸‡à¸²à¸™? | Close Job Applications? |
| `confirm_close_desc` | à¸‡à¸²à¸™à¸™à¸µà¹‰à¸ˆà¸°à¸–à¸¹à¸à¸‹à¹ˆà¸­à¸™à¸ˆà¸²à¸à¸œà¸¹à¹‰à¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¸°à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹€à¸›à¸´à¸”à¸£à¸±à¸šà¹ƒà¸«à¸¡à¹ˆà¹„à¸”à¹‰ | This job will be hidden and cannot be reopened |
| `confirm_delete_title` | à¸¥à¸šà¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™? | Delete Job Posting? |
| `confirm_delete_desc` | à¸à¸²à¸£à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£à¸™à¸µà¹‰à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸¢à¸à¹€à¸¥à¸´à¸à¹„à¸”à¹‰ | This action cannot be undone |
| `error_has_apps` | à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸¥à¸šà¸‡à¸²à¸™à¸—à¸µà¹ˆà¸¡à¸µà¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹„à¸”à¹‰ à¸à¸£à¸¸à¸“à¸²à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£à¹à¸—à¸™ | Cannot delete job with applications. Please close instead. |
| `error_closed_edit` | à¸‡à¸²à¸™à¸—à¸µà¹ˆà¸›à¸´à¸”à¹à¸¥à¹‰à¸§à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹à¸à¹‰à¹„à¸‚à¹„à¸”à¹‰ | Closed jobs cannot be edited |
| `discard_title` | à¸¢à¸à¹€à¸¥à¸´à¸à¸à¸²à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡? | Discard Changes? |
| `discard_desc` | à¸à¸²à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡à¸—à¸µà¹ˆà¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¹„à¸”à¹‰à¸šà¸±à¸™à¸—à¸¶à¸à¸ˆà¸°à¸«à¸²à¸¢à¹„à¸› | Unsaved changes will be lost |
| `discard_confirm` | à¸¢à¸à¹€à¸¥à¸´à¸ | Discard |
| `discard_stay` | à¹à¸à¹‰à¹„à¸‚à¸•à¹ˆà¸­ | Keep Editing |
| `success_saved` | à¸šà¸±à¸™à¸—à¸¶à¸à¸à¸²à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡à¸ªà¸³à¹€à¸£à¹‡à¸ˆ | Changes saved successfully |
| `success_published` | à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆà¸‡à¸²à¸™à¸ªà¸³à¹€à¸£à¹‡à¸ˆ | Job published successfully |
| `success_unpublished` | à¸«à¸¢à¸¸à¸”à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆà¸‡à¸²à¸™à¸ªà¸³à¹€à¸£à¹‡à¸ˆ | Job paused successfully |
| `success_closed` | à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£à¸ªà¸³à¹€à¸£à¹‡à¸ˆ | Job closed successfully |
| `success_deleted` | à¸¥à¸šà¸‡à¸²à¸™à¸ªà¸³à¹€à¸£à¹‡à¸ˆ | Job deleted successfully |
| `success_duplicated` | à¸„à¸±à¸”à¸¥à¸­à¸à¸‡à¸²à¸™à¸ªà¸³à¹€à¸£à¹‡à¸ˆ | Job duplicated successfully |

---

## Appendix D: Status Action Matrix

| Status | Edit | Publish | Unpublish | Close | Duplicate | Delete |
|--------|------|---------|-----------|-------|-----------|--------|
| `draft` | âœ… | âœ… | âŒ | âœ… | âœ… | âœ…* |
| `ontimer` | âœ… | âœ… | âœ… | âœ… | âœ… | âŒ |
| `published` | âœ… | âŒ | âœ… | âœ… | âœ… | âŒ |
| `unpublished` | âœ… | âœ… | âŒ | âœ… | âœ… | âŒ |
| `closed` | âŒ | âŒ | âŒ | âŒ | âœ… | âŒ |

*Delete only allowed if job has 0 applications

---

*End of RIS: /companies/[id]/dashboard/jobs/[jobId] (COMP-R07) v1.0*
