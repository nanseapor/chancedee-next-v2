# RIS: /companies/[id]/dashboard/jobs

**Route ID:** COMP-R05  
**Version:** 1.0  
**Status:** Draft  
**Created:** 2025-12-10  
**Last Updated:** 2025-12-10

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial RIS creation for company job management list |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/companies/[id]/dashboard/jobs` |
| Route ID | COMP-R05 |
| Shell | Company Shell |
| Purpose | Manage all job postings - list, filter, bulk actions |
| Complexity | High |
| Phase | 3 (Job Management) |
| UI Spec | `05-company-routes.md` Section 6.3 |

### Route Parameters

| Parameter | Type | Source | Validation |
|-----------|------|--------|------------|
| `id` | `string` | URL path segment | Must be valid company ID |

### Query Parameters

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `status` | `string` | `'all'` | Filter by job status |
| `q` | `string` | `''` | Search query |
| `page` | `number` | `1` | Pagination |
| `sort` | `string` | `'created_desc'` | Sort order |

---

## 2. Domain Classification

### Primary Domain: Company (Job Management)

- **Owns:** Job list management, status transitions, bulk operations
- **Mutations:** Publish, unpublish, close, delete jobs

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Jobs | Core entity operations | Write: CRUD, status changes |
| Applications | Display: application counts per job | Read: aggregated counts |

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
| JOB-009 | View Job by Company | Full | Main job list with filters |
| JOB-006 | Publish Job | Action | Via status toggle |
| JOB-007 | Unpublish Job | Action | Via status toggle |
| JOB-008 | Close/Deactivate Job | Action | Via menu action |

### New Features (This Route Introduces)

| Feature | Description | Priority |
|---------|-------------|----------|
| Status Tabs | Filter by all/active/draft/paused/closed | P0 |
| Bulk Actions | Select multiple jobs for bulk operations | P0 |
| Search | Search jobs by title | P0 |
| Sortable Columns | Sort by title, applications, views, date | P0 |
| Duplicate Job | Create copy of existing job | P1 |

### Not Implemented in v1.0

| Feature | Description | Status |
|---------|-------------|--------|
| Advanced Filters | By department, salary range | â˜ Future Work |
| Export to CSV | Download job list | â˜ Future Work |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Company Jobs | `web_jobs` | All job fields | `company_id === params.id` | `company-jobs-${id}` |
| Job Applications Count | `web_job_applications` | Aggregation per job | Group by `job_id` | Included in jobs query |
| Company Data | `company_information` | `uid`, `company_name`, `status` | `uid === params.id` | `company-${id}` |

### 4.2 Write Operations

| Action | Server Action | Collection | Fields Modified | Guard |
|--------|---------------|------------|-----------------|-------|
| Publish Job | `JobPostSet` | `web_jobs` | `jobStatus: 'published'` | Owner, not closed |
| Unpublish Job | `JobUnpublish` | `web_jobs` | `jobStatus: 'unpublished'` | Owner, published |
| Close Job | `JobDeactivate` | `web_jobs` | `jobStatus: 'closed', is_active: false` | Owner |
| Delete Job | `JobDelete` | `web_jobs` | Document deleted | Owner, draft only |
| Duplicate Job | `JobDuplicate` | `web_jobs` | Create new draft copy | Owner |
| Bulk Pause | `JobBulkUnpublish` | `web_jobs` | Multiple updates | Owner, bulk selection |
| Bulk Close | `JobBulkClose` | `web_jobs` | Multiple updates | Owner, bulk selection |

### 4.3 Data Fetching Strategy

```typescript
// Paginated jobs list with filters
const { data: jobsData, isLoading, mutate } = useSWR(
  companyId ? [companyKeys.jobs(companyId), status, query, page, sort] : null,
  () => fetchCompanyJobs(companyId, { status, query, page, sort }),
  defaultSWRConfig
);

// Job counts per status (for tabs)
const { data: statusCounts } = useSWR(
  companyId ? `company-job-counts-${companyId}` : null,
  () => fetchJobStatusCounts(companyId),
  defaultSWRConfig
);
```

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose |
|------|------|-----|---------|
| `userAtom` | `userDataProps \| null` | R | Get user roles, companyId |
| `firebaseUserAtom` | `User \| null` | R | Verify authenticated |
| `activeRoleAtom` | `string` | R | Navigation context ('company') |
| `companyAtom` | `companyDataProps \| null` | R | Company data cache |

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useCompanyJobs` | `{ jobs, isLoading, mutate, counts }` | Job list with filters |
| `useJobActions` | `{ publish, unpublish, close, delete, duplicate }` | Job mutations |
| `useBulkJobActions` | `{ bulkPause, bulkClose, bulkDelete }` | Bulk operations |
| `useRouter` | Next.js router | Navigation |
| `useSearchParams` | Query params | Filter state |

### 5.3 SWR Keys

| Key Pattern | Purpose | Config |
|-------------|---------|--------|
| `company-jobs-${id}` | Company job list | `defaultSWRConfig` |
| `company-job-counts-${id}` | Status tab counts | `defaultSWRConfig` |
| `job-${jobId}` | Individual job | Invalidated on action |

### 5.4 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `selectedJobs` | `Set<string>` | `new Set()` | Bulk selection |
| `isAllSelected` | `boolean` | `false` | Select all toggle |
| `actionModal` | `ActionModalState` | `null` | Active modal state |
| `sortConfig` | `SortConfig` | `{ field: 'created', dir: 'desc' }` | Current sort |

---

## 6. UI State Machine

### 6.1 Page State Automaton

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚        LOADING              â”‚
                    â”‚    (initial load)           â”‚
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
             [data_loading]               [redirect_403]
                    â”‚
           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”
           â”‚                 â”‚
           â–¼                 â–¼
      [list_view]       [empty_view]
           â”‚
    â”Œâ”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”
    â”‚             â”‚
    â–¼             â–¼
[with_selection] [idle]
```

#### Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `AUTH_LOADED` | `auth_check` | - | - |
| `auth_check` | `NOT_AUTHENTICATED` | `redirect_login` | `!firebaseUser` | `router.push('/auth/login')` |
| `auth_check` | `AUTHENTICATED` | `access_check` | `firebaseUser` exists | - |
| `access_check` | `NOT_MEMBER` | `redirect_403` | `user.companyId !== params.id` | Show 403 |
| `access_check` | `COMPANY_NOT_APPROVED` | `redirect_pending` | `company.status !== 'approved'` | Redirect |
| `access_check` | `ACCESS_GRANTED` | `data_loading` | Valid member | Fetch jobs |
| `data_loading` | `DATA_SUCCESS_EMPTY` | `empty_view` | Jobs array empty | Show empty state |
| `data_loading` | `DATA_SUCCESS` | `list_view` | Jobs array has items | Render table |
| `data_loading` | `DATA_ERROR` | `error` | Fetch failed | Show error |
| `list_view` | `SELECTION_CHANGED` | `with_selection` | Selected count > 0 | Show bulk bar |
| `with_selection` | `SELECTION_CLEARED` | `list_view` | Selected count = 0 | Hide bulk bar |
| `list_view` | `STATUS_TAB_CHANGE` | `data_loading` | - | Refetch with new filter |
| `list_view` | `SEARCH_CHANGE` | `data_loading` | Debounced | Refetch with query |

### 6.2 Job Status State Machine

**Reference:** PROJECT_INSTRUCTIONS.md Section 4.2

| Current State | Event | Next State | Actor | Guard Condition | Side Effects |
|---------------|-------|------------|-------|-----------------|--------------|
| `draft` | `PUBLISH` | `published` | Company | Required fields complete, `post_start_date <= now` | Index to MeiliSearch |
| `draft` | `SCHEDULE` | `ontimer` | Company | Required fields complete, `post_start_date > now` | - |
| `draft` | `CLOSE` | `closed` | Company | - | Set `is_active: false` |
| `draft` | `DELETE` | (deleted) | Company | No applications | Remove document |
| `ontimer` | `EARLY_ACTIVATE` | `published` | Company | Manual action | Index to MeiliSearch |
| `ontimer` | `CANCEL_SCHEDULE` | `unpublished` | Company | - | - |
| `ontimer` | `CLOSE` | `closed` | Company | - | Set `is_active: false` |
| `published` | `UNPUBLISH` | `unpublished` | Company | - | Remove from MeiliSearch |
| `published` | `CLOSE` | `closed` | Company | - | Remove from search, update apps |
| `unpublished` | `PUBLISH` | `published` | Company | - | Index to MeiliSearch |
| `unpublished` | `CLOSE` | `closed` | Company | - | Set `is_active: false` |

### 6.3 Bulk Action State Machine

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `idle` | `SELECT_JOB` | `selecting` | Job clicked | Add to selection |
| `selecting` | `DESELECT_JOB` | `idle` | Last item deselected | Clear selection |
| `selecting` | `SELECT_ALL` | `all_selected` | - | Add all page items |
| `all_selected` | `DESELECT_ALL` | `idle` | - | Clear selection |
| `selecting` | `BULK_ACTION_CLICK` | `confirming` | - | Show confirm modal |
| `confirming` | `CONFIRM` | `processing` | - | Execute bulk action |
| `confirming` | `CANCEL` | `selecting` | - | Close modal |
| `processing` | `SUCCESS` | `complete` | - | Show toast, clear selection |
| `processing` | `PARTIAL_SUCCESS` | `complete` | Some failed | Show partial toast |
| `processing` | `ERROR` | `error` | All failed | Show error toast |
| `complete` | `DISMISS` | `idle` | - | Refetch list |

---

## 7. Component-Action Wiring

### 7.1 Page Header

| Component | Data Source | Action | Target |
|-----------|-------------|--------|--------|
| Title | Static: "à¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™" | - | - |
| Search Input | Query param `q` | Debounced search | Update URL, refetch |
| Create Button | - | Click | â†’ `/companies/[id]/dashboard/jobs/new` |

### 7.2 Status Tabs

| Tab | Filter Value | Count Source | Badge |
|-----|--------------|--------------|-------|
| à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” | `all` | `statusCounts.total` | Total |
| à¸à¸³à¸¥à¸±à¸‡à¹€à¸›à¸´à¸”à¸£à¸±à¸š | `active` | `statusCounts.active` | Published + ontimer |
| à¸£à¹ˆà¸²à¸‡ | `draft` | `statusCounts.draft` | Draft only |
| à¸«à¸¢à¸¸à¸”à¸Šà¸±à¹ˆà¸§à¸„à¸£à¸²à¸§ | `paused` | `statusCounts.paused` | Unpublished |
| à¸›à¸´à¸”à¹à¸¥à¹‰à¸§ | `closed` | `statusCounts.closed` | Closed |

### 7.3 Job Table

| Column | Field | Sortable | Action |
|--------|-------|----------|--------|
| Checkbox | - | No | Toggle selection |
| Title | `title` | Yes | Click â†’ job detail |
| Department | `jobFunctionText` | No | - |
| Applications | `applicationCount` | Yes | Badge if unread |
| Views | `viewCount` | Yes | - |
| Posted Date | `postStartDate` | Yes | Thai date format |
| Status | `jobStatus` | No | Color-coded badge |
| Actions | - | No | Menu dropdown |

### 7.4 Row Action Menu

| Action | Label | Condition | Server Action | Side Effect |
|--------|-------|-----------|---------------|-------------|
| View | à¸”à¸¹ | Always | - | Navigate to COMP-R08 |
| Edit | à¹à¸à¹‰à¹„à¸‚ | Not closed | - | Navigate with `?mode=edit` |
| Pause | à¸«à¸¢à¸¸à¸”à¸Šà¸±à¹ˆà¸§à¸„à¸£à¸²à¸§ | Published | `JobUnpublish` | Invalidate list |
| Resume | à¹€à¸›à¸´à¸”à¸£à¸±à¸š | Unpublished | `JobPostSet(published)` | Invalidate list |
| Publish | à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆ | Draft, ontimer | `JobPostSet(published)` | Invalidate list |
| Close | à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£ | Not closed | `JobDeactivate` | Confirm modal |
| Duplicate | à¸„à¸±à¸”à¸¥à¸­à¸ | Always | `JobDuplicate` | Navigate to new draft |
| Delete | à¸¥à¸š | Draft only, no apps | `JobDelete` | Confirm modal |

### 7.5 Bulk Actions Bar

| Action | Label | Condition | Server Action |
|--------|-------|-----------|---------------|
| Pause All | à¸«à¸¢à¸¸à¸”à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” | Any published selected | `JobBulkUnpublish` |
| Close All | à¸›à¸´à¸”à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” | Any non-closed selected | `JobBulkClose` |
| Delete All | à¸¥à¸šà¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” | Only drafts without apps | `JobBulkDelete` |

---

## 8. Error Handling

### 8.1 Error States

| Error Type | Display | Recovery |
|------------|---------|----------|
| `AUTH_ERROR` | Redirect to login | Auto-redirect |
| `ACCESS_DENIED` | 403 page | Link to home |
| `FETCH_ERROR` | Error state with retry | Retry button |
| `ACTION_ERROR` | Toast with message | Action modal stays open |
| `BULK_PARTIAL_ERROR` | Toast: "à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£à¸ªà¸³à¹€à¸£à¹‡à¸ˆ X/Y à¸£à¸²à¸¢à¸à¸²à¸£" | Show which failed |
| `DELETE_HAS_APPS` | Modal: "à¸‡à¸²à¸™à¸™à¸µà¹‰à¸¡à¸µ XX à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£" | Close instead |
| `DUPLICATE_ERROR` | Toast + retry | - |

### 8.2 Validation Errors

| Error | Message | Resolution |
|-------|---------|------------|
| Delete with applications | "à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸¥à¸šà¸‡à¸²à¸™à¸—à¸µà¹ˆà¸¡à¸µà¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹„à¸”à¹‰" | Suggest close instead |
| Publish incomplete job | "à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹ƒà¸«à¹‰à¸„à¸£à¸šà¸à¹ˆà¸­à¸™à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆ" | Link to edit |

---

## 9. Implementation Checklist

### 9.1 Access Control
- [ ] Verify company membership
- [ ] Check company approval status
- [ ] Apply role-based action visibility

### 9.2 Data Fetching
- [ ] Implement `fetchCompanyJobs` with pagination, filters, sort
- [ ] Implement `fetchJobStatusCounts` for tab badges
- [ ] Include application counts in jobs query

### 9.3 UI Components
- [ ] Create PageHeader with search and create button
- [ ] Create StatusTabs with count badges
- [ ] Create JobTable with sortable columns
- [ ] Create JobRow with status badge and action menu
- [ ] Create BulkActionsBar
- [ ] Create Pagination
- [ ] Create empty states

### 9.4 Actions
- [ ] Wire single job actions (publish, unpublish, close, delete, duplicate)
- [ ] Wire bulk actions with confirmation
- [ ] Invalidate caches on all mutations

### 9.5 URL State
- [ ] Sync status filter to URL
- [ ] Sync search query to URL (debounced)
- [ ] Sync page number to URL
- [ ] Sync sort to URL

### 9.6 Testing
- [ ] Test: Tab filtering works correctly
- [ ] Test: Search filters by title
- [ ] Test: Sort by each column
- [ ] Test: Bulk selection and actions
- [ ] Test: Status transitions update list
- [ ] Test: Delete blocked with applications
- [ ] Test: Mobile card list view
- [ ] Test: Pagination works

---

## 10. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| `ontimer` counted as "active" | Yes | Lazy evaluation - shows as published to candidates | 2025-12-10 |
| Delete only for drafts without apps | Yes | Prevent data loss | 2025-12-10 |
| Bulk delete not in v1.0 | Deferred | Complex validation per job | 2025-12-10 |
| Card view on mobile | Yes | Table too wide | 2025-12-10 |
| Search debounce 300ms | Yes | Reduce API calls | 2025-12-10 |

---

## 11. Related Routes

| Route | Relationship |
|-------|--------------|
| `/companies/[id]/dashboard` | Parent dashboard (COMP-R04) |
| `/companies/[id]/dashboard/jobs/new` | Create new job (COMP-R06) |
| `/companies/[id]/dashboard/jobs/[jobId]` | Job detail/edit (COMP-R07) |
| `/companies/[id]/dashboard/applications` | Linked from application counts (COMP-R08) |

---

## 12. Cross-References

This document references shared specifications from:

| Document | Section | Topic |
|----------|---------|-------|
| COMP-R00 | Section 2-4 | Shell, access control, roles |
| JOB-R00 | Section 3-4 | Job entity lifecycle |
| PROJECT_INSTRUCTIONS | Section 4.2 | Job status state machine |

---

## Appendix A: TypeScript Types

```typescript
// Job status enum
type JobStatus = 'draft' | 'published' | 'ontimer' | 'unpublished' | 'closed';

// Page states
type PageState = 
  | 'loading'
  | 'auth_check'
  | 'access_check'
  | 'data_loading'
  | 'list_view'
  | 'empty_view'
  | 'with_selection'
  | 'error';

// Job list item
interface JobListItem {
  uid: string;
  title: string;
  jobStatus: JobStatus;
  isActive: boolean;
  jobFunctionText?: string;
  postStartDate?: number;
  postExpiryDate?: number;
  applicationCount: number;
  unreadApplicationCount: number;
  viewCount: number;
  createdAt: number;
  updatedAt: number;
}

// Status counts
interface StatusCounts {
  total: number;
  active: number;    // published + ontimer
  draft: number;
  paused: number;    // unpublished
  closed: number;
}

// Sort config
interface SortConfig {
  field: 'title' | 'applications' | 'views' | 'created';
  direction: 'asc' | 'desc';
}

// Action modal state
type ActionModalState = 
  | null
  | { type: 'close'; jobId: string; jobTitle: string }
  | { type: 'delete'; jobId: string; jobTitle: string; hasApps: boolean }
  | { type: 'bulk_pause'; jobIds: string[] }
  | { type: 'bulk_close'; jobIds: string[] };
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
â”‚                   â””â”€â”€ page.tsx              # Main list page
â”œâ”€â”€ components/
â”‚   â””â”€â”€ companies/
â”‚       â””â”€â”€ jobs/
â”‚           â”œâ”€â”€ JobListPage.tsx               # Page orchestrator
â”‚           â”œâ”€â”€ JobListHeader.tsx             # Title, search, create
â”‚           â”œâ”€â”€ StatusTabs.tsx                # Filter tabs
â”‚           â”œâ”€â”€ JobTable.tsx                  # Desktop table
â”‚           â”œâ”€â”€ JobTableHeader.tsx            # Sortable columns
â”‚           â”œâ”€â”€ JobRow.tsx                    # Single job row
â”‚           â”œâ”€â”€ JobStatusBadge.tsx            # Color-coded status
â”‚           â”œâ”€â”€ JobActionMenu.tsx             # Row actions dropdown
â”‚           â”œâ”€â”€ JobCardList.tsx               # Mobile card view
â”‚           â”œâ”€â”€ JobCard.tsx                   # Single job card
â”‚           â”œâ”€â”€ BulkActionsBar.tsx            # Floating bulk bar
â”‚           â”œâ”€â”€ CloseJobModal.tsx             # Close confirmation
â”‚           â”œâ”€â”€ DeleteJobModal.tsx            # Delete confirmation
â”‚           â”œâ”€â”€ BulkActionModal.tsx           # Bulk confirm
â”‚           â”œâ”€â”€ JobListEmpty.tsx              # Empty state
â”‚           â””â”€â”€ JobListSkeleton.tsx           # Loading skeleton
â”œâ”€â”€ hooks/
â”‚   â””â”€â”€ companies/
â”‚       â”œâ”€â”€ use-company-jobs.ts               # Jobs list hook
â”‚       â”œâ”€â”€ use-job-actions.ts                # Single actions
â”‚       â””â”€â”€ use-bulk-job-actions.ts           # Bulk actions
â””â”€â”€ domains/
    â””â”€â”€ jobs/
        â””â”€â”€ services/
            â””â”€â”€ server/
                â””â”€â”€ actions/
                    â”œâ”€â”€ job-management.ts     # CRUD actions
                    â””â”€â”€ job-bulk-actions.ts   # Bulk actions
```

---

## Appendix C: Thai Copy Reference

| Key | Thai Text | English Equivalent |
|-----|-----------|-------------------|
| `page_title` | à¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™ | Job Postings |
| `search_placeholder` | à¸„à¹‰à¸™à¸«à¸²à¸•à¸³à¹à¸«à¸™à¹ˆà¸‡à¸‡à¸²à¸™ | Search job titles |
| `btn_create` | + à¸¥à¸‡à¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™à¹ƒà¸«à¸¡à¹ˆ | + Create New Job |
| `tab_all` | à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” | All |
| `tab_active` | à¸à¸³à¸¥à¸±à¸‡à¹€à¸›à¸´à¸”à¸£à¸±à¸š | Active |
| `tab_draft` | à¸£à¹ˆà¸²à¸‡ | Draft |
| `tab_paused` | à¸«à¸¢à¸¸à¸”à¸Šà¸±à¹ˆà¸§à¸„à¸£à¸²à¸§ | Paused |
| `tab_closed` | à¸›à¸´à¸”à¹à¸¥à¹‰à¸§ | Closed |
| `col_title` | à¸•à¸³à¹à¸«à¸™à¹ˆà¸‡ | Position |
| `col_dept` | à¹à¸œà¸™à¸ | Department |
| `col_apps` | à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£ | Applications |
| `col_views` | à¸œà¸¹à¹‰à¹€à¸‚à¹‰à¸²à¸Šà¸¡ | Views |
| `col_posted` | à¸§à¸±à¸™à¸—à¸µà¹ˆà¸¥à¸‡ | Posted Date |
| `col_status` | à¸ªà¸–à¸²à¸™à¸° | Status |
| `action_view` | à¸”à¸¹ | View |
| `action_edit` | à¹à¸à¹‰à¹„à¸‚ | Edit |
| `action_pause` | à¸«à¸¢à¸¸à¸”à¸Šà¸±à¹ˆà¸§à¸„à¸£à¸²à¸§ | Pause |
| `action_resume` | à¹€à¸›à¸´à¸”à¸£à¸±à¸š | Resume |
| `action_publish` | à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆ | Publish |
| `action_close` | à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£ | Close Applications |
| `action_duplicate` | à¸„à¸±à¸”à¸¥à¸­à¸ | Duplicate |
| `action_delete` | à¸¥à¸š | Delete |
| `bulk_pause` | à¸«à¸¢à¸¸à¸”à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” | Pause All |
| `bulk_close` | à¸›à¸´à¸”à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” | Close All |
| `status_draft` | à¸£à¹ˆà¸²à¸‡ | Draft |
| `status_published` | à¹€à¸›à¸´à¸”à¸£à¸±à¸š | Open |
| `status_ontimer` | à¸£à¸­à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆ | Scheduled |
| `status_unpublished` | à¸«à¸¢à¸¸à¸”à¸Šà¸±à¹ˆà¸§à¸„à¸£à¸²à¸§ | Paused |
| `status_closed` | à¸›à¸´à¸”à¹à¸¥à¹‰à¸§ | Closed |
| `empty_title` | à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™ | No Job Postings |
| `empty_cta` | à¸¥à¸‡à¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™à¹à¸£à¸ | Create First Job |
| `filter_empty` | à¹„à¸¡à¹ˆà¸¡à¸µà¸‡à¸²à¸™à¹ƒà¸™à¸ªà¸–à¸²à¸™à¸°à¸™à¸µà¹‰ | No jobs in this status |
| `confirm_close_title` | à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£à¸‡à¸²à¸™? | Close Job Applications? |
| `confirm_close_desc` | à¸‡à¸²à¸™à¸™à¸µà¹‰à¸ˆà¸°à¸–à¸¹à¸à¸‹à¹ˆà¸­à¸™à¸ˆà¸²à¸à¸œà¸¹à¹‰à¸ªà¸¡à¸±à¸„à¸£ | This job will be hidden from candidates |
| `confirm_delete_title` | à¸¥à¸šà¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™? | Delete Job Posting? |
| `confirm_delete_warn` | à¸à¸²à¸£à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£à¸™à¸µà¹‰à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸¢à¸à¹€à¸¥à¸´à¸à¹„à¸”à¹‰ | This action cannot be undone |
| `error_has_apps` | à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸¥à¸šà¸‡à¸²à¸™à¸—à¸µà¹ˆà¸¡à¸µà¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹„à¸”à¹‰ | Cannot delete job with applications |
| `bulk_success` | à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£à¸ªà¸³à¹€à¸£à¹‡à¸ˆ | Action completed |
| `bulk_partial` | à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£à¸ªà¸³à¹€à¸£à¹‡à¸ˆ X/Y à¸£à¸²à¸¢à¸à¸²à¸£ | Completed X/Y items |

---

*End of RIS: /companies/[id]/dashboard/jobs (COMP-R05) v1.0*
