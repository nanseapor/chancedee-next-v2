# BLS-07: Job Management Stage

**Stage:** Job Management  
**Version:** 1.1  
**Last Updated:** 2025-12-11  
**Actions Count:** 11

> **Revision 1.1:** Added explicit server action declarations for data fetching operations.

---

## Stage Overview

The Job Management Stage handles company-side job posting lifecycle: creation, editing, publishing, and status management. This stage is **Company-only** and provides the foundation for the job listings that candidates discover in BLS-02.

### Stage Boundaries

| Aspect | Scope |
|--------|-------|
| **Enters from** | Company dashboard, job list, or direct URL |
| **Flows to** | BLS-02 Discovery (published jobs visible to candidates) |
| **Primary Actors** | Company HR, Company Admin |
| **Data Source** | `jobs` collection |

### Actions in This Stage

| Action ID | Action Name | Actor | Trigger | Primary Collection |
|-----------|-------------|-------|---------|-------------------|
| BLS-07-01 | listJobs | Company | Navigate to jobs list | `jobs` |
| BLS-07-02 | createJob | Company | Click "Create Job" | `jobs` |
| BLS-07-03 | saveDraft | Company | Auto-save or manual | `jobs` |
| BLS-07-04 | editJob | Company | Click edit on job | `jobs` |
| BLS-07-05 | publishJob | Company | Publish action | `jobs` |
| BLS-07-06 | scheduleJob | Company | Schedule for future | `jobs` |
| BLS-07-07 | unpublishJob | Company | Pause action | `jobs` |
| BLS-07-08 | closeJob | Company | Close action | `jobs` |
| BLS-07-09 | deleteJob | Company | Delete action | `jobs` |
| BLS-07-10 | duplicateJob | Company | Duplicate action | `jobs` |
| BLS-07-11 | viewJobAnalytics | Company | View job detail | `jobs`, `job_analytics` |

### Job Status State Machine

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

### Status Definitions

| Status | Description | Visible to Candidates |
|--------|-------------|----------------------|
| `draft` | Work in progress, not yet published | No |
| `ontimer` | Scheduled for future publication | No |
| `published` | Active and accepting applications | Yes |
| `unpublished` | Temporarily paused | No |
| `closed` | Permanently closed, no longer accepting | No |

---

## BLS-07-01: listJobs

### Description
Display paginated list of company's job postings with status filters, search, and sorting. Supports bulk operations.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R05_jobs-list_RIS.md | Full | Job list page spec |
| features_jobs.md | JOB-009 | View Jobs by Company |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | Company role | `navBarAtom === 'company'` | Redirect to home |
| 3 | Company member | User belongs to company | Access denied |
| 4 | Company not pending | Company status !== 'pending' | Redirect to pending |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| companyId | string | Yes | Valid company ID | - | URL param |
| status | string | No | Valid filter | 'all' | Query param |
| q | string | No | - | '' | Query param |
| page | number | No | >= 1 | 1 | Query param |
| sort | string | No | Valid sort | 'created_desc' | Query param |

### State Changes

**SWR Cache:**
| Key Pattern | Data Shape | Config |
|-------------|------------|--------|
| `company-jobs-${companyId}` | `JobListItem[]` | `refreshInterval: 60000` |
| `company-job-counts-${companyId}` | `StatusCounts` | `refreshInterval: 60000` |

### Server Action
```typescript
// Server Action: fetchCompanyJobs
async function fetchCompanyJobs(
  companyId: string,
  options: {
    status?: string;
    query?: string;
    page?: number;
    sort?: string;
  }
): Promise<{ jobs: JobListItem[]; total: number }>;

// Server Action: fetchJobStatusCounts
async function fetchJobStatusCounts(companyId: string): Promise<StatusCounts>;
```

### Data Shape
```typescript
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

interface StatusCounts {
  total: number;
  active: number;    // published + ontimer
  draft: number;
  paused: number;    // unpublished
  closed: number;
}
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Loading | Skeleton table | 5 placeholder rows |
| Empty (no jobs) | Empty state | "ยังไม่มีประกาศงาน" + CTA |
| Empty (filter) | Empty state | "ไม่มีงานในสถานะนี้" |
| Error | Toast + retry | "ไม่สามารถโหลดรายการงานได้" |

---

## BLS-07-02: createJob

### Description
Create new job posting via multi-step wizard. Supports auto-save, duplicate from existing, and scheduled publishing.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R06_jobs-new_RIS.md | Full | Job creation wizard |
| features_jobs.md | JOB-004 | Create Job feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | Company role | `navBarAtom === 'company'` | Redirect |
| 3 | Company approved | Company status === 'approved' | Redirect to pending |

### Wizard Steps
| Step | Name | Required Fields |
|------|------|-----------------|
| 1 | Basic Info | title, jobType, jobLevel, numberOfPosition |
| 2 | Job Details | jobDescriptionDetails, skills (≥1) |
| 3 | Work Location | workModel, province (if onsite/hybrid) |
| 4 | Review & Publish | - (validation only) |

### Inputs (Step 1 - Basic)
| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| title | string | Yes | 5-100 chars | '' |
| jobFunction | string | No | Valid enum | null |
| jobType | string | Yes | Valid enum | null |
| jobLevel | string | Yes | Valid enum | null |
| department | string | No | - | '' |
| minSalary | number | No | >= 0 | null |
| maxSalary | number | No | >= minSalary | null |
| hideSalary | boolean | No | - | false |
| numberOfPosition | number | Yes | >= 1 | 1 |

### Inputs (Step 2 - Details)
| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| jobDescriptionDetails | string | Yes | >= 50 chars | '' |
| jobResponsibilities | string | No | - | '' |
| jobRequirements | string | No | - | '' |
| skills | string[] | Yes | >= 1 item | [] |
| benefits | string | No | - | '' |

### Inputs (Step 3 - Location)
| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| workModel | string | Yes | 'onsite' \| 'hybrid' \| 'remote' | null |
| province | string | Conditional | If onsite/hybrid | null |
| district | string | No | - | null |
| btsStationId | number | No | - | null |
| remotePercentage | number | No | 0-100 | null |
| fullAddress | string | No | - | '' |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Create | `jobs` | Auto-generated | All fields + `jobStatus: 'draft'` | First save |
| Update | `jobs` | draftId | Changed fields | Subsequent saves |

### Server Actions
```typescript
// Create new draft
async function JobCreate(input: JobFormData): Promise<{ uid: string }>;

// Update existing draft
async function JobUpdate(jobId: string, input: Partial<JobFormData>): Promise<void>;
```

### Auto-Save Strategy
- Debounce: 1000ms after field blur
- First save creates draft, subsequent saves update
- URL updated with `?draftId=xxx` after first save
- Last saved timestamp shown in header

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Auto-saving | Indicator | "กำลังบันทึก..." |
| Saved | Indicator | "บันทึกร่างแล้ว" with timestamp |
| Validation error | Inline | Field-level error messages |
| Navigation blocked | Modal | Unsaved changes confirmation |

---

## BLS-07-03: saveDraft

### Description
Explicitly save job as draft without publishing. Can be triggered manually or via auto-save.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R06_jobs-new_RIS.md | Section 4.2 | Save draft action |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Has draft data | Form has content | No-op |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| jobId | string | No | Existing draft | null | URL or state |
| formData | JobFormData | Yes | Partial valid | - | Form state |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Create | `jobs` | Auto-generated | All + `jobStatus: 'draft'` | New draft |
| Update | `jobs` | jobId | Changed fields | Existing draft |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `company-jobs-${companyId}` | Mutate (add/update) |
| `company-job-counts-${companyId}` | Invalidate |

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Saving | Button loading | Spinner in button |
| Success | Toast | "บันทึกร่างสำเร็จ" |
| Error | Toast | "บันทึกร่างไม่สำเร็จ" |

---

## BLS-07-04: editJob

### Description
Edit existing job posting. Supports inline editing with change tracking. Closed jobs cannot be edited.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R07_jobs-detail_RIS.md | Section 3, 6 | Edit job feature |
| features_jobs.md | JOB-005 | Edit Job feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Job exists | Job document exists | 404 page |
| 3 | Company owns job | `job.companyId === user.companyId` | Access denied |
| 4 | Job not closed | `job.jobStatus !== 'closed'` | Show error, disable edit |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| jobId | string | Yes | Valid job ID | - | URL param |
| updates | Partial<JobFormData> | Yes | Valid changes | - | Form state |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `jobs` | jobId | Changed fields only | Not closed |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `job-${jobId}` | Optimistic update → confirm |
| `company-jobs-${companyId}` | Invalidate |

### Change Tracking
```typescript
interface ChangeTracker {
  originalValues: Record<string, any>;
  currentValues: Record<string, any>;
  changedFields: string[];
  hasChanges: boolean;
}
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Entering edit | Mode switch | Form fields become editable |
| Changes made | Sidebar | "X รายการที่เปลี่ยนแปลง" |
| Saving | Button loading | Spinner |
| Success | Toast | "บันทึกการเปลี่ยนแปลงสำเร็จ" |
| Discard | Modal | "ยกเลิกการเปลี่ยนแปลง?" |

---

## BLS-07-05: publishJob

### Description
Publish job immediately, making it visible to candidates. Sets expiry to 30 days from now.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R07_jobs-detail_RIS.md | Section 4.2 | Publish action |
| features_jobs.md | JOB-006 | Publish Job feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Job exists | Job document exists | 404 |
| 3 | Company owns job | Ownership check | Access denied |
| 4 | Job not closed | `jobStatus !== 'closed'` | Show error |
| 5 | Required fields valid | All step validations pass | Show validation errors |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| jobId | string | Yes | Valid job ID | - | Context |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `jobs` | jobId | `jobStatus: 'published'`, `postStartDate: now`, `postExpiryDate: now + 30d`, `isActive: true` | Always |

**MeiliSearch:**
| Operation | Index | Document ID | Condition |
|-----------|-------|-------------|-----------|
| Upsert | `jobs` | jobId | On publish |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `job-${jobId}` | Update status |
| `company-jobs-${companyId}` | Invalidate |
| `company-job-counts-${companyId}` | Invalidate |

### Server Action
```typescript
// Action: JobPostSet
async function JobPostSet(jobId: string, options?: {
  scheduleDate?: Date;
}): Promise<'success' | 'fail'>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Publishing | Button loading | Spinner |
| Success | Toast | "เผยแพร่งานสำเร็จ" |
| Error | Toast | "เผยแพร่งานไม่สำเร็จ" |

---

## BLS-07-06: scheduleJob

### Description
Schedule job for future publication. Job enters `ontimer` status and auto-publishes at scheduled time.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R06_jobs-new_RIS.md | Section 6 | Schedule publishing |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Job exists | Job document exists | 404 |
| 3 | Job not closed | `jobStatus !== 'closed'` | Show error |
| 4 | Schedule date valid | `scheduledDate > now` | "วันที่ต้องเป็นอนาคต" |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| jobId | string | Yes | Valid job ID | - | Context |
| scheduledDate | Date | Yes | Future date | - | Date picker |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `jobs` | jobId | `jobStatus: 'ontimer'`, `postStartDate: scheduledDate`, `postExpiryDate: scheduledDate + 30d` | Always |

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Scheduling | Button loading | Spinner |
| Success | Toast | "ตั้งเวลาเผยแพร่สำเร็จ" |
| Invalid date | Inline error | "วันที่ต้องเป็นอนาคต" |

---

## BLS-07-07: unpublishJob

### Description
Temporarily pause a published job. Job becomes invisible to candidates but can be republished.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R07_jobs-detail_RIS.md | Section 4.2 | Unpublish action |
| features_jobs.md | JOB-007 | Unpublish Job feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Job exists | Job document exists | 404 |
| 3 | Job is published | `jobStatus === 'published'` | Hide action |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| jobId | string | Yes | Valid job ID | - | Context |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `jobs` | jobId | `jobStatus: 'unpublished'` | Published jobs |

**MeiliSearch:**
| Operation | Index | Document ID | Condition |
|-----------|-------|-------------|-----------|
| Delete | `jobs` | jobId | On unpublish |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `job-${jobId}` | Update status |
| `company-jobs-${companyId}` | Invalidate |
| `company-job-counts-${companyId}` | Invalidate |

### Server Action
```typescript
// Action: JobUnpublish
async function JobUnpublish(jobId: string): Promise<'success' | 'fail'>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Unpublishing | Button loading | Spinner |
| Success | Toast | "หยุดเผยแพร่งานสำเร็จ" |

---

## BLS-07-08: closeJob

### Description
Permanently close job posting. Cannot be reopened. Applications are preserved but no new ones accepted.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R07_jobs-detail_RIS.md | Section 4.2 | Close action |
| features_jobs.md | JOB-008 | Close/Deactivate Job |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Job exists | Job document exists | 404 |
| 3 | Job not already closed | `jobStatus !== 'closed'` | Hide action |
| 4 | User confirms | Confirmation modal | Cancel action |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| jobId | string | Yes | Valid job ID | - | Context |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `jobs` | jobId | `jobStatus: 'closed'`, `isActive: false` | Always |

**MeiliSearch:**
| Operation | Index | Document ID | Condition |
|-----------|-------|-------------|-----------|
| Delete | `jobs` | jobId | On close |

### Server Action
```typescript
// Action: JobDeactivate
async function JobDeactivate(jobId: string): Promise<'success' | 'fail'>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Confirmation | Modal | "ปิดรับสมัครงาน? งานนี้จะถูกซ่อนจากผู้สมัครและไม่สามารถเปิดใหม่ได้" |
| Closing | Button loading | Spinner |
| Success | Toast | "ปิดรับสมัครสำเร็จ" |

---

## BLS-07-09: deleteJob

### Description
Permanently delete job posting. Only allowed for drafts with no applications.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R07_jobs-detail_RIS.md | Section 4.2 | Delete action |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Job exists | Job document exists | 404 |
| 3 | Job is draft | `jobStatus === 'draft'` | Hide action or show error |
| 4 | No applications | `applicationCount === 0` | "ไม่สามารถลบงานที่มีใบสมัครได้" |
| 5 | User confirms | Confirmation modal | Cancel action |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| jobId | string | Yes | Valid job ID | - | Context |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Delete | `jobs` | jobId | - | Draft with 0 applications |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `job-${jobId}` | Remove |
| `company-jobs-${companyId}` | Remove item |
| `company-job-counts-${companyId}` | Invalidate |

### Server Action
```typescript
// Action: JobDelete
async function JobDelete(jobId: string): Promise<'success' | 'fail'>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Confirmation | Modal | "ลบประกาศงาน? การดำเนินการนี้ไม่สามารถยกเลิกได้" |
| Has applications | Error toast | "ไม่สามารถลบงานที่มีใบสมัครได้ กรุณาปิดรับสมัครแทน" |
| Deleting | Button loading | Spinner |
| Success | Toast + redirect | "ลบงานสำเร็จ" → Navigate to list |

---

## BLS-07-10: duplicateJob

### Description
Create a copy of existing job as new draft. Copies all content but resets status and dates.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R05_jobs-list_RIS.md | Section 3 | Duplicate feature |
| COMP-R06_jobs-new_RIS.md | Query params | `duplicateFrom` |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Source job exists | Job document exists | 404 |
| 3 | Company owns job | Ownership check | Access denied |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| sourceJobId | string | Yes | Valid job ID | - | Context |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Create | `jobs` | Auto-generated | Copy all except: `uid`, `jobStatus: 'draft'`, `createdAt: now`, dates cleared | Always |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `company-jobs-${companyId}` | Add new item |
| `company-job-counts-${companyId}` | Invalidate |

### Copied Fields
| Copied | Not Copied |
|--------|------------|
| title, description, requirements | uid, createdAt, updatedAt |
| salary, skills, benefits | jobStatus (reset to draft) |
| location, workModel | postStartDate, postExpiryDate |
| jobType, jobLevel | applicationCount, viewCount |

### Server Action
```typescript
// Action: JobDuplicate
async function JobDuplicate(sourceJobId: string): Promise<{ newJobId: string }>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Duplicating | Button loading | Spinner |
| Success | Toast + redirect | "คัดลอกงานสำเร็จ" → Navigate to new draft |

---

## BLS-07-11: viewJobAnalytics

### Description
View job performance metrics including views, applications, and conversion rate over time.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R07_jobs-detail_RIS.md | Section 3, 4 | Analytics display |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Job exists | Job document exists | 404 |
| 3 | Company owns job | Ownership check | Access denied |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| jobId | string | Yes | Valid job ID | - | URL param |

### State Changes

**SWR Cache (Read-only):**
| Key Pattern | Data Shape | Config |
|-------------|------------|--------|
| `job-${jobId}` | `JobWithAnalytics` | Standard |
| `job-analytics-${jobId}` | `JobAnalytics` | `refreshInterval: 60000` |
| `job-applications-${jobId}` | `ApplicationPreview[]` | Standard |

### Server Actions
```typescript
// Server Action: fetchJobDetail
async function fetchJobDetail(jobId: string): Promise<JobWithAnalytics>;

// Server Action: fetchJobAnalytics
async function fetchJobAnalytics(jobId: string): Promise<JobAnalytics>;

// Server Action: fetchJobApplications
async function fetchJobApplications(
  jobId: string,
  options?: { limit?: number }
): Promise<ApplicationPreview[]>;
```

### Analytics Data Shape
```typescript
interface JobAnalytics {
  totalViews: number;
  viewsChange: number;        // % vs previous 30 days
  dailyViews: DailyView[];    // Last 30 days
  conversionRate: number;     // (applications / views) * 100
  conversionChange: number;   // % vs previous period
}

interface DailyView {
  date: string;   // YYYY-MM-DD
  views: number;
}
```

### UI Components
| Component | Data | Display |
|-----------|------|---------|
| Stats Cards | Views, Applications, Conversion, Days Left | 4 metric cards |
| Views Chart | dailyViews | 30-day line chart |
| Recent Applications | Last 5 applications | List with avatars |

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Loading | Skeleton | Chart and cards placeholder |
| Error | Error state | Retry button |
| No data | Empty chart | "ยังไม่มีข้อมูล" |

---

## Status Action Matrix

| Status | Edit | Publish | Schedule | Unpublish | Close | Delete | Duplicate |
|--------|------|---------|----------|-----------|-------|--------|-----------|
| `draft` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓* | ✓ |
| `ontimer` | ✓ | ✓ (now) | ✗ | ✓ | ✓ | ✗ | ✓ |
| `published` | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| `unpublished` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ |
| `closed` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

*Delete only if `applicationCount === 0`

---

## Bulk Operations

### Bulk Unpublish (Pause)
| Field | Value |
|-------|-------|
| Selection | Multiple published jobs |
| Action | Set all to `unpublished` |
| Confirmation | "หยุดทั้งหมด X งาน?" |

### Bulk Close
| Field | Value |
|-------|-------|
| Selection | Multiple active jobs |
| Action | Set all to `closed` |
| Confirmation | "ปิดทั้งหมด X งาน?" |

---

## Stage Integration Points

### Exit Points (to other stages)
| Exit Action | Target Stage | Target Action | Trigger |
|-------------|--------------|---------------|---------|
| publishJob | BLS-02 Discovery | searchJobs | Job indexed in MeiliSearch |
| viewJobAnalytics → Recent Apps | BLS-04 Screening | listApplications | Click "View All" |

### Cross-Stage Dependencies
| This Stage Action | Affects Stage | Cache Key | Effect |
|-------------------|---------------|-----------|--------|
| publishJob | BLS-02 | MeiliSearch index | Job searchable |
| unpublishJob | BLS-02 | MeiliSearch index | Job removed |
| closeJob | BLS-03 | `jobs-${jobId}` | Cannot apply |

---

## Permissions Matrix

| Action | Company HR | Company Admin | Candidate | Platform Admin |
|--------|------------|---------------|-----------|----------------|
| listJobs | ✓ | ✓ | ✗ | ✓ (via admin) |
| createJob | ✓ | ✓ | ✗ | ✗ |
| editJob | ✓ | ✓ | ✗ | ✗ |
| publishJob | ✓ | ✓ | ✗ | ✗ |
| unpublishJob | ✓ | ✓ | ✗ | ✗ |
| closeJob | ✓ | ✓ | ✗ | ✗ |
| deleteJob | ✓ | ✓ | ✗ | ✗ |
| duplicateJob | ✓ | ✓ | ✗ | ✗ |
| viewJobAnalytics | ✓ | ✓ | ✗ | ✓ |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| COMP-R05_jobs-list_RIS.md | Job list page specification |
| COMP-R06_jobs-new_RIS.md | Job creation wizard specification |
| COMP-R07_jobs-detail_RIS.md | Job detail/edit page specification |
| features_jobs.md | Feature definitions JOB-004 to JOB-009 |
| data-entities_jobs.md | Job entity schema |
| BLS-02_discovery.md | Published jobs visible to candidates |
| BLS-03_application.md | Candidates apply to jobs |

---

*End of BLS-07 Job Management Stage*
